import {
  User,
  Activity,
  Moon,
  Sparkles,
  GraduationCap,
  Users as FamilyIcon,
  MapPin,
  PhoneCall,
  Heart,
  UserCheck,
  FileText,
  Image as ImageIcon,
  Shield,
} from 'lucide-react'
import ProfileSection from '@/components/profiles/ProfileSection'
import HoroscopeChart from '@/components/profiles/HoroscopeChart'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { calculateAge, formatCurrency, formatDate } from '@/utils/helpers'

/**
 * Safely formats strings, arrays, booleans, numbers, and empty values.
 * Never outputs [object Object], null, undefined, or empty string.
 */
export function displayValue(val) {
  if (val === undefined || val === null) return '—'
  if (typeof val === 'boolean') return val ? 'Yes' : 'No'
  if (typeof val === 'number') return String(val)
  if (typeof val === 'string') {
    const trimmed = val.trim()
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined' || trimmed === '-') return '—'
    if (trimmed.toLowerCase() === 'true') return 'Yes'
    if (trimmed.toLowerCase() === 'false') return 'No'
    return trimmed
  }
  if (Array.isArray(val)) {
    const validItems = val
      .map((item) => {
        if (item === null || item === undefined) return ''
        if (typeof item === 'object') return item.name || item.label || item.value || item.title || ''
        return String(item).trim()
      })
      .filter((s) => Boolean(s) && s !== 'null' && s !== 'undefined' && s !== '-')
    return validItems.length > 0 ? validItems.join(', ') : '—'
  }
  if (typeof val === 'object') {
    const extracted = val.name || val.label || val.title || val.text || val.value || ''
    return extracted ? String(extracted) : '—'
  }
  return String(val)
}

function formatBoolean(val) {
  if (val === null || val === undefined || val === '') return '—'
  if (val === true || val === 'true' || val === 'Yes' || val === 'yes') return 'Yes'
  if (val === false || val === 'false' || val === 'No' || val === 'no') return 'No'
  return '—'
}

function formatCurrencyDisplay(val) {
  if (val === null || val === undefined || val === '') return '—'
  const num = Number(val)
  if (Number.isNaN(num) || num === 0) return '—'
  return formatCurrency(num)
}

function Row({ label, value, children }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2.5 text-sm last:border-0">
      <span className="text-muted-foreground shrink-0 font-normal">{label}</span>
      {children ? (
        <div className="text-right">{children}</div>
      ) : (
        <span className="truncate font-medium text-foreground text-right">{displayValue(value)}</span>
      )}
    </div>
  )
}

function ChipsList({ items }) {
  if (!items) return <span className="text-muted-foreground font-medium">—</span>
  const arr = Array.isArray(items)
    ? items
    : typeof items === 'string'
      ? items.split(',').map((s) => s.trim()).filter(Boolean)
      : []
  if (arr.length === 0) return <span className="text-muted-foreground font-medium">—</span>

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {arr.map((item, idx) => {
        const text = typeof item === 'object' && item !== null ? item.label || item.name || item.value || '' : String(item).trim()
        if (!text || text === '—' || text === '-') return null
        return (
          <span
            key={idx}
            className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
          >
            {text}
          </span>
        )
      })}
    </div>
  )
}

