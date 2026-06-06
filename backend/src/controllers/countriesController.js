const { prisma } = require('../config/db')
const { asyncHandler, ApiError, sendOk } = require('../utils/http')
const { formatCountry } = require('../utils/formatters')

const getAll = asyncHandler(async (req, res) => {
  const rows = await prisma.country.findMany({ orderBy: { name: 'asc' } })
  sendOk(res, rows.map(formatCountry), { count: rows.length })
})

const getOne = asyncHandler(async (req, res) => {
  const row = await prisma.country.findFirst({
    where: { OR: [{ slug: req.params.slug }, { id: Number(req.params.slug) || -1 }] },
  })
  if (!row) throw new ApiError(404, 'Country not found')
  sendOk(res, formatCountry(row))
})

module.exports = { getAll, getOne }
