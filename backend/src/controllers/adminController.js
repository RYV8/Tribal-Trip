const { prisma } = require('../config/db')
const { asyncHandler, ApiError, sendOk, sendCreated } = require('../utils/http')
const { formatArtifact, formatCountry, formatLocation, formatSource, formatStory } = require('../utils/formatters')
const { slugify } = require('../utils/slug')
const { storeUploadedImage } = require('../services/mediaStorage')
const { loadGuide, loadGuides } = require('./cultureGuidesController')

const contentStatuses = new Set(['draft', 'review', 'published', 'archived'])
const localSecretStatuses = new Set(['submitted', 'review', 'published', 'rejected', 'archived'])
const adminRoles = new Set(['admin', 'super_admin'])
const userRoles = new Set(['user', 'editor', 'admin', 'super_admin'])
const sourceItemTypes = new Set(['location', 'story', 'artifact'])
const sourceModels = {
  location: { model: 'location', titleField: 'name' },
  story: { model: 'story', titleField: 'title' },
  artifact: { model: 'artifact', titleField: 'name' },
}
const adminOnlyContentStatuses = new Set(['published', 'archived'])
const adminOnlyLocalSecretStatuses = new Set(['published', 'rejected', 'archived'])

function requiredText(value, fieldName) {
  const text = typeof value === 'string' ? value.trim() : ''
  if (!text) throw new ApiError(400, `${fieldName} is required`)
  return text
}

function optionalText(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function normalizeUrl(value) {
  const url = optionalText(value)
  if (!url) return null
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Invalid protocol')
    return parsed.toString()
  } catch {
    throw new ApiError(400, 'Source URL must be a valid http or https URL')
  }
}

function patchText(value) {
  if (value === undefined) return undefined
  return optionalText(value)
}

function normalizeStatus(value, allowed, fallback) {
  if (!value) return fallback
  if (!allowed.has(value)) throw new ApiError(400, `Invalid status: ${value}`)
  return value
}

function jsonArray(value) {
  if (!value) return JSON.stringify([])
  return JSON.stringify(Array.isArray(value) ? value : [value])
}

function arrayValue(value) {
  if (value === undefined) return undefined
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function booleanValue(value, fieldName) {
  if (value === undefined) return undefined
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  throw new ApiError(400, `${fieldName} must be a boolean`)
}

function numberValue(value, fieldName) {
  if (value === undefined || value === null || value === '') return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) throw new ApiError(400, `${fieldName} must be a number`)
  return parsed
}

function addData(data, field, value) {
  if (value !== undefined) data[field] = value
}

function isAdmin(user) {
  return adminRoles.has(user?.role)
}

function isSuperAdmin(user) {
  return user?.role === 'super_admin'
}

function requireAdmin(user, action) {
  if (!isAdmin(user)) throw new ApiError(403, `${action} requires admin access`)
}

function formatAdminUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    avatarUrl: user.avatarUrl,
    preferredCountry: user.preferredCountry?.name || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

function assertUserManagementAllowed(actor, target, nextRole, nextIsActive) {
  requireAdmin(actor, 'Managing users')
  if (actor.id === target.id && (nextRole !== undefined || nextIsActive === false)) {
    throw new ApiError(400, 'You cannot change your own role or disable your own account')
  }

  if (isSuperAdmin(actor)) return

  if (['admin', 'super_admin'].includes(target.role)) {
    throw new ApiError(403, 'Only super admin can manage admin accounts')
  }

  if (nextRole && ['admin', 'super_admin'].includes(nextRole)) {
    throw new ApiError(403, 'Only super admin can assign admin roles')
  }
}

function assertContentWriteAllowed(user, status, currentStatus) {
  if (adminOnlyContentStatuses.has(status)) requireAdmin(user, `Setting status to ${status}`)
  if (!isAdmin(user) && adminOnlyContentStatuses.has(currentStatus)) throw new ApiError(403, 'Admin access is required to edit published or archived records')
}

function normalizeContentStatusForUser(user, status, fallback = 'draft', currentStatus) {
  const nextStatus = normalizeStatus(status, contentStatuses, fallback)
  assertContentWriteAllowed(user, nextStatus, currentStatus)
  return nextStatus
}

function assertLocalSecretStatusAllowed(user, status) {
  if (adminOnlyLocalSecretStatuses.has(status)) requireAdmin(user, `Setting suggestion status to ${status}`)
}

