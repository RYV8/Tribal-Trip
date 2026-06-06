const { prisma } = require('../src/config/db')
const { slugify } = require('../src/utils/slug')

const countryCodes = {
  Benin: 'BJ',
  Nigeria: 'NG',
  "Cote d'Ivoire": 'CI',
  Togo: 'TG',
  Ghana: 'GH',
  Kenya: 'KE',
  Niger: 'NE',
  'Burkina Faso': 'BF',
  Congo: 'CG',
  Guinea: 'GN',
}

const countryRegions = {
  Benin: 'West Africa',
  Nigeria: 'West Africa',
  "Cote d'Ivoire": 'West Africa',
  Togo: 'West Africa',
  Ghana: 'West Africa',
  Kenya: 'East Africa',
  Niger: 'West Africa',
  'Burkina Faso': 'West Africa',
  Congo: 'Central Africa',
  Guinea: 'West Africa',
}

function contentStatus(status) {
  if (status === 'verified') return 'published'
  if (status === 'review') return 'review'
  if (status === 'archived') return 'archived'
  return 'draft'
}

function json(value) {
  return JSON.stringify(value || [])
}

async function seedSources(itemType, itemId, sources) {
  if (sources === undefined) return
  await prisma.contentSource.deleteMany({ where: { itemType, itemId } })

  for (const source of sources || []) {
    if (!source?.title) continue
    await prisma.contentSource.create({
      data: {
        itemType,
        itemId,
        title: source.title,
        url: source.url || null,
        note: source.note || null,
      },
    })
  }
}

async function upsertCountry(country, guide) {
  const slug = slugify(country)
  return prisma.country.upsert({
    where: { slug },
    update: {
      name: country,
      code: countryCodes[country] || null,
      region: countryRegions[country] || null,
      description: guide?.overview || null,
      isAvailable: guide?.available === false ? false : true,
      mapLat: guide?.mapPoint?.lat || null,
      mapLng: guide?.mapPoint?.lng || null,
    },
    create: {
      name: country,
      slug,
      code: countryCodes[country] || null,
      region: countryRegions[country] || null,
      description: guide?.overview || null,
      isAvailable: guide?.available === false ? false : true,
      mapLat: guide?.mapPoint?.lat || null,
      mapLng: guide?.mapPoint?.lng || null,
    },
  })
}

async function upsertCategory(name) {
  const slug = slugify(name)
  return prisma.category.upsert({
    where: { slug },
    update: { name, icon: name.toLowerCase().replace(/\s+/g, '-') },
    create: { name, slug, icon: name.toLowerCase().replace(/\s+/g, '-') },
  })
}

async function seedLocations(locations) {
  for (const location of locations) {
    const country = await prisma.country.findFirst({ where: { name: location.country } })
    if (!country) continue
    const category = location.type ? await upsertCategory(location.type) : null
    const slug = location.id || slugify(location.name)

    await prisma.location.upsert({
      where: { slug },
      update: {
        countryId: country.id,
        categoryId: category?.id || null,
        name: location.name,
        type: location.type,
        city: location.city || null,
        summary: location.summary || null,
        history: location.history || null,
        address: location.address || null,
        openingHours: location.openingHours || null,
        contact: location.contact || null,
        latitude: location.coordinates?.lat || null,
        longitude: location.coordinates?.lng || null,
        imageUrl: location.image || null,
        tags: json(location.tags),
        relatedStorySlugs: json(location.relatedStoryIds),
        relatedArtifactSlugs: json(location.relatedArtifactIds),
        status: 'published',
      },
      create: {
        countryId: country.id,
        categoryId: category?.id || null,
        name: location.name,
        slug,
        type: location.type,
        city: location.city || null,
        summary: location.summary || null,
        history: location.history || null,
        address: location.address || null,
        openingHours: location.openingHours || null,
        contact: location.contact || null,
        latitude: location.coordinates?.lat || null,
        longitude: location.coordinates?.lng || null,
        imageUrl: location.image || null,
        tags: json(location.tags),
        relatedStorySlugs: json(location.relatedStoryIds),
        relatedArtifactSlugs: json(location.relatedArtifactIds),
        status: 'published',
      },
    })

    await seedSources('location', slug, location.sources)
  }
}

async function seedStories(stories) {
  for (const story of stories) {
    const primaryCountry = story.country?.split(' · ')[0]
    const country = primaryCountry ? await prisma.country.findFirst({ where: { name: primaryCountry } }) : null
    const slug = story.id || slugify(story.title)

    const saved = await prisma.story.upsert({
      where: { slug },
      update: {
        countryId: country?.id || null,
        title: story.title,
        category: story.category || null,
        summary: story.summary || null,
        body: json(Array.isArray(story.body) ? story.body : [story.body].filter(Boolean)),
        readTime: story.readTime || null,
        imageUrl: story.image || null,
        relatedLocationSlugs: json(story.relatedLocationIds),
        relatedArtifactSlugs: json(story.relatedArtifactIds),
        status: 'published',
      },
      create: {
        countryId: country?.id || null,
        title: story.title,
        slug,
        category: story.category || null,
        summary: story.summary || null,
        body: json(Array.isArray(story.body) ? story.body : [story.body].filter(Boolean)),
        readTime: story.readTime || null,
        imageUrl: story.image || null,
        relatedLocationSlugs: json(story.relatedLocationIds),
        relatedArtifactSlugs: json(story.relatedArtifactIds),
        status: 'published',
      },
    })

    await prisma.storyKeyPoint.deleteMany({ where: { storyId: saved.id } })
    await prisma.storyTimeline.deleteMany({ where: { storyId: saved.id } })

    for (let index = 0; index < (story.keyPoints || []).length; index += 1) {
      await prisma.storyKeyPoint.create({ data: { storyId: saved.id, point: story.keyPoints[index], sortOrder: index } })
    }
    for (let index = 0; index < (story.timeline || []).length; index += 1) {
      const item = story.timeline[index]
      await prisma.storyTimeline.create({ data: { storyId: saved.id, period: item.period, text: item.text, sortOrder: index } })
    }

    await seedSources('story', slug, story.sources)
  }
}

