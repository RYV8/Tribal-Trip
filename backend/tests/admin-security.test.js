const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const bcrypt = require('bcryptjs')

const app = require('../src/app')
const { prisma } = require('../src/config/db')

let server
let baseUrl
let adminToken
let editorToken
let userToken
let adminUser
let managedToken
let managedUser
let uploadedPublicId

async function request(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: options.method || 'GET',
    headers: {
      Accept: 'application/json',
      ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? (options.body instanceof FormData ? options.body : JSON.stringify(options.body)) : undefined,
  })
  const payload = await response.json().catch(() => null)
  return { status: response.status, payload, headers: response.headers }
}

async function login(email, password) {
  const response = await request('/api/auth/login', { method: 'POST', body: { email, password } })
  assert.equal(response.status, 200)
  return response.payload.data.token
}

async function seedUser({ name, email, password, role }) {
  return prisma.user.create({
    data: {
      name,
      email,
      role,
      passwordHash: await bcrypt.hash(password, 4),
    },
  })
}

test.before(async () => {
  server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}`

  const country = await prisma.country.create({
    data: { name: 'Benin', slug: 'benin', code: 'BJ', isAvailable: true },
  })
  const category = await prisma.category.create({ data: { name: 'Museum', slug: 'museum' } })

  await prisma.location.createMany({
    data: [
      {
        countryId: country.id,
        categoryId: category.id,
        name: 'Published Test Museum',
        slug: 'published-test-museum',
        type: 'Museum',
        summary: 'Visible public record.',
        history: 'Public history.',
        status: 'published',
      },
      {
        countryId: country.id,
        categoryId: category.id,
        name: 'Private Review Museum',
        slug: 'private-review-museum',
        type: 'Museum',
        summary: 'Private review record.',
        history: 'Private history.',
        status: 'review',
      },
    ],
  })

  adminUser = await seedUser({ name: 'Admin Tester', email: 'admin@test.local', password: 'AdminPass123', role: 'admin' })
  await seedUser({ name: 'Editor Tester', email: 'editor@test.local', password: 'EditorPass123', role: 'editor' })
  await seedUser({ name: 'User Tester', email: 'user@test.local', password: 'UserPass123', role: 'user' })
  managedUser = await seedUser({ name: 'Managed Tester', email: 'managed@test.local', password: 'ManagedPass123', role: 'user' })

  adminToken = await login('admin@test.local', 'AdminPass123')
  editorToken = await login('editor@test.local', 'EditorPass123')
  userToken = await login('user@test.local', 'UserPass123')
  managedToken = await login('managed@test.local', 'ManagedPass123')
})

test.after(async () => {
  if (uploadedPublicId) fs.rmSync(path.join(__dirname, '..', 'uploads', uploadedPublicId), { force: true })
  await prisma.$disconnect()
  await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())))
})

test('public catalogue only returns published records', async () => {
  const response = await request('/api/locations?status=all')
  assert.equal(response.status, 200)
  const names = response.payload.data.map((item) => item.name)
  assert.ok(names.includes('Published Test Museum'))
  assert.ok(!names.includes('Private Review Museum'))

  const privateDetail = await request('/api/locations/private-review-museum')
  assert.equal(privateDetail.status, 404)
})

test('api responses include security and rate limit headers', async () => {
  const response = await request('/api/health', { headers: { 'X-Request-Id': 'test-request-1234' } })
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('x-request-id'), 'test-request-1234')
  assert.equal(response.payload.requestId, 'test-request-1234')
  assert.equal(response.headers.get('x-powered-by'), null)
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
  assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN')
  assert.ok(response.headers.get('content-security-policy')?.includes("default-src 'self'"))
  assert.ok(response.headers.get('ratelimit'))
})

test('health endpoints separate live and ready checks', async () => {
  const live = await request('/api/live')
  assert.equal(live.status, 200)
  assert.equal(live.payload.status, 'live')
  assert.ok(live.headers.get('x-request-id'))

  const ready = await request('/api/ready')
  assert.equal(ready.status, 200)
  assert.equal(ready.payload.status, 'ready')
  assert.equal(ready.payload.database, 'ready')
})

test('request validation rejects malformed write payloads', async () => {
  const invalidRegister = await request('/api/auth/register', {
    method: 'POST',
    body: { name: 'Bad Email', email: 'not-an-email', password: 'short' },
  })
  assert.equal(invalidRegister.status, 400)
  assert.equal(invalidRegister.payload.message, 'Invalid request payload')
  assert.ok(invalidRegister.payload.requestId)
  assert.ok(invalidRegister.payload.details.some((detail) => detail.startsWith('email:')))

  const invalidFavorite = await request('/api/favorites', {
    method: 'POST',
    token: userToken,
    body: { itemType: 'museum', itemId: '' },
  })
  assert.equal(invalidFavorite.status, 400)
  assert.equal(invalidFavorite.payload.message, 'Invalid request payload')

  const invalidStatus = await request('/api/admin/locations?status=live', { token: editorToken })
  assert.equal(invalidStatus.status, 400)
  assert.equal(invalidStatus.payload.message, 'Invalid request payload')
})

test('admin routes require an editorial role', async () => {
  const noToken = await request('/api/admin/locations')
  assert.equal(noToken.status, 401)

  const normalUser = await request('/api/admin/locations', { token: userToken })
  assert.equal(normalUser.status, 403)
})

test('editor can prepare review records but cannot publish, archive, or read audit logs', async () => {
  const created = await request('/api/admin/locations', {
    method: 'POST',
    token: editorToken,
    body: {
      name: 'Editor Review Museum',
      type: 'Museum',
      country: 'Benin',
      city: 'Cotonou',
      summary: 'Editor creates review content for admin approval.',
      history: 'This record verifies editor permissions for review workflow.',
      status: 'review',
    },
  })
  assert.equal(created.status, 201)
  assert.equal(created.payload.data.status, 'review')

  const published = await request('/api/admin/locations', {
    method: 'POST',
    token: editorToken,
    body: {
      name: 'Editor Published Museum',
      type: 'Museum',
      country: 'Benin',
      summary: 'Editor should not publish.',
      history: 'Publishing must require admin access.',
      status: 'published',
    },
  })
  assert.equal(published.status, 403)

  const archived = await request(`/api/admin/locations/${created.payload.data.slug}`, { method: 'DELETE', token: editorToken })
  assert.equal(archived.status, 403)

  const audit = await request('/api/admin/audit-logs', { token: editorToken })
  assert.equal(audit.status, 403)
})

test('admin can archive records and read audit logs', async () => {
  const created = await request('/api/admin/locations', {
    method: 'POST',
    token: adminToken,
    body: {
      name: 'Admin Archive Museum',
      type: 'Museum',
      country: 'Benin',
      city: 'Cotonou',
      summary: 'Admin creates a record for archive verification.',
      history: 'This record verifies admin archive permissions and audit logging.',
      status: 'review',
    },
  })
  assert.equal(created.status, 201)

  const archived = await request(`/api/admin/locations/${created.payload.data.slug}`, { method: 'DELETE', token: adminToken })
  assert.equal(archived.status, 200)
  assert.equal(archived.payload.data.status, 'archived')

  const audit = await request('/api/admin/audit-logs', { token: adminToken })
  assert.equal(audit.status, 200)
  const actions = audit.payload.data.map((item) => item.action)
  assert.ok(actions.includes('create'))
  assert.ok(actions.includes('archive'))
})

test('local secret moderation respects editor and admin boundaries', async () => {
  const submitted = await request('/api/local-secrets', {
    method: 'POST',
    body: {
      type: 'Cultural note',
      countrySlug: 'Benin',
      title: 'Quiet courtyard test',
      city: 'Cotonou',
      tip: 'A useful local suggestion for moderation tests.',
    },
  })
  assert.equal(submitted.status, 201)

  const review = await request(`/api/admin/local-secrets/${submitted.payload.data.id}`, {
    method: 'PATCH',
    token: editorToken,
    body: { status: 'review' },
  })
  assert.equal(review.status, 200)
  assert.equal(review.payload.data.status, 'review')

  const editorPublish = await request(`/api/admin/local-secrets/${submitted.payload.data.id}`, {
    method: 'PATCH',
    token: editorToken,
    body: { status: 'published' },
  })
  assert.equal(editorPublish.status, 403)

  const adminPublish = await request(`/api/admin/local-secrets/${submitted.payload.data.id}`, {
    method: 'PATCH',
    token: adminToken,
    body: { status: 'published' },
  })
  assert.equal(adminPublish.status, 200)

  const publicSecrets = await request('/api/local-secrets')
  assert.equal(publicSecrets.status, 200)
  assert.ok(publicSecrets.payload.data.some((item) => item.title === 'Quiet courtyard test'))
})

test('media upload rejects non-images and accepts allowed image types', async () => {
  const badForm = new FormData()
  badForm.append('image', new Blob(['plain text'], { type: 'text/plain' }), 'bad.txt')
  const badUpload = await request('/api/admin/media', { method: 'POST', token: adminToken, body: badForm })
  assert.equal(badUpload.status, 400)

  const goodForm = new FormData()
  goodForm.append('image', new Blob([Buffer.from('fake-png')], { type: 'image/png' }), 'good.png')
  const goodUpload = await request('/api/admin/media', { method: 'POST', token: adminToken, body: goodForm })
  assert.equal(goodUpload.status, 201)
  assert.match(goodUpload.payload.data.url, /\/uploads\//)
  assert.equal(goodUpload.payload.data.storageProvider, 'local')
  uploadedPublicId = goodUpload.payload.data.url.split('/uploads/')[1]
})

test('content sources are editorial-managed and visible on public catalogue records', async () => {
  const invalid = await request('/api/admin/sources', {
    method: 'POST',
    token: editorToken,
    body: {
      itemType: 'location',
      itemId: 'published-test-museum',
      title: 'Invalid source URL',
      url: 'ftp://example.test/source',
    },
  })
  assert.equal(invalid.status, 400)

  const created = await request('/api/admin/sources', {
    method: 'POST',
    token: editorToken,
    body: {
      itemType: 'location',
      itemId: 'published-test-museum',
      title: 'Museum catalogue note',
      url: 'https://example.test/museum-catalogue',
      note: 'Used to verify public source display.',
    },
  })
  assert.equal(created.status, 201)
  assert.equal(created.payload.data.itemId, 'published-test-museum')

  const listed = await request('/api/admin/sources?itemType=location&itemId=published-test-museum', { token: editorToken })
  assert.equal(listed.status, 200)
  assert.ok(listed.payload.data.some((source) => source.id === created.payload.data.id))

  const publicLocations = await request('/api/locations')
  assert.equal(publicLocations.status, 200)
  const published = publicLocations.payload.data.find((location) => location.id === 'published-test-museum')
  assert.ok(published.sources.some((source) => source.title === 'Museum catalogue note'))

  const updated = await request(`/api/admin/sources/${created.payload.data.id}`, {
    method: 'PUT',
    token: editorToken,
    body: { note: 'Updated citation note.' },
  })
  assert.equal(updated.status, 200)
  assert.equal(updated.payload.data.note, 'Updated citation note.')

  const editorDelete = await request(`/api/admin/sources/${created.payload.data.id}`, { method: 'DELETE', token: editorToken })
  assert.equal(editorDelete.status, 403)

  const adminDelete = await request(`/api/admin/sources/${created.payload.data.id}`, { method: 'DELETE', token: adminToken })
  assert.equal(adminDelete.status, 200)
})

test('country and culture guide administration respects editorial boundaries', async () => {
  const editorCountry = await request('/api/admin/countries', {
    method: 'POST',
    token: editorToken,
    body: { name: 'Testland', code: 'TL', isAvailable: true },
  })
  assert.equal(editorCountry.status, 403)

  const country = await request('/api/admin/countries', {
    method: 'POST',
    token: adminToken,
    body: { name: 'Testland', code: 'TL', region: 'Test Region', isAvailable: true, mapLat: 1.2, mapLng: 3.4 },
  })
  assert.equal(country.status, 201)
  assert.equal(country.payload.data.slug, 'testland')

  const reviewGuide = await request('/api/admin/culture-guides/testland', {
    method: 'PUT',
    token: editorToken,
    body: {
      languages: ['Testish'],
      overview: 'A review guide prepared by an editor.',
      status: 'review',
      phrases: [{ language: 'Testish', english: 'Hello', local: 'Talo', pronunciation: 'tah-loh', context: 'Greeting', status: 'review' }],
      greetings: ['Greet elders first.'],
      etiquette: ['Ask before taking photos.'],
      taboos: ['Do not enter private courtyards.'],
      foods: [{ name: 'Test stew', description: 'A local test food.', commonIn: ['Testland'], status: 'review' }],
      foodSpots: [{ name: 'Test market', city: 'Test City', specialty: 'Test stew', priceLevel: '$', status: 'review' }],
      musicStyles: [{ name: 'Test drums', description: 'Community percussion.', context: 'Festival context.', status: 'review' }],
      clothingStyles: [{ name: 'Test cloth', description: 'Formal woven cloth.', context: 'Ceremony context.', status: 'review' }],
    },
  })
  assert.equal(reviewGuide.status, 200)
  assert.equal(reviewGuide.payload.data.status, 'review')

  const publicReview = await request('/api/culture-guides/testland')
  assert.equal(publicReview.status, 404)

  const editorPublish = await request('/api/admin/culture-guides/testland', {
    method: 'PUT',
    token: editorToken,
    body: { status: 'published' },
  })
  assert.equal(editorPublish.status, 403)

  const published = await request('/api/admin/culture-guides/testland', {
    method: 'PUT',
    token: adminToken,
    body: {
      languages: ['Testish'],
      overview: 'A published guide prepared for public reading.',
      status: 'published',
      phrases: [{ language: 'Testish', english: 'Hello', local: 'Talo', pronunciation: 'tah-loh', context: 'Greeting', status: 'published' }],
      greetings: ['Greet elders first.'],
      etiquette: ['Ask before taking photos.'],
      taboos: ['Do not enter private courtyards.'],
      foods: [{ name: 'Test stew', description: 'A local test food.', commonIn: ['Testland'], status: 'published' }],
      foodSpots: [{ name: 'Test market', city: 'Test City', specialty: 'Test stew', priceLevel: '$', status: 'published' }],
      musicStyles: [{ name: 'Test drums', description: 'Community percussion.', context: 'Festival context.', status: 'published' }],
      clothingStyles: [{ name: 'Test cloth', description: 'Formal woven cloth.', context: 'Ceremony context.', status: 'published' }],
    },
  })
  assert.equal(published.status, 200)
  assert.equal(published.payload.data.status, 'published')

  const publicGuide = await request('/api/culture-guides/testland')
  assert.equal(publicGuide.status, 200)
  assert.equal(publicGuide.payload.data.phrases.length, 1)
  assert.equal(publicGuide.payload.data.phrases[0].status, 'published')

  const editorPublishedEdit = await request('/api/admin/culture-guides/testland', {
    method: 'PUT',
    token: editorToken,
    body: { overview: 'Editor should not edit published guide.' },
  })
  assert.equal(editorPublishedEdit.status, 403)
})

test('admin user management lists users, limits role changes, and blocks disabled accounts', async () => {
  const editorList = await request('/api/admin/users', { token: editorToken })
  assert.equal(editorList.status, 403)

  const listed = await request('/api/admin/users', { token: adminToken })
  assert.equal(listed.status, 200)
  const managed = listed.payload.data.find((user) => user.email === 'managed@test.local')
  assert.ok(managed)
  assert.equal(managed.passwordHash, undefined)

  const promoted = await request(`/api/admin/users/${managedUser.id}`, {
    method: 'PATCH',
    token: adminToken,
    body: { role: 'editor' },
  })
  assert.equal(promoted.status, 200)
  assert.equal(promoted.payload.data.role, 'editor')

  const adminPromotion = await request(`/api/admin/users/${managedUser.id}`, {
    method: 'PATCH',
    token: adminToken,
    body: { role: 'admin' },
  })
  assert.equal(adminPromotion.status, 403)

  const selfDisable = await request(`/api/admin/users/${adminUser.id}`, {
    method: 'PATCH',
    token: adminToken,
    body: { isActive: false },
  })
  assert.equal(selfDisable.status, 400)

  const disabled = await request(`/api/admin/users/${managedUser.id}`, {
    method: 'PATCH',
    token: adminToken,
    body: { isActive: false },
  })
  assert.equal(disabled.status, 200)
  assert.equal(disabled.payload.data.isActive, false)

  const profile = await request('/api/profile', { token: managedToken })
  assert.equal(profile.status, 401)

  const loginDisabled = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'managed@test.local', password: 'ManagedPass123' },
  })
  assert.equal(loginDisabled.status, 401)
})
