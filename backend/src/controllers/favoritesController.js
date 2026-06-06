const { prisma } = require('../config/db')
const { asyncHandler, ApiError, sendOk, sendCreated } = require('../utils/http')

const validTypes = new Set(['location', 'story', 'artifact', 'route'])

const getAll = asyncHandler(async (req, res) => {
  const rows = await prisma.favorite.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } })
  sendOk(res, rows.map((row) => ({ id: row.id, type: row.itemType, itemId: row.itemId, createdAt: row.createdAt })), { count: rows.length })
})

const add = asyncHandler(async (req, res) => {
  const { itemType, itemId } = req.body
  if (!validTypes.has(itemType) || !itemId) throw new ApiError(400, 'itemType and itemId are required')

  await prisma.favorite.upsert({
    where: { userId_itemType_itemId: { userId: req.user.id, itemType, itemId } },
    update: {},
    create: { userId: req.user.id, itemType, itemId },
  })
  sendCreated(res, { itemType, itemId })
})

const remove = asyncHandler(async (req, res) => {
  const { itemType, itemId } = req.body
  if (!validTypes.has(itemType) || !itemId) throw new ApiError(400, 'itemType and itemId are required')

  await prisma.favorite.deleteMany({ where: { userId: req.user.id, itemType, itemId } })
  sendOk(res, { message: 'Favorite removed' })
})

module.exports = { getAll, add, remove }
