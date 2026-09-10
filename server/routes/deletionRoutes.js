import express from 'express'

const router = express.Router()

let deletionRequests = []

// POST /api/account-deletion-requests - Submit Play Store account deletion request
router.post('/', (req, res) => {
  const { fullName, phone, email, reason } = req.body

  if (!fullName || !phone || !reason) {
    return res.status(400).json({
      error: 'Full name, registered phone number, and reason are required.',
    })
  }

  const ticketId = 'KM-DEL-' + Math.floor(100000 + Math.random() * 900000)

  const newRequest = {
    ticketId,
    fullName,
    phone,
    email: email || '',
    reason,
    status: 'pending_processing',
    requestedAt: new Date().toISOString(),
    scheduledPurgeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }

  deletionRequests.unshift(newRequest)
  console.log(`[Account Deletion Request] Ticket ${ticketId} created for ${fullName} (${phone})`)

  res.status(201).json({
    success: true,
    ticketId,
    message: 'Account deletion request received successfully. Data will be purged within 30 days.',
    request: newRequest,
  })
})

// GET /api/account-deletion-requests - Admin view requests
router.get('/', (req, res) => res.json(deletionRequests))

export default router
