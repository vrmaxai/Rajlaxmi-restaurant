import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/* =====================================================================
   SETTINGS (Cost Optimized, Fast & Hard-Locked Model)
   ===================================================================== */
const MODEL = 'gemini-3.5-flash-lite'; // Hard-locked: sabse fast aur sasta model
const MAX_ROUNDS = 2;                   // 1 single call; fail hone par sirf 1 retry round
const CALL_TIMEOUT_MS = 12000;          // 12 second timeout
const MAX_OUTPUT_TOKENS = 480;          // 2 to 8 lines ke liye exact token cap
const HISTORY_SIZE = 120;               // Server memory: pichhle 120 reviews track honge
const RECENT_WINDOW = 25;               // Lagatar 25-50 reviews me pattern repeat nahi hoga

/* =====================================================================
   BUSINESS PACK  (Client: Rajlakshmi Restaurant, Varanasi, Uttar Pradesh)
   Pure Veg Family Restaurant | K-Shree Guest House (K-Shree Group Unit)
   Contact: Rajat Keshari | D 38/113 Hauz Katora, Bansphatak Rd, Godowlia, Varanasi
   ===================================================================== */
const OWNER_NAME = process.env.OWNER_NAME || 'Rajat Keshari';
const SHOP_WORD = 'pure veg family restaurant';
const PRODUCT_WORD = 'a veg thali, South Indian breakfast, stuffed parathas or fresh vegetarian meal';

// Menu-based Dish & Category groups (MODEL_SERIES):
const MODEL_SERIES = [
  { n: 'thali|janta thali|normal thali|special thali|south indian thali|punjabi thali', w: 10, variants: [['Special Thali', 4], ['South Indian Thali', 3], ['Punjabi Thali', 3], ['Normal Thali', 2]] },
  { n: 'dosa|masala dosa|paper dosa|onion dosa|idli|uttapam|vada|sambhar|south indian', w: 9,  variants: [['Masala Dosa', 4], ['Butter Uttapam', 3], ['Idli Sambhar', 3], ['Vada Sambhar', 2]] },
  { n: 'paratha|pratha|aloo paratha|paneer paratha|gobhi paratha|matar paratha|tawa roti', w: 8, variants: [['Aloo Paratha', 4], ['Paneer Paratha', 3], ['Ghee Tawa Roti', 3]] },
  { n: 'paneer|kadhai paneer|shahi paneer|paneer butter masala|chilly paneer',          w: 8,  variants: [['Paneer Butter Masala', 4], ['Kadhai Paneer', 3], ['Shahi Paneer', 3]] },
  { n: 'pav bhaji|pakora|spring roll|french fries|chole bhature|chowmein|lassi',        w: 7,  variants: [['Pav Bhaji', 3], ['Chole Bhature', 3], ['Paneer Pakora & Tea', 2], ['Sweet Lassi', 2]] },
];

// Local SEO Keywords (Har review me ek alag keyword naturally inject hoga)
const SEO_KEYWORDS = [
  'pure veg restaurant in Varanasi',
  'best veg thali in Bansphatak Varanasi',
  'family restaurant near Godowlia Varanasi',
  'South Indian restaurant in Varanasi',
  'veg restaurant in Hauz Katora Varanasi',
  'best dosa and thali near Kashi Vishwanath',
  'budget family restaurant in Varanasi',
  'pure vegetarian food in Godowlia Varanasi',
  'breakfast and lunch restaurant in Bansphatak',
  'best paratha and thali in Varanasi',
  'veg restaurant near Bansphatak Road Varanasi',
  'hygienic vegetarian restaurant in Varanasi',
  'South Indian breakfast in Godowlia Varanasi',
  'homely veg food in Varanasi Uttar Pradesh',
  'best restaurant near Hauz Katora Varanasi',
  'affordable veg thali in Varanasi',
  'pure veg dining near Dashashwamedh Ghat',
  'family dining restaurant in Bansphatak Varanasi',
];

const KEYWORD_PLACEMENTS = [
  'in the first half of the review (never as the very first words)',
  'somewhere naturally in the middle of the review',
  'near the end of the review',
  'wherever it blends most naturally into a sentence',
];

