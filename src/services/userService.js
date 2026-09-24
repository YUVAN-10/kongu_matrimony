import api from '@/lib/api'
import { formatDate } from '@/utils/helpers'

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '')
}

/**
 * Normalizes a user record from the backend for consistent frontend usage.
 */
export function normalizeUser(user) {
  if (!user) return null
  const profile = typeof user.profile === 'object' && user.profile !== null ? user.profile : {}
  const subscriptions = Array.isArray(user.subscriptions) ? user.subscriptions : []
  const hasActiveSub = subscriptions.some((s) => s.status === 'ACTIVE' || s.status === 'active')

  const rawProfileStatus = profile.status || profile.system?.status || user.profileStatus || user.status
  const profileStatus = rawProfileStatus
    ? String(rawProfileStatus).toUpperCase()
    : profile.id || user.id
      ? 'ACTIVE'
      : 'INCOMPLETE'

  const userPersonal = typeof user.personal === 'object' && user.personal !== null ? user.personal : {}
  const profPersonal = typeof profile.personal === 'object' && profile.personal !== null ? profile.personal : {}

  const userPhysical = typeof user.physical === 'object' && user.physical !== null ? user.physical : {}
  const profPhysical = typeof profile.physical === 'object' && profile.physical !== null ? profile.physical : {}

  const userAstrology = typeof user.astrology === 'object' && user.astrology !== null ? user.astrology : {}
  const profAstrology = typeof profile.astrology === 'object' && profile.astrology !== null ? profile.astrology : {}

  const userEducation = typeof user.education === 'object' && user.education !== null ? user.education : {}
  const profEducation = typeof profile.education === 'object' && profile.education !== null ? profile.education : {}

  const userOccupation = typeof user.occupation === 'object' && user.occupation !== null ? user.occupation : {}
  const profOccupation = typeof profile.occupation === 'object' && profile.occupation !== null ? profile.occupation : {}

  const userFamily = typeof user.family === 'object' && user.family !== null ? user.family : {}
  const profFamily = typeof profile.family === 'object' && profile.family !== null ? profile.family : {}

  const userAddress = typeof user.address === 'object' && user.address !== null ? user.address : {}
  const profAddress = typeof profile.address === 'object' && profile.address !== null ? profile.address : {}

  const userComm = typeof user.communication === 'object' && user.communication !== null ? user.communication : {}
  const profComm = typeof profile.communication === 'object' && profile.communication !== null ? profile.communication : {}

  const userLifestyle = typeof user.lifestyle === 'object' && user.lifestyle !== null ? user.lifestyle : {}
  const profLifestyle = typeof profile.lifestyle === 'object' && profile.lifestyle !== null ? profile.lifestyle : {}

  const userPartnerPref = typeof user.partnerPreference === 'object' && user.partnerPreference !== null ? user.partnerPreference : {}
  const profPartnerPref = typeof profile.partnerPreference === 'object' && profile.partnerPreference !== null ? profile.partnerPreference : {}

  const userAbout = typeof user.about === 'object' && user.about !== null ? user.about : {}
  const profAbout = typeof profile.about === 'object' && profile.about !== null ? profile.about : {}

  const userPhotos = typeof user.photos === 'object' && user.photos !== null ? user.photos : {}
  const profPhotos = typeof profile.photos === 'object' && profile.photos !== null ? profile.photos : {}

  const rasiChart =
    profAstrology.rasiChart ||
    userAstrology.rasiChart ||
    profile.rasiChart ||
    user.rasiChart ||
    null

  const amsamChart =
    profAstrology.amsamChart ||
    userAstrology.amsamChart ||
    profile.amsamChart ||
    user.amsamChart ||
    null

  const aboutMe =
    profile.aboutMe ||
    user.aboutMe ||
    profAbout.aboutMe ||
    userAbout.aboutMe ||
    profPersonal.aboutMe ||
    userPersonal.aboutMe ||
    ''

  const aboutFamily =
    profile.aboutFamily ||
    user.aboutFamily ||
    profAbout.aboutFamily ||
    userAbout.aboutFamily ||
    profFamily.aboutFamily ||
    userFamily.aboutFamily ||
    ''

  const expectations =
    profile.expectations ||
    user.expectations ||
    profAbout.expectations ||
    userAbout.expectations ||
    profPartnerPref.expectations ||
    userPartnerPref.expectations ||
    ''

  const city =
    profAddress.city ||
    userAddress.city ||
    profile.city ||
    user.city ||
    ''

  const state =
    profAddress.state ||
    userAddress.state ||
    profile.state ||
    user.state ||
    ''

  const country =
    profAddress.country ||
    userAddress.country ||
    profile.country ||
    user.country ||
    ''

  const pincode =
    profAddress.pincode ||
    userAddress.pincode ||
    profile.pincode ||
    user.pincode ||
    ''

  const village =
    profAddress.village ||
    userAddress.village ||
    profile.village ||
    user.village ||
    ''

  const district =
    profAddress.district ||
    userAddress.district ||
    profile.district ||
    user.district ||
    ''

  const addressLine =
    (typeof profile.address === 'string' ? profile.address : null) ||
    (typeof user.address === 'string' ? user.address : null) ||
    profAddress.addressLine ||
    userAddress.addressLine ||
    ''

  const fullName =
    profPersonal.fullName ||
    profPersonal.name ||
    profile.fullName ||
    profile.name ||
    userPersonal.fullName ||
    userPersonal.name ||
    user.fullName ||
    (user.name && user.name !== 'User' && user.name !== 'New User' ? user.name : null) ||
    user.name ||
    '—'

  const email =
    profPersonal.email ||
    profile.email ||
    userPersonal.email ||
    user.email ||
    '—'

  const phone =
    profPersonal.mobileNumber ||
    profile.mobile ||
    profile.phone ||
    userPersonal.mobileNumber ||
    user.mobile ||
    user.phone ||
    '—'

  const dob =
    profPersonal.dob ||
    profPersonal.dateOfBirth ||
    profile.dob ||
    profile.dateOfBirth ||
    userPersonal.dob ||
    userPersonal.dateOfBirth ||
    user.dob ||
    user.dateOfBirth ||
    null

  const gender = (
    profPersonal.gender ||
    profile.gender ||
    userPersonal.gender ||
    user.gender ||
    ''
  ).toUpperCase()

  const religion =
    profPersonal.religion ||
    profile.religion ||
    userPersonal.religion ||
    user.religion ||
    ''

  const caste =
    profPersonal.caste ||
    profile.caste ||
    userPersonal.caste ||
    user.caste ||
    ''

  const subCaste =
    profPersonal.subCaste ||
    profile.subCaste ||
    userPersonal.subCaste ||
    user.subCaste ||
    ''

  const motherTongue =
    profPersonal.motherTongue ||
    profile.motherTongue ||
    userPersonal.motherTongue ||
    user.motherTongue ||
    ''

  const maritalStatus =
    profPersonal.maritalStatus ||
    profile.maritalStatus ||
    userPersonal.maritalStatus ||
    user.maritalStatus ||
    ''

  // Physical
  const heightCm = profPhysical.heightCm || userPhysical.heightCm || profile.heightCm || user.heightCm || profile.height || user.height
  const weightKg = profPhysical.weightKg || userPhysical.weightKg || profile.weightKg || user.weightKg || profile.weight || user.weight
  const bodyType = profPhysical.bodyType || userPhysical.bodyType || profile.bodyType || user.bodyType
  const complexion = profPhysical.complexion || userPhysical.complexion || profile.complexion || user.complexion
  const bloodGroup = profPhysical.bloodGroup || userPhysical.bloodGroup || profile.bloodGroup || user.bloodGroup
  const physicallyChallenged =
    profPhysical.physicallyChallenged ||
    userPhysical.physicallyChallenged ||
    profile.physicallyChallenged ||
    user.physicallyChallenged
  const physicallyChallengedDetails =
    profPhysical.physicallyChallengedDetails ||
    userPhysical.physicallyChallengedDetails ||
    profile.physicallyChallengedDetails

  // Astrology
  const star = profAstrology.star || userAstrology.star || profile.star || user.star
  const rasi = profAstrology.rasi || profAstrology.raasi || userAstrology.rasi || userAstrology.raasi || profile.rasi || profile.raasi || user.rasi || user.raasi
  const lagnam = profAstrology.lagnam || profAstrology.lagna || userAstrology.lagnam || userAstrology.lagna || profile.lagnam || profile.lagna || user.lagnam || user.lagna
  const birthTime = profAstrology.birthTime || userAstrology.birthTime || profile.birthTime || user.birthTime
  const birthPlace = profAstrology.birthPlace || userAstrology.birthPlace || profile.birthPlace || user.birthPlace
  const koottam = profAstrology.koottam || profAstrology.gothra || userAstrology.koottam || userAstrology.gothra || profile.koottam || profile.gothra || user.koottam || user.gothra
  const kulaTheivaTemple =
    profAstrology.kulaTheivaTemple ||
    profAstrology.kuladeivam ||
    userAstrology.kulaTheivaTemple ||
    userAstrology.kuladeivam ||
    profile.kulaTheivaTemple ||
    profile.kuladeivam ||
    user.kulaTheivaTemple ||
    user.kuladeivam
  const dosham =
    profAstrology.dosham ||
    userAstrology.dosham ||
    (profile.hasDosham != null ? (profile.hasDosham ? 'Yes' : 'No') : null) ||
    (user.hasDosham != null ? (user.hasDosham ? 'Yes' : 'No') : null) ||
    profile.dosham ||
    user.dosham

  // Education & Occupation
  const highestQualification =
    profEducation.highestQualification ||
    profEducation.education ||
    profEducation.qualification ||
    profEducation.educationLevel ||
    userEducation.highestQualification ||
    userEducation.education ||
    userEducation.qualification ||
    userEducation.educationLevel ||
    profile.highestQualification ||
    profile.qualification ||
    profile.educationLevel ||
    (typeof profile.education === 'string' ? profile.education : null) ||
    user.highestQualification ||
    user.qualification ||
    user.educationLevel ||
    (typeof user.education === 'string' ? user.education : null) ||
    ''
  const educationDetails =
    profEducation.details ||
    userEducation.details ||
    profile.educationDetail ||
    profile.details ||
    user.educationDetail ||
    user.details
  const jobTitle =
    profOccupation.jobTitle ||
    profOccupation.occupation ||
    userOccupation.jobTitle ||
    userOccupation.occupation ||
    profile.jobTitle ||
    profile.occupation ||
    user.jobTitle ||
    user.occupation
  const organization =
    profOccupation.organization ||
    profOccupation.companyName ||
    userOccupation.organization ||
    userOccupation.companyName ||
    profile.organization ||
    profile.companyName ||
    user.organization ||
    user.companyName
  const employedIn =
    profOccupation.employedIn ||
    userOccupation.employedIn ||
    profile.employedIn ||
    user.employedIn
  const monthlyIncome =
    profOccupation.monthlyIncome ||
    userOccupation.monthlyIncome ||
    profile.monthlyIncome ||
    user.monthlyIncome
  const annualIncome =
    profOccupation.annualIncome ||
    userOccupation.annualIncome ||
    profile.annualIncome ||
    user.annualIncome ||
    (monthlyIncome ? String(Number(monthlyIncome) * 12) : '')
  const workLocation =
    profOccupation.workLocation ||
    userOccupation.workLocation ||
    profile.workLocation ||
    user.workLocation

  // Family
  const fatherName = profFamily.fatherName || userFamily.fatherName || profile.fatherName || user.fatherName
  const fatherOccupation = profFamily.fatherOccupation || userFamily.fatherOccupation || profile.fatherOccupation || user.fatherOccupation
  const motherName = profFamily.motherName || userFamily.motherName || profile.motherName || user.motherName
  const motherOccupation = profFamily.motherOccupation || userFamily.motherOccupation || profile.motherOccupation || user.motherOccupation
  const brothers = profFamily.brothers || userFamily.brothers || profile.brothersCount || profile.brothers || user.brothersCount || user.brothers
  const marriedBrothers = profFamily.marriedBrothers || userFamily.marriedBrothers || profile.marriedBrothers || user.marriedBrothers
  const sisters = profFamily.sisters || userFamily.sisters || profile.sistersCount || profile.sisters || user.sistersCount || user.sisters
  const marriedSisters = profFamily.marriedSisters || userFamily.marriedSisters || profile.marriedSisters || user.marriedSisters
  const familyStatus = profFamily.familyStatus || userFamily.familyStatus || profile.familyStatus || user.familyStatus
  const familyType = profFamily.familyType || userFamily.familyType || profile.familyType || user.familyType
  const familyValues = profFamily.familyValues || userFamily.familyValues || profile.familyValues || user.familyValues
  const familyAnnualIncome = profFamily.familyAnnualIncome || userFamily.familyAnnualIncome || profile.familyAnnualIncome || user.familyAnnualIncome

  // Communication
  const whatsappNumber =
    profComm.whatsappNumber ||
    userComm.whatsappNumber ||
    profile.whatsappNumber ||
    user.whatsappNumber ||
    phone
  const alternateMobile =
    profComm.alternateMobile ||
    profComm.alternatePhone ||
    userComm.alternateMobile ||
    userComm.alternatePhone ||
    profPersonal.alternatePhone ||
    profile.alternateMobile ||
    profile.alternatePhone ||
    user.alternateMobile ||
    user.alternatePhone
  const alternateEmail =
    profComm.alternateEmail ||
    userComm.alternateEmail ||
    profile.alternateEmail ||
    user.alternateEmail
  const bestTimeToContact =
    profComm.bestTimeToContact ||
    userComm.bestTimeToContact ||
    profile.bestTimeToContact ||
    user.bestTimeToContact
  const preferredContactMethod =
    profComm.preferredContactMethod ||
    userComm.preferredContactMethod ||
    profile.preferredContactMethod ||
    user.preferredContactMethod

  // Lifestyle
  const lifestyle = {
    ...userLifestyle,
    ...profLifestyle,
    diet: profLifestyle.diet || userLifestyle.diet || profile.diet || user.diet,
    smoking: profLifestyle.smoking || userLifestyle.smoking || profile.smoking || user.smoking,
    drinking: profLifestyle.drinking || userLifestyle.drinking || profile.drinking || user.drinking,
    hobbies: profLifestyle.hobbies || userLifestyle.hobbies || profile.hobbies || user.hobbies,
    interests: profLifestyle.interests || userLifestyle.interests || profile.interests || user.interests,
    languagesKnown: profLifestyle.languagesKnown || userLifestyle.languagesKnown || profile.languagesKnown || user.languagesKnown || motherTongue,
  }

  // Partner Preference
  const partnerPreference = {
    ...userPartnerPref,
    ...profPartnerPref,
    ageFrom: profPartnerPref.ageFrom || userPartnerPref.ageFrom || profile.ageFrom || user.ageFrom,
    ageTo: profPartnerPref.ageTo || userPartnerPref.ageTo || profile.ageTo || user.ageTo,
    heightFrom: profPartnerPref.heightFrom || userPartnerPref.heightFrom || profile.heightFrom || user.heightFrom,
    heightTo: profPartnerPref.heightTo || userPartnerPref.heightTo || profile.heightTo || user.heightTo,
    religion: profPartnerPref.religion || userPartnerPref.religion || profile.prefReligion || profile.partnerReligion || user.prefReligion || user.partnerReligion,
    caste: profPartnerPref.caste || userPartnerPref.caste || profile.prefCaste || profile.partnerCaste || user.prefCaste || user.partnerCaste,
    prefReligion: profPartnerPref.prefReligion || profPartnerPref.religion || userPartnerPref.prefReligion || userPartnerPref.religion || profile.prefReligion || user.prefReligion,
    prefCaste: profPartnerPref.prefCaste || profPartnerPref.caste || userPartnerPref.prefCaste || userPartnerPref.caste || profile.prefCaste || user.prefCaste,
    education: profPartnerPref.education || userPartnerPref.education || profile.prefEducation || profile.partnerEducation || user.prefEducation || user.partnerEducation,
    occupation: profPartnerPref.occupation || userPartnerPref.occupation || profile.prefOccupation || profile.partnerOccupation || user.prefOccupation || user.partnerOccupation,
    location: profPartnerPref.location || userPartnerPref.location || profile.prefCountry || profile.partnerLocation || user.prefCountry || user.partnerLocation,
    expectations: expectations,
  }

  // Photos
  const mainPhotoUrl =
    profPhotos.main?.url ||
    (typeof profPhotos.main === 'string' ? profPhotos.main : null) ||
    userPhotos.main?.url ||
    (typeof userPhotos.main === 'string' ? userPhotos.main : null) ||
    profile.profileImageUrl ||
    profile.photoURL ||
    user.profileImageUrl ||
    user.photoURL ||
    null

  const galleryList = Array.isArray(profPhotos.gallery)
    ? profPhotos.gallery
    : Array.isArray(userPhotos.gallery)
      ? userPhotos.gallery
      : Array.isArray(profile.gallery)
        ? profile.gallery
        : Array.isArray(user.gallery)
          ? user.gallery
          : []

  const mergedProfile = {
    ...user,
    ...profile,
    name: fullName,
    fullName: fullName,
    email: email,
    phone: phone,
    mobile: phone,
    gender: gender,
    dob: dob,
    dateOfBirth: dob,
    city: city || '—',
    state: state,
    country: country,
    pincode: pincode,
    village: village,
    district: district,
    aboutMe,
    aboutFamily,
    expectations,
    rasiChart,
    amsamChart,
    profileImageUrl: mainPhotoUrl,
    photoURL: mainPhotoUrl,
    gallery: galleryList,

    // Backend contract explicit properties
    subsect: profile.subsect || user.subsect || subCaste,
    lakuna: profile.lakuna || user.lakuna || lagnam,
    hasDosham: profile.hasDosham != null ? profile.hasDosham : (user.hasDosham != null ? user.hasDosham : (dosham === 'Yes' || dosham === true ? true : (dosham === 'No' || dosham === false ? false : null))),
    gothram: profile.gothram || user.gothram || koottam,
    kulaTheivaTemple: profile.kulaTheivaTemple || user.kulaTheivaTemple || kulaTheivaTemple,
    education: profile.education || user.education || highestQualification,
    educationDetail: profile.educationDetail || user.educationDetail || educationDetails,
    occupation: profile.occupation || user.occupation || jobTitle,
    currentCompany: profile.currentCompany || user.currentCompany || organization,
    monthlyIncome: profile.monthlyIncome || user.monthlyIncome || monthlyIncome,
    isPhysicallyChallenged: profile.isPhysicallyChallenged != null ? profile.isPhysicallyChallenged : (user.isPhysicallyChallenged != null ? user.isPhysicallyChallenged : (physicallyChallenged === 'Yes' || physicallyChallenged === true ? true : null)),
    disabilityDetails: profile.disabilityDetails || user.disabilityDetails || physicallyChallengedDetails,
    bio: profile.bio || user.bio || aboutMe,
    prefReligion: profile.prefReligion || user.prefReligion || partnerPreference.prefReligion,
    prefCaste: profile.prefCaste || user.prefCaste || partnerPreference.prefCaste,
    prefCountry: profile.prefCountry || user.prefCountry || partnerPreference.location,
    prefAgeRange: profile.prefAgeRange || user.prefAgeRange,
    prefHeightRange: profile.prefHeightRange || user.prefHeightRange,
    partnerExpectations: profile.partnerExpectations || user.partnerExpectations || expectations,

    personal: {
      ...userPersonal,
      ...profPersonal,
      fullName: fullName,
      mobileNumber: phone,
      phone: phone,
      email: email,
      gender: gender,
      dob: dob,
      dateOfBirth: dob,
      religion: religion,
      caste: caste,
      subCaste: subCaste,
      subsect: profile.subsect || user.subsect || subCaste,
      motherTongue: motherTongue,
      maritalStatus: maritalStatus,
      aboutMe,
    },
    address: {
      ...userAddress,
      ...profAddress,
      addressLine: addressLine,
      address: addressLine,
      village: village,
      city: city || '—',
      district: district,
      state: state,
      country: country,
      pincode: pincode,
    },
    physical: {
      ...userPhysical,
      ...profPhysical,
      heightCm: heightCm,
      weightKg: weightKg,
      bodyType: bodyType,
      complexion: complexion,
      bloodGroup: bloodGroup,
      physicallyChallenged: physicallyChallenged,
      isPhysicallyChallenged: profile.isPhysicallyChallenged != null ? profile.isPhysicallyChallenged : (user.isPhysicallyChallenged != null ? user.isPhysicallyChallenged : (physicallyChallenged === 'Yes' || physicallyChallenged === true ? true : null)),
      physicallyChallengedDetails: physicallyChallengedDetails,
      disabilityDetails: profile.disabilityDetails || user.disabilityDetails || physicallyChallengedDetails,
    },
    astrology: {
      ...userAstrology,
      ...profAstrology,
      star: star,
      rasi: rasi,
      raasi: rasi,
      lagnam: lagnam,
      lagna: lagnam,
      lakuna: profile.lakuna || user.lakuna || lagnam,
      birthTime: birthTime,
      birthPlace: birthPlace,
      koottam: koottam,
      gothra: koottam,
      gothram: profile.gothram || user.gothram || koottam,
      kulaTheivaTemple: kulaTheivaTemple,
      kuladeivam: kulaTheivaTemple,
      dosham: dosham,
      hasDosham: profile.hasDosham != null ? profile.hasDosham : (user.hasDosham != null ? user.hasDosham : (dosham === 'Yes' || dosham === true ? true : (dosham === 'No' || dosham === false ? false : null))),
      rasiChart: rasiChart,
      amsamChart: amsamChart,
    },
    education: {
      ...userEducation,
      ...profEducation,
      highestQualification: highestQualification,
      educationLevel: highestQualification,
      details: educationDetails,
    },
    occupation: {
      ...userOccupation,
      ...profOccupation,
      jobTitle: jobTitle,
      occupation: jobTitle,
      organization: organization,
      companyName: organization,
      currentCompany: profile.currentCompany || user.currentCompany || organization,
      employedIn: employedIn,
      annualIncome: annualIncome,
      workLocation: workLocation,
    },
    family: {
      ...userFamily,
      ...profFamily,
      fatherName: fatherName,
      fatherOccupation: fatherOccupation,
      motherName: motherName,
      motherOccupation: motherOccupation,
      brothers: brothers,
      marriedBrothers: marriedBrothers,
      sisters: sisters,
      marriedSisters: marriedSisters,
      familyStatus: familyStatus,
      familyType: familyType,
      familyValues: familyValues,
      familyAnnualIncome: familyAnnualIncome,
      aboutFamily: aboutFamily,
    },
    communication: {
      ...userComm,
      ...profComm,
      whatsappNumber: whatsappNumber,
      alternateMobile: alternateMobile,
      alternatePhone: alternateMobile,
      alternateEmail: alternateEmail,
      bestTimeToContact: bestTimeToContact,
      preferredContactMethod: preferredContactMethod,
    },
    lifestyle: lifestyle,
    partnerPreference: partnerPreference,
    about: {
      ...userAbout,
      ...profAbout,
      aboutMe: aboutMe,
      bio: profile.bio || user.bio || aboutMe,
      aboutFamily: aboutFamily,
      expectations: expectations,
    },
    photos: {
      ...userPhotos,
      ...profPhotos,
      main: mainPhotoUrl ? { url: mainPhotoUrl } : undefined,
      gallery: galleryList,
    },
  }

  return {
    id: user.id || user._id || profile.id,
    name: fullName,
    fullName: fullName,
    email: email,
    phone: phone,
    mobile: phone,
    gender: gender,
    city: city || '—',
    role: user.role || 'user',
    status: (user.status || profile.system?.status || 'ACTIVE').toUpperCase(),
    profileStatus,
    isBlocked: (user.status || '').toUpperCase() === 'BLOCKED',
    isPremium: profile.isPremium || user.isPremium || hasActiveSub,
    photoURL: mainPhotoUrl,
    profileImageUrl: mainPhotoUrl,
    createdAt: user.createdAt,
    lastActiveAt: user.lastActiveAt,
    profile: mergedProfile,
    subscriptions,
    paymentRequests: user.paymentRequests || [],
  }
}

