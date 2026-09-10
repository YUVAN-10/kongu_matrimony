import express from 'express'
import { optionalAuth } from '../middleware/authMiddleware.js'

const router = express.Router()

// User repository (Connect with MongoDB / PostgreSQL / MySQL)
let users = []

// GET /api/users - List with search, filtering, and pagination
router.get('/', optionalAuth, (req, res) => {
  const { search, status, gender, page = 1, pageSize = 20 } = req.query
  let filtered = [...users]

  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.phone?.includes(q) ||
        u.id?.toLowerCase().includes(q) ||
        u.city?.toLowerCase().includes(q)
    )
  }

  if (status && status !== 'all') {
    filtered = filtered.filter((u) => u.status === status)
  }

  if (gender && gender !== 'all') {
    filtered = filtered.filter((u) => u.gender?.toLowerCase() === gender.toLowerCase())
  }

  const total = filtered.length
  const startIndex = (page - 1) * pageSize
  const paginated = filtered.slice(startIndex, startIndex + Number(pageSize))

  res.json({
    users: paginated,
    total,
    page: Number(page),
    pageSize: Number(pageSize),
  })
})

// GET /api/users/:id
router.get('/:id', optionalAuth, (req, res) => {
  const user = users.find((u) => u.id === req.params.id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json(user)
})

// POST /api/users
router.post('/', (req, res) => {
  const newUser = {
    id: 'USR-' + Math.floor(1000 + Math.random() * 9000),
    ...req.body,
    status: 'active',
    isApproved: true,
    createdAt: new Date().toISOString(),
  }
  users.unshift(newUser)
  res.status(201).json(newUser)
})

// PUT /api/users/:id
router.put('/:id', (req, res) => {
  const index = users.findIndex((u) => u.id === req.params.id)
  if (index === -1) return res.status(404).json({ error: 'User not found' })
  users[index] = { ...users[index], ...req.body, updatedAt: new Date().toISOString() }
  res.json(users[index])
})

// PATCH /api/users/:id/block
router.patch('/:id/block', (req, res) => {
  const index = users.findIndex((u) => u.id === req.params.id)
  if (index === -1) return res.status(404).json({ error: 'User not found' })
  users[index].status = 'blocked'
  res.json({ message: 'User blocked successfully', user: users[index] })
})

// PATCH /api/users/:id/unblock
router.patch('/:id/unblock', (req, res) => {
  const index = users.findIndex((u) => u.id === req.params.id)
  if (index === -1) return res.status(404).json({ error: 'User not found' })
  users[index].status = 'active'
  res.json({ message: 'User unblocked successfully', user: users[index] })
})

// DELETE /api/users/:id
router.delete('/:id', (req, res) => {
  const index = users.findIndex((u) => u.id === req.params.id)
  if (index === -1) return res.status(404).json({ error: 'User not found' })
  const deleted = users.splice(index, 1)[0]
  res.json({ message: 'User deleted successfully', deleted })
})

export default router