// Topics: id, prompt text, aur check regex
const TOPICS = {
  location: {
    id: 'location',
    text: 'the convenient location: easy to reach at Hauz Katora on Bansphatak Road near Godowlia (in front of Hari Chasma Wale), great stop near Kashi Vishwanath temple area',
    must: /varanasi|banaras|kashi|bansphatak|godowlia|hauz katora|hari chasma|temple|vishwanath|location|easy to find|area|ghat/i,
  },
  thali: {
    id: 'thali',
    text: 'wholesome veg thalis: tried their Special Thali, Normal Thali, South Indian Thali or Punjabi Thali — filling portions, fresh rotis, dal, sabzi and comforting homemade taste',
    must: /thali|janta|normal|special|punjabi|roti|dal|sabzi|rice|raita|papad|meal|filling|pet bhar|plate/i,
  },
  south_indian: {
    id: 'south_indian',
    text: 'South Indian dishes: crisp Masala Dosa, Paper Dosa, soft Idli, Vada Sambhar or Butter Uttapam served hot with fresh sambhar and chutney',
    must: /dosa|masala dosa|paper|onion dosa|idli|uttapam|vada|sambhar|sambar|chutney|south indian|crispy|crisp/i,
  },
  paratha_roti: {
    id: 'paratha_roti',
    text: 'stuffed parathas and hot tawa rotis: freshly made Aloo Paratha, Paneer Paratha, Gobhi Paratha and Ghee Tawa Roti straight off the tawa',
    must: /paratha|pratha|aloo|paneer paratha|gobhi|matar|tawa|roti|ghee|stuffed|hot|fresh/i,
  },
  paneer_sabji: {
    id: 'paneer_sabji',
    text: 'rich paneer and veg gravies: flavourful Paneer Butter Masala, Kadhai Paneer, Shahi Paneer or Mix Veg with jeera rice or rotis',
    must: /paneer|kadhai|shahi|butter masala|mix veg|sabzi|sabji|gravy|jeera rice|pulav|curry/i,
  },
  snacks_drinks: {
    id: 'snacks_drinks',
    text: 'evening snacks and drinks: hot Pav Bhaji, Paneer Pakora, Chole Bhature, Veg Chowmein, Tea, Coffee or refreshing Lassi and Buttermilk',
    must: /pav bhaji|pakora|spring roll|fries|chole|bhature|chowmein|tea|chai|coffee|lassi|buttermilk|snack|snacks|breakfast/i,
  },
  pure_veg_hygiene: {
    id: 'pure_veg_hygiene',
    text: 'pure vegetarian and clean dining: 100% pure veg kitchen, neat seating and freshly cooked food without heavy excess oil',
    must: /pure veg|veg|vegetarian|clean|hygien|neat|fresh|freshly|safai|saaf|light|healthy|kitchen/i,
  },
  homely_taste: {
    id: 'homely_taste',
    text: 'comforting homely taste: tastes just like fresh ghar ka khana, mild balanced spices that suit both locals and pilgrims visiting Varanasi',
    must: /home|homely|ghar|taste|tasty|delicious|swad|swadisht|spice|spices|masala|light|comfort|fresh/i,
  },
  pricing: {
    id: 'pricing',
    text: 'pocket-friendly pricing: very reasonable rates for thalis, dosas and meals, honest value for money in the heart of Varanasi (do not mention exact rupee numbers)',
    must: /price|pricing|rate|rates|daam|paise|budget|pocket|value|worth|reasonable|fair|affordable|sasta|economical/i,
  },
  service: {
    id: 'service',
    text: 'quick and polite service: warm hospitality, attentive staff and food served hot without long waiting time',
    must: /service|staff|owner|rajat|behav|polite|friendly|quick|fast|hot|hospitality|welcome|attend|nature/i,
  },
  family_pilgrims: {
    id: 'family_pilgrims',
    text: 'ideal for families and yatris: peaceful, comfortable family restaurant in Varanasi where elders and kids can eat comfortably after darshan',
    must: /family|families|darshan|yatri|yatris|pilgrim|trip|visit|tour|tourist|elders|kids|parents|comfortable/i,
  },
  breakfast_to_dinner: {
    id: 'breakfast_to_dinner',
    text: 'all-day dining convenience: open from morning breakfast (dosa, idli, paratha, tea) through lunch thalis and dinner',
    must: /morning|breakfast|lunch|dinner|evening|timing|timings|open|all day|anytime|subah|raat/i,
  },
  guest_house: {
    id: 'guest_house',
    text: 'great stay-and-dine comfort: located with K-Shree Guest House in Bansphatak, super convenient for travellers staying nearby',
    must: /guest house|k-shree|stay|traveller|traveler|convenient|nearby|walk|walking|bansphatak/i,
  },
  repeat: {
    id: 'repeat',
    text: 'coming back multiple times during our Varanasi visit: loved the first meal so much that we returned for breakfast and dinner again',
    must: /again|twice|daily|every day|multiple|regular|repeat|dobara|phir|fir|bar|baar|next day/i,
  },
  owner: {
    id: 'owner',
    text: 'welcoming host and management: courteous, helpful management by Rajat Keshari and team who make guests feel right at home',
    must: /owner|rajat|host|management|staff|polite|courteous|helpful|kind|respect|nature|vyavhar/i,
  },
};

