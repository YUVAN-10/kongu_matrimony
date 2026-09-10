import { formatDate } from '@/utils/helpers'

// Human labels for the known profile schema (see profiles/{profileId} — the
// same dot-paths ViewProfile.jsx renders). Any path not listed here falls
// back to a humanized version of its last segment, so a schema field added
// later still displays reasonably instead of breaking this page.
const FIELD_LABELS = {
  'personal.fullName': 'Full Name',
  'personal.gender': 'Gender',
  'personal.dob': 'Date of Birth',
  'personal.mobileNumber': 'Mobile Number',
  'personal.alternatePhone': 'Alternate Phone',
  'personal.email': 'Email',
  'personal.maritalStatus': 'Marital Status',
  'personal.religion': 'Religion',
  'personal.motherTongue': 'Mother Tongue',
  'physical.heightCm': 'Height (cm)',
  'physical.weightKg': 'Weight (kg)',
  'physical.bodyType': 'Body Type',
  'physical.complexion': 'Complexion',
  'physical.bloodGroup': 'Blood Group',
  'physical.physicallyChallenged': 'Physically Challenged',
  'astrology.birthTime': 'Birth Time',
  'astrology.birthPlace': 'Birth Place',
  'astrology.star': 'Star / Nakshatra',
  'astrology.raasi': 'Raasi / Moon Sign',
  'astrology.gothra': 'Gothra',
  'astrology.dosham': 'Dosham',
  'education.highestQualification': 'Highest Qualification',
  'education.details': 'Education Details',
  'occupation.jobTitle': 'Occupation',
  'occupation.employedIn': 'Employed In',
  'occupation.organization': 'Organization',
  'occupation.monthlyIncome': 'Monthly Income',
  'occupation.annualIncome': 'Annual Income',
  'family.fatherName': "Father's Name",
  'family.fatherOccupation': "Father's Occupation",
  'family.motherName': "Mother's Name",
  'family.motherOccupation': "Mother's Occupation",
  'family.brothers': 'Brothers',
  'family.sisters': 'Sisters',
  'family.familyType': 'Family Type',
  'family.familyStatus': 'Family Status',
  'family.familyMonthlyIncome': 'Family Monthly Income',
  'family.familyAnnualIncome': 'Family Annual Income',
  'address.addressLine': 'Address',
  'address.city': 'City',
  'address.district': 'District',
  'address.state': 'State',
  'address.country': 'Country',
  'address.pincode': 'Pincode',
  'communication.preferredContactMethod': 'Preferred Contact',
  'communication.whatsappNumber': 'WhatsApp Number',
  'lifestyle.diet': 'Diet',
  'lifestyle.smoking': 'Smoking',
  'lifestyle.drinking': 'Drinking',
  'lifestyle.hobbies': 'Hobbies',
  'lifestyle.interests': 'Interests',
  'partnerPreference.ageFrom': 'Preferred Age From',
  'partnerPreference.ageTo': 'Preferred Age To',
  'partnerPreference.religion': 'Preferred Religion',
  'partnerPreference.education': 'Preferred Education',
  'partnerPreference.occupation': 'Preferred Occupation',
  'partnerPreference.location': 'Preferred Location',
  'partnerPreference.expectations': 'Other Expectations',
  'about.aboutMe': 'About Me',
  'about.expectations': 'Expectations',
  'photos.main': 'Main Photo',
  'photos.gallery': 'Gallery Photos',
}

function humanizeFieldPath(path) {
  const segment = path.split('.').pop()
  const spaced = segment.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

function isPhotoField(path) {
  return path.startsWith('photos.')
}

function PhotoValue({ value }) {
  if (!value) {
    return <span className="text-sm text-muted-foreground italic">None</span>
  }
  const items = Array.isArray(value) ? value : [value]
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <img
          key={item?.path || item?.url || index}
          src={item?.url || item}
          alt=""
          className="size-16 rounded-lg border border-border object-cover"
        />
      ))}
    </div>
  )
}

function formatScalarValue(value) {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (value?.toDate) return formatDate(value)
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export default function ChangeComparison({ changes }) {
  const entries = Object.entries(changes || {})

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No changed fields recorded on this request.</p>
  }

  return (
    <div className="divide-y divide-border rounded-lg border border-border">
      {entries.map(([path, change]) => {
        const label = FIELD_LABELS[path] || humanizeFieldPath(path)
        const photo = isPhotoField(path)

        return (
          <div key={path} className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_2fr]">
            <div className="text-sm font-semibold text-foreground">{label}</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Current</p>
                {photo ? (
                  <PhotoValue value={change?.oldValue} />
                ) : (
                  <p className="text-sm text-foreground">{formatScalarValue(change?.oldValue)}</p>
                )}
              </div>
              <div className="space-y-1 rounded-md bg-primary/5 p-2 -m-2">
                <p className="text-xs font-medium tracking-wide text-primary uppercase">Requested</p>
                {photo ? (
                  <PhotoValue value={change?.newValue} />
                ) : (
                  <p className="text-sm font-medium text-foreground">{formatScalarValue(change?.newValue)}</p>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
