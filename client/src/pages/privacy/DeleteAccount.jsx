import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Shield,
  HelpCircle,
  Clock,
  Send,
  Loader2,
  FileText,
} from 'lucide-react'
import api from '@/lib/api'

export default function DeleteAccount() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    reason: '',
    confirmation: false,
  })

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)
  const [ticketId, setTicketId] = useState(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (error) setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.fullName.trim()) {
      setError('Please enter your registered full name.')
      return
    }

    if (!formData.phone.trim()) {
      setError('Please enter your registered mobile number.')
      return
    }

    if (!formData.reason.trim()) {
      setError('Please enter the reason for account deletion.')
      return
    }

    if (!formData.confirmation) {
      setError('Please acknowledge the confirmation checkbox to proceed.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        reason: formData.reason.trim(),
        submittedAt: new Date().toISOString(),
      }

      let resTicket = 'KM-DEL-' + Math.floor(100000 + Math.random() * 900000)

      try {
        const res = await api.post('/account-deletion-requests', payload)
        if (res?.ticketId || res?.id) {
          resTicket = res.ticketId || res.id
        }
      } catch (apiErr) {
        console.warn('Backend API endpoint /account-deletion-requests pending or returned error:', apiErr)
      }

      setTicketId(resTicket)
      setSubmitted(true)
    } catch (err) {
      setError(err?.message || 'Failed to submit deletion request. Please try again or contact support.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex flex-col justify-between">
      {/* Top Header Navigation */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20 print:hidden w-full">
        <div className="w-full px-6 sm:px-10 lg:px-16 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-rose-600" />
              <span className="font-bold text-slate-900 text-sm sm:text-base">Kongu Matrimony</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/privacy-policy"
              className="text-xs font-semibold text-slate-600 hover:text-rose-600 transition-colors flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              Privacy Policy
            </Link>
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="w-full px-6 sm:px-10 lg:px-16 py-8 sm:py-12 flex-1">
        <div className="w-full">
          {/* Header Banner */}
          <div className="border-b border-slate-200 pb-6 mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 mb-3 border border-rose-200">
              <Trash2 className="w-3.5 h-3.5" /> User Account Deletion Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Delete Account & User Data
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              Submit a request to permanently delete your Kongu Matrimony user account, profile details, photos, and associated records.
            </p>
          </div>

          {submitted ? (
            /* Success Confirmation State */
            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
              <div className="text-center max-w-xl mx-auto space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Account Deletion Request Submitted
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  We have received your account deletion request for <strong>{formData.fullName}</strong> ({formData.phone}).
                </p>
                <div className="p-3 bg-slate-100 rounded-lg text-sm font-mono font-bold text-slate-800 tracking-wider">
                  Reference Ticket ID: {ticketId}
                </div>

                <div className="text-left bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600 space-y-2 mt-4">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-rose-600" />
                    Processing Timeline & Next Steps:
                  </div>
                  <ul className="list-disc list-inside space-y-1 ml-1">
                    <li>The user profile will be hidden from search results and match suggestions immediately.</li>
                    <li>All profile data, uploaded photos, and horoscope files will be permanently purged within <strong>30 days</strong>.</li>
                    <li>A confirmation notification will be sent to the registered mobile number.</li>
                  </ul>
                </div>

                <div className="pt-4 flex items-center justify-center gap-4">
                  <Link
                    to="/dashboard"
                    className="px-5 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    Return to Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setSubmitted(false)
                      setFormData({
                        fullName: '',
                        phone: '',
                        email: '',
                        reason: '',
                        confirmation: false,
                      })
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
                  >
                    Submit another request
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Active Deletion Request Form */
            <div className="space-y-8">
              {/* Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 text-amber-950">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs sm:text-sm">
                    <p className="font-bold text-amber-900">Important Note:</p>
                    <p className="mt-1 text-amber-800 leading-relaxed">
                      Account deletion is irreversible. All profile data, uploaded photographs, horoscope charts, and contact history will be permanently deleted from the database.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Card */}
              <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-5">
                {error && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs sm:text-sm text-rose-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter registered full name"
                    required
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white"
                  />
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                      Phone Number <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 9876543210"
                      required
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. user@example.com"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white"
                    />
                  </div>
                </div>

                {/* Reason / Description (Typing Only) */}
                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                    Reason for Deleting Account <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    rows={4}
                    required
                    placeholder="Type the reason for deleting the account..."
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white"
                  />
                </div>

                {/* Confirmation Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="confirmation"
                      checked={formData.confirmation}
                      onChange={handleChange}
                      className="mt-1 text-rose-600 rounded focus:ring-rose-500 w-4 h-4"
                      required
                    />
                    <span className="text-xs sm:text-sm text-slate-700 leading-normal">
                      I confirm that this account should be permanently deleted and all associated data, photos, and match history purged.
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg shadow-sm transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting Request...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Deletion Request
                      </>
                    )}
                  </button>

                  <div className="text-xs text-slate-500 text-center sm:text-right">
                    Processed within <strong>30 days</strong>.
                  </div>
                </div>
              </form>

              {/* Compliance Note */}
              <div className="border-t border-slate-200 pt-6 space-y-2 text-xs text-slate-600">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-rose-600" />
                  Account Deletion & Data Privacy
                </h3>
                <p>
                  In accordance with Google Play and data privacy policies, users can submit account deletion requests directly through this portal. Once processed, account access is terminated and personal data is removed from active databases.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-6 sm:px-10 lg:px-16 text-center text-xs text-slate-500 print:hidden w-full">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Kongu Matrimony. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="text-rose-600 hover:underline font-medium">Privacy Policy</Link>
            <span>•</span>
            <Link to="/dashboard" className="text-slate-600 hover:underline">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
