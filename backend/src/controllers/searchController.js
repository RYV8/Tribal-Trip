const { prisma } = require('../config/db')
const { asyncHandler, ApiError, sendOk } = require('../utils/http')

const search = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim()
  if (q.length < 2) throw new ApiError(400, 'Search query must be at least 2 characters')

  const [locations, stories, artifacts] = await Promise.all([
    prisma.location.findMany({
      where: {
        status: 'published',
        OR: [{ name: { contains: q } }, { city: { contains: q } }, { summary: { contains: q } }, { history: { contains: q } }],
      },
      include: { country: true },
      take: 20,
    }),
    prisma.story.findMany({
      where: { status: 'published', OR: [{ title: { contains: q } }, { summary: { contains: q } }] },
      include: { country: true },
      take: 20,
    }),
    prisma.artifact.findMany({
      where: {
        status: 'published',
        OR: [{ name: { contains: q } }, { origin: { contains: q } }, { summary: { contains: q } }, { significance: { contains: q } }],
      },
      include: { country: true },
      take: 20,
    }),
  ])

  sendOk(res, {
    locations: locations.map((item) => ({ id: item.slug, type: 'location', title: item.name, description: item.summary, image: item.imageUrl, country: item.country.name })),
    stories: stories.map((item) => ({ id: item.slug, type: 'story', title: item.title, description: item.summary, image: item.imageUrl, country: item.country?.name })),
    artifacts: artifacts.map((item) => ({ id: item.slug, type: 'artifact', title: item.name, description: item.summary, image: item.imageUrl, country: item.country?.name })),
    total: locations.length + stories.length + artifacts.length,
    query: q,
  })
})

module.exports = { search }
