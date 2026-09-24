import api from '@/lib/api'
import { createUserAccount } from '@/services/authService'
import { createUser, createUserDocument } from '@/services/userService'
import { removeUndefined } from '@/utils/removeUndefined'
import { logActivity } from '@/services/activityLogService'

export function generateProfileId() {
  return `prof_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
}

function normalizeSearch(str) {
  return String(str || '').replace(/\s+/g, ' ').trim().toLowerCase()
}

export function subscribeToProfilesPage({ filters, sortBy, pageSize, cursor, page = 1 }, onData, onError) {
  let isCancelled = false

  async function fetchProfiles() {
    try {
      const response = await api.get('/profiles', {
        ...filters,
        sortBy,
        pageSize,
        page,
        cursor,
      })

      const profiles = Array.isArray(response)
        ? response
        : (response?.profiles || response?.data || response?.items || [])
      const lastVisible = response?.lastVisible || (profiles.length > 0 ? profiles[profiles.length - 1]?.id : null)

      if (!isCancelled) {
        onData(profiles, lastVisible)
      }
    } catch (err) {
      if (!isCancelled && onError) onError(err)
    }
  }

  fetchProfiles()

  return () => {
    isCancelled = true
  }
}

export function subscribeToProfilesForSearch({ filters }, onData, onError) {
  let isCancelled = false

  async function fetchAll() {
    try {
      const response = await api.get('/profiles', {
        ...filters,
        limit: 1000,
        pageSize: 1000,
      })
      const profiles = Array.isArray(response)
        ? response
        : (response?.profiles || response?.data || response?.items || [])
      if (!isCancelled) onData(profiles)
    } catch (err) {
      if (!isCancelled && onError) onError(err)
    }
  }

  fetchAll()

  return () => {
    isCancelled = true
  }
}

export async function getProfilesCount(filters) {
  try {
    const response = await api.get('/profiles/count', filters)
    if (typeof response?.count === 'number') return response.count
    if (typeof response === 'number') return response
  } catch {
    const res = await api.get('/profiles', { ...filters, limit: 1 })
    return res?.total || res?.totalCount || (Array.isArray(res) ? res.length : 0)
  }
  return 0
}

export async function getProfileById(profileId) {
  try {
    const response = await api.get(`/admin/users/${profileId}`)
    return response?.profile || response?.user || response?.data || response
  } catch {
    const res = await api.get('/admin/users', { search: profileId, limit: 1 })
    const list = Array.isArray(res) ? res : (res?.users || res?.profiles || res?.data || [])
    return list[0]?.profile || list[0] || null
  }
}

export async function getProfileByUserId(userId) {
  if (!userId) return null
  try {
    const response = await api.get(`/admin/users/${userId}`)
    return response?.profile || response?.user || response?.data || response
  } catch {
    const res = await api.get('/admin/users', { search: userId, limit: 1 })
    const list = Array.isArray(res) ? res : (res?.users || res?.profiles || res?.data || [])
    return list[0]?.profile || list[0] || null
  }
}

export async function searchProfilesOnce(term) {
  const trimmed = normalizeSearch(term)
  if (!trimmed) return []

  try {
    const response = await api.get('/profiles/search', { term: trimmed, limit: 50 })
    return Array.isArray(response) ? response : (response?.profiles || response?.data || [])
  } catch {
    const res = await api.get('/profiles', { limit: 100 })
    const profiles = Array.isArray(res) ? res : (res?.profiles || res?.data || [])
    const searchWords = trimmed.split(' ')
    return profiles.filter((profile) => {
      const haystack = [
        profile.personal?.fullName,
        profile.personal?.mobileNumber,
        profile.personal?.email,
        profile.id,
      ]
        .map((field) => normalizeSearch(field))
        .join(' ')
      return searchWords.every((word) => haystack.includes(word))
    })
  }
}

function toArray(val) {
  if (Array.isArray(val)) return val
  if (typeof val === 'string' && val.trim()) {
    return val.split(',').map((s) => s.trim()).filter(Boolean)
  }
  return []
}

function toChartObject(chart) {
  if (chart && typeof chart === 'object' && !Array.isArray(chart)) {
    return chart
  }
  return {}
}

export function normalizePublishPayload(formData = {}) {
  const personal = typeof formData.personal === 'object' && formData.personal !== null ? formData.personal : {}
  const physical = typeof formData.physical === 'object' && formData.physical !== null ? formData.physical : {}
  const astrology = typeof formData.astrology === 'object' && formData.astrology !== null ? formData.astrology : {}
  const education = typeof formData.education === 'object' && formData.education !== null ? formData.education : {}
  const occupation = typeof formData.occupation === 'object' && formData.occupation !== null ? formData.occupation : {}
  const family = typeof formData.family === 'object' && formData.family !== null ? formData.family : {}
  const address = typeof formData.address === 'object' && formData.address !== null ? formData.address : {}
  const communication = typeof formData.communication === 'object' && formData.communication !== null ? formData.communication : {}
  const lifestyle = typeof formData.lifestyle === 'object' && formData.lifestyle !== null ? formData.lifestyle : {}
  const partnerPreference = typeof formData.partnerPreference === 'object' && formData.partnerPreference !== null ? formData.partnerPreference : {}
  const about = typeof formData.about === 'object' && formData.about !== null ? formData.about : (typeof formData.aboutMe === 'object' && formData.aboutMe !== null ? formData.aboutMe : {})
  const photos = typeof formData.photos === 'object' && formData.photos !== null ? formData.photos : {}

  const mainPhotoUrl =
    typeof photos.profileImageUrl === 'string' && photos.profileImageUrl
      ? photos.profileImageUrl
      : (typeof photos.main === 'string'
          ? photos.main
          : photos.main?.url || photos.main?.fileUrl || photos.profileImageUrl || formData.profileImageUrl || formData.photoURL || undefined)

  const galleryList = Array.isArray(photos.gallery)
    ? photos.gallery.map((item) => (typeof item === 'string' ? item : item?.url || item?.fileUrl)).filter(Boolean)
    : Array.isArray(formData.gallery)
      ? formData.gallery.map((item) => (typeof item === 'string' ? item : item?.url || item?.fileUrl)).filter(Boolean)
      : []

  // Transform age range: "23-34"
  const ageFrom = partnerPreference.ageFrom || formData.prefAgeFrom || ''
  const ageTo = partnerPreference.ageTo || formData.prefAgeTo || ''
  let prefAgeRange = ''
  if (ageFrom && ageTo) {
    prefAgeRange = `${ageFrom}-${ageTo}`
  } else if (ageFrom) {
    prefAgeRange = `${ageFrom}+`
  } else if (ageTo) {
    prefAgeRange = `up to ${ageTo}`
  } else if (partnerPreference.prefAgeRange || formData.prefAgeRange) {
    prefAgeRange = partnerPreference.prefAgeRange || formData.prefAgeRange
  }

  // Transform height range: "160-170"
  const heightFrom = partnerPreference.heightFrom || formData.prefHeightFrom || ''
  const heightTo = partnerPreference.heightTo || formData.prefHeightTo || ''
  let prefHeightRange = ''
  if (heightFrom && heightTo) {
    prefHeightRange = `${heightFrom}-${heightTo}`
  } else if (heightFrom) {
    prefHeightRange = `${heightFrom}+`
  } else if (heightTo) {
    prefHeightRange = `up to ${heightTo}`
  } else if (partnerPreference.prefHeightRange || formData.prefHeightRange) {
    prefHeightRange = partnerPreference.prefHeightRange || formData.prefHeightRange
  }

  const payload = {
    // Exact match fields
    name: personal.fullName || formData.fullName || formData.name || '',
    fullName: personal.fullName || formData.fullName || formData.name || '',
    gender: (personal.gender || formData.gender || '').toUpperCase() || undefined,
    dateOfBirth: personal.dateOfBirth || personal.dob || formData.dateOfBirth || formData.dob || '',
    dob: personal.dob || personal.dateOfBirth || formData.dob || formData.dateOfBirth || '',
    mobile: personal.mobile || personal.mobileNumber || personal.phone || formData.mobile || formData.phone || '',
    phone: personal.mobile || personal.mobileNumber || personal.phone || formData.mobile || formData.phone || '',
    email: personal.email || formData.email || '',
    profileImageUrl: mainPhotoUrl || '',
    maritalStatus: personal.maritalStatus || formData.maritalStatus || '',
    motherTongue: personal.motherTongue || formData.motherTongue || '',
    religion: personal.religion || formData.religion || '',
    caste: personal.caste || formData.caste || '',

    star: astrology.star || formData.star || '',
    rasi: astrology.rasi || astrology.raasi || formData.rasi || formData.raasi || '',
    timeOfBirth: astrology.timeOfBirth || astrology.birthTime || formData.timeOfBirth || formData.birthTime || '',
    placeOfBirth: astrology.placeOfBirth || astrology.birthPlace || formData.placeOfBirth || formData.birthPlace || '',

    fatherName: family.fatherName || formData.fatherName || '',
    fatherOccupation: family.fatherOccupation || formData.fatherOccupation || '',
    motherName: family.motherName || formData.motherName || '',
    motherOccupation: family.motherOccupation || formData.motherOccupation || '',
    brothersCount: family.brothersCount != null && family.brothersCount !== '' ? String(family.brothersCount) : (family.brothers != null && family.brothers !== '' ? String(family.brothers) : (formData.brothersCount != null && formData.brothersCount !== '' ? String(formData.brothersCount) : '')),
    brothersMarriedCount: family.brothersMarriedCount != null && family.brothersMarriedCount !== '' ? String(family.brothersMarriedCount) : (family.marriedBrothers != null && family.marriedBrothers !== '' ? String(family.marriedBrothers) : (formData.brothersMarriedCount != null && formData.brothersMarriedCount !== '' ? String(formData.brothersMarriedCount) : (formData.marriedBrothers != null && formData.marriedBrothers !== '' ? String(formData.marriedBrothers) : ''))),
    sistersCount: family.sistersCount != null && family.sistersCount !== '' ? String(family.sistersCount) : (family.sisters != null && family.sisters !== '' ? String(family.sisters) : (formData.sistersCount != null && formData.sistersCount !== '' ? String(formData.sistersCount) : '')),
    sistersMarriedCount: family.sistersMarriedCount != null && family.sistersMarriedCount !== '' ? String(family.sistersMarriedCount) : (family.marriedSisters != null && family.marriedSisters !== '' ? String(family.marriedSisters) : (formData.sistersMarriedCount != null && formData.sistersMarriedCount !== '' ? String(formData.sistersMarriedCount) : (formData.marriedSisters != null && formData.marriedSisters !== '' ? String(formData.marriedSisters) : ''))),
    marriedBrothers: family.marriedBrothers != null && family.marriedBrothers !== '' ? String(family.marriedBrothers) : (family.brothersMarriedCount != null && family.brothersMarriedCount !== '' ? String(family.brothersMarriedCount) : (formData.marriedBrothers != null && formData.marriedBrothers !== '' ? String(formData.marriedBrothers) : (formData.brothersMarriedCount != null && formData.brothersMarriedCount !== '' ? String(formData.brothersMarriedCount) : ''))),
    marriedSisters: family.marriedSisters != null && family.marriedSisters !== '' ? String(family.marriedSisters) : (family.sistersMarriedCount != null && family.sistersMarriedCount !== '' ? String(family.sistersMarriedCount) : (formData.marriedSisters != null && formData.marriedSisters !== '' ? String(formData.marriedSisters) : (formData.sistersMarriedCount != null && formData.sistersMarriedCount !== '' ? String(formData.sistersMarriedCount) : ''))),
    familyStatus: family.familyStatus || formData.familyStatus || '',
    familyType: family.familyType || formData.familyType || '',
    familyValues: family.familyValues || formData.familyValues || '',
    familyMonthlyIncome: family.familyMonthlyIncome != null && family.familyMonthlyIncome !== '' ? String(family.familyMonthlyIncome) : (family.familyIncome != null && family.familyIncome !== '' ? String(family.familyIncome) : (formData.familyMonthlyIncome != null && formData.familyMonthlyIncome !== '' ? String(formData.familyMonthlyIncome) : (formData.familyIncome != null && formData.familyIncome !== '' ? String(formData.familyIncome) : ''))),
    familyIncome: family.familyMonthlyIncome != null && family.familyMonthlyIncome !== '' ? String(family.familyMonthlyIncome) : (family.familyIncome != null && family.familyIncome !== '' ? String(family.familyIncome) : (formData.familyMonthlyIncome != null && formData.familyMonthlyIncome !== '' ? String(formData.familyMonthlyIncome) : '')),
    familyAnnualIncome: family.familyAnnualIncome ? String(family.familyAnnualIncome) : (family.familyMonthlyIncome ? String(Number(family.familyMonthlyIncome) * 12) : (formData.familyAnnualIncome ? String(formData.familyAnnualIncome) : '')),

    education: education.education || education.highestQualification || education.qualification || (typeof education === 'string' ? education : '') || education.educationLevel || formData.education || formData.highestQualification || formData.qualification || '',
    highestQualification: education.education || education.highestQualification || education.qualification || formData.highestQualification || formData.qualification || formData.education || '',
    qualification: education.education || education.highestQualification || education.qualification || formData.highestQualification || formData.qualification || formData.education || '',
    educationDetail: education.educationDetail || education.details || formData.educationDetail || formData.details || '',
    occupation: occupation.occupation || occupation.jobTitle || (typeof occupation === 'string' ? occupation : '') || formData.occupation || formData.jobTitle || '',
    employedIn: occupation.employedIn || formData.employedIn || '',
    monthlyIncome: occupation.monthlyIncome ? String(occupation.monthlyIncome) : (formData.monthlyIncome ? String(formData.monthlyIncome) : ''),
    annualIncome: occupation.annualIncome ? String(occupation.annualIncome) : (occupation.monthlyIncome ? String(Number(occupation.monthlyIncome) * 12) : (formData.annualIncome ? String(formData.annualIncome) : '')),
    workLocation: occupation.workLocation || formData.workLocation || '',

    address: (typeof address.address === 'string' ? address.address : '') || (typeof address.addressLine === 'string' ? address.addressLine : '') || (typeof formData.address === 'string' ? formData.address : '') || (typeof formData.addressLine === 'string' ? formData.addressLine : '') || '',
    addressLine: (typeof address.address === 'string' ? address.address : '') || (typeof address.addressLine === 'string' ? address.addressLine : '') || (typeof formData.address === 'string' ? formData.address : '') || (typeof formData.addressLine === 'string' ? formData.addressLine : '') || '',
    village: address.village || formData.village || '',
    city: address.city || formData.city || '',
    district: address.district || formData.district || '',
    state: address.state || formData.state || '',
    country: address.country || formData.country || '',
    postalCode: address.postalCode || address.pincode || formData.postalCode || formData.pincode || '',

    whatsappNumber: communication.whatsappNumber || formData.whatsappNumber || '',
    alternateMobile: communication.alternateMobile || personal.alternateMobile || communication.whatsappNumber || personal.alternatePhone || formData.alternateMobile || formData.whatsappNumber || '',
    alternateEmail: communication.alternateEmail || formData.alternateEmail || '',
    preferredContactMethod: communication.preferredContactMethod || formData.preferredContactMethod || '',
    bestTimeToContact: communication.bestTimeToContact || formData.bestTimeToContact || '',
    partnerExpectations: partnerPreference.partnerExpectations || partnerPreference.expectations || about.partnerExpectations || about.expectations || formData.partnerExpectations || formData.expectations || '',

    heightCm: physical.heightCm ? String(physical.heightCm) : (formData.heightCm ? String(formData.heightCm) : (physical.height ? String(physical.height) : '')),
    weightKg: physical.weightKg ? String(physical.weightKg) : (formData.weightKg ? String(formData.weightKg) : (physical.weight ? String(physical.weight) : '')),
    bloodGroup: physical.bloodGroup || formData.bloodGroup || '',
    bodyType: physical.bodyType || formData.bodyType || '',
    complexion: physical.complexion || formData.complexion || '',
    drinkingHabits: lifestyle.drinkingHabits || lifestyle.drinking || formData.drinkingHabits || formData.drinking || '',
    smokingHabits: lifestyle.smokingHabits || lifestyle.smoking || formData.smokingHabits || formData.smoking || '',
    eatingHabits: lifestyle.eatingHabits || lifestyle.diet || formData.eatingHabits || formData.diet || '',
    spokenLanguages: toArray(lifestyle.spokenLanguages || lifestyle.languagesKnown || formData.spokenLanguages || formData.languagesKnown),
    hobbies: toArray(lifestyle.hobbies || formData.hobbies),
    interests: toArray(lifestyle.interests || formData.interests),

    // Renamed fields to match backend schema strictly
    gothram: astrology.gothram || astrology.gothra || formData.gothram || formData.gothra || formData.koottam || '',
    kulaTheivaTemple: astrology.kulaTheivaTemple || astrology.kuladeivam || formData.kulaTheivaTemple || formData.kuladeivam || '',
    lakuna: astrology.lakuna || astrology.lagnam || astrology.lagna || formData.lakuna || formData.lagnam || formData.lagna || '',
    hasDosham: (astrology.hasDosham ?? astrology.dosham ?? astrology.dhosam ?? astrology.hasDhosam ?? formData.hasDosham ?? formData.dosham ?? formData.dhosam ?? formData.hasDhosam) === 'Yes' || (astrology.hasDosham ?? astrology.dosham ?? astrology.dhosam ?? astrology.hasDhosam ?? formData.hasDosham ?? formData.dosham ?? formData.dhosam ?? formData.hasDhosam) === true || (astrology.hasDosham ?? astrology.dosham ?? astrology.dhosam ?? astrology.hasDhosam ?? formData.hasDosham ?? formData.dosham ?? formData.dhosam ?? formData.hasDhosam) === 'yes',
    dosham: (astrology.hasDosham ?? astrology.dosham ?? astrology.dhosam ?? astrology.hasDhosam ?? formData.hasDosham ?? formData.dosham ?? formData.dhosam ?? formData.hasDhosam) === 'Yes' || (astrology.hasDosham ?? astrology.dosham ?? astrology.dhosam ?? astrology.hasDhosam ?? formData.hasDosham ?? formData.dosham ?? formData.dhosam ?? formData.hasDhosam) === true ? 'Yes' : 'No',
    dhosam: (astrology.hasDosham ?? astrology.dosham ?? astrology.dhosam ?? astrology.hasDhosam ?? formData.hasDosham ?? formData.dosham ?? formData.dhosam ?? formData.hasDhosam) === 'Yes' || (astrology.hasDosham ?? astrology.dosham ?? astrology.dhosam ?? astrology.hasDhosam ?? formData.hasDosham ?? formData.dosham ?? formData.dhosam ?? formData.hasDhosam) === true ? 'Yes' : 'No',
    hasDhosam: (astrology.hasDosham ?? astrology.dosham ?? astrology.dhosam ?? astrology.hasDhosam ?? formData.hasDosham ?? formData.dosham ?? formData.dhosam ?? formData.hasDhosam) === 'Yes' || (astrology.hasDosham ?? astrology.dosham ?? astrology.dhosam ?? astrology.hasDhosam ?? formData.hasDosham ?? formData.dosham ?? formData.dhosam ?? formData.hasDhosam) === true ? 'Yes' : 'No',
    isPhysicallyChallenged: physical.isPhysicallyChallenged != null ? (physical.isPhysicallyChallenged === true || physical.isPhysicallyChallenged === 'Yes') : (physical.physicallyChallenged != null && physical.physicallyChallenged !== '' ? (physical.physicallyChallenged === 'Yes' || physical.physicallyChallenged === true) : (formData.isPhysicallyChallenged != null ? Boolean(formData.isPhysicallyChallenged) : undefined)),
    disabilityDetails: physical.disabilityDetails || physical.physicallyChallengedDetails || formData.disabilityDetails || formData.physicallyChallengedDetails || '',
    currentCompany: occupation.currentCompany || occupation.organization || occupation.companyName || formData.currentCompany || formData.organization || formData.companyName || '',
    bio: about.bio || about.aboutMe || (typeof about === 'string' ? about : '') || personal.aboutMe || formData.bio || formData.aboutMe || '',
    aboutFamily: about.aboutFamily || family.aboutFamily || formData.aboutFamily || '',
    subsect: personal.subsect || personal.subCaste || formData.subsect || formData.subCaste || '',
    prefReligion: partnerPreference.religion || partnerPreference.prefReligion || formData.prefReligion || formData.religion || '',
    prefCaste: partnerPreference.caste || partnerPreference.prefCaste || formData.prefCaste || formData.caste || '',
    prefCountry: partnerPreference.prefCountry || partnerPreference.location || formData.prefCountry || formData.prefLocation || formData.location || '',
    prefAgeRange: prefAgeRange,
    prefHeightRange: prefHeightRange,
    prefEducation: partnerPreference.education || formData.prefEducation || '',
    prefOccupation: partnerPreference.occupation || formData.prefOccupation || '',

    // Supporting objects / arrays
    photos: {
      main: mainPhotoUrl ? { url: mainPhotoUrl, path: photos.main?.path || mainPhotoUrl } : undefined,
      profileImageUrl: mainPhotoUrl || '',
      gallery: galleryList,
    },
    rasiChart: toChartObject(astrology.rasiChart || formData.rasiChart),
    amsamChart: toChartObject(astrology.amsamChart || formData.amsamChart),
    gallery: galleryList,
  }

  return removeUndefined(payload)
}

export function formatProfilePayload(sections, targetId, status, isNew, adminLabel, now) {
  const normalized = normalizePublishPayload(sections)
  return {
    ...normalized,
    id: targetId,
    status: (status || 'ACTIVE').toUpperCase(),
    profileStatus: (status || 'ACTIVE').toUpperCase(),
  }
}

export async function saveDraft(profileId, sections, { admin, isNew }) {
  let targetId = profileId
  if (isNew) {
    const userRes = await createUser({
      name: sections.personal?.fullName || sections.fullName || 'New User',
      email: sections.personal?.email || sections.email || undefined,
      phone: sections.personal?.mobileNumber || sections.mobile || '',
      mobile: sections.personal?.mobileNumber || sections.mobile || '',
      gender: (sections.personal?.gender || sections.gender || 'MALE').toUpperCase(),
      city: sections.address?.city || sections.city || '',
      tempPassword: 'Password123',
    })
    targetId = userRes?.id || userRes?.user?.id || userRes?.data?.id || userRes?.data?.user?.id || profileId
  }

  const payload = normalizePublishPayload(sections)
  const response = await api.put(`/admin/users/${targetId}`, payload)

  logActivity({
    action: isNew ? 'create' : 'update',
    module: 'Profiles',
    targetType: 'profile',
    targetId: targetId,
    description: `${isNew ? 'Created' : 'Updated'} profile draft "${sections.personal?.fullName || targetId}"`,
    admin,
  })

  return { id: targetId, response }
}

export async function publishProfile(profileId, sections, { admin, isNew }) {
  let targetId = profileId
  if (isNew) {
    const userRes = await createUser({
      name: sections.personal?.fullName || sections.fullName || 'New User',
      email: sections.personal?.email || sections.email || undefined,
      phone: sections.personal?.mobileNumber || sections.mobile || '',
      mobile: sections.personal?.mobileNumber || sections.mobile || '',
      gender: (sections.personal?.gender || sections.gender || 'MALE').toUpperCase(),
      city: sections.address?.city || sections.city || '',
      tempPassword: 'Password123',
    })
    targetId = userRes?.id || userRes?.user?.id || userRes?.data?.id || userRes?.data?.user?.id || profileId
  }

  const payload = normalizePublishPayload(sections)

  // Single PUT call to update live profile with normalized flat payload
  const response = await api.put(`/admin/users/${targetId}`, payload)

  // Validation: Compare response with sent payload for important fields
  const resUser = response?.user || response?.profile || response?.data || response
  const criticalFields = ['bloodGroup', 'bodyType', 'fatherName', 'star', 'rasi']
  const unpersistedFields = []

  if (resUser && typeof resUser === 'object') {
    const resProfile = resUser.profile || resUser
    criticalFields.forEach((field) => {
      const sentVal = payload[field]
      if (sentVal && sentVal !== '') {
        const receivedVal = resProfile[field] ?? resUser[field]
        if (!receivedVal || receivedVal === '') {
          unpersistedFields.push(field)
        }
      }
    })
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('profile-updated', { detail: { profileId: targetId } }))
  }

  return {
    id: targetId,
    response,
    unpersistedFields,
    isPartiallySaved: unpersistedFields.length > 0,
  }
}

export async function updateProfile(profileId, sections, { admin } = {}) {
  const payload = normalizePublishPayload(sections)
  const response = await api.put(`/admin/users/${profileId}`, payload)

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('profile-updated', { detail: { profileId } }))
  }

  logActivity({
    action: 'update',
    module: 'Profiles',
    targetType: 'profile',
    targetId: profileId,
    description: `Updated profile "${sections.personal?.fullName || profileId}"`,
    admin,
  })

  return { id: profileId, response }
}

export async function hideProfile(profileId, { admin } = {}) {
  const now = new Date().toISOString()
  const payload = {
    'system.status': 'hidden',
    'system.updatedAt': now,
    status: 'hidden',
    updatedAt: now,
  }

  await api.patch(`/admin/users/${profileId}/hide`, payload).catch(async () => {
    await api.put(`/admin/users/${profileId}`, payload)
  })

  logActivity({
    action: 'hide',
    module: 'Profiles',
    targetType: 'profile',
    targetId: profileId,
    description: 'Hid profile',
    newData: { status: 'hidden' },
    admin,
  })
}

export async function restoreProfile(profileId, { admin } = {}) {
  const now = new Date().toISOString()
  const payload = {
    'system.status': 'active',
    'system.updatedAt': now,
    'system.deletedAt': null,
    'system.deletedBy': null,
    status: 'active',
    updatedAt: now,
  }

  await api.patch(`/admin/users/${profileId}/restore`, payload).catch(async () => {
    await api.put(`/admin/users/${profileId}`, payload)
  })

  logActivity({
    action: 'restore',
    module: 'Profiles',
    targetType: 'profile',
    targetId: profileId,
    description: 'Restored profile',
    newData: { status: 'active' },
    admin,
  })
}

export async function softDeleteProfile(profileId, { admin }) {
  const now = new Date().toISOString()
  const payload = {
    'system.status': 'deleted',
    'system.deletedAt': now,
    'system.deletedBy': admin?.name || admin?.email || 'Admin',
    status: 'deleted',
    deletedAt: now,
  }

  await api.delete(`/admin/users/${profileId}`).catch(async () => {
    await api.patch(`/admin/users/${profileId}/soft-delete`, payload).catch(async () => {
      await api.put(`/admin/users/${profileId}`, payload)
    })
  })

  logActivity({
    action: 'delete',
    module: 'Profiles',
    targetType: 'profile',
    targetId: profileId,
    description: 'Deleted profile (soft delete)',
    newData: { status: 'deleted' },
    admin,
  })
}

export async function createLinkedUser({ name, email, phone, tempPassword, gender, city, admin }) {
  const uid = await createUserAccount({ email, password: tempPassword, name, phone, gender, city })
  await createUserDocument(uid, { name, email, phone, gender, city, admin })

  const existingProfile = await getProfileByUserId(uid)
  if (existingProfile) {
    return { uid, profileId: existingProfile.id }
  }

  const profileId = generateProfileId()
  const adminLabel = admin?.name || admin?.email || 'Admin'
  const now = new Date().toISOString()

  const draftProfileData = {
    id: profileId,
    userId: uid,
    personal: {
      fullName: name,
      email: email,
      mobileNumber: phone,
      gender: gender,
    },
    address: {
      city: city || '',
    },
    system: {
      status: 'draft',
      userId: uid,
      createdBy: adminLabel,
      createdAt: now,
      draftSavedAt: now,
      updatedAt: now,
      subscriptionStatus: 'free',
      blocked: false,
    },
  }

  await api.post('/admin/users', removeUndefined(draftProfileData)).catch(async () => {
    await api.put(`/admin/users/${profileId}`, removeUndefined(draftProfileData))
  })

  logActivity({
    action: 'create',
    module: 'Profiles',
    targetType: 'profile',
    targetId: profileId,
    description: `Automatically created draft profile "${name}" for new user`,
    newData: { userId: uid, profileId, status: 'draft' },
    admin,
  })

  return { uid, profileId }
}