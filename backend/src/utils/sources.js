const { prisma } = require('../config/db')

async function loadSourcesFor(itemType, itemIds) {
  const uniqueIds = [...new Set(itemIds.filter(Boolean))]
  if (!uniqueIds.length) return new Map()

  const rows = await prisma.contentSource.findMany({
    where: { itemType, itemId: { in: uniqueIds } },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  })

  return rows.reduce((map, source) => {
    const current = map.get(source.itemId) || []
    current.push(source)
    map.set(source.itemId, current)
    return map
  }, new Map())
}

function attachSources(row, sourceMap) {
  return { ...row, sources: sourceMap.get(row.slug) || [] }
}

module.exports = { loadSourcesFor, attachSources }
