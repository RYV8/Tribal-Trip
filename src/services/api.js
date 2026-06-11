const DEFAULT_API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api'
const REQUEST_TIMEOUT_MS = 2200
const PUBLIC_CATALOG_CACHE_KEY = 'tribe-trip-public-catalog-cache'
const CULTURE_GUIDES_CACHE_KEY = 'tribe-trip-culture-guides-cache'

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'api_error', payload = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.payload = payload
  }
}

export function isAuthError(error) {
  return error instanceof ApiError && error.status === 401
}

function getApiBaseUrl() {
  const runtimeApiUrl = typeof window !== 'undefined' ? window.TRIBE_TRIP_CONFIG?.apiUrl : ''
  return (runtimeApiUrl || import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '')
}

async function fetchJson(path, options = {}) {
  const { body, timeoutMs, token, headers, ...fetchOptions } = options
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs ?? REQUEST_TIMEOUT_MS)
  const requestHeaders = {
    Accept: 'application/json',
    ...(body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers || {}),
  }

  try {
    let response
    try {
      response = await fetch(`${getApiBaseUrl()}${path}`, {
        headers: requestHeaders,
        signal: controller.signal,
        body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
        ...fetchOptions,
      })
    } catch (err) {
      const timedOut = err?.name === 'AbortError'
      throw new ApiError(
        timedOut ? 'Request timed out. Check your connection and retry.' : 'Unable to reach the Tribe Trip API. Check your connection and retry.',
        { status: 0, code: timedOut ? 'timeout' : 'network_error' },
      )
    }

    const payload = await response.json().catch(() => null)
    if (!response.ok || payload?.success === false) {
      throw new ApiError(payload?.message || `API request failed: ${response.status}`, {
        status: response.status,
        code: payload?.code || 'api_error',
        payload,
      })
    }

    return payload?.data ?? payload
  } finally {
    window.clearTimeout(timeout)
  }
}

function toNameList(items) {
  return items.map((item) => (typeof item === 'string' ? item : item.name)).filter(Boolean)
}

function readCachedJson(key, fallback = null) {
  try {
    const stored = window.localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

function writeCachedJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Cache writes are best-effort; the API response is still usable.
  }
}

export async function loadPublicCatalog() {
  const [countries, categories, locations, stories, artifacts] = await Promise.all([
    fetchJson('/countries'),
    fetchJson('/categories'),
    fetchJson('/locations'),
    fetchJson('/stories'),
    fetchJson('/artifacts'),
  ])

  const catalog = {
    countries: toNameList(countries),
    categories: toNameList(categories),
    locations,
    stories,
    artifacts,
  }

  writeCachedJson(PUBLIC_CATALOG_CACHE_KEY, catalog)
  return catalog
}

export async function loadCultureGuides() {
  const guides = await fetchJson('/culture-guides', { timeoutMs: 5000 })
  writeCachedJson(CULTURE_GUIDES_CACHE_KEY, guides)
  return guides
}

export function getCachedPublicCatalog() {
  return readCachedJson(PUBLIC_CATALOG_CACHE_KEY)
}

export function getCachedCultureGuides() {
  return readCachedJson(CULTURE_GUIDES_CACHE_KEY)
}

export function searchCatalog(query) {
  return fetchJson(`/search?q=${encodeURIComponent(query)}`, { timeoutMs: 5000 })
}

export function registerUser(payload) {
  return fetchJson('/auth/register', { method: 'POST', body: payload, timeoutMs: 5000 })
}

export function loginUser(payload) {
  return fetchJson('/auth/login', { method: 'POST', body: payload, timeoutMs: 5000 })
}

export function getProfile(token) {
  return fetchJson('/profile', { token })
}

export function updateProfile(token, payload) {
  return fetchJson('/profile', { method: 'PUT', token, body: payload })
}

export function getFavorites(token) {
  return fetchJson('/favorites', { token })
}

export function addFavorite(token, itemType, itemId) {
  return fetchJson('/favorites', { method: 'POST', token, body: { itemType, itemId } })
}

export function removeFavorite(token, itemType, itemId) {
  return fetchJson('/favorites', { method: 'DELETE', token, body: { itemType, itemId } })
}

export function getLocalSecrets(country) {
  const query = country ? `?country=${encodeURIComponent(country)}` : ''
  return fetchJson(`/local-secrets${query}`)
}

export function createLocalSecret(token, payload) {
  return fetchJson('/local-secrets', { method: 'POST', token, body: payload, timeoutMs: 5000 })
}

export function markLocalSecretHelpful(id) {
  return fetchJson(`/local-secrets/${id}/helpful`, { method: 'POST' })
}

export function createAdminLocation(token, payload) {
  return fetchJson('/admin/locations', { method: 'POST', token, body: payload, timeoutMs: 5000 })
}

export function getAdminLocations(token, status = 'all') {
  return fetchJson(`/admin/locations?status=${encodeURIComponent(status)}`, { token, timeoutMs: 5000 })
}

export function updateAdminLocation(token, slug, payload) {
  return fetchJson(`/admin/locations/${encodeURIComponent(slug)}`, { method: 'PUT', token, body: payload, timeoutMs: 5000 })
}

