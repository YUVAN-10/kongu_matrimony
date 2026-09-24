import { useFormContext } from 'react-hook-form'
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
} from 'lucide-react'
import HoroscopeChart from '@/components/profiles/HoroscopeChart'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { calculateAge, formatCurrency, formatDate } from '@/utils/helpers'

function renderSafeValue(val) {
  if (val === undefined || val === null) return '-'
  if (typeof val === 'boolean') return val ? 'Yes' : 'No'
  if (typeof val === 'number') return String(val)
  if (typeof val === 'string') {
    const trimmed = val.trim()
    return trimmed.length > 0 ? trimmed : '-'
  }
  if (Array.isArray(val)) {
    const strArr = val
      .map((item) => {
        if (item === null || item === undefined) return ''
        if (typeof item === 'object') {
          return item.name || item.label || item.value || item.title || ''
        }
        return String(item)
      })
      .filter(Boolean)
    return strArr.join(', ') || '-'
  }
  if (typeof val === 'object') {
    const extracted =
      val.name ||
      val.label ||
      val.title ||
      val.text ||
      val.value ||
      val.aboutMe ||
      val.addressLine ||
      val.address ||
      val.city ||
      ''
    return extracted ? String(extracted) : '-'
  }
  return String(val)
}

function PreviewRow({ label, value, children }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/50 py-2.5 text-sm last:border-0">
      <span className="text-muted-foreground font-normal shrink-0">{label}</span>
      {children ? (
        <div className="text-right">{children}</div>
      ) : (
        <span className="truncate font-medium text-foreground text-right">{renderSafeValue(value)}</span>
      )}
    </div>
  )
}