export default function ProfileDetails({ profile: rawProfile }) {
  // Always read values directly from response.data.profile as single source of truth
  const profile = (rawProfile && typeof rawProfile === 'object' && rawProfile.profile)
    ? rawProfile.profile
    : (rawProfile || {})
  const user = (rawProfile && typeof rawProfile === 'object' && rawProfile.user)
    ? rawProfile.user
    : (rawProfile || {})

  // 1. Personal Details
  const fullName = profile.fullName || user.name || user.fullName
  const gender = profile.gender ? String(profile.gender).toUpperCase() : '—'
  const dob = profile.dateOfBirth || profile.dob
  const age = dob ? `${calculateAge(dob)} Yrs` : '—'
  const mobile = profile.mobile || user.phone || user.mobile
  const altPhone = profile.alternateMobile || profile.alternatePhone
  const email = profile.email || user.email
  const religion = profile.religion
  const caste = profile.caste
  const subsect = profile.subsect
  const motherTongue = profile.motherTongue
  const maritalStatus = profile.maritalStatus

  // 2. Physical Details
  const height = profile.heightCm ? `${profile.heightCm} cm` : '—'
  const weight = profile.weightKg ? `${profile.weightKg} kg` : '—'
  const bodyType = profile.bodyType
  const complexion = profile.complexion
  const bloodGroup = profile.bloodGroup
  const isPhysicallyChallenged = formatBoolean(profile.isPhysicallyChallenged)
  const disabilityDetails = profile.disabilityDetails

  // 3. Astrology Details
  const birthDateDisplay = dob ? formatDate(dob) : '—'
  const birthTime = profile.timeOfBirth
  const birthPlace = profile.placeOfBirth
  const star = profile.star
  const rasi = profile.rasi
  const lakuna = profile.lakuna
  const hasDosham = formatBoolean(profile.hasDosham)
  const gothram = profile.gothram || profile.koottam
  const kulaTheivaTemple = profile.kulaTheivaTemple

  // 5. Education & Occupation
  const education = profile.education
  const educationDetail = profile.educationDetail
  const occupation = profile.occupation
  const currentCompany = profile.currentCompany
  const employedIn = profile.employedIn
  const monthlyIncome = formatCurrencyDisplay(profile.monthlyIncome)
  const annualIncome = formatCurrencyDisplay(profile.annualIncome)
  const workLocation = profile.workLocation

  // 6. Family Details
  const fatherName = profile.fatherName
  const fatherOccupation = profile.fatherOccupation
  const motherName = profile.motherName
  const motherOccupation = profile.motherOccupation
  const brothersCount = profile.brothersCount != null && profile.brothersCount !== '' ? String(profile.brothersCount) : '—'
  const brothersMarriedCount = profile.brothersMarriedCount != null && profile.brothersMarriedCount !== '' ? String(profile.brothersMarriedCount) : (profile.marriedBrothers != null && profile.marriedBrothers !== '' ? String(profile.marriedBrothers) : '—')
  const sistersCount = profile.sistersCount != null && profile.sistersCount !== '' ? String(profile.sistersCount) : '—'
  const sistersMarriedCount = profile.sistersMarriedCount != null && profile.sistersMarriedCount !== '' ? String(profile.sistersMarriedCount) : (profile.marriedSisters != null && profile.marriedSisters !== '' ? String(profile.marriedSisters) : '—')
  const familyStatus = profile.familyStatus
  const familyType = profile.familyType
  const familyValues = profile.familyValues
  const familyAnnualIncome = formatCurrencyDisplay(profile.familyAnnualIncome)

  // 7. Address & Location
  const address = profile.address
  const village = profile.village
  const city = profile.city || user.city
  const district = profile.district
  const state = profile.state || user.state
  const country = profile.country || user.country
  const postalCode = profile.postalCode

  // 8. Communication Details
  const whatsappNumber = profile.whatsappNumber || profile.alternateMobile || mobile
  const alternateMobile = altPhone
  const alternateEmail = profile.alternateEmail
  const bestTimeToContact = profile.bestTimeToContact
  const preferredContactMethod = profile.preferredContactMethod

  // 9. Lifestyle & Habits
  const eatingHabits = profile.eatingHabits
  const smokingHabits = profile.smokingHabits
  const drinkingHabits = profile.drinkingHabits
  const hobbies = profile.hobbies
  const interests = profile.interests
  const spokenLanguages = profile.spokenLanguages

  // 10. Partner Preference
  const prefAgeRange = profile.prefAgeRange || '—'
  const prefHeightRange = profile.prefHeightRange || '—'
  const prefReligion = profile.prefReligion
  const prefCaste = profile.prefCaste
  const prefEducation = profile.prefEducation
  const prefOccupation = profile.prefOccupation
  const prefCountry = profile.prefCountry
  const partnerExpectations = profile.partnerExpectations

  // 11. About Me
  const bio = profile.bio
  const aboutFamily = profile.aboutFamily

  // 12. Photos & Gallery
  const mainPhoto = profile.profileImageUrl || user.profileImageUrl || user.photoURL || null
  const galleryList = Array.isArray(profile.gallery) ? profile.gallery : []

  return (
    <ErrorBoundary>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 1. Personal Details */}
        <ProfileSection title="1. Personal Details" icon={User}>
          <Row label="Full Name" value={fullName} />
          <Row label="Gender" value={gender} />
          <Row label="Age" value={age} />
          <Row label="Date of Birth" value={birthDateDisplay} />
          <Row label="Mobile Number" value={mobile} />
          <Row label="Alternate Phone" value={altPhone} />
          <Row label="Email" value={email} />
          <Row label="Religion" value={religion} />
          <Row label="Caste" value={caste} />
          <Row label="Sub Caste" value={subsect} />
          <Row label="Mother Tongue" value={motherTongue} />
          <Row label="Marital Status" value={maritalStatus} />
        </ProfileSection>

        {/* 2. Physical Details */}
        <ProfileSection title="2. Physical Details" icon={Activity}>
          <Row label="Height" value={height} />
          <Row label="Weight" value={weight} />
          <Row label="Body Type" value={bodyType} />
          <Row label="Complexion" value={complexion} />
          <Row label="Blood Group" value={bloodGroup} />
          <Row label="Physical Disability" value={isPhysicallyChallenged} />
          <Row label="Disability Details" value={disabilityDetails} />
        </ProfileSection>

        {/* 3. Astrology Details */}
        <ProfileSection title="3. Astrology Details" icon={Moon}>
          <Row label="Birth Date" value={birthDateDisplay} />
          <Row label="Birth Time" value={birthTime} />
          <Row label="Birth Place" value={birthPlace} />
          <Row label="Raasi / Moon Sign" value={rasi} />
          <Row label="Star / Nakshatra" value={star} />
          <Row label="Lagnam" value={lakuna} />
          <Row label="Dosham" value={hasDosham} />
          <Row label="Gothram / Koottam" value={gothram} />
          <Row label="Kuladeivam" value={kulaTheivaTemple} />
        </ProfileSection>

        {/* 5. Education & Occupation */}
        <ProfileSection title="5. Education & Occupation" icon={GraduationCap}>
          <Row label="Highest Qualification" value={education} />
          <Row label="Education Details" value={educationDetail} />
          <Row label="Job Title / Occupation" value={occupation} />
          <Row label="Company Name" value={currentCompany} />
          <Row label="Employed In" value={employedIn} />
          <Row label="Monthly Income" value={monthlyIncome} />
          <Row label="Annual Income" value={annualIncome} />
          <Row label="Work Location" value={workLocation} />
        </ProfileSection>

        {/* 4. Horoscope Details (Rasi + Amsam Charts) — Full Width */}
        <div className="lg:col-span-2 rounded-xl border border-[#EADFD2] bg-[#FFFDF8] p-5 shadow-xs">
          <div className="mb-4 flex items-center justify-between border-b border-[#EADFD2] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-[#E67E22]" />
              <h3 className="font-heading font-bold text-lg text-[#E67E22]">
                4. Horoscope Details (ஜாதகக் கட்டம்)
              </h3>
            </div>
            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-500/20">
              Read-Only Preview
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h4 className="mb-2 text-center font-bold text-sm text-foreground tamil-text">
                இராசி கட்டம் (Rasi Horoscope Chart)
              </h4>
              <HoroscopeChart value={profile.rasiChart} readOnly={true} title="இராசி" />
            </div>
            <div>
              <h4 className="mb-2 text-center font-bold text-sm text-foreground tamil-text">
                அம்சகம் கட்டம் (Amsam Horoscope Chart)
              </h4>
              <HoroscopeChart value={profile.amsamChart} readOnly={true} title="அம்சகம்" />
            </div>
          </div>
        </div>

        {/* 6. Family Details */}
        <ProfileSection title="6. Family Details" icon={FamilyIcon}>
          <Row label="Father Name" value={fatherName} />
          <Row label="Father Occupation" value={fatherOccupation} />
          <Row label="Mother Name" value={motherName} />
          <Row label="Mother Occupation" value={motherOccupation} />
          <Row label="Brothers" value={brothersCount} />
          <Row label="Married Brothers" value={brothersMarriedCount} />
          <Row label="Sisters" value={sistersCount} />
          <Row label="Married Sisters" value={sistersMarriedCount} />
          <Row label="Family Type" value={familyType} />
          <Row label="Family Status" value={familyStatus} />
          <Row label="Family Values" value={familyValues} />
          <Row label="Family Annual Income" value={familyAnnualIncome} />
        </ProfileSection>

        {/* 7. Address & Location */}
        <ProfileSection title="7. Address & Location" icon={MapPin}>
          <Row label="Address" value={address} />
          <Row label="Village / Town" value={village} />
          <Row label="City" value={city} />
          <Row label="District" value={district} />
          <Row label="State" value={state} />
          <Row label="Country" value={country} />
          <Row label="Postal Code" value={postalCode} />
        </ProfileSection>

        {/* 8. Communication Details */}
        <ProfileSection title="8. Communication Details" icon={PhoneCall}>
          <Row label="WhatsApp Number" value={whatsappNumber} />
          <Row label="Alternate Mobile" value={alternateMobile} />
          <Row label="Alternate Email" value={alternateEmail} />
          <Row label="Preferred Contact Time" value={bestTimeToContact} />
        </ProfileSection>

        {/* 9. Lifestyle & Habits */}
        <ProfileSection title="9. Lifestyle & Habits" icon={Heart}>
          <Row label="Diet" value={eatingHabits} />
          <Row label="Smoking" value={smokingHabits} />
          <Row label="Drinking" value={drinkingHabits} />
          <Row label="Hobbies">
            <ChipsList items={hobbies} />
          </Row>
          <Row label="Interests">
            <ChipsList items={interests} />
          </Row>
          <Row label="Languages Known">
            <ChipsList items={spokenLanguages} />
          </Row>
        </ProfileSection>

        {/* 10. Partner Preference */}
        <ProfileSection title="10. Partner Preference" icon={UserCheck}>
          <Row label="Age Preference" value={prefAgeRange} />
          <Row label="Height Preference" value={prefHeightRange} />
          <Row label="Religion Preference" value={prefReligion} />
          <Row label="Caste Preference" value={prefCaste} />
          <Row label="Education Preference" value={prefEducation} />
          <Row label="Occupation Preference" value={prefOccupation} />
          <Row label="Location Preference" value={prefCountry} />
          <Row label="Partner Expectations" value={partnerExpectations} />
        </ProfileSection>

        {/* 11. About Me */}
        <ProfileSection title="11. About Me" icon={FileText}>
          <div className="space-y-3 pt-1">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">About Me</p>
              <p className="mt-1 text-sm text-foreground whitespace-pre-wrap bg-muted/40 rounded-lg p-3 border border-border/60">
                {displayValue(bio)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">About Family</p>
              <p className="mt-1 text-sm text-foreground whitespace-pre-wrap bg-muted/40 rounded-lg p-3 border border-border/60">
                {displayValue(aboutFamily)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Partner Expectation Description</p>
              <p className="mt-1 text-sm text-foreground whitespace-pre-wrap bg-muted/40 rounded-lg p-3 border border-border/60">
                {displayValue(partnerExpectations)}
              </p>
            </div>
          </div>
        </ProfileSection>

        {/* 12. Photos & Gallery — Full Width */}
        <ProfileSection title="12. Photos & Gallery" icon={ImageIcon} className="lg:col-span-2">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Main Profile Photo</p>
              {mainPhoto ? (
                <img
                  src={typeof mainPhoto === 'string' ? mainPhoto : mainPhoto?.url}
                  alt="Main Profile"
                  className="size-32 rounded-xl object-cover border-2 border-border shadow-xs"
                />
              ) : (
                <div className="flex size-32 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-xs text-muted-foreground">
                  No Photo
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                Gallery Photos ({galleryList.length})
              </p>
              {galleryList.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {galleryList.map((item, idx) => {
                    const url = typeof item === 'string' ? item : item?.url || item?.fileUrl
                    if (!url) return null
                    return (
                      <img
                        key={idx}
                        src={url}
                        alt={`Gallery ${idx + 1}`}
                        className="size-24 rounded-lg object-cover border border-border shadow-xs"
                      />
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No gallery photos uploaded.</p>
              )}
            </div>
          </div>
        </ProfileSection>

        {/* 13. Account Information */}
        <ProfileSection title="13. Account Information" icon={Shield} className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Row label="Account Status" value={profile.status || user.status || 'ACTIVE'} />
            <Row label="Profile Status" value={profile.profileStatus || 'ACTIVE'} />
            <Row label="Premium Member" value={profile.isPremium || user.isPremium ? 'Yes' : 'No'} />
            <Row label="Account Created" value={profile.createdAt || user.createdAt ? formatDate(profile.createdAt || user.createdAt) : '—'} />
          </div>
        </ProfileSection>
      </div>
    </ErrorBoundary>
  )
}
