const { prisma } = require('../config/db')
const { asyncHandler, ApiError, sendOk } = require('../utils/http')
const { formatLocation } = require('../utils/formatters')
const { attachSources, loadSourcesFor } = require('../utils/sources')

const include = { country: true, category: true }

const getAll = asyncHandler(async (req, res) => {
  const { country, type, search } = req.query
  const where = { status: 'published' }
  if (country) where.country = { OR: [{ slug: country }, { name: country }] }
  if (type) where.type = type
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { city: { contains: search } },
      { summary: { contains: search } },
      { history: { contains: search } },
    ]
  }

  const rows = await prisma.location.findMany({ where, include, orderBy: { name: 'asc' } })
  const sourceMap = await loadSourcesFor('location', rows.map((row) => row.slug))
  sendOk(res, rows.map((row) => formatLocation(attachSources(row, sourceMap))), { count: rows.length })
})

const getOne = asyncHandler(async (req, res) => {
  const row = await prisma.location.findFirst({
    where: { status: 'published', OR: [{ slug: req.params.slug }, { id: Number(req.params.slug) || -1 }] },
    include,
  })
  if (!row) throw new ApiError(404, 'Location not found')
  const sourceMap = await loadSourcesFor('location', [row.slug])
  sendOk(res, formatLocation(attachSources(row, sourceMap)))
})

module.exports = { getAll, getOne }