async function writeAuditLog(req, { action, entityType, entityId, entityTitle, metadata = {} }) {
  await prisma.auditLog.create({
    data: {
      actorId: req.user?.id || null,
      actorEmail: req.user?.email || null,
      actorRole: req.user?.role || null,
      action,
      entityType,
      entityId: entityId == null ? null : String(entityId),
      entityTitle: entityTitle || null,
      metadata: JSON.stringify(metadata),
    },
  })
}

function idOrSlug(slug) {
  return { OR: [{ slug }, { id: Number(slug) || -1 }] }
}

async function findCountry(country) {
  const key = requiredText(country, 'country')
  const row = await prisma.country.findFirst({ where: { OR: [{ slug: key }, { name: key }] } })
  if (!row) throw new ApiError(400, 'Country not found')
  return row
}

async function findOptionalCountry(country) {
  if (!country) return null
  return findCountry(country)
}

async function getOrCreateCategory(type) {
  if (!type) return null
  const name = requiredText(type, 'type')
  const slug = slugify(name)
  return prisma.category.upsert({
    where: { slug },
    update: { name },
    create: { name, slug, icon: slug },
  })
}

async function archiveRecord(model, slug) {
  const row = await prisma[model].findFirst({ where: idOrSlug(slug) })
  if (!row) throw new ApiError(404, 'Record not found')
  const updated = await prisma[model].update({ where: { id: row.id }, data: { status: 'archived' } })
  return { row, updated }
}

async function findSourceTarget(itemType, itemId) {
  const type = requiredText(itemType, 'itemType')
  if (!sourceItemTypes.has(type)) throw new ApiError(400, 'Invalid source item type')
  const key = requiredText(itemId, 'itemId')
  const config = sourceModels[type]
  const row = await prisma[config.model].findFirst({ where: idOrSlug(key) })
  if (!row) throw new ApiError(400, 'Referenced content record was not found')
  return { type, row, title: row[config.titleField] }
}

async function replaceStoryDetails(storyId, keyPoints, timeline) {
  if (keyPoints !== undefined) {
    await prisma.storyKeyPoint.deleteMany({ where: { storyId } })
    for (let index = 0; index < (keyPoints || []).length; index += 1) {
      await prisma.storyKeyPoint.create({ data: { storyId, point: keyPoints[index], sortOrder: index } })
    }
  }

  if (timeline !== undefined) {
    await prisma.storyTimeline.deleteMany({ where: { storyId } })
    for (let index = 0; index < (timeline || []).length; index += 1) {
      const item = timeline[index]
      await prisma.storyTimeline.create({ data: { storyId, period: item.period, text: item.text, sortOrder: index } })
    }
  }
}

async function replaceCultureGuideDetails(guideId, body, user) {
  if (body.phrases !== undefined) {
    await prisma.guidePhrase.deleteMany({ where: { guideId } })
    const phrases = arrayValue(body.phrases)
    for (let index = 0; index < phrases.length; index += 1) {
      const phrase = phrases[index]
      const status = normalizeContentStatusForUser(user, phrase.status, 'draft')
      await prisma.guidePhrase.create({
        data: {
          guideId,
          language: requiredText(phrase.language, 'phrase language'),
          english: requiredText(phrase.english, 'phrase english'),
          localText: requiredText(phrase.local ?? phrase.localText, 'phrase local'),
          pronunciation: optionalText(phrase.pronunciation),
          context: optionalText(phrase.context),
          status,
          sortOrder: index,
        },
      })
    }
  }

  for (const [field, noteType] of [['greetings', 'greeting'], ['etiquette', 'etiquette'], ['taboos', 'taboo']]) {
    if (body[field] === undefined) continue
    await prisma.guideNote.deleteMany({ where: { guideId, noteType } })
    const notes = arrayValue(body[field]).map((note) => (typeof note === 'string' ? note.trim() : '')).filter(Boolean)
    for (let index = 0; index < notes.length; index += 1) {
      await prisma.guideNote.create({ data: { guideId, noteType, text: notes[index], sortOrder: index } })
    }
  }

  if (body.foods !== undefined) {
    await prisma.food.deleteMany({ where: { guideId } })
    const foods = arrayValue(body.foods)
    for (let index = 0; index < foods.length; index += 1) {
      const food = foods[index]
      const status = normalizeContentStatusForUser(user, food.status, 'draft')
      await prisma.food.create({
        data: {
          guideId,
          name: requiredText(food.name, 'food name'),
          description: optionalText(food.description),
          commonIn: jsonArray(food.commonIn),
          status,
          sortOrder: index,
        },
      })
    }
  }

  if (body.foodSpots !== undefined) {
    await prisma.foodSpot.deleteMany({ where: { guideId } })
    const spots = arrayValue(body.foodSpots)
    for (let index = 0; index < spots.length; index += 1) {
      const spot = spots[index]
      const status = normalizeContentStatusForUser(user, spot.status, 'draft')
      await prisma.foodSpot.create({
        data: {
          guideId,
          name: requiredText(spot.name, 'food spot name'),
          city: optionalText(spot.city),
          specialty: optionalText(spot.specialty),
          priceLevel: optionalText(spot.priceLevel),
          latitude: numberValue(spot.coordinates?.lat ?? spot.latitude, 'food spot latitude'),
          longitude: numberValue(spot.coordinates?.lng ?? spot.longitude, 'food spot longitude'),
          status,
          sortOrder: index,
        },
      })
    }
  }

  for (const [field, styleType] of [['musicStyles', 'music'], ['clothingStyles', 'clothing']]) {
    if (body[field] === undefined) continue
    await prisma.cultureStyle.deleteMany({ where: { guideId, styleType } })
    const styles = arrayValue(body[field])
    for (let index = 0; index < styles.length; index += 1) {
      const style = styles[index]
      const status = normalizeContentStatusForUser(user, style.status, 'draft')
      await prisma.cultureStyle.create({
        data: {
          guideId,
          styleType,
          name: requiredText(style.name, `${styleType} style name`),
          description: optionalText(style.description),
          context: optionalText(style.context),
          status,
          sortOrder: index,
        },
      })
    }
  }
}

