export const cultureGuides = [
  {
    country: 'Benin',
    available: true,
    mapPoint: { lat: 9.3, lng: 2.3 },
    languages: ['Fon', 'Yoruba', 'French'],
    phrases: [
      { language: 'Fon', english: 'Hello', local: 'Kudo', pronunciation: 'koo-doh', context: 'General greeting', status: 'draft' },
      { language: 'French', english: 'Thank you', local: 'Merci', pronunciation: 'mehr-see', context: 'Widely understood in cities', status: 'verified' },
      { language: 'Yoruba', english: 'Good morning', local: 'E kaaro', pronunciation: 'eh-kah-roh', context: 'Morning greeting', status: 'draft' },
    ],
    greetings: ['Greet elders first in formal settings.', 'A handshake is common in urban contexts.', 'Use French when you are unsure of the local language.'],
    etiquette: ['Ask before photographing people or ceremonies.', 'Dress modestly around sacred sites and memorial spaces.', 'Treat Vodun spaces as living religious sites, not props.'],
    taboos: ['Do not touch ritual objects without permission.', 'Do not make jokes at memorial sites such as Ouidah.', 'Avoid entering private courtyards without a host.'],
    foods: [
      { name: 'Amiwo', description: 'Spiced corn dough often served with tomato sauce, chicken, or fish.', commonIn: ['Benin', 'Togo'], status: 'verified' },
      { name: 'Akassa', description: 'Fermented corn paste served with sauce, common in southern Benin.', commonIn: ['Benin'], status: 'draft' },
    ],
    foodSpots: [
      { name: 'Dantokpa Market food stalls', city: 'Cotonou', specialty: 'Local Beninese street food', priceLevel: '$', coordinates: { lat: 6.3719, lng: 2.4336 } },
      { name: 'Ouidah beach grills', city: 'Ouidah', specialty: 'Grilled fish and local sauces', priceLevel: '$$', coordinates: { lat: 6.3254, lng: 2.0902 } },
    ],
    musicStyles: [
      { name: 'Tchinkoume', description: 'A southern Beninese rhythm connected to community ceremonies, drums, call-and-response singing, and public celebration.', context: 'Useful for understanding how ceremony, dance, and oral memory meet.', status: 'draft' },
      { name: 'Zinli', description: 'A Fon-rooted performance style often linked with percussion, dance, and social commentary.', context: 'Relevant around Abomey and wider Dahomey cultural history.', status: 'draft' },
      { name: 'Agbadja', description: 'A Ewe-influenced rhythm shared across the Benin-Togo-Ghana cultural corridor.', context: 'Shows how music moves across borders rather than stopping at modern maps.', status: 'draft' },
    ],
    clothingStyles: [
      { name: 'Kanvo cloth', description: 'Handwoven Beninese cotton textile used in contemporary fashion and cultural dress.', context: 'Good entry point for local craft, design, and textile revival.', status: 'draft' },
      { name: 'Boubou and embroidered sets', description: 'Loose formal garments used for ceremonies, religious events, and important family occasions.', context: 'Often chosen for public respectability and celebration.', status: 'verified' },
      { name: 'Ceremonial white cloth', description: 'White garments can appear in Vodun and spiritual contexts, depending on the community and ceremony.', context: 'Always interpret through local guidance, not generic symbolism.', status: 'draft' },
    ],
  },
  {
    country: 'Nigeria',
    available: true,
    mapPoint: { lat: 9.1, lng: 8.7 },
    languages: ['English', 'Yoruba', 'Hausa', 'Igbo', 'Pidgin'],
    phrases: [
      { language: 'Pidgin', english: 'How are you?', local: 'How you dey?', pronunciation: 'how-you-day', context: 'Casual greeting', status: 'verified' },
      { language: 'Yoruba', english: 'Thank you', local: 'E se', pronunciation: 'eh-sheh', context: 'Polite thanks', status: 'draft' },
      { language: 'Hausa', english: 'Hello', local: 'Sannu', pronunciation: 'san-noo', context: 'Common northern greeting', status: 'draft' },
    ],
    greetings: ['Greetings can be energetic and relational.', 'Use titles such as Mr, Mrs, Chief, or Dr when appropriate.', 'In Yoruba contexts, younger people may show visible respect to elders.'],
    etiquette: ['Ask before photographing artworks, shrines, or people.', 'Expect bargaining in markets but keep it respectful.', 'Be patient with traffic and timing in large cities.'],
    taboos: ['Do not dismiss ethnic or religious identity as unimportant.', 'Avoid political arguments with strangers.', 'Do not touch sacred objects or royal regalia without permission.'],
    foods: [
      { name: 'Jollof Rice', description: 'Tomato-based rice dish with regional variations and strong cultural pride.', commonIn: ['Nigeria', 'Ghana'], status: 'verified' },
      { name: 'Suya', description: 'Spiced grilled meat usually sold at night by street vendors.', commonIn: ['Nigeria'], status: 'verified' },
    ],
    foodSpots: [
      { name: 'National Theatre area food vendors', city: 'Lagos', specialty: 'Jollof rice and grilled dishes', priceLevel: '$$', coordinates: { lat: 6.476, lng: 3.369 } },
      { name: 'Lekki evening suya spots', city: 'Lagos', specialty: 'Suya', priceLevel: '$', coordinates: { lat: 6.4352, lng: 3.5243 } },
    ],
    musicStyles: [
      { name: 'Afrobeats', description: 'A modern Nigerian-led pop sound shaped by dance rhythms, global production, and Lagos nightlife.', context: 'Connects contemporary youth culture with older highlife and Afrobeat roots.', status: 'verified' },
      { name: 'Fuji', description: 'A Yoruba popular music style built around percussion, praise singing, Islamic festival roots, and urban performance.', context: 'Important for Lagos, Ibadan, and Yoruba social life.', status: 'draft' },
      { name: 'Juju and highlife', description: 'Guitar-driven styles with strong links to parties, praise, identity, and postcolonial popular culture.', context: 'Useful for understanding older Nigerian popular music scenes.', status: 'verified' },
    ],
    clothingStyles: [
      { name: 'Aso oke', description: 'Yoruba woven cloth used for weddings, chieftaincy events, and formal cultural dress.', context: 'Often appears with fila caps, gele headwraps, iro, buba, or agbada.', status: 'verified' },
      { name: 'Agbada', description: 'A flowing embroidered robe worn formally by men across several West African contexts.', context: 'In Nigeria it signals ceremony, respect, and style.', status: 'verified' },
      { name: 'Gele', description: 'A structured headwrap worn with formal outfits, especially at weddings and major celebrations.', context: 'Shape, fabric, and styling carry fashion identity.', status: 'verified' },
    ],
  },
  {
    country: "Cote d'Ivoire",
    available: true,
    mapPoint: { lat: 7.5, lng: -5.5 },
    languages: ['French', 'Dioula', 'Baoule'],
    phrases: [
      { language: 'French', english: 'Good evening', local: 'Bonsoir', pronunciation: 'bon-swahr', context: 'Evening greeting', status: 'verified' },
      { language: 'Dioula', english: 'Thank you', local: 'I ni ce', pronunciation: 'ee-nee-cheh', context: 'Common Manding thank you', status: 'draft' },
    ],
    greetings: ['French greetings are widely used in public spaces.', 'Take time to greet before asking a direct question.', 'Handshakes are common in formal introductions.'],
    etiquette: ['Ask before photographing people in markets.', 'Treat textile and mask traditions as cultural knowledge, not costume.', 'Be respectful around colonial memory sites in Grand-Bassam.'],
    taboos: ['Do not handle masks or ceremonial objects casually.', 'Avoid reducing Ivorian culture to one ethnic group.', 'Do not enter private compounds without invitation.'],
    foods: [
      { name: 'Attieke', description: 'Cassava couscous often served with fish, chicken, onions, and pepper.', commonIn: ["Cote d'Ivoire"], status: 'verified' },
      { name: 'Aloco', description: 'Fried plantain served as street food or side dish.', commonIn: ["Cote d'Ivoire", 'Benin'], status: 'verified' },
    ],
    foodSpots: [
      { name: 'Grand-Bassam beach maquis', city: 'Grand-Bassam', specialty: 'Attieke with grilled fish', priceLevel: '$$', coordinates: { lat: 5.1975, lng: -3.7367 } },
    ],
    musicStyles: [
      { name: 'Zouglou', description: 'Urban Ivorian music known for group vocals, social commentary, humor, and student culture roots.', context: 'A strong way to understand Abidjan popular culture.', status: 'verified' },
      { name: 'Coupe-Decale', description: 'Dance-focused Ivorian club music shaped by diaspora style, celebration, and fast-moving dance trends.', context: 'Useful for nightlife and contemporary youth culture.', status: 'verified' },
      { name: 'Senufo performance traditions', description: 'Ceremonial music and dance connected to local knowledge, initiation contexts, and community performance.', context: 'Should be explained with care and local context.', status: 'draft' },
    ],
    clothingStyles: [
      { name: 'Pagne and tailored sets', description: 'Printed cloth tailored into dresses, shirts, skirts, and formal outfits for everyday and ceremonial use.', context: 'Common across urban and family events.', status: 'verified' },
      { name: 'Baoule woven cloth', description: 'Strip-woven textile associated with Akan/Baoule cultural identity and formal dress.', context: 'Connects textile design with regional identity.', status: 'draft' },
      { name: 'Senufo textile and mask attire', description: 'Clothing around Senufo performance contexts can include specific fabrics, accessories, and restricted meanings.', context: 'Avoid treating ceremonial dress as costume.', status: 'draft' },
    ],
  },
  {
    country: 'Togo',
    available: true,
    mapPoint: { lat: 8.6, lng: 1.1 },
    languages: ['French', 'Ewe', 'Kabiye'],
    phrases: [
      { language: 'Ewe', english: 'Welcome', local: 'Woezor', pronunciation: 'woh-zor', context: 'Welcoming expression', status: 'draft' },
      { language: 'French', english: 'Please', local: "S'il vous plait", pronunciation: 'seel-voo-pleh', context: 'Polite request', status: 'verified' },
    ],
    greetings: ['Greet before beginning a conversation.', 'French is useful for official settings.', 'Community elders should be addressed respectfully.'],
    etiquette: ['Ask before entering compounds in Koutammakou.', 'Use guides for living heritage landscapes.', 'Respect rules around sacred spaces and family areas.'],
    taboos: ['Do not climb or enter traditional houses without permission.', 'Do not photograph ceremonies without consent.', 'Avoid loud behavior in sacred areas.'],
    foods: [
      { name: 'Fufu', description: 'Pounded staple served with soup or sauce.', commonIn: ['Togo', 'Ghana', 'Benin'], status: 'verified' },
      { name: 'Akume', description: 'Maize-based staple commonly eaten with sauces.', commonIn: ['Togo'], status: 'draft' },
    ],
    foodSpots: [
      { name: 'Lome local chop bars', city: 'Lome', specialty: 'Fufu and sauces', priceLevel: '$', coordinates: { lat: 6.1725, lng: 1.2314 } },
    ],
    musicStyles: [
      { name: 'Agbadja', description: 'Ewe rhythm and dance tradition using drums, songs, and coordinated movement.', context: 'Shared across Togo, Benin, and Ghana cultural areas.', status: 'draft' },
      { name: 'Akpesse', description: 'Popular Togolese dance music with fast rhythms and strong public celebration energy.', context: 'Often heard in parties, festivals, and urban social life.', status: 'draft' },
      { name: 'Kabye and northern drum traditions', description: 'Regional percussion and dance forms tied to community life and ceremonial calendars.', context: 'Use local guides for specific names and meanings.', status: 'draft' },
    ],
    clothingStyles: [
      { name: 'Ewe kente cloth', description: 'Strip-woven cloth with patterns and colors used in formal and cultural contexts.', context: 'Related to but distinct from other kente traditions in the region.', status: 'draft' },
      { name: 'Pagne styles', description: 'Printed cloth tailored into dresses, shirts, wraps, and event clothing.', context: 'Common in Lome and across daily social life.', status: 'verified' },
      { name: 'Batammariba dress contexts', description: 'Traditional clothing around Koutammakou must be understood through living community protocols.', context: 'Ask before photographing people or ceremonies.', status: 'draft' },
    ],
  },
  {
    country: 'Ghana',
    available: true,
    mapPoint: { lat: 7.9, lng: -1.0 },
    languages: ['English', 'Twi', 'Ga', 'Ewe'],
    phrases: [
      { language: 'Twi', english: 'Hello / How are you?', local: 'Ete sen?', pronunciation: 'eh-teh-sen', context: 'Casual greeting', status: 'draft' },
      { language: 'Twi', english: 'Thank you', local: 'Medaase', pronunciation: 'meh-dah-see', context: 'Polite thanks', status: 'draft' },
    ],
    greetings: ['Greet people before asking for help.', 'Handshakes are common; follow local cues.', 'Use right hand for giving and receiving when possible.'],
    etiquette: ['Ask before photographing people and ceremonies.', 'Respect solemn behavior at Atlantic memory sites.', 'Be attentive to palace and stool protocols in Asante contexts.'],
    taboos: ['Avoid using the left hand for important exchanges where possible.', 'Do not treat castles as entertainment spaces.', 'Do not touch royal symbols without permission.'],
    foods: [
      { name: 'Waakye', description: 'Rice and beans usually served with sides and sauce.', commonIn: ['Ghana'], status: 'verified' },
      { name: 'Banku and Tilapia', description: 'Fermented corn and cassava dough served with grilled tilapia and pepper.', commonIn: ['Ghana'], status: 'verified' },
    ],
    foodSpots: [
      { name: 'Cape Coast local restaurants', city: 'Cape Coast', specialty: 'Banku and fish', priceLevel: '$$', coordinates: { lat: 5.1053, lng: -1.2466 } },
      { name: 'Kumasi chop bars', city: 'Kumasi', specialty: 'Fufu and light soup', priceLevel: '$', coordinates: { lat: 6.6885, lng: -1.6244 } },
    ],
    musicStyles: [
      { name: 'Highlife', description: 'Guitar-led Ghanaian popular music blending local rhythms, brass band history, dance, and social storytelling.', context: 'Essential for understanding modern Ghanaian music history.', status: 'verified' },
      { name: 'Hiplife', description: 'Ghanaian hip-hop and highlife fusion using local languages, rap, and urban production.', context: 'Strong link to Accra youth culture.', status: 'verified' },
      { name: 'Adowa and Kpanlogo', description: 'Dance and drum traditions connected to Akan and Ga cultural performance contexts.', context: 'Useful for connecting music, movement, and ceremony.', status: 'draft' },
    ],
    clothingStyles: [
      { name: 'Kente', description: 'Prestige strip-woven cloth associated with Akan and Ewe histories, symbols, and ceremonial dress.', context: 'Patterns and colors can carry names and social meanings.', status: 'verified' },
      { name: 'Batakari / smock', description: 'Northern Ghanaian woven garment worn by men and women in cultural and formal contexts.', context: 'Important beyond southern Ghana visual identity.', status: 'draft' },
      { name: 'Adinkra cloth', description: 'Textile marked with symbols connected to Akan ideas, values, and proverbial knowledge.', context: 'Useful for education and visual literacy.', status: 'verified' },
    ],
  },
  {
    country: 'Kenya',
    available: true,
    mapPoint: { lat: 0.2, lng: 37.9 },
    languages: ['Swahili', 'English'],
    phrases: [
      { language: 'Swahili', english: 'Hello', local: 'Jambo', pronunciation: 'jahm-boh', context: 'Common tourist-friendly greeting', status: 'verified' },
      { language: 'Swahili', english: 'Thank you', local: 'Asante', pronunciation: 'ah-sahn-teh', context: 'Polite thanks', status: 'verified' },
      { language: 'Swahili', english: 'Welcome', local: 'Karibu', pronunciation: 'kah-ree-boo', context: 'Hospitality expression', status: 'verified' },
    ],
    greetings: ['Swahili greetings are appreciated across the coast.', 'Use respectful greetings before negotiation or directions.', 'In coastal towns, dress modestly around religious areas.'],
    etiquette: ['Ask before photographing people, doors, or private homes.', 'Respect mosque areas and local coastal customs.', 'Use guides in historic town centers when possible.'],
    taboos: ['Do not enter religious spaces without checking rules.', 'Do not photograph private homes without permission.', 'Avoid disrespectful behavior around Fort Jesus and Lamu heritage areas.'],
    foods: [
      { name: 'Ugali', description: 'Maize staple served with vegetables, meat, or stew.', commonIn: ['Kenya'], status: 'verified' },
      { name: 'Pilau', description: 'Spiced rice dish strongly associated with Swahili coast food culture.', commonIn: ['Kenya', 'Tanzania'], status: 'verified' },
    ],
    foodSpots: [
      { name: 'Mombasa old town eateries', city: 'Mombasa', specialty: 'Swahili pilau and coastal dishes', priceLevel: '$$', coordinates: { lat: -4.0435, lng: 39.6682 } },
      { name: 'Lamu waterfront food spots', city: 'Lamu', specialty: 'Coastal seafood', priceLevel: '$$', coordinates: { lat: -2.2696, lng: 40.902 } },
    ],
    musicStyles: [
      { name: 'Benga', description: 'Kenyan guitar-driven popular music with bright riffs, dance rhythms, and strong regional roots.', context: 'Important for understanding post-independence popular music.', status: 'verified' },
      { name: 'Taarab', description: 'Swahili coast music shaped by poetry, Arabic, Indian Ocean, and East African influences.', context: 'Relevant in Mombasa, Lamu, and coastal heritage.', status: 'verified' },
      { name: 'Isukuti and Genge', description: 'Isukuti connects Luhya drumming and dance, while Genge reflects Nairobi urban youth music.', context: 'Shows the range between regional performance and city sound.', status: 'draft' },
    ],
    clothingStyles: [
      { name: 'Kanga', description: 'Printed rectangular cloth often carrying Swahili sayings, worn as wraps and social expression.', context: 'Text and pattern can communicate identity, humor, and emotion.', status: 'verified' },
      { name: 'Kitenge', description: 'Printed fabric tailored into dresses, shirts, skirts, and modern formalwear.', context: 'Common across East and Central African fashion.', status: 'verified' },
      { name: 'Maasai shuka', description: 'Checked cloth associated with Maasai dress and pastoral identity.', context: 'Use with respect and avoid reducing it to tourist costume.', status: 'verified' },
    ],
  },
  {
    country: 'Niger',
    available: true,
    mapPoint: { lat: 17.6, lng: 8.1 },
    languages: ['French', 'Hausa', 'Zarma', 'Tamasheq'],
    phrases: [
      { language: 'Hausa', english: 'Hello', local: 'Sannu', pronunciation: 'san-noo', context: 'Common greeting', status: 'draft' },
      { language: 'French', english: 'Thank you', local: 'Merci', pronunciation: 'mehr-see', context: 'Widely understood', status: 'verified' },
    ],
    greetings: ['Greetings can be extended and relational.', 'French helps in official settings.', 'Ask local guides about etiquette in Agadez and Tuareg contexts.'],
    etiquette: ['Dress modestly in Sahelian towns.', 'Ask before photographing people or homes.', 'Respect mosque spaces and prayer times.'],
    taboos: ['Do not photograph security-sensitive areas.', 'Do not enter religious spaces without permission.', 'Do not treat craft symbols as generic decoration.'],
    foods: [
      { name: 'Djerma rice dishes', description: 'Rice-based meals served with sauces and local seasonings.', commonIn: ['Niger'], status: 'draft' },
      { name: 'Kilishi', description: 'Spiced dried meat popular across Niger and northern Nigeria.', commonIn: ['Niger', 'Nigeria'], status: 'verified' },
    ],
    foodSpots: [
      { name: 'Agadez market food stalls', city: 'Agadez', specialty: 'Kilishi and market foods', priceLevel: '$', coordinates: { lat: 16.9742, lng: 7.9865 } },
    ],
    musicStyles: [
      { name: 'Tuareg guitar / assouf', description: 'Desert blues guitar style connected to Tuareg identity, migration, memory, and contemporary Saharan sound.', context: 'Relevant around Agadez and wider Sahel music culture.', status: 'verified' },
      { name: 'Hausa praise singing', description: 'Vocal music traditions that can honor patrons, leaders, events, and community stories.', context: 'Often linked to social relationships and public occasions.', status: 'draft' },
      { name: 'Zarma-Songhai rhythms', description: 'Regional percussion and vocal styles tied to ceremony, storytelling, and community life.', context: 'Needs local specificity by region and event.', status: 'draft' },
    ],
    clothingStyles: [
      { name: 'Tagelmust', description: 'Indigo or dark head covering worn by Tuareg men for protection, identity, and cultural expression.', context: 'Do not treat it as a generic desert accessory.', status: 'verified' },
      { name: 'Grand boubou', description: 'Loose formal robe worn across Sahelian and West African contexts.', context: 'Used for ceremonies, religious occasions, and formal visits.', status: 'verified' },
      { name: 'Indigo-dyed garments', description: 'Cloth dyed in deep blue tones associated with craft, trade, and Sahelian aesthetics.', context: 'Connects dress to material culture and regional exchange.', status: 'draft' },
    ],
  },
  {
    country: 'Burkina Faso',
    available: true,
    mapPoint: { lat: 12.2, lng: -1.6 },
    languages: ['French', 'Moore', 'Dioula', 'Fulfulde'],
    phrases: [
      { language: 'French', english: 'Good morning', local: 'Bonjour', pronunciation: 'bon-zhoor', context: 'General greeting', status: 'verified' },
      { language: 'Moore', english: 'Thank you', local: 'Barka', pronunciation: 'bar-kah', context: 'Polite thanks', status: 'draft' },
    ],
    greetings: ['Take time to greet before direct requests.', 'French is useful across official and urban contexts.', 'Respect elders and local hosts in community settings.'],
    etiquette: ['Ask before photographing masks, musicians, or ceremonies.', 'Use guides around ruins and rural heritage sites.', 'Support local craft sellers respectfully.'],
    taboos: ['Do not touch masks or ritual objects casually.', 'Do not enter restricted community spaces.', 'Avoid treating performance as spectacle without context.'],
    foods: [
      { name: 'Riz gras', description: 'Seasoned rice dish often cooked with tomato, oil, vegetables, and meat.', commonIn: ['Burkina Faso'], status: 'verified' },
      { name: 'To', description: 'Millet or sorghum paste served with sauce.', commonIn: ['Burkina Faso'], status: 'draft' },
    ],
    foodSpots: [
      { name: 'Ouagadougou maquis', city: 'Ouagadougou', specialty: 'Riz gras and grilled meats', priceLevel: '$$', coordinates: { lat: 12.3714, lng: -1.5197 } },
    ],
    musicStyles: [
      { name: 'Warba', description: 'Mossi dance and drum tradition with strong links to public celebration and community performance.', context: 'Important around central Burkina Faso cultural life.', status: 'draft' },
      { name: 'Balafon traditions', description: 'Xylophone music used across several communities for ceremony, storytelling, and social events.', context: 'Connects sound, craft, and oral history.', status: 'verified' },
      { name: 'Modern Burkinabe popular music', description: 'Urban styles combine local languages, percussion, guitar, and pan-West African influences.', context: 'Useful for connecting heritage to contemporary youth culture.', status: 'draft' },
    ],
    clothingStyles: [
      { name: 'Faso Dan Fani', description: 'Burkinabe handwoven cotton cloth strongly associated with local production and national cultural pride.', context: 'A key textile for modern heritage and design.', status: 'verified' },
      { name: 'Boubou and tailored pagne', description: 'Formal robes and printed cloth outfits used for ceremonies, family events, and professional life.', context: 'Common across urban and rural settings.', status: 'verified' },
      { name: 'Mask performance attire', description: 'Some communities use specific fiber, cloth, and mask dress in controlled performance contexts.', context: 'Interpret through community rules and restrictions.', status: 'draft' },
    ],
  },
  {
    country: 'Congo',
    available: true,
    mapPoint: { lat: -0.7, lng: 15.6 },
    languages: ['French', 'Lingala', 'Kituba'],
    phrases: [
      { language: 'Lingala', english: 'Hello', local: 'Mbote', pronunciation: 'mbo-teh', context: 'Common greeting', status: 'verified' },
      { language: 'French', english: 'Thank you', local: 'Merci', pronunciation: 'mehr-see', context: 'Widely understood', status: 'verified' },
    ],
    greetings: ['Greet before starting conversation.', 'French is common in public and institutional spaces.', 'Respect kinship, age, and local authority when visiting communities.'],
    etiquette: ['Ask before photographing people or ritual objects.', 'Use local guides around Loango and museum contexts.', 'Treat Kongo ritual objects with seriousness.'],
    taboos: ['Do not touch ritual objects without permission.', 'Avoid reducing Kongo objects to aesthetics only.', 'Do not enter private or sacred areas without a host.'],
    foods: [
      { name: 'Saka-saka', description: 'Cassava leaves cooked into a rich sauce, often served with fish or meat.', commonIn: ['Congo'], status: 'verified' },
      { name: 'Poulet moambe', description: 'Chicken cooked with palm nut sauce.', commonIn: ['Congo'], status: 'verified' },
    ],
    foodSpots: [
      { name: 'Pointe-Noire local restaurants', city: 'Pointe-Noire', specialty: 'Saka-saka and fish', priceLevel: '$$', coordinates: { lat: -4.7692, lng: 11.8664 } },
    ],
    musicStyles: [
      { name: 'Congolese rumba', description: 'Guitar-led dance music with deep roots in Central African urban culture and transatlantic exchange.', context: 'A major cultural export across Africa.', status: 'verified' },
      { name: 'Soukous', description: 'Fast, dance-oriented evolution of Congolese rumba known for guitar lines and energetic movement.', context: 'Useful for modern popular music history.', status: 'verified' },
      { name: 'Kongo percussion traditions', description: 'Rhythms and songs connected to ritual, social events, and regional identity.', context: 'Needs respectful context around sacred objects and ceremonies.', status: 'draft' },
    ],
    clothingStyles: [
      { name: 'Liputa', description: 'Printed cloth wrap and tailored style widely worn by women in Congo and Central Africa.', context: 'Connects fashion, family events, and urban identity.', status: 'verified' },
      { name: 'Sape style', description: 'Elegant urban fashion culture associated with Brazzaville and Kinshasa style scenes.', context: 'Important for modern self-presentation and creativity.', status: 'verified' },
      { name: 'Raffia and Kongo textile contexts', description: 'Raffia and woven materials appear in historical and ritual object traditions.', context: 'Explain through cultural use, not decoration only.', status: 'draft' },
    ],
  },
  {
    country: 'Guinea',
    available: true,
    mapPoint: { lat: 10.4, lng: -10.9 },
    languages: ['French', 'Pular', 'Malinke', 'Susu'],
    phrases: [
      { language: 'French', english: 'Hello', local: 'Bonjour', pronunciation: 'bon-zhoor', context: 'General greeting', status: 'verified' },
      { language: 'Pular', english: 'Thank you', local: 'Jaraama', pronunciation: 'jah-rah-mah', context: 'Polite thanks', status: 'draft' },
    ],
    greetings: ['Greetings are important before requests.', 'French helps in museums and cities.', 'Respect local protocols when visiting highland or village areas.'],
    etiquette: ['Ask before photographing people, masks, or ceremonies.', 'Respect the cultural context of Baga and other mask traditions.', 'Use guides around landscape heritage areas.'],
    taboos: ['Do not handle masks or sacred objects without permission.', 'Avoid entering ceremonies uninvited.', 'Do not treat cultural dress or performance as costume.'],
    foods: [
      { name: 'Riz sauce arachide', description: 'Rice served with peanut-based sauce, common in many Guinean meals.', commonIn: ['Guinea'], status: 'draft' },
      { name: 'Poulet yassa', description: 'Chicken with onion and lemon-style sauce, common across the region.', commonIn: ['Guinea', 'Senegal'], status: 'draft' },
    ],
    foodSpots: [
      { name: 'Conakry local restaurants', city: 'Conakry', specialty: 'Rice with peanut sauce', priceLevel: '$$', coordinates: { lat: 9.6412, lng: -13.5784 } },
    ],
    musicStyles: [
      { name: 'Manding jeli music', description: 'Griot music using voice, kora, balafon, and oral history to preserve memory, praise, and social knowledge.', context: 'Important for understanding music as archive and education.', status: 'verified' },
      { name: 'Djembe and balafon ensembles', description: 'Percussion and xylophone traditions used in dance, ceremony, and public performance.', context: 'Connects rhythm to community life rather than entertainment only.', status: 'verified' },
      { name: 'Baga ceremonial performance', description: 'Music, movement, and mask contexts linked to community identity and ritual meaning.', context: 'Requires local guidance and respect for restricted knowledge.', status: 'draft' },
    ],
    clothingStyles: [
      { name: 'Leppi cloth', description: 'Indigo-dyed cloth associated with Fouta Djallon and Fulbe textile traditions.', context: 'Strong link between region, craft, and identity.', status: 'draft' },
      { name: 'Grand boubou', description: 'Formal flowing garment worn across Guinean and wider West African contexts.', context: 'Common for ceremonies, religious gatherings, and important visits.', status: 'verified' },
      { name: 'Baga ceremonial dress', description: 'Dress around Baga mask performance is tied to ceremony, identity, and community protocols.', context: 'Do not separate clothing from performance and meaning.', status: 'draft' },
    ],
  },
]

export const unavailableAfricaPoints = [
  { country: 'Morocco', mapPoint: { lat: 31.8, lng: -7.1 } },
  { country: 'Egypt', mapPoint: { lat: 26.8, lng: 30.8 } },
  { country: 'Senegal', mapPoint: { lat: 14.5, lng: -14.5 } },
  { country: 'Cameroon', mapPoint: { lat: 5.8, lng: 12.7 } },
  { country: 'Ethiopia', mapPoint: { lat: 9.1, lng: 40.5 } },
  { country: 'Tanzania', mapPoint: { lat: -6.3, lng: 34.8 } },
  { country: 'Angola', mapPoint: { lat: -11.2, lng: 17.8 } },
  { country: 'South Africa', mapPoint: { lat: -30.6, lng: 22.9 } },
]