// Frontend page.js ke exact chip labels (bilkul same honge)
const CHIPS = {
  'Pure Veg': {
    id: 'chip_pureveg',
    text: '100% pure vegetarian food cooked fresh with clean and hygienic preparation',
    must: /pure veg|veg|vegetarian|clean|hygien|fresh|safai|saaf/i,
  },
  'Special Thali': {
    id: 'chip_thali',
    text: 'wholesome, filling Special Thali, Normal Thali, South Indian Thali or Punjabi Thali with fresh rotis, dal, sabzi and rice',
    must: /thali|janta|normal|special|punjabi|roti|dal|sabzi|rice|raita|papad|filling/i,
  },
  'South Indian': {
    id: 'chip_southindian',
    text: 'crispy Masala Dosa, Paper Dosa, soft Idli, Vada Sambhar and Butter Uttapam with fresh sambhar and chutney',
    must: /dosa|masala dosa|paper|idli|uttapam|vada|sambhar|sambar|chutney|south indian/i,
  },
  'Stuffed Parathas': {
    id: 'chip_paratha',
    text: 'hot stuffed Aloo Paratha, Paneer Paratha, Gobhi Paratha and Ghee Tawa Roti',
    must: /paratha|pratha|aloo|paneer paratha|gobhi|matar|tawa|roti|ghee|stuffed/i,
  },
  'Paneer Dishes': {
    id: 'chip_paneer',
    text: 'rich, flavourful Paneer Butter Masala, Kadhai Paneer, Shahi Paneer and Mix Veg',
    must: /paneer|kadhai|shahi|butter masala|mix veg|sabzi|sabji|gravy/i,
  },
  'Snacks & Lassi': {
    id: 'chip_snacks',
    text: 'tasty Pav Bhaji, Chole Bhature, Paneer Pakora, Tea, Coffee and thick refreshing Lassi',
    must: /pav bhaji|pakora|spring roll|fries|chole|bhature|chowmein|tea|chai|coffee|lassi|buttermilk|snack/i,
  },
  'Homely Taste': {
    id: 'chip_homely',
    text: 'comforting ghar-jaisa taste with balanced spices that feels light and fresh',
    must: /home|homely|ghar|taste|tasty|delicious|swad|swadisht|light|fresh/i,
  },
  'Pocket Friendly': {
    id: 'chip_price',
    text: 'very affordable, pocket-friendly pricing with generous portions and great value',
    must: /price|pricing|rate|rates|daam|paise|budget|pocket|value|worth|reasonable|fair|affordable|sasta/i,
  },
  'Quick Service': {
    id: 'chip_service',
    text: 'fast, polite service with hot food served promptly and courteous staff',
    must: /service|staff|owner|rajat|behav|polite|friendly|quick|fast|hot|hospitality|attend/i,
  },
  'Family Friendly': {
    id: 'chip_family',
    text: 'clean, peaceful family dining atmosphere suitable for elders, kids and pilgrims',
    must: /family|families|darshan|yatri|pilgrim|elders|kids|parents|comfortable|clean|neat|peaceful/i,
  },
  'Bansphatak Varanasi': {
    id: 'chip_location',
    text: 'a convenient restaurant in Hauz Katora, Bansphatak Road near Godowlia in Varanasi',
    must: /varanasi|banaras|kashi|bansphatak|godowlia|hauz katora|hari chasma|temple|vishwanath|location|area/i,
  },
};

const ALL_TOPICS = [
  'location', 'thali', 'south_indian', 'paratha_roti', 'paneer_sabji', 'snacks_drinks',
  'pure_veg_hygiene', 'homely_taste', 'pricing', 'service', 'family_pilgrims',
  'breakfast_to_dinner', 'guest_house', 'repeat', 'owner',
];

// Socio-Economic Class Matrix (Varanasi locals + Kashi pilgrims/tourists diversity)
const PERSONAS = [
  { id: 'pilgrim_family', cls: 'middle', text: 'a family visiting Varanasi for Kashi Vishwanath darshan who wanted clean, pure veg food for elders and kids, warm and relieved tone' },
  { id: 'local_varanasi', cls: 'mass', text: 'a local resident from Godowlia / Bansphatak Varanasi, speaks plain and natural, short sentences, a little loose grammar is fine' },
  { id: 'solo_traveller', cls: 'upper', text: 'a solo traveller exploring Banaras ghats who stopped here for breakfast or lunch, clear, appreciative and relaxed tone' },
  { id: 'south_indian_lover', cls: 'middle', text: 'someone who craved good Masala Dosa, Idli and Sambhar in Varanasi and was happily surprised by the taste, genuine and upbeat' },
  { id: 'student', cls: 'mass', text: 'a college student in Varanasi looking for a filling, pocket-friendly thali or chole bhature, casual and straightforward' },
  { id: 'senior_yatri', cls: 'middle', text: 'an older respectful pilgrim (uncle ji or aunty ji), polite, simple words, appreciates light non-oily pure veg food and respectful staff' },
  { id: 'corporate_visitor', cls: 'upper', text: 'a working professional visiting Varanasi on work who ate dinner here, calm, crisp and practical tone' },
  { id: 'couple_tourists', cls: 'upper', text: 'a couple on a Varanasi trip who tried stuffed parathas, paneer and lassi here, warm, natural and descriptive' },
  { id: 'blunt', cls: 'mass', text: 'a straightforward no-nonsense diner, few words, says only what mattered about taste and price' },
  { id: 'morning_walker', cls: 'middle', text: 'someone who came early morning after temple darshan for hot tea, aloo paratha and idli sambhar, fresh and satisfied tone' },
  { id: 'group_friends', cls: 'middle', text: 'someone visiting Varanasi with friends who ordered Special Thali, Pav Bhaji and Cold Drinks together, lively and honest' },
  { id: 'regular', cls: 'middle', text: 'a regular customer in Bansphatak area who eats here often because the quality and hygiene never drop, trusting tone' },
];

const WRITING_STYLES = [
  'neat spelling and proper grammar',
  'casual WhatsApp-style typing, relaxed',
  'all small letters, casual typing, no capital letters',
  'simple and direct everyday typing',
];

const HINGLISH_LEVELS = [
  'mostly Hindi words, only a few English words like thali, dosa, pure veg, service, price',
  'half Hindi, half English words',
  'Hindi grammar but many common English words mixed in',
];