function statusFilter(status) {
  if (!status || status === 'all') return {}
  if (!contentStatuses.has(status)) throw new ApiError(400, `Invalid status: ${status}`)
  return { status }
}

const listLocations = asyncHandler(async (req, res) => {
  const rows = await prisma.location.findMany({
    where: statusFilter(req.query.status),
    include: { country: true, category: true },
    orderBy: [{ updatedAt: 'desc' }, { name: 'asc' }],
  })
  sendOk(res, rows.map(formatLocation), { count: rows.length })
})

const listStories = asyncHandler(async (req, res) => {
  const rows = await prisma.story.findMany({
    where: statusFilter(req.query.status),
    include: {
      country: true,
      keyPoints: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] },
      timeline: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] },
    },
    orderBy: [{ updatedAt: 'desc' }, { title: 'asc' }],
  })
  sendOk(res, rows.map(formatStory), { count: rows.length })
})

const listArtifacts = asyncHandler(async (req, res) => {
  const rows = await prisma.artifact.findMany({
    where: statusFilter(req.query.status),
    include: { country: true },
    orderBy: [{ updatedAt: 'desc' }, { name: 'asc' }],
  })
  sendOk(res, rows.map(formatArtifact), { count: rows.length })
})

const listCountries = asyncHandler(async (req, res) => {
  requireAdmin(req.user, 'Listing countries')
  const rows = await prisma.country.findMany({ orderBy: { name: 'asc' } })
  sendOk(res, rows.map(formatCountry), { count: rows.length })
})

const createCountry = asyncHandler(async (req, res) => {
  requireAdmin(req.user, 'Creating countries')
  const name = requiredText(req.body.name, 'name')
  const slug = optionalText(req.body.slug) || slugify(name)
  const country = await prisma.country.create({
    data: {
      name,
      slug,
      code: optionalText(req.body.code),
      region: optionalText(req.body.region),
      description: optionalText(req.body.description),
      imageUrl: optionalText(req.body.imageUrl || req.body.image),
      isAvailable: booleanValue(req.body.isAvailable, 'isAvailable') ?? true,
      mapLat: numberValue(req.body.mapLat ?? req.body.lat, 'mapLat'),
      mapLng: numberValue(req.body.mapLng ?? req.body.lng, 'mapLng'),
    },
  })

  await writeAuditLog(req, {
    action: 'country_create',
    entityType: 'country',
    entityId: country.slug,
    entityTitle: country.name,
    metadata: { isAvailable: country.isAvailable },
  })

  sendCreated(res, formatCountry(country))
})

