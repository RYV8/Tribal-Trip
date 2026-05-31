const image = {
  abomey:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Abomey_2006_1.jpg/1280px-Abomey_2006_1.jpg',
  ouidahMuseum:
    'https://upload.wikimedia.org/wikipedia/commons/a/ae/Musee_d%27Histoire_in_Ouidah_2015.jpg',
  doorOfNoReturn:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Door_of_no_return.jpg/1280px-Door_of_no_return.jpg',
  villaAjavon:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Les_lieux_touristiques_de_Ouidah%2C_Villa_Ajavon.jpg/1280px-Les_lieux_touristiques_de_Ouidah%2C_Villa_Ajavon.jpg',
  ganvie:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Ganvi%C3%A9_fishing_village_on_stilts_in_Benin_%2810282059623%29_%282%29.jpg/1280px-Ganvi%C3%A9_fishing_village_on_stilts_in_Benin_%2810282059623%29_%282%29.jpg',
  portoNovo:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Gate_of_Porto_Novo_ethnographic_museum_Benin_Dec_2017.jpg/1280px-Gate_of_Porto_Novo_ethnographic_museum_Benin_Dec_2017.jpg',
  lagosMuseum:
    'https://upload.wikimedia.org/wikipedia/commons/0/0f/Garden_in_front_of_museum_%286349971557%29.jpg',
  nikeGallery:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Outside_Nike_Art_Gallery_%284202980259%29.jpg/1280px-Outside_Nike_Art_Gallery_%284202980259%29.jpg',
  beninCity:
    'https://upload.wikimedia.org/wikipedia/commons/e/ea/Ancestral_shrine_Royal_Palace%2C_Benin_City%2C_1891_%28cropped%29.jpg',
  osunGrove:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/First_palace_of_the_king_osogbo_at_the_osun-osogbo_sacred_grove.jpg/1280px-First_palace_of_the_king_osogbo_at_the_osun-osogbo_sacred_grove.jpg',
  badagry:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Badagry_Heritage_Museum_2012_01.jpg/1280px-Badagry_Heritage_Museum_2012_01.jpg',
  beninBronze:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Single-figure_plaque%2C_Benin_Kingdom_court_style%2C_Edo_peoples%2C_Benin_City%2C_Nigeria%2C_mid_16th_to_17th_century%2C_cast_copper_alloy_-_Dallas_Museum_of_Art_-_DSC04934.jpg/1280px-thumbnail.jpg',
  nok:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Nigeria%2C_regione_nok%2C_testa_in_terracotta%2C_600_ac-250_dc_ca.jpg/1280px-Nigeria%2C_regione_nok%2C_testa_in_terracotta%2C_600_ac-250_dc_ca.jpg',
  gelede:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/British_Museum_Room_25_Gelede_mask_Yoruba_people_17022019_5003.jpg/1280px-British_Museum_Room_25_Gelede_mask_Yoruba_people_17022019_5003.jpg',
  ifeHead:
    'https://upload.wikimedia.org/wikipedia/commons/9/9a/Arte_yoruba%2C_nigeria%2C_testa_da_ife%2C_12-15mo_secolo.JPG',
  dahomeyBanner:
    'https://upload.wikimedia.org/wikipedia/commons/a/ac/King_Adandozan_banner_of_war.jpg',
  yorubaCrown:
    'https://upload.wikimedia.org/wikipedia/commons/a/a1/WLA_brooklynmuseum_Yoruba_Beaded_Crown_Ade_2.jpg',
  ivoryMask:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Queen_Mother_Pendant_Mask-_Iyoba_MET_DP231460.jpg/1280px-Queen_Mother_Pendant_Mask-_Iyoba_MET_DP231460.jpg',
}