const OPENERS = [
  'start with what you ordered (thali, dosa, paratha or snacks)',
  'start with visiting after Kashi Vishwanath darshan or exploring Godowlia / Bansphatak',
  'start with how clean and pure veg the place felt',
  'start with the homely taste and freshness of the food',
  'start with the reasonable pricing and generous portions',
  'start in the middle of a thought, casually',
  'start with the quick and polite service from the staff',
  'start with your plain verdict in your own words',
  'start by mentioning its easy location near Hauz Katora / Bansphatak Road',
  'start with a simple statement about having breakfast, lunch or dinner here',
  'start with how difficult it can be to find clean family veg food near the temple area until you found this spot',
  'start with your overall dining experience in Varanasi',
];

// Middle-Part Story Diversity: beech ka flow har review me alag rahe
const MIDDLE_FLOWS = [
  'mention how fresh and hot the rotis, dal, sabzi or dosas arrived right at the table',
  'highlight that the spices felt balanced and homely — not overly oily or heavy on the stomach',
  'describe the generous portion size of the Special Thali or South Indian Thali at a very honest rate',
  'talk about how polite and attentive the staff and host were even during busy meal hours',
  'mention that the pure vegetarian kitchen and neat seating made the whole family comfortable',
  'focus on how convenient the location is on Bansphatak Road near Godowlia for a quick, satisfying meal',
];

const ENDINGS = [
  'end with a small heartfelt thanks',
  'end by saying you would recommend it to anyone visiting Varanasi',
  'end by saying you will definitely eat here again on your next Banaras trip',
  'end with a short plain remark about leaving full and happy',
  'end with one line about it being a dependable pure veg restaurant near Godowlia',
  'just stop naturally after your last point, no wrap-up line',
];

const BUYER_LINES = [
  'You ordered a Special Thali for lunch.',
  'You came for morning breakfast and ordered Masala Dosa, Idli Sambhar and tea.',
  'You ordered stuffed Aloo Paratha, Paneer Butter Masala and sweet Lassi.',
  'You stopped by in the evening for Pav Bhaji, Paneer Pakora and coffee.',
  'You had a Punjabi Thali and South Indian Thali with your family.',
];

// 2 crisp tone samples per language (input tokens bachane ke liye concise rakha hai)
const EXAMPLES = {
  ENGLISH: [
    'Stopped here on Bansphatak Road after morning darshan and ordered a Special Thali and Masala Dosa, everything came out hot, light on spices and genuinely homely.',
    'Clean pure veg spot near Godowlia with pocket-friendly rates, the paneer parathas and sweet lassi were fresh and the staff served us quickly',
  ],
  HINGLISH: [
    'darshan ke baad bansphatak road par pure veg khana dhundh rahe the, yahan ki special thali aur masala dosa dono bilkul ghar jaise aur garam mile.',
    'godowlia ke paas family ke saath baithne ke liye saaf suthri jagah hai, rate bhi pocket friendly hai aur service kaafi fast hai',
  ],
};

/* =====================================================================
   ENGINE  (Locked Core Engine)
   ===================================================================== */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const chance = (p) => Math.random() < p;
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const countWords = (t) => t.split(/\s+/).filter(Boolean).length;

function pickWeighted(items) {
  const total = items.reduce((s, i) => s + i.w, 0);
  let r = Math.random() * total;
  for (const i of items) {
    if ((r -= i.w) <= 0) return i;
  }
  return items[0];
}

function pickModel(recentModels) {
  const flat = [];
  for (const sr of MODEL_SERIES) {
    const total = sr.variants.reduce((a, v) => a + v[1], 0);
    for (const [name, vw] of sr.variants) {
      if (recentModels.includes(name)) continue;
      flat.push({ name, series: sr.n, w: sr.w * (vw / total) });
    }
  }
  return pickWeighted(flat.length ? flat : [{ name: MODEL_SERIES[0].variants[0][0], series: MODEL_SERIES[0].n, w: 1 }]);
}

/* ---- 60-20-20 Weighted Random Length System (2 to 8 Lines) ----
   - 20% Short  (2 to 3 lines) -> w: 10 + 10 = 20
   - 60% Medium (4 to 5 lines) -> w: 32 + 28 = 60
   - 20% Long   (6 to 8 lines) -> w: 9 + 7 + 4 = 20 */
const LENGTHS = [
  { w: 10, lines: 2, min: 13, max: 21, rule: 'TWO lines, about 14 to 20 words' },
  { w: 10, lines: 3, min: 21, max: 31, rule: 'THREE lines, about 22 to 30 words' },
  { w: 32, lines: 4, min: 30, max: 42, rule: 'FOUR lines, about 32 to 40 words' },
  { w: 28, lines: 5, min: 40, max: 54, rule: 'FIVE lines, about 42 to 52 words' },
  { w: 9,  lines: 6, min: 50, max: 66, rule: 'SIX lines, about 52 to 64 words' },
  { w: 7,  lines: 7, min: 58, max: 78, rule: 'SEVEN lines, about 60 to 75 words' },
  { w: 4,  lines: 8, min: 66, max: 90, rule: 'EIGHT lines, about 68 to 86 words' },
];

function chooseLength(recent, minLines = 2) {
  const lastTwo = recent.map((r) => r.lines).filter(Boolean).slice(-2);
  let pool = LENGTHS.filter((x) => x.lines >= minLines);

  const fresh = pool.filter((x) => !lastTwo.includes(x.lines));
  if (fresh.length) pool = fresh;

  return pickWeighted(pool);
}