const updateCountry = asyncHandler(async (req, res) => {
  requireAdmin(req.user, 'Updating countries')
  const row = await prisma.country.findFirst({ where: idOrSlug(req.params.slug) })
  if (!row) throw new ApiError(404, 'Country not found')

  const data = {}
  addData(data, 'name', patchText(req.body.name))
  addData(data, 'slug', patchText(req.body.slug))
  addData(data, 'code', patchText(req.body.code))
  addData(data, 'region', patchText(req.body.region))
  addData(data, 'description', patchText(req.body.description))
  addData(data, 'imageUrl', patchText(req.body.imageUrl ?? req.body.image))
  addData(data, 'isAvailable', booleanValue(req.body.isAvailable, 'isAvailable'))
  if (req.body.mapLat !== undefined || req.body.lat !== undefined) data.mapLat = numberValue(req.body.mapLat ?? req.body.lat, 'mapLat')
  if (req.body.mapLng !== undefined || req.body.lng !== undefined) data.mapLng = numberValue(req.body.mapLng ?? req.body.lng, 'mapLng')
  if (!Object.keys(data).length) throw new ApiError(400, 'No country fields to update')

  const updated = await prisma.country.update({ where: { id: row.id }, data })

  await writeAuditLog(req, {
    action: 'country_update',
    entityType: 'country',
    entityId: updated.slug,
    entityTitle: updated.name,
    metadata: { previousSlug: row.slug, fields: Object.keys(data), isAvailable: updated.isAvailable },
  })

  sendOk(res, formatCountry(updated))
})

const listCultureGuides = asyncHandler(async (req, res) => {
  const guides = await loadGuides({ publicOnly: false })
  sendOk(res, guides, { count: guides.length })
})

const upsertCultureGuide = asyncHandler(async (req, res) => {
  const country = await findCountry(req.params.countrySlug || req.body.countrySlug || req.body.country)
  const existing = await prisma.cultureGuide.findUnique({ where: { countryId: country.id } })
  const status = normalizeContentStatusForUser(req.user, req.body.status, existing?.status || 'draft', existing?.status)

  const data = { status }
  if (req.body.languages !== undefined || !existing) data.languages = jsonArray(req.body.languages)
  if (req.body.overview !== undefined || !existing) data.overview = optionalText(req.body.overview)

  const guide = existing
    ? await prisma.cultureGuide.update({ where: { id: existing.id }, data })
    : await prisma.cultureGuide.create({ data: { countryId: country.id, ...data } })

  await replaceCultureGuideDetails(guide.id, req.body, req.user)

  await writeAuditLog(req, {
    action: existing ? 'culture_guide_update' : 'culture_guide_create',
    entityType: 'cultureGuide',
    entityId: country.slug,
    entityTitle: country.name,
    metadata: { previousStatus: existing?.status || null, status },
  })

  sendOk(res, await loadGuide(country.slug, { publicOnly: false }))
})

const archiveCultureGuide = asyncHandler(async (req, res) => {
  requireAdmin(req.user, 'Archiving culture guides')
  const country = await findCountry(req.params.countrySlug)
  const row = await prisma.cultureGuide.findUnique({ where: { countryId: country.id } })
  if (!row) throw new ApiError(404, 'Culture guide not found')
  const updated = await prisma.cultureGuide.update({ where: { id: row.id }, data: { status: 'archived' } })

  await writeAuditLog(req, {
    action: 'culture_guide_archive',
    entityType: 'cultureGuide',
    entityId: country.slug,
    entityTitle: country.name,
    metadata: { previousStatus: row.status, status: updated.status },
  })

  sendOk(res, { country: country.name, slug: country.slug, status: updated.status })
})

const listAuditLogs = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 150)
  const rows = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  sendOk(res, rows.map((row) => ({
    id: row.id,
    actorEmail: row.actorEmail,
    actorRole: row.actorRole,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    entityTitle: row.entityTitle,
    metadata: JSON.parse(row.metadata || '{}'),
    createdAt: row.createdAt,
  })), { count: rows.length })
})

const listUsers = asyncHandler(async (req, res) => {
  requireAdmin(req.user, 'Listing users')

  const rows = await prisma.user.findMany({
    include: { preferredCountry: true },
    orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
  })

  sendOk(res, rows.map(formatAdminUser), { count: rows.length })
})

const updateUser = asyncHandler(async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) throw new ApiError(400, 'Invalid user id')

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) throw new ApiError(404, 'User not found')

  const data = {}
  if (req.body.role !== undefined) {
    const role = requiredText(req.body.role, 'role')
    if (!userRoles.has(role)) throw new ApiError(400, 'Invalid user role')
    data.role = role
  }
  if (req.body.isActive !== undefined) {
    if (typeof req.body.isActive !== 'boolean') throw new ApiError(400, 'isActive must be a boolean')
    data.isActive = req.body.isActive
  }
  if (!Object.keys(data).length) throw new ApiError(400, 'No user fields to update')

  assertUserManagementAllowed(req.user, target, data.role, data.isActive)

  const updated = await prisma.user.update({
    where: { id },
    data,
    include: { preferredCountry: true },
  })

  await writeAuditLog(req, {
    action: 'user_update',
    entityType: 'user',
    entityId: updated.id,
    entityTitle: updated.email,
    metadata: {
      fields: Object.keys(data),
      previousRole: target.role,
      role: updated.role,
      previousIsActive: target.isActive,
      isActive: updated.isActive,
    },
  })

  sendOk(res, formatAdminUser(updated))
})

const listSources = asyncHandler(async (req, res) => {
  const where = {}
  if (req.query.itemType) {
    if (!sourceItemTypes.has(req.query.itemType)) throw new ApiError(400, 'Invalid source item type')
    where.itemType = req.query.itemType
  }
  if (req.query.itemId) where.itemId = req.query.itemId

  const rows = await prisma.contentSource.findMany({
    where,
    orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
  })

  sendOk(res, rows.map(formatSource), { count: rows.length })
})

const createSource = asyncHandler(async (req, res) => {
  const target = await findSourceTarget(req.body.itemType, req.body.itemId)
  const title = requiredText(req.body.title, 'title')
  const url = normalizeUrl(req.body.url)
  const note = optionalText(req.body.note)

  const source = await prisma.contentSource.create({
    data: {
      itemType: target.type,
      itemId: target.row.slug,
      title,
      url,
      note,
    },
  })

  await writeAuditLog(req, {
    action: 'source_create',
    entityType: target.type,
    entityId: target.row.slug,
    entityTitle: target.title,
    metadata: { sourceId: source.id, sourceTitle: source.title },
  })

  sendCreated(res, formatSource(source))
})

const updateSource = asyncHandler(async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) throw new ApiError(400, 'Invalid source id')

  const existing = await prisma.contentSource.findUnique({ where: { id } })
  if (!existing) throw new ApiError(404, 'Source not found')

  let target = null
  const nextItemType = req.body.itemType ?? existing.itemType
  const nextItemId = req.body.itemId ?? existing.itemId
  if (req.body.itemType !== undefined || req.body.itemId !== undefined) target = await findSourceTarget(nextItemType, nextItemId)

  const data = {}
  if (target) {
    data.itemType = target.type
    data.itemId = target.row.slug
  }
  if (req.body.title !== undefined) data.title = requiredText(req.body.title, 'title')
  if (req.body.url !== undefined) data.url = normalizeUrl(req.body.url)
  addData(data, 'note', patchText(req.body.note))
  if (!Object.keys(data).length) throw new ApiError(400, 'No source fields to update')

  const updated = await prisma.contentSource.update({ where: { id }, data })

  await writeAuditLog(req, {
    action: 'source_update',
    entityType: updated.itemType,
    entityId: updated.itemId,
    entityTitle: updated.title,
    metadata: { sourceId: updated.id, fields: Object.keys(data) },
  })

  sendOk(res, formatSource(updated))
})

const deleteSource = asyncHandler(async (req, res) => {
  requireAdmin(req.user, 'Deleting sources')
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) throw new ApiError(400, 'Invalid source id')

  const existing = await prisma.contentSource.findUnique({ where: { id } })
  if (!existing) throw new ApiError(404, 'Source not found')
  await prisma.contentSource.delete({ where: { id } })

  await writeAuditLog(req, {
    action: 'source_delete',
    entityType: existing.itemType,
    entityId: existing.itemId,
    entityTitle: existing.title,
    metadata: { sourceId: existing.id },
  })

  sendOk(res, { id, deleted: true })
})

const createLocation = asyncHandler(async (req, res) => {
  const name = requiredText(req.body.name, 'name')
  const country = await findCountry(req.body.countrySlug || req.body.country)
  const type = requiredText(req.body.type, 'type')
  const category = await getOrCreateCategory(type)
  const slug = optionalText(req.body.slug) || slugify(name)
  const status = normalizeStatus(req.body.status, contentStatuses, 'draft')
  assertContentWriteAllowed(req.user, status)

  await prisma.location.create({
    data: {
      countryId: country.id,
      categoryId: category?.id || null,
      name,
      slug,
      type,
      city: optionalText(req.body.city),
      summary: optionalText(req.body.summary),
      history: optionalText(req.body.history),
      address: optionalText(req.body.address),
      openingHours: optionalText(req.body.openingHours),
      contact: optionalText(req.body.contact),
      latitude: req.body.latitude ?? req.body.lat ?? null,
      longitude: req.body.longitude ?? req.body.lng ?? null,
      imageUrl: optionalText(req.body.imageUrl || req.body.image),
      websiteUrl: optionalText(req.body.websiteUrl),
      tags: jsonArray(req.body.tags),
      relatedStorySlugs: jsonArray(req.body.relatedStoryIds),
      relatedArtifactSlugs: jsonArray(req.body.relatedArtifactIds),
      status,
      createdById: req.user.id,
    },
  })

  await writeAuditLog(req, {
    action: 'create',
    entityType: 'location',
    entityId: slug,
    entityTitle: name,
    metadata: { status, country: country.name },
  })

  sendCreated(res, { slug, status })
})

const updateLocation = asyncHandler(async (req, res) => {
  const row = await prisma.location.findFirst({ where: idOrSlug(req.params.slug) })
  if (!row) throw new ApiError(404, 'Location not found')
  assertContentWriteAllowed(req.user, req.body.status, row.status)

  const data = {}
  if (req.body.countrySlug || req.body.country) data.countryId = (await findCountry(req.body.countrySlug || req.body.country)).id
  if (req.body.type) data.categoryId = (await getOrCreateCategory(req.body.type)).id
  addData(data, 'name', patchText(req.body.name))
  addData(data, 'slug', patchText(req.body.slug))
  addData(data, 'type', patchText(req.body.type))
  addData(data, 'city', patchText(req.body.city))
  addData(data, 'summary', patchText(req.body.summary))
  addData(data, 'history', patchText(req.body.history))
  addData(data, 'address', patchText(req.body.address))
  addData(data, 'openingHours', patchText(req.body.openingHours))
  addData(data, 'contact', patchText(req.body.contact))
  addData(data, 'latitude', req.body.latitude ?? req.body.lat)
  addData(data, 'longitude', req.body.longitude ?? req.body.lng)
  addData(data, 'imageUrl', patchText(req.body.imageUrl ?? req.body.image))
  addData(data, 'websiteUrl', patchText(req.body.websiteUrl))
  if (req.body.tags !== undefined) data.tags = jsonArray(req.body.tags)
  if (req.body.relatedStoryIds !== undefined) data.relatedStorySlugs = jsonArray(req.body.relatedStoryIds)
  if (req.body.relatedArtifactIds !== undefined) data.relatedArtifactSlugs = jsonArray(req.body.relatedArtifactIds)
  if (req.body.status !== undefined) {
    data.status = normalizeStatus(req.body.status, contentStatuses, 'draft')
    assertContentWriteAllowed(req.user, data.status, row.status)
  }
  if (!Object.keys(data).length) throw new ApiError(400, 'No location fields to update')

  const updated = await prisma.location.update({ where: { id: row.id }, data })
  await writeAuditLog(req, {
    action: 'update',
    entityType: 'location',
    entityId: updated.slug,
    entityTitle: updated.name,
    metadata: { previousStatus: row.status, status: updated.status, fields: Object.keys(data) },
  })
  sendOk(res, { slug: updated.slug, status: updated.status })
})

const archiveLocation = asyncHandler(async (req, res) => {
  requireAdmin(req.user, 'Archiving records')
  const { row, updated } = await archiveRecord('location', req.params.slug)
  await writeAuditLog(req, {
    action: 'archive',
    entityType: 'location',
    entityId: updated.slug,
    entityTitle: updated.name,
    metadata: { previousStatus: row.status, status: updated.status },
  })
  sendOk(res, { slug: req.params.slug, status: 'archived' })
})

const createStory = asyncHandler(async (req, res) => {
  const title = requiredText(req.body.title, 'title')
  const slug = optionalText(req.body.slug) || slugify(title)
  const country = await findOptionalCountry(req.body.countrySlug || req.body.country)
  const status = normalizeStatus(req.body.status, contentStatuses, 'draft')
  assertContentWriteAllowed(req.user, status)

  const story = await prisma.story.create({
    data: {
      countryId: country?.id || null,
      title,
      slug,
      category: optionalText(req.body.category),
      summary: optionalText(req.body.summary),
      body: jsonArray(req.body.body),
      readTime: optionalText(req.body.readTime),
      imageUrl: optionalText(req.body.imageUrl || req.body.image),
      author: optionalText(req.body.author),
      relatedLocationSlugs: jsonArray(req.body.relatedLocationIds),
      relatedArtifactSlugs: jsonArray(req.body.relatedArtifactIds),
      status,
      createdById: req.user.id,
    },
  })

  await replaceStoryDetails(story.id, req.body.keyPoints || [], req.body.timeline || [])
  await writeAuditLog(req, {
    action: 'create',
    entityType: 'story',
    entityId: slug,
    entityTitle: title,
    metadata: { status, country: country?.name || null },
  })
  sendCreated(res, { slug, status })
})

