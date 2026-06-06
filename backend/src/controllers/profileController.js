const { prisma } = require('../config/db')
const { asyncHandler, ApiError, sendOk } = require('../utils/http')

function formatProfile(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    preferredCountry: user.preferredCountry?.name || null,
    preferredCountrySlug: user.preferredCountry?.slug || null,
  }
}

const getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { preferredCountry: true } })
  if (!user) throw new ApiError(404, 'Profile not found')
  sendOk(res, formatProfile(user))
})

const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatarUrl, preferredCountrySlug } = req.body
  let preferredCountryId

  if (preferredCountrySlug) {
    const country = await prisma.country.findFirst({ where: { OR: [{ slug: preferredCountrySlug }, { name: preferredCountrySlug }] } })
    if (!country) throw new ApiError(400, 'Preferred country not found')
    preferredCountryId = country.id
  }

  await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(name ? { name } : {}),
      ...(avatarUrl !== undefined ? { avatarUrl: avatarUrl || null } : {}),
      ...(preferredCountryId ? { preferredCountryId } : {}),
    },
  })

  sendOk(res, { message: 'Profile updated' })
})

module.exports = { getProfile, updateProfile }