function choosePersona(recent) {
  const lastVoices = recent.map((r) => r.voice).filter(Boolean).slice(-12);
  const lastClass = recent.map((r) => r.cls).filter(Boolean).slice(-2);

  let pool = PERSONAS.filter((v) => !lastVoices.includes(v.id));
  if (lastClass.length === 2 && lastClass[0] === lastClass[1]) {
    const diffClass = pool.filter((v) => v.cls !== lastClass[1]);
    if (diffClass.length) pool = diffClass;
  }
  return pick(pool.length ? pool : PERSONAS);
}

function chooseTopic(recent) {
  const last = recent.map((r) => r.topic).filter(Boolean).slice(-12);
  const pool = ALL_TOPICS.filter((t) => !last.includes(t));
  return TOPICS[pick(pool.length ? pool : ALL_TOPICS)];
}

// Customer ne jo chips chune unhe random order me shuffle karke lo
function chosenChips(body) {
  const labels = Array.isArray(body.selectedChips) ? body.selectedChips : [];
  const valid = labels.filter((l) => typeof l === 'string' && CHIPS[l]).slice(0, 3);
  return shuffle(valid).map((l) => ({ label: l, ...CHIPS[l] }));
}

function chooseFrom(list, key, recent, n = 8) {
  const last = recent.map((r) => r[key]).filter((v) => v !== undefined && v !== null).slice(-n);
  const pool = list.filter((x) => !last.includes(x));
  return pick(pool.length ? pool : list);
}

const SERVER_KWS = [];

function chooseKeyword(recent) {
  let used = recent.map((r) => r.seo).filter(Boolean).slice(-15);
  if (!used.length) used = SERVER_KWS.slice(-15);
  const pool = SEO_KEYWORDS.filter((k) => !used.includes(k));
  return pick(pool.length ? pool : SEO_KEYWORDS);
}

const BANNED_OPENINGS = [
  'Great', 'Best', 'Amazing', 'Excellent', 'Highly recommend', 'Bhai', 'Superb', 'Awesome', 'The staff here',
  'Outstanding', 'Fantastic', 'Wonderful', 'Perfect', 'Must visit', 'Trust me',
];

const AI_PHRASES = /seamless|hassle[- ]free|top[- ]notch|look no further|go-to|game[- ]changer|one[- ]stop|unparalleled|exceptional|impeccable|commendable|must[- ]visit|highly recommended|hands down|truly|delighted|kudos|—|–/i;

const DANGLING = new Set([
  'to', 'aur', 'ki', 'ke', 'ka', 'se', 'me', 'mein', 'par', 'pe', 'ko', 'toh',
  'and', 'but', 'the', 'a', 'an', 'of', 'in', 'on', 'for', 'with', 'at', 'that',
  'so', 'if', 'or', 'because', 'jo', 'jab', 'agar', 'lekin', 'ya', 'jaise', 'kyunki',
]);

const HINDI_WORDS = new Set([
  'hai', 'hain', 'nahi', 'nahin', 'bahut', 'bohot', 'bhot', 'mera', 'meri', 'mere', 'mujhe', 'hume',
  'aur', 'ki', 'ke', 'ka', 'ko', 'se', 'par', 'pe', 'tha', 'thi', 'kiya', 'mila', 'mil', 'gaya', 'gayi',
  'liya', 'wala', 'wale', 'jo', 'kaafi', 'accha', 'acha', 'achha', 'sach', 'yahan', 'yaha', 'kar', 'karke', 'raha',
  'rahe', 'rahi', 'laga', 'lagi', 'bilkul', 'ekdum', 'sab', 'kuch', 'koi', 'phir', 'fir', 'bhi', 'toh', 'lekin',
  'isliye', 'abhi', 'dekh', 'dekha', 'diya', 'dikhaya', 'samjhaya', 'sahi', 'khana', 'khaana', 'aap', 'aapne',
  'paise', 'kam', 'jyada', 'zyada', 'badhiya', 'mast', 'yaar', 'mein', 'yeh', 'ye', 'woh', 'wo', 'ne', 'hu', 'hun', 'tak', 'wahan', 'sabse',
]);

const KW_STOP_WORDS = new Set([
  'restaurant', 'veg', 'pure', 'vegetarian', 'food', 'varanasi', 'bansphatak', 'godowlia',
  'hauz', 'katora', 'uttar', 'pradesh', 'best', 'near', 'in', 'and', 'for', 'family',
]);

/* ------------------ Memory & 50-Review Anti-Repetition ------------------ */
const HISTORY = [];
const HITS = new Map();

const openingOf = (text) => text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean).slice(0, 3).join(' ');
const wordSet = (t) =>
  new Set(
    t
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !KW_STOP_WORDS.has(w))
  );

function tooSimilar(text, recentOpenings) {
  const open = openingOf(text);
  if (recentOpenings.includes(open)) return true;
  const ws = wordSet(text);
  for (const h of HISTORY) {
    if (h.open === open) return true;
    if (ws.size < 7 || h.ws.size < 7) continue;
    let inter = 0;
    for (const w of ws) if (h.ws.has(w)) inter++;
    const union = ws.size + h.ws.size - inter || 1;
    if (inter / union > 0.36) return true; // Strict 36% similarity limit across last 120 reviews
  }
  return false;
}

function remember(text) {
  HISTORY.push({ open: openingOf(text), ws: wordSet(text) });
  while (HISTORY.length > HISTORY_SIZE) HISTORY.shift();
}

