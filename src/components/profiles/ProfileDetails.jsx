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

/**
 * Full read-only profile display — every section of the schema, current
 * values only. Shared by ViewProfile.jsx (the live/approved profile) and
 * NewProfileReview.jsx (a profile still pending its first approval), so the
 * two surfaces render identically instead of maintaining two copies.
 */
export default function ProfileDetails({ profile }) {
  const {
    personal = {},
    physical = {},
    astrology = {},
    education = {},
    occupation = {},
    family = {},
    address = {},
    communication = {},
    lifestyle = {},
    partnerPreference = {},
    about = {},
    photos = {},
  } = profile || {}

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ProfileSection title="Personal">
        <Row label="Gender" value={personal.gender} />
        <Row label="Age" value={calculateAge(personal.dob)} />
        <Row label="Date of Birth" value={formatDate(personal.dob)} />
        <Row label="Mobile Number" value={personal.mobileNumber} />
        <Row label="Alternate Phone" value={personal.alternatePhone} />
        <Row label="Email" value={personal.email} />
        <Row label="Marital Status" value={personal.maritalStatus} />
        <Row label="Religion" value={personal.religion} />
        <Row label="Mother Tongue" value={personal.motherTongue} />
      </ProfileSection>

      <ProfileSection title="Physical">
        <Row label="Height" value={physical.heightCm && `${physical.heightCm} cm`} />
        <Row label="Weight" value={physical.weightKg && `${physical.weightKg} kg`} />
        <Row label="Body Type" value={physical.bodyType} />
        <Row label="Complexion" value={physical.complexion} />
        <Row label="Blood Group" value={physical.bloodGroup} />
        <Row label="Physically Challenged" value={physical.physicallyChallenged} />
      </ProfileSection>

      <ProfileSection title="Astrology">
        <Row label="Birth Time" value={astrology.birthTime} />
        <Row label="Birth Place" value={astrology.birthPlace} />
        <Row label="Star / Nakshatra" value={astrology.star} />
        <Row label="Raasi / Moon Sign" value={astrology.raasi} />
        <Row label="Gothra" value={astrology.gothra} />
        <Row label="Dosham" value={astrology.dosham} />
      </ProfileSection>

      <ProfileSection title="Education & Occupation">
        <Row label="Highest Qualification" value={education.highestQualification} />
        <Row label="Education Details" value={education.details} />
        <Row label="Occupation" value={occupation.jobTitle} />
        <Row label="Employed In" value={occupation.employedIn} />
        <Row label="Organization" value={occupation.organization} />
        <Row label="Monthly Income" value={occupation.monthlyIncome && formatCurrency(occupation.monthlyIncome)} />
        <Row label="Annual Income" value={occupation.annualIncome && formatCurrency(occupation.annualIncome)} />
      </ProfileSection>

      <ProfileSection title="Family">
        <Row label="Father's Name" value={family.fatherName} />
        <Row label="Father's Occupation" value={family.fatherOccupation} />
        <Row label="Mother's Name" value={family.motherName} />
        <Row label="Mother's Occupation" value={family.motherOccupation} />
        <Row label="Siblings" value={`${family.brothers || 0} brother(s), ${family.sisters || 0} sister(s)`} />
        <Row label="Family Type" value={family.familyType} />
        <Row label="Family Status" value={family.familyStatus} />
        <Row
          label="Family Monthly / Annual Income"
          value={
            family.familyMonthlyIncome &&
            `${formatCurrency(family.familyMonthlyIncome)} / ${formatCurrency(family.familyAnnualIncome)}`
          }
        />
      </ProfileSection>

      <ProfileSection title="Address & Communication">
        <Row label="Address" value={address.addressLine} />
        <Row label="City" value={address.city} />
        <Row label="District" value={address.district} />
        <Row label="State" value={address.state} />
        <Row label="Country" value={address.country} />
        <Row label="Pincode" value={address.pincode} />
        <Row label="Preferred Contact" value={communication.preferredContactMethod} />
        <Row label="WhatsApp" value={communication.whatsappNumber} />
      </ProfileSection>

      <ProfileSection title="Lifestyle">
        <Row label="Diet" value={lifestyle.diet} />
        <Row label="Smoking" value={lifestyle.smoking} />
        <Row label="Drinking" value={lifestyle.drinking} />
        <Row label="Hobbies" value={lifestyle.hobbies} />
        <Row label="Interests" value={lifestyle.interests} />
      </ProfileSection>

      <ProfileSection title="Partner Preference">
        <Row
          label="Age Range"
          value={partnerPreference.ageFrom && `${partnerPreference.ageFrom} - ${partnerPreference.ageTo || '—'} yrs`}
        />
        <Row label="Preferred Religion" value={partnerPreference.religion} />
        <Row label="Preferred Education" value={partnerPreference.education} />
        <Row label="Preferred Occupation" value={partnerPreference.occupation} />
        <Row label="Preferred Location" value={partnerPreference.location} />
        <Row label="Other Expectations" value={partnerPreference.expectations} />
      </ProfileSection>

      <ProfileSection title="About">
        <Row label="About Me" value={about.aboutMe} />
        <Row label="Expectations" value={about.expectations} />
      </ProfileSection>

      <ProfileSection title="Photos" className="lg:col-span-2">
        <div className="flex flex-wrap gap-3">
          {photos.main?.url && <img src={photos.main.url} alt="Main" className="size-24 rounded-lg object-cover" />}
          {(photos.gallery || []).map((item, index) => (
            <img
              key={item.path || item.url || index}
              src={item.url}
              alt=""
              className="size-24 rounded-lg object-cover"
            />
          ))}
          {!photos.main?.url && (!photos.gallery || photos.gallery.length === 0) && (
            <p className="text-sm text-muted-foreground">No photos uploaded.</p>
          )}
        </div>
      </ProfileSection>
    </div>
  )
}