/**
 * 3.1 Get Users List
 * GET /api/admin/users
 * Query params: page, limit, search, status
 */
export async function getUsers({ page = 1, limit = 10, search = '', status = '' } = {}) {
  const params = {
    page,
    limit,
  }

  if (search && search.trim()) {
    params.search = search.trim()
  }

  if (status && status !== 'all' && status !== 'ALL') {
    params.status = status.toUpperCase()
  }

  const response = await api.get('/admin/users', params)
  const data = response?.data || response
  const rawUsers = data?.users || []
  const pagination = data?.pagination || {
    page,
    limit,
    total: rawUsers.length,
    totalPages: Math.ceil(rawUsers.length / limit) || 1,
  }

  return {
    users: rawUsers.map(normalizeUser),
    pagination,
  }
}

/**
 * 3.2 Get User Details
 * GET /api/admin/users/:id
 */
export async function getUserById(userId) {
  if (!userId) return null
  const response = await api.get(`/admin/users/${userId}`)
  const rawUser = response?.data || response?.user || response
  return normalizeUser(rawUser)
}

import { removeUndefined } from '@/utils/removeUndefined'

/**
 * 3.3 Create User
 * POST /api/admin/users
 * Body: { name, email, phone, gender, city, tempPassword }
 */
export async function createUser({ name, email, phone, gender, city, tempPassword }) {
  const payload = removeUndefined({
    name: name?.trim() || undefined,
    email: email?.trim() ? email.trim().toLowerCase() : undefined,
    phone: normalizePhone(phone) || undefined,
    gender: gender ? gender.toUpperCase() : 'MALE',
    city: city?.trim() || undefined,
    tempPassword: tempPassword || undefined,
  })

  const response = await api.post('/admin/users', payload)
  return response?.data || response
}

