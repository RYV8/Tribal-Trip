import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Archive,
  BookOpen,
  Building2,
  Clock,
  Compass,
  Heart,
  History,
  Home,
  Landmark,
  Layers,
  LocateFixed,
  LogIn,
  LogOut,
  Map,
  MapPinned,
  MapPin,
  Moon,
  Navigation,
  Plus,
  Route,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  User,
  UserPlus,
} from 'lucide-react'
import './App.css'
import { artifacts, categories, countries, locations, stories } from './data/content'
import { cultureGuides, unavailableAfricaPoints } from './data/cultureGuides'
import {
  addFavorite as addRemoteFavorite,
  archiveAdminArtifact,
  archiveAdminCultureGuide,
  archiveAdminLocation,
  archiveAdminStory,
  createAdminArtifact,
  createAdminCountry,
  createAdminLocation,
  createAdminSource,
  createAdminStory,
  createLocalSecret as createRemoteLocalSecret,
  deleteAdminSource,
  getAdminArtifacts,
  getAdminAuditLogs,
  getAdminCountries,
  getAdminCultureGuides,
  getAdminLocations,
  getAdminLocalSecrets,
  getAdminSources,
  getAdminStories,
  getAdminUsers,
  getCachedCultureGuides,
  getCachedPublicCatalog,
  getFavorites,
  getLocalSecrets,
  getProfile,
  isAuthError,
  loadCultureGuides,
  loadPublicCatalog,
  loginUser,
  markLocalSecretHelpful as markRemoteLocalSecretHelpful,
  registerUser,
  removeFavorite as removeRemoteFavorite,
  searchCatalog,
  updateAdminArtifact,
  updateAdminCountry,
  updateAdminCultureGuide,
  updateAdminLocation,
  updateAdminLocalSecretStatus,
  updateAdminSource,
  updateAdminStory,
  updateAdminUser,
  updateProfile,
  uploadAdminMedia,
} from './services/api'

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'discover', label: 'Discover', icon: Compass },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'culture', label: 'Culture', icon: BookOpen },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'profile', label: 'Profile', icon: User },
]

const desktopNavItems = [
  { id: 'home', label: 'Home' },
  { id: 'discover', label: 'Discover' },
  { id: 'map', label: 'Map' },
  { id: 'culture', label: 'Culture Guide' },
  { id: 'stories', label: 'Stories' },
  { id: 'artifacts', label: 'Explore' },
  { id: 'search', label: 'Search' },
]

const parentScreen = {
  locationDetail: 'discover',
  storyDetail: 'stories',
  artifactDetail: 'artifacts',
}

const countryProfiles = {
  Benin: 'Dahomey palaces, Ouidah memory, Vodun context, and lake communities.',
  Nigeria: 'Edo court art, Yoruba sacred landscapes, Nok archaeology, and Lagos museums.',
  "Cote d'Ivoire": 'Grand-Bassam urban memory, Senufo art, clothing, and regional identity.',
  Togo: 'Batammariba living architecture, national collections, and northern cultural landscapes.',
  Ghana: 'Asante kingship, Akan gold knowledge, kente, and Atlantic memory sites.',
  Kenya: 'Swahili coast cities, Indian Ocean routes, carved doors, and coastal architecture.',
  Niger: 'Agadez, Tuareg craft, Sahelian cities, and trans-Saharan exchange.',
  'Burkina Faso': 'Loropeni ruins, regional trade, music, Lobi figures, and living performance.',
  Congo: 'Loango coastal memory, Kongo ritual objects, and regional museum heritage.',
  Guinea: 'Fouta Djallon highlands, Baga masks, national collections, and landscape memory.',
}

const culturalRoutes = [
  {
    id: 'atlantic-memory-routes',
    title: 'Atlantic Memory Route',
    region: 'Benin · Nigeria · Ghana',
    description: 'Ouidah, Badagry, and Cape Coast as connected sites of remembrance, diaspora, and historical literacy.',
  },
  {
    id: 'swahili-coast',
    title: 'Swahili Coast Route',
    region: 'Kenya',
    description: 'Fort Jesus and Lamu reveal Indian Ocean exchange, Swahili urban life, architecture, and maritime culture.',
  },
  {
    id: 'akan-asante-heritage',
    title: 'Akan and Asante Route',
    region: 'Ghana',
    description: 'Goldweights, kente, Manhyia Palace, and Cape Coast connect kingship, trade, symbols, and memory.',
  },
  {
    id: 'trans-saharan-agadez',
    title: 'Sahel Trade Route',
    region: 'Niger',
    description: 'Agadez links Tuareg craft, earthen architecture, Islam, caravans, and trans-Saharan history.',
  },
]

const themeOptions = [
  'All',
  'Kingdoms',
  'Sacred Sites',
  'Atlantic Memory',
  'Art & Objects',
  'Living Traditions',
  'Architecture',
  'Trade Routes',
]

const themeKeywords = {
  Kingdoms: ['kingdom', 'royal', 'palace', 'kingship', 'asante', 'dahomey', 'benin city', 'loango', 'edo'],
  'Sacred Sites': ['sacred', 'ritual', 'spiritual', 'shrine', 'vodun', 'osun', 'ceremony'],
  'Atlantic Memory': ['atlantic', 'memory', 'slave', 'coast', 'diaspora', 'forced migration', 'badagry', 'ouidah', 'cape coast'],
  'Art & Objects': ['art', 'artifact', 'museum', 'bronze', 'mask', 'textile', 'goldweight', 'kente', 'craft', 'gallery'],
  'Living Traditions': ['living', 'tradition', 'community', 'performance', 'music', 'festival', 'identity', 'ceremony'],
  Architecture: ['architecture', 'earthen', 'town', 'urban', 'fort', 'house', 'door', 'built', 'landscape'],
  'Trade Routes': ['trade', 'route', 'caravan', 'gold', 'saharan', 'indian ocean', 'commerce', 'exchange'],
}

const appName = 'Tribe Trip'
const favoriteKey = 'tribe-trip-favorites'
const themeKey = 'tribe-trip-theme'
const historyKey = 'tribe-trip-history'
const preferencesKey = 'tribe-trip-preferences'
const localContentKey = 'tribe-trip-local-content'
const localSecretsKey = 'tribe-trip-local-secrets'
const profilePhotoKey = 'tribe-trip-profile-photo'
const authTokenKey = 'tribe-trip-auth-token'
const legacyKeys = {
  favorites: 'tribal-tripe-favorites',
  theme: 'tribal-tripe-theme',
  history: 'tribal-tripe-history',
  preferences: 'tribal-tripe-preferences',
  localContent: 'tribal-tripe-local-content',
  splash: 'tribal-tripe-splash-seen',
}

function buildFavorite(item, type) {
  return {
    id: item.id,
    type,
    title: item.name ?? item.title,
    subtitle: item.city ? `${item.city}, ${item.country}` : item.country ?? item.origin ?? type,
    image: item.image || '/hero-grand-bassam.jpg',
  }
}

function resolveRemoteFavorite(favorite, collections) {
  const type = favorite.type || favorite.itemType
  const id = favorite.itemId || favorite.id
  const collection = collections[type]
  const item = collection?.find((entry) => entry.id === id)
  if (item) return buildFavorite(item, type)
  return { id, type, title: id, subtitle: type, image: '/hero-grand-bassam.jpg' }
}

function canManageContent(user) {
  return ['editor', 'admin', 'super_admin'].includes(user?.role)
}

function canAdministerContent(user) {
  return ['admin', 'super_admin'].includes(user?.role)
}

const emptyFilters = {
  country: 'All',
  category: 'All',
  theme: 'All',
  distance: 'All',
  sort: 'Featured',
}

const emptyPreferences = {
  preferredCountry: 'All',
  contentDensity: 'Comfortable',
}

const emptyLocalContent = {
  locations: [],
  stories: [],
  artifacts: [],
}

const stableImageFallback = '/hero-grand-bassam.jpg'

function normalizeImageUrl(image) {
  if (!image) return stableImageFallback
  return String(image).includes('upload.wikimedia.org') ? stableImageFallback : image
}

function normalizeCatalogItems(items = []) {
  return items.map((item) => ({ ...item, image: normalizeImageUrl(item.image) }))
}

const emptyLocalSecret = {
  type: 'Hidden place',
  country: 'Benin',
  title: '',
  city: '',
  tip: '',
}

const distanceOptions = ['All', '10 km', '50 km', '250 km', '1000 km']
const sortOptions = ['Featured', 'Nearest', 'A-Z']
const searchKinds = ['All', 'Places', 'Stories', 'Artifacts']
const cultureTabs = ['Phrases', 'Etiquette', 'Food', 'Music', 'Clothing', 'Places']
const contentStatusOptions = ['draft', 'review', 'published', 'archived']
const editorialStatusFilters = ['all', ...contentStatusOptions]
const localSecretModerationStatuses = ['submitted', 'review', 'published', 'rejected', 'archived']
const userRoleOptions = ['user', 'editor', 'admin', 'super_admin']
const editorAssignableRoles = ['user', 'editor']
const sourceItemTypes = ['location', 'story', 'artifact']
const sourceItemTypeLabels = {
  location: 'Place',
  story: 'Story',
  artifact: 'Artifact',
}
const adminTabLabels = {
  locations: 'Places',
  stories: 'Stories',
  artifacts: 'Artifacts',
  countries: 'Countries',
  'culture-guides': 'Culture Guides',
  sources: 'Sources',
  'local-secrets': 'Suggestions',
  users: 'Users',
  audit: 'Audit',
}
const adminContentConfig = {
  locations: {
    label: 'place',
    load: getAdminLocations,
    create: createAdminLocation,
    update: updateAdminLocation,
    archive: archiveAdminLocation,
  },
  stories: {
    label: 'story',
    load: getAdminStories,
    create: createAdminStory,
    update: updateAdminStory,
    archive: archiveAdminStory,
  },
  artifacts: {
    label: 'artifact',
    load: getAdminArtifacts,
    create: createAdminArtifact,
    update: updateAdminArtifact,
    archive: archiveAdminArtifact,
  },
}

function validatePublishPayload(section, payload) {
  if (payload.status !== 'published') return ''
  const title = payload.name || payload.title
  if (!title || title.length < 3) return 'A clear title is required before publishing.'
  if (!payload.country) return 'Country is required before publishing.'
  if (!payload.image) return 'A main image is required before publishing.'
  if (!payload.summary || payload.summary.length < 80) return 'Summary must be at least 80 characters before publishing.'
  if (section === 'locations' && (!payload.history || payload.history.length < 120)) return 'Historical context must be at least 120 characters before publishing a place.'
  if (section === 'stories' && (!payload.body?.length || !payload.keyPoints?.length || !payload.timeline?.length)) return 'Story body, key points, and timeline are required before publishing.'
  if (section === 'artifacts' && (!payload.significance || payload.significance.length < 100)) return 'Cultural significance must be at least 100 characters before publishing an artifact.'
  return ''
}

const getStoryById = (id, storyList = stories) => storyList.find((story) => story.id === id)

function locationMatchesTheme(location, theme, storyList = stories) {
  if (!theme || theme === 'All') return true
  const relatedStoryText = (location.relatedStoryIds ?? [])
    .map((id) => getStoryById(id, storyList))
    .filter(Boolean)
    .map((story) => [story.title, story.summary, story.country, story.category, story.keyPoints?.join(' ')].join(' '))
    .join(' ')
  const haystack = [location.name, location.type, location.country, location.city, location.summary, location.history, location.tags?.join(' '), relatedStoryText]
    .join(' ')
    .toLowerCase()

  return themeKeywords[theme]?.some((keyword) => haystack.includes(keyword.toLowerCase())) ?? true
}

function getCountryStats(country, locationList = locations, storyList = stories) {
  const countryLocations = locationList.filter((location) => location.country === country)
  const countryStories = storyList.filter((story) => story.country?.includes(country))
  return {
    locations: countryLocations.length,
    stories: countryStories.length,
    image: countryLocations[0]?.image,
  }
}

function getWhyItMatters(story) {
  if (story.keyPoints?.length) return story.keyPoints.join(' ')
  return story.summary
}

