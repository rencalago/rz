// ============================================================================
// AGODA HOTEL WIDGETS: paste your Agoda (Travelpayouts) widget codes here, once.
// Every article page reads this file, so you never need to edit the pages.
// Kept separate from klook-codes.js: an article can show both boxes.
// ============================================================================
//
// How it works
// - Each article is matched to a place below by its "location" in allPost.js
//   (e.g. "Capas, Tarlac" matches Clark). If a location names two places, the
//   one named first wins.
// - One Agoda widget per article, at most. It sits right after the first
//   paragraph that mentions a stay keyword ("where to stay", "hotel", "resort"...),
//   from the third paragraph on. If a Klook box is already there, the Agoda
//   box goes under it.
// - No stay keyword anywhere in the article: the widget goes at the bottom.
// - A place with an empty code (``), or an article whose location matches no
//   place, shows no Agoda widget. Nationwide stories ("Philippines") get none
//   unless you add a manual spot.
// - Manual override: put <div class="agoda-here"></div> in an article where the
//   widget should go. Optional: data-place="clark" (any match word).
//
// To add a place: copy a block below, set its name and "match" words (lower
// case words found in the article's location), and paste the <script ...></script>
// code between the backticks.

export const STAY_KEYWORDS = [
  "where to stay", "staying", "hotel", "hotels", "resort", "resorts",
  "accommodation", "accommodations", "lodging",
];

export const AGODA_PLACES = [
  {
    // Clark stories only (Clark Freeport, Angeles, New Clark City in Capas).
    // Other Pampanga and Tarlac stories do not get it.
    name: "Clark",
    match: ["clark", "angeles", "capas"],
    code: `<script async src="https://tpemb.com/content?trs=589478&shmarker=794050&locale=en&default_destination=Angeles%20%2F%20Clark%2C%20Philippines&powered_by=true&primary_override=%235392F9&color_button=%235392F9&color_icons=%235392F9&dark=%23262626&color_border=%235392F9&color_focused=%2332a8dd&border_radius=5&plain=false&promo_id=8303&campaign_id=104" charset="utf-8"></script>`,
  },
];