/**
 * 3.4 Update User
 * PUT /api/admin/users/:id
 * Body: { name, email, phone, gender, city }
 */
export async function updateUser(userId, { name, email, phone, gender, city }) {
  const payload = {
    name: name?.trim(),
    email: email?.trim()?.toLowerCase(),
    phone: normalizePhone(phone),
    gender: gender?.toUpperCase(),
    city: city?.trim() || undefined,
  }

  const response = await api.put(`/admin/users/${userId}`, payload)
  return response?.data || response
}

/**
 * 3.5 Update User Status (Block / Unblock)
 * PATCH /api/admin/users/:id/status
 * Body: { status: "ACTIVE" | "BLOCKED" }
 */
export async function updateUserStatus(userId, status) {
  const normalizedStatus = status.toUpperCase() === 'BLOCKED' ? 'BLOCKED' : 'ACTIVE'
  const response = await api.patch(`/admin/users/${userId}/status`, {
    status: normalizedStatus,
  })
  return response?.data || response
}

export async function blockUser(userId) {
  return updateUserStatus(userId, 'BLOCKED')
}

export async function unblockUser(userId) {
  return updateUserStatus(userId, 'ACTIVE')
}

export async function searchUsersOnce(term) {
  const res = await getUsers({ page: 1, limit: 50, search: term })
  return res.users
}

