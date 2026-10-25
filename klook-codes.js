// ============================================================================
// KLOOK WIDGETS: paste your Klook widget codes here, once.
// Every article page reads this file, so you never need to edit the pages.
// ============================================================================
//
// How it works
// - Each article belongs to one destination page (the middle link of its
//   breadcrumb, e.g. "Cebu travel guides"). Only that destination's widgets
//   can show on it.
// - One Klook widget per article, at most. It sits in the article text, right
//   after the first paragraph that mentions one of the widget's keywords
//   (from the third paragraph on, so it never sits beside the AdSense square).
//   If both widgets match, the one whose keyword comes first in the article wins.
// - No keyword anywhere in the article: the first widget that has a code goes
//   at the bottom of the article instead.
// - A widget with an empty code ("") is skipped. A destination with no codes
//   shows no Klook widget at all.
// - The AdSense square at the top of the article is not affected.
//
// To add a code: create the Klook widget in Travelpayouts (Tools > Widgets) and
// paste its full <script ...></script> code between the backticks of the right
// widget below.
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

// Keyed by destination page (see _tools/destinations.json).
export const KLOOK_WIDGETS = {
  "cebu-travel-guides": [
    { name: "Cebu tours & sightseeing", keywords: TOURS_KEYWORDS, code: `<script async src="https://tpemb.com/content?currency=USD&trs=589478&shmarker=794050.Cebu-Tours%26Sightseeings&locale=en-US&city_id=97&category=2&amount=3&powered_by=true&campaign_id=137&promo_id=4497" charset="utf-8"></script>` },
    { name: "Cebu activities & experiences", keywords: ACTIVITIES_KEYWORDS, code: `<script async src="https://tpemb.com/content?currency=USD&trs=589478&shmarker=794050.Cebu-Tours%26Sightseeings&locale=en-US&city_id=97&category=3&amount=3&powered_by=true&campaign_id=137&promo_id=4497" charset="utf-8"></script>` },
  ],
  "dumaguete-travel-guides": [
    { name: "Dumaguete tours & sightseeing", keywords: TOURS_KEYWORDS, code: `` },
    { name: "Dumaguete activities & experiences", keywords: ACTIVITIES_KEYWORDS, code: `` },
  ],
  "negros-oriental-travel-guides": [
    { name: "Negros Oriental tours & sightseeing", keywords: TOURS_KEYWORDS, code: `` },
    { name: "Negros Oriental activities & experiences", keywords: ACTIVITIES_KEYWORDS, code: `` },
  ],
  "luzon-travel-guides": [
    { name: "Luzon tours & sightseeing", keywords: TOURS_KEYWORDS, code: `` },
    { name: "Luzon activities & experiences", keywords: ACTIVITIES_KEYWORDS, code: `` },
  ],
  "palawan-mimaropa-travel-guides": [
    { name: "Palawan tours & sightseeing", keywords: TOURS_KEYWORDS, code: `` },
    { name: "Palawan activities & experiences", keywords: ACTIVITIES_KEYWORDS, code: `` },
  ],
  "visayas-travel-guides": [
    { name: "Visayas tours & sightseeing", keywords: TOURS_KEYWORDS, code: `` },
    { name: "Visayas activities & experiences", keywords: ACTIVITIES_KEYWORDS, code: `` },
  ],
  "mindanao-travel-guides": [
    { name: "Mindanao tours & sightseeing", keywords: TOURS_KEYWORDS, code: `` },
    { name: "Mindanao activities & experiences", keywords: ACTIVITIES_KEYWORDS, code: `` },
  ],
};
