// Trip budget calculator. Every figure below comes from a guide on this blog;
// the comment on each destination names the article. Ranges are [low, high] in pesos.
// Units: "person" once per traveler, "group" once for the whole group,
// "personDay" per traveler per day, "pairDay" per two travelers per day.
(function () {
  "use strict";

  // Daily base costs, from philippines-travel-budget-ferry-vs-flight and
  // dumaguete-on-a-budget-3-day-trip-cost. Comfort food and transport are an
  // estimate at about 1.5x mid-range.
  var STYLES = {
    backpacker: { label: "Backpacker", room: [500, 1000], perBed: true, food: [500, 700], transport: [150, 300] },
    mid: { label: "Mid-range", room: [1500, 3500], perBed: false, food: [750, 1250], transport: [300, 700] },
    comfort: { label: "Comfort or family", room: [3500, 7000], perBed: false, food: [1100, 1900], transport: [450, 1050] }
  };

  var DESTS = [
    { id: "dumaguete", name: "Dumaguete and Negros Oriental", guide: "dumaguete-on-a-budget-3-day-trip-cost",
      there: { label: "Flight, one way per person", range: [2000, 4000] },
      acts: [
        { name: "Apo Island shared tour", range: [2000, 3000], unit: "person" },
        { name: "Apo Island environmental fee (local rate)", range: [100, 100], unit: "person" },
        { name: "Bais dolphin watching boat", range: [2000, 5000], unit: "group" },
        { name: "Manjuyod sandbar stilt house for the day", range: [1500, 1500], unit: "group" }
      ] },
    { id: "siquijor", name: "Siquijor", guide: "siquijor-3-day-itinerary-ring-road-guide",
      acts: [
        { name: "Scooter rental (one per two people)", range: [250, 500], unit: "pairDay" },
        { name: "Tricycle with driver, one full day", range: [1000, 1500], unit: "group" },
        { name: "Entrance fees at sights", range: [200, 300], unit: "personDay" }
      ] },
    { id: "bohol", name: "Bohol and Panglao", guide: "panglao-alona-beach-bohol",
      there: { label: "Fast craft, one way per person", range: [800, 1200] },
      acts: [
        { name: "Countryside tour, private van", range: [2500, 3500], unit: "group" },
        { name: "Loboc river cruise with lunch", range: [850, 1200], unit: "person" },
        { name: "Chocolate Hills viewing deck", range: [150, 150], unit: "person" },
        { name: "Tarsier sanctuary, Corella", range: [60, 80], unit: "person" }
      ] },
    { id: "moalboal", name: "Moalboal", guide: "moalboal-sardine-run-pescador-island-guide",
      there: { label: "Bus, one way per person", range: [150, 250] },
      acts: [
        { name: "Sardine run environmental and beach fees", range: [125, 125], unit: "person" },
        { name: "Snorkel set rental", range: [200, 250], unit: "person" },
        { name: "Local snorkel guide", range: [300, 500], unit: "person" },
        { name: "Pescador Island snorkel trip", range: [200, 550], unit: "person" }
      ] },
    { id: "badian", name: "Badian and Kawasan Falls", guide: "kawasan-falls-canyoneering-guide",
      there: { label: "Bus, one way per person", range: [200, 250] },
      acts: [
        { name: "Kawasan Falls entrance", range: [200, 200], unit: "person" },
        { name: "Canyoneering with shuttle", range: [2100, 2100], unit: "person" }
      ] },
    { id: "oslob", name: "Oslob and Sumilon Island", guide: "sumilon-island-day-trip-from-oslob",
      acts: [
        { name: "Sumilon boat (per boat)", range: [1500, 1500], unit: "group" },
        { name: "Sumilon environmental and entrance fees", range: [100, 100], unit: "person" }
      ] },
    { id: "bantayan", name: "Bantayan Island", guide: "bantayan-island-guide",
      there: { label: "Bus and ferry, one way per person", range: [465, 615] },
      acts: [
        { name: "Motorbike rental (one per two people)", range: [350, 350], unit: "pairDay" },
        { name: "Tricycle island tour", range: [1000, 1000], unit: "group" }
      ] },
    { id: "malapascua", name: "Malapascua", guide: "malapascua-thresher-sharks",
      there: { label: "Boat and island fee, one way per person", range: [315, 360] },
      acts: [
        { name: "Thresher shark dives, 3-dive package", range: [6000, 6000], unit: "person" },
        { name: "Regular fun dive", range: [1800, 1800], unit: "person" }
      ] },
    { id: "coron", name: "Coron, Palawan", guide: "coron-wreck-diving-kayangan-lake",
      there: { label: "Flight, one way per person", range: [1500, 5000] },
      acts: [
        { name: "Reefs and wrecks snorkel tour", range: [1700, 2300], unit: "person" },
        { name: "Kayangan Lake entrance", range: [300, 300], unit: "person" },
        { name: "Two-tank fun dive day", range: [2500, 4000], unit: "person" },
        { name: "Marine park fees at tour stops", range: [200, 350], unit: "person" }
      ] },
    { id: "boracay", name: "Boracay", guide: "boracay-from-cebu",
      there: { label: "Flight to Caticlan, one way per person", range: [1200, 4500], extra: [950, 1550], extraLabel: "jetty, environmental fee and transfers" },
      acts: [
        { name: "Shared island-hopping tour", range: [800, 1500], unit: "person" }
      ] },
    { id: "siargao", name: "Siargao", guide: "siargao-from-cebu",
      there: { label: "Flight, one way per person", range: [2500, 5000], extra: [600, 800], extraLabel: "shared airport vans" },
      acts: [
        { name: "Shared island-hopping tour", range: [800, 1500], unit: "person" }
      ] }
  ];

  var $ = function (id) { return document.getElementById(id); };
  var peso = function (n) { return "₱" + (Math.round(n / 10) * 10).toLocaleString("en-PH"); };
  var span = function (r) { return r[0] === r[1] ? peso(r[0]) : peso(r[0]) + " – " + peso(r[1]); };
  var clampInt = function (v, min, max, dflt) { v = parseInt(v, 10); if (isNaN(v)) return dflt; return Math.min(max, Math.max(min, v)); };

  var destSel = $("tbc-dest");
  if (!destSel) return;
  DESTS.forEach(function (d) {
    var o = document.createElement("option");
    o.value = d.id; o.textContent = d.name; destSel.appendChild(o);
  });

  function current() { for (var i = 0; i < DESTS.length; i++) if (DESTS[i].id === destSel.value) return DESTS[i]; return DESTS[0]; }

  function renderActs() {
    var d = current(), box = $("tbc-acts");
    box.innerHTML = "";
    d.acts.forEach(function (a, i) {
      var l = document.createElement("label");
      l.className = "tbc__check";
      var unitText = { person: "per person", group: "per group", personDay: "per person, per day", pairDay: "per day" }[a.unit];
      l.innerHTML = '<input type="checkbox" data-i="' + i + '"> <span>' + a.name + ' <small>(' + span(a.range) + " " + unitText + ")</small></span>";
      box.appendChild(l);
    });
    var wrap = $("tbc-there-wrap");
    wrap.hidden = !d.there;
    if (d.there) $("tbc-there-label").textContent = "Include getting there and back (" + d.there.label.toLowerCase() + ": " + span(d.there.range) + ")";
  }

  function add(t, r, k) { t[0] += r[0] * k; t[1] += r[1] * k; }

  function calc() {
    var d = current();
    var s = STYLES[$("tbc-style").value] || STYLES.mid;
    var days = clampInt($("tbc-days").value, 1, 21, 3);
    var people = clampInt($("tbc-people").value, 1, 12, 2);
    var nights = Math.max(days - 1, 0);
    var rows = [];

    var rooms = s.perBed ? people : Math.ceil(people / 2);
    var stay = [0, 0]; add(stay, s.room, rooms * nights);
    rows.push(["Accommodation (" + nights + (nights === 1 ? " night, " : " nights, ") + rooms + (s.perBed ? (rooms === 1 ? " bed)" : " beds)") : (rooms === 1 ? " room)" : " rooms)")), stay]);

    var food = [0, 0]; add(food, s.food, people * days); rows.push(["Food", food]);
    var move = [0, 0]; add(move, s.transport, people * days); rows.push(["Local transport", move]);

    if (d.there && $("tbc-there").checked) {
      var there = [0, 0]; add(there, d.there.range, people * 2);
      if (d.there.extra) add(there, d.there.extra, people);
      rows.push(["Getting there and back" + (d.there.extraLabel ? ", with " + d.there.extraLabel : ""), there]);
    }

    var acts = [0, 0];
    Array.prototype.forEach.call($("tbc-acts").querySelectorAll("input:checked"), function (el) {
      var a = d.acts[+el.dataset.i];
      var k = a.unit === "person" ? people : a.unit === "group" ? 1 : a.unit === "personDay" ? people * days : Math.ceil(people / 2) * days;
      add(acts, a.range, k);
    });
    if (acts[1] > 0) rows.push(["Tours, fees and activities", acts]);

    var total = [0, 0];
    rows.forEach(function (r) { add(total, r[1], 1); });
    if ($("tbc-buffer").checked) { var buf = [total[0] * 0.1, total[1] * 0.1]; rows.push(["10% buffer", buf]); add(total, buf, 1); }

    $("tbc-total").textContent = span(total);
    $("tbc-pp").textContent = people > 1 ? "About " + span([total[0] / people, total[1] / people]) + " per person for " + days + (days === 1 ? " day" : " days") : "For " + days + (days === 1 ? " day" : " days");
    $("tbc-rows").innerHTML = rows.map(function (r) { return "<tr><th scope=\"row\">" + r[0] + "</th><td>" + span(r[1]) + "</td></tr>"; }).join("");
    $("tbc-guide").innerHTML = 'Planning ' + d.name + '? Read our <a href="./' + d.guide + '">' + d.name + ' guide</a> for routes, tips and what each fee covers.';
  }

  destSel.addEventListener("change", function () { renderActs(); calc(); });
  $("tbc").addEventListener("input", calc);
  $("tbc").addEventListener("change", calc);
  renderActs();
  calc();
})();
