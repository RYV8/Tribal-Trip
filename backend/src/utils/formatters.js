function parseJson(value, fallback) {
  if (value == null) return fallback
  if (Array.isArray(value) || typeof value === 'object') return value
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function toNumber(value) {
  if (value == null) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function formatCountry(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    code: row.code,
    region: row.region,
    description: row.description,
    image: row.imageUrl ?? row.image_url,
    available: Boolean(row.isAvailable ?? row.is_available),
    mapPoint: (row.mapLat ?? row.map_lat) != null && (row.mapLng ?? row.map_lng) != null
      ? { lat: toNumber(row.mapLat ?? row.map_lat), lng: toNumber(row.mapLng ?? row.map_lng) }
      : null,
  }
}

function formatLocation(row) {
  if (!row) return null
  return {
    id: row.slug,
    databaseId: row.id,
    name: row.name,
    slug: row.slug,
    type: row.type,
    country: row.country?.name ?? row.country_name,
    city: row.city,
    image: row.imageUrl ?? row.image_url,
    summary: row.summary,
    history: row.history,
    openingHours: row.openingHours ?? row.opening_hours,
    address: row.address,
    contact: row.contact,
    coordinates: row.latitude != null && row.longitude != null ? { lat: toNumber(row.latitude), lng: toNumber(row.longitude) } : null,
    tags: parseJson(row.tags, []),
    relatedStoryIds: parseJson(row.relatedStorySlugs ?? row.related_story_slugs, []),
    relatedArtifactIds: parseJson(row.relatedArtifactSlugs ?? row.related_artifact_slugs, []),
    status: row.status,
    sources: row.sources?.map(formatSource) ?? [],
  }
}

function formatStory(row) {
  if (!row) return null
  return {
    id: row.slug,
    databaseId: row.id,
    title: row.title,
    slug: row.slug,
    country: row.country?.name ?? row.country_name,
    category: row.category,
    image: row.imageUrl ?? row.image_url,
    summary: row.summary,
    body: parseJson(row.body, []),
    readTime: row.readTime ?? row.read_time,
    keyPoints: row.keyPoints?.map((item) => item.point) ?? parseJson(row.key_points, []),
    timeline: row.timeline?.map((item) => ({ period: item.period, text: item.text })) ?? parseJson(row.timeline, []),
    relatedLocationIds: parseJson(row.relatedLocationSlugs ?? row.related_location_slugs, []),
    relatedArtifactIds: parseJson(row.relatedArtifactSlugs ?? row.related_artifact_slugs, []),
    status: row.status,
    sources: row.sources?.map(formatSource) ?? [],
  }
}

function formatArtifact(row) {
  if (!row) return null
  return {
    id: row.slug,
    databaseId: row.id,
    name: row.name,
    slug: row.slug,
    country: row.country?.name ?? row.country_name,
    origin: row.origin,
    period: row.period,
    image: row.imageUrl ?? row.image_url,
    summary: row.summary,
    significance: row.significance,
    relatedLocationId: row.relatedLocationSlug ?? row.related_location_slug,
    relatedStoryIds: parseJson(row.relatedStorySlugs ?? row.related_story_slugs, []),
    status: row.status,
    sources: row.sources?.map(formatSource) ?? [],
  }
}

function formatSource(row) {
  if (!row) return null
  return {
    id: row.id,
    itemType: row.itemType,
    itemId: row.itemId,
    title: row.title,
    url: row.url,
    note: row.note,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

module.exports = { parseJson, formatCountry, formatLocation, formatStory, formatArtifact, formatSource }