function rateLimited(request) {
  const ip = (request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const arr = (HITS.get(ip) || []).filter((t) => now - t < 5 * 60 * 1000);
  arr.push(now);
  HITS.set(ip, arr);
  if (HITS.size > 2000) {
    for (const [k, v] of HITS) if (!v.some((t) => now - t < 5 * 60 * 1000)) HITS.delete(k);
  }
  return arr.length > 35; // 5 minute me 35 requests allowed
}

/* ------------------ Auto-Repair & Cleaning Pipeline ------------------ */
function scrubRobotic(text) {
  const startedUpper = /^[A-Z]/.test(text);
  let t = text
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/\btruly\s+/gi, '')
    .replace(/\bseamless(ly)?\b/gi, (m, ly) => (ly ? 'smoothly' : 'smooth'))
    .replace(/\bhassle[- ]free\b/gi, 'easy')
    .replace(/\btop[- ]notch\b/gi, 'very good')
    .replace(/\bexceptional(ly)?\b/gi, (m, ly) => (ly ? 'very' : 'very good'))
    .replace(/\bimpeccabl(e|y)\b/gi, (m, e) => (e === 'y' ? 'very well' : 'very good'))
    .replace(/\bcommendable\b/gi, 'good')
    .replace(/\bunparalleled\b/gi, 'very good')
    .replace(/\bgo-to\b/gi, 'favourite')
    .replace(/\bgame[- ]changer\b/gi, 'big plus')
    .replace(/\bone[- ]stop\b/gi, 'complete')
    .replace(/\bmust[- ]visit\b/gi, 'worth visiting')
    .replace(/\bhighly recommended\b/gi, 'recommended')
    .replace(/\bhands down,?\s*/gi, '')
    .replace(/\bdelighted\b/gi, 'happy')
    .replace(/\bkudos( to)?\b/gi, (m, to) => (to ? 'thanks to' : 'thanks'));
  t = t.replace(/\s{2,}/g, ' ').replace(/\s+([.,])/g, '$1').trim();
  if (startedUpper && /^[a-z]/.test(t)) t = t[0].toUpperCase() + t.slice(1);
  return t;
}

