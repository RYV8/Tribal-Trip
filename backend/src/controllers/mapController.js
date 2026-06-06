const { prisma } = require('../config/db')
const { asyncHandler, sendOk } = require('../utils/http')

const getAvailability = asyncHandler(async (req, res) => {
  const countries = await prisma.country.findMany({
    where: { mapLat: { not: null }, mapLng: { not: null } },
    orderBy: [{ isAvailable: 'desc' }, { name: 'asc' }],
  })

  sendOk(res, countries.map((country) => ({
    country: country.name,
    slug: country.slug,
    available: Boolean(country.isAvailable),
    mapPoint: { lat: Number(country.mapLat), lng: Number(country.mapLng) },
  })))
})

module.exports = { getAvailability }