export const locations = [
  {
    id: 'royal-palaces-abomey',
    name: 'Royal Palaces of Abomey',
    type: 'Heritage Site',
    country: 'Benin',
    city: 'Abomey',
    image: image.abomey,
    summary:
      'A UNESCO-listed royal complex connected to the political and spiritual history of the Dahomey Kingdom.',
    history:
      'The Royal Palaces of Abomey formed the ceremonial and administrative heart of the Dahomey Kingdom from the seventeenth to nineteenth centuries. The site helps visitors understand royal power, military organization, court art, and living memory in southern Benin.',
    openingHours: 'Tue - Sun, 9:00 AM - 5:00 PM',
    address: 'Abomey, Zou Department, Benin',
    coordinates: { lat: 7.1853, lng: 1.9912 },
    tags: ['UNESCO', 'Dahomey', 'Royal Heritage'],
    relatedStoryIds: ['dahomey-kingdom'],
    relatedArtifactIds: ['dahomey-royal-banner'],
  },
  {
    id: 'ouidah-history-museum',
    name: 'Ouidah Museum of History',
    type: 'Museum',
    country: 'Benin',
    city: 'Ouidah',
    image: image.ouidahMuseum,
    summary:
      'A compact museum inside the former Portuguese fort, focused on Ouidah, trade, kingdoms, and memory.',
    history:
      'The museum presents Ouidah as a port city shaped by local kingdoms, Atlantic trade, Vodun traditions, and the memory of forced migration. It is a useful starting point before visiting nearby memorial sites.',
    openingHours: 'Mon - Sat, 9:00 AM - 6:00 PM',
    address: 'Ouidah, Atlantique Department, Benin',
    coordinates: { lat: 6.3626, lng: 2.0853 },
    tags: ['Museum', 'Ouidah', 'Memory'],
    relatedStoryIds: ['ouidah-badagry-memory'],
    relatedArtifactIds: ['gelede-mask'],
  },
  {
    id: 'door-of-no-return-ouidah',
    name: 'Door of No Return',
    type: 'Heritage Site',
    country: 'Benin',
    city: 'Ouidah',
    image: image.doorOfNoReturn,
    summary:
      'A memorial on the Atlantic coast marking one of the most painful chapters of African and global history.',
    history:
      'The monument stands on the Route des Esclaves in Ouidah. It invites reflection on the transatlantic slave trade, remembrance, and the need to preserve difficult histories with dignity.',
    openingHours: 'Open daily',
    address: 'Route des Esclaves, Ouidah, Benin',
    coordinates: { lat: 6.3254, lng: 2.0902 },
    tags: ['Memorial', 'Ouidah', 'Atlantic History'],
    relatedStoryIds: ['ouidah-badagry-memory'],
    relatedArtifactIds: ['dahomey-royal-banner'],
  },
  {
    id: 'fondation-zinsou-ouidah',
    name: 'Fondation Zinsou Ouidah',
    type: 'Cultural Center',
    country: 'Benin',
    city: 'Ouidah',
    image: image.villaAjavon,
    summary:
      'A cultural institution presenting contemporary African art and public-facing exhibitions.',
    history:
      'The Fondation Zinsou has helped make contemporary African art more visible in Benin through exhibitions, education programs, and access-oriented cultural programming.',
    openingHours: 'Tue - Sun, 10:00 AM - 6:00 PM',
    address: 'Villa Ajavon, Ouidah, Benin',
    coordinates: { lat: 6.3633, lng: 2.0856 },
    tags: ['Contemporary Art', 'Exhibitions', 'Education'],
    relatedStoryIds: ['contemporary-art'],
    relatedArtifactIds: ['yoruba-beaded-crown'],
  },
  {
    id: 'ganvie-lake-village',
    name: 'Ganvie Lake Village',
    type: 'Heritage Site',
    country: 'Benin',
    city: 'Lake Nokoue',
    image: image.ganvie,
    summary:
      'A stilt settlement on Lake Nokoue known for water-based life, adaptation, and local heritage.',
    history:
      'Ganvie is often described through its built environment on water, but its deeper value is social resilience. The village shows how communities shaped settlement, economy, and identity around the lake.',
    openingHours: 'Guided visits by arrangement',
    address: 'Lake Nokoue, near Cotonou, Benin',
    coordinates: { lat: 6.465, lng: 2.4147 },
    tags: ['Living Heritage', 'Lake Nokoue', 'Community'],
    relatedStoryIds: ['living-traditions'],
    relatedArtifactIds: ['gelede-mask'],
  },
  {
    id: 'porto-novo-ethnographic-museum',
    name: 'Porto-Novo Ethnographic Museum',
    type: 'Museum',
    country: 'Benin',
    city: 'Porto-Novo',
    image: image.portoNovo,
    summary:
      'A museum for learning about material culture, social life, and traditions in Benin.',
    history:
      'The Porto-Novo Ethnographic Museum introduces visitors to everyday objects, ritual forms, and cultural practices that help connect history to living communities.',
    openingHours: 'Mon - Fri, 9:00 AM - 5:00 PM',
    address: 'Porto-Novo, Benin',
    coordinates: { lat: 6.4969, lng: 2.6289 },
    tags: ['Ethnography', 'Traditions', 'Material Culture'],
    relatedStoryIds: ['living-traditions'],
    relatedArtifactIds: ['gelede-mask'],
  },
  {
    id: 'national-museum-lagos',
    name: 'National Museum Lagos',
    type: 'Museum',
    country: 'Nigeria',
    city: 'Lagos',
    image: image.lagosMuseum,
    summary:
      'A major museum collection covering Nigerian history, archaeology, art, and cultural memory.',
    history:
      'The National Museum Lagos is one of Nigeria\'s key cultural institutions. Its collections help visitors move across archaeology, royal art, masks, textiles, and national history.',
    openingHours: 'Mon - Sat, 9:30 AM - 3:30 PM',
    address: 'Onikan, Lagos Island, Nigeria',
    coordinates: { lat: 6.4445, lng: 3.4036 },
    tags: ['Museum', 'Lagos', 'National Collection'],
    relatedStoryIds: ['yoruba-heritage', 'bronze-casting'],
    relatedArtifactIds: ['ife-head', 'yoruba-beaded-crown'],
  },
  {
    id: 'nike-art-gallery-lagos',
    name: 'Nike Art Gallery',
    type: 'Cultural Center',
    country: 'Nigeria',
    city: 'Lagos',
    image: image.nikeGallery,
    summary:
      'A large art space for Nigerian contemporary art, textiles, workshops, and cultural exchange.',
    history:
      'Nike Art Gallery is a prominent Lagos cultural landmark. It gives visitors a high-density view of contemporary Nigerian creativity and craft traditions in an accessible setting.',
    openingHours: 'Mon - Sun, 10:00 AM - 6:00 PM',
    address: 'Lekki, Lagos, Nigeria',
    coordinates: { lat: 6.4352, lng: 3.5243 },
    tags: ['Art Gallery', 'Contemporary Art', 'Craft'],
    relatedStoryIds: ['contemporary-art'],
    relatedArtifactIds: ['yoruba-beaded-crown'],
  },
  {
    id: 'benin-city-national-museum',
    name: 'Benin City National Museum',
    type: 'Museum',
    country: 'Nigeria',
    city: 'Benin City',
    image: image.beninCity,
    summary:
      'A museum associated with Edo history, royal art, and the legacy of the Kingdom of Benin.',
    history:
      'Benin City is central to the history of Edo kingship and court art. The museum context helps users connect the city to bronze casting, palace culture, and debates about restitution.',
    openingHours: 'Mon - Sat, 9:00 AM - 4:00 PM',
    address: 'Ring Road, Benin City, Edo State, Nigeria',
    coordinates: { lat: 6.335, lng: 5.6037 },
    tags: ['Edo', 'Royal Art', 'Bronzes'],
    relatedStoryIds: ['benin-kingdom', 'bronze-casting'],
    relatedArtifactIds: ['benin-bronze-plaque', 'ivory-mask'],
  },
  {
    id: 'osun-osogbo-sacred-grove',
    name: 'Osun-Osogbo Sacred Grove',
    type: 'Heritage Site',
    country: 'Nigeria',
    city: 'Osogbo',
    image: image.osunGrove,
    summary:
      'A UNESCO-listed sacred landscape connected to Yoruba spirituality, art, and annual ritual practice.',
    history:
      'The grove is a living cultural landscape dedicated to Osun. Its paths, shrines, sculptures, and festival traditions show how heritage can remain active rather than frozen in the past.',
    openingHours: 'Open daily, guided visits recommended',
    address: 'Osogbo, Osun State, Nigeria',
    coordinates: { lat: 7.7556, lng: 4.5521 },
    tags: ['UNESCO', 'Yoruba', 'Sacred Landscape'],
    relatedStoryIds: ['yoruba-heritage', 'living-traditions'],
    relatedArtifactIds: ['gelede-mask', 'yoruba-beaded-crown'],
  },
  {
    id: 'badagry-heritage-museum',
    name: 'Badagry Heritage Museum',
    type: 'Museum',
    country: 'Nigeria',
    city: 'Badagry',
    image: image.badagry,
    summary:
      'A museum and memory site for learning about coastal history and the transatlantic slave trade.',
    history:
      'Badagry is deeply connected to Atlantic-era history. The museum offers a route into difficult memory, coastal trade, resistance, and the need for public historical education.',
    openingHours: 'Mon - Sat, 9:00 AM - 5:00 PM',
    address: 'Badagry, Lagos State, Nigeria',
    coordinates: { lat: 6.415, lng: 2.8816 },
    tags: ['Memory', 'Atlantic History', 'Education'],
    relatedStoryIds: ['ouidah-badagry-memory'],
    relatedArtifactIds: ['ivory-mask'],
  },
]

