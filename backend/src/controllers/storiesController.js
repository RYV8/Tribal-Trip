const { prisma } = require('../config/db')
const { asyncHandler, ApiError, sendOk } = require('../utils/http')
const { formatStory } = require('../utils/formatters')
const { attachSources, loadSourcesFor } = require('../utils/sources')

const include = {
  country: true,
  keyPoints: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] },
  timeline: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] },
}

const getAll = asyncHandler(async (req, res) => {
  const { country, category, search } = req.query
  const where = { status: 'published' }
  if (country) where.country = { OR: [{ slug: country }, { name: country }] }
  if (category) where.category = category
  if (search) where.OR = [{ title: { contains: search } }, { summary: { contains: search } }]

  const rows = await prisma.story.findMany({ where, include, orderBy: { createdAt: 'desc' } })
  const sourceMap = await loadSourcesFor('story', rows.map((row) => row.slug))
  sendOk(res, rows.map((row) => formatStory(attachSources(row, sourceMap))), { count: rows.length })
})

const getOne = asyncHandler(async (req, res) => {
  const row = await prisma.story.findFirst({
    where: { status: 'published', OR: [{ slug: req.params.slug }, { id: Number(req.params.slug) || -1 }] },
    include,
  })
  if (!row) throw new ApiError(404, 'Story not found')
  const sourceMap = await loadSourcesFor('story', [row.slug])
  sendOk(res, formatStory(attachSources(row, sourceMap)))
})

module.exports = { getAll, getOne }
