const bcrypt = require('bcryptjs')
const { prisma } = require('../config/db')
const { signToken } = require('../middleware/auth')
const { asyncHandler, ApiError, sendOk, sendCreated } = require('../utils/http')

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    avatarUrl: user.avatarUrl,
    preferredCountryId: user.preferredCountryId,
  }
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) throw new ApiError(400, 'name, email and password are required')
  if (password.length < 8) throw new ApiError(400, 'Password must be at least 8 characters')

  const normalizedEmail = email.trim().toLowerCase()
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (existing) throw new ApiError(409, 'Email already registered')

  const user = await prisma.user.create({
    data: { name: name.trim(), email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12) },
  })

  sendCreated(res, { token: signToken(user), user: publicUser(user) })
})

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) throw new ApiError(400, 'email and password are required')

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
  if (!user) throw new ApiError(401, 'Invalid credentials')
  if (!user.isActive) throw new ApiError(401, 'User account is disabled')

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) throw new ApiError(401, 'Invalid credentials')

  sendOk(res, { token: signToken(user), user: publicUser(user) })
})

const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } })
  if (!user) throw new ApiError(404, 'User not found')
  sendOk(res, publicUser(user))
})

module.exports = { register, login, me }
