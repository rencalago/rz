// Packing checklist. "essentials" always shows; each trip type adds its own group.
// Ticks are kept in this browser only (localStorage), wrapped so the page still
// works when storage is blocked.
(function () {
  "use strict";

  var GROUPS = {
    essentials: { label: "Every trip", items: [
      "Passport or valid government ID",
      "eTravel QR code (arriving from abroad)",
      "Printed or saved booking confirmations",
      "Cash in small bills (₱20, ₱50, ₱100)",
      "ATM and credit card, kept separate from your cash",
      "Phone, charger and power bank",
      "Local SIM or eSIM",
      "Universal plug adapter (sockets are Type A, B or C, at 220 volts)",
      "Refillable water bottle",
      "Basic medicines: pain reliever, antihistamine, rehydration salts, stomach medicine",
      "Insect repellent",
      "Hand sanitiser and tissues (many comfort rooms have no paper)",
      "Light jacket for cold buses, ferries and malls",
      "Travel insurance details"
    ] },
    beach: { label: "Beach and island hopping", items: [
      "Dry bag, 10 to 20 litres",
      "Waterproof phone pouch",
      "Rash guard or long-sleeve swim shirt",
      "Reef-safe sunscreen",
      "Reef shoes or sandals with grip",
      "Hat and sunglasses with a strap",
      "Quick-dry towel or sarong",
      "Seasickness tablets",
      "At least 1 litre of water per person for the boat",
      "Cash for environmental and entrance fees"
    ] },
    canyon: { label: "Canyoneering and waterfalls", items: [
      "Swimwear you can move and jump in",
      "Water shoes or old sneakers that stay on",
      "Waterproof phone case with a lanyard",
      "Change of clothes in a plastic bag",
      "Small backpack you don't mind getting wet",
      "Snacks and drinking water",
      "Plaster and small first-aid kit"
    ] },
    dive: { label: "Diving and snorkelling", items: [
      "Dive certification card and logbook",
      "Mask and snorkel that fit you",
      "Fins, or budget for rental",
      "Defogger or baby shampoo for your mask",
      "Rash guard or thin wetsuit",
      "Ear drops for after diving",
      "Underwater camera or action cam, with spare battery"
    ] },
    mountain: { label: "Mountains and highlands", items: [
      "Warm layers: fleece or sweater (Baguio and Sagada get cold at night)",
      "Rain jacket or poncho",
      "Hiking shoes with good grip",
      "Gloves and beanie for sunrise hikes",
      "Headlamp or flashlight",
      "Long pants for caves and trails",
      "Motion-sickness tablets for winding mountain roads"
    ] },
    city: { label: "City and festival days", items: [
      "Comfortable walking shoes",
      "Crossbody bag or money belt for crowds",
      "Umbrella that works for sun and rain",
      "Face towel for the heat",
      "Earplugs for parades and late nights",
      "Modest clothes for churches (covered shoulders and knees)",
      "Grab and a maps app, downloaded for offline use"
    ] },
    rainy: { label: "Rainy or typhoon season", items: [
      "Poncho or packable rain jacket",
      "Ziplock bags for phone, cash and documents",
      "Sandals that can get soaked",
      "Quick-dry clothes",
      "Printed copies of tickets and hotel address",
      "PAGASA and your airline's app for advisories",
      "Spare day in your itinerary for cancelled boats"
    ] }
  };
  var TYPES = ["beach", "canyon", "dive", "mountain", "city", "rainy"];
  var KEY = "rencalago-packing-v1";

  var $ = function (id) { return document.getElementById(id); };
  var typesBox = $("pck-types"), list = $("pck-list");
  if (!typesBox || !list) return;

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage blocked */ } }
  var state = load();
  state.types = state.types || ["beach"];
  state.done = state.done || {};

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  TYPES.forEach(function (t) {
    var l = document.createElement("label");
    l.className = "pck__chip";
    l.innerHTML = '<input type="checkbox" value="' + t + '"' + (state.types.indexOf(t) > -1 ? " checked" : "") + "> <span>" + esc(GROUPS[t].label) + "</span>";
    typesBox.appendChild(l);
  });

  function render() {
    var groups = ["essentials"].concat(TYPES.filter(function (t) { return state.types.indexOf(t) > -1; }));
    var total = 0, done = 0, html = "";
    groups.forEach(function (g) {
      html += '<section class="pck__group"><h3>' + esc(GROUPS[g].label) + "</h3><ul>";
      GROUPS[g].items.forEach(function (item, i) {
        var id = g + ":" + i, on = !!state.done[id];
        total++; if (on) done++;
        html += '<li><label class="pck__item"><input type="checkbox" data-id="' + id + '"' + (on ? " checked" : "") + "> <span>" + esc(item) + "</span></label></li>";
      });
      html += "</ul></section>";
    });
    list.innerHTML = html;
    $("pck-count").textContent = done + " of " + total + " packed";
  }

  typesBox.addEventListener("change", function () {
    state.types = Array.prototype.map.call(typesBox.querySelectorAll("input:checked"), function (el) { return el.value; });
    save(); render();
  });
  list.addEventListener("change", function (e) {
    var id = e.target && e.target.getAttribute("data-id");
    if (!id) return;
    if (e.target.checked) state.done[id] = 1; else delete state.done[id];
    save(); render();
  });
  $("pck-print").addEventListener("click", function () { window.print(); });
  $("pck-reset").addEventListener("click", function () { state.done = {}; save(); render(); });
  render();
})();
