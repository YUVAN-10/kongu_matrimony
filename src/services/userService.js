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
  deleteDoc,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import { formatDate, endOfDay } from '@/utils/helpers'
import { logActivity } from '@/services/activityLogService'

const USERS_COLLECTION = 'users'
const PHONE_INDEX_COLLECTION = 'phoneIndex'

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
 * Digits-only comparison/storage form of a phone number — "9876543210",
 * "98765 43210", and "+91-9876543210" must all be treated as the same
 * number for duplicate detection, which a plain string match can't do.
 * Applied both when storing a phone (createUserDocument/updateUser) and
 * when checking for a duplicate, so new records stay comparable going
 * forward — this doesn't retroactively reformat already-stored numbers.
 */
function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '')
}

/**
 * Atomic uniqueness lock for phone numbers, backing `phoneIndex/{normalized
 * phone}`. `searchUsersByPhone` alone has a check-then-create race: two
 * simultaneous Add User submissions for the same phone (different emails)
 * could both pass that check and both succeed. This transaction closes that
 * gap — the loser's transaction sees the reservation `tx.get` already
 * resolved to an existing doc owned by someone else and throws, instead of
 * racing to a duplicate `users` document.
 *
 * `userId` may be null when reserving before the Firebase Auth account (and
 * therefore its uid) exists yet — see createLinkedUser, which reserves
 * immediately after the Auth account is created but before the Firestore
 * user document is written, so no `users` doc can ever be created with a
 * phone that's already spoken for.
 */
export async function reservePhoneNumber(phone, userId = null) {
  const normalized = normalizePhone(phone)
  if (!normalized) throw new Error('A valid phone number is required.')

  const phoneRef = doc(db, PHONE_INDEX_COLLECTION, normalized)
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(phoneRef)
    if (snap.exists() && snap.data().userId !== userId) {
      throw new Error('A user with this phone number already exists.')
    }
    tx.set(phoneRef, { userId, reservedAt: serverTimestamp() })
  })
  return normalized
}

/** Frees a phone number reservation — used on rollback (a later step in
 * account creation failed) and when a user's phone changes (the old number
 * becomes available again). Best-effort: a failure here shouldn't block the
 * business operation that triggered it. */
export async function releasePhoneReservation(phone) {
  const normalized = normalizePhone(phone)
  if (!normalized) return
  try {
    await deleteDoc(doc(db, PHONE_INDEX_COLLECTION, normalized))
  } catch (error) {
    console.error('[userService] Failed to release phone reservation (non-blocking):', error)
  }
}

/**
 * Check if a user with the given phone number already exists
 * Used for duplicate checking during user creation
 */
export async function searchUsersByPhone(phone) {
  const normalized = normalizePhone(phone)
  if (!normalized) return []

  const phoneQuery = query(
    collection(db, USERS_COLLECTION),
    where('phone', '==', normalized),
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

const NAME_DUPLICATE_CHECK_CAP = 1000

/**
 * Warning-only check (not a hard block, per spec) for an existing user with
 * the same name, trim + case-insensitive. Firestore has no native
 * case-insensitive query, and adding a normalized-name mirror field would be
 * a schema change — so this does a capped fetch and compares client-side,
 * same cap pattern already used by the search fallbacks in this file.
 */
export async function searchUsersByName(name) {
  const normalized = name?.trim().toLowerCase()
  if (!normalized) return []

  const usersQuery = query(
    collection(db, USERS_COLLECTION),
    where('status', 'in', ['active', 'blocked']),
    limit(NAME_DUPLICATE_CHECK_CAP)
  )
  const snapshot = await getDocs(usersQuery)
  return snapshot.docs
    .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
    .filter((user) => user.name?.trim().toLowerCase() === normalized)
}

/**
 * Writes the Firestore users/{uid} document for a brand-new account created
 * from the Add Profile page. The Firebase Auth user itself is created
 * separately via authService.createUserAccount (which returns this uid).
 *
 * Reserves the phone number transactionally BEFORE writing the user
 * document — if two admins raced on the same phone, the loser fails here
 * with no `users` doc ever written, instead of both succeeding (the gap
 * `searchUsersByPhone`'s check-then-create alone can't close).
 */
export async function createUserDocument(uid, { name, email, phone, gender, city, admin }) {
  const adminLabel = admin?.name || admin?.email || 'Admin'
  await reservePhoneNumber(phone, uid)

  await setDoc(doc(db, USERS_COLLECTION, uid), {
    name,
    email,
    phone: normalizePhone(phone),
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

/**
 * Keeps the phoneIndex reservation in sync when a phone number actually
 * changes: reserve the new number first (so a conflict fails before
 * anything else changes), update the user, then release the old number —
 * that order never leaves a window where the account holds zero reservation.
 */
export async function updateUser(userId, data, { admin } = {}) {
  const current = await getUserById(userId)
  const newPhone = normalizePhone(data.phone)
  const phoneChanged = current && current.phone !== newPhone

  if (phoneChanged) {
    await reservePhoneNumber(newPhone, userId)
  }

  const payload = {
    name: data.name,
    email: data.email,
    phone: newPhone,
    gender: data.gender,
    city: data.city || null,
    updatedAt: serverTimestamp(),
  }

  await updateDoc(doc(db, USERS_COLLECTION, userId), payload)

  if (phoneChanged && current.phone) {
    await releasePhoneReservation(current.phone)
  }

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