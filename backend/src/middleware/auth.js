const jwt = require('jsonwebtoken')
const env = require('../config/env')
const { prisma } = require('../config/db')
const { ApiError, asyncHandler } = require('../utils/http')

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn })
}

function decodeAuthHeader(req) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) return null
  return jwt.verify(header.slice(7), env.jwtSecret)
}

const protect = asyncHandler(async (req, res, next) => {
  const decoded = decodeAuthHeader(req)
  if (!decoded) throw new ApiError(401, 'Authentication required')

  const user = await prisma.user.findUnique({ where: { id: decoded.id } })
  if (!user) throw new ApiError(401, 'User account no longer exists')
  if (!user.isActive) throw new ApiError(401, 'User account is disabled')

  req.user = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  }
  next()
})

const optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    const decoded = decodeAuthHeader(req)
    if (!decoded) {
      req.user = null
      return next()
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } })
    req.user = user?.isActive ? {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    } : null
  } catch {
    req.user = null
  }
  next()
})

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, 'Authentication required'))
    if (!roles.includes(req.user.role)) return next(new ApiError(403, 'Insufficient permissions'))
    return next()
  }
}

const adminOnly = requireRole('admin', 'super_admin')
const editorOnly = requireRole('editor', 'admin', 'super_admin')

module.exports = { signToken, protect, optionalAuth, requireRole, adminOnly, editorOnly }
