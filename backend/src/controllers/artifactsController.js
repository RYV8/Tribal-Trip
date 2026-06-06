const { prisma } = require('../config/db')
const { asyncHandler, ApiError, sendOk } = require('../utils/http')
const { formatArtifact } = require('../utils/formatters')
const { attachSources, loadSourcesFor } = require('../utils/sources')

const include = { country: true }

const getAll = asyncHandler(async (req, res) => {
  const { country, search } = req.query
  const where = { status: 'published' }
  if (country) where.country = { OR: [{ slug: country }, { name: country }] }
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { origin: { contains: search } },
      { summary: { contains: search } },
      { significance: { contains: search } },
    ]
  }

  const rows = await prisma.artifact.findMany({ where, include, orderBy: { name: 'asc' } })
  const sourceMap = await loadSourcesFor('artifact', rows.map((row) => row.slug))
  sendOk(res, rows.map((row) => formatArtifact(attachSources(row, sourceMap))), { count: rows.length })
})

const getOne = asyncHandler(async (req, res) => {
  const row = await prisma.artifact.findFirst({
    where: { status: 'published', OR: [{ slug: req.params.slug }, { id: Number(req.params.slug) || -1 }] },
    include,
  })
  if (!row) throw new ApiError(404, 'Artifact not found')
  const sourceMap = await loadSourcesFor('artifact', [row.slug])
  sendOk(res, formatArtifact(attachSources(row, sourceMap)))
})

module.exports = { getAll, getOne }
