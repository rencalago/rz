// The 18 official regions of the Philippines, and the place names in a story's
// "location" (allPost.js) that put it in each one. Used by the destination pages,
// the breadcrumbs and the build's checks, so every story is sorted the same way.
//
// Adding a story somewhere new? If the build warns that its location matches no
// region, add the province or town (lower case) to the right list below.
export const REGIONS = [
  // Luzon
  { name: "National Capital Region", group: "Luzon", places: ["manila", "metro manila", "taguig", "makati", "pasay", "quezon city", "intramuros", "binondo", "bgc"] },
  { name: "Cordillera Administrative Region", group: "Luzon", places: ["baguio", "benguet", "ifugao", "mountain province", "sagada", "banaue", "kalinga", "abra", "apayao"] },
  { name: "Ilocos Region", group: "Luzon", places: ["ilocos", "vigan", "la union", "pangasinan"] },
  { name: "Cagayan Valley", group: "Luzon", places: ["batanes", "cagayan valley", "isabela", "nueva vizcaya", "quirino"] },
  { name: "Central Luzon", group: "Luzon", places: ["pampanga", "zambales", "aurora", "bulacan", "tarlac", "bataan", "nueva ecija"] },
  { name: "CALABARZON", group: "Luzon", places: ["cavite", "tagaytay", "laguna", "batangas", "anilao", "rizal", "angono", "quezon province"] },
  { name: "MIMAROPA Region", group: "Luzon", places: ["mindoro", "marinduque", "romblon", "palawan", "coron", "el nido", "puerto princesa"] },
  { name: "Bicol Region", group: "Luzon", places: ["bicol", "albay", "camarines", "catanduanes", "masbate", "sorsogon", "donsol"] },
  // Visayas
  { name: "Western Visayas", group: "Visayas", places: ["aklan", "boracay", "antique", "capiz", "guimaras", "iloilo"] },
  { name: "Negros Island Region", group: "Visayas", places: ["negros", "dumaguete", "bacolod", "silay", "sipalay", "bais", "tanjay", "sibulan", "pamplona", "la libertad", "mabinay", "canlaon", "apo island", "siquijor"] },
  { name: "Central Visayas", group: "Visayas", places: ["cebu", "bantayan", "malapascua", "camotes", "oslob", "moalboal", "badian", "bohol", "panglao", "corella"] },
  { name: "Eastern Visayas", group: "Visayas", places: ["leyte", "samar", "biliran", "tacloban"] },
  // Mindanao
  { name: "Zamboanga Peninsula", group: "Mindanao", places: ["zamboanga", "dapitan"] },
  { name: "Northern Mindanao", group: "Mindanao", places: ["bukidnon", "cagayan de oro", "camiguin", "misamis", "iligan"] },
  { name: "Davao Region", group: "Mindanao", places: ["davao", "samal"] },
  { name: "SOCCSKSARGEN", group: "Mindanao", places: ["south cotabato", "lake sebu", "general santos", "sarangani", "sultan kudarat"] },
  { name: "Caraga", group: "Mindanao", places: ["surigao", "siargao", "agusan", "dinagat", "bislig", "hinatuan"] },
  { name: "BARMM", group: "Mindanao", places: ["bangsamoro", "lanao del sur", "maguindanao", "basilan", "sulu", "tawi-tawi", "cotabato city"] },
];

// Every region a location names, in the order they appear ("Donsol, Sorsogon
// and Oslob, Cebu" gives Bicol, then Central Visayas). "Philippines" gives none.
export function regionsOf(location) {
  const text = String(location || "").toLowerCase();
  const found = [];
  for (const region of REGIONS) {
    const at = Math.min(...region.places.map((place) => {
      const i = text.indexOf(place);
      return i < 0 ? Infinity : i;
    }));
    if (at < Infinity) found.push({ region, at });
  }
  return found.sort((a, b) => a.at - b.at).map((f) => f.region.name);
}

// The story's main region: the first one its location names.
export const regionOf = (location) => regionsOf(location)[0] || null;
