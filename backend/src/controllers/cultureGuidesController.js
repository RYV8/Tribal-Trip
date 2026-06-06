const { prisma } = require('../config/db')
const { asyncHandler, ApiError, sendOk } = require('../utils/http')
const { parseJson } = require('../utils/formatters')

function guideInclude(publicOnly) {
  const statusWhere = publicOnly ? { status: 'published' } : undefined
  return {
    country: true,
    phrases: { where: statusWhere, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] },
    notes: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] },
    foods: { where: statusWhere, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] },
    foodSpots: { where: statusWhere, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] },
    styles: { where: statusWhere, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] },
  }
}

function formatGuide(guide) {
  if (!guide) return null
  return {
    id: guide.id,
    country: guide.country.name,
    slug: guide.country.slug,
    available: Boolean(guide.country.isAvailable),
    mapPoint: guide.country.mapLat != null && guide.country.mapLng != null ? { lat: Number(guide.country.mapLat), lng: Number(guide.country.mapLng) } : null,
    languages: parseJson(guide.languages, []),
    overview: guide.overview,
    phrases: guide.phrases.map((phrase) => ({
      id: phrase.id,
      language: phrase.language,
      english: phrase.english,
      local: phrase.localText,
      pronunciation: phrase.pronunciation,
      context: phrase.context,
      status: phrase.status,
    })),
    greetings: guide.notes.filter((note) => note.noteType === 'greeting').map((note) => note.text),
    etiquette: guide.notes.filter((note) => note.noteType === 'etiquette').map((note) => note.text),
    taboos: guide.notes.filter((note) => note.noteType === 'taboo').map((note) => note.text),
    foods: guide.foods.map((food) => ({
      id: food.id,
      name: food.name,
      description: food.description,
      commonIn: parseJson(food.commonIn, []),
      status: food.status,
    })),
    foodSpots: guide.foodSpots.map((spot) => ({
      id: spot.id,
      name: spot.name,
      city: spot.city,
      specialty: spot.specialty,
      priceLevel: spot.priceLevel,
      coordinates: spot.latitude != null && spot.longitude != null ? { lat: Number(spot.latitude), lng: Number(spot.longitude) } : null,
      status: spot.status,
    })),
    musicStyles: guide.styles.filter((style) => style.styleType === 'music').map((style) => ({
      id: style.id,
      name: style.name,
      description: style.description,
      context: style.context,
      status: style.status,
    })),
    clothingStyles: guide.styles.filter((style) => style.styleType === 'clothing').map((style) => ({
      id: style.id,
      name: style.name,
      description: style.description,
      context: style.context,
      status: style.status,
    })),
    status: guide.status,
  }
}

async function loadGuide(countrySlug, options = {}) {
  const publicOnly = options.publicOnly !== false
  const guide = await prisma.cultureGuide.findFirst({
    where: {
      ...(publicOnly ? { status: 'published' } : {}),
      country: { ...(publicOnly ? { isAvailable: true } : {}), OR: [{ slug: countrySlug }, { name: countrySlug }] },
    },
    include: guideInclude(publicOnly),
  })
  return formatGuide(guide)
}

async function loadGuides(options = {}) {
  const publicOnly = options.publicOnly !== false
  const rows = await prisma.cultureGuide.findMany({
    where: publicOnly ? { status: 'published', country: { isAvailable: true } } : {},
    include: guideInclude(publicOnly),
    orderBy: { country: { name: 'asc' } },
  })
  return rows.map(formatGuide)
}

const getAll = asyncHandler(async (req, res) => {
  const guides = await loadGuides({ publicOnly: true })
  sendOk(res, guides, { count: guides.length })
})

const getByCountry = asyncHandler(async (req, res) => {
  const guide = await loadGuide(req.params.countrySlug, { publicOnly: true })
  if (!guide) throw new ApiError(404, 'Culture guide not found')
  sendOk(res, guide)
})

module.exports = { getAll, getByCountry, loadGuide, loadGuides }
