import express from 'express'
import { optionalAuth } from '../middleware/authMiddleware.js'

const router = express.Router()

let payments = []

// GET /api/payments
router.get('/', optionalAuth, (req, res) => {
  const { status, search, page = 1, pageSize = 20 } = req.query
  let filtered = [...payments]

  if (status && status !== 'all') {
    filtered = filtered.filter((p) => p.status === status)
  }

  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.userName?.toLowerCase().includes(q) ||
        p.userPhone?.includes(q) ||
        p.id?.toLowerCase().includes(q) ||
        p.transactionId?.toLowerCase().includes(q)
    )
  }

  res.json({
    payments: filtered,
    total: filtered.length,
    page: Number(page),
    pageSize: Number(pageSize),
  })
})

// GET /api/payments/:id
router.get('/:id', optionalAuth, (req, res) => {
  const payment = payments.find((p) => p.id === req.params.id)
  if (!payment) return res.status(404).json({ error: 'Payment not found' })
  res.json(payment)
})

// POST /api/payments
router.post('/', (req, res) => {
  const newPayment = {
    id: 'PAY-' + Math.floor(1000 + Math.random() * 9000),
    ...req.body,
    status: req.body.status || 'success',
    date: new Date().toISOString(),
  }
  payments.unshift(newPayment)
  res.status(201).json(newPayment)
})

// PATCH /api/payments/:id/success
router.patch('/:id/success', (req, res) => {
  const index = payments.findIndex((p) => p.id === req.params.id)
  if (index === -1) return res.status(404).json({ error: 'Payment not found' })
  payments[index].status = 'success'
  res.json(payments[index])
})

// PATCH /api/payments/:id/failed
router.patch('/:id/failed', (req, res) => {
  const index = payments.findIndex((p) => p.id === req.params.id)
  if (index === -1) return res.status(404).json({ error: 'Payment not found' })
  payments[index].status = 'failed'
  res.json(payments[index])
})

export default router
