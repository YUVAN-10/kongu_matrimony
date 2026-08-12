import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  getDoc,
  getDocs,
  getCountFromServer,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import { formatDate, endOfDay } from '@/utils/helpers'
import { logActivity } from '@/services/activityLogService'

const USERS_COLLECTION = 'users'

/**
 * Firestore `where` constraints shared by every query variant below —
 * gender/subscription/city/status equality filters plus an optional
 * registration-date range. `status` defaults to excluding soft-deleted
 * users (`in ['active','blocked']`) unless a specific status is requested.
 */
function buildFilterConstraints(filters = {}) {
  const constraints = []

  if (filters.status) {
    constraints.push(where('status', '==', filters.status))
  } else {
    constraints.push(where('status', 'in', ['active', 'blocked']))
  }

  if (filters.gender) constraints.push(where('gender', '==', filters.gender))
  if (filters.subscription) {
    constraints.push(where('isPremium', '==', filters.subscription === 'premium'))
  }
  if (filters.city?.trim()) constraints.push(where('city', '==', filters.city.trim()))
  if (filters.dateFrom) {
    constraints.push(where('createdAt', '>=', Timestamp.fromDate(new Date(filters.dateFrom))))
  }
  if (filters.dateTo) {
    constraints.push(where('createdAt', '<=', Timestamp.fromDate(endOfDay(new Date(filters.dateTo)))))
  }

  return constraints
}

/**
 * Firestore requires the first `orderBy` to match any active range/inequality
 * filter (our date-range filter uses >=/<= on createdAt) — so a date range
 * forces sorting by createdAt regardless of the requested sortBy.
 */
function buildSortConstraint(filters, sortBy) {
  if (filters.dateFrom || filters.dateTo) {
    return orderBy('createdAt', sortBy === 'oldest' ? 'asc' : 'desc')
  }

  switch (sortBy) {
    case 'oldest':
      return orderBy('createdAt', 'asc')
    case 'name_asc':
      return orderBy('name', 'asc')
    case 'name_desc':
      return orderBy('name', 'desc')
    case 'newest':
    default:
      return orderBy('createdAt', 'desc')
  }
}

function mapSnapshot(snapshot) {
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
}

/**
 * Real-time, server-side paginated query — filters + sort + limit + an
 * optional `startAfter` cursor, subscribed via onSnapshot so the current
 * page stays live. Calls `onData(users, lastVisibleDocSnapshot)`; the raw
 * snapshot doc is handed back (not just its data) so the caller can use it
 * as the cursor for the next page.
 */
export function subscribeToUsersPage({ filters, sortBy, pageSize, cursor }, onData, onError) {
  const constraints = [
    ...buildFilterConstraints(filters),
    buildSortConstraint(filters, sortBy),
    limit(pageSize),
  ]
  if (cursor) constraints.push(startAfter(cursor))

  const usersQuery = query(collection(db, USERS_COLLECTION), ...constraints)

  return onSnapshot(
    usersQuery,
    (snapshot) => {
      const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null
      onData(mapSnapshot(snapshot), lastVisible)
    },
    onError
  )
}

/**
 * Real-time but unpaginated (capped) query used only while a search term is
 * active. Firestore has no native multi-field substring search, so matching
 * on name/phone/email/id happens client-side over this capped, filtered
 * result set — see useUsers.js for the matching + client-side pagination.
 */
const SEARCH_FETCH_CAP = 1000

export function subscribeToUsersForSearch({ filters }, onData, onError) {
  const constraints = [
    ...buildFilterConstraints(filters),
    orderBy('createdAt', 'desc'),
    limit(SEARCH_FETCH_CAP),
  ]

  const usersQuery = query(collection(db, USERS_COLLECTION), ...constraints)

  return onSnapshot(usersQuery, (snapshot) => onData(mapSnapshot(snapshot)), onError)
}

/** One-time aggregate count for the current filters (not paginated, not realtime). */
export async function getUsersCount(filters) {
  const usersQuery = query(collection(db, USERS_COLLECTION), ...buildFilterConstraints(filters))
  const snapshot = await getCountFromServer(usersQuery)
  return snapshot.data().count
}