function getStoredJson(primaryKey, fallback, legacyKey) {
  try {
    const stored = localStorage.getItem(primaryKey) ?? (legacyKey ? localStorage.getItem(legacyKey) : null)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

function getStoredFavorites() {
  return getStoredJson(favoriteKey, [], legacyKeys.favorites) ?? []
}

function getStoredHistory() {
  return getStoredJson(historyKey, [], legacyKeys.history) ?? []
}

function getStoredPreferences() {
  return { ...emptyPreferences, ...(getStoredJson(preferencesKey, {}, legacyKeys.preferences) ?? {}) }
}

function getStoredLocalContent() {
  return { ...emptyLocalContent, ...(getStoredJson(localContentKey, {}, legacyKeys.localContent) ?? {}) }
}

function getStoredLocalSecrets() {
  return getStoredJson(localSecretsKey, []) ?? []
}

function buildCatalogState(remoteCatalog = {}) {
  return {
    countries: remoteCatalog.countries?.length ? remoteCatalog.countries : countries,
    categories: remoteCatalog.categories?.length ? remoteCatalog.categories : categories,
    locations: normalizeCatalogItems(remoteCatalog.locations?.length ? remoteCatalog.locations : locations),
    stories: normalizeCatalogItems(remoteCatalog.stories?.length ? remoteCatalog.stories : stories),
    artifacts: normalizeCatalogItems(remoteCatalog.artifacts?.length ? remoteCatalog.artifacts : artifacts),
  }
}

function getInitialCatalogState() {
  return buildCatalogState(getCachedPublicCatalog() ?? {})
}

function getInitialCultureGuideCatalog() {
  const cachedGuides = getCachedCultureGuides()
  return cachedGuides?.length ? cachedGuides : cultureGuides
}

function getInitialCatalogStatus() {
  return getCachedPublicCatalog()
    ? { source: 'cache', message: 'Showing last synced catalogue while checking for updates.' }
    : { source: 'local', message: 'Showing bundled catalogue content while checking the API.' }
}

function getStoredProfilePhoto() {
  try {
    return localStorage.getItem(profilePhotoKey) ?? ''
  } catch {
    return ''
  }
}

function getStoredAuthToken() {
  try {
    return localStorage.getItem(authTokenKey) ?? ''
  } catch {
    return ''
  }
}

function getStoredTheme() {
  try {
    const storedTheme = localStorage.getItem(themeKey) ?? localStorage.getItem(legacyKeys.theme)
    if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme
  } catch {
    return 'light'
  }

  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'

  return 'light'
}

function getDistanceKm(start, end) {
  if (!start || !end) return null
  const radiusKm = 6371
  const lat1 = (start.lat * Math.PI) / 180
  const lat2 = (end.lat * Math.PI) / 180
  const deltaLat = ((end.lat - start.lat) * Math.PI) / 180
  const deltaLng = ((end.lng - start.lng) * Math.PI) / 180
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2
  return radiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(distanceKm) {
  if (distanceKm == null) return null
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m away`
  if (distanceKm < 100) return `${distanceKm.toFixed(1)} km away`
  return `${Math.round(distanceKm)} km away`
}

function parseDistanceLimit(option) {
  if (!option || option === 'All') return null
  return Number(option.replace(' km', ''))
}

function sortLocations(locationList, sort, userLocation) {
  const sortable = [...locationList]
  if (sort === 'A-Z') return sortable.sort((a, b) => a.name.localeCompare(b.name))
  if (sort === 'Nearest' && userLocation) {
    return sortable.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
  }
  return sortable
}

function filterLocations(locationList, filterState, storyList, userLocation) {
  const distanceLimit = parseDistanceLimit(filterState.distance)

  return sortLocations(
    locationList
      .map((location) => ({
        ...location,
        distanceKm: getDistanceKm(userLocation, location.coordinates),
      }))
      .filter((location) => {
        const countryMatch = filterState.country === 'All' || location.country === filterState.country
        const categoryMatch = filterState.category === 'All' || location.type === filterState.category
        const themeMatch = locationMatchesTheme(location, filterState.theme, storyList)
        const distanceMatch = !distanceLimit || (location.distanceKm != null && location.distanceKm <= distanceLimit)
        return countryMatch && categoryMatch && themeMatch && distanceMatch
      }),
    filterState.sort,
    userLocation,
  )
}

function getAllCountries(locationList, storyList, artifactList, baseCountries = countries, guideList = cultureGuides) {
  return Array.from(
    new Set([
      ...baseCountries,
      ...guideList.map((guide) => guide.country).filter(Boolean),
      ...locationList.map((location) => location.country).filter(Boolean),
      ...storyList.flatMap((story) => (story.country ? story.country.split(' · ') : [])).filter(Boolean),
      ...artifactList.map((artifact) => artifact.country).filter(Boolean),
    ]),
  )
}

function slugFromText(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function createLocalId(prefix, value) {
  return `${prefix}-${slugFromText(value)}-${Date.now()}`
}

function parseOptionalNumber(value) {
  const text = value == null ? '' : value.toString().trim()
  if (!text) return null
  const parsed = Number(text)
  return Number.isFinite(parsed) ? parsed : null
}

function parseCommaList(value) {
  return (value?.toString() || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseLineList(value) {
  return (value?.toString() || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseTextBlocks(value) {
  const text = value?.toString().trim()
  if (!text) return []
  return text.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean)
}

function parseTimeline(value) {
  return parseLineList(value).map((line) => {
    const [period, ...rest] = line.split(':')
    return rest.length
      ? { period: period.trim(), text: rest.join(':').trim() }
      : { period: 'Context', text: line }
  })
}

function parsePipeRows(value, mapper) {
  return parseLineList(value).map((line) => mapper(line.split('|').map((part) => part.trim()))).filter(Boolean)
}

function phraseRowsToFormText(value = []) {
  return value.map((item) => [item.language, item.english, item.local, item.pronunciation, item.context, item.status].filter((part) => part != null).join(' | ')).join('\n')
}

function foodRowsToFormText(value = []) {
  return value.map((item) => [item.name, item.description, listToFormText(item.commonIn), item.status].filter((part) => part != null).join(' | ')).join('\n')
}

function foodSpotRowsToFormText(value = []) {
  return value.map((item) => [item.name, item.city, item.specialty, item.priceLevel, item.coordinates?.lat, item.coordinates?.lng, item.status].filter((part) => part != null).join(' | ')).join('\n')
}

function styleRowsToFormText(value = []) {
  return value.map((item) => [item.name, item.description, item.context, item.status].filter((part) => part != null).join(' | ')).join('\n')
}

function listToFormText(value, separator = ', ') {
  return Array.isArray(value) ? value.join(separator) : ''
}

function storyBodyToFormText(value) {
  return Array.isArray(value) ? value.join('\n\n') : (value || '')
}

function timelineToFormText(value) {
  return Array.isArray(value) ? value.map((item) => `${item.period}: ${item.text}`).join('\n') : ''
}

function statusNoteClass(source) {
  if (source === 'api') return 'status-note ready'
  if (source === 'error' || source === 'blocked') return 'status-note blocked'
  return 'status-note'
}

function getGalleryImages(primary, relatedItems = []) {
  return Array.from(new Set([primary, ...relatedItems.map((item) => item?.image).filter(Boolean)])).slice(0, 5)
}

function getArtifactPeriodGroup(period = '') {
  const value = period.toLowerCase()
  if (value.includes('bce') || value.includes('ce') || value.includes('12th') || value.includes('15th') || value.includes('16th') || value.includes('17th')) return 'Historical'
  if (value.includes('living') || value.includes('20th')) return 'Living tradition'
  return 'All periods'
}

function getCultureGuide(country, guideList = cultureGuides) {
  return guideList.find((guide) => guide.country === country) ?? guideList[0] ?? cultureGuides[0]
}

function getAvailableGuideCountries(guideList = cultureGuides) {
  return guideList.filter((guide) => guide.available !== false).map((guide) => guide.country)
}

const africaAvailabilityOffsets = {
  Benin: { x: 42, y: 2 },
  Togo: { x: 20, y: 42 },
  Ghana: { x: -22, y: 62 },
  "Cote d'Ivoire": { x: -28, y: 32 },
  Guinea: { x: -44, y: -10 },
  'Burkina Faso': { x: -8, y: -38 },
  Niger: { x: 40, y: -34 },
  Nigeria: { x: 58, y: 20 },
  Congo: { x: 56, y: 58 },
  Kenya: { x: 58, y: 0 },
}

function offsetMapPosition(position, offset = {}) {
  const left = offset.x ? `calc(${position.left} + ${offset.x}px)` : position.left
  const top = offset.y ? `calc(${position.top} + ${offset.y}px)` : position.top
  return {
    left: `clamp(14%, ${left}, 86%)`,
    top: `clamp(10%, ${top}, 88%)`,
  }
}

function getAfricaPointPosition(point) {
  if (!point) return { left: '50%', top: '50%' }
  const bounds = { minLat: -35, maxLat: 38, minLng: -18, maxLng: 52 }
  return getMapPosition(point, bounds)
}

function getAfricaAvailabilityPosition(guide) {
  return offsetMapPosition(getAfricaPointPosition(guide.mapPoint), africaAvailabilityOffsets[guide.country])
}

function App() {
  const [screen, setScreen] = useState('home')
  const [selected, setSelected] = useState(null)
  const [filters, setFilters] = useState(emptyFilters)
  const [query, setQuery] = useState('')
  const [favorites, setFavorites] = useState(getStoredFavorites)
  const [theme, setTheme] = useState(getStoredTheme)
  const [historyItems, setHistoryItems] = useState(getStoredHistory)
  const [preferences, setPreferences] = useState(getStoredPreferences)
  const [localContent, setLocalContent] = useState(getStoredLocalContent)
  const [localSecrets, setLocalSecrets] = useState(getStoredLocalSecrets)
  const [localSecretStatus, setLocalSecretStatus] = useState({ source: 'local', message: 'Suggestions are saved on this device until they are submitted.' })
  const [profilePhoto, setProfilePhoto] = useState(getStoredProfilePhoto)
  const [authToken, setAuthToken] = useState(getStoredAuthToken)
  const [currentUser, setCurrentUser] = useState(null)
  const [authStatus, setAuthStatus] = useState(authToken ? 'loading' : 'guest')
  const [authMessage, setAuthMessage] = useState('')
  const [profileStatus, setProfileStatus] = useState('idle')
  const [catalog, setCatalog] = useState(getInitialCatalogState)
  const [cultureGuideCatalog, setCultureGuideCatalog] = useState(getInitialCultureGuideCatalog)
  const [catalogStatus, setCatalogStatus] = useState(getInitialCatalogStatus)
  const [selectedCultureCountry, setSelectedCultureCountry] = useState(() => getStoredPreferences().preferredCountry)
  const [isOnline, setIsOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  const [userLocation, setUserLocation] = useState(null)
  const [geoStatus, setGeoStatus] = useState('idle')
  const [geoMessage, setGeoMessage] = useState('')
  const [showSplash, setShowSplash] = useState(() => {
    try {
      return !sessionStorage.getItem('tribe-trip-splash-seen') && !sessionStorage.getItem(legacyKeys.splash)
    } catch {
      return true
    }
  })

  const allowLocalPrototypeContent = !authToken && !currentUser
  const appLocations = useMemo(() => [...catalog.locations, ...(allowLocalPrototypeContent ? (localContent.locations ?? []) : [])], [allowLocalPrototypeContent, catalog.locations, localContent.locations])
  const appStories = useMemo(() => [...catalog.stories, ...(allowLocalPrototypeContent ? (localContent.stories ?? []) : [])], [allowLocalPrototypeContent, catalog.stories, localContent.stories])
  const appArtifacts = useMemo(() => [...catalog.artifacts, ...(allowLocalPrototypeContent ? (localContent.artifacts ?? []) : [])], [allowLocalPrototypeContent, catalog.artifacts, localContent.artifacts])
  const appCountries = useMemo(() => getAllCountries(appLocations, appStories, appArtifacts, catalog.countries, cultureGuideCatalog), [appArtifacts, appLocations, appStories, catalog.countries, cultureGuideCatalog])
  const appCategories = useMemo(
    () => Array.from(new Set([...catalog.categories, ...appLocations.map((location) => location.type).filter(Boolean)])),
    [appLocations, catalog.categories],
  )
  const favoriteCollections = useMemo(
    () => ({ location: appLocations, story: appStories, artifact: appArtifacts }),
    [appArtifacts, appLocations, appStories],
  )

  const expireSession = useCallback((message = 'Session expired. Sign in again to continue.') => {
    setAuthToken('')
    setCurrentUser(null)
    setAuthStatus('guest')
    setAuthMessage(message)
    setScreen((currentScreen) => (currentScreen === 'admin' ? 'profile' : currentScreen))
  }, [])

  const hydrateRemoteFavorites = useCallback(async (token, seedFavorites = []) => {
    if (seedFavorites.length) {
      await Promise.allSettled(seedFavorites.map((favorite) => addRemoteFavorite(token, favorite.type, favorite.id)))
    }
    const remoteFavorites = await getFavorites(token)
    setFavorites(remoteFavorites.map((favorite) => resolveRemoteFavorite(favorite, favoriteCollections)))
  }, [favoriteCollections])

  const refreshCatalog = useCallback(async () => {
    try {
      const [remoteCatalog, remoteGuides] = await Promise.all([loadPublicCatalog(), loadCultureGuides().catch(() => [])])
      setCatalog(buildCatalogState(remoteCatalog))
      if (remoteGuides.length) setCultureGuideCatalog(remoteGuides)
      setCatalogStatus({ source: 'api', message: 'Catalogue is up to date.' })
    } catch {
      const cachedCatalog = getCachedPublicCatalog()
      const cachedGuides = getCachedCultureGuides()
      if (cachedCatalog) setCatalog(buildCatalogState(cachedCatalog))
      if (cachedGuides?.length) setCultureGuideCatalog(cachedGuides)
      setCatalogStatus(
        cachedCatalog
          ? { source: 'cache', message: 'Showing last synced catalogue. API refresh failed.' }
          : { source: 'local', message: 'Showing bundled catalogue content. API refresh failed.' },
      )
    }
  }, [])

  const refreshLocalSecrets = useCallback(async () => {
    const secrets = await getLocalSecrets()
    setLocalSecrets((current) => {
      const remoteItems = secrets.map((secret) => ({ ...secret, synced: true, status: 'published' }))
      const remoteById = new globalThis.Map(remoteItems.map((secret) => [String(secret.id), secret]))
      const updatedCurrent = current.map((secret) => remoteById.get(String(secret.id)) || secret)
      const existingIds = new Set(updatedCurrent.map((secret) => String(secret.id)))
      return [...remoteItems.filter((secret) => !existingIds.has(String(secret.id))), ...updatedCurrent]
    })
    setLocalSecretStatus({ source: 'api', message: 'Community suggestions are up to date.' })
  }, [])

  useEffect(() => {
    let cancelled = false
    Promise.all([loadPublicCatalog(), loadCultureGuides().catch(() => [])])
      .then(([remoteCatalog, remoteGuides]) => {
        if (cancelled) return
        setCatalog(buildCatalogState(remoteCatalog))
        if (remoteGuides.length) setCultureGuideCatalog(remoteGuides)
        setCatalogStatus({ source: 'api', message: 'Catalogue is up to date.' })
      })
      .catch(() => {
        if (cancelled) return
        const cachedCatalog = getCachedPublicCatalog()
        const cachedGuides = getCachedCultureGuides()
        if (cachedCatalog) setCatalog(buildCatalogState(cachedCatalog))
        if (cachedGuides?.length) setCultureGuideCatalog(cachedGuides)
        setCatalogStatus(
          cachedCatalog
            ? { source: 'cache', message: 'Showing last synced catalogue until API updates are available.' }
            : { source: 'local', message: 'Showing bundled catalogue content until API updates are available.' },
        )
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    getLocalSecrets()
      .then((secrets) => {
        if (cancelled) return
        setLocalSecrets((current) => {
          const remoteItems = secrets.map((secret) => ({ ...secret, synced: true, status: 'published' }))
          const remoteById = new globalThis.Map(remoteItems.map((secret) => [String(secret.id), secret]))
          const updatedCurrent = current.map((secret) => remoteById.get(String(secret.id)) || secret)
          const existingIds = new Set(updatedCurrent.map((secret) => String(secret.id)))
          return [...remoteItems.filter((secret) => !existingIds.has(String(secret.id))), ...updatedCurrent]
        })
        setLocalSecretStatus({ source: 'api', message: 'Community suggestions are up to date.' })
      })
      .catch(() => {
        if (!cancelled) setLocalSecretStatus({ source: 'local', message: 'Suggestions can still be saved on this device.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme

    const favicon = document.querySelector("link[rel='icon']")
    if (favicon) {
      favicon.href = theme === 'dark' ? '/logo-mark-dark.png' : '/logo-mark-light.png'
      favicon.type = 'image/png'
    }

    localStorage.setItem(themeKey, theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem(favoriteKey, JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    localStorage.setItem(historyKey, JSON.stringify(historyItems))
  }, [historyItems])

  useEffect(() => {
    localStorage.setItem(preferencesKey, JSON.stringify(preferences))
  }, [preferences])

  useEffect(() => {
    localStorage.setItem(localContentKey, JSON.stringify(localContent))
  }, [localContent])

  useEffect(() => {
    localStorage.setItem(localSecretsKey, JSON.stringify(localSecrets))
  }, [localSecrets])

  useEffect(() => {
    if (profilePhoto) localStorage.setItem(profilePhotoKey, profilePhoto)
    else localStorage.removeItem(profilePhotoKey)
  }, [profilePhoto])

  useEffect(() => {
    if (authToken) localStorage.setItem(authTokenKey, authToken)
    else localStorage.removeItem(authTokenKey)
  }, [authToken])

  useEffect(() => {
    if (!authToken) {
      return undefined
    }

    let cancelled = false
    getProfile(authToken)
      .then(async (profile) => {
        if (cancelled) return
        setCurrentUser(profile)
        setAuthStatus('authenticated')
        setAuthMessage('')
        if (profile.preferredCountry) {
          setPreferences((current) => ({ ...current, preferredCountry: profile.preferredCountry }))
        }
        if (profile.avatarUrl) setProfilePhoto(profile.avatarUrl)
        await hydrateRemoteFavorites(authToken)
      })
      .catch((err) => {
        if (cancelled) return
        if (isAuthError(err)) {
          expireSession('Session expired. Sign in again to continue.')
          return
        }
        setCurrentUser(null)
        setAuthStatus('guest')
        setAuthMessage(err.message || 'Unable to verify your session. Retry when the API is reachable.')
      })

    return () => {
      cancelled = true
    }
  }, [authToken, expireSession, hydrateRemoteFavorites])

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  useEffect(() => {
    if (!showSplash) return undefined
    const timer = window.setTimeout(() => {
      try {
        sessionStorage.setItem('tribe-trip-splash-seen', 'true')
      } catch {
        // Ignore unavailable session storage in restricted browsers.
      }
      setShowSplash(false)
    }, 1400)
    return () => window.clearTimeout(timer)
  }, [showSplash])

  const favoriteIds = useMemo(() => new Set(favorites.map((item) => item.id)), [favorites])

  const recordHistory = (item, type) => {
    if (!item) return
    const entry = {
      id: item.id,
      type,
      title: item.name ?? item.title,
      subtitle: item.city ? `${item.city}, ${item.country}` : item.country ?? item.origin,
      image: item.image,
      visitedAt: new Date().toISOString(),
    }

    setHistoryItems((current) => [entry, ...current.filter((saved) => saved.id !== entry.id)].slice(0, 12))
  }

  const openScreen = (nextScreen, item = null) => {
    setSelected(item)
    setScreen(nextScreen)
    if (nextScreen === 'locationDetail') recordHistory(item, 'location')
    if (nextScreen === 'storyDetail') recordHistory(item, 'story')
    if (nextScreen === 'artifactDetail') recordHistory(item, 'artifact')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('blocked')
      setGeoMessage('Geolocation is not available in this browser.')
      return
    }

    setGeoStatus('loading')
    setGeoMessage('Requesting your position...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude })
        setGeoStatus('ready')
        setGeoMessage('Nearby sorting is active for this session.')
      },
      () => {
        setGeoStatus('blocked')
        setGeoMessage('Location permission was not granted. Country and theme filters still work.')
      },
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 300000 },
    )
  }

  const addLocalContent = (type, item) => {
    setLocalContent((current) => ({
      ...current,
      [type]: [item, ...(current[type] ?? [])],
    }))
  }

  const clearLocalContent = (type) => {
    setLocalContent((current) => ({
      ...current,
      [type]: [],
    }))
  }

  const addLocalSecret = async (secret) => {
    const localSecret = {
      id: createLocalId('local-secret', secret.title || secret.type),
      createdAt: new Date().toISOString(),
      helpful: 0,
      status: 'local',
      synced: false,
      ...secret,
    }

    setLocalSecrets((current) => [localSecret, ...current])
    setLocalSecretStatus({ source: 'saving', message: 'Submitting local secret...' })

    try {
      const result = await createRemoteLocalSecret(authToken, {
        type: secret.type,
        countrySlug: secret.country,
        title: secret.title,
        city: secret.city,
        tip: secret.tip,
      })
      setLocalSecrets((current) => current.map((item) => (item.id === localSecret.id ? { ...item, id: result.id, status: result.status, synced: true } : item)))
      setLocalSecretStatus({ source: 'api', message: 'Suggestion submitted for review.' })
    } catch (err) {
      if (isAuthError(err)) {
        expireSession('Session expired. Sign in again to submit suggestions.')
        return
      }
      setLocalSecretStatus({ source: 'local', message: err.message || 'Saved on this device. Please retry submission when connection returns.' })
    }
  }

  const removeLocalSecret = (secretId) => {
    setLocalSecrets((current) => current.filter((secret) => secret.id !== secretId))
  }

  const markLocalSecretHelpful = async (secretId) => {
    setLocalSecrets((current) => current.map((secret) => (secret.id === secretId ? { ...secret, helpful: secret.helpful + 1 } : secret)))
    if (Number.isFinite(Number(secretId))) {
      try {
        await markRemoteLocalSecretHelpful(secretId)
      } catch (err) {
        setLocalSecretStatus({ source: 'local', message: err.message || 'Helpful mark saved locally only.' })
      }
    }
  }

  const submitAuth = async (mode, payload) => {
    setAuthStatus('loading')
    setAuthMessage('')
    try {
      const result = mode === 'register' ? await registerUser(payload) : await loginUser(payload)
      setAuthToken(result.token)
      setCurrentUser(result.user)
      setAuthStatus('authenticated')
      setAuthMessage(mode === 'register' ? 'Account created.' : 'Signed in.')
      await hydrateRemoteFavorites(result.token, favorites)
    } catch (err) {
      setAuthStatus('guest')
      setAuthMessage(err.message || 'Authentication failed.')
    }
  }

  const logout = () => {
    setAuthToken('')
    setCurrentUser(null)
    setAuthStatus('guest')
    setAuthMessage('Signed out.')
  }

  const saveProfile = async (updates) => {
    if (!authToken) return
    setProfileStatus('saving')
    setAuthMessage('')
    try {
      await updateProfile(authToken, updates)
      const profile = await getProfile(authToken)
      setCurrentUser(profile)
      setProfileStatus('saved')
      setAuthMessage('Profile updated.')
      if (profile.preferredCountry) setPreferences((current) => ({ ...current, preferredCountry: profile.preferredCountry }))
      if (profile.avatarUrl) setProfilePhoto(profile.avatarUrl)
    } catch (err) {
      if (isAuthError(err)) {
        expireSession('Session expired. Sign in again to update your profile.')
        return
      }
      setProfileStatus('error')
      setAuthMessage(err.message || 'Profile update failed.')
    }
  }

  const clearFavorites = async () => {
    const previous = favorites
    setFavorites([])
    if (authToken && currentUser) {
      await Promise.allSettled(previous.map((favorite) => removeRemoteFavorite(authToken, favorite.type, favorite.id)))
    }
  }

  const toggleFavorite = async (item, type) => {
    const favorite = buildFavorite(item, type)
    const exists = favorites.some((saved) => saved.id === item.id)

    setFavorites((current) =>
      current.some((saved) => saved.id === item.id)
        ? current.filter((saved) => saved.id !== item.id)
        : [favorite, ...current],
    )

    if (!authToken || !currentUser) return

    try {
      if (exists) await removeRemoteFavorite(authToken, type, item.id)
      else await addRemoteFavorite(authToken, type, item.id)
    } catch (err) {
      if (isAuthError(err)) {
        expireSession('Session expired. Sign in again to sync saved items.')
        return
      }
      setAuthMessage(err.message || 'Saved library sync failed.')
      await hydrateRemoteFavorites(authToken)
    }
  }

  const goBack = () => {
    if (screen === 'locationDetail') openScreen('discover')
    else if (screen === 'storyDetail') openScreen('stories')
    else if (screen === 'artifactDetail') openScreen('artifacts')
    else openScreen('home')
  }

  const activeScreen = parentScreen[screen] ?? screen
  const logoMark = theme === 'dark' ? '/logo-mark-dark.png' : '/logo-mark-light.png'
  const logoFull = theme === 'dark' ? '/logo-dark.jpeg' : '/logo-light.jpeg'
  const themeToggleLabel = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  const renderScreen = () => {
    if (screen === 'discover') {
      return (
        <DiscoverScreen
          locations={appLocations}
          stories={appStories}
          countries={appCountries}
          categories={appCategories}
          filters={filters}
          setFilters={setFilters}
          openScreen={openScreen}
          favoriteIds={favoriteIds}
          toggleFavorite={toggleFavorite}
          userLocation={userLocation}
          geoStatus={geoStatus}
          geoMessage={geoMessage}
          requestUserLocation={requestUserLocation}
        />
      )
    }

    if (screen === 'map') {
      return (
        <MapScreen
          locations={appLocations}
          stories={appStories}
          cultureGuideCatalog={cultureGuideCatalog}
          countries={appCountries}
          categories={appCategories}
          filters={filters}
          setFilters={setFilters}
          openScreen={openScreen}
          favoriteIds={favoriteIds}
          toggleFavorite={toggleFavorite}
          userLocation={userLocation}
          geoStatus={geoStatus}
          geoMessage={geoMessage}
          requestUserLocation={requestUserLocation}
          setSelectedCultureCountry={setSelectedCultureCountry}
        />
      )
    }

    if (screen === 'culture') {
      return (
        <CultureGuideScreen
          countries={appCountries}
          locations={appLocations}
          guides={cultureGuideCatalog}
          selectedCountry={selectedCultureCountry}
          setSelectedCountry={setSelectedCultureCountry}
          setFilters={setFilters}
          openScreen={openScreen}
        />
      )
    }

    if (screen === 'locationDetail' && selected) {
      return (
        <LocationDetail
          location={selected}
          stories={appStories}
          artifacts={appArtifacts}
          goBack={goBack}
          openScreen={openScreen}
          isFavorite={favoriteIds.has(selected.id)}
          toggleFavorite={() => toggleFavorite(selected, 'location')}
        />
      )
    }

    if (screen === 'stories') {
      return (
        <StoriesScreen
          stories={appStories}
          countries={appCountries}
          openScreen={openScreen}
          favoriteIds={favoriteIds}
          toggleFavorite={toggleFavorite}
        />
      )
    }

    if (screen === 'storyDetail' && selected) {
      return (
        <StoryDetail
          story={selected}
          locations={appLocations}
          artifacts={appArtifacts}
          goBack={goBack}
          openScreen={openScreen}
          isFavorite={favoriteIds.has(selected.id)}
          toggleFavorite={() => toggleFavorite(selected, 'story')}
        />
      )
    }

    if (screen === 'artifacts') {
      return (
        <ArtifactsScreen
          artifacts={appArtifacts}
          countries={appCountries}
          openScreen={openScreen}
          favoriteIds={favoriteIds}
          toggleFavorite={toggleFavorite}
        />
      )
    }

    if (screen === 'artifactDetail' && selected) {
      return (
        <ArtifactDetail
          artifact={selected}
          locations={appLocations}
          stories={appStories}
          goBack={goBack}
          openScreen={openScreen}
          isFavorite={favoriteIds.has(selected.id)}
          toggleFavorite={() => toggleFavorite(selected, 'artifact')}
        />
      )
    }

    if (screen === 'search') {
      return (
        <SearchScreen
          locations={appLocations}
          stories={appStories}
          artifacts={appArtifacts}
          countries={appCountries}
          categories={appCategories}
          query={query}
          setQuery={setQuery}
          openScreen={openScreen}
          favoriteIds={favoriteIds}
          toggleFavorite={toggleFavorite}
        />
      )
    }

    if (screen === 'saved') {
      return <SavedScreen favorites={favorites} openSavedItem={openSavedItem} clearSaved={clearFavorites} />
    }

    if (screen === 'profile') {
      return (
        <ProfileScreen
          openScreen={openScreen}
          logoFull={logoFull}
          countries={appCountries}
          locations={appLocations}
          stories={appStories}
          artifacts={appArtifacts}
          historyItems={historyItems}
          openHistoryItem={openSavedItem}
          clearHistory={() => setHistoryItems([])}
          preferences={preferences}
          setPreferences={setPreferences}
          geoStatus={geoStatus}
          geoMessage={geoMessage}
          requestUserLocation={requestUserLocation}
          favorites={favorites}
          openSavedItem={openSavedItem}
          clearSaved={clearFavorites}
          profilePhoto={profilePhoto}
          setProfilePhoto={setProfilePhoto}
          currentUser={currentUser}
          authStatus={authStatus}
          authMessage={authMessage}
          profileStatus={profileStatus}
          submitAuth={submitAuth}
          logout={logout}
          saveProfile={saveProfile}
          localSecrets={localSecrets}
          localSecretStatus={localSecretStatus}
          addLocalSecret={addLocalSecret}
          removeLocalSecret={removeLocalSecret}
          markLocalSecretHelpful={markLocalSecretHelpful}
          isOnline={isOnline}
          catalogStatus={catalogStatus}
        />
      )
    }

    if (screen === 'admin') {
      return (
        <AdminScreen
          addLocalContent={addLocalContent}
          clearLocalContent={clearLocalContent}
          localContent={localContent}
          countries={appCountries}
          categories={appCategories}
          locations={appLocations}
          stories={appStories}
          artifacts={appArtifacts}
          cultureGuideCatalog={cultureGuideCatalog}
          authToken={authToken}
          currentUser={currentUser}
          refreshCatalog={refreshCatalog}
          refreshLocalSecrets={refreshLocalSecrets}
          onAuthExpired={expireSession}
        />
      )
    }

    return (
      <HomeScreen
        locations={appLocations}
        stories={appStories}
        artifacts={appArtifacts}
        countries={appCountries}
        openScreen={openScreen}
        setFilters={setFilters}
        setQuery={setQuery}
      />
    )
  }

  const openSavedItem = (favorite) => {
    const collection = {
      location: appLocations,
      story: appStories,
      artifact: appArtifacts,
    }[favorite.type]
    const item = collection?.find((entry) => entry.id === favorite.id)

    if (!item) return

    openScreen(`${favorite.type}Detail`, item)
  }

  return (
    <div className={activeScreen === 'admin' ? 'app-shell admin-shell' : 'app-shell'}>
      {showSplash && (
        <SplashScreen
          logoFull={logoFull}
          onSkip={() => {
            try {
              sessionStorage.setItem('tribe-trip-splash-seen', 'true')
            } catch {
              // Ignore unavailable session storage in restricted browsers.
            }
            setShowSplash(false)
          }}
        />
      )}
      <header className="topbar">
        <button className="brand" type="button" onClick={() => openScreen('home')}>
          <img className="brand-logo" src={logoMark} alt="" aria-hidden="true" />
          <span>
            <strong>{appName}</strong>
            <small>Culture, food, and heritage</small>
          </span>
        </button>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {desktopNavItems.map((item) => (
            <button
              className={activeScreen === item.id ? 'desktop-nav-item active' : 'desktop-nav-item'}
              key={item.id}
              type="button"
              onClick={() => openScreen(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="topbar-actions">
          <button className="theme-toggle" type="button" aria-label={themeToggleLabel} title={themeToggleLabel} onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <button className="profile-button" type="button" aria-label="Open profile" onClick={() => openScreen('profile')}>
            <User size={18} />
            <span>Profile</span>
          </button>
        </div>
      </header>

      <main>{renderScreen()}</main>

      <nav className="bottom-nav" aria-label="Primary navigation">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = activeScreen === item.id
          return (
            <button
              className={active ? 'nav-item active' : 'nav-item'}
              key={item.id}
              type="button"
              onClick={() => openScreen(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

function HomeScreen({ locations, stories, artifacts, countries, openScreen, setFilters, setQuery }) {
  const featured = [
    'grand-bassam-historic-town',
    'koutammakou-cultural-landscape',
    'cape-coast-castle',
    'fort-jesus-mombasa',
  ]
    .map((id) => locations.find((location) => location.id === id))
    .filter(Boolean)
  const storyPicks = ['akan-asante-heritage', 'swahili-coast', 'trans-saharan-agadez']
    .map((id) => stories.find((story) => story.id === id))
    .filter(Boolean)

  const quickSearch = (country) => {
    setFilters({ ...emptyFilters, country })
    openScreen('discover')
  }

  const openRoute = (storyId) => {
    const story = getStoryById(storyId, stories)
    if (story) openScreen('storyDetail', story)
  }

  const submitSearch = (event) => {
    event.preventDefault()
    const value = new FormData(event.currentTarget).get('home-search')?.toString() ?? ''
    setQuery(value)
    openScreen('search')
  }

  return (
    <section className="screen home-screen">
      <div className="hero-panel">
        <img className="hero-media" src="/hero-grand-bassam.jpg" alt="" />
        <div className="hero-content">
          <span className="eyebrow">{countries.length} launch countries</span>
          <h1>Discover Africa's Cultural Heritage</h1>
          <p>
            Explore museums, heritage sites, cultural routes, and artifacts through a digital museum built for learning.
          </p>
          <form className="search-form" onSubmit={submitSearch}>
            <Search size={18} />
            <input name="home-search" placeholder="Search culture" />
            <button type="submit">Search</button>
          </form>
          <div className="hero-metrics" aria-label="Catalogue summary">
            <Metric label="Countries" value={countries.length} />
          <Metric label="Places" value={locations.length} />
          <Metric label="Stories" value={stories.length} />
          <Metric label="Artifacts" value={artifacts.length} />
          </div>
        </div>
      </div>

      <section className="section-block museum-note">
        <Archive size={22} />
        <div>
          <span className="eyebrow">Digital museum atlas</span>
          <h2>Culture explained through places, objects, and context</h2>
          <p>
            Tribe Trip treats culture as practical knowledge: every country guide connects places, phrases, etiquette, food, and objects before you go.
          </p>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <span>Start With</span>
          <h2>Discovery paths</h2>
        </div>
        <div className="category-grid">
          <CategoryTile icon={Building2} title="Museums" text="Collections and cultural institutions" onClick={() => openScreen('discover')} />
          <CategoryTile icon={Landmark} title="Heritage Sites" text="Sacred, royal, and memory places" onClick={() => openScreen('discover')} />
          <CategoryTile icon={MapPinned} title="Map View" text="Pins, countries, and nearby places" onClick={() => openScreen('map')} />
          <CategoryTile icon={BookOpen} title="Stories" text="Civilizations and traditions" onClick={() => openScreen('stories')} />
          <CategoryTile icon={Sparkles} title="Artifacts" text="Objects, art, and meaning" onClick={() => openScreen('artifacts')} />
        </div>
      </section>

      <section className="section-block compact-band">
        <div>
          <span className="eyebrow">Countries</span>
          <h2>Explore the launch countries</h2>
        </div>
        <div className="country-actions">
          {countries.map((country) => (
            <button key={country} type="button" onClick={() => quickSearch(country)}>
              {country}
            </button>
          ))}
        </div>
      </section>

      <section className="section-block">
        <SectionTitle title="Country atlas" action="Open discover" onAction={() => openScreen('discover')} />
        <div className="country-grid">
          {countries.map((country) => (
            <CountryCard key={country} country={country} locations={locations} stories={stories} onClick={() => quickSearch(country)} />
          ))}
        </div>
      </section>

      <section className="section-block">
        <SectionTitle title="Curated cultural routes" action="Read stories" onAction={() => openScreen('stories')} />
        <div className="route-grid">
          {culturalRoutes.map((route) => (
            <RouteCard key={route.id} route={route} stories={stories} onClick={() => openRoute(route.id)} />
          ))}
        </div>
      </section>

      <section className="section-block">
        <SectionTitle title="Featured locations" action="View all" onAction={() => openScreen('discover')} />
        <div className="horizontal-list">
          {featured.map((location) => (
            <LocationCard key={location.id} location={location} openScreen={openScreen} compact />
          ))}
        </div>
      </section>

      <section className="section-block">
        <SectionTitle title="Cultural stories" action="Read stories" onAction={() => openScreen('stories')} />
        <div className="story-list">
          {storyPicks.map((story) => (
            <StoryRow key={story.id} story={story} openScreen={openScreen} />
          ))}
        </div>
      </section>
    </section>
  )
}

function DiscoverScreen({
  locations,
  stories,
  countries,
  categories,
  filters,
  setFilters,
  openScreen,
  favoriteIds,
  toggleFavorite,
  userLocation,
  geoStatus,
  geoMessage,
  requestUserLocation,
}) {
  const filteredLocations = filterLocations(locations, filters, stories, userLocation)

  return (
    <section className="screen">
      <PageIntro
        eyebrow="Discover"
        title="Museums, heritage sites, and cultural centers"
        text={`Filter the catalogue across ${countries.length} African countries by country, category, theme, and distance.`}
      />
      <div className="toolbar-panel">
        <button className="secondary-action" type="button" onClick={requestUserLocation}>
          <LocateFixed size={18} />
          {geoStatus === 'loading' ? 'Locating...' : 'Use my location'}
        </button>
        <button className="secondary-action" type="button" onClick={() => openScreen('map')}>
          <MapPinned size={18} />
          Open map
        </button>
        {geoMessage && <span className={`status-note ${geoStatus}`}>{geoMessage}</span>}
      </div>
      <div className="filter-panel expanded">
        <SelectFilter
          label="Country"
          value={filters.country}
          options={['All', ...countries]}
          onChange={(country) => setFilters((current) => ({ ...current, country }))}
        />
        <SelectFilter
          label="Category"
          value={filters.category}
          options={['All', ...categories]}
          onChange={(category) => setFilters((current) => ({ ...current, category }))}
        />
        <SelectFilter
          label="Theme"
          value={filters.theme}
          options={themeOptions}
          onChange={(theme) => setFilters((current) => ({ ...current, theme }))}
        />
        <SelectFilter
          label="Distance"
          value={filters.distance}
          options={distanceOptions}
          onChange={(distance) => setFilters((current) => ({ ...current, distance, sort: distance === 'All' ? current.sort : 'Nearest' }))}
        />
        <SelectFilter
          label="Sort"
          value={filters.sort}
          options={sortOptions}
          onChange={(sort) => setFilters((current) => ({ ...current, sort }))}
        />
      </div>
      <div className="theme-strip" aria-label="Theme shortcuts">
        {themeOptions.map((theme) => (
          <button
            className={filters.theme === theme ? 'active' : ''}
            key={theme}
            type="button"
            onClick={() => setFilters((current) => ({ ...current, theme }))}
          >
            {theme}
          </button>
        ))}
      </div>
      <div className="result-count">{filteredLocations.length} places found</div>
      <div className="card-list">
        {filteredLocations.map((location) => (
          <LocationCard
            key={location.id}
            location={location}
            openScreen={openScreen}
            isFavorite={favoriteIds.has(location.id)}
            toggleFavorite={() => toggleFavorite(location, 'location')}
          />
        ))}
      </div>
      {filteredLocations.length === 0 && <EmptyState title="No places match these filters" text="Try another country, theme, or distance range." />}
    </section>
  )
}

function MapScreen({
  locations,
  stories,
  cultureGuideCatalog,
  countries,
  categories,
  filters,
  setFilters,
  openScreen,
  favoriteIds,
  toggleFavorite,
  userLocation,
  geoStatus,
  geoMessage,
  requestUserLocation,
  setSelectedCultureCountry,
}) {
  const [selectedPin, setSelectedPin] = useState(null)
  const [selectedMapCountry, setSelectedMapCountry] = useState(filters.country === 'All' ? getAvailableGuideCountries(cultureGuideCatalog)[0] : filters.country)
  const filteredLocations = filterLocations(locations, filters, stories, userLocation)
  const activePin = filteredLocations.find((location) => location.id === selectedPin?.id) ?? filteredLocations[0]

  const selectAvailableCountry = (country) => {
    setSelectedMapCountry(country)
    setSelectedCultureCountry(country)
    setFilters({ ...emptyFilters, country })
    setSelectedPin(null)
  }

  const changeMapCountryFilter = (country) => {
    setFilters((current) => ({ ...current, country }))
    if (getAvailableGuideCountries(cultureGuideCatalog).includes(country)) {
      setSelectedMapCountry(country)
      setSelectedCultureCountry(country)
    }
  }

  return (
    <section className="screen map-screen">
      <PageIntro
        eyebrow="Map"
        title="Cultural places on one map"
        text="Use the same catalogue filters, activate location when needed, then open details or Google Maps directions from a selected pin."
      />
      <AfricaAvailabilityMap
        selectedCountry={selectedMapCountry}
        locations={locations}
        guides={cultureGuideCatalog}
        onSelectCountry={selectAvailableCountry}
        openCultureGuide={() => openScreen('culture')}
      />
      <div className="toolbar-panel">
        <button className="secondary-action" type="button" onClick={requestUserLocation}>
          <Navigation size={18} />
          {geoStatus === 'loading' ? 'Locating...' : 'Find nearby'}
        </button>
        {geoMessage && <span className={`status-note ${geoStatus}`}>{geoMessage}</span>}
      </div>
      <div className="filter-panel expanded compact-filters">
        <SelectFilter label="Country" value={filters.country} options={['All', ...countries]} onChange={changeMapCountryFilter} />
        <SelectFilter label="Category" value={filters.category} options={['All', ...categories]} onChange={(category) => setFilters((current) => ({ ...current, category }))} />
        <SelectFilter label="Theme" value={filters.theme} options={themeOptions} onChange={(theme) => setFilters((current) => ({ ...current, theme }))} />
        <SelectFilter
          label="Distance"
          value={filters.distance}
          options={distanceOptions}
          onChange={(distance) => setFilters((current) => ({ ...current, distance, sort: distance === 'All' ? current.sort : 'Nearest' }))}
        />
      </div>
      <div className="map-layout">
        <CulturalMap locations={filteredLocations} selectedLocation={activePin} onSelect={setSelectedPin} userLocation={userLocation} />
        <aside className="map-side-panel">
          <span className="eyebrow">{filteredLocations.length} visible places</span>
          {activePin ? (
            <LocationMapSummary
              location={activePin}
              openScreen={openScreen}
              isFavorite={favoriteIds.has(activePin.id)}
              toggleFavorite={() => toggleFavorite(activePin, 'location')}
            />
          ) : (
            <EmptyState title="No mapped places" text="Change filters to show places again." />
          )}
        </aside>
      </div>
    </section>
  )
}

function AfricaAvailabilityMap({ selectedCountry, locations, guides, onSelectCountry, openCultureGuide }) {
  const availableGuides = guides.filter((guide) => guide.available !== false)
  const selectedGuide = getCultureGuide(selectedCountry, guides)
  const selectedPlaces = locations.filter((location) => location.country === selectedGuide.country)

  return (
    <section className="africa-availability-panel" aria-label="Africa availability map">
      <div className="africa-map-copy">
        <span className="eyebrow">Available now</span>
        <h2>Africa map coverage</h2>
        <p>
          Highlighted countries are available now. Muted labels mark future coverage areas so the map stays honest about current catalogue depth.
        </p>
        <div className="availability-summary">
          <Metric label="Available countries" value={availableGuides.length} />
          <Metric label="Places in selection" value={selectedPlaces.length} />
        </div>
        <div className="detail-actions compact-actions">
          <button className="primary-action" type="button" onClick={openCultureGuide}>
            <BookOpen size={18} />
            Open country guide
          </button>
        </div>
      </div>
      <div className="africa-map-shell" role="img" aria-label="Map of Africa with currently available countries highlighted">
        <div className="africa-map-shape" aria-hidden="true" />
        {unavailableAfricaPoints.map((point) => (
          <span className="africa-country-dot muted" key={point.country} style={getAfricaPointPosition(point.mapPoint)}>
            {point.country}
          </span>
        ))}
        {availableGuides.map((guide) => (
          <button
            className={selectedGuide.country === guide.country ? 'africa-country-dot available active' : 'africa-country-dot available'}
            key={guide.country}
            type="button"
            style={getAfricaAvailabilityPosition(guide)}
            onClick={() => onSelectCountry(guide.country)}
          >
            <span>{guide.country}</span>
          </button>
        ))}
      </div>
      <div className="availability-country-strip" aria-label="Available countries">
        {availableGuides.map((guide) => (
          <button
            className={selectedGuide.country === guide.country ? 'active' : ''}
            key={guide.country}
            type="button"
            onClick={() => onSelectCountry(guide.country)}
          >
            {guide.country}
          </button>
        ))}
      </div>
    </section>
  )
}

function CultureGuideScreen({ countries, locations, guides, selectedCountry, setSelectedCountry, setFilters, openScreen }) {
  const availableCountries = getAvailableGuideCountries(guides).filter((country) => countries.includes(country))
  const activeCountry = availableCountries.includes(selectedCountry) ? selectedCountry : availableCountries[0]
  const guide = getCultureGuide(activeCountry, guides)
  const [activeTab, setActiveTab] = useState(cultureTabs[0])
  const relatedPlaces = locations.filter((location) => location.country === guide.country).slice(0, 6)

  const openCountryPlaces = () => {
    setFilters({ ...emptyFilters, country: guide.country })
    openScreen('discover')
  }

  return (
    <section className="screen culture-screen">
      <PageIntro
        eyebrow="Culture guide"
        title="Practical culture before the visit"
        text="Country guides connect phrases, greetings, etiquette, food, and nearby heritage places. Draft labels mark content that still needs expert review."
      />

      <div className="culture-guide-layout">
        <aside className="culture-country-panel">
          <SelectFilter label="Country" value={guide.country} options={availableCountries} onChange={setSelectedCountry} />
          <div className="language-stack">
            <span className="eyebrow">Languages</span>
            <div className="tag-list">
              {guide.languages.map((language) => (
                <span key={language}>{language}</span>
              ))}
            </div>
          </div>
          <button className="secondary-action wide" type="button" onClick={openCountryPlaces}>
            <MapPinned size={18} />
            View places in {guide.country}
          </button>
        </aside>

        <div className="culture-content-panel">
          <div className="culture-guide-header">
            <span className="eyebrow">{guide.country}</span>
            <h2>{countryProfiles[guide.country] ?? 'Country guide in progress.'}</h2>
          </div>
          <div className="segmented-control culture-tabs" aria-label="Culture guide sections">
            {cultureTabs.map((tab) => (
              <button className={activeTab === tab ? 'active' : ''} key={tab} type="button" onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'Phrases' && (
            <div className="culture-card-grid">
              {guide.phrases.map((phrase) => (
                <article className="phrase-card" key={`${phrase.language}-${phrase.english}-${phrase.local}`}>
                  <div>
                    <span className="type-pill">{phrase.language}</span>
                    <span className={`content-status ${phrase.status}`}>{phrase.status}</span>
                  </div>
                  <h3>{phrase.english}</h3>
                  <strong>{phrase.local}</strong>
                  <p>{phrase.pronunciation}</p>
                  <small>{phrase.context}</small>
                </article>
              ))}
            </div>
          )}

          {activeTab === 'Etiquette' && (
            <div className="culture-column-grid">
              <CultureListCard title="Greetings" items={guide.greetings} />
              <CultureListCard title="Etiquette" items={guide.etiquette} />
              <CultureListCard title="Taboos" items={guide.taboos} />
            </div>
          )}

          {activeTab === 'Food' && (
            <div className="culture-column-grid food-grid">
              <section className="culture-list-card">
                <h3>Common native foods</h3>
                <div className="food-list">
                  {guide.foods.map((food) => (
                    <article key={food.name}>
                      <div>
                        <strong>{food.name}</strong>
                        <span className={`content-status ${food.status}`}>{food.status}</span>
                      </div>
                      <p>{food.description}</p>
                      <small>{food.commonIn.join(' · ')}</small>
                    </article>
                  ))}
                </div>
              </section>
              <section className="culture-list-card">
                <h3>Food spots</h3>
                <div className="food-list">
                  {guide.foodSpots.map((spot) => (
                    <article key={`${spot.name}-${spot.city}`}>
                      <div>
                        <strong>{spot.name}</strong>
                        <span>{spot.priceLevel}</span>
                      </div>
                      <p>{spot.specialty}</p>
                      <small>{spot.city}</small>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'Music' && <CultureStyleGrid title="Music styles" items={guide.musicStyles ?? []} />}

          {activeTab === 'Clothing' && <CultureStyleGrid title="Clothing styles" items={guide.clothingStyles ?? []} />}

          {activeTab === 'Places' && (
            <div>
              <div className="toolbar-panel">
                <button className="primary-action" type="button" onClick={openCountryPlaces}>
                  <Compass size={18} />
                  Open discover filters
                </button>
              </div>
              <div className="card-list tight">
                {relatedPlaces.map((location) => (
                  <LocationCard key={location.id} location={location} openScreen={openScreen} compact />
                ))}
              </div>
              {relatedPlaces.length === 0 && <EmptyState title="No related places yet" text="Editorially reviewed places will appear here as the catalogue grows." />}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function CultureStyleGrid({ title, items }) {
  if (!items.length) return <EmptyState title={`No ${title.toLowerCase()} yet`} text="This country guide can be expanded from the editorial workspace." />

  return (
    <section className="culture-style-section">
      <h3>{title}</h3>
      <div className="culture-card-grid style-card-grid">
        {items.map((item) => (
          <article className="style-card" key={item.name}>
            <div>
              <strong>{item.name}</strong>
              <span className={`content-status ${item.status}`}>{item.status}</span>
            </div>
            <p>{item.description}</p>
            <small>{item.context}</small>
          </article>
        ))}
      </div>
    </section>
  )
}

function CultureListCard({ title, items }) {
  return (
    <section className="culture-list-card">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

function CulturalMap({ locations, selectedLocation, onSelect, userLocation }) {
  const bounds = useMemo(() => getCoordinateBounds(locations, userLocation), [locations, userLocation])

  return (
    <div className="cultural-map" role="img" aria-label="Map of cultural places">
      <div className="map-grid-lines" aria-hidden="true" />
      <div className="map-continent-label">Africa heritage atlas</div>
      {userLocation && <span className="user-location-pin" style={getMapPosition(userLocation, bounds)}>You</span>}
      {locations.map((location) => (
        <button
          className={selectedLocation?.id === location.id ? 'map-pin active' : 'map-pin'}
          key={location.id}
          type="button"
          style={getMapPosition(location.coordinates, bounds)}
          onClick={() => onSelect(location)}
          aria-label={`Select ${location.name}`}
        >
          <MapPin size={18} />
          <span>{location.name}</span>
        </button>
      ))}
    </div>
  )
}

function getCoordinateBounds(locationList, userLocation) {
  const points = [...locationList.map((location) => location.coordinates).filter(Boolean), userLocation].filter(Boolean)
  if (!points.length) return { minLat: -35, maxLat: 38, minLng: -18, maxLng: 52 }
  const lats = points.map((point) => point.lat)
  const lngs = points.map((point) => point.lng)
  return {
    minLat: Math.min(...lats) - 2,
    maxLat: Math.max(...lats) + 2,
    minLng: Math.min(...lngs) - 2,
    maxLng: Math.max(...lngs) + 2,
  }
}

function getMapPosition(point, bounds) {
  const lngRange = bounds.maxLng - bounds.minLng || 1
  const latRange = bounds.maxLat - bounds.minLat || 1
  const x = ((point.lng - bounds.minLng) / lngRange) * 84 + 8
  const y = (1 - (point.lat - bounds.minLat) / latRange) * 78 + 10
  return { left: `${Math.min(94, Math.max(6, x))}%`, top: `${Math.min(90, Math.max(8, y))}%` }
}

function LocationMapSummary({ location, openScreen, isFavorite, toggleFavorite }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${location.coordinates.lat},${location.coordinates.lng}`

  return (
    <article className="map-summary-card">
      <img src={location.image} alt="" />
      <span className="type-pill">{location.type}</span>
      <h2>{location.name}</h2>
      <p>{location.summary}</p>
      <small>
        <MapPin size={14} /> {location.city}, {location.country}{location.distanceKm != null ? ` · ${formatDistance(location.distanceKm)}` : ''}
      </small>
      <div className="detail-actions compact-actions">
        <button className="primary-action" type="button" onClick={() => openScreen('locationDetail', location)}>
          Open detail
        </button>
        <a className="secondary-action" href={mapsUrl} target="_blank" rel="noreferrer">
          Directions
        </a>
        <button className={isFavorite ? 'secondary-action saved' : 'secondary-action'} type="button" onClick={toggleFavorite}>
          <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          {isFavorite ? 'Saved' : 'Save'}
        </button>
      </div>
    </article>
  )
}

function LocationDetail({ location, stories, artifacts, goBack, openScreen, isFavorite, toggleFavorite }) {
  const relatedStories = stories.filter((story) => location.relatedStoryIds?.includes(story.id))
  const relatedArtifacts = artifacts.filter((artifact) => location.relatedArtifactIds?.includes(artifact.id))
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${location.coordinates.lat},${location.coordinates.lng}`
  const galleryImages = getGalleryImages(location.image, [...relatedStories, ...relatedArtifacts])

  return (
    <DetailShell image={location.image} goBack={goBack} badge={location.type} title={location.name}>
      <div className="detail-actions">
        <a className="primary-action" href={mapsUrl} target="_blank" rel="noreferrer">
          <Route size={18} />
          Get Directions
        </a>
        <button className={isFavorite ? 'secondary-action saved' : 'secondary-action'} type="button" onClick={toggleFavorite}>
          <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          {isFavorite ? 'Saved' : 'Save'}
        </button>
      </div>

      <InfoGrid
        items={[
          { label: 'City', value: `${location.city}, ${location.country}` },
          { label: 'Hours', value: location.openingHours },
          { label: 'Address', value: location.address },
          { label: 'Sources', value: `${location.sources?.length || 0} listed` },
        ]}
      />

      <ImageGallery images={galleryImages} title={`${location.name} gallery`} />

      <ContentSection title="Overview" text={location.summary} />
      <ContentSection title="Historical context" text={location.history} />
      <MuseumLabel
        title="Visit lens"
        items={[
          { label: 'Look for', value: location.tags?.join(', ') || location.type },
          { label: 'Learning focus', value: relatedStories[0]?.summary ?? location.summary },
          { label: 'Museum note', value: 'Use this place as a starting point, then follow the related story and artifact links for context.' },
        ]}
      />
      <MiniMap location={location} />
      <MuseumLabel
        title="Visitor information"
        items={[
          { label: 'Opening hours', value: location.openingHours },
          { label: 'Contact', value: location.contact ?? 'Contact details not listed yet.' },
          { label: 'Directions', value: 'Use Google Maps from the action button above for current routing.' },
        ]}
      />
      <TagList tags={location.tags ?? []} />
      <SourcesPanel sources={location.sources} />

      <RelatedSection title="Related stories">
        {relatedStories.map((story) => (
          <StoryRow key={story.id} story={story} openScreen={openScreen} />
        ))}
      </RelatedSection>

      <RelatedSection title="Related artifacts">
        <div className="mini-grid">
          {relatedArtifacts.map((artifact) => (
            <ArtifactCard key={artifact.id} artifact={artifact} openScreen={openScreen} compact />
          ))}
        </div>
      </RelatedSection>
    </DetailShell>
  )
}

function StoriesScreen({ stories, countries, openScreen, favoriteIds, toggleFavorite }) {
  const [storyCountry, setStoryCountry] = useState('All')
  const [storyCategory, setStoryCategory] = useState('All')
  const storyCategories = Array.from(new Set(stories.map((story) => story.category).filter(Boolean)))
  const filteredStories = stories.filter((story) => {
    const countryMatch = storyCountry === 'All' || story.country?.includes(storyCountry)
    const categoryMatch = storyCategory === 'All' || story.category === storyCategory
    return countryMatch && categoryMatch
  })

  return (
    <section className="screen">
      <PageIntro
        eyebrow="Stories"
        title="Learn through places, timelines, and objects"
        text="Editorial stories connect places, objects, timelines, and learning points so the app feels like a digital museum, not only a directory."
      />
      <div className="filter-panel compact-filters">
        <SelectFilter label="Country" value={storyCountry} options={['All', ...countries]} onChange={setStoryCountry} />
        <SelectFilter label="Story type" value={storyCategory} options={['All', ...storyCategories]} onChange={setStoryCategory} />
      </div>
      <div className="result-count">{filteredStories.length} stories found</div>
      <div className="card-list">
        {filteredStories.map((story) => (
          <StoryCard
            key={story.id}
            story={story}
            openScreen={openScreen}
            isFavorite={favoriteIds.has(story.id)}
            toggleFavorite={() => toggleFavorite(story, 'story')}
          />
        ))}
      </div>
      {filteredStories.length === 0 && <EmptyState title="No stories match these filters" text="Try another country or story type." />}
    </section>
  )
}

function StoryDetail({ story, locations, artifacts, goBack, openScreen, isFavorite, toggleFavorite }) {
  const relatedLocations = locations.filter((location) => story.relatedLocationIds?.includes(location.id))
  const relatedArtifacts = artifacts.filter((artifact) => story.relatedArtifactIds?.includes(artifact.id))
  const galleryImages = getGalleryImages(story.image, [...relatedLocations, ...relatedArtifacts])

  return (
    <DetailShell image={story.image} goBack={goBack} badge={story.category} title={story.title}>
      <div className="detail-actions">
        <button className={isFavorite ? 'primary-action saved' : 'primary-action'} type="button" onClick={toggleFavorite}>
          <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          {isFavorite ? 'Saved' : 'Save story'}
        </button>
      </div>
      <ImageGallery images={galleryImages} title={`${story.title} visual references`} />
      <StoryLearningPanel story={story} relatedLocations={relatedLocations} relatedArtifacts={relatedArtifacts} />
      <InfoGrid items={[{ label: 'Sources', value: `${story.sources?.length || 0} listed` }, { label: 'Read time', value: story.readTime }, { label: 'Country', value: story.country }]} />
      <ContentSection title="Story" text={story.body} />
      {story.keyPoints && (
        <section className="content-section">
          <h2>Key points</h2>
          <div className="key-point-list">
            {story.keyPoints.map((point) => (
              <p key={point}>{point}</p>
            ))}
          </div>
        </section>
      )}
      <ContentSection title="Why it matters" text={getWhyItMatters(story)} />
      <section className="content-section">
        <h2>Timeline</h2>
        <div className="timeline">
          {story.timeline.map((event) => (
            <article key={`${story.id}-${event.period}`}>
              <strong>{event.period}</strong>
              <p>{event.text}</p>
            </article>
          ))}
        </div>
      </section>
      <SourcesPanel sources={story.sources} />
      <RelatedSection title="Related locations">
        <div className="card-list tight">
          {relatedLocations.map((location) => (
            <LocationCard key={location.id} location={location} openScreen={openScreen} compact />
          ))}
        </div>
      </RelatedSection>
      <RelatedSection title="Related artifacts">
        <div className="mini-grid">
          {relatedArtifacts.map((artifact) => (
            <ArtifactCard key={artifact.id} artifact={artifact} openScreen={openScreen} compact />
          ))}
        </div>
      </RelatedSection>
    </DetailShell>
  )
}

function ArtifactsScreen({ artifacts, countries, openScreen, favoriteIds, toggleFavorite }) {
  const [artifactCountry, setArtifactCountry] = useState('All')
  const [periodGroup, setPeriodGroup] = useState('All')
  const periodGroups = ['All', 'Historical', 'Living tradition', 'All periods']
  const filteredArtifacts = artifacts.filter((artifact) => {
    const countryMatch = artifactCountry === 'All' || artifact.country === artifactCountry
    const periodMatch = periodGroup === 'All' || getArtifactPeriodGroup(artifact.period) === periodGroup
    return countryMatch && periodMatch
  })

  return (
    <section className="screen">
      <PageIntro
        eyebrow="Explore"
        title="Artifact gallery"
        text="A browsable object catalogue with filters by country and period, linked back to stories, museums, and heritage places."
      />
      <div className="filter-panel compact-filters">
        <SelectFilter label="Country" value={artifactCountry} options={['All', ...countries]} onChange={setArtifactCountry} />
        <SelectFilter label="Period" value={periodGroup} options={periodGroups} onChange={setPeriodGroup} />
      </div>
      <div className="result-count">{filteredArtifacts.length} artifacts found</div>
      <div className="artifact-grid">
        {filteredArtifacts.map((artifact) => (
          <ArtifactCard
            key={artifact.id}
            artifact={artifact}
            openScreen={openScreen}
            isFavorite={favoriteIds.has(artifact.id)}
            toggleFavorite={() => toggleFavorite(artifact, 'artifact')}
          />
        ))}
      </div>
      {filteredArtifacts.length === 0 && <EmptyState title="No artifacts match these filters" text="Try another country or period group." />}
    </section>
  )
}

function ArtifactDetail({ artifact, locations, stories, goBack, openScreen, isFavorite, toggleFavorite }) {
  const relatedLocation = locations.find((location) => location.id === artifact.relatedLocationId)
  const relatedStories = stories.filter((story) => artifact.relatedStoryIds?.includes(story.id))
  const galleryImages = getGalleryImages(artifact.image, [relatedLocation, ...relatedStories])

  return (
    <DetailShell image={artifact.image} goBack={goBack} badge={artifact.origin} title={artifact.name}>
      <div className="detail-actions">
        <button className={isFavorite ? 'primary-action saved' : 'primary-action'} type="button" onClick={toggleFavorite}>
          <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          {isFavorite ? 'Saved' : 'Save artifact'}
        </button>
      </div>
      <InfoGrid
        items={[
          { label: 'Origin', value: artifact.origin },
          { label: 'Period', value: artifact.period },
          { label: 'Country', value: artifact.country },
          { label: 'Sources', value: `${artifact.sources?.length || 0} listed` },
        ]}
      />
      <ImageGallery images={galleryImages} title={`${artifact.name} gallery`} />
      <ContentSection title="Description" text={artifact.summary} />
      <ContentSection title="Cultural significance" text={artifact.significance} />
      <MuseumLabel
        title="Museum label"
        items={[
          { label: 'Object', value: artifact.name },
          { label: 'Context', value: artifact.origin },
          { label: 'Interpretation', value: artifact.significance },
        ]}
      />
      <SourcesPanel sources={artifact.sources} />
      {relatedLocation && (
        <RelatedSection title="Related museum or site">
          <LocationCard location={relatedLocation} openScreen={openScreen} compact />
        </RelatedSection>
      )}
      <RelatedSection title="Related stories">
        {relatedStories.map((story) => (
          <StoryRow key={story.id} story={story} openScreen={openScreen} />
        ))}
      </RelatedSection>
    </DetailShell>
  )
}

function SearchScreen({ locations, stories, artifacts, countries, categories, query, setQuery, openScreen, favoriteIds, toggleFavorite }) {
  const [resultKind, setResultKind] = useState('All')
  const [searchCountry, setSearchCountry] = useState('All')
  const [searchCategory, setSearchCategory] = useState('All')
  const [remoteSearchState, setRemoteSearchState] = useState({ source: 'idle', query: '', items: [], message: '' })
  const normalized = query.trim().toLowerCase()
  const searchable = useMemo(
    () => [
      ...locations.map((item) => ({ ...item, kind: 'location', title: item.name, subtitle: `${item.type} in ${item.city}` })),
      ...stories.map((item) => ({ ...item, kind: 'story', subtitle: item.category })),
      ...artifacts.map((item) => ({ ...item, kind: 'artifact', title: item.name, subtitle: item.origin })),
    ],
    [artifacts, locations, stories],
  )
  const searchableByKey = useMemo(() => new Map(searchable.map((item) => [`${item.kind}:${item.id}`, item])), [searchable])

  useEffect(() => {
    const searchText = query.trim()
    if (searchText.length < 2) return undefined

    let cancelled = false

    const timer = window.setTimeout(() => {
      setRemoteSearchState({ source: 'loading', query: searchText, items: [], message: 'Searching backend catalogue...' })
      searchCatalog(searchText)
        .then((payload) => {
          if (cancelled) return
          const items = [
            ...(payload.locations ?? []),
            ...(payload.stories ?? []),
            ...(payload.artifacts ?? []),
          ].map((item) => ({ kind: item.type, id: item.id }))
          setRemoteSearchState({ source: 'api', query: searchText, items, message: `${payload.total ?? items.length} backend result${(payload.total ?? items.length) === 1 ? '' : 's'}.` })
        })
        .catch((err) => {
          if (cancelled) return
          setRemoteSearchState({ source: 'local', query: searchText, items: [], message: err.message || 'Backend search unavailable. Showing loaded catalogue results.' })
        })
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [query])

  const localMatches = (normalized
    ? searchable.filter((item) =>
        [
          item.title,
          item.subtitle,
          item.country,
          item.summary,
          Array.isArray(item.body) ? item.body.join(' ') : item.body,
          item.significance,
          item.origin,
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalized),
      )
    : searchable
  )
  const searchText = query.trim()
  const hasActiveRemoteSearch = remoteSearchState.query === searchText
  const remoteMatches = hasActiveRemoteSearch ? remoteSearchState.items.map((item) => searchableByKey.get(`${item.kind}:${item.id}`)).filter(Boolean) : []
  const baseResults = normalized && hasActiveRemoteSearch && remoteSearchState.source === 'api' ? remoteMatches : localMatches

  const results = baseResults
    .filter((item) => {
      const kindMatch =
        resultKind === 'All' ||
        (resultKind === 'Places' && item.kind === 'location') ||
        (resultKind === 'Stories' && item.kind === 'story') ||
        (resultKind === 'Artifacts' && item.kind === 'artifact')
      const countryMatch = searchCountry === 'All' || item.country?.includes(searchCountry)
      const categoryMatch = searchCategory === 'All' || item.type === searchCategory || item.category === searchCategory
      return kindMatch && countryMatch && categoryMatch
    })
    .slice(0, normalized ? 80 : 12)
  const searchStatusMessage = searchText.length === 1
    ? 'Type at least 2 characters to search the backend catalogue.'
    : searchText.length >= 2 && hasActiveRemoteSearch
      ? remoteSearchState.message
      : searchText.length >= 2
        ? 'Searching backend catalogue...'
        : ''
  const searchStatusSource = hasActiveRemoteSearch ? remoteSearchState.source : 'loading'
  const searchStatusClass = searchStatusSource === 'api' ? 'status-note ready' : searchStatusSource === 'loading' ? 'status-note' : 'status-note blocked'

  return (
    <section className="screen">
      <PageIntro
        eyebrow="Search"
        title="Search the cultural catalogue"
        text="Find museums, stories, sites, and artifacts from one place."
      />
      <label className="global-search">
        <Search size={19} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try Ghana, Lamu, Agadez, bronze" autoFocus />
      </label>
      <div className="segmented-control" aria-label="Result type">
        {searchKinds.map((kind) => (
          <button className={resultKind === kind ? 'active' : ''} key={kind} type="button" onClick={() => setResultKind(kind)}>
            {kind}
          </button>
        ))}
      </div>
      <div className="filter-panel compact-filters">
        <SelectFilter label="Country" value={searchCountry} options={['All', ...countries]} onChange={setSearchCountry} />
        <SelectFilter label="Category" value={searchCategory} options={['All', ...categories, 'Civilization', 'Tradition', 'Historical Event']} onChange={setSearchCategory} />
      </div>
      <div className="result-count">{results.length} results</div>
      {searchStatusMessage && <span className={searchStatusClass}>{searchStatusMessage}</span>}
      <div className="search-results">
        {results.map((item) => (
          <article className="search-result" key={`${item.kind}-${item.id}`}>
            <img src={item.image} alt="" />
            <button type="button" onClick={() => openScreen(`${item.kind}Detail`, item)}>
              <span>{item.kind}</span>
              <strong>{item.title}</strong>
              <small>{item.subtitle}</small>
            </button>
            <button className="icon-button" type="button" aria-label="Save result" onClick={() => toggleFavorite(item, item.kind)}>
              <Heart size={18} fill={favoriteIds.has(item.id) ? 'currentColor' : 'none'} />
            </button>
          </article>
        ))}
      </div>
      {results.length === 0 && <EmptyState title="No results found" text="Try another keyword, country, or content type." />}
    </section>
  )
}

function SavedScreen({ favorites, openSavedItem, clearSaved }) {
  return (
    <section className="screen">
      <PageIntro
        eyebrow="Saved"
        title="Your local cultural shortlist"
        text="Save museums, stories, and artifacts to build a cultural shortlist."
      />
      <SavedItemsPanel favorites={favorites} openSavedItem={openSavedItem} clearSaved={clearSaved} />
    </section>
  )
}

function SavedItemsPanel({ favorites, openSavedItem, clearSaved }) {
  const [savedType, setSavedType] = useState('All')
  const savedTypes = ['All', 'location', 'story', 'artifact']
  const filteredFavorites = savedType === 'All' ? favorites : favorites.filter((favorite) => favorite.type === savedType)

  return (
    <div className="saved-panel-content">
      {favorites.length > 0 ? (
        <>
          <div className="toolbar-panel">
            <div className="segmented-control saved-segments" aria-label="Saved content type">
              {savedTypes.map((type) => (
                <button className={savedType === type ? 'active' : ''} key={type} type="button" onClick={() => setSavedType(type)}>
                  {type === 'All' ? 'All' : `${type}s`}
                </button>
              ))}
            </div>
            <button className="text-action" type="button" onClick={clearSaved}>
              Clear saved items
            </button>
          </div>
          <div className="search-results">
            {filteredFavorites.map((favorite) => (
              <article className="search-result" key={`${favorite.type}-${favorite.id}`}>
                <img src={favorite.image} alt="" />
                <button type="button" onClick={() => openSavedItem(favorite)}>
                  <span>{favorite.type}</span>
                  <strong>{favorite.title}</strong>
                  <small>{favorite.subtitle}</small>
                </button>
              </article>
            ))}
          </div>
          {filteredFavorites.length === 0 && <EmptyState title="Nothing in this saved group" text="Switch category or save more cultural content." />}
        </>
      ) : (
        <EmptyState title="No saved items yet" text="Save a museum, story, or artifact to build your visit shortlist." />
      )}
    </div>
  )
}

function ProfileScreen({
  openScreen,
  logoFull,
  countries,
  locations,
  stories,
  artifacts,
  historyItems,
  openHistoryItem,
  clearHistory,
  preferences,
  setPreferences,
  geoStatus,
  geoMessage,
  requestUserLocation,
  favorites,
  openSavedItem,
  clearSaved,
  profilePhoto,
  setProfilePhoto,
  currentUser,
  authStatus,
  authMessage,
  profileStatus,
  submitAuth,
  logout,
  saveProfile,
  localSecrets,
  localSecretStatus,
  addLocalSecret,
  removeLocalSecret,
  markLocalSecretHelpful,
  isOnline,
  catalogStatus,
}) {
  const uploadProfilePhoto = (event) => {
    const file = event.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfilePhoto(reader.result)
        if (currentUser) saveProfile({ avatarUrl: reader.result })
      }
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  return (
    <section className="screen">
      <PageIntro
        eyebrow="Profile"
        title={currentUser ? `${currentUser.name}'s cultural library` : 'Guest profile and local library'}
        text={currentUser ? 'Manage your saved library, profile, preferences, and recent learning.' : 'Browse as a guest or sign in to keep your profile and saved library across devices.'}
      />
      <div className="profile-panel">
        <div className="profile-photo-stack">
          <ProfileAvatar profilePhoto={profilePhoto} logoFull={logoFull} />
          <div className="profile-photo-actions">
            <label className="secondary-action" htmlFor="profile-photo-upload">
              <Plus size={18} />
              Upload photo
              <input id="profile-photo-upload" className="visually-hidden" type="file" accept="image/*" onChange={uploadProfilePhoto} />
            </label>
            {profilePhoto && (
              <button
                className="text-action"
                type="button"
                onClick={() => {
                  setProfilePhoto('')
                  if (currentUser) saveProfile({ avatarUrl: '' })
                }}
              >
                Remove
              </button>
            )}
          </div>
        </div>
        <div>
          <h2>{currentUser ? currentUser.name : 'Guest explorer'}</h2>
          <p>{currentUser ? `${currentUser.email} · ${currentUser.role}` : 'Local favorites, theme preferences, visit history, profile image, offline app shell, and nearby discovery are enabled on this device.'}</p>
        </div>
      </div>
      <div className="metric-grid">
        <Metric label="Launch countries" value={countries.length} />
        <Metric label="Saved" value={favorites.length} />
        <Metric label="Local secrets" value={localSecrets.length} />
        <Metric label="History" value={historyItems.length} />
      </div>
      <button className="primary-action wide" type="button" onClick={() => openScreen('discover')}>
        <Compass size={18} />
        Continue discovery
      </button>

      <section className="section-block settings-grid">
        {currentUser ? (
          <AccountPanel
            key={`${currentUser.id}-${currentUser.name}-${currentUser.preferredCountry || preferences.preferredCountry}`}
            currentUser={currentUser}
            countries={countries}
            preferences={preferences}
            profileStatus={profileStatus}
            authMessage={authMessage}
            logout={logout}
            saveProfile={saveProfile}
          />
        ) : (
          <AuthPanel authStatus={authStatus} authMessage={authMessage} submitAuth={submitAuth} />
        )}
        <div className="settings-panel">
          <div className="panel-heading">
            <Heart size={20} />
            <h2>{currentUser ? 'Synced saved library' : 'Local saved library'}</h2>
          </div>
          <SavedItemsPanel favorites={favorites} openSavedItem={openSavedItem} clearSaved={clearSaved} />
        </div>
      </section>

      <section className="section-block settings-grid">
        <div className="settings-panel">
          <div className="panel-heading">
            <Settings size={20} />
            <h2>Local preferences</h2>
          </div>
          <SelectFilter
            label="Preferred country"
            value={preferences.preferredCountry}
            options={['All', ...countries]}
            onChange={(preferredCountry) => setPreferences((current) => ({ ...current, preferredCountry }))}
          />
          <SelectFilter
            label="Content density"
            value={preferences.contentDensity}
            options={['Comfortable', 'Compact']}
            onChange={(contentDensity) => setPreferences((current) => ({ ...current, contentDensity }))}
          />
          <button className="secondary-action wide" type="button" onClick={requestUserLocation}>
            <LocateFixed size={18} />
            {geoStatus === 'loading' ? 'Locating...' : 'Enable nearby discovery'}
          </button>
          {geoMessage && <span className={`status-note ${geoStatus}`}>{geoMessage}</span>}
        </div>
        <OfflineReadinessPanel isOnline={isOnline} locations={locations} stories={stories} artifacts={artifacts} />
      </section>

      <section className="section-block settings-grid">
        <div className="settings-panel">
          <div className="panel-heading">
            <History size={20} />
            <h2>Recent learning</h2>
          </div>
          {historyItems.length > 0 ? (
            <>
              <div className="history-list">
                {historyItems.slice(0, 6).map((item) => (
                  <button key={item.id} type="button" onClick={() => openHistoryItem(item)}>
                    <img src={item.image} alt="" />
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.type} · {item.subtitle}</small>
                    </span>
                  </button>
                ))}
              </div>
              <button className="text-action" type="button" onClick={clearHistory}>Clear history</button>
            </>
          ) : (
            <p>No recent items yet. Open a place, story, or artifact to build local history.</p>
          )}
        </div>
        <div className="settings-panel">
          <div className="panel-heading">
            <History size={20} />
            <h2>Account status</h2>
          </div>
          <span className={currentUser ? 'status-note ready' : 'status-note'}>{currentUser ? 'Connected account' : 'Guest mode'}</span>
          <p>{currentUser ? 'Your saved items and profile updates are kept with your account.' : 'Guest mode keeps saved items and profile photo on this device.'}</p>
        </div>
      </section>

      <section className="section-block settings-grid">
        <LocalSecretsPanel
          countries={countries}
          localSecrets={localSecrets}
          localSecretStatus={localSecretStatus}
          addLocalSecret={addLocalSecret}
          removeLocalSecret={removeLocalSecret}
          markLocalSecretHelpful={markLocalSecretHelpful}
        />
        <div className="settings-panel">
          <div className="panel-heading">
            <Layers size={20} />
            <h2>Catalogue scope</h2>
          </div>
          <InfoGrid
            items={[
              { label: 'Locations', value: locations.length },
              { label: 'Stories', value: stories.length },
              { label: 'Artifacts', value: artifacts.length },
            ]}
          />
          <p>{catalogStatus.message}</p>
          {canManageContent(currentUser) && (
            <button className="secondary-action wide" type="button" onClick={() => openScreen('admin')}>
              <ShieldCheck size={18} />
              Open editorial workspace
            </button>
          )}
        </div>
      </section>
    </section>
  )
}

function ProfileAvatar({ profilePhoto, logoFull }) {
  return <img className="profile-logo-full" src={profilePhoto || logoFull} alt="Guest profile" />
}

function AuthPanel({ authStatus, authMessage, submitAuth }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const isRegister = mode === 'register'
  const isLoading = authStatus === 'loading'

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const submit = (event) => {
    event.preventDefault()
    submitAuth(mode, isRegister ? form : { email: form.email, password: form.password })
  }

  return (
    <div className="settings-panel account-panel">
      <div className="panel-heading">
        {isRegister ? <UserPlus size={20} /> : <LogIn size={20} />}
        <h2>{isRegister ? 'Create account' : 'Sign in'}</h2>
      </div>
      <div className="segmented-control saved-segments" aria-label="Authentication mode">
        <button className={!isRegister ? 'active' : ''} type="button" onClick={() => setMode('login')}>Login</button>
        <button className={isRegister ? 'active' : ''} type="button" onClick={() => setMode('register')}>Register</button>
      </div>
      <form className="admin-form auth-form" onSubmit={submit}>
        {isRegister && (
          <label className="form-field">
            <span>Name</span>
            <input value={form.name} onChange={(event) => updateForm('name', event.target.value)} required />
          </label>
        )}
        <label className="form-field">
          <span>Email</span>
          <input type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} required />
        </label>
        <label className="form-field">
          <span>Password</span>
          <input type="password" minLength={8} value={form.password} onChange={(event) => updateForm('password', event.target.value)} required />
        </label>
        <button className="primary-action" type="submit" disabled={isLoading}>
          {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
          {isLoading ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
        </button>
      </form>
      {authMessage && <span className={authStatus === 'guest' ? 'status-note blocked' : 'status-note ready'}>{authMessage}</span>}
    </div>
  )
}

function AccountPanel({ currentUser, countries, preferences, profileStatus, authMessage, logout, saveProfile }) {
  const [name, setName] = useState(currentUser.name)
  const [preferredCountry, setPreferredCountry] = useState(currentUser.preferredCountry || preferences.preferredCountry)

  const submit = (event) => {
    event.preventDefault()
    saveProfile({
      name,
      ...(preferredCountry && preferredCountry !== 'All' ? { preferredCountrySlug: preferredCountry } : {}),
    })
  }

  return (
    <div className="settings-panel account-panel">
      <div className="panel-heading">
        <User size={20} />
        <h2>Account</h2>
      </div>
      <form className="admin-form auth-form" onSubmit={submit}>
        <label className="form-field">
          <span>Name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label className="form-field">
          <span>Preferred country</span>
          <select value={preferredCountry} onChange={(event) => setPreferredCountry(event.target.value)}>
            {['All', ...countries].map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </label>
        <button className="primary-action" type="submit" disabled={profileStatus === 'saving'}>
          <Settings size={18} />
          {profileStatus === 'saving' ? 'Saving...' : 'Save profile'}
        </button>
      </form>
      <button className="secondary-action wide" type="button" onClick={logout}>
        <LogOut size={18} />
        Logout
      </button>
      {authMessage && <span className={profileStatus === 'error' ? 'status-note blocked' : 'status-note ready'}>{authMessage}</span>}
    </div>
  )
}

function OfflineReadinessPanel({ isOnline, locations, stories, artifacts }) {
  return (
    <div className="settings-panel">
      <div className="panel-heading">
        <Map size={20} />
        <h2>Offline readiness</h2>
      </div>
      <span className={isOnline ? 'status-note ready' : 'status-note blocked'}>{isOnline ? 'Online now' : 'Offline mode active'}</span>
      <p>The app shell, logos, public images, and visited catalogue responses are cached by the service worker after the first load.</p>
      <div className="offline-checklist">
        <span>{locations.length} places readable from loaded catalogue data</span>
        <span>{stories.length} stories readable from loaded catalogue data</span>
        <span>{artifacts.length} artifacts readable from loaded catalogue data</span>
      </div>
    </div>
  )
}

function LocalSecretsPanel({ countries, localSecrets, localSecretStatus, addLocalSecret, removeLocalSecret, markLocalSecretHelpful }) {
  const [draft, setDraft] = useState({
    ...emptyLocalSecret,
    country: countries.includes(emptyLocalSecret.country) ? emptyLocalSecret.country : countries[0],
  })
  const secretTypes = ['Hidden place', 'Food tip', 'Local guide', 'Photo spot', 'Cultural note']

  const updateDraft = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  const submitSecret = (event) => {
    event.preventDefault()
    const title = draft.title.trim()
    const tip = draft.tip.trim()
    if (!title || !tip) return

    addLocalSecret({ ...draft, title, tip, city: draft.city.trim() })
    setDraft((current) => ({ ...emptyLocalSecret, type: current.type, country: current.country, title: '', city: '', tip: '' }))
  }

  return (
    <div className="settings-panel local-secrets-panel">
      <div className="panel-heading">
        <Sparkles size={20} />
        <h2>Local secrets</h2>
      </div>
      <p>Add local suggestions other visitors may enjoy. Submissions are reviewed before they appear publicly.</p>
      {localSecretStatus?.message && <span className={localSecretStatus.source === 'api' ? 'status-note ready' : 'status-note'}>{localSecretStatus.message}</span>}
      <form className="local-secret-form" onSubmit={submitSecret}>
        <label className="form-field">
          <span>Type</span>
          <select value={draft.type} onChange={(event) => updateDraft('type', event.target.value)}>
            {secretTypes.map((type) => (
              <option value={type} key={type}>{type}</option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span>Country</span>
          <select value={draft.country} onChange={(event) => updateDraft('country', event.target.value)}>
            {countries.map((country) => (
              <option value={country} key={country}>{country}</option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span>Title</span>
          <input value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} placeholder="Quiet courtyard cafe" required />
        </label>
        <label className="form-field">
          <span>City</span>
          <input value={draft.city} onChange={(event) => updateDraft('city', event.target.value)} placeholder="City or area" />
        </label>
        <label className="form-field wide-field">
          <span>Suggestion</span>
          <textarea value={draft.tip} onChange={(event) => updateDraft('tip', event.target.value)} placeholder="What makes this useful, respectful, or worth discovering?" required />
        </label>
        <button className="primary-action" type="submit">Add local secret</button>
      </form>
      {localSecrets.length > 0 ? (
        <div className="local-secret-list">
          {localSecrets.map((secret) => (
            <article className="local-secret-card" key={secret.id}>
              <div>
                <span className="type-pill">{secret.type}</span>
                {secret.status && <span className={`content-status ${secret.status}`}>{secret.status}</span>}
                <strong>{secret.title}</strong>
                <small>{secret.city ? `${secret.city}, ` : ''}{secret.country}</small>
                <p>{secret.tip}</p>
              </div>
              <div className="local-secret-actions">
                <button className="text-action" type="button" onClick={() => markLocalSecretHelpful(secret.id)}>
                  Helpful {secret.helpful}
                </button>
                <button className="icon-button" type="button" aria-label={`Delete ${secret.title}`} onClick={() => removeLocalSecret(secret.id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p>No local secrets yet. Add one to test the suggestion flow.</p>
      )}
    </div>
  )
}

function SplashScreen({ logoFull, onSkip }) {
  return (
    <div className="splash-screen" role="dialog" aria-label="Tribe Trip loading screen">
      <div className="splash-map" aria-hidden="true">
        <span style={{ left: '42%', top: '32%' }} />
        <span style={{ left: '53%', top: '47%' }} />
        <span style={{ left: '47%', top: '61%' }} />
      </div>
      <img src={logoFull} alt="Tribe Trip" />
      <div>
        <span className="eyebrow">Culture, food, and heritage</span>
        <h1>{appName}</h1>
      </div>
      <button className="secondary-action" type="button" onClick={onSkip}>Enter</button>
    </div>
  )
}

function AdminScreen({ countries, categories, locations, stories, artifacts, cultureGuideCatalog, authToken, currentUser, refreshCatalog, refreshLocalSecrets, onAuthExpired }) {
  const hasRemoteAdmin = canManageContent(currentUser) && Boolean(authToken)
  const hasAdminAccess = canAdministerContent(currentUser)
  const adminTabs = useMemo(() => (hasAdminAccess ? ['locations', 'stories', 'artifacts', 'countries', 'culture-guides', 'sources', 'local-secrets', 'users', 'audit'] : ['locations', 'stories', 'artifacts', 'culture-guides', 'sources', 'local-secrets']), [hasAdminAccess])
  const [adminTab, setAdminTab] = useState('locations')
  const [adminStatus, setAdminStatus] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const [contentStatusFilter, setContentStatusFilter] = useState('all')
  const [editorialItems, setEditorialItems] = useState([])
  const [editorialLoading, setEditorialLoading] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState('')
  const [moderationStatus, setModerationStatus] = useState('submitted')
  const [moderationItems, setModerationItems] = useState([])
  const [moderationLoading, setModerationLoading] = useState(false)
  const [auditLogs, setAuditLogs] = useState([])
  const [auditLoading, setAuditLoading] = useState(false)
  const [adminUsers, setAdminUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [sources, setSources] = useState([])
  const [sourcesLoading, setSourcesLoading] = useState(false)
  const [sourceFilters, setSourceFilters] = useState({ itemType: 'location', itemId: '' })
  const [editingSource, setEditingSource] = useState(null)
  const [adminCountries, setAdminCountries] = useState([])
  const [countriesLoading, setCountriesLoading] = useState(false)
  const [editingCountry, setEditingCountry] = useState(null)
  const [adminCultureGuides, setAdminCultureGuides] = useState([])
  const [cultureGuidesLoading, setCultureGuidesLoading] = useState(false)
  const [editingCultureGuide, setEditingCultureGuide] = useState(null)
  const defaultCountry = countries[0] || 'Benin'
  const defaultCategory = categories[0] || 'Museum'
  const sourceTargets = useMemo(() => ({
    location: locations.map((item) => ({ id: item.id, label: item.name })),
    story: stories.map((item) => ({ id: item.id, label: item.title })),
    artifact: artifacts.map((item) => ({ id: item.id, label: item.name })),
  }), [artifacts, locations, stories])
  const activeAdminTab = adminTabs.includes(adminTab) ? adminTab : 'locations'
  const activeContentConfig = adminContentConfig[activeAdminTab]
  const editableStatusOptions = hasAdminAccess ? contentStatusOptions : ['draft', 'review']
  const suggestionStatusOptions = hasAdminAccess ? localSecretModerationStatuses : ['submitted', 'review']
  const defaultAdminStatus = hasRemoteAdmin
    ? { source: 'api', message: hasAdminAccess ? 'Admin access active.' : 'Editor access active. Publishing and archive actions require admin approval.' }
    : { source: 'blocked', message: 'Editorial access is required to manage catalogue content.' }
  const displayedAdminStatus = adminStatus ?? defaultAdminStatus

  const getAdminErrorMessage = useCallback((err, fallbackMessage) => {
    if (isAuthError(err)) {
      onAuthExpired('Session expired. Sign in again to continue editorial work.')
      return 'Session expired. Sign in again to continue editorial work.'
    }
    return err.message || fallbackMessage
  }, [onAuthExpired])

  useEffect(() => {
    let cancelled = false
    if (!hasRemoteAdmin || !activeContentConfig) return undefined

    Promise.resolve().then(async () => {
      if (cancelled) return
      setEditorialLoading(true)
      try {
        const items = await activeContentConfig.load(authToken, contentStatusFilter)
        if (cancelled) return
        setEditorialItems(items)
        setAdminStatus({ source: 'api', message: `${items.length} ${activeAdminTab.replace('-', ' ')} loaded.` })
      } catch (err) {
        if (!cancelled) setAdminStatus({ source: 'error', message: getAdminErrorMessage(err, 'Unable to load editorial records.') })
      } finally {
        if (!cancelled) setEditorialLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [activeAdminTab, activeContentConfig, authToken, contentStatusFilter, getAdminErrorMessage, hasRemoteAdmin])

  const loadEditorialItems = useCallback(async (tab = activeAdminTab, status = contentStatusFilter) => {
    const config = adminContentConfig[tab]
    if (!hasRemoteAdmin || !config) return
    setEditorialLoading(true)
    try {
      const items = await config.load(authToken, status)
      setEditorialItems(items)
      setAdminStatus({ source: 'api', message: `${items.length} ${tab.replace('-', ' ')} loaded.` })
    } catch (err) {
      setAdminStatus({ source: 'error', message: getAdminErrorMessage(err, 'Unable to load editorial records.') })
    } finally {
      setEditorialLoading(false)
    }
  }, [activeAdminTab, authToken, contentStatusFilter, getAdminErrorMessage, hasRemoteAdmin])

  const currentSectionLabel = adminTabLabels[activeAdminTab] || activeAdminTab

  const loadModerationQueue = useCallback(async (status = moderationStatus) => {
    if (!hasRemoteAdmin) return
    setModerationLoading(true)
    try {
      const items = await getAdminLocalSecrets(authToken, status)
      setModerationItems(items)
      setAdminStatus({ source: 'api', message: `${items.length} ${status} local secret${items.length === 1 ? '' : 's'} loaded.` })
    } catch (err) {
      setAdminStatus({ source: 'error', message: getAdminErrorMessage(err, 'Unable to load moderation queue.') })
    } finally {
      setModerationLoading(false)
    }
  }, [authToken, getAdminErrorMessage, hasRemoteAdmin, moderationStatus])

  const loadAuditLogs = useCallback(async () => {
    if (!hasAdminAccess) return
    setAuditLoading(true)
    try {
      const logs = await getAdminAuditLogs(authToken, 75)
      setAuditLogs(logs)
      setAdminStatus({ source: 'api', message: `${logs.length} audit events loaded.` })
    } catch (err) {
      setAdminStatus({ source: 'error', message: getAdminErrorMessage(err, 'Unable to load audit trail.') })
    } finally {
      setAuditLoading(false)
    }
  }, [authToken, getAdminErrorMessage, hasAdminAccess])

  const loadAdminUsers = useCallback(async () => {
    if (!hasAdminAccess) return
    setUsersLoading(true)
    try {
      const users = await getAdminUsers(authToken)
      setAdminUsers(users)
      setAdminStatus({ source: 'api', message: `${users.length} user account${users.length === 1 ? '' : 's'} loaded.` })
    } catch (err) {
      setAdminStatus({ source: 'error', message: getAdminErrorMessage(err, 'Unable to load user accounts.') })
    } finally {
      setUsersLoading(false)
    }
  }, [authToken, getAdminErrorMessage, hasAdminAccess])

  const loadAdminSources = useCallback(async (filters = sourceFilters) => {
    if (!hasRemoteAdmin) return
    setSourcesLoading(true)
    try {
      const loadedSources = await getAdminSources(authToken, {
        itemType: filters.itemType,
        itemId: filters.itemId || undefined,
      })
      setSources(loadedSources)
      setAdminStatus({ source: 'api', message: `${loadedSources.length} source${loadedSources.length === 1 ? '' : 's'} loaded.` })
    } catch (err) {
      setAdminStatus({ source: 'error', message: getAdminErrorMessage(err, 'Unable to load sources.') })
    } finally {
      setSourcesLoading(false)
    }
  }, [authToken, getAdminErrorMessage, hasRemoteAdmin, sourceFilters])

  const loadAdminCountries = useCallback(async () => {
    if (!hasAdminAccess) return
    setCountriesLoading(true)
    try {
      const loadedCountries = await getAdminCountries(authToken)
      setAdminCountries(loadedCountries)
      setAdminStatus({ source: 'api', message: `${loadedCountries.length} countries loaded.` })
    } catch (err) {
      setAdminStatus({ source: 'error', message: getAdminErrorMessage(err, 'Unable to load countries.') })
    } finally {
      setCountriesLoading(false)
    }
  }, [authToken, getAdminErrorMessage, hasAdminAccess])

  const loadAdminCultureGuides = useCallback(async () => {
    if (!hasRemoteAdmin) return
    setCultureGuidesLoading(true)
    try {
      const loadedGuides = await getAdminCultureGuides(authToken)
      setAdminCultureGuides(loadedGuides)
      setAdminStatus({ source: 'api', message: `${loadedGuides.length} culture guides loaded.` })
    } catch (err) {
      setAdminStatus({ source: 'error', message: getAdminErrorMessage(err, 'Unable to load culture guides.') })
    } finally {
      setCultureGuidesLoading(false)
    }
  }, [authToken, getAdminErrorMessage, hasRemoteAdmin])

  const formText = (form, field) => form.get(field)?.toString().trim() || ''

  const clearEditing = () => {
    setEditingItem(null)
    setUploadedImageUrl('')
  }

  if (!hasRemoteAdmin) {
    return (
      <section className="screen">
        <PageIntro
          eyebrow="Editorial workspace"
          title="Editorial access required"
          text="Sign in with an editor or admin account to manage catalogue records and review community suggestions."
        />
        <span className="status-note blocked">Access restricted</span>
      </section>
    )
  }

  const buildLocationPayload = (form) => ({
    name: formText(form, 'name'),
    type: formText(form, 'type') || defaultCategory,
    country: formText(form, 'country') || defaultCountry,
    city: formText(form, 'city') || 'City not listed',
    address: formText(form, 'address') || 'Address not listed',
    openingHours: formText(form, 'openingHours') || 'Hours not listed',
    contact: formText(form, 'contact') || 'Not listed',
    lat: parseOptionalNumber(form.get('lat')),
    lng: parseOptionalNumber(form.get('lng')),
    image: uploadedImageUrl || formText(form, 'image') || '/hero-grand-bassam.jpg',
    summary: formText(form, 'summary') || 'Editorial summary pending review.',
    history: formText(form, 'history') || 'Historical context pending review by the content team.',
    tags: parseCommaList(form.get('tags')).length ? parseCommaList(form.get('tags')) : ['Editorial draft'],
    relatedStoryIds: [],
    relatedArtifactIds: [],
    status: formText(form, 'status') || 'draft',
  })

  const buildStoryPayload = (form) => {
    const body = parseTextBlocks(form.get('body'))
    const keyPoints = parseLineList(form.get('keyPoints'))
    const timeline = parseTimeline(form.get('timeline'))
    return {
      title: formText(form, 'title'),
      country: formText(form, 'country') || defaultCountry,
      category: formText(form, 'category') || 'Tradition',
      image: uploadedImageUrl || formText(form, 'image') || '/hero-grand-bassam.jpg',
      summary: formText(form, 'summary') || 'Editorial story summary pending review.',
      body: body.length ? body : ['Editorial story body pending review by the content team.'],
      readTime: formText(form, 'readTime') || '5 min read',
      keyPoints: keyPoints.length ? keyPoints : ['Editorial draft', 'Needs source review', 'Ready for content validation'],
      timeline: timeline.length ? timeline : [
        { period: 'Context', text: 'Draft context added by the editorial team.' },
        { period: 'Review', text: 'Source and cultural sensitivity review required before publication.' },
      ],
      relatedLocationIds: [],
      relatedArtifactIds: [],
      status: formText(form, 'status') || 'draft',
    }
  }

  const buildArtifactPayload = (form) => ({
    name: formText(form, 'name'),
    country: formText(form, 'country') || defaultCountry,
    origin: formText(form, 'origin') || 'Origin not listed',
    period: formText(form, 'period') || 'Period not listed',
    image: uploadedImageUrl || formText(form, 'image') || '/hero-grand-bassam.jpg',
    summary: formText(form, 'summary') || 'Editorial artifact description pending review.',
    significance: formText(form, 'significance') || 'Cultural interpretation pending review by the content team.',
    relatedLocationId: formText(form, 'relatedLocationId'),
    relatedStoryIds: parseCommaList(form.get('relatedStoryIds')),
    status: formText(form, 'status') || 'draft',
  })

  const saveRemoteContent = async (payload, formElement) => {
    if (!activeContentConfig) return
    const label = activeContentConfig.label
    const existingSlug = editingItem?.slug || editingItem?.id

    if (!hasAdminAccess && ['published', 'archived'].includes(editingItem?.status)) {
      setAdminStatus({ source: 'error', message: 'Admin access is required to edit published or archived records.' })
      return
    }

    if (!hasAdminAccess && ['published', 'archived'].includes(payload.status)) {
      setAdminStatus({ source: 'error', message: 'Admin access is required to publish or archive records.' })
      return
    }

    const publishError = validatePublishPayload(activeAdminTab, payload)
    if (publishError) {
      setAdminStatus({ source: 'error', message: publishError })
      return
    }

    if (payload.status === 'published' && editingItem?.status !== 'published') {
      const confirmed = window.confirm(`Publish ${payload.name ?? payload.title} to the public catalogue?`)
      if (!confirmed) return
    }

    if (editingItem?.status === 'published' && payload.status !== 'published') {
      const confirmed = window.confirm(`${editingItem.name ?? editingItem.title} is currently public. Move it to ${payload.status}?`)
      if (!confirmed) return
    }

    setIsSubmitting(true)
    setAdminStatus({ source: 'saving', message: `Saving ${label}...` })
    try {
      const request = editingItem
        ? () => activeContentConfig.update(authToken, existingSlug, payload)
        : () => activeContentConfig.create(authToken, payload)
      const result = await request()
      if (result.status === 'published' || editingItem?.status === 'published') await refreshCatalog()
      await loadEditorialItems(activeAdminTab, contentStatusFilter)
      setAdminStatus({ source: 'api', message: `${payload.name ?? payload.title} saved as ${result.status}.` })
      formElement.reset()
      clearEditing()
    } catch (err) {
      setAdminStatus({ source: 'error', message: getAdminErrorMessage(err, `Unable to save ${label}.`) })
    } finally {
      setIsSubmitting(false)
    }
  }

  const uploadFormImage = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setIsUploadingMedia(true)
    setAdminStatus({ source: 'saving', message: 'Uploading image...' })
    try {
      const asset = await uploadAdminMedia(authToken, file, { altText: editingItem?.name || editingItem?.title || '' })
      setUploadedImageUrl(asset.url)
      setAdminStatus({ source: 'api', message: 'Image uploaded. Save the record to apply it.' })
    } catch (err) {
      setAdminStatus({ source: 'error', message: getAdminErrorMessage(err, 'Image upload failed.') })
    } finally {
      setIsUploadingMedia(false)
      event.target.value = ''
    }
  }

  const archiveEditorialItem = async (item) => {
    if (!activeContentConfig) return
    const confirmed = window.confirm(`Archive ${item.name ?? item.title}? It will be removed from public discovery if it is currently published.`)
    if (!confirmed) return

    const slug = item.slug || item.id
    setIsSubmitting(true)
    setAdminStatus({ source: 'saving', message: `Archiving ${item.name ?? item.title}...` })
    try {
      await activeContentConfig.archive(authToken, slug)
      if (item.status === 'published') await refreshCatalog()
      if ((editingItem?.slug || editingItem?.id) === slug) clearEditing()
      await loadEditorialItems(activeAdminTab, contentStatusFilter)
      setAdminStatus({ source: 'api', message: `${item.name ?? item.title} archived.` })
    } catch (err) {
      setAdminStatus({ source: 'error', message: getAdminErrorMessage(err, 'Unable to archive record.') })
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitLocation = async (event) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const payload = buildLocationPayload(new FormData(formElement))
    if (!payload.name) return
    await saveRemoteContent(payload, formElement)
  }

  const submitStory = async (event) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const payload = buildStoryPayload(new FormData(formElement))
    if (!payload.title) return
    await saveRemoteContent(payload, formElement)
  }

  const submitArtifact = async (event) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const payload = buildArtifactPayload(new FormData(formElement))
    if (!payload.name) return
    await saveRemoteContent(payload, formElement)
  }

  const moderateLocalSecret = async (id, status) => {
    if (!hasRemoteAdmin) return
    if (!hasAdminAccess && ['published', 'rejected', 'archived'].includes(status)) {
      setAdminStatus({ source: 'error', message: 'Admin access is required for that moderation action.' })
      return
    }

    if (['published', 'rejected', 'archived'].includes(status)) {
      const confirmed = window.confirm(`Mark this suggestion as ${status}?`)
      if (!confirmed) return
    }

    setModerationLoading(true)
    try {
      await updateAdminLocalSecretStatus(authToken, id, status)
      setModerationItems((current) => current.filter((item) => item.id !== id))
      if (status === 'published') await refreshLocalSecrets()
      setAdminStatus({ source: 'api', message: `Local secret marked ${status}.` })
    } catch (err) {
      setAdminStatus({ source: 'error', message: getAdminErrorMessage(err, 'Unable to update local secret.') })
    } finally {
      setModerationLoading(false)
    }
  }

  const updateUserAccess = async (user, patch) => {
    if (!hasAdminAccess) return
    const isDisabling = patch.isActive === false
    const roleChange = patch.role && patch.role !== user.role
    if (isDisabling || roleChange) {
      const action = isDisabling ? `disable ${user.email}` : `change ${user.email} to ${patch.role}`
      const confirmed = window.confirm(`Confirm account update: ${action}?`)
      if (!confirmed) return
    }

    setUsersLoading(true)
    try {
      const updated = await updateAdminUser(authToken, user.id, patch)
      setAdminUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      setAdminStatus({ source: 'api', message: `${updated.email} updated.` })
    } catch (err) {
      setAdminStatus({ source: 'error', message: getAdminErrorMessage(err, 'Unable to update user account.') })
    } finally {
      setUsersLoading(false)
    }
  }

  const saveSource = async (event) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const payload = {
      itemType: formText(form, 'itemType') || sourceFilters.itemType,
      itemId: formText(form, 'itemId'),
      title: formText(form, 'title'),
      url: formText(form, 'url'),
      note: formText(form, 'note'),
    }
    if (!payload.itemId || !payload.title) return

    setSourcesLoading(true)
    setAdminStatus({ source: 'saving', message: editingSource ? 'Updating source...' : 'Adding source...' })
    try {
      const saved = editingSource
        ? await updateAdminSource(authToken, editingSource.id, payload)
        : await createAdminSource(authToken, payload)
      const nextFilters = { itemType: saved.itemType, itemId: '' }
      setSourceFilters(nextFilters)
      setEditingSource(null)
      formElement.reset()
      await refreshCatalog()
      await loadAdminSources(nextFilters)
      setAdminStatus({ source: 'api', message: `${saved.title} source saved.` })
    } catch (err) {
      setAdminStatus({ source: 'error', message: getAdminErrorMessage(err, 'Unable to save source.') })
    } finally {
      setSourcesLoading(false)
    }
  }

  const deleteSourceItem = async (sourceItem) => {
    if (!hasAdminAccess) {
      setAdminStatus({ source: 'error', message: 'Admin access is required to delete sources.' })
      return
    }
    const confirmed = window.confirm(`Delete source: ${sourceItem.title}?`)
    if (!confirmed) return

    setSourcesLoading(true)
    try {
      await deleteAdminSource(authToken, sourceItem.id)
      setSources((current) => current.filter((item) => item.id !== sourceItem.id))
      if (editingSource?.id === sourceItem.id) setEditingSource(null)
      await refreshCatalog()
      setAdminStatus({ source: 'api', message: `${sourceItem.title} source deleted.` })
    } catch (err) {
      setAdminStatus({ source: 'error', message: getAdminErrorMessage(err, 'Unable to delete source.') })
    } finally {
      setSourcesLoading(false)
    }
  }

  const saveCountry = async (event) => {
    event.preventDefault()
    if (!hasAdminAccess) return
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const payload = {
      name: formText(form, 'name'),
      code: formText(form, 'code'),
      region: formText(form, 'region'),
      description: formText(form, 'description'),
      imageUrl: formText(form, 'imageUrl'),
      isAvailable: formText(form, 'isAvailable') === 'true',
      mapLat: parseOptionalNumber(form.get('mapLat')),
      mapLng: parseOptionalNumber(form.get('mapLng')),
    }
    if (!payload.name) return

    setCountriesLoading(true)
    try {
      const saved = editingCountry
        ? await updateAdminCountry(authToken, editingCountry.slug, payload)
        : await createAdminCountry(authToken, payload)
      setEditingCountry(null)
      formElement.reset()
      await Promise.all([refreshCatalog(), loadAdminCountries()])
      setAdminStatus({ source: 'api', message: `${saved.name} country saved.` })
    } catch (err) {
      setAdminStatus({ source: 'error', message: getAdminErrorMessage(err, 'Unable to save country.') })
    } finally {
      setCountriesLoading(false)
    }
  }

  const buildCultureGuidePayload = (form) => ({
    languages: parseCommaList(form.get('languages')),
    overview: formText(form, 'overview'),
    status: formText(form, 'status') || 'draft',
    phrases: parsePipeRows(form.get('phrases'), ([language, english, local, pronunciation, context, status]) => (
      language && english && local ? { language, english, local, pronunciation, context, status: status || 'draft' } : null
    )),
    greetings: parseLineList(form.get('greetings')),
    etiquette: parseLineList(form.get('etiquette')),
    taboos: parseLineList(form.get('taboos')),
    foods: parsePipeRows(form.get('foods'), ([name, description, commonIn, status]) => (
      name ? { name, description, commonIn: parseCommaList(commonIn), status: status || 'draft' } : null
    )),
    foodSpots: parsePipeRows(form.get('foodSpots'), ([name, city, specialty, priceLevel, lat, lng, status]) => (
      name ? { name, city, specialty, priceLevel, coordinates: { lat: parseOptionalNumber(lat), lng: parseOptionalNumber(lng) }, status: status || 'draft' } : null
    )),
    musicStyles: parsePipeRows(form.get('musicStyles'), ([name, description, context, status]) => (
      name ? { name, description, context, status: status || 'draft' } : null
    )),
    clothingStyles: parsePipeRows(form.get('clothingStyles'), ([name, description, context, status]) => (
      name ? { name, description, context, status: status || 'draft' } : null
    )),
  })

  const saveCultureGuide = async (event) => {
    event.preventDefault()
    if (!hasRemoteAdmin) return
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const countrySlug = formText(form, 'countrySlug')
    if (!countrySlug) return
    const payload = buildCultureGuidePayload(form)

    if (!hasAdminAccess && ['published', 'archived'].includes(payload.status)) {
      setAdminStatus({ source: 'error', message: 'Admin access is required to publish or archive culture guides.' })
      return
    }

    setCultureGuidesLoading(true)
    try {
      const saved = await updateAdminCultureGuide(authToken, countrySlug, payload)
      setEditingCultureGuide(saved)
      await Promise.all([refreshCatalog(), loadAdminCultureGuides()])
      setAdminStatus({ source: 'api', message: `${saved.country} culture guide saved as ${saved.status}.` })
    } catch (err) {
      setAdminStatus({ source: 'error', message: getAdminErrorMessage(err, 'Unable to save culture guide.') })
    } finally {
      setCultureGuidesLoading(false)
    }
  }

  const archiveCultureGuide = async (guide) => {
    if (!hasAdminAccess) return
    const confirmed = window.confirm(`Archive ${guide.country} culture guide? It will be removed from the public culture guide.`)
    if (!confirmed) return
    setCultureGuidesLoading(true)
    try {
      await archiveAdminCultureGuide(authToken, guide.slug)
      await Promise.all([refreshCatalog(), loadAdminCultureGuides()])
      if (editingCultureGuide?.slug === guide.slug) setEditingCultureGuide(null)
      setAdminStatus({ source: 'api', message: `${guide.country} culture guide archived.` })
    } catch (err) {
      setAdminStatus({ source: 'error', message: getAdminErrorMessage(err, 'Unable to archive culture guide.') })
    } finally {
      setCultureGuidesLoading(false)
    }
  }

  return (
    <section className="screen admin-screen">
      <PageIntro
        eyebrow="Editorial workspace"
        title="Editorial dashboard"
        text="Manage cultural records, review suggestions, and control what becomes visible in public discovery."
      />
      <div className="toolbar-panel">
        <span className={statusNoteClass(displayedAdminStatus.source)}>{displayedAdminStatus.message}</span>
      </div>
      <EditorialAccessSummary
        currentUser={currentUser}
        section={currentSectionLabel}
        statusFilter={activeAdminTab === 'audit' ? 'latest activity' : activeAdminTab === 'users' ? 'active accounts' : activeAdminTab === 'countries' ? 'available countries' : activeAdminTab === 'culture-guides' ? 'guide workflow' : activeAdminTab === 'sources' ? sourceItemTypeLabels[sourceFilters.itemType] : activeContentConfig ? contentStatusFilter : moderationStatus}
        publicCount={activeAdminTab === 'users' ? adminUsers.filter((user) => user.isActive).length : activeAdminTab === 'countries' ? adminCountries.filter((country) => country.available).length : activeAdminTab === 'culture-guides' ? adminCultureGuides.filter((guide) => guide.status === 'published').length : activeAdminTab === 'sources' ? sources.filter((sourceItem) => sourceItem.url).length : activeContentConfig ? editorialItems.filter((item) => item.status === 'published').length : 0}
        totalCount={activeAdminTab === 'audit' ? auditLogs.length : activeAdminTab === 'users' ? adminUsers.length : activeAdminTab === 'countries' ? adminCountries.length : activeAdminTab === 'culture-guides' ? adminCultureGuides.length : activeAdminTab === 'sources' ? sources.length : activeContentConfig ? editorialItems.length : moderationItems.length}
      />
      <div className="segmented-control admin-tabs" aria-label="Admin content type">
        {adminTabs.map((tab) => (
          <button
            className={activeAdminTab === tab ? 'active' : ''}
            key={tab}
            type="button"
            onClick={() => {
              setAdminTab(tab)
              clearEditing()
              if (tab === 'local-secrets') loadModerationQueue()
              if (tab === 'users') loadAdminUsers()
              if (tab === 'countries') loadAdminCountries()
              if (tab === 'culture-guides') loadAdminCultureGuides()
              if (tab === 'sources') loadAdminSources()
              if (tab === 'audit') loadAuditLogs()
            }}
          >
            {adminTabLabels[tab]}
          </button>
        ))}
      </div>

      {activeAdminTab === 'audit' ? (
        <AuditLogPanel auditLogs={auditLogs} auditLoading={auditLoading} loadAuditLogs={loadAuditLogs} />
      ) : activeAdminTab === 'countries' ? (
        <AdminCountriesPanel
          countries={adminCountries}
          fallbackCountries={countries}
          countriesLoading={countriesLoading}
          editingCountry={editingCountry}
          setEditingCountry={setEditingCountry}
          loadAdminCountries={loadAdminCountries}
          saveCountry={saveCountry}
        />
      ) : activeAdminTab === 'culture-guides' ? (
        <AdminCultureGuidesPanel
          guides={adminCultureGuides.length ? adminCultureGuides : cultureGuideCatalog}
          countries={adminCountries.length ? adminCountries : countries.map((country) => ({ name: country, slug: slugFromText(country), available: true }))}
          cultureGuidesLoading={cultureGuidesLoading}
          editingGuide={editingCultureGuide}
          setEditingGuide={setEditingCultureGuide}
          loadAdminCultureGuides={loadAdminCultureGuides}
          saveCultureGuide={saveCultureGuide}
          archiveCultureGuide={archiveCultureGuide}
          statusOptions={editableStatusOptions}
          canArchive={hasAdminAccess}
        />
      ) : activeAdminTab === 'sources' ? (
        <AdminSourcesPanel
          sources={sources}
          sourcesLoading={sourcesLoading}
          sourceFilters={sourceFilters}
          setSourceFilters={setSourceFilters}
          sourceTargets={sourceTargets}
          editingSource={editingSource}
          setEditingSource={setEditingSource}
          loadAdminSources={loadAdminSources}
          saveSource={saveSource}
          deleteSourceItem={deleteSourceItem}
          canDelete={hasAdminAccess}
        />
      ) : activeAdminTab === 'users' ? (
        <AdminUsersPanel
          users={adminUsers}
          usersLoading={usersLoading}
          currentUser={currentUser}
          loadAdminUsers={loadAdminUsers}
          updateUserAccess={updateUserAccess}
        />
      ) : activeAdminTab === 'local-secrets' ? (
        <AdminLocalSecretsPanel
          moderationStatus={moderationStatus}
          setModerationStatus={setModerationStatus}
          statusOptions={suggestionStatusOptions}
          moderationItems={moderationItems}
          moderationLoading={moderationLoading}
          loadModerationQueue={loadModerationQueue}
          moderateLocalSecret={moderateLocalSecret}
        />
      ) : (
        <div className="admin-layout">
          <div className="settings-panel admin-form-panel">
            <div className="panel-heading">
              <Plus size={20} />
              <h2>{editingItem ? `Edit ${activeContentConfig.label}` : `Create ${activeContentConfig.label}`}</h2>
            </div>
            {uploadedImageUrl && <span className="status-note ready">Image ready for this record</span>}
            {!hasAdminAccess && <span className="status-note">Editors can save drafts and move records to review. Publishing and archive actions require admin approval.</span>}
            {activeAdminTab === 'locations' && <LocalLocationForm key={`location-${editingItem?.id || 'new'}`} countries={countries} categories={categories} statusOptions={editableStatusOptions} onSubmit={submitLocation} includeStatus initialValues={editingItem} isSubmitting={isSubmitting} isUploadingMedia={isUploadingMedia} remoteMode isEditing={Boolean(editingItem)} onImageUpload={uploadFormImage} uploadedImageUrl={uploadedImageUrl} />}
            {activeAdminTab === 'stories' && <LocalStoryForm key={`story-${editingItem?.id || 'new'}`} countries={countries} statusOptions={editableStatusOptions} onSubmit={submitStory} includeStatus initialValues={editingItem} isSubmitting={isSubmitting} isUploadingMedia={isUploadingMedia} remoteMode isEditing={Boolean(editingItem)} onImageUpload={uploadFormImage} uploadedImageUrl={uploadedImageUrl} />}
            {activeAdminTab === 'artifacts' && <LocalArtifactForm key={`artifact-${editingItem?.id || 'new'}`} countries={countries} statusOptions={editableStatusOptions} onSubmit={submitArtifact} includeStatus initialValues={editingItem} isSubmitting={isSubmitting} isUploadingMedia={isUploadingMedia} remoteMode isEditing={Boolean(editingItem)} onImageUpload={uploadFormImage} uploadedImageUrl={uploadedImageUrl} />}
            {editingItem && (
              <button className="text-action" type="button" onClick={clearEditing}>
                Cancel editing
              </button>
            )}
          </div>
          <div className="settings-panel admin-records-panel">
            <div className="panel-heading">
              <Layers size={20} />
              <h2>Editorial records</h2>
            </div>
            <InfoGrid
              items={[
                { label: 'Role', value: currentUser?.role || 'none' },
                { label: 'Visible', value: editorialItems.filter((item) => item.status === 'published').length },
                { label: 'Total', value: editorialItems.length },
              ]}
            />
            <p>Published records appear in public discovery. Draft and review records stay private until they pass editorial checks.</p>
            <div className="toolbar-panel moderation-toolbar">
              <FormSelect
                name="contentStatusFilter"
                label="Status"
                options={editorialStatusFilters}
                value={contentStatusFilter}
                onChange={(event) => {
                  setContentStatusFilter(event.target.value)
                  clearEditing()
                }}
              />
              <button className="secondary-action" type="button" onClick={() => loadEditorialItems()} disabled={editorialLoading}>
                <Archive size={18} />
                {editorialLoading ? 'Loading...' : 'Refresh records'}
              </button>
            </div>
            <EditorialRecordsList
              items={editorialItems}
              activeItem={editingItem}
              isLoading={editorialLoading}
              onEdit={(item) => {
                setEditingItem(item)
                setUploadedImageUrl('')
              }}
              onArchive={archiveEditorialItem}
              canArchive={hasAdminAccess}
              canEditPublished={hasAdminAccess}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}
    </section>
  )
}

function EditorialAccessSummary({ currentUser, section, statusFilter, publicCount, totalCount }) {
  return (
    <div className="editorial-access-panel">
      <div>
        <span className="eyebrow">Verified access</span>
        <strong>{currentUser?.name || 'Editorial user'}</strong>
        <small>{currentUser?.email} · {currentUser?.role}</small>
      </div>
      <InfoGrid
        items={[
          { label: 'Section', value: section },
          { label: 'Filter', value: statusFilter },
          { label: 'Public / Total', value: `${publicCount} / ${totalCount}` },
        ]}
      />
    </div>
  )
}

function EditorialRecordsList({ items, activeItem, isLoading, onEdit, onArchive, canArchive, canEditPublished, isSubmitting }) {
  if (isLoading && !items.length) return <p>Loading editorial records...</p>
  if (!items.length) return <p>No records in this status group.</p>

  return (
    <div className="editorial-record-list">
      {items.map((item) => {
        const title = item.name ?? item.title
        const active = (activeItem?.slug || activeItem?.id) === (item.slug || item.id)
        const canEdit = canEditPublished || !['published', 'archived'].includes(item.status)
        return (
          <article className={active ? 'editorial-record-card active' : 'editorial-record-card'} key={item.slug || item.id}>
            <img src={item.image || '/hero-grand-bassam.jpg'} alt="" />
            <div>
              <span className={`content-status ${item.status}`}>{item.status}</span>
              <strong>{title}</strong>
              <small>{item.country} · {item.type ?? item.category ?? item.period ?? 'Catalogue record'}</small>
            </div>
            <div className="editorial-record-actions">
              {canEdit ? (
                <button className="secondary-action" type="button" onClick={() => onEdit(item)}>
                  Edit
                </button>
              ) : (
                <span className="status-note">Admin locked</span>
              )}
              {canArchive && item.status !== 'archived' && (
                <button className="secondary-action danger-action" type="button" aria-label={`Archive ${title}`} onClick={() => onArchive(item)} disabled={isSubmitting}>
                  <Trash2 size={18} />
                  Archive
                </button>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}

function AdminSourcesPanel({ sources, sourcesLoading, sourceFilters, setSourceFilters, sourceTargets, editingSource, setEditingSource, loadAdminSources, saveSource, deleteSourceItem, canDelete }) {
  const activeType = editingSource?.itemType || sourceFilters.itemType
  const activeTargets = sourceTargets[activeType] || []
  const selectedTargetId = editingSource?.itemId || sourceFilters.itemId || activeTargets[0]?.id || ''
  const targetOptions = activeTargets.some((target) => target.id === selectedTargetId) || !selectedTargetId
    ? activeTargets
    : [{ id: selectedTargetId, label: selectedTargetId }, ...activeTargets]

  return (
    <div className="admin-layout sources-layout">
      <div className="settings-panel admin-form-panel">
        <div className="panel-heading">
          <BookOpen size={20} />
          <h2>{editingSource ? 'Edit source' : 'Add source'}</h2>
        </div>
        <form className="admin-form" key={`${editingSource?.id || 'new'}-${activeType}`} onSubmit={saveSource}>
          <input type="hidden" name="itemType" value={activeType} />
          <label className="form-field">
            <span>Content record</span>
            <select name="itemId" defaultValue={selectedTargetId} required>
              {targetOptions.map((target) => (
                <option value={target.id} key={target.id}>{target.label}</option>
              ))}
            </select>
          </label>
          <FormInput name="title" label="Source title" defaultValue={editingSource?.title || ''} required />
          <FormInput name="url" label="Source URL" type="url" placeholder="https://..." defaultValue={editingSource?.url || ''} />
          <FormTextarea name="note" label="Editorial note" defaultValue={editingSource?.note || ''} />
          <button className="primary-action" type="submit" disabled={sourcesLoading || !targetOptions.length}>
            {sourcesLoading ? 'Saving...' : editingSource ? 'Update source' : 'Add source'}
          </button>
        </form>
        {editingSource && (
          <button className="text-action" type="button" onClick={() => setEditingSource(null)}>
            Cancel editing
          </button>
        )}
      </div>
      <div className="settings-panel admin-sources-panel">
        <div className="panel-heading">
          <Layers size={20} />
          <h2>Source library</h2>
        </div>
        <p>Sources give readers a clear path back to official records, museum pages, books, or editorial references.</p>
        <div className="toolbar-panel moderation-toolbar">
          <label className="form-field">
            <span>Content type</span>
            <select
              name="sourceItemType"
              value={sourceFilters.itemType}
              onChange={(event) => {
                const nextFilters = { itemType: event.target.value, itemId: '' }
                setSourceFilters(nextFilters)
                setEditingSource(null)
                loadAdminSources(nextFilters)
              }}
            >
              {sourceItemTypes.map((type) => (
                <option value={type} key={type}>{sourceItemTypeLabels[type]}</option>
              ))}
            </select>
          </label>
          <FormInput
            name="sourceItemFilter"
            label="Record slug"
            placeholder="Optional"
            value={sourceFilters.itemId}
            onChange={(event) => setSourceFilters((current) => ({ ...current, itemId: event.target.value.trim() }))}
          />
          <button className="secondary-action" type="button" onClick={() => loadAdminSources(sourceFilters)} disabled={sourcesLoading}>
            <Archive size={18} />
            {sourcesLoading ? 'Loading...' : 'Refresh sources'}
          </button>
        </div>
        {sources.length > 0 ? (
          <div className="source-list">
            {sources.map((sourceItem) => (
              <article className={editingSource?.id === sourceItem.id ? 'source-card active' : 'source-card'} key={sourceItem.id}>
                <div>
                  <span className="content-status review">{sourceItemTypeLabels[sourceItem.itemType] || sourceItem.itemType}</span>
                  <strong>{sourceItem.title}</strong>
                  <small>{sourceItem.itemId}{sourceItem.url ? ` · ${new URL(sourceItem.url).hostname}` : ''}</small>
                  {sourceItem.note && <p>{sourceItem.note}</p>}
                </div>
                <div className="source-actions">
                  {sourceItem.url && (
                    <a className="secondary-action" href={sourceItem.url} target="_blank" rel="noreferrer">
                      Open
                    </a>
                  )}
                  <button className="secondary-action" type="button" onClick={() => setEditingSource(sourceItem)}>
                    Edit
                  </button>
                  {canDelete && (
                    <button className="secondary-action danger-action" type="button" onClick={() => deleteSourceItem(sourceItem)} disabled={sourcesLoading}>
                      Delete
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p>{sourcesLoading ? 'Loading sources...' : 'No sources found for this filter.'}</p>
        )}
      </div>
    </div>
  )
}

function AdminCountriesPanel({ countries, fallbackCountries, countriesLoading, editingCountry, setEditingCountry, loadAdminCountries, saveCountry }) {
  const visibleCountries = countries.length ? countries : fallbackCountries.map((country) => ({ name: country, slug: slugFromText(country), available: true }))

  return (
    <div className="admin-layout countries-layout">
      <div className="settings-panel admin-form-panel">
        <div className="panel-heading">
          <MapPinned size={20} />
          <h2>{editingCountry ? 'Edit country' : 'Create country'}</h2>
        </div>
        <form className="admin-form" key={editingCountry?.slug || 'new-country'} onSubmit={saveCountry}>
          <FormInput name="name" label="Country name" defaultValue={editingCountry?.name || ''} required />
          <FormInput name="code" label="ISO code" defaultValue={editingCountry?.code || ''} />
          <FormInput name="region" label="Region" defaultValue={editingCountry?.region || ''} />
          <FormInput name="imageUrl" label="Image URL" defaultValue={editingCountry?.image || ''} />
          <FormInput name="mapLat" label="Map latitude" type="number" step="any" defaultValue={editingCountry?.mapPoint?.lat ?? ''} />
          <FormInput name="mapLng" label="Map longitude" type="number" step="any" defaultValue={editingCountry?.mapPoint?.lng ?? ''} />
          <label className="form-field">
            <span>Availability</span>
            <select name="isAvailable" defaultValue={editingCountry?.available === false ? 'false' : 'true'}>
              <option value="true">Available</option>
              <option value="false">Hidden</option>
            </select>
          </label>
          <FormTextarea name="description" label="Country overview" defaultValue={editingCountry?.description || ''} />
          <button className="primary-action" type="submit" disabled={countriesLoading}>{countriesLoading ? 'Saving...' : editingCountry ? 'Update country' : 'Create country'}</button>
        </form>
        {editingCountry && <button className="text-action" type="button" onClick={() => setEditingCountry(null)}>Cancel editing</button>}
      </div>
      <div className="settings-panel admin-sources-panel">
        <div className="panel-heading">
          <Layers size={20} />
          <h2>Country coverage</h2>
        </div>
        <button className="secondary-action wide" type="button" onClick={loadAdminCountries} disabled={countriesLoading}>
          <Archive size={18} />
          {countriesLoading ? 'Loading...' : 'Refresh countries'}
        </button>
        <div className="source-list">
          {visibleCountries.map((country) => (
            <article className={editingCountry?.slug === country.slug ? 'source-card active' : 'source-card'} key={country.slug || country.name}>
              <div>
                <span className={`content-status ${country.available ? 'published' : 'archived'}`}>{country.available ? 'available' : 'hidden'}</span>
                <strong>{country.name}</strong>
                <small>{country.region || 'Region not set'}{country.code ? ` · ${country.code}` : ''}</small>
                {country.description && <p>{country.description}</p>}
              </div>
              <div className="source-actions">
                <button className="secondary-action" type="button" onClick={() => setEditingCountry(country)}>
                  Edit
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

function AdminCultureGuidesPanel({ guides, countries, cultureGuidesLoading, editingGuide, setEditingGuide, loadAdminCultureGuides, saveCultureGuide, archiveCultureGuide, statusOptions, canArchive }) {
  const selectedGuide = editingGuide || guides[0] || null
  const selectedCountrySlug = selectedGuide?.slug || countries[0]?.slug || ''

  return (
    <div className="admin-layout culture-admin-layout">
      <div className="settings-panel admin-form-panel culture-guide-form-panel">
        <div className="panel-heading">
          <BookOpen size={20} />
          <h2>{selectedGuide ? `Edit ${selectedGuide.country}` : 'Create culture guide'}</h2>
        </div>
        <form className="admin-form" key={selectedGuide?.slug || selectedCountrySlug || 'new-guide'} onSubmit={saveCultureGuide}>
          <label className="form-field">
            <span>Country</span>
            <select name="countrySlug" defaultValue={selectedCountrySlug}>
              {countries.map((country) => (
                <option value={country.slug} key={country.slug}>{country.name}</option>
              ))}
            </select>
          </label>
          <FormSelect name="status" label="Status" options={statusOptions} defaultValue={statusOptions.includes(selectedGuide?.status) ? selectedGuide.status : 'draft'} />
          <FormInput name="languages" label="Languages" defaultValue={listToFormText(selectedGuide?.languages)} />
          <FormTextarea name="overview" label="Overview" defaultValue={selectedGuide?.overview || ''} />
          <FormTextarea name="phrases" label="Phrases" placeholder="Language | English | Local | Pronunciation | Context | Status" defaultValue={phraseRowsToFormText(selectedGuide?.phrases)} />
          <FormTextarea name="greetings" label="Greetings" defaultValue={listToFormText(selectedGuide?.greetings, '\n')} />
          <FormTextarea name="etiquette" label="Etiquette" defaultValue={listToFormText(selectedGuide?.etiquette, '\n')} />
          <FormTextarea name="taboos" label="Taboos" defaultValue={listToFormText(selectedGuide?.taboos, '\n')} />
          <FormTextarea name="foods" label="Foods" placeholder="Name | Description | Common countries | Status" defaultValue={foodRowsToFormText(selectedGuide?.foods)} />
          <FormTextarea name="foodSpots" label="Food spots" placeholder="Name | City | Specialty | Price | Lat | Lng | Status" defaultValue={foodSpotRowsToFormText(selectedGuide?.foodSpots)} />
          <FormTextarea name="musicStyles" label="Music styles" placeholder="Name | Description | Context | Status" defaultValue={styleRowsToFormText(selectedGuide?.musicStyles)} />
          <FormTextarea name="clothingStyles" label="Clothing styles" placeholder="Name | Description | Context | Status" defaultValue={styleRowsToFormText(selectedGuide?.clothingStyles)} />
          <button className="primary-action" type="submit" disabled={cultureGuidesLoading || !selectedCountrySlug}>{cultureGuidesLoading ? 'Saving...' : 'Save culture guide'}</button>
        </form>
      </div>
      <div className="settings-panel admin-sources-panel">
        <div className="panel-heading">
          <Layers size={20} />
          <h2>Guide records</h2>
        </div>
        <button className="secondary-action wide" type="button" onClick={loadAdminCultureGuides} disabled={cultureGuidesLoading}>
          <Archive size={18} />
          {cultureGuidesLoading ? 'Loading...' : 'Refresh guides'}
        </button>
        <div className="source-list">
          {guides.map((guide) => (
            <article className={selectedGuide?.slug === guide.slug ? 'source-card active' : 'source-card'} key={guide.slug}>
              <div>
                <span className={`content-status ${guide.status}`}>{guide.status}</span>
                <strong>{guide.country}</strong>
                <small>{guide.languages?.join(' · ') || 'Languages not set'} · {guide.phrases?.length || 0} phrases</small>
                {guide.overview && <p>{guide.overview}</p>}
              </div>
              <div className="source-actions">
                <button className="secondary-action" type="button" onClick={() => setEditingGuide(guide)}>
                  Edit
                </button>
                {canArchive && guide.status !== 'archived' && (
                  <button className="secondary-action danger-action" type="button" onClick={() => archiveCultureGuide(guide)} disabled={cultureGuidesLoading}>
                    Archive
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

function AuditLogPanel({ auditLogs, auditLoading, loadAuditLogs }) {
  return (
    <div className="settings-panel admin-moderation-panel audit-panel">
      <div className="panel-heading">
        <ShieldCheck size={20} />
        <h2>Audit trail</h2>
      </div>
      <p>Recent admin and editorial actions are recorded here for accountability.</p>
      <button className="secondary-action wide" type="button" onClick={loadAuditLogs} disabled={auditLoading}>
        <Archive size={18} />
        {auditLoading ? 'Loading...' : 'Refresh audit trail'}
      </button>
      {auditLogs.length > 0 ? (
        <div className="audit-log-list">
          {auditLogs.map((log) => (
            <article className="audit-log-card" key={log.id}>
              <div>
                <span className="content-status published">{log.action}</span>
                <strong>{log.entityTitle || log.entityId || log.entityType}</strong>
                <small>{log.entityType} · {new Date(log.createdAt).toLocaleString()}</small>
              </div>
              <small>{log.actorEmail || 'System'} · {log.actorRole || 'unknown role'}</small>
            </article>
          ))}
        </div>
      ) : (
        <p>{auditLoading ? 'Loading audit trail...' : 'No audit events yet.'}</p>
      )}
    </div>
  )
}

function AdminUsersPanel({ users, usersLoading, currentUser, loadAdminUsers, updateUserAccess }) {
  const roleOptions = currentUser?.role === 'super_admin' ? userRoleOptions : editorAssignableRoles

  return (
    <div className="settings-panel admin-users-panel">
      <div className="panel-heading">
        <UserPlus size={20} />
        <h2>User access</h2>
      </div>
      <p>Review account access, assign editorial roles, and disable accounts that should no longer enter the workspace.</p>
      <button className="secondary-action wide" type="button" onClick={loadAdminUsers} disabled={usersLoading}>
        <Archive size={18} />
        {usersLoading ? 'Loading...' : 'Refresh users'}
      </button>
      {users.length > 0 ? (
        <div className="admin-user-list">
          {users.map((user) => {
            const isSelf = user.id === currentUser?.id
            const protectedAdmin = currentUser?.role !== 'super_admin' && ['admin', 'super_admin'].includes(user.role)
            const canManage = !isSelf && !protectedAdmin
            const canUseCurrentRole = roleOptions.includes(user.role)
            const selectOptions = canUseCurrentRole ? roleOptions : [user.role, ...roleOptions]
            return (
              <article className={user.isActive ? 'admin-user-card' : 'admin-user-card inactive'} key={user.id}>
                <div>
                  <span className={`content-status ${user.isActive ? 'published' : 'archived'}`}>{user.isActive ? 'active' : 'disabled'}</span>
                  <strong>{user.name}</strong>
                  <small>{user.email} · joined {new Date(user.createdAt).toLocaleDateString()}</small>
                </div>
                <FormSelect
                  name={`role-${user.id}`}
                  label="Role"
                  options={selectOptions}
                  value={user.role}
                  onChange={(event) => updateUserAccess(user, { role: event.target.value })}
                  disabled={!canManage || usersLoading}
                />
                <div className="admin-user-actions">
                  {isSelf ? (
                    <span className="status-note">Current account</span>
                  ) : protectedAdmin ? (
                    <span className="status-note">Super admin only</span>
                  ) : (
                    <button
                      className={user.isActive ? 'secondary-action danger-action' : 'secondary-action'}
                      type="button"
                      onClick={() => updateUserAccess(user, { isActive: !user.isActive })}
                      disabled={usersLoading}
                    >
                      {user.isActive ? 'Disable' : 'Reactivate'}
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <p>{usersLoading ? 'Loading user accounts...' : 'No user accounts loaded yet.'}</p>
      )}
    </div>
  )
}

function AdminLocalSecretsPanel({ moderationStatus, setModerationStatus, statusOptions, moderationItems, moderationLoading, loadModerationQueue, moderateLocalSecret }) {
  return (
    <div className="settings-panel admin-moderation-panel">
      <div className="panel-heading">
        <ShieldCheck size={20} />
        <h2>Local secrets moderation</h2>
      </div>
      <div className="toolbar-panel moderation-toolbar">
        <label className="form-field moderation-status-field">
          <span>Status</span>
          <select
            value={moderationStatus}
            onChange={(event) => {
              const nextStatus = event.target.value
              setModerationStatus(nextStatus)
              loadModerationQueue(nextStatus)
            }}
          >
            {statusOptions.map((status) => (
              <option value={status} key={status}>{status}</option>
            ))}
          </select>
        </label>
        <button className="secondary-action" type="button" onClick={() => loadModerationQueue()} disabled={moderationLoading}>
          <Archive size={18} />
          {moderationLoading ? 'Loading...' : 'Refresh queue'}
        </button>
      </div>
      {moderationItems.length > 0 ? (
        <div className="local-secret-list admin-secret-list">
          {moderationItems.map((secret) => (
            <article className="local-secret-card" key={secret.id}>
              <div>
                <span className="type-pill">{secret.type}</span>
                <span className={`content-status ${secret.status}`}>{secret.status}</span>
                <strong>{secret.title}</strong>
                <small>{secret.city ? `${secret.city}, ` : ''}{secret.country}{secret.submittedBy ? ` · ${secret.submittedBy}` : ''}</small>
                <p>{secret.tip}</p>
              </div>
              <div className="moderation-actions">
                {statusOptions
                  .filter((status) => status !== secret.status && status !== 'submitted')
                  .map((status) => (
                    <button className="secondary-action" type="button" key={status} onClick={() => moderateLocalSecret(secret.id, status)} disabled={moderationLoading}>
                      {status}
                    </button>
                  ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p>{moderationLoading ? 'Loading moderation queue...' : 'No local secrets in this queue.'}</p>
      )}
    </div>
  )
}

function LocalLocationForm({ countries, categories, statusOptions = contentStatusOptions, onSubmit, includeStatus = false, initialValues = null, isSubmitting = false, isUploadingMedia = false, remoteMode = false, isEditing = false, onImageUpload, uploadedImageUrl = '' }) {
  const imageValue = uploadedImageUrl || initialValues?.image || ''
  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <FormInput name="name" label="Name" defaultValue={initialValues?.name || ''} required />
      <FormSelect name="type" label="Type" options={categories} defaultValue={initialValues?.type || categories[0]} />
      <FormSelect name="country" label="Country" options={countries} defaultValue={initialValues?.country || countries[0]} />
      <FormInput name="city" label="City" defaultValue={initialValues?.city || ''} />
      <FormInput name="address" label="Address" defaultValue={initialValues?.address || ''} />
      <FormInput name="openingHours" label="Opening hours" defaultValue={initialValues?.openingHours || ''} />
      <FormInput name="contact" label="Contact" defaultValue={initialValues?.contact || ''} />
      <FormInput name="lat" label="Latitude" type="number" step="any" defaultValue={initialValues?.coordinates?.lat ?? ''} />
      <FormInput name="lng" label="Longitude" type="number" step="any" defaultValue={initialValues?.coordinates?.lng ?? ''} />
      <FormInput name="image" label="Image URL" defaultValue={imageValue} />
      <FormInput name="imageFile" label="Upload image" type="file" accept="image/*" onChange={onImageUpload} disabled={isUploadingMedia} />
      <AdminImagePreview image={imageValue} isUploading={isUploadingMedia} />
      <FormTextarea name="summary" label="Summary" defaultValue={initialValues?.summary || ''} />
      <FormTextarea name="history" label="Historical context" defaultValue={initialValues?.history || ''} />
      <FormInput name="tags" label="Tags, separated by commas" defaultValue={listToFormText(initialValues?.tags)} />
      {includeStatus && <FormSelect name="status" label="Status" options={statusOptions} defaultValue={statusOptions.includes(initialValues?.status) ? initialValues.status : 'draft'} />}
      <button className="primary-action" type="submit" disabled={isSubmitting || isUploadingMedia}>{isSubmitting ? 'Saving...' : remoteMode ? `${isEditing ? 'Update' : 'Save'} place` : 'Add place draft'}</button>
    </form>
  )
}

function LocalStoryForm({ countries, statusOptions = contentStatusOptions, onSubmit, includeStatus = false, initialValues = null, isSubmitting = false, isUploadingMedia = false, remoteMode = false, isEditing = false, onImageUpload, uploadedImageUrl = '' }) {
  const imageValue = uploadedImageUrl || initialValues?.image || ''
  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <FormInput name="title" label="Title" defaultValue={initialValues?.title || ''} required />
      <FormSelect name="country" label="Country" options={countries} defaultValue={initialValues?.country || countries[0]} />
      <FormSelect name="category" label="Category" options={['Civilization', 'Tradition', 'Historical Event']} defaultValue={initialValues?.category || 'Tradition'} />
      <FormInput name="readTime" label="Read time" placeholder="5 min read" defaultValue={initialValues?.readTime || ''} />
      <FormInput name="image" label="Image URL" defaultValue={imageValue} />
      <FormInput name="imageFile" label="Upload image" type="file" accept="image/*" onChange={onImageUpload} disabled={isUploadingMedia} />
      <AdminImagePreview image={imageValue} isUploading={isUploadingMedia} />
      <FormTextarea name="summary" label="Summary" defaultValue={initialValues?.summary || ''} />
      <FormTextarea name="body" label="Story body" defaultValue={storyBodyToFormText(initialValues?.body)} />
      <FormTextarea name="keyPoints" label="Key points, one per line" defaultValue={listToFormText(initialValues?.keyPoints, '\n')} />
      <FormTextarea name="timeline" label="Timeline, one entry per line" placeholder="15th century: What happened and why it matters" defaultValue={timelineToFormText(initialValues?.timeline)} />
      {includeStatus && <FormSelect name="status" label="Status" options={statusOptions} defaultValue={statusOptions.includes(initialValues?.status) ? initialValues.status : 'draft'} />}
      <button className="primary-action" type="submit" disabled={isSubmitting || isUploadingMedia}>{isSubmitting ? 'Saving...' : remoteMode ? `${isEditing ? 'Update' : 'Save'} story` : 'Add story draft'}</button>
    </form>
  )
}

function LocalArtifactForm({ countries, statusOptions = contentStatusOptions, onSubmit, includeStatus = false, initialValues = null, isSubmitting = false, isUploadingMedia = false, remoteMode = false, isEditing = false, onImageUpload, uploadedImageUrl = '' }) {
  const imageValue = uploadedImageUrl || initialValues?.image || ''
  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <FormInput name="name" label="Name" defaultValue={initialValues?.name || ''} required />
      <FormSelect name="country" label="Country" options={countries} defaultValue={initialValues?.country || countries[0]} />
      <FormInput name="origin" label="Origin" defaultValue={initialValues?.origin || ''} />
      <FormInput name="period" label="Period" defaultValue={initialValues?.period || ''} />
      <FormInput name="image" label="Image URL" defaultValue={imageValue} />
      <FormInput name="imageFile" label="Upload image" type="file" accept="image/*" onChange={onImageUpload} disabled={isUploadingMedia} />
      <AdminImagePreview image={imageValue} isUploading={isUploadingMedia} />
      <FormTextarea name="summary" label="Description" defaultValue={initialValues?.summary || ''} />
      <FormTextarea name="significance" label="Cultural significance" defaultValue={initialValues?.significance || ''} />
      <FormInput name="relatedLocationId" label="Related museum/site slug" defaultValue={initialValues?.relatedLocationId || ''} />
      <FormInput name="relatedStoryIds" label="Related story slugs, separated by commas" defaultValue={listToFormText(initialValues?.relatedStoryIds)} />
      {includeStatus && <FormSelect name="status" label="Status" options={statusOptions} defaultValue={statusOptions.includes(initialValues?.status) ? initialValues.status : 'draft'} />}
      <button className="primary-action" type="submit" disabled={isSubmitting || isUploadingMedia}>{isSubmitting ? 'Saving...' : remoteMode ? `${isEditing ? 'Update' : 'Save'} artifact` : 'Add artifact draft'}</button>
    </form>
  )
}

function AdminImagePreview({ image, isUploading }) {
  if (!image && !isUploading) return null
  return (
    <div className="admin-image-preview">
      {image && <img src={image} alt="" />}
      <span>{isUploading ? 'Uploading image...' : 'Current image'}</span>
    </div>
  )
}

function FormInput({ label, ...props }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input {...props} />
    </label>
  )
}

function FormTextarea({ label, ...props }) {
  return (
    <label className="form-field wide-field">
      <span>{label}</span>
      <textarea {...props} />
    </label>
  )
}

function FormSelect({ label, name, options, ...props }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <select name={name} {...props}>
        {options.map((option) => (
          <option value={option} key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

function ImageGallery({ images, title }) {
  if (!images.length) return null

  return (
    <section className="content-section">
      <h2>{title}</h2>
      <div className="image-gallery">
        {images.map((image) => (
          <img src={image} alt="" key={image} />
        ))}
      </div>
    </section>
  )
}

function MiniMap({ location }) {
  return (
    <section className="content-section">
      <h2>Map preview</h2>
      <div className="mini-map-panel">
        <MapPinned size={28} />
        <div>
          <strong>{location.city}, {location.country}</strong>
          <span>{location.coordinates.lat.toFixed(3)}, {location.coordinates.lng.toFixed(3)}</span>
        </div>
      </div>
    </section>
  )
}

function StoryLearningPanel({ story, relatedLocations, relatedArtifacts }) {
  return (
    <section className="learning-panel">
      <article>
        <BookOpen size={20} />
        <span>Learning focus</span>
        <strong>{story.category}</strong>
      </article>
      <article>
        <Landmark size={20} />
        <span>Related places</span>
        <strong>{relatedLocations.length}</strong>
      </article>
      <article>
        <Archive size={20} />
        <span>Related objects</span>
        <strong>{relatedArtifacts.length}</strong>
      </article>
      <article>
        <Clock size={20} />
        <span>Reading time</span>
        <strong>{story.readTime}</strong>
      </article>
    </section>
  )
}

function CategoryTile({ icon: Icon, title, text, onClick }) {
  return (
    <button className="category-tile" type="button" onClick={onClick}>
      <Icon size={22} />
      <strong>{title}</strong>
      <span>{text}</span>
    </button>
  )
}

function CountryCard({ country, locations, stories, onClick }) {
  const stats = getCountryStats(country, locations, stories)

  return (
    <button className="country-card" type="button" onClick={onClick}>
      {stats.image && <img src={stats.image} alt="" />}
      <span>{stats.locations} places · {stats.stories} stories</span>
      <strong>{country}</strong>
      <p>{countryProfiles[country] ?? 'Country content is being expanded by the editorial team.'}</p>
    </button>
  )
}

function RouteCard({ route, stories, onClick }) {
  const story = getStoryById(route.id, stories)

  return (
    <button className="route-card" type="button" onClick={onClick}>
      <img src={story?.image} alt="" />
      <div>
        <span>{route.region}</span>
        <strong>{route.title}</strong>
        <p>{route.description}</p>
      </div>
    </button>
  )
}

function MuseumLabel({ title, items }) {
  return (
    <section className="museum-label">
      <div>
        <Archive size={20} />
        <h2>{title}</h2>
      </div>
      <dl>
        {items.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function LocationCard({ location, openScreen, isFavorite, toggleFavorite, compact = false }) {
  return (
    <article className={compact ? 'place-card compact' : 'place-card'}>
      <button className="card-main" type="button" onClick={() => openScreen('locationDetail', location)}>
        <img src={location.image} alt="" />
        <span className="type-pill">{location.type}</span>
        <SourceBadge count={location.sources?.length || 0} />
        <div>
          <h3>{location.name}</h3>
          <p>{location.summary}</p>
          <small>
            <MapPin size={14} /> {location.city}, {location.country}{location.distanceKm != null ? ` · ${formatDistance(location.distanceKm)}` : ''}
          </small>
        </div>
      </button>
      {toggleFavorite && (
        <button className="save-button" type="button" aria-label="Save location" onClick={toggleFavorite}>
          <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      )}
    </article>
  )
}

function StoryCard({ story, openScreen, isFavorite, toggleFavorite }) {
  return (
    <article className="story-card">
      <button className="card-main" type="button" onClick={() => openScreen('storyDetail', story)}>
        <img src={story.image} alt="" />
        <div>
          <span className="type-pill">{story.category}</span>
          <SourceBadge count={story.sources?.length || 0} />
          <h3>{story.title}</h3>
          <p>{story.summary}</p>
          <small>
            <Clock size={14} /> {story.readTime}
          </small>
        </div>
      </button>
      <button className="save-button" type="button" aria-label="Save story" onClick={toggleFavorite}>
        <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
      </button>
    </article>
  )
}

function StoryRow({ story, openScreen }) {
  return (
    <button className="story-row" type="button" onClick={() => openScreen('storyDetail', story)}>
      <img src={story.image} alt="" />
      <span>
        <strong>{story.title}</strong>
        <small>{story.category} · {story.readTime}</small>
      </span>
    </button>
  )
}

function ArtifactCard({ artifact, openScreen, isFavorite, toggleFavorite, compact = false }) {
  return (
    <article className={compact ? 'artifact-card compact' : 'artifact-card'}>
      <button type="button" onClick={() => openScreen('artifactDetail', artifact)}>
        <img src={artifact.image} alt="" />
        <span>{artifact.period}</span>
        <SourceBadge count={artifact.sources?.length || 0} />
        <h3>{artifact.name}</h3>
        <p>{artifact.origin}</p>
      </button>
      {toggleFavorite && (
        <button className="save-button" type="button" aria-label="Save artifact" onClick={toggleFavorite}>
          <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      )}
    </article>
  )
}

function SourceBadge({ count }) {
  if (!count) return null
  return (
    <span className="source-badge">
      <BookOpen size={13} />
      {count} source{count === 1 ? '' : 's'}
    </span>
  )
}

function DetailShell({ image, badge, title, goBack, children }) {
  return (
    <section className="detail-screen">
      <div className="detail-hero">
        <img src={image} alt="" />
        <button className="back-button" type="button" onClick={goBack} aria-label="Go back">
          <ArrowLeft size={20} />
        </button>
      </div>
      <div className="detail-body">
        <span className="eyebrow">{badge}</span>
        <h1>{title}</h1>
        {children}
      </div>
    </section>
  )
}

function PageIntro({ eyebrow, title, text }) {
  return (
    <header className="page-intro">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{text}</p>
    </header>
  )
}

function SectionTitle({ title, action, onAction }) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      <button type="button" onClick={onAction}>{action}</button>
    </div>
  )
}

function SelectFilter({ label, value, options, onChange }) {
  return (
    <label className="select-filter">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option value={option} key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

function InfoGrid({ items }) {
  return (
    <div className="info-grid">
      {items.map((item) => (
        <div key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  )
}

function ContentSection({ title, text }) {
  const paragraphs = Array.isArray(text) ? text : [text]

  return (
    <section className="content-section">
      <h2>{title}</h2>
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </section>
  )
}

function SourcesPanel({ sources = [] }) {
  if (!sources?.length) return null

  return (
    <section className="content-section sources-section">
      <h2>Sources</h2>
      <div className="public-source-list">
        {sources.map((source) => (
          <article className="public-source-card" key={source.id || `${source.title}-${source.url}`}>
            <div>
              <strong>{source.title}</strong>
              {source.note && <p>{source.note}</p>}
            </div>
            {source.url && (
              <a className="secondary-action" href={source.url} target="_blank" rel="noreferrer">
                Open source
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

function RelatedSection({ title, children }) {
  return (
    <section className="content-section related-section">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function TagList({ tags }) {
  return (
    <div className="tag-list">
      {tags.map((tag) => (
        <span key={tag}>{tag}</span>
      ))}
    </div>
  )
}

function EmptyState({ title, text }) {
  return (
    <div className="empty-state">
      <Heart size={24} />
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

export default App