async function seedArtifacts(artifacts) {
  for (const artifact of artifacts) {
    const country = artifact.country ? await prisma.country.findFirst({ where: { name: artifact.country } }) : null
    const slug = artifact.id || slugify(artifact.name)

    await prisma.artifact.upsert({
      where: { slug },
      update: {
        countryId: country?.id || null,
        name: artifact.name,
        origin: artifact.origin || null,
        period: artifact.period || null,
        summary: artifact.summary || null,
        significance: artifact.significance || null,
        imageUrl: artifact.image || null,
        relatedLocationSlug: artifact.relatedLocationId || null,
        relatedStorySlugs: json(artifact.relatedStoryIds),
        status: 'published',
      },
      create: {
        countryId: country?.id || null,
        name: artifact.name,
        slug,
        origin: artifact.origin || null,
        period: artifact.period || null,
        summary: artifact.summary || null,
        significance: artifact.significance || null,
        imageUrl: artifact.image || null,
        relatedLocationSlug: artifact.relatedLocationId || null,
        relatedStorySlugs: json(artifact.relatedStoryIds),
        status: 'published',
      },
    })

    await seedSources('artifact', slug, artifact.sources)
  }
}

async function seedCultureGuide(guide) {
  const country = await prisma.country.findFirst({ where: { name: guide.country } })
  if (!country) return

  const saved = await prisma.cultureGuide.upsert({
    where: { countryId: country.id },
    update: { languages: json(guide.languages), overview: guide.overview || null, status: 'published' },
    create: { countryId: country.id, languages: json(guide.languages), overview: guide.overview || null, status: 'published' },
  })

  await prisma.guidePhrase.deleteMany({ where: { guideId: saved.id } })
  await prisma.guideNote.deleteMany({ where: { guideId: saved.id } })
  await prisma.food.deleteMany({ where: { guideId: saved.id } })
  await prisma.foodSpot.deleteMany({ where: { guideId: saved.id } })
  await prisma.cultureStyle.deleteMany({ where: { guideId: saved.id } })

  for (let index = 0; index < (guide.phrases || []).length; index += 1) {
    const phrase = guide.phrases[index]
    await prisma.guidePhrase.create({
      data: {
        guideId: saved.id,
        language: phrase.language,
        english: phrase.english,
        localText: phrase.local,
        pronunciation: phrase.pronunciation || null,
        context: phrase.context || null,
        status: contentStatus(phrase.status),
        sortOrder: index,
      },
    })
  }

  for (const noteType of ['greetings', 'etiquette', 'taboos']) {
    const dbType = noteType === 'taboos' ? 'taboo' : noteType === 'greetings' ? 'greeting' : 'etiquette'
    const items = guide[noteType] || []
    for (let index = 0; index < items.length; index += 1) {
      await prisma.guideNote.create({ data: { guideId: saved.id, noteType: dbType, text: items[index], sortOrder: index } })
    }
  }

  for (let index = 0; index < (guide.foods || []).length; index += 1) {
    const food = guide.foods[index]
    await prisma.food.create({
      data: {
        guideId: saved.id,
        name: food.name,
        description: food.description || null,
        commonIn: json(food.commonIn),
        status: contentStatus(food.status),
        sortOrder: index,
      },
    })
  }

  for (let index = 0; index < (guide.foodSpots || []).length; index += 1) {
    const spot = guide.foodSpots[index]
    await prisma.foodSpot.create({
      data: {
        guideId: saved.id,
        name: spot.name,
        city: spot.city || null,
        specialty: spot.specialty || null,
        priceLevel: spot.priceLevel || null,
        latitude: spot.coordinates?.lat || null,
        longitude: spot.coordinates?.lng || null,
        status: 'draft',
        sortOrder: index,
      },
    })
  }

  for (const [styleType, key] of [['music', 'musicStyles'], ['clothing', 'clothingStyles']]) {
    const items = guide[key] || []
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index]
      await prisma.cultureStyle.create({
        data: {
          guideId: saved.id,
          styleType,
          name: item.name,
          description: item.description || null,
          context: item.context || null,
          status: contentStatus(item.status),
          sortOrder: index,
        },
      })
    }
  }
}

async function main() {
  const content = await import('../../src/data/content.js')
  const guideData = await import('../../src/data/cultureGuides.js')

  for (const category of content.categories) await upsertCategory(category)
  for (const country of content.countries) {
    const guide = guideData.cultureGuides.find((item) => item.country === country)
    await upsertCountry(country, guide)
  }
  await seedLocations(content.locations)
  await seedStories(content.stories)
  await seedArtifacts(content.artifacts)
  for (const guide of guideData.cultureGuides) await seedCultureGuide(guide)

  console.log('Seed completed from frontend data')
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