export const stories = [
  {
    id: 'dahomey-kingdom',
    title: 'Kingdom of Dahomey',
    category: 'Civilization',
    country: 'Benin',
    image: image.abomey,
    summary:
      'A concise route into royal power, palace life, military history, and cultural memory in southern Benin.',
    readTime: '6 min read',
    timeline: [
      { period: '1600s', text: 'The kingdom grows around Abomey and regional political networks.' },
      { period: '1700s', text: 'Royal authority, court systems, and military organization expand.' },
      { period: 'Today', text: 'Palaces, symbols, and oral memory remain essential to heritage education.' },
    ],
    body:
      'Dahomey was one of West Africa\'s most influential kingdoms. A good first encounter should connect institutions, warfare, religion, art, and public memory without reducing the story to spectacle. Abomey gives users a place-based way to begin that learning.',
    relatedLocationIds: ['royal-palaces-abomey', 'ouidah-history-museum'],
    relatedArtifactIds: ['dahomey-royal-banner'],
  },
  {
    id: 'benin-kingdom',
    title: 'Kingdom of Benin',
    category: 'Civilization',
    country: 'Nigeria',
    image: image.beninBronze,
    summary:
      'The Edo kingdom known for urban power, court ceremony, bronze casting, and global restitution debates.',
    readTime: '7 min read',
    timeline: [
      { period: '1200s', text: 'Benin City develops as a major political and cultural center.' },
      { period: '1500s', text: 'Court art and bronze casting document royal history and diplomacy.' },
      { period: 'Now', text: 'Collections and restitution conversations shape global museum practice.' },
    ],
    body:
      'The Kingdom of Benin offers a powerful example of how art can record authority, memory, and diplomacy. Plaques, heads, and ivory works are not only objects of beauty. They are documents of statecraft and cultural knowledge.',
    relatedLocationIds: ['benin-city-national-museum'],
    relatedArtifactIds: ['benin-bronze-plaque', 'ivory-mask'],
  },
  {
    id: 'yoruba-heritage',
    title: 'Yoruba Heritage',
    category: 'Tradition',
    country: 'Nigeria',
    image: image.osunGrove,
    summary:
      'A living heritage path across sacred landscapes, kingship, art, festivals, language, and philosophy.',
    readTime: '5 min read',
    timeline: [
      { period: 'Early cities', text: 'Ile-Ife and other centers become anchors of art and sacred authority.' },
      { period: 'Festivals', text: 'Annual rituals keep cultural knowledge public and intergenerational.' },
      { period: 'Diaspora', text: 'Yoruba culture travels, adapts, and remains globally influential.' },
    ],
    body:
      'Yoruba heritage is not a single object or event. It is a network of cities, sacred places, art forms, languages, festivals, and philosophical systems. The Osun-Osogbo Grove is one of the clearest places to understand it as living heritage.',
    relatedLocationIds: ['osun-osogbo-sacred-grove', 'national-museum-lagos'],
    relatedArtifactIds: ['ife-head', 'gelede-mask', 'yoruba-beaded-crown'],
  },
  {
    id: 'nok-culture',
    title: 'Nok Culture',
    category: 'Civilization',
    country: 'Nigeria',
    image: image.nok,
    summary:
      'An early terracotta tradition that opens a window into ancient creativity in central Nigeria.',
    readTime: '4 min read',
    timeline: [
      { period: 'c. 1500 BCE', text: 'Early communities develop distinctive ceramic and settlement patterns.' },
      { period: 'c. 500 BCE', text: 'Terracotta figures show technical skill and symbolic expression.' },
      { period: 'Today', text: 'Nok objects remain important for archaeology and heritage protection.' },
    ],
    body:
      'Nok terracottas are among the most recognizable early sculptural traditions in West Africa. For students, they are a practical entry into archaeology, preservation ethics, and the long timeline of African art.',
    relatedLocationIds: ['national-museum-lagos'],
    relatedArtifactIds: ['nok-terracotta'],
  },
  {
    id: 'ouidah-badagry-memory',
    title: 'Ouidah and Badagry Memory Routes',
    category: 'Historical Event',
    country: 'Benin and Nigeria',
    image: image.doorOfNoReturn,
    summary:
      'A careful learning path through coastal memory, forced migration, and public remembrance.',
    readTime: '6 min read',
    timeline: [
      { period: 'Atlantic era', text: 'Coastal ports become linked to commerce, violence, and forced migration.' },
      { period: 'Memorialization', text: 'Museums and monuments create public routes for remembrance.' },
      { period: 'Future', text: 'Digital access can support respectful education and preservation.' },
    ],
    body:
      'Ouidah and Badagry should be presented with restraint and care. The aim is not dark tourism. The value is historical literacy, remembrance, and connecting places across the Bight of Benin.',
    relatedLocationIds: ['door-of-no-return-ouidah', 'badagry-heritage-museum', 'ouidah-history-museum'],
    relatedArtifactIds: ['dahomey-royal-banner'],
  },
  {
    id: 'bronze-casting',
    title: 'Bronze Casting and Court Art',
    category: 'Tradition',
    country: 'Nigeria',
    image: image.beninBronze,
    summary:
      'How royal workshops transformed metal, memory, and political authority into enduring visual records.',
    readTime: '5 min read',
    timeline: [
      { period: 'Court workshops', text: 'Specialized makers create art for royal and ceremonial contexts.' },
      { period: 'Global collections', text: 'Objects enter museums worldwide through complex colonial histories.' },
      { period: 'Restitution', text: 'Return, access, and interpretation become central cultural questions.' },
    ],
    body:
      'Court art from Benin City gives the MVP a strong artifact-led learning path. Users can move from an object to a place, then into a wider historical story about memory and museum responsibility.',
    relatedLocationIds: ['benin-city-national-museum', 'national-museum-lagos'],
    relatedArtifactIds: ['benin-bronze-plaque', 'ivory-mask'],
  },
  {
    id: 'living-traditions',
    title: 'Living Traditions and Sacred Places',
    category: 'Tradition',
    country: 'Benin and Nigeria',
    image: image.ganvie,
    summary:
      'A reminder that heritage is also practiced, adapted, and carried by communities today.',
    readTime: '4 min read',
    timeline: [
      { period: 'Inherited knowledge', text: 'Communities transmit ritual, craft, language, and social practice.' },
      { period: 'Public heritage', text: 'Museums and sites help translate living knowledge for visitors.' },
      { period: 'Digital future', text: 'Careful platforms can make discovery easier without flattening context.' },
    ],
    body:
      'The MVP should show that African heritage is not only ancient or monumental. Living places such as Ganvie and sacred landscapes such as Osun-Osogbo help users see continuity and change.',
    relatedLocationIds: ['ganvie-lake-village', 'porto-novo-ethnographic-museum', 'osun-osogbo-sacred-grove'],
    relatedArtifactIds: ['gelede-mask'],
  },
  {
    id: 'contemporary-art',
    title: 'Contemporary African Art Spaces',
    category: 'Tradition',
    country: 'Benin and Nigeria',
    image: image.nikeGallery,
    summary:
      'Modern galleries and foundations as entry points into culture, education, and creative continuity.',
    readTime: '3 min read',
    timeline: [
      { period: 'Workshops', text: 'Artists and educators bring craft and contemporary practice to new audiences.' },
      { period: 'Galleries', text: 'Public art spaces make discovery easier for local and visiting users.' },
      { period: 'MVP', text: 'Tribal Tripe can help users connect exhibitions with deeper heritage context.' },
    ],
    body:
      'A cultural discovery product should not stop at historic monuments. Contemporary art spaces help younger users connect heritage to what artists, curators, and educators are building now.',
    relatedLocationIds: ['nike-art-gallery-lagos', 'fondation-zinsou-ouidah'],
    relatedArtifactIds: ['yoruba-beaded-crown'],
  },
]

