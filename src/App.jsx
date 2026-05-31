import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Archive,
  BookOpen,
  Building2,
  Clock,
  Compass,
  Heart,
  Home,
  Landmark,
  MapPin,
  Route,
  Search,
  Sparkles,
  User,
} from 'lucide-react'
import './App.css'
import { artifacts, categories, countries, locations, stories } from './data/content'

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'discover', label: 'Discover', icon: Compass },
  { id: 'stories', label: 'Stories', icon: BookOpen },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'saved', label: 'Saved', icon: Heart },
]

const desktopNavItems = [
  { id: 'home', label: 'Home' },
  { id: 'discover', label: 'Discover' },
  { id: 'stories', label: 'Stories' },
  { id: 'artifacts', label: 'Explore' },
  { id: 'search', label: 'Search' },
  { id: 'saved', label: 'Saved' },
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
  Guinee: 'Fouta Djallon highlands, Baga masks, national collections, and landscape memory.',
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

const favoriteKey = 'tribal-tripe-favorites'

const emptyFilters = {
  country: 'All',
  category: 'All',
  theme: 'All',
}

const getStoryById = (id) => stories.find((story) => story.id === id)

function locationMatchesTheme(location, theme) {
  if (!theme || theme === 'All') return true
  const relatedStoryText = (location.relatedStoryIds ?? [])
    .map((id) => getStoryById(id))
    .filter(Boolean)
    .map((story) => [story.title, story.summary, story.country, story.category, story.keyPoints?.join(' ')].join(' '))
    .join(' ')
  const haystack = [location.name, location.type, location.country, location.city, location.summary, location.history, location.tags?.join(' '), relatedStoryText]
    .join(' ')
    .toLowerCase()

  return themeKeywords[theme]?.some((keyword) => haystack.includes(keyword.toLowerCase())) ?? true
}

function getCountryStats(country) {
  const countryLocations = locations.filter((location) => location.country === country)
  const countryStories = stories.filter((story) => story.country.includes(country))
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

function getStoredFavorites() {
  try {
    return JSON.parse(localStorage.getItem(favoriteKey)) ?? []
  } catch {
    return []
  }
}

function App() {
  const [screen, setScreen] = useState('home')
  const [selected, setSelected] = useState(null)
  const [filters, setFilters] = useState(emptyFilters)
  const [query, setQuery] = useState('')
  const [favorites, setFavorites] = useState(getStoredFavorites)

  useEffect(() => {
    localStorage.setItem(favoriteKey, JSON.stringify(favorites))
  }, [favorites])

  const favoriteIds = useMemo(() => new Set(favorites.map((item) => item.id)), [favorites])

  const openScreen = (nextScreen, item = null) => {
    setSelected(item)
    setScreen(nextScreen)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleFavorite = (item, type) => {
    const favorite = {
      id: item.id,
      type,
      title: item.name ?? item.title,
      subtitle: item.city ? `${item.city}, ${item.country}` : item.country,
      image: item.image,
    }

    setFavorites((current) =>
      current.some((saved) => saved.id === item.id)
        ? current.filter((saved) => saved.id !== item.id)
        : [favorite, ...current],
    )
  }

  const goBack = () => {
    if (screen === 'locationDetail') openScreen('discover')
    else if (screen === 'storyDetail') openScreen('stories')
    else if (screen === 'artifactDetail') openScreen('artifacts')
    else openScreen('home')
  }

  const activeScreen = parentScreen[screen] ?? screen

  const renderScreen = () => {
    if (screen === 'discover') {
      return (
        <DiscoverScreen
          filters={filters}
          setFilters={setFilters}
          openScreen={openScreen}
          favoriteIds={favoriteIds}
          toggleFavorite={toggleFavorite}
        />
      )
    }

    if (screen === 'locationDetail' && selected) {
      return (
        <LocationDetail
          location={selected}
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
          query={query}
          setQuery={setQuery}
          openScreen={openScreen}
          favoriteIds={favoriteIds}
          toggleFavorite={toggleFavorite}
        />
      )
    }

    if (screen === 'saved') {
      return <SavedScreen favorites={favorites} openScreen={openSavedItem} clearSaved={() => setFavorites([])} />
    }

    if (screen === 'profile') {
      return <ProfileScreen openScreen={openScreen} />
    }

    return <HomeScreen openScreen={openScreen} setFilters={setFilters} setQuery={setQuery} />
  }

  const openSavedItem = (favorite) => {
    const collection = {
      location: locations,
      story: stories,
      artifact: artifacts,
    }[favorite.type]
    const item = collection?.find((entry) => entry.id === favorite.id)

    if (!item) return

    openScreen(`${favorite.type}Detail`, item)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" type="button" onClick={() => openScreen('home')}>
          <span className="brand-mark">TT</span>
          <span>
            <strong>Tribal Tripe</strong>
            <small>Modern African Heritage</small>
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
        <button className="profile-button" type="button" aria-label="Open profile" onClick={() => openScreen('profile')}>
          <User size={18} />
          <span>Profile</span>
        </button>
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

function HomeScreen({ openScreen, setFilters, setQuery }) {
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
    setFilters({ country, category: 'All', theme: 'All' })
    openScreen('discover')
  }

  const openRoute = (storyId) => {
    const story = getStoryById(storyId)
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
          <span className="eyebrow">{countries.length} countries MVP</span>
          <h1>Discover Africa's Cultural Heritage</h1>
          <p>
            Explore museums, heritage sites, cultural routes, and artifacts through a digital museum built for learning.
          </p>
          <form className="search-form" onSubmit={submitSearch}>
            <Search size={18} />
            <input name="home-search" placeholder="Search museums, stories, artifacts" />
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
            Tribal Tripe treats heritage as knowledge: every route connects a place, a story, and an object so users can learn before they visit.
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
            <CountryCard key={country} country={country} onClick={() => quickSearch(country)} />
          ))}
        </div>
      </section>

      <section className="section-block">
        <SectionTitle title="Curated cultural routes" action="Read stories" onAction={() => openScreen('stories')} />
        <div className="route-grid">
          {culturalRoutes.map((route) => (
            <RouteCard key={route.id} route={route} onClick={() => openRoute(route.id)} />
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

function DiscoverScreen({ filters, setFilters, openScreen, favoriteIds, toggleFavorite }) {
  const filteredLocations = locations.filter((location) => {
    const countryMatch = filters.country === 'All' || location.country === filters.country
    const categoryMatch = filters.category === 'All' || location.type === filters.category
    const themeMatch = locationMatchesTheme(location, filters.theme)
    return countryMatch && categoryMatch && themeMatch
  })

  return (
    <section className="screen">
      <PageIntro
        eyebrow="Discover"
        title="Museums, heritage sites, and cultural centers"
        text={`Filter the first MVP catalogue across ${countries.length} African countries by country and cultural category.`}
      />
      <div className="filter-panel">
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
    </section>
  )
}

function LocationDetail({ location, goBack, openScreen, isFavorite, toggleFavorite }) {
  const relatedStories = stories.filter((story) => location.relatedStoryIds.includes(story.id))
  const relatedArtifacts = artifacts.filter((artifact) => location.relatedArtifactIds.includes(artifact.id))
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${location.coordinates.lat},${location.coordinates.lng}`

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
        ]}
      />

      <ContentSection title="Overview" text={location.summary} />
      <ContentSection title="Historical context" text={location.history} />
      <MuseumLabel
        title="Visit lens"
        items={[
          { label: 'Look for', value: location.tags.join(', ') },
          { label: 'Learning focus', value: relatedStories[0]?.summary ?? location.summary },
          { label: 'Museum note', value: 'Use this place as a starting point, then follow the related story and artifact links for context.' },
        ]}
      />
      <TagList tags={location.tags} />

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

function StoriesScreen({ openScreen, favoriteIds, toggleFavorite }) {
  return (
    <section className="screen">
      <PageIntro
        eyebrow="Stories"
        title="Learn through places, timelines, and objects"
        text="Short editorial stories give the MVP a cultural learning layer beyond a directory."
      />
      <div className="card-list">
        {stories.map((story) => (
          <StoryCard
            key={story.id}
            story={story}
            openScreen={openScreen}
            isFavorite={favoriteIds.has(story.id)}
            toggleFavorite={() => toggleFavorite(story, 'story')}
          />
        ))}
      </div>
    </section>
  )
}

function StoryDetail({ story, goBack, openScreen, isFavorite, toggleFavorite }) {
  const relatedLocations = locations.filter((location) => story.relatedLocationIds.includes(location.id))
  const relatedArtifacts = artifacts.filter((artifact) => story.relatedArtifactIds.includes(artifact.id))

  return (
    <DetailShell image={story.image} goBack={goBack} badge={story.category} title={story.title}>
      <div className="detail-actions">
        <button className={isFavorite ? 'primary-action saved' : 'primary-action'} type="button" onClick={toggleFavorite}>
          <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          {isFavorite ? 'Saved' : 'Save story'}
        </button>
      </div>
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

function ArtifactsScreen({ openScreen, favoriteIds, toggleFavorite }) {
  return (
    <section className="screen">
      <PageIntro
        eyebrow="Explore"
        title="Artifact gallery"
        text="A starter catalogue that links objects back to stories, museums, and heritage places."
      />
      <div className="artifact-grid">
        {artifacts.map((artifact) => (
          <ArtifactCard
            key={artifact.id}
            artifact={artifact}
            openScreen={openScreen}
            isFavorite={favoriteIds.has(artifact.id)}
            toggleFavorite={() => toggleFavorite(artifact, 'artifact')}
          />
        ))}
      </div>
    </section>
  )
}

function ArtifactDetail({ artifact, goBack, openScreen, isFavorite, toggleFavorite }) {
  const relatedLocation = locations.find((location) => location.id === artifact.relatedLocationId)
  const relatedStories = stories.filter((story) => artifact.relatedStoryIds.includes(story.id))

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
        ]}
      />
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

function SearchScreen({ query, setQuery, openScreen, favoriteIds, toggleFavorite }) {
  const normalized = query.trim().toLowerCase()
  const searchable = useMemo(
    () => [
      ...locations.map((item) => ({ ...item, kind: 'location', title: item.name, subtitle: `${item.type} in ${item.city}` })),
      ...stories.map((item) => ({ ...item, kind: 'story', subtitle: item.category })),
      ...artifacts.map((item) => ({ ...item, kind: 'artifact', title: item.name, subtitle: item.origin })),
    ],
    [],
  )

  const results = normalized
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
    : searchable.slice(0, 8)

  return (
    <section className="screen">
      <PageIntro
        eyebrow="Search"
        title="Search the whole MVP catalogue"
        text="Find museums, stories, sites, and artifacts from one place."
      />
      <label className="global-search">
        <Search size={19} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try Ghana, Lamu, Agadez, bronze" autoFocus />
      </label>
      <div className="result-count">{results.length} results</div>
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
    </section>
  )
}

function SavedScreen({ favorites, openScreen, clearSaved }) {
  return (
    <section className="screen">
      <PageIntro
        eyebrow="Saved"
        title="Your local cultural shortlist"
        text="Favorites stay on this device for the MVP. No account is required yet."
      />
      {favorites.length > 0 ? (
        <>
          <button className="text-action" type="button" onClick={clearSaved}>
            Clear saved items
          </button>
          <div className="search-results">
            {favorites.map((favorite) => (
              <article className="search-result" key={favorite.id}>
                <img src={favorite.image} alt="" />
                <button type="button" onClick={() => openScreen(favorite)}>
                  <span>{favorite.type}</span>
                  <strong>{favorite.title}</strong>
                  <small>{favorite.subtitle}</small>
                </button>
              </article>
            ))}
          </div>
        </>
      ) : (
        <EmptyState title="No saved items yet" text="Save a museum, story, or artifact to build your visit shortlist." />
      )}
    </section>
  )
}

function ProfileScreen({ openScreen }) {
  return (
    <section className="screen">
      <PageIntro
        eyebrow="Profile"
        title="Guest mode for the MVP"
        text="The first version keeps discovery open. Accounts can come later when backend and content administration are ready."
      />
      <div className="profile-panel">
        <div className="profile-avatar">TT</div>
        <div>
          <h2>Guest explorer</h2>
          <p>Local favorites enabled. {countries.length}-country catalogue active.</p>
        </div>
      </div>
      <div className="metric-grid">
        <Metric label="Launch countries" value={countries.length} />
        <Metric label="Locations" value={locations.length} />
        <Metric label="Stories" value={stories.length} />
        <Metric label="Artifacts" value={artifacts.length} />
      </div>
      <button className="primary-action wide" type="button" onClick={() => openScreen('discover')}>
        <Compass size={18} />
        Continue discovery
      </button>
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

function CountryCard({ country, onClick }) {
  const stats = getCountryStats(country)

  return (
    <button className="country-card" type="button" onClick={onClick}>
      {stats.image && <img src={stats.image} alt="" />}
      <span>{stats.locations} places · {stats.stories} stories</span>
      <strong>{country}</strong>
      <p>{countryProfiles[country]}</p>
    </button>
  )
}

function RouteCard({ route, onClick }) {
  const story = getStoryById(route.id)

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
        <div>
          <h3>{location.name}</h3>
          <p>{location.summary}</p>
          <small>
            <MapPin size={14} /> {location.city}, {location.country}
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
