import express from 'express'
import { optionalAuth } from '../middleware/authMiddleware.js'

const router = express.Router()

let plans = []

let userSubscriptions = []

// Plans
router.get('/plans', optionalAuth, (req, res) => res.json(plans))
router.post('/plans', (req, res) => {
  const newPlan = { id: 'PLAN-' + (plans.length + 1), ...req.body, isActive: true }
  plans.push(newPlan)
  res.status(201).json(newPlan)
})
router.put('/plans/:id', (req, res) => {
  const index = plans.findIndex((p) => p.id === req.params.id)
  if (index === -1) return res.status(404).json({ error: 'Plan not found' })
  plans[index] = { ...plans[index], ...req.body }
  res.json(plans[index])
})
router.delete('/plans/:id', (req, res) => {
  plans = plans.filter((p) => p.id !== req.params.id)
  res.json({ message: 'Plan deleted successfully' })
})

// User Subscriptions
router.get('/user-subscriptions', optionalAuth, (req, res) => res.json(userSubscriptions))
router.post('/user-subscriptions', (req, res) => {
  const newSub = {
    id: 'USUB-' + Math.floor(1000 + Math.random() * 9000),
    ...req.body,
    status: 'active',
    startDate: new Date().toISOString(),
  }
  userSubscriptions.unshift(newSub)
  res.status(201).json(newSub)
})

export default router