export const artifacts = [
  {
    id: 'benin-bronze-plaque',
    name: 'Benin Bronze Plaque',
    country: 'Nigeria',
    origin: 'Edo, Benin Kingdom',
    period: '16th - 17th century',
    image: image.beninBronze,
    summary: 'A court art form that records royal authority, ceremony, and historical memory.',
    significance:
      'Benin plaques are visual records of court life. They help users understand how art, power, and history were connected in the Kingdom of Benin.',
    relatedLocationId: 'benin-city-national-museum',
    relatedStoryIds: ['benin-kingdom', 'bronze-casting'],
  },
  {
    id: 'nok-terracotta',
    name: 'Nok Terracotta Head',
    country: 'Nigeria',
    origin: 'Nok cultural region',
    period: 'c. 600 BCE - 250 CE',
    image: image.nok,
    summary: 'A sculptural tradition from one of West Africa\'s earliest known complex cultures.',
    significance:
      'Nok terracottas are central to understanding ancient African creativity, archaeology, and the importance of protecting excavated heritage.',
    relatedLocationId: 'national-museum-lagos',
    relatedStoryIds: ['nok-culture'],
  },
  {
    id: 'gelede-mask',
    name: 'Gelede Mask',
    country: 'Benin and Nigeria',
    origin: 'Yoruba and related communities',
    period: '19th - 20th century traditions',
    image: image.gelede,
    summary: 'A mask tradition connected to performance, social order, and respect for women\'s power.',
    significance:
      'Gelede masks are best understood through performance and community context. They show why artifact pages should connect objects to living traditions.',
    relatedLocationId: 'porto-novo-ethnographic-museum',
    relatedStoryIds: ['yoruba-heritage', 'living-traditions'],
  },
  {
    id: 'ife-head',
    name: 'Ife Head',
    country: 'Nigeria',
    origin: 'Ile-Ife, Yoruba',
    period: '12th - 15th century',
    image: image.ifeHead,
    summary: 'A naturalistic head associated with royal art and sacred authority in Ile-Ife.',
    significance:
      'Ife heads challenge narrow assumptions about African art history. Their technical refinement makes them ideal for educational discovery.',
    relatedLocationId: 'national-museum-lagos',
    relatedStoryIds: ['yoruba-heritage'],
  },
  {
    id: 'dahomey-royal-banner',
    name: 'Dahomey Royal Banner',
    country: 'Benin',
    origin: 'Dahomey court tradition',
    period: '19th century',
    image: image.dahomeyBanner,
    summary: 'A textile form using symbols to communicate royal identity, conflict, and memory.',
    significance:
      'Royal banners help users see that history can be encoded through cloth, color, symbols, and court storytelling.',
    relatedLocationId: 'royal-palaces-abomey',
    relatedStoryIds: ['dahomey-kingdom', 'ouidah-badagry-memory'],
  },
  {
    id: 'yoruba-beaded-crown',
    name: 'Yoruba Beaded Crown',
    country: 'Nigeria',
    origin: 'Yoruba royal traditions',
    period: '19th - 20th century traditions',
    image: image.yorubaCrown,
    summary: 'A royal regalia form connected to sacred authority, lineage, and visual identity.',
    significance:
      'Beaded crowns connect craft, kingship, spirituality, and public ceremony. They make a strong bridge between object study and living heritage.',
    relatedLocationId: 'osun-osogbo-sacred-grove',
    relatedStoryIds: ['yoruba-heritage', 'contemporary-art'],
  },
  {
    id: 'ivory-mask',
    name: 'Queen Mother Pendant Mask',
    country: 'Nigeria',
    origin: 'Edo, Benin Kingdom',
    period: '16th century',
    image: image.ivoryMask,
    summary: 'A celebrated ivory work associated with Queen Mother Idia and Benin royal memory.',
    significance:
      'The pendant mask is an accessible way to discuss royal women, symbolism, craftsmanship, and the global movement of African heritage objects.',
    relatedLocationId: 'benin-city-national-museum',
    relatedStoryIds: ['benin-kingdom', 'bronze-casting'],
  },
]

export const categories = ['Museum', 'Heritage Site', 'Cultural Center']
export const countries = ['Benin', 'Nigeria']
