const { prisma } = require('../config/db')
const { asyncHandler, ApiError, sendOk, sendCreated } = require('../utils/http')

const getPublished = asyncHandler(async (req, res) => {
  const { country } = req.query
  const rows = await prisma.localSecret.findMany({
    where: {
      status: 'published',
      ...(country ? { country: { OR: [{ slug: country }, { name: country }] } } : {}),
    },
    include: { country: true },
    orderBy: { createdAt: 'desc' },
  })

  sendOk(res, rows.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    city: row.city,
    tip: row.tip,
    helpful: row.helpfulCount,
    country: row.country.name,
    countrySlug: row.country.slug,
  })), { count: rows.length })
})

const create = asyncHandler(async (req, res) => {
  const { type, countrySlug, title, city, tip } = req.body
  if (!type || !countrySlug || !title || !tip) throw new ApiError(400, 'type, countrySlug, title and tip are required')

  const country = await prisma.country.findFirst({ where: { OR: [{ slug: countrySlug }, { name: countrySlug }] } })
  if (!country) throw new ApiError(400, 'Country not found')

  const secret = await prisma.localSecret.create({
    data: { userId: req.user?.id || null, countryId: country.id, type, title, city: city || null, tip },
  })
  sendCreated(res, { id: secret.id, status: 'submitted' })
})

const markHelpful = asyncHandler(async (req, res) => {
  await prisma.localSecret.update({ where: { id: Number(req.params.id) }, data: { helpfulCount: { increment: 1 } } })
  sendOk(res, { message: 'Marked helpful' })
})

module.exports = { getPublished, create, markHelpful }