export async function searchUsersByPhone(phone) {
  const res = await getUsers({ page: 1, limit: 10, search: phone })
  return res.users
}

export async function searchUsersByEmail(email) {
  const res = await getUsers({ page: 1, limit: 10, search: email })
  return res.users
}

export async function searchUsersByName(name) {
  const res = await getUsers({ page: 1, limit: 10, search: name })
  return res.users
}

export async function createUserDocument(uid, data) {
  return createUser(data)
}

export async function softDeleteUser(userId) {
  return blockUser(userId)
}

/**
 * Export helpers
 */
export function exportUsersToCsv(users) {
  if (!users || users.length === 0) return

  const headers = ['ID', 'Name', 'Email', 'Phone', 'Gender', 'City', 'Subscription', 'Status', 'Created Date']
  const rows = users.map((u) => [
    `"${u.id || ''}"`,
    `"${u.name || ''}"`,
    `"${u.email || ''}"`,
    `"${u.phone || ''}"`,
    `"${u.gender || ''}"`,
    `"${u.city || ''}"`,
    `"${u.isPremium ? 'Premium' : 'Free'}"`,
    `"${u.status || ''}"`,
    `"${formatDate(u.createdAt) || ''}"`,
  ])

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `users_export_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportUsersToExcel(users) {
  exportUsersToCsv(users)
}

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  blockUser,
  unblockUser,
  searchUsersOnce,
  searchUsersByPhone,
  searchUsersByEmail,
  searchUsersByName,
  exportUsersToCsv,
  exportUsersToExcel,
}