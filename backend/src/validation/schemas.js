const { z } = require('zod')

const contentStatusValues = ['draft', 'review', 'published', 'archived']
const localSecretStatusValues = ['submitted', 'review', 'published', 'rejected', 'archived']
const sourceItemTypeValues = ['location', 'story', 'artifact']
const favoriteTypeValues = ['location', 'story', 'artifact', 'route']
const userRoleValues = ['user', 'editor', 'admin', 'super_admin']

const contentStatus = z.enum(contentStatusValues)
const localSecretStatus = z.enum(localSecretStatusValues)
const sourceItemType = z.enum(sourceItemTypeValues)

const requiredText = (max = 500) => z.string().trim().min(1).max(max)
const optionalText = (max = 500) => z.string().trim().max(max).optional()
const textId = z.preprocess((value) => (typeof value === 'number' ? String(value) : value), requiredText(220))
const textList = z.array(requiredText(300)).max(150)
const optionalTextList = textList.optional()

const numberField = z.union([
  z.number().finite(),
  z.string().trim().refine((value) => value === '' || Number.isFinite(Number(value)), 'Must be a number').transform((value) => (value === '' ? null : Number(value))),
  z.null(),
]).optional()

function isHttpUrl(value) {
  if (!value) return true
  try {
    const parsed = new URL(value)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

function isAssetUrl(value) {
  return !value || value.startsWith('/') || value.startsWith('data:image/') || isHttpUrl(value)
}

const sourceUrl = optionalText(2048).refine(isHttpUrl, 'Must be a valid http or https URL')
const assetUrl = optionalText(2_000_000).refine(isAssetUrl, 'Must be a relative path, data image, or http(s) URL')

const idParam = z.object({ id: z.coerce.number().int().positive() })
const slugParam = z.object({ slug: requiredText(220) })
const countrySlugParam = z.object({ countrySlug: requiredText(220) })

const statusQuery = z.object({ status: z.enum(['all', ...contentStatusValues]).optional() })
const auditQuery = z.object({ limit: z.coerce.number().int().positive().max(150).optional() })
const sourceQuery = z.object({ itemType: sourceItemType.optional(), itemId: optionalText(220) })
const localSecretsQuery = z.object({ country: optionalText(120), status: localSecretStatus.optional() })

const registerBody = z.object({
  name: requiredText(120),
  email: requiredText(254).email(),
  password: z.string().min(8).max(128),
})

const loginBody = z.object({
  email: requiredText(254).email(),
  password: z.string().min(1).max(128),
})

const profileBody = z.object({
  name: optionalText(120),
  avatarUrl: assetUrl,
  preferredCountrySlug: optionalText(120),
})

const favoriteBody = z.object({
  itemType: z.enum(favoriteTypeValues),
  itemId: textId,
})

const localSecretBody = z.object({
  type: requiredText(80),
  countrySlug: requiredText(120),
  title: requiredText(160),
  city: optionalText(120),
  tip: requiredText(1200),
})

const countryFields = {
  name: optionalText(120),
  slug: optionalText(140),
  code: optionalText(12),
  region: optionalText(120),
  description: optionalText(2000),
  imageUrl: assetUrl,
  image: assetUrl,
  isAvailable: z.boolean().optional(),
  mapLat: numberField,
  mapLng: numberField,
  lat: numberField,
  lng: numberField,
}
const createCountryBody = z.object({ ...countryFields, name: requiredText(120) })
const updateCountryBody = z.object(countryFields)

const sourceBody = z.object({
  itemType: sourceItemType,
  itemId: textId,
  title: requiredText(200),
  url: sourceUrl,
  note: optionalText(1000),
})
const updateSourceBody = sourceBody.partial()

const baseLocationFields = {
  name: optionalText(180),
  slug: optionalText(220),
  type: optionalText(100),
  country: optionalText(120),
  countrySlug: optionalText(120),
  city: optionalText(120),
  summary: optionalText(2000),
  history: optionalText(8000),
  address: optionalText(300),
  openingHours: optionalText(240),
  contact: optionalText(240),
  latitude: numberField,
  longitude: numberField,
  lat: numberField,
  lng: numberField,
  imageUrl: assetUrl,
  image: assetUrl,
  websiteUrl: sourceUrl,
  tags: optionalTextList,
  relatedStoryIds: optionalTextList,
  relatedArtifactIds: optionalTextList,
  status: contentStatus.optional(),
}
const createLocationBody = z.object({
  ...baseLocationFields,
  name: requiredText(180),
  type: requiredText(100),
}).refine((body) => Boolean(body.country || body.countrySlug), { path: ['country'], message: 'country or countrySlug is required' })
const updateLocationBody = z.object(baseLocationFields)

const storyTimelineItem = z.object({
  period: requiredText(120),
  text: requiredText(2000),
})
const storyBodyText = z.union([optionalText(20_000), z.array(requiredText(5000)).max(80)]).optional()
const baseStoryFields = {
  title: optionalText(220),
  slug: optionalText(220),
  country: optionalText(120),
  countrySlug: optionalText(120),
  category: optionalText(120),
  summary: optionalText(2500),
  body: storyBodyText,
  readTime: optionalText(80),
  imageUrl: assetUrl,
  image: assetUrl,
  author: optionalText(120),
  relatedLocationIds: optionalTextList,
  relatedArtifactIds: optionalTextList,
  keyPoints: optionalTextList,
  timeline: z.array(storyTimelineItem).max(80).optional(),
  status: contentStatus.optional(),
}
const createStoryBody = z.object({ ...baseStoryFields, title: requiredText(220) })
const updateStoryBody = z.object(baseStoryFields)

const baseArtifactFields = {
  name: optionalText(180),
  slug: optionalText(220),
  country: optionalText(120),
  countrySlug: optionalText(120),
  origin: optionalText(180),
  period: optionalText(180),
  summary: optionalText(2500),
  significance: optionalText(8000),
  imageUrl: assetUrl,
  image: assetUrl,
  relatedLocationId: optionalText(220),
  relatedStoryIds: optionalTextList,
  status: contentStatus.optional(),
}
const createArtifactBody = z.object({ ...baseArtifactFields, name: requiredText(180) })
const updateArtifactBody = z.object(baseArtifactFields)

const guidePhrase = z.object({
  language: requiredText(80),
  english: requiredText(240),
  local: optionalText(240),
  localText: optionalText(240),
  pronunciation: optionalText(240),
  context: optionalText(500),
  status: contentStatus.optional(),
}).refine((phrase) => Boolean(phrase.local || phrase.localText), { path: ['local'], message: 'local or localText is required' })

const guideFood = z.object({
  name: requiredText(120),
  description: optionalText(1000),
  commonIn: optionalTextList,
  status: contentStatus.optional(),
})

const guideFoodSpot = z.object({
  name: requiredText(160),
  city: optionalText(120),
  specialty: optionalText(240),
  priceLevel: optionalText(40),
  latitude: numberField,
  longitude: numberField,
  coordinates: z.object({ lat: numberField, lng: numberField }).optional(),
  status: contentStatus.optional(),
})

const guideStyle = z.object({
  name: requiredText(120),
  description: optionalText(1200),
  context: optionalText(1200),
  status: contentStatus.optional(),
})

const cultureGuideBody = z.object({
  country: optionalText(120),
  countrySlug: optionalText(120),
  languages: optionalTextList,
  overview: optionalText(3000),
  status: contentStatus.optional(),
  phrases: z.array(guidePhrase).max(300).optional(),
  greetings: optionalTextList,
  etiquette: optionalTextList,
  taboos: optionalTextList,
  foods: z.array(guideFood).max(150).optional(),
  foodSpots: z.array(guideFoodSpot).max(150).optional(),
  musicStyles: z.array(guideStyle).max(150).optional(),
  clothingStyles: z.array(guideStyle).max(150).optional(),
})

const updateUserBody = z.object({
  role: z.enum(userRoleValues).optional(),
  isActive: z.boolean().optional(),
})

const localSecretModerationBody = z.object({ status: localSecretStatus })
const mediaBody = z.object({ altText: optionalText(240), sourceCredit: optionalText(240) })

module.exports = {
  auditQuery,
  countrySlugParam,
  createArtifactBody,
  createCountryBody,
  createLocationBody,
  createSourceBody: sourceBody,
  createStoryBody,
  favoriteBody,
  idParam,
  localSecretBody,
  localSecretModerationBody,
  localSecretsQuery,
  loginBody,
  mediaBody,
  profileBody,
  registerBody,
  slugParam,
  sourceQuery,
  statusQuery,
  updateArtifactBody,
  updateCountryBody,
  updateLocationBody,
  updateSourceBody,
  updateStoryBody,
  updateUserBody,
  upsertCultureGuideBody: cultureGuideBody,
}