const updateStory = asyncHandler(async (req, res) => {
  const row = await prisma.story.findFirst({ where: idOrSlug(req.params.slug) })
  if (!row) throw new ApiError(404, 'Story not found')
  assertContentWriteAllowed(req.user, req.body.status, row.status)

  const data = {}
  if (req.body.countrySlug || req.body.country) data.countryId = (await findOptionalCountry(req.body.countrySlug || req.body.country))?.id || null
  addData(data, 'title', patchText(req.body.title))
  addData(data, 'slug', patchText(req.body.slug))
  addData(data, 'category', patchText(req.body.category))
  addData(data, 'summary', patchText(req.body.summary))
  if (req.body.body !== undefined) data.body = jsonArray(req.body.body)
  addData(data, 'readTime', patchText(req.body.readTime))
  addData(data, 'imageUrl', patchText(req.body.imageUrl ?? req.body.image))
  addData(data, 'author', patchText(req.body.author))
  if (req.body.relatedLocationIds !== undefined) data.relatedLocationSlugs = jsonArray(req.body.relatedLocationIds)
  if (req.body.relatedArtifactIds !== undefined) data.relatedArtifactSlugs = jsonArray(req.body.relatedArtifactIds)
  if (req.body.status !== undefined) {
    data.status = normalizeStatus(req.body.status, contentStatuses, 'draft')
    assertContentWriteAllowed(req.user, data.status, row.status)
  }

  let updated = row
  if (Object.keys(data).length) updated = await prisma.story.update({ where: { id: row.id }, data })
  await replaceStoryDetails(row.id, req.body.keyPoints, req.body.timeline)
  await writeAuditLog(req, {
    action: 'update',
    entityType: 'story',
    entityId: updated.slug,
    entityTitle: updated.title,
    metadata: { previousStatus: row.status, status: updated.status, fields: Object.keys(data) },
  })
  sendOk(res, { slug: updated.slug, status: updated.status })
})

const archiveStory = asyncHandler(async (req, res) => {
  requireAdmin(req.user, 'Archiving records')
  const { row, updated } = await archiveRecord('story', req.params.slug)
  await writeAuditLog(req, {
    action: 'archive',
    entityType: 'story',
    entityId: updated.slug,
    entityTitle: updated.title,
    metadata: { previousStatus: row.status, status: updated.status },
  })
  sendOk(res, { slug: req.params.slug, status: 'archived' })
})

const createArtifact = asyncHandler(async (req, res) => {
  const name = requiredText(req.body.name, 'name')
  const slug = optionalText(req.body.slug) || slugify(name)
  const country = await findOptionalCountry(req.body.countrySlug || req.body.country)
  const status = normalizeStatus(req.body.status, contentStatuses, 'draft')
  assertContentWriteAllowed(req.user, status)

  await prisma.artifact.create({
    data: {
      countryId: country?.id || null,
      name,
      slug,
      origin: optionalText(req.body.origin),
      period: optionalText(req.body.period),
      summary: optionalText(req.body.summary),
      significance: optionalText(req.body.significance),
      imageUrl: optionalText(req.body.imageUrl || req.body.image),
      relatedLocationSlug: optionalText(req.body.relatedLocationId),
      relatedStorySlugs: jsonArray(req.body.relatedStoryIds),
      status,
      createdById: req.user.id,
    },
  })

  await writeAuditLog(req, {
    action: 'create',
    entityType: 'artifact',
    entityId: slug,
    entityTitle: name,
    metadata: { status, country: country?.name || null },
  })

  sendCreated(res, { slug, status })
})

