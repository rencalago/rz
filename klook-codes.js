// ============================================================================
// KLOOK WIDGETS: paste your Klook widget codes here, once.
// Every article page reads this file, so you never need to edit the pages.
// ============================================================================
//
// How it works
// - Each article is matched to a place below by its "location" in allPost.js
//   (e.g. "Panglao, Bohol" matches Bohol). If a location names two places
//   ("Cebu and Bohol"), the one named first wins.
// - One Klook widget per article, at most. It sits in the article text, right
//   after the first paragraph that mentions one of the widget's keywords
//   (from the third paragraph on, so it never sits beside the AdSense square).
//   If both widgets match, the keyword that comes first in the article wins.
// - No keyword anywhere in the article: the first widget that has a code goes
//   at the bottom of the article instead.
// - A widget with an empty code (``) is skipped. A place with no codes, or an
//   article whose location matches no place, shows no Klook widget at all.
// - Nationwide stories (location "Philippines") use their section headings
//   instead: the first H2/H3 naming a place with codes gets the widget at the
//   end of that section. "headings" adds extra words for this only.
// - Manual override: put <div class="klook-here"></div> in an article where the
//   widget should go. Optional: data-place="cebu" (any match word) and
//   data-widget="tours" or "activities".
// - The AdSense square at the top of the article is not affected.
//
// To add a place: copy a block below, set its name and "match" words (lower
// case words found in the article's location), and paste the Travelpayouts
// <script ...></script> codes between the backticks.
// Keywords: lower case, include plurals you want matched ("tour" and "tours").

const TOURS_KEYWORDS = [
  "tour", "tours", "sightseeing", "city tour", "day tour", "day trip", "day trips",
  "island hopping", "guided", "tour guide", "landmarks",
];

const ACTIVITIES_KEYWORDS = [
  "activity", "activities", "experience", "experiences", "canyoneering", "snorkel",
  "snorkelling", "snorkeling", "diving", "dive", "whale shark", "whale sharks",
  "zipline", "kayak", "kayaking", "paddleboard", "hike", "hiking", "trek",
  "dolphin", "dolphins", "theme park", "ocean park",
];

