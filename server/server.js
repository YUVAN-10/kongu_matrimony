import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import subscriptionRoutes from './routes/subscriptionRoutes.js'
import deletionRoutes from './routes/deletionRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  next()
})

// CORS configuration
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
)

app.use(express.json({ limit: '15mb' }))
app.use(express.urlencoded({ extended: true, limit: '15mb' }))

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Kongu Matrimony REST API Server',
    timestamp: new Date().toISOString(),
  })
})

// Centralized API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/subscription-plans', subscriptionRoutes)
app.use('/api/user-subscriptions', subscriptionRoutes)
app.use('/api/account-deletion-requests', deletionRoutes)

// Fallbacks
app.get('/api/new-profile-approvals', (req, res) => res.json([]))
app.get('/api/profile-change-requests', (req, res) => res.json([]))

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` })
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err)
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' })
})

app.listen(PORT, () => {
  console.log(`🚀 Kongu Matrimony Server running on http://localhost:${PORT}`)
  console.log(`📡 Health check at: http://localhost:${PORT}/api/health`)
})