function ChipsPreview({ items }) {
  if (!items) return <span className="text-muted-foreground font-medium">-</span>
  const arr = Array.isArray(items)
    ? items
    : typeof items === 'string'
      ? items.split(',').map((s) => s.trim()).filter(Boolean)
      : []
  if (arr.length === 0) return <span className="text-muted-foreground font-medium">-</span>

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {arr.map((item, idx) => {
        const text = typeof item === 'object' && item !== null ? item.label || item.name || item.value || '' : String(item)
        if (!text) return null
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

function SectionCard({ title, icon: Icon, children, className = '' }) {
  return (
    <div className={`rounded-xl border border-border/70 bg-card p-5 shadow-xs ${className}`}>
      <div className="mb-3.5 flex items-center gap-2.5 border-b border-border/60 pb-2.5">
        {Icon && <Icon className="size-4.5 text-primary shrink-0" />}
        <h3 className="font-heading font-semibold text-base text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export default function ReviewSubmitStep() {
  const { watch } = useFormContext()
  const values = watch() || {}

  const personal = typeof values.personal === 'object' && values.personal !== null ? values.personal : {}
  const physical = typeof values.physical === 'object' && values.physical !== null ? values.physical : {}
  const astrology = typeof values.astrology === 'object' && values.astrology !== null ? values.astrology : {}
  const education = typeof values.education === 'object' && values.education !== null ? values.education : {}
  const occupation = typeof values.occupation === 'object' && values.occupation !== null ? values.occupation : {}
  const family = typeof values.family === 'object' && values.family !== null ? values.family : {}
  const address = typeof values.address === 'object' && values.address !== null ? values.address : {}
  const communication = typeof values.communication === 'object' && values.communication !== null ? values.communication : {}
  const lifestyle = typeof values.lifestyle === 'object' && values.lifestyle !== null ? values.lifestyle : {}
  const partnerPreference = typeof values.partnerPreference === 'object' && values.partnerPreference !== null ? values.partnerPreference : {}
  const about = typeof values.about === 'object' && values.about !== null ? values.about : (typeof values.aboutMe === 'object' && values.aboutMe !== null ? values.aboutMe : {})
  const photos = typeof values.photos === 'object' && values.photos !== null ? values.photos : {}

  // Computed values safely
  const dob = personal.dob || personal.dateOfBirth || values.dob || values.dateOfBirth
  const age = dob ? calculateAge(dob) : '-'

  const annualIncome =
    occupation.annualIncome ||
    (occupation.monthlyIncome ? Number(occupation.monthlyIncome) * 12 : null) ||
    values.annualIncome

  const familyAnnualIncome =
    family.familyAnnualIncome ||
    (family.familyMonthlyIncome ? Number(family.familyMonthlyIncome) * 12 : null)

  const ageFrom = typeof partnerPreference.ageFrom === 'object' ? partnerPreference.ageFrom?.value : partnerPreference.ageFrom
  const ageTo = typeof partnerPreference.ageTo === 'object' ? partnerPreference.ageTo?.value : partnerPreference.ageTo
  const agePref = ageFrom || ageTo ? `${ageFrom || '-'} to ${ageTo || '-'} Yrs` : (partnerPreference.prefAgeRange || values.prefAgeRange || '-')

  const heightFrom = typeof partnerPreference.heightFrom === 'object' ? partnerPreference.heightFrom?.value : partnerPreference.heightFrom
  const heightTo = typeof partnerPreference.heightTo === 'object' ? partnerPreference.heightTo?.value : partnerPreference.heightTo
  const heightPref = heightFrom || heightTo ? `${heightFrom || '-'} cm to ${heightTo || '-'} cm` : (partnerPreference.prefHeightRange || values.prefHeightRange || '-')

  const getUrl = (item) => {
    if (!item) return ''
    if (typeof item === 'string') return item
    if (typeof item === 'object') return item.url || item.downloadUrl || item.fileUrl || ''
    return ''
  }

  const mainPhotoUrl =
    getUrl(photos.profileImageUrl) ||
    getUrl(photos.main) ||
    getUrl(values.profileImageUrl) ||
    getUrl(values.photoURL) ||
    getUrl(values.profile?.profileImageUrl) ||
    getUrl(values.profile?.photoURL) ||
    null

  const rawGallery = Array.isArray(photos.gallery)
    ? photos.gallery
    : Array.isArray(values.gallery)
      ? values.gallery
      : Array.isArray(values.profile?.gallery)
        ? values.profile.gallery
        : []

  const galleryList = rawGallery.map(getUrl).filter(Boolean)

  const aboutMeText = renderSafeValue(about.bio || about.aboutMe || personal.bio || personal.aboutMe || values.bio || values.aboutMe)
  const aboutFamilyText = renderSafeValue(about.aboutFamily || family.aboutFamily || values.aboutFamily)
  const expectationsText = renderSafeValue(about.expectations || partnerPreference.expectations || values.partnerExpectations || values.expectations)

  const fullNameText = renderSafeValue(personal.fullName || values.fullName || values.name)
  const genderText = renderSafeValue(personal.gender || values.gender)

  const physicallyChallengedFlag =
    physical.isPhysicallyChallenged != null
      ? (physical.isPhysicallyChallenged ? 'Yes' : 'No')
      : (values.isPhysicallyChallenged != null
          ? (values.isPhysicallyChallenged ? 'Yes' : 'No')
          : (physical.physicallyChallenged || values.physicallyChallenged))

  const disabilityDetailsText =
    physical.disabilityDetails ||
    physical.physicallyChallengedDetails ||
    values.disabilityDetails ||
    values.physicallyChallengedDetails ||
    ''

  const doshamFlag =
    astrology.hasDosham != null
      ? (astrology.hasDosham ? 'Yes' : 'No')
      : (values.hasDosham != null
          ? (values.hasDosham ? 'Yes' : 'No')
          : (astrology.dosham || values.dosham))

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Informative Banner */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
          <p className="font-semibold text-primary">Preview Your Complete Profile</p>
          <p className="text-muted-foreground text-xs mt-0.5">
            Review all 12 sections below before publishing. To make changes to any section, use the step tabs above.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 1. Personal Details */}
          <SectionCard title="1. Personal Details" icon={User}>
            {mainPhotoUrl && (
              <div className="mb-3.5 flex items-center gap-3 border-b border-border/50 pb-3">
                <img
                  src={mainPhotoUrl}
                  alt="Profile Thumbnail"
                  className="size-16 rounded-full object-cover border-2 border-primary/30"
                />
                <div>
                  <p className="font-semibold text-sm text-foreground">{fullNameText}</p>
                  <p className="text-xs text-muted-foreground">{genderText} • {age !== '-' ? `${age} Yrs` : '-'}</p>
                </div>
              </div>
            )}
            <PreviewRow label="Full Name" value={personal.fullName || values.fullName || values.name} />
            <PreviewRow label="Gender" value={personal.gender || values.gender} />
            <PreviewRow label="Date of Birth" value={dob ? formatDate(dob) : '-'} />
            <PreviewRow label="Age" value={age !== '-' ? `${age} Yrs` : '-'} />
            <PreviewRow label="Mobile Number" value={personal.mobile || personal.mobileNumber || values.mobile || values.phone} />
            <PreviewRow label="Alternate Phone" value={personal.alternateMobile || personal.alternatePhone || values.alternateMobile || values.alternatePhone} />
            <PreviewRow label="Email" value={personal.email || values.email} />
            <PreviewRow label="Religion" value={personal.religion || values.religion} />
            <PreviewRow label="Caste" value={personal.caste || values.caste} />
            <PreviewRow label="Sub Caste" value={personal.subsect || personal.subCaste || values.subsect || values.subCaste} />
            <PreviewRow label="Mother Tongue" value={personal.motherTongue || values.motherTongue} />
            <PreviewRow label="Marital Status" value={personal.maritalStatus || values.maritalStatus} />
          </SectionCard>

          {/* 2. Physical Details */}
          <SectionCard title="2. Physical Details" icon={Activity}>
            <PreviewRow label="Height" value={physical.heightCm || physical.height || values.heightCm || values.height ? `${physical.heightCm || physical.height || values.heightCm || values.height} cm` : '-'} />
            <PreviewRow label="Weight" value={physical.weightKg || physical.weight || values.weightKg || values.weight ? `${physical.weightKg || physical.weight || values.weightKg || values.weight} kg` : '-'} />
            <PreviewRow label="Body Type" value={physical.bodyType || values.bodyType} />
            <PreviewRow label="Complexion" value={physical.complexion || values.complexion} />
            <PreviewRow label="Blood Group" value={physical.bloodGroup || values.bloodGroup} />
            <PreviewRow
              label="Physical Disability"
              value={
                physicallyChallengedFlag
                  ? `${physicallyChallengedFlag} ${disabilityDetailsText ? `(${disabilityDetailsText})` : ''}`
                  : 'None'
              }
            />
          </SectionCard>

          {/* 3. Astrology Details */}
          <SectionCard title="3. Astrology Details" icon={Moon}>
            <PreviewRow label="Birth Date" value={dob ? formatDate(dob) : '-'} />
            <PreviewRow label="Birth Time" value={astrology.timeOfBirth || astrology.birthTime || values.timeOfBirth || values.birthTime} />
            <PreviewRow label="Birth Place" value={astrology.placeOfBirth || astrology.birthPlace || values.placeOfBirth || values.birthPlace} />
            <PreviewRow label="Raasi / Moon Sign" value={astrology.rasi || astrology.raasi || values.rasi || values.raasi} />
            <PreviewRow label="Star / Nakshatra" value={astrology.star || values.star} />
            <PreviewRow label="Lagnam" value={astrology.lakuna || astrology.lagnam || astrology.lagna || values.lakuna || values.lagnam || values.lagna || '-'} />
            <PreviewRow label="Dosham" value={doshamFlag} />
            <PreviewRow label="Gothram / Koottam" value={astrology.gothram || astrology.gothra || astrology.koottam || values.gothram || values.gothra || values.koottam} />
            <PreviewRow label="Kuladeivam" value={astrology.kulaTheivaTemple || astrology.kuladeivam || values.kulaTheivaTemple || values.kuladeivam} />
          </SectionCard>

          {/* 5. Education & Occupation */}
          <SectionCard title="5. Education & Occupation" icon={GraduationCap}>
            <PreviewRow label="Highest Qualification" value={education.education || education.highestQualification || (typeof education === 'string' ? education : '') || values.educationLevel || (typeof values.education === 'string' ? values.education : '')} />
            <PreviewRow label="Education Details" value={education.educationDetail || education.details || values.educationDetail || values.details} />
            <PreviewRow label="Job Title / Occupation" value={occupation.occupation || occupation.jobTitle || (typeof occupation === 'string' ? occupation : '') || values.jobTitle || (typeof values.occupation === 'string' ? values.occupation : '')} />
            <PreviewRow label="Company / Organization" value={occupation.currentCompany || occupation.organization || occupation.companyName || values.currentCompany || values.organization || values.companyName} />
            <PreviewRow label="Employed In" value={occupation.employedIn || values.employedIn} />
            <PreviewRow label="Monthly Income" value={occupation.monthlyIncome ? formatCurrency(Number(occupation.monthlyIncome)) : '-'} />
            <PreviewRow label="Annual Income" value={annualIncome ? formatCurrency(annualIncome) : '-'} />
            <PreviewRow label="Work Location" value={occupation.workLocation || address.city || values.workLocation || values.city} />
          </SectionCard>

          {/* 4. Horoscope Charts (Full Width) */}
          <SectionCard title="4. Horoscope Charts" icon={Sparkles} className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <h4 className="mb-2 text-center font-bold text-sm text-foreground tamil-text">
                  இராசி கட்டம் (Rasi Horoscope Chart)
                </h4>
                <HoroscopeChart
                  value={astrology.rasiChart || values.rasiChart}
                  readOnly={true}
                  title="இராசி"
                />
              </div>
              <div>
                <h4 className="mb-2 text-center font-bold text-sm text-foreground tamil-text">
                  அம்சகம் கட்டம் (Amsam Horoscope Chart)
                </h4>
                <HoroscopeChart
                  value={astrology.amsamChart || values.amsamChart}
                  readOnly={true}
                  title="அம்சகம்"
                />
              </div>
            </div>
          </SectionCard>

          {/* 6. Family Details */}
          <SectionCard title="6. Family Details" icon={FamilyIcon}>
            <PreviewRow label="Father Name" value={family.fatherName || values.fatherName} />
            <PreviewRow label="Father Occupation" value={family.fatherOccupation || values.fatherOccupation} />
            <PreviewRow label="Mother Name" value={family.motherName || values.motherName} />
            <PreviewRow label="Mother Occupation" value={family.motherOccupation || values.motherOccupation} />
            <PreviewRow label="Brothers" value={family.brothersCount != null && family.brothersCount !== '' ? family.brothersCount : (family.brothers != null && family.brothers !== '' ? family.brothers : values.brothersCount)} />
            <PreviewRow label="Married Brothers" value={family.marriedBrothers || family.brothersMarriedCount || values.marriedBrothers || values.brothersMarriedCount || '-'} />
            <PreviewRow label="Sisters" value={family.sistersCount != null && family.sistersCount !== '' ? family.sistersCount : (family.sisters != null && family.sisters !== '' ? family.sisters : values.sistersCount)} />
            <PreviewRow label="Married Sisters" value={family.marriedSisters || family.sistersMarriedCount || values.marriedSisters || values.sistersMarriedCount || '-'} />
            <PreviewRow label="Family Status" value={family.familyStatus || values.familyStatus} />
            <PreviewRow label="Family Type" value={family.familyType || values.familyType} />
            <PreviewRow label="Family Values" value={family.familyValues || values.familyValues || '-'} />
            <PreviewRow label="Family Annual Income" value={familyAnnualIncome ? formatCurrency(familyAnnualIncome) : '-'} />
          </SectionCard>

          {/* 7. Address & Location */}
          <SectionCard title="7. Address & Location" icon={MapPin}>
            <PreviewRow label="Address" value={address.address || address.addressLine || (typeof address.address === 'string' ? address.address : '') || (typeof values.address === 'string' ? values.address : '')} />
            <PreviewRow label="Village / Town" value={address.village || values.village || '-'} />
            <PreviewRow label="City" value={address.city || values.city} />
            <PreviewRow label="District" value={address.district || values.district} />
            <PreviewRow label="State" value={address.state || values.state} />
            <PreviewRow label="Country" value={address.country || values.country} />
            <PreviewRow label="Postal Code / Pincode" value={address.postalCode || address.pincode || values.postalCode || values.pincode} />
          </SectionCard>

          {/* 8. Communication Details */}
          <SectionCard title="8. Communication Details" icon={PhoneCall}>
            <PreviewRow label="WhatsApp Number" value={communication.whatsappNumber || values.whatsappNumber || personal.mobile || personal.mobileNumber || values.mobileNumber} />
            <PreviewRow label="Alternate Mobile" value={communication.alternateMobile || personal.alternateMobile || personal.alternatePhone || values.alternateMobile || values.alternatePhone || '-'} />
            <PreviewRow label="Alternate Email" value={communication.alternateEmail || values.alternateEmail} />
            <PreviewRow label="Preferred Contact Time" value={communication.bestTimeToContact || values.bestTimeToContact} />
          </SectionCard>

          {/* 9. Lifestyle & Habits */}
          <SectionCard title="9. Lifestyle & Habits" icon={Heart}>
            <PreviewRow label="Diet" value={lifestyle.eatingHabits || lifestyle.diet || values.eatingHabits || values.diet} />
            <PreviewRow label="Smoking" value={lifestyle.smokingHabits || lifestyle.smoking || values.smokingHabits || values.smoking} />
            <PreviewRow label="Drinking" value={lifestyle.drinkingHabits || lifestyle.drinking || values.drinkingHabits || values.drinking} />
            <PreviewRow label="Hobbies">
              <ChipsPreview items={lifestyle.hobbies || values.hobbies} />
            </PreviewRow>
            <PreviewRow label="Interests">
              <ChipsPreview items={lifestyle.interests || values.interests} />
            </PreviewRow>
            <PreviewRow label="Languages Known">
              <ChipsPreview items={lifestyle.spokenLanguages || lifestyle.languagesKnown || values.spokenLanguages || personal.motherTongue || values.motherTongue} />
            </PreviewRow>
          </SectionCard>

          {/* 10. Partner Preference */}
          <SectionCard title="10. Partner Preference" icon={UserCheck}>
            <PreviewRow label="Age Preference" value={agePref} />
            <PreviewRow label="Height Preference" value={heightPref} />
            <PreviewRow label="Religion Preference" value={partnerPreference.religion || values.prefReligion} />
            <PreviewRow label="Caste Preference" value={partnerPreference.caste || values.prefCaste || '-'} />
            <PreviewRow label="Education Preference" value={partnerPreference.education || values.prefEducation} />
            <PreviewRow label="Occupation Preference" value={partnerPreference.occupation || values.prefOccupation} />
            <PreviewRow label="Location Preference" value={partnerPreference.prefCountry || partnerPreference.location || values.prefCountry || values.prefLocation} />
            <PreviewRow label="Partner Expectations" value={partnerPreference.partnerExpectations || partnerPreference.expectations || values.partnerExpectations || values.expectations} />
          </SectionCard>

          {/* 11. About Me */}
          <SectionCard title="11. About Me" icon={FileText}>
            <div className="space-y-3 pt-1">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">About Me</p>
                <p className="mt-1 text-sm text-foreground whitespace-pre-wrap bg-muted/40 rounded-lg p-3 border border-border/60">
                  {aboutMeText}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">About Family</p>
                <p className="mt-1 text-sm text-foreground whitespace-pre-wrap bg-muted/40 rounded-lg p-3 border border-border/60">
                  {aboutFamilyText}
                </p>
              </div>
            </div>
          </SectionCard>

          {/* 12. Photos (Full Width) */}
          <SectionCard title="12. Photos" icon={ImageIcon} className="lg:col-span-2">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Main Profile Photo</p>
                {mainPhotoUrl ? (
                  <img
                    src={mainPhotoUrl}
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
                  Gallery Photo Grid ({galleryList.length})
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
          </SectionCard>
        </div>
      </div>
    </ErrorBoundary>
  )
}


