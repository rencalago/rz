// Festival calendar. Dates for festivals with a guide on this blog come from
// that guide. "start"/"end" are set only when the dates have been announced;
// otherwise "when" describes the usual timing. month is 1-12.
(function () {
  "use strict";

  var FESTIVALS = [
    { name: "Sinulog", place: "Cebu City", region: "cebu", month: 1, start: "2027-01-07", end: "2027-01-17",
      when: "7 to 17 January 2027. Grand Parade on Sunday, 17 January",
      about: "Cebu's feast of the Santo Niño, with a street dance and parade that fill the city.", guide: "sinulog-2027-whats-confirmed" },
    { name: "Ati-Atihan", place: "Kalibo, Aklan", region: "visayas", month: 1, start: "2027-01-17", end: "2027-01-17",
      when: "Main Sunday on 17 January 2027",
      about: "Painted faces, drums and crowds that dance through Kalibo's streets for the Santo Niño.", guide: "ati-atihan-dinagyang-2027" },
    { name: "Dinagyang", place: "Iloilo City", region: "visayas", month: 1, start: "2027-01-22", end: "2027-01-24",
      when: "Main weekend expected 22 to 24 January 2027",
      about: "Iloilo's choreographed warrior-tribe performances on the fourth weekend of January.", guide: "ati-atihan-dinagyang-2027" },
    { name: "Panagbenga", place: "Baguio City", region: "luzon", month: 2,
      when: "Usually all of February, with the main parades in late February or early March",
      about: "Baguio's flower festival, with a street dance and a float parade covered in blooms.", guide: "panagbenga-baguio-february" },
    { name: "Moriones", place: "Marinduque", region: "luzon", month: 3, start: "2027-03-22", end: "2027-03-28",
      when: "Holy Week, 22 to 28 March 2027",
      about: "Townspeople in carved Roman soldier masks re-enact the story of Longinus during Holy Week." },
    { name: "Pahiyas", place: "Lucban, Quezon", region: "luzon", month: 5,
      when: "Usually 15 May",
      about: "Houses dressed in rice wafers called kiping, fruit and vegetables for the feast of San Isidro." },
    { name: "Kadayawan", place: "Davao City", region: "mindanao", month: 8,
      when: "Usually the third week of August",
      about: "Davao's harvest thanksgiving, with street dancing, floral floats and plenty of durian.", guide: "davao-samal-island-mount-apo-food" },
    { name: "Tisa Siomai Festival", place: "Tisa, Cebu City", region: "cebu", month: 9, start: "2026-09-26", end: "2026-09-26",
      when: "Held on 26 September in 2026",
      about: "A neighbourhood food festival for the steamed siomai Tisa is known for.", guide: "tisa-siomai-festival-draws-7000-people" },
    { name: "MassKara", place: "Bacolod City", region: "negros", month: 10, start: "2026-10-01", end: "2026-10-18",
      when: "1 to 18 October in 2026, peaking in the third week of October",
      about: "Smiling masks, Electric MassKara at night and street dance competitions.", guide: "masskara-festival-2026-bacolod-final-weekend" },
    { name: "Moalboal Oktoberfest", place: "Moalboal, Cebu", region: "cebu", month: 10, start: "2026-10-02", end: "2026-10-04",
      when: "Held 2 to 4 October in 2026",
      about: "A beachside music and food festival in the dive town.", guide: "moalboal-oktoberfest-beachside-festival-cebu" },
    { name: "Bisnok Festival", place: "Dumanjug, Cebu", region: "cebu", month: 10, start: "2026-10-03", end: "2026-10-04",
      when: "Held 3 and 4 October in 2026",
      about: "Dumanjug's celebration of native chicken, its food and its place in town life.", guide: "dumanjug-bisnok-festival-native-chicken" },
    { name: "Halad Inasal", place: "Talisay City, Cebu", region: "cebu", month: 10, start: "2026-10-15", end: "2026-10-15",
      when: "Every 15 October",
      about: "Talisay's fiesta for Santa Teresa de Avila, built around the grilled food the city is known for.", guide: "halad-inasal-festival-talisay-cebu" },
    { name: "Buglasan", place: "Dumaguete, Negros Oriental", region: "negros", month: 10, start: "2026-10-15", end: "2026-10-25",
      when: "15 to 25 October in 2026",
      about: "Negros Oriental's festival of festivals, with town booths, parades and a trade fair.", guide: "buglasan-festival-2026-events-schedule" },
    { name: "Lanzones Festival", place: "Mambajao, Camiguin", region: "mindanao", month: 10, start: "2026-10-18", end: "2026-10-25",
      when: "18 to 25 October in 2026, with pre-festival events from 15 October",
      about: "Camiguin's harvest festival for its sweet lanzones, with a parade and street dancing.", guide: "camiguin-lanzones-festival-2026-guide" },
    { name: "Higantes Festival", place: "Angono, Rizal", region: "luzon", month: 11, start: "2026-10-31", end: "2026-11-30",
      when: "All of November 2026. Fluvial parade on 23 November",
      about: "Giant papier-mache figures parade through the art town of Angono.", guide: "higantes-festival-angono-rizal-2026-visitor-guide" },
    { name: "Undas", place: "Nationwide", region: "", month: 11, start: "2026-11-01", end: "2026-11-02",
      when: "1 and 2 November 2026",
      about: "Not a festival but a major travel peak, as families head home to visit cemeteries.", guide: "undas-2026-travel-cebu-negros" },
    { name: "Giant Lantern Festival", place: "San Fernando, Pampanga", region: "luzon", month: 12,
      when: "Usually a Saturday in mid-December",
      about: "Huge, intricately lit parol lanterns compete in the Christmas capital of the Philippines.", guide: "pampanga-food-trip-sisig-kapampangan" }
  ];

  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var $ = function (id) { return document.getElementById(id); };
  var list = $("fcal-list");
  if (!list) return;

  var monthSel = $("fcal-month");
  MONTHS.forEach(function (m, i) {
    var o = document.createElement("option"); o.value = String(i + 1); o.textContent = m; monthSel.appendChild(o);
  });

  var today = new Date(); today.setHours(0, 0, 0, 0);
  var thisMonth = today.getMonth() + 1;

  function status(f) {
    if (f.end && new Date(f.end + "T23:59:59") < today) return "past";
    if (f.start && new Date(f.start + "T00:00:00") <= today) return "now";
    return "";
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  function render() {
    var region = $("fcal-region").value, month = monthSel.value;
    var items = FESTIVALS.filter(function (f) { return (!region || f.region === region) && (!month || f.month === +month); });
    // Order by month starting from the current one, so what's next comes first.
    items.sort(function (a, b) {
      var ka = (a.month - thisMonth + 12) % 12, kb = (b.month - thisMonth + 12) % 12;
      if (status(a) === "past") ka += 12;
      if (status(b) === "past") kb += 12;
      return ka - kb || (a.start || "").localeCompare(b.start || "");
    });
    if (!items.length) { list.innerHTML = '<p class="fcal__empty">No festivals listed for that choice yet.</p>'; return; }
    var html = "", lastMonth = 0;
    items.forEach(function (f) {
      if (f.month !== lastMonth) { html += '<h3 class="fcal__month">' + MONTHS[f.month - 1] + "</h3>"; lastMonth = f.month; }
      var st = status(f);
      var badge = st === "now" ? '<span class="fcal__badge fcal__badge--now">On now</span>' : st === "past" ? '<span class="fcal__badge">Done for this year</span>' : "";
      html += '<div class="fcal__item' + (st === "past" ? " is-past" : "") + '">' +
        '<p class="fcal__name">' + esc(f.name) + badge + "</p>" +
        '<p class="fcal__meta"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ' + esc(f.place) +
        ' <span class="fcal__sep">·</span> <i class="fa-regular fa-calendar" aria-hidden="true"></i> ' + esc(f.when) + "</p>" +
        '<p class="fcal__about">' + esc(f.about) + "</p>" +
        (f.guide ? '<a class="fcal__link" href="./' + f.guide + '">Read the guide</a>' : "") +
        "</div>";
    });
    list.innerHTML = html;
  }

  $("fcal-region").addEventListener("change", render);
  monthSel.addEventListener("change", render);
  render();
})();