const updateArtifact = asyncHandler(async (req, res) => {
  const row = await prisma.artifact.findFirst({ where: idOrSlug(req.params.slug) })
  if (!row) throw new ApiError(404, 'Artifact not found')
  assertContentWriteAllowed(req.user, req.body.status, row.status)

  const data = {}
  if (req.body.countrySlug || req.body.country) data.countryId = (await findOptionalCountry(req.body.countrySlug || req.body.country))?.id || null
  addData(data, 'name', patchText(req.body.name))
  addData(data, 'slug', patchText(req.body.slug))
  addData(data, 'origin', patchText(req.body.origin))
  addData(data, 'period', patchText(req.body.period))
  addData(data, 'summary', patchText(req.body.summary))
  addData(data, 'significance', patchText(req.body.significance))
  addData(data, 'imageUrl', patchText(req.body.imageUrl ?? req.body.image))
  addData(data, 'relatedLocationSlug', patchText(req.body.relatedLocationId))
  if (req.body.relatedStoryIds !== undefined) data.relatedStorySlugs = jsonArray(req.body.relatedStoryIds)
  if (req.body.status !== undefined) {
    data.status = normalizeStatus(req.body.status, contentStatuses, 'draft')
    assertContentWriteAllowed(req.user, data.status, row.status)
  }
  if (!Object.keys(data).length) throw new ApiError(400, 'No artifact fields to update')

  const updated = await prisma.artifact.update({ where: { id: row.id }, data })
  await writeAuditLog(req, {
    action: 'update',
    entityType: 'artifact',
    entityId: updated.slug,
    entityTitle: updated.name,
    metadata: { previousStatus: row.status, status: updated.status, fields: Object.keys(data) },
  })
  sendOk(res, { slug: updated.slug, status: updated.status })
})

const archiveArtifact = asyncHandler(async (req, res) => {
  requireAdmin(req.user, 'Archiving records')
  const { row, updated } = await archiveRecord('artifact', req.params.slug)
  await writeAuditLog(req, {
    action: 'archive',
    entityType: 'artifact',
    entityId: updated.slug,
    entityTitle: updated.name,
    metadata: { previousStatus: row.status, status: updated.status },
  })
  sendOk(res, { slug: req.params.slug, status: 'archived' })
})

const getLocalSecretsQueue = asyncHandler(async (req, res) => {
  const status = req.query.status || 'submitted'
  if (!localSecretStatuses.has(status)) throw new ApiError(400, 'Invalid local secret status')
  const rows = await prisma.localSecret.findMany({
    where: { status },
    include: { country: true, user: true },
    orderBy: { createdAt: 'asc' },
  })
  sendOk(res, rows.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    city: row.city,
    tip: row.tip,
    helpful: row.helpfulCount,
    status: row.status,
    createdAt: row.createdAt,
    country: row.country.name,
    submittedBy: row.user?.name || null,
  })), { count: rows.length })
})

const updateLocalSecretStatus = asyncHandler(async (req, res) => {
  const status = normalizeStatus(req.body.status, localSecretStatuses, null)
  assertLocalSecretStatusAllowed(req.user, status)

  const row = await prisma.localSecret.findUnique({ where: { id: Number(req.params.id) } })
  if (!row) throw new ApiError(404, 'Local secret not found')
  const updated = await prisma.localSecret.update({ where: { id: row.id }, data: { status } })
  await writeAuditLog(req, {
    action: 'moderate',
    entityType: 'localSecret',
    entityId: updated.id,
    entityTitle: updated.title,
    metadata: { previousStatus: row.status, status: updated.status },
  })
  sendOk(res, { id: req.params.id, status })
})

const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Image file is required')

  const storedImage = await storeUploadedImage(req.file, req)
  const asset = await prisma.mediaAsset.create({
    data: {
      ownerId: req.user.id,
      url: storedImage.url,
      publicId: storedImage.publicId,
      altText: optionalText(req.body.altText),
      sourceCredit: optionalText(req.body.sourceCredit),
      mimeType: req.file.mimetype,
    },
  })

  await writeAuditLog(req, {
    action: 'upload',
    entityType: 'mediaAsset',
    entityId: asset.id,
    entityTitle: asset.publicId,
    metadata: { mimeType: asset.mimeType, sourceCredit: asset.sourceCredit, provider: storedImage.provider },
  })

  sendCreated(res, {
    id: asset.id,
    url: asset.url,
    altText: asset.altText,
    sourceCredit: asset.sourceCredit,
    mimeType: asset.mimeType,
    storageProvider: storedImage.provider,
  })
})

module.exports = {
  listAuditLogs,
  listUsers,
  updateUser,
  listCountries,
  createCountry,
  updateCountry,
  listCultureGuides,
  upsertCultureGuide,
  archiveCultureGuide,
  listSources,
  createSource,
  updateSource,
  deleteSource,
  listLocations,
  createLocation,
  updateLocation,
  archiveLocation,
  listStories,
  createStory,
  updateStory,
  archiveStory,
  listArtifacts,
  createArtifact,
  updateArtifact,
  archiveArtifact,
  getLocalSecretsQueue,
  updateLocalSecretStatus,
  uploadMedia,
}
