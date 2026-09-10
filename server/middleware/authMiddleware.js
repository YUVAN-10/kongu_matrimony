import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'kongu_matrimony_super_secure_jwt_secret_key_2026'

/**
 * Middleware to verify JWT Bearer Token in Authorization header.
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    })
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET)
    req.user = verified
    next()
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    })
  }
}

/**
 * Optional authentication middleware.
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    req.user = null
    return next()
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET)
    req.user = verified
  } catch {
    req.user = null
  }
  next()
}