function cleanReview(text, useFullStop) {
  let t = text
    .replace(/[*#]/g, '')
    .replace(/^["'`\s]+|["'`\s]+$/g, '')
    .replace(/\s*\n+\s*/g, ' ')
    .replace(/[—–]/g, ', ');

  if (useFullStop) {
    t = t
      .replace(/!+/g, '.')
      .replace(/\.{2,}|…/g, '.')
      .replace(/\s+([.,])/g, '$1')
      .replace(/\.(?=[A-Za-z])/g, '. ')
      .replace(/\.\s*\./g, '.')
      .replace(/,\s*\./g, '.');
  } else {
    t = t
      .replace(/!+/g, ',')
      .replace(/\.{2,}|…/g, ' ')
      .replace(/\.\s+/g, ', ')
      .replace(/\.+$/g, '');
  }

  return t
    .replace(/,\s*,/g, ',')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function fixCutOff(text) {
  let parts = text.trim().replace(/[,\-\s]+$/g, '').split(/\s+/);
  while (parts.length > 5) {
    const last = parts[parts.length - 1].toLowerCase().replace(/[^a-z]/g, '');
    if (!DANGLING.has(last)) break;
    parts.pop();
    parts = parts.join(' ').replace(/[,\-\s]+$/g, '').split(/\s+/);
  }
  return parts.join(' ');
}

function trimToLimit(text, maxWords, stillOk) {
  const m = text.match(/^([\s\S]*?)([\s\uFE0F\u200D\p{Extended_Pictographic}]*)$/u);
  const core = m ? m[1].trim() : text;
  const tail = m ? m[2].trim() : '';
  const sentences = core.split(/(?<=[.,])\s+/).filter(Boolean);

  while (countWords(sentences.join(' ')) > maxWords && sentences.length > 2) {
    let removed = false;
    for (let i = sentences.length - 1; i >= 1; i--) {
      const test = sentences.filter((_, j) => j !== i).join(' ');
      if (!stillOk(test)) continue;
      sentences.splice(i, 1);
      removed = true;
      break;
    }
    if (!removed) break;
  }
  const out = sentences.join(' ');
  return tail ? `${out} ${tail}` : out;
}

function finalizeReview(text, useFullStop) {
  const m = text.match(/^([\s\S]*?)([\s\p{Extended_Pictographic}\uFE0F\u200D]*)$/u);
  let core = (m ? m[1] : text).replace(/[,;:\-\s]+$/g, '').trim();
  const tail = (m ? m[2] : '').replace(/\s+/g, '');

  if (useFullStop) {
    if (!/\.$/.test(core)) core += '.';
  } else {
    core = core.replace(/\.+$/g, '').trim();
  }
  return tail ? `${core} ${tail}` : core;
}

function looksCutOff(text) {
  const last = text.split(/\s+/).pop().toLowerCase().replace(/[^a-z]/g, '');
  return DANGLING.has(last) || /[,\-]$/.test(text.trim());
}

function hindiCount(text) {
  return text.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter((w) => HINDI_WORDS.has(w)).length;
}

function languageOk(text, language, words) {
  const h = hindiCount(text);
  if (language === 'HINGLISH') return h >= Math.max(2, Math.floor(words * 0.18));
  return h <= 2;
}

function startsBanned(text) {
  const t = text.trim().toLowerCase();
  return BANNED_OPENINGS.some((b) => t.startsWith(b.toLowerCase()));
}

/* ------------------ Compressed Prompt Builder ------------------ */
function buildPrompt(body, recent) {
  const language = body.language === 'HINGLISH' ? 'HINGLISH' : 'ENGLISH';
  const businessName = String(body.businessName || '').slice(0, 120);
  const category = String(body.category || '').slice(0, 200);
  const description = String(body.description || '').slice(0, 600);
  const city = String(body.city || '').slice(0, 120);

  const recentModels = recent.map((r) => r.model).filter(Boolean).slice(-6);
  const chips = chosenChips(body);
  const hasDishChip = chips.some((c) =>
    ['chip_thali', 'chip_southindian', 'chip_paratha', 'chip_paneer', 'chip_snacks'].includes(c.id)
  );
  const picked = !hasDishChip && chance(0.58) ? pickModel(recentModels) : null;
  const model = picked ? picked.name : null;

  const minLines = chips.length >= 3 ? 4 : 2;
  const length = chooseLength(recent, minLines);
  const persona = choosePersona(recent);

  // Random topic + bonus secondary topic for longer reviews (4+ lines) so 50 reviews never repeat
  const primaryTopic = chips.length
    ? { id: chips[0].id, text: chips[0].text, must: chips[0].must }
    : chooseTopic(recent);
  const extraChips = chips.slice(1);

  let bonusTopic = null;
  if (!extraChips.length && length.lines >= 4 && chance(0.65)) {
    const candidate = chooseTopic([...recent, { topic: primaryTopic.id }]);
    if (candidate.id !== primaryTopic.id) bonusTopic = candidate;
  }

  const opener = chooseFrom(OPENERS, 'opener', recent, 9);
  const middleFlow = chooseFrom(MIDDLE_FLOWS, 'mid', recent, 5);
  const ending = chooseFrom(ENDINGS, 'ending', recent, 5);

  const hasSpellingSlip = chance(0.10); // 10% natural spelling slip
  const style = hasSpellingSlip
    ? 'casual WhatsApp typing with 1 or 2 natural human spelling slips (like real people typing fast on phone)'
    : pick(WRITING_STYLES);
  const useFullStop = chance(0.80); // 80% full stop, 20% without full stop
  const hinglishLevel = pick(HINGLISH_LEVELS);
  const buyerLine = length.lines >= 3 && chance(0.5) ? pick(BUYER_LINES) + ' ' : '';

  const mentionName = length.lines >= 3 && chance(0.4);
  const mentionStaff = length.lines >= 3 && (primaryTopic.id === 'owner' ? chance(0.45) : chance(0.14));
  const useEmoji = chance(0.08);

  // Mandatory unique SEO keyword in every review (rotated across last 15 reviews)
  const seo = chooseKeyword(recent);
  const kwPlacement = pick(KEYWORD_PLACEMENTS);

  const languageBlock =
    language === 'HINGLISH'
      ? `LANGUAGE: HINGLISH = Hindi sentences typed in Roman/English letters like a Varanasi / UP person on WhatsApp. Level: ${hinglishLevel}. Hindi grammar (hai, tha, kiya, mila, nahi, bahut, aur, ke liye). Food/menu/SEO words can stay in English. Never write a full English sentence. No Devanagari.`
      : `LANGUAGE: Simple natural Indian English. Do not use Hindi words.`;

  const examples = shuffle(EXAMPLES[language]).map((e) => `- ${e}`).join('\n');

  const punctuationRule = useFullStop
    ? `- FULL STOPS: End every sentence with a full stop (.) and end the review with a full stop (.). No exclamation marks or dashes.`
    : `- NO FULL STOPS: Do NOT use a full stop (.) anywhere. Use commas, "aur"/"and", or natural flow.`;

  const prompt = `${languageBlock}

You are ${persona.text}. ${buyerLine}You ate at this ${SHOP_WORD} for ${PRODUCT_WORD} and are writing a Google Maps review.
Business: ${businessName} (${city}) | ${category}
About: ${description}

Tone samples (feel only, never copy words/structure):
${examples}

THIS REVIEW:
- Main topic: ${primaryTopic.text}.
${extraChips.length ? `- ALSO cover these selected points: ${extraChips.map((c) => c.text).join('; ')}.` : bonusTopic ? `- Also weave in a short natural mention of ${bonusTopic.text}.` : '- Keep it focused on the main topic.'}
- Style: ${style}.
- Opening: ${opener}.
${length.lines >= 4 ? `- Middle flow: ${middleFlow}.` : ''}
${length.lines >= 3 ? `- Ending: ${ending}.` : ''}
- Length: ${length.rule}. Stay strictly inside this word count.
- SEO KEYWORD (MANDATORY): Naturally include the phrase "${seo}" ${kwPlacement}.
${mentionName ? `- Mention "${businessName}" once naturally.` : '- Do not repeat the full restaurant name.'}
${model ? `- You may mention ${model}.` : ''}
${mentionStaff ? `- Mention "${OWNER_NAME}" once naturally.` : '- Do not name any person.'}
${useEmoji ? '- One emoji at the very end is allowed.' : '- No emojis.'}

RULES:
- ONE single paragraph. No line breaks, bullets, or title.
${punctuationRule}
- Never start with: ${BANNED_OPENINGS.join(', ')}.
- Sound like a real human diner praising from the heart, not an ad. No hashtags, slogans, keyword stuffing, or heavy marketing words.
- No fake facts: strictly pure vegetarian food only (never mention non-veg), no other restaurant names, no exact rupee menu prices or bill amounts, no fake discount percentages.
- Complete thought only. Output ONLY the review text.`;

  return { prompt, length, persona, topic: primaryTopic, extraChips, opener, middleFlow, ending, seo, model, language, useFullStop };
}

async function callGemini(apiKey, payload, signal) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    }
  );
  const data = await res.json();
  return { res, data };
}

/* ------------------ Single-Shot Attempt + Auto-Repair ------------------ */
async function attempt(apiKey, body, recent, signal, strict = true) {
  const built = buildPrompt(body, recent);
  const { prompt, length, persona, topic, extraChips, opener, middleFlow, ending, seo, model, language, useFullStop } = built;

  const payload = {
    contents: [{ role: 'user', parts: [{ text: `Write the review for ${body.businessName} now.` }] }],
    systemInstruction: { parts: [{ text: prompt }] },
    generationConfig: {
      temperature: 1.0,
      topP: 0.95,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    },
  };

  try {
    const { res, data } = await callGemini(apiKey, payload, signal);
    if (!res.ok) return { ok: false, error: data?.error?.message || 'Gemini API request failed.' };

    const candidate = data.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    const raw = parts.filter((p) => !p.thought).map((p) => p.text || '').join('');
    const usage = data.usageMetadata;

    if (!raw.trim()) return { ok: false, error: 'Empty response from Gemini.' };
    if (candidate?.finishReason === 'MAX_TOKENS') return { ok: false, error: 'Response was cut off.' };

    // Auto-repair pipeline (prevents wasteful Round 2 API calls)
    let review = scrubRobotic(raw);
    review = fixCutOff(cleanReview(review, useFullStop));
    if (looksCutOff(review)) return { ok: false, error: 'Review ended mid-sentence.' };

    const stillOk = (t) => topic.must.test(t) && extraChips.every((c) => c.must.test(t));

    let words = countWords(review);
    if (words > length.max + 5) {
      review = trimToLimit(review, length.max + 3, stillOk);
      words = countWords(review);
    }

    review = finalizeReview(review, useFullStop);
    words = countWords(review);

    const maxAllowed = length.max + (strict ? 8 : 16);
    const minAllowed = Math.floor(length.min * (strict ? 0.72 : 0.60));

    if (words > maxAllowed) return { ok: false, error: 'Review too long.' };
    if (words < minAllowed) return { ok: false, error: 'Review too short.' };
    if (/[\u0900-\u097F]/.test(review)) return { ok: false, error: 'Devanagari used.' };
    if (AI_PHRASES.test(review)) return { ok: false, error: 'Robotic phrase used.' };
    if (startsBanned(review)) return { ok: false, error: 'Banned opening used.' };
    if (!languageOk(review, language, words)) return { ok: false, error: 'Wrong language style.' };
    if (!topic.must.test(review)) return { ok: false, error: 'Review missed the selected topic.' };
    if (extraChips.some((c) => !c.must.test(review))) return { ok: false, error: 'Review missed a selected keyword.' };

    const recentOpenings = recent.map((r) => r.open).filter(Boolean);
    if (tooSimilar(review, recentOpenings)) return { ok: false, error: 'Too similar to an earlier review.' };

    return {
      ok: true,
      review,
      usage,
      meta: {
        lines: length.lines,
        voice: persona.id,
        cls: persona.cls,
        topic: topic.id,
        opener,
        mid: middleFlow,
        ending,
        seo,
        model: model || null,
        open: openingOf(review),
      },
    };
  } catch (e) {
    return {
      ok: false,
      error: e?.name === 'AbortError' ? 'Request timed out.' : e?.message || 'Request failed.',
    };
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key not configured.' }, { status: 500 });
    }
    if (rateLimited(request)) {
      return NextResponse.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 });
    }

    const recent = (Array.isArray(body.recentLengths) ? body.recentLengths : [])
      .filter((r) => r && typeof r === 'object')
      .slice(-RECENT_WINDOW);

    let lastError = 'Failed to generate review draft.';

    // 1 single call per round; sirf fail/reject hone par Round 2 chalega
    for (let round = 0; round < MAX_ROUNDS; round++) {
      const strict = round === 0;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), CALL_TIMEOUT_MS);

      const result = await attempt(apiKey, body, recent, controller.signal, strict);
      clearTimeout(timer);

      if (result.ok) {
        remember(result.review);
        SERVER_KWS.push(result.meta.seo);
        while (SERVER_KWS.length > SEO_KEYWORDS.length) SERVER_KWS.shift();

        if (result.usage) {
          console.log(
            `[API Cost] ${MODEL} | In: ${result.usage.promptTokenCount} | Out: ${result.usage.candidatesTokenCount} | Total: ${result.usage.totalTokenCount}`
          );
        }
        return NextResponse.json({ review: result.review, meta: result.meta });
      }
      lastError = result.error;
    }

    throw new Error(lastError);
  } catch (error) {
    console.error('API Review Generation Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate review draft.' },
      { status: 500 }
    );
  }
}
