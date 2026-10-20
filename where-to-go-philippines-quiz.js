// "Where should you go?" quiz. Each destination has the trip styles it does best,
// a cost level (1 budget to 3 pricey), how hard it is to reach (1 easy to 3 long),
// the shortest trip that makes sense, whether it suits families, and how boat- or
// weather-dependent it is. Answers add points; the top three are shown.
(function () {
  "use strict";

  var DESTS = [
    { name: "Siquijor", guide: "siquijor-3-day-itinerary-ring-road-guide", vibes: ["beach", "nature", "slow"], cost: 1, reach: 2, minDays: 3, family: true, boats: 1,
      why: "quiet beaches, waterfalls and an easy scooter loop around the island" },
    { name: "Dumaguete and Apo Island", guide: "dumaguete-on-a-budget-3-day-trip-cost", vibes: ["food", "dive", "slow", "nature"], cost: 1, reach: 1, minDays: 2, family: true, boats: 1,
      why: "a laid-back university city with cheap eats and some of the country's best snorkelling nearby" },
    { name: "Bohol and Panglao", guide: "panglao-alona-beach-bohol", vibes: ["beach", "nature", "culture"], cost: 2, reach: 1, minDays: 2, family: true, boats: 1,
      why: "tarsiers, the Chocolate Hills and white-sand beaches, all within a short ride" },
    { name: "Moalboal", guide: "moalboal-sardine-run-pescador-island-guide", vibes: ["dive", "beach", "slow"], cost: 1, reach: 1, minDays: 2, family: true, boats: 0,
      why: "a sardine run and sea turtles right off the beach, no boat needed" },
    { name: "Badian and Kawasan Falls", guide: "kawasan-falls-canyoneering-guide", vibes: ["adventure", "nature"], cost: 1, reach: 1, minDays: 1, family: false, boats: 0,
      why: "canyoneering through turquoise pools, one of the best adrenaline days in Cebu" },
    { name: "Bantayan Island", guide: "bantayan-island-guide", vibes: ["beach", "slow"], cost: 1, reach: 2, minDays: 3, family: true, boats: 1,
      why: "flat roads, calm water and long white beaches with little to do but relax" },
    { name: "Malapascua", guide: "malapascua-thresher-sharks", vibes: ["dive", "beach"], cost: 2, reach: 2, minDays: 3, family: false, boats: 1,
      why: "early-morning dives with thresher sharks, which are rarely seen this reliably anywhere else" },
    { name: "Camiguin", guide: "camiguin-weekend-from-cebu-or-bohol-guide", vibes: ["nature", "slow", "adventure"], cost: 2, reach: 2, minDays: 2, family: true, boats: 1,
      why: "volcanoes, hot and cold springs and a white sandbar on a small, friendly island" },
    { name: "Coron", guide: "coron-wreck-diving-kayangan-lake", vibes: ["dive", "beach", "nature"], cost: 3, reach: 3, minDays: 4, family: true, boats: 2,
      why: "WWII shipwrecks and clear lakes surrounded by limestone cliffs" },
    { name: "Palawan, beyond the crowds", guide: "palawan-asias-best-island-2026-quieter-spots", vibes: ["beach", "slow", "nature"], cost: 2, reach: 3, minDays: 5, family: true, boats: 2,
      why: "Asia's best island for 2026, with quiet corners like Port Barton and Long Beach" },
    { name: "Boracay", guide: "boracay-from-cebu", vibes: ["beach", "party"], cost: 3, reach: 2, minDays: 3, family: true, boats: 1,
      why: "powdery White Beach, sunsets and the liveliest nights of any island" },
    { name: "Siargao", guide: "siargao-from-cebu", vibes: ["surf", "beach", "party", "adventure"], cost: 2, reach: 2, minDays: 4, family: false, boats: 1, goodMonths: [9, 10, 11],
      why: "surf, island hopping and a young, social crowd in General Luna" },
    { name: "Baguio", guide: "travel-to-baguio-city-places-to-visit", vibes: ["cool", "food", "culture"], cost: 1, reach: 2, minDays: 2, family: true, boats: 0, goodMonths: [2, 3],
      why: "cool mountain air, strawberry farms and a lively food and market scene" },
    { name: "Sagada", guide: "sagada-caves-hanging-coffins-etiquette", vibes: ["cool", "adventure", "culture"], cost: 1, reach: 3, minDays: 3, family: false, boats: 0,
      why: "caves, hanging coffins and misty mornings in the Mountain Province" },
    { name: "Batanes", guide: "batanes-getting-there-costs-best-months", vibes: ["nature", "slow", "culture"], cost: 3, reach: 3, minDays: 4, family: true, boats: 1, goodMonths: [3, 4, 5],
      why: "rolling hills, stone houses and cliffs above the sea at the country's northern tip" },
    { name: "La Union", guide: "la-union-surf-season-guide-san-juan", vibes: ["surf", "beach", "party"], cost: 1, reach: 2, minDays: 2, family: false, boats: 0, goodMonths: [12, 1, 2],
      why: "beginner-friendly surf in San Juan and a fun weekend crowd" },
    { name: "Vigan", guide: "vigan-heritage-weekend-calle-crisologo-food", vibes: ["culture", "food"], cost: 1, reach: 2, minDays: 2, family: true, boats: 0,
      why: "Spanish-era streets on Calle Crisologo and Ilocano food like empanada and bagnet" },
    { name: "Iloilo and Guimaras", guide: "iloilo-guimaras-food-trip", vibes: ["food", "culture"], cost: 1, reach: 1, minDays: 2, family: true, boats: 1,
      why: "batchoy, pancit molo and Guimaras mangoes on an easy food trip" },
    { name: "Davao and Samal", guide: "davao-samal-island-mount-apo-food", vibes: ["food", "beach", "nature"], cost: 2, reach: 2, minDays: 3, family: true, boats: 1,
      why: "durian, Samal Island beaches and the country's highest peak on the horizon" },
    { name: "Cebu City and the north", guide: "cebu-3-day-itinerary", vibes: ["culture", "food"], cost: 1, reach: 1, minDays: 2, family: true, boats: 0,
      why: "heritage churches, lechon and mountain views, with an international airport on the doorstep" }
  ];

  var QUESTIONS = [
    { id: "vibe", q: "What do you most want from this trip?", opts: [
      ["beach", "White sand and swimming"], ["dive", "Diving and snorkelling"], ["nature", "Waterfalls, hills and scenery"],
      ["adventure", "Adrenaline and adventure"], ["food", "Eating my way around"], ["culture", "History and culture"],
      ["cool", "Cool weather and mountains"], ["surf", "Surfing"], ["party", "Nightlife and a social crowd"] ] },
    { id: "pace", q: "How do you like to spend your days?", opts: [
      ["slow", "Slow, with lots of rest"], ["mix", "A mix of rest and activities"], ["busy", "Busy, see as much as possible"] ] },
    { id: "days", q: "How many days do you have?", opts: [["2", "1 to 2 days"], ["4", "3 to 4 days"], ["7", "5 to 7 days"], ["10", "More than a week"]] },
    { id: "budget", q: "What's your budget like?", opts: [["1", "Tight, every peso counts"], ["2", "Comfortable, mid-range"], ["3", "Happy to splurge"]] },
    { id: "who", q: "Who's coming?", opts: [["solo", "Just me"], ["couple", "Partner or a friend"], ["family", "Family with kids or seniors"], ["group", "A group of friends"]] },
    { id: "month", q: "When are you going?", opts: [
      ["1", "January"], ["2", "February"], ["3", "March"], ["4", "April"], ["5", "May"], ["6", "June"],
      ["7", "July"], ["8", "August"], ["9", "September"], ["10", "October"], ["11", "November"], ["12", "December"] ] }
  ];

  var form = document.getElementById("quiz"), out = document.getElementById("quiz-result");
  if (!form || !out) return;
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  form.innerHTML = QUESTIONS.map(function (Q, n) {
    var opts = Q.opts.map(function (o) {
      return '<label class="quiz__opt"><input type="radio" name="' + Q.id + '" value="' + o[0] + '"> <span>' + esc(o[1]) + "</span></label>";
    }).join("");
    return '<fieldset class="quiz__q"><legend><span class="quiz__n">' + (n + 1) + "</span> " + esc(Q.q) + '</legend><div class="quiz__opts' + (Q.id === "month" ? " quiz__opts--months" : "") + '">' + opts + "</div></fieldset>";
  }).join("") + '<p class="quiz__hint" id="quiz-hint">Answer all six questions to see your matches.</p>';

  function answers() {
    var a = {};
    QUESTIONS.forEach(function (Q) { var el = form.querySelector('input[name="' + Q.id + '"]:checked'); if (el) a[Q.id] = el.value; });
    return a;
  }

  function score(d, a) {
    var s = 0;
    if (d.vibes[0] === a.vibe) s += 6; else if (d.vibes.indexOf(a.vibe) > -1) s += 4;
    if (a.pace === "slow" && d.vibes.indexOf("slow") > -1) s += 2;
    if (a.pace === "busy" && d.vibes.indexOf("slow") === -1) s += 1;
    var days = +a.days;
    if (days < d.minDays) s -= (d.minDays - days) * 1.5;
    if (days <= 2 && d.reach === 1) s += 1.5;
    if (days >= 7 && d.reach === 3) s += 1.5;
    var b = +a.budget;
    if (d.cost > b) s -= (d.cost - b) * 2; else if (d.cost === b) s += 1;
    if (a.who === "family") s += d.family ? 1.5 : -3;
    if ((a.who === "group" || a.who === "solo") && d.vibes.indexOf("party") > -1) s += 1;
    var m = +a.month;
    if (d.goodMonths && d.goodMonths.indexOf(m) > -1) s += 2;
    var wet = m >= 6 && m <= 11;
    if (wet) s -= d.boats * 1.2;
    if (d.vibes.indexOf("cool") > -1 && (m === 12 || m <= 2)) s += 0.5;
    return s;
  }

  function render() {
    var a = answers();
    var missing = QUESTIONS.filter(function (Q) { return !a[Q.id]; }).length;
    document.getElementById("quiz-hint").hidden = missing === 0;
    if (missing) { out.hidden = true; return; }
    var ranked = DESTS.map(function (d) { return { d: d, s: score(d, a) }; })
      .sort(function (x, y) { return y.s - x.s; }).slice(0, 3);
    var m = +a.month, wet = m >= 6 && m <= 11;
    out.hidden = false;
    out.innerHTML = "<h2>Your top matches</h2>" + ranked.map(function (r, i) {
      var d = r.d;
      var note = wet && d.boats ? '<p class="quiz__note">This trip relies on boats, so keep a spare day in case weather cancels a crossing.</p>' : "";
      return '<div class="quiz__match' + (i === 0 ? " quiz__match--top" : "") + '">' +
        '<p class="quiz__rank">' + (i === 0 ? "Best match" : "Also a good fit") + "</p>" +
        '<p class="quiz__dest">' + esc(d.name) + "</p>" +
        "<p>Go for " + esc(d.why) + ". Plan at least " + d.minDays + (d.minDays === 1 ? " day" : " days") + ".</p>" + note +
        '<a class="quiz__link" href="./' + d.guide + '">Read the ' + esc(d.name) + " guide</a></div>";
    }).join("") + '<p class="quiz__more">Change any answer above to see different matches.</p>';
  }

  form.addEventListener("change", function () {
    var wasHidden = out.hidden;
    render();
    if (wasHidden && !out.hidden) out.scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();
