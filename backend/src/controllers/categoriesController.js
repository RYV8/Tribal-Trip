const { prisma } = require('../config/db')
const { asyncHandler, ApiError, sendOk } = require('../utils/http')

const getAll = asyncHandler(async (req, res) => {
  const rows = await prisma.category.findMany({ orderBy: { name: 'asc' } })
  sendOk(res, rows, { count: rows.length })
})

const getOne = asyncHandler(async (req, res) => {
  const row = await prisma.category.findFirst({
    where: { OR: [{ slug: req.params.slug }, { id: Number(req.params.slug) || -1 }] },
  })
  if (!row) throw new ApiError(404, 'Category not found')
  sendOk(res, row)
})

module.exports = { getAll, getOne }