export function archiveAdminLocation(token, slug) {
  return fetchJson(`/admin/locations/${encodeURIComponent(slug)}`, { method: 'DELETE', token, timeoutMs: 5000 })
}

export function createAdminStory(token, payload) {
  return fetchJson('/admin/stories', { method: 'POST', token, body: payload, timeoutMs: 5000 })
}

export function getAdminStories(token, status = 'all') {
  return fetchJson(`/admin/stories?status=${encodeURIComponent(status)}`, { token, timeoutMs: 5000 })
}

export function updateAdminStory(token, slug, payload) {
  return fetchJson(`/admin/stories/${encodeURIComponent(slug)}`, { method: 'PUT', token, body: payload, timeoutMs: 5000 })
}

export function archiveAdminStory(token, slug) {
  return fetchJson(`/admin/stories/${encodeURIComponent(slug)}`, { method: 'DELETE', token, timeoutMs: 5000 })
}

export function createAdminArtifact(token, payload) {
  return fetchJson('/admin/artifacts', { method: 'POST', token, body: payload, timeoutMs: 5000 })
}

export function getAdminArtifacts(token, status = 'all') {
  return fetchJson(`/admin/artifacts?status=${encodeURIComponent(status)}`, { token, timeoutMs: 5000 })
}

export function updateAdminArtifact(token, slug, payload) {
  return fetchJson(`/admin/artifacts/${encodeURIComponent(slug)}`, { method: 'PUT', token, body: payload, timeoutMs: 5000 })
}

export function archiveAdminArtifact(token, slug) {
  return fetchJson(`/admin/artifacts/${encodeURIComponent(slug)}`, { method: 'DELETE', token, timeoutMs: 5000 })
}

export function uploadAdminMedia(token, file, metadata = {}) {
  const formData = new FormData()
  formData.append('image', file)
  if (metadata.altText) formData.append('altText', metadata.altText)
  if (metadata.sourceCredit) formData.append('sourceCredit', metadata.sourceCredit)
  return fetchJson('/admin/media', { method: 'POST', token, body: formData, timeoutMs: 15000 })
}

export function getAdminAuditLogs(token, limit = 50) {
  return fetchJson(`/admin/audit-logs?limit=${encodeURIComponent(limit)}`, { token, timeoutMs: 5000 })
}

export function getAdminUsers(token) {
  return fetchJson('/admin/users', { token, timeoutMs: 5000 })
}

export function updateAdminUser(token, id, payload) {
  return fetchJson(`/admin/users/${encodeURIComponent(id)}`, { method: 'PATCH', token, body: payload, timeoutMs: 5000 })
}

export function getAdminSources(token, filters = {}) {
  const params = new URLSearchParams()
  if (filters.itemType) params.set('itemType', filters.itemType)
  if (filters.itemId) params.set('itemId', filters.itemId)
  const query = params.toString() ? `?${params.toString()}` : ''
  return fetchJson(`/admin/sources${query}`, { token, timeoutMs: 5000 })
}

export function createAdminSource(token, payload) {
  return fetchJson('/admin/sources', { method: 'POST', token, body: payload, timeoutMs: 5000 })
}

export function updateAdminSource(token, id, payload) {
  return fetchJson(`/admin/sources/${encodeURIComponent(id)}`, { method: 'PUT', token, body: payload, timeoutMs: 5000 })
}

export function deleteAdminSource(token, id) {
  return fetchJson(`/admin/sources/${encodeURIComponent(id)}`, { method: 'DELETE', token, timeoutMs: 5000 })
}

export function getAdminCountries(token) {
  return fetchJson('/admin/countries', { token, timeoutMs: 5000 })
}

export function createAdminCountry(token, payload) {
  return fetchJson('/admin/countries', { method: 'POST', token, body: payload, timeoutMs: 5000 })
}

export function updateAdminCountry(token, slug, payload) {
  return fetchJson(`/admin/countries/${encodeURIComponent(slug)}`, { method: 'PUT', token, body: payload, timeoutMs: 5000 })
}

export function getAdminCultureGuides(token) {
  return fetchJson('/admin/culture-guides', { token, timeoutMs: 5000 })
}

export function updateAdminCultureGuide(token, countrySlug, payload) {
  return fetchJson(`/admin/culture-guides/${encodeURIComponent(countrySlug)}`, { method: 'PUT', token, body: payload, timeoutMs: 8000 })
}

export function archiveAdminCultureGuide(token, countrySlug) {
  return fetchJson(`/admin/culture-guides/${encodeURIComponent(countrySlug)}`, { method: 'DELETE', token, timeoutMs: 5000 })
}

export function getAdminLocalSecrets(token, status = 'submitted') {
  return fetchJson(`/admin/local-secrets?status=${encodeURIComponent(status)}`, { token })
}

export function updateAdminLocalSecretStatus(token, id, status) {
  return fetchJson(`/admin/local-secrets/${id}`, { method: 'PATCH', token, body: { status } })
}

export function getConfiguredApiUrl() {
  return getApiBaseUrl()
}
