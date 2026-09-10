import express from 'express'
import jwt from 'jsonwebtoken'
import { authenticateToken } from '../middleware/authMiddleware.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'kongu_matrimony_super_secure_jwt_secret_key_2026'

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const adminUser = {
    id: 'admin_1',
    email,
    name: 'Kongu Admin',
    role: 'superadmin',
  }

  const token = jwt.sign(adminUser, JWT_SECRET, { expiresIn: '7d' })

  res.json({
    token,
    user: adminUser,
    message: 'Login successful',
  })
})

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    user: req.user,
    isAuthenticated: true,
  })
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' })
})

export default router