export async function getUserById(userId) {
  const snap = await getDoc(doc(db, USERS_COLLECTION, userId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

/**
 * One-time (non-realtime) capped search across name/phone/email, used by the
 * Add Profile "Select Existing User" picker — a lookup, not a live list, so
 * a single getDocs() is more appropriate here than a lingering onSnapshot.
 */
const USER_PICKER_SEARCH_CAP = 50

export async function searchUsersOnce(term) {
  const trimmed = term.trim()
  if (!trimmed) return []

  const usersQuery = query(
    collection(db, USERS_COLLECTION),
    where('status', 'in', ['active', 'blocked']),
    orderBy('name'),
    where('name', '>=', trimmed),
    where('name', '<=', trimmed + '\uf8ff'),
    limit(USER_PICKER_SEARCH_CAP)
  )
  const snapshot = await getDocs(usersQuery)
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
}

/**
 * Check if a user with the given phone number already exists
 * Used for duplicate checking during user creation
 */
export async function searchUsersByPhone(phone) {
  if (!phone?.trim()) return []
  
  const phoneQuery = query(
    collection(db, USERS_COLLECTION),
    where('phone', '==', phone.trim()),
    where('status', 'in', ['active', 'blocked']),
    limit(1)
  )
  const snapshot = await getDocs(phoneQuery)
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
}

/**
 * Check if a user with the given email already exists
 * Used for duplicate checking during user creation
 */
export async function searchUsersByEmail(email) {
  if (!email?.trim()) return []
  
  const emailQuery = query(
    collection(db, USERS_COLLECTION),
    where('email', '==', email.trim().toLowerCase()),
    where('status', 'in', ['active', 'blocked']),
    limit(1)
  )
  const snapshot = await getDocs(emailQuery)
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
}

/**
 * Writes the Firestore users/{uid} document for a brand-new account created
 * from the Add Profile page. The Firebase Auth user itself is created
 * separately via authService.createUserAccount (which returns this uid).
 */
export async function createUserDocument(uid, { name, email, phone, gender, city, admin }) {
  const adminLabel = admin?.name || admin?.email || 'Admin'
  await setDoc(doc(db, USERS_COLLECTION, uid), {
    name,
    email,
    phone,
    gender,
    ...(city?.trim() && { city: city.trim() }),
    status: 'active',
    isPremium: false,
    createdBy: adminLabel,
    createdAt: serverTimestamp(),
  })

  logActivity({
    action: 'create',
    module: 'Users',
    targetType: 'user',
    targetId: uid,
    description: `Created user "${name}"`,
    newData: { name, email, phone, gender, city },
    admin,
  })
}

export async function updateUser(userId, data, { admin } = {}) {
  const payload = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    gender: data.gender,
    city: data.city || null,
    updatedAt: serverTimestamp(),
  }

  await updateDoc(doc(db, USERS_COLLECTION, userId), payload)

  logActivity({
    action: 'update',
    module: 'Users',
    targetType: 'user',
    targetId: userId,
    description: `Updated user "${data.name || userId}"`,
    newData: payload,
    admin,
  })
}

export async function blockUser(userId, { reason, admin }) {
  await updateDoc(doc(db, USERS_COLLECTION, userId), {
    isBlocked: true,
    status: 'blocked',
    blockReason: reason,
    blockedAt: serverTimestamp(),
    blockedBy: admin?.name || admin?.email || 'Admin',
  })

  logActivity({
    action: 'block',
    module: 'Users',
    targetType: 'user',
    targetId: userId,
    description: `Blocked user${reason ? ` — reason: ${reason}` : ''}`,
    newData: { status: 'blocked', reason },
    admin,
  })
}

export async function unblockUser(userId, { admin }) {
  await updateDoc(doc(db, USERS_COLLECTION, userId), {
    isBlocked: false,
    status: 'active',
    blockReason: null,
    unblockedAt: serverTimestamp(),
    unblockedBy: admin?.name || admin?.email || 'Admin',
  })

  logActivity({
    action: 'unblock',
    module: 'Users',
    targetType: 'user',
    targetId: userId,
    description: 'Unblocked user',
    newData: { status: 'active' },
    admin,
  })
}

/**
 * Soft delete only — the document is kept and marked deleted, never removed.
 * See the module explanation for why (audit trail, reversibility, referential
 * integrity with profiles/payments/subscriptions that reference this user).
 */
export async function softDeleteUser(userId, { admin }) {
  await updateDoc(doc(db, USERS_COLLECTION, userId), {
    status: 'deleted',
    deletedAt: serverTimestamp(),
    deletedBy: admin?.name || admin?.email || 'Admin',
  })

  logActivity({
    action: 'delete',
    module: 'Users',
    targetType: 'user',
    targetId: userId,
    description: 'Deleted user (soft delete)',
    newData: { status: 'deleted' },
    admin,
  })
}

const EXPORT_COLUMNS = [
  { key: 'id', label: 'User ID' },
  { key: 'name', label: 'Name' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'gender', label: 'Gender' },
  { key: 'city', label: 'City' },
  { key: 'subscription', label: 'Subscription' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Created Date' },
]

function toExportRows(users) {
  return users.map((user) => ({
    id: user.id,
    name: user.name || '',
    phone: user.phone || '',
    email: user.email || '',
    gender: user.gender || '',
    city: user.city || '',
    subscription: user.isPremium ? 'Premium' : 'Free',
    status: user.status || '',
    createdAt: formatDate(user.createdAt),
  }))
}

function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function escapeCsvCell(value) {
  return `"${String(value).replace(/"/g, '""')}"`
}

export function exportUsersToCsv(users) {
  const rows = toExportRows(users)
  const header = EXPORT_COLUMNS.map((col) => escapeCsvCell(col.label)).join(',')
  const body = rows
    .map((row) => EXPORT_COLUMNS.map((col) => escapeCsvCell(row[col.key])).join(','))
    .join('\n')
  downloadBlob(`${header}\n${body}`, 'users.csv', 'text/csv;charset=utf-8;')
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * "Export to Excel" without a spreadsheet library: an HTML table served
 * with a .xls extension, which Excel opens natively. Deliberately avoids
 * the npm `xlsx` (SheetJS) package — it ships high-severity, unpatched
 * prototype-pollution/ReDoS CVEs — for a feature this simple, a dependency
 * with known unfixed vulnerabilities isn't worth it.
 */
export function exportUsersToExcel(users) {
  const rows = toExportRows(users)
  const headerRow = `<tr>${EXPORT_COLUMNS.map((col) => `<th>${escapeHtml(col.label)}</th>`).join('')}</tr>`
  const bodyRows = rows
    .map(
      (row) =>
        `<tr>${EXPORT_COLUMNS.map((col) => `<td>${escapeHtml(row[col.key])}</td>`).join('')}</tr>`
    )
    .join('')

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8" /></head>
<body><table>${headerRow}${bodyRows}</table></body>
</html>`

  downloadBlob(html, 'users.xls', 'application/vnd.ms-excel')
}