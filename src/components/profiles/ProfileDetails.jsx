import ProfileSection from '@/components/profiles/ProfileSection'
import { calculateAge, formatCurrency, formatDate } from '@/utils/helpers'

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium text-foreground">{value ?? '—'}</span>
    </div>
  )
}

export default function ProfileDetails({ profile }) {
  const p = profile || {}
  const personal = p.personal || {}
  const physical = p.physical || {}
  const astrology = p.astrology || {}
  const education = p.education || {}
  const occupation = p.occupation || {}
  const family = p.family || {}
  const address = p.address || {}
  const lifestyle = p.lifestyle || {}
  const partnerPreference = p.partnerPreference || {}
  const user = p.user || {}

  const gender = p.gender || personal.gender
  const dob = p.dateOfBirth || personal.dob
  const mobile = p.mobile || user.mobile || personal.mobileNumber
  const email = p.email || user.email || personal.email
  const maritalStatus = p.maritalStatus || personal.maritalStatus

  const height = p.heightCm || physical.heightCm
  const weight = p.weightKg || physical.weightKg
  const bodyType = p.bodyType || physical.bodyType
  const complexion = p.complexion || physical.complexion
  const bloodGroup = p.bloodGroup || physical.bloodGroup

  const star = p.star || astrology.star
  const rasi = p.rasi || astrology.raasi
  const koottam = p.koottam
  const temple = p.kulaTheivaTemple
  const dosham = p.hasDosham != null ? (p.hasDosham ? 'Yes' : 'No') : astrology.dosham

  const eduQual = p.educationLevel || (typeof education === 'string' ? education : education.highestQualification)
  const eduDetail = p.educationDetail || education.details || (typeof p.education === 'string' ? p.education : null)
  const jobTitle = p.jobDetails || (typeof occupation === 'string' ? occupation : occupation.jobTitle) || p.occupation
  const annualIncome = p.annualIncome || occupation.annualIncome

  const fatherName = p.fatherName || family.fatherName
  const motherName = p.motherName || family.motherName
  const fatherOcc = p.fatherOccupation || family.fatherOccupation
  const motherOcc = p.motherOccupation || family.motherOccupation

  const city = p.city || address.city
  const state = p.state || address.state
  const country = p.country || address.country

  const mainPhoto = p.profileImageUrl || p.photos?.main?.url
  const coverPhoto = p.coverImageUrl

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ProfileSection title="Personal Information">
        <Row label="Full Name" value={p.fullName || personal.fullName} />
        <Row label="Gender" value={gender} />
        <Row label="Age" value={calculateAge(dob)} />
        <Row label="Date of Birth" value={formatDate(dob)} />
        <Row label="Mobile Number" value={mobile} />
        <Row label="Email" value={email} />
        <Row label="Marital Status" value={maritalStatus} />
      </ProfileSection>

      <ProfileSection title="Physical Attributes">
        <Row label="Height" value={height ? `${height} cm` : null} />
        <Row label="Weight" value={weight ? `${weight} kg` : null} />
        <Row label="Body Type" value={bodyType} />
        <Row label="Complexion" value={complexion} />
        <Row label="Blood Group" value={bloodGroup} />
      </ProfileSection>

      <ProfileSection title="Horoscope & Astrology">
        <Row label="Star / Nakshatra" value={star} />
        <Row label="Raasi / Moon Sign" value={rasi} />
        <Row label="Koottam" value={koottam} />
        <Row label="Kula Theiva Temple" value={temple} />
        <Row label="Dosham" value={dosham} />
      </ProfileSection>

      <ProfileSection title="Education & Career">
        <Row label="Education Level" value={eduQual} />
        <Row label="Education Details" value={eduDetail} />
        <Row label="Occupation" value={jobTitle} />
        <Row label="Annual Income" value={annualIncome ? formatCurrency(annualIncome) : null} />
      </ProfileSection>

      <ProfileSection title="Family Details">
        <Row label="Father's Name" value={fatherName} />
        <Row label="Father's Occupation" value={fatherOcc} />
        <Row label="Mother's Name" value={motherName} />
        <Row label="Mother's Occupation" value={motherOcc} />
        <Row label="Brothers" value={p.brothersCount} />
        <Row label="Sisters" value={p.sistersCount} />
      </ProfileSection>

      <ProfileSection title="Location & Contact">
        <Row label="Address" value={p.address || address.addressLine} />
        <Row label="City" value={city} />
        <Row label="State" value={state} />
        <Row label="Country" value={country} />
      </ProfileSection>

      <ProfileSection title="Photos & Documents" className="lg:col-span-2">
        <div className="flex flex-wrap gap-4">
          {mainPhoto ? (
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Profile Photo</p>
              <img src={mainPhoto} alt="Profile" className="size-28 rounded-lg object-cover border border-border" />
            </div>
          ) : null}
          {coverPhoto ? (
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Cover Photo</p>
              <img src={coverPhoto} alt="Cover" className="h-28 w-44 rounded-lg object-cover border border-border" />
            </div>
          ) : null}
          {!mainPhoto && !coverPhoto && (
            <p className="text-sm text-muted-foreground">No photos uploaded.</p>
          )}
        </div>
      </ProfileSection>
    </div>
  )
}
