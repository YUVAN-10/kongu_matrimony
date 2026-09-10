import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Printer, Shield } from 'lucide-react'

export default function PrivacyPolicy() {
  const handlePrint = () => {
    const originalTitle = document.title
    document.title = 'Kongu_Matrimony_Privacy_Policy'
    window.print()
    setTimeout(() => {
      document.title = originalTitle
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 antialiased font-sans">
      {/* Top Navigation Bar (Hidden in PDF/Print) */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-20 print:hidden w-full">
        <div className="w-full px-6 sm:px-10 lg:px-16 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-rose-600" />
              <span className="font-bold text-slate-900 text-sm sm:text-base">Kongu Matrimony</span>
            </div>
          </div>

          <button
            onClick={handlePrint}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Download / Print PDF
          </button>
        </div>
      </header>

      {/* Main Full-Page Document */}
      <main className="w-full px-6 sm:px-10 lg:px-16 py-8 sm:py-12 leading-relaxed print:p-0 print:py-0">
        {/* Document Header */}
        <div className="border-b border-slate-300 pb-5 mb-8 print:mb-6 print:pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Kongu Matrimony — Privacy Policy
              </h1>
              <p className="mt-1 text-sm text-slate-600 font-medium">
                Official User Data Protection & Privacy Guidelines
              </p>
            </div>
          </div>
        </div>

        {/* Continuous Flow Document Body */}
        <div className="space-y-7 text-slate-700 text-sm sm:text-base print:text-[10pt] print:space-y-5">
          {/* Introduction */}
          <section className="print:break-inside-avoid">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
              1. Introduction
            </h2>
            <p className="mb-2">
              Welcome to <strong>Kongu Matrimony</strong> ("we," "our," "us," or the "Platform"). We provide a matrimonial matchmaking service designed to help community members find prospective life partners.
            </p>
            <p>
              Your privacy is of paramount importance to us. This Privacy Policy outlines the personal information we collect, how it is processed, how it is safeguarded, and the rights you retain regarding your data across our mobile applications and web platform.
            </p>
          </section>

          {/* Eligibility */}
          <section className="print:break-inside-avoid">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
              2. Eligibility & Legal Age (18+)
            </h2>
            <p className="mb-2">
              Kongu Matrimony is strictly intended for individuals who are legally eligible to marry under the applicable marriage laws in India:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-slate-700">
              <li>Female members must be at least <strong>18 years of age</strong>.</li>
              <li>Male members must be at least <strong>21 years of age</strong>.</li>
              <li>Accounts registered on behalf of minors will be immediately terminated.</li>
            </ul>
          </section>

          {/* Information Collected */}
          <section className="print:break-inside-avoid">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
              3. Information We Collect
            </h2>
            <p className="mb-2">
              To deliver accurate matchmaking suggestions and profile verification, we collect:
            </p>
            <div className="space-y-2 ml-2">
              <p>
                <strong>A. Personal & Matrimonial Details:</strong> Full name, gender, date of birth, marital status, native place, sub-caste/kulam, gothram, and religious background.
              </p>
              <p>
                <strong>B. Contact Details:</strong> Mobile number, email address, physical location/city, and parent/guardian contact numbers.
              </p>
              <p>
                <strong>C. Education & Career Information:</strong> Highest qualification, college/institution, occupation, employer, and annual income bracket.
              </p>
              <p>
                <strong>D. Photographs & Astrological (Horoscope) Data:</strong> User-uploaded profile photos, horoscope charts (Jathagam/Kundli), Rasi, Nakshatram, and Dosham details for astrological compatibility matching.
              </p>
              <p>
                <strong>E. Payment Information:</strong> Subscription transaction details are handled through certified third-party payment gateways. <em>Card numbers and CVVs are never stored on our servers.</em>
              </p>
              <p>
                <strong>F. Technical Data:</strong> Device model, OS version, IP address, and crash reports to ensure platform stability.
              </p>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="print:break-inside-avoid">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
              4. How We Use Your Information
            </h2>
            <ul className="list-disc list-inside space-y-1 ml-2 text-slate-700">
              <li>To create and manage your profile and recommend compatible matches.</li>
              <li>To verify user authenticity via OTP and prevent fraudulent accounts.</li>
              <li>To deliver real-time notifications, match alerts, and administrative updates.</li>
              <li>To provide customer support and process member change requests.</li>
            </ul>
          </section>

          {/* Data Sharing & Third Parties */}
          <section className="print:break-inside-avoid">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
              5. Data Sharing & Privacy Controls
            </h2>
            <div className="space-y-2">
              <p>
                <strong>Visibility to Registered Members:</strong> Matrimonial details, photos, and horoscope charts are visible only to verified members for matchmaking.
              </p>
              <p>
                <strong>Contact Number Privacy:</strong> Direct contact details are masked and disclosed only upon mutual interest or active subscription permissions.
              </p>
              <p>
                <strong>No Commercial Sale of Data:</strong> We do <strong>NOT sell, rent, or trade</strong> your personal information to third-party telemarketers or advertisers.
              </p>
              <p>
                <strong>Service Partners:</strong> We work with trusted vendors (cloud hosting, SMS gateways, payment processors) under strict non-disclosure obligations.
              </p>
            </div>
          </section>

          {/* Mobile App Permissions */}
          <section className="print:break-inside-avoid">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
              6. Mobile App Permissions (Google Play Disclosures)
            </h2>
            <ul className="list-disc list-inside space-y-1.5 ml-2 text-slate-700">
              <li><strong>Camera & Photos / Storage:</strong> Used strictly when you take or upload profile pictures, family photos, or horoscope documents.</li>
              <li><strong>Push Notifications:</strong> Used to alert you of new matches, interest requests, and messages.</li>
              <li><strong>SMS / Phone State:</strong> Used solely for automatic OTP verification during login/registration.</li>
              <li><strong>Internet & Network Access:</strong> Required to securely connect to our servers.</li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="print:break-inside-avoid">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
              7. Data Security & Storage
            </h2>
            <p>
              We enforce industry-standard security safeguards, including HTTPS (TLS 1.2/1.3) encryption in transit, strict administrative access controls, and hashed authentication records.
            </p>
          </section>

          {/* Account Deletion Rights */}
          <section className="print:break-inside-avoid">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
              8. Account & Data Deletion Rights (Google Play Policy)
            </h2>
            <p className="mb-2">
              Users retain full rights to delete their profile and personal records at any time:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-slate-700">
              <li>
                <strong>In-App Deletion:</strong> Go to <em>Profile &rarr; Settings &rarr; Privacy &rarr; Delete Account</em>.
              </li>
              <li>
                <strong>Web Portal:</strong> Submit a request via our online Account Deletion page.
              </li>
              <li>
                <strong>Email Request:</strong> Send an email to <span className="font-semibold text-slate-900">support@kongumatrimony.com</span> with your registered phone number.
              </li>
            </ul>
            <p className="mt-2 text-xs text-slate-600">
              Personal data, photos, and horoscope files are permanently removed from active databases within <strong>30 days</strong> of confirmation.
            </p>
          </section>

          {/* Grievance & Contact */}
          <section className="border-t border-slate-300 pt-5 print:break-inside-avoid">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
              9. Grievance Officer & Support Contact
            </h2>
            <div className="space-y-1 ml-2 text-slate-700">
              <p><strong>Grievance Officer:</strong> Kongu Matrimony Redressal Cell</p>
              <p><strong>Grievance Email:</strong> grievance@kongumatrimony.com</p>
              <p><strong>Support Email:</strong> support@kongumatrimony.com</p>
              <p><strong>Helpline:</strong> +91 98765 43210</p>
              <p><strong>Address:</strong> Kongu Matrimony Services, Tamil Nadu, India</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer (Hidden in Print) */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 px-6 sm:px-10 lg:px-16 text-center text-xs text-slate-500 print:hidden w-full">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Kongu Matrimony. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-rose-600 hover:underline font-medium">Dashboard</Link>
            <span>•</span>
            <button onClick={handlePrint} type="button" className="text-slate-600 hover:underline">Print / Save PDF</button>
          </div>
        </div>
      </footer>
    </div>
  )
}
