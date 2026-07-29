import { useFormContext } from 'react-hook-form'
import ProfileSection from '@/components/profiles/ProfileSection'
import { calculateAge, formatCurrency } from '@/utils/helpers'

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium text-foreground">{value || '—'}</span>
    </div>
  )
}

// Read-only summary of everything entered so far. Reuses ProfileSection so
// this looks identical to ViewProfile.jsx's own read-only display — the two
// share the same visual language deliberately.
export default function ReviewSubmitStep() {
  const { watch } = useFormContext()
  const values = watch()
  const { personal = {}, physical = {}, occupation = {}, family = {}, address = {}, photos = {} } = values

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Review the details below. Click any step above to go back and edit — nothing here is
        final until you Publish (or Save as Draft to finish later).
      </p>

      <ProfileSection title="Personal">
        <Row label="Full Name" value={personal.fullName} />
        <Row label="Gender" value={personal.gender} />
        <Row label="Age" value={calculateAge(personal.dob)} />
        <Row label="Mobile Number" value={personal.mobileNumber} />
        <Row label="Religion" value={personal.religion} />
      </ProfileSection>

      <ProfileSection title="Physical & Occupation">
        <Row label="Height / Weight" value={physical.heightCm && `${physical.heightCm} cm / ${physical.weightKg || '—'} kg`} />
        <Row label="Occupation" value={occupation.jobTitle} />
        <Row
          label="Monthly / Annual Income"
          value={occupation.monthlyIncome && `${formatCurrency(occupation.monthlyIncome)} / ${formatCurrency(occupation.annualIncome)}`}
        />
      </ProfileSection>

      <ProfileSection title="Family & Address">
        <Row label="Father's Name" value={family.fatherName} />
        <Row label="Family Type" value={family.familyType} />
        <Row label="City" value={address.city} />
      </ProfileSection>

      <ProfileSection title="Photos">
        <Row label="Main Photo" value={photos.main ? 'Uploaded' : 'Not uploaded yet'} />
        <Row label="Gallery" value={`${photos.gallery?.length || 0} photo(s)`} />
      </ProfileSection>
    </div>
  )
}
