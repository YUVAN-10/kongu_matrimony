import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CircleAlert, EyeOff, Pencil, RotateCcw, Trash2, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import ProfileSection from '@/components/profiles/ProfileSection'
import ProfileStatusBadge from '@/components/profiles/ProfileStatusBadge'
import DeleteProfileDialog from '@/components/profiles/DeleteProfileDialog'
import { getProfileById, hideProfile, restoreProfile, softDeleteProfile } from '@/services/profileService'
import { useAuth } from '@/hooks/useAuth'
import { calculateAge, formatCurrency, formatDate } from '@/utils/helpers'

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium text-foreground">{value ?? '—'}</span>
    </div>
  )
}

export default function ViewProfile() {
  const { profileId } = useParams()
  const navigate = useNavigate()
  const { currentAdmin } = useAuth()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getProfileById(profileId)
      .then((data) => {
        if (cancelled) return
        if (!data) setError('Profile not found.')
        else setProfile(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load profile.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [profileId])

  async function handleHide() {
    await hideProfile(profileId, { admin: currentAdmin })
    setProfile((prev) => ({ ...prev, system: { ...prev.system, status: 'hidden' } }))
  }
  async function handleRestore() {
    await restoreProfile(profileId, { admin: currentAdmin })
    setProfile((prev) => ({ ...prev, system: { ...prev.system, status: 'active' } }))
  }
  async function handleDeleteConfirm() {
    await softDeleteProfile(profileId, { admin: currentAdmin })
    navigate('/profiles', { state: { successMessage: 'Profile deleted.' } })
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div
        role="alert"
        className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      >
        <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>{error || 'Profile not found.'}</span>
      </div>
    )
  }

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
    system = {},
  } = profile

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center overflow-hidden rounded-full bg-muted">
            {photos.main?.url ? (
              <img src={photos.main.url} alt="" className="size-full object-cover" />
            ) : (
              <UserRound className="size-7 text-muted-foreground" aria-hidden="true" />
            )}
          </div>
          <div>
            <h1 className="font-heading text-2xl font-semibold text-foreground">
              {personal.fullName || 'Unnamed Profile'}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <ProfileStatusBadge status={system.status} />
              <span className="text-xs text-muted-foreground">ID: {profile.id}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to={`/profiles/${profileId}/edit`}>
              <Pencil className="size-4" aria-hidden="true" />
              Edit
            </Link>
          </Button>
          {system.status === 'active' && (
            <Button variant="outline" size="sm" onClick={handleHide} className="gap-1.5">
              <EyeOff className="size-4" aria-hidden="true" />
              Hide
            </Button>
          )}
          {(system.status === 'hidden' || system.status === 'deleted') && (
            <Button variant="outline" size="sm" onClick={handleRestore} className="gap-1.5">
              <RotateCcw className="size-4" aria-hidden="true" />
              Restore
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Delete
          </Button>
        </div>
      </div>

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
            value={
              partnerPreference.ageFrom && `${partnerPreference.ageFrom} - ${partnerPreference.ageTo || '—'} yrs`
            }
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
            {photos.main?.url && (
              <img src={photos.main.url} alt="Main" className="size-24 rounded-lg object-cover" />
            )}
            {(photos.gallery || []).map((item) => (
              <img key={item.path} src={item.url} alt="" className="size-24 rounded-lg object-cover" />
            ))}
            {!photos.main?.url && (!photos.gallery || photos.gallery.length === 0) && (
              <p className="text-sm text-muted-foreground">No photos uploaded.</p>
            )}
          </div>
        </ProfileSection>
      </div>

      <p className="text-xs text-muted-foreground">
        Created by {system.createdBy || 'Unknown'} on {formatDate(system.createdAt)}
        {system.publishedAt && ` · Published ${formatDate(system.publishedAt)}`}
      </p>

      <DeleteProfileDialog
        profile={profile}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