export const KLOOK_PLACES = [
  // Not used yet: no Lapu-Lapu articles. city_id 702385 is also on the Manila tours code you sent; check which place it is.
  {
    name: "Lapu-Lapu and Mactan",
    match: ["lapu-lapu", "lapu lapu", "mactan"],
    widgets: [
      { name: "Tours & sightseeing", keywords: TOURS_KEYWORDS, code: `<script async src="https://tpemb.com/content?currency=USD&trs=589478&shmarker=794050&locale=en-US&city_id=702385&category=2&amount=3&powered_by=false&campaign_id=137&promo_id=4497" charset="utf-8"></script>` },
      { name: "Activities & experiences", keywords: ACTIVITIES_KEYWORDS, code: `` },
    ],
  },
  {
    name: "Cebu",
    match: ["cebu", "bantayan", "malapascua", "camotes", "oslob", "moalboal", "badian"],
    widgets: [
      { name: "Tours & sightseeing", keywords: TOURS_KEYWORDS, code: `<script async src="https://tpemb.com/content?currency=USD&trs=589478&shmarker=794050.Cebu-Tours%26Sightseeings&locale=en-US&city_id=97&category=2&amount=3&powered_by=true&campaign_id=137&promo_id=4497" charset="utf-8"></script>` },
      { name: "Activities & experiences", keywords: ACTIVITIES_KEYWORDS, code: `<script async src="https://tpemb.com/content?currency=USD&trs=589478&shmarker=794050.Cebu-Tours%26Sightseeings&locale=en-US&city_id=97&category=3&amount=3&powered_by=true&campaign_id=137&promo_id=4497" charset="utf-8"></script>` },
    ],
  },
  // The activities code you sent is the same as the tours code (category=2). For real activities, change category=2 to category=3 in the second code.
  {
    name: "Dumaguete and Negros Oriental",
    match: ["dumaguete", "negros oriental", "apo island", "sibulan", "bais", "tanjay", "pamplona", "mabinay", "canlaon"],
    // Extra words for headings in nationwide stories ("Negros: a big resort...").
    // Move "negros" to Bacolod once its codes are in, if you prefer.
    headings: ["negros"],
    widgets: [
      { name: "Tours & sightseeing", keywords: TOURS_KEYWORDS, code: `<script async src="https://tpemb.com/content?currency=USD&trs=589478&shmarker=794050.Dumaguete-Tours%26Sightseeings&locale=en-US&city_id=148&category=2&amount=3&powered_by=true&campaign_id=137&promo_id=4497" charset="utf-8"></script>` },
      { name: "Activities & experiences", keywords: ACTIVITIES_KEYWORDS, code: `<script async src="https://tpemb.com/content?currency=USD&trs=589478&shmarker=794050.Dumaguete-Tours%26Sightseeings&locale=en-US&city_id=148&category=2&amount=3&powered_by=true&campaign_id=137&promo_id=4497" charset="utf-8"></script>` },
    ],
  },
  {
    name: "Bohol",
    match: ["bohol", "panglao", "corella", "loboc"],
    widgets: [
      { name: "Tours & sightseeing", keywords: TOURS_KEYWORDS, code: `<script async src="https://tpemb.com/content?currency=USD&trs=589478&shmarker=794050.Bohol-Tours%26Sightseeings&locale=en-US&city_id=144&category=2&amount=3&powered_by=false&campaign_id=137&promo_id=4497" charset="utf-8"></script>` },
      { name: "Activities & experiences", keywords: ACTIVITIES_KEYWORDS, code: `<script async src="https://tpemb.com/content?currency=USD&trs=589478&shmarker=794050.Bohol-Tours%26Sightseeings&locale=en-US&city_id=144&category=3&amount=3&powered_by=false&campaign_id=137&promo_id=4497" charset="utf-8"></script>` },
    ],
  },
  // On hold: both Bacolod codes you sent are the Baguio activities code (city_id 365498). Paste the real Bacolod codes here.
  {
    name: "Bacolod",
    match: ["bacolod"],
    widgets: [
      { name: "Tours & sightseeing", keywords: TOURS_KEYWORDS, code: `` },
      { name: "Activities & experiences", keywords: ACTIVITIES_KEYWORDS, code: `` },
    ],
  },
  {
    name: "Batanes",
    match: ["batanes"],
    widgets: [
      { name: "Tours & sightseeing", keywords: TOURS_KEYWORDS, code: `<script async src="https://tpemb.com/content?currency=USD&trs=589478&shmarker=794050.Batanes-Tours%26Sightseeings&locale=en-US&city_id=309&category=2&amount=3&powered_by=true&campaign_id=137&promo_id=4497" charset="utf-8"></script>` },
      { name: "Activities & experiences", keywords: ACTIVITIES_KEYWORDS, code: `` },
    ],
  },
  // These codes carry the Batanes tracking label; they still work.
  {
    name: "Baguio",
    match: ["baguio"],
    widgets: [
      { name: "Tours & sightseeing", keywords: TOURS_KEYWORDS, code: `<script async src="https://tpemb.com/content?currency=USD&trs=589478&shmarker=794050.Batanes-Tours%26Sightseeings&locale=en-US&city_id=365498&category=2&amount=3&powered_by=true&campaign_id=137&promo_id=4497" charset="utf-8"></script>` },
      { name: "Activities & experiences", keywords: ACTIVITIES_KEYWORDS, code: `<script async src="https://tpemb.com/content?currency=USD&trs=589478&shmarker=794050.Batanes-Tours%26Sightseeings&locale=en-US&city_id=365498&category=3&amount=3&powered_by=true&campaign_id=137&promo_id=4497" charset="utf-8"></script>` },
    ],
  },
  {
    name: "Batangas",
    match: ["batangas", "anilao"],
    widgets: [
      { name: "Tours & sightseeing", keywords: TOURS_KEYWORDS, code: `<script async src="https://tpemb.com/content?currency=USD&trs=589478&shmarker=794050.Batangas-Tours%26Sightseeings&locale=en-US&city_id=472&category=2&amount=3&powered_by=true&campaign_id=137&promo_id=4497" charset="utf-8"></script>` },
      { name: "Activities & experiences", keywords: ACTIVITIES_KEYWORDS, code: `` },
    ],
  },
  {
    name: "Ilocos Region",
    match: ["ilocos", "vigan", "la union", "pangasinan"],
    widgets: [
      { name: "Tours & sightseeing", keywords: TOURS_KEYWORDS, code: `<script async src="https://tpemb.com/content?currency=USD&trs=589478&shmarker=794050&locale=en-US&city_id=10000050&category=2&amount=3&powered_by=false&campaign_id=137&promo_id=4497" charset="utf-8"></script>` },
      { name: "Activities & experiences", keywords: ACTIVITIES_KEYWORDS, code: `<script async src="https://tpemb.com/content?currency=USD&trs=589478&shmarker=794050&locale=en-US&city_id=10000050&category=3&amount=3&powered_by=false&campaign_id=137&promo_id=4497" charset="utf-8"></script>` },
    ],
  },
  {
    name: "Iloilo",
    match: ["iloilo", "guimaras"],
    widgets: [
      { name: "Tours & sightseeing", keywords: TOURS_KEYWORDS, code: `<script async src="https://tpemb.com/content?currency=USD&trs=589478&shmarker=794050&locale=en-US&city_id=481&category=2&amount=3&powered_by=false&campaign_id=137&promo_id=4497" charset="utf-8"></script>` },
      { name: "Activities & experiences", keywords: ACTIVITIES_KEYWORDS, code: `` },
    ],
  },
  // Tours left empty: the tours code you sent (city_id 702385) is the same as the Lapu-Lapu one. Paste the Manila tours code here.
  {
    name: "Manila",
    match: ["manila", "intramuros", "binondo", "taguig", "makati", "bgc", "pasay", "quezon city"],
    widgets: [
      { name: "Tours & sightseeing", keywords: TOURS_KEYWORDS, code: `` },
      { name: "Activities & experiences", keywords: ACTIVITIES_KEYWORDS, code: `<script async src="https://tpemb.com/content?currency=USD&trs=589478&shmarker=794050&locale=en-US&city_id=96&category=3&amount=3&powered_by=false&campaign_id=137&promo_id=4497" charset="utf-8"></script>` },
    ],
  },
  // Tours left empty: the tours code you sent is the Manila activities code (city_id 96). Paste the Palawan tours code here.
  {
    name: "Palawan",
    match: ["palawan", "coron", "el nido", "puerto princesa", "san vicente"],
    widgets: [
      { name: "Tours & sightseeing", keywords: TOURS_KEYWORDS, code: `` },
      { name: "Activities & experiences", keywords: ACTIVITIES_KEYWORDS, code: `<script async src="https://tpemb.com/content?currency=USD&trs=589478&shmarker=794050&locale=en-US&city_id=121&category=3&amount=3&powered_by=false&campaign_id=137&promo_id=4497" charset="utf-8"></script>` },
    ],
  },
  {
    name: "Puerto Galera",
    match: ["puerto galera"],
    widgets: [
      { name: "Tours & sightseeing", keywords: TOURS_KEYWORDS, code: `<script async src="https://tpemb.com/content?currency=USD&trs=589478&shmarker=794050&locale=en-US&city_id=68019&category=2&amount=3&powered_by=false&campaign_id=137&promo_id=4497" charset="utf-8"></script>` },
      { name: "Activities & experiences", keywords: ACTIVITIES_KEYWORDS, code: `<script async src="https://tpemb.com/content?currency=USD&trs=589478&shmarker=794050&locale=en-US&city_id=68019&category=3&amount=3&powered_by=false&campaign_id=137&promo_id=4497" charset="utf-8"></script>` },
    ],
  },
  {
    name: "Tagaytay",
    match: ["tagaytay"],
    widgets: [
      { name: "Tours & sightseeing", keywords: TOURS_KEYWORDS, code: `<script async src="https://tpemb.com/content?currency=USD&trs=589478&shmarker=794050&locale=en-US&city_id=111159&category=2&amount=3&powered_by=false&campaign_id=137&promo_id=4497" charset="utf-8"></script>` },
      { name: "Activities & experiences", keywords: ACTIVITIES_KEYWORDS, code: `<script async src="https://tpemb.com/content?currency=USD&trs=589478&shmarker=794050&locale=en-US&city_id=111159&category=3&amount=3&powered_by=false&campaign_id=137&promo_id=4497" charset="utf-8"></script>` },
    ],
  },
];
