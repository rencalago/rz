// Festival calendar. Any post in allPost.js with a "festival" list shows up
// here automatically:
//   festival: [{ name: "Sinulog", month: 1, start: "2027-01-07", end: "2027-01-17",
//               region: "cebu", when: "optional text", about: "optional one-liner", place: "optional" }],
// region is one of cebu, negros, visayas, mindanao, luzon (or "" for nationwide).
// place defaults to the post's location, about to its desc, when to the dates. "start"/"end" are set only when the dates have been announced;
// otherwise "when" describes the usual timing. month is 1-12.
import { newPostTwo as posts } from "./allPost.js";
import { svgIcon } from "./icons.js";

(function () {
  "use strict";

  // Festivals that have no article on the blog yet. Festivals that do have an
  // article are read from allPost.js: add a "festival" list to the post.
  var EXTRA = [
    { name: "Moriones", place: "Marinduque", region: "luzon", month: 3, start: "2027-03-22", end: "2027-03-28",
      when: "Holy Week, 22 to 28 March 2027",
      about: "Townspeople in carved Roman soldier masks re-enact the story of Longinus during Holy Week." },
    { name: "Pahiyas", place: "Lucban, Quezon", region: "luzon", month: 5,
      when: "Usually 15 May",
      about: "Houses dressed in rice wafers called kiping, fruit and vegetables for the feast of San Isidro." },
    { name: "Kadayawan", place: "Davao City", region: "mindanao", month: 8,
      when: "Usually the third week of August",
      about: "Davao's harvest thanksgiving, with street dancing, floral floats and plenty of durian.", guide: "davao-samal-island-mount-apo-food" },
    { name: "Giant Lantern Festival", place: "San Fernando, Pampanga", region: "luzon", month: 12,
      when: "Usually a Saturday in mid-December",
      about: "Huge, intricately lit parol lanterns compete in the Christmas capital of the Philippines.", guide: "pampanga-food-trip-sisig-kapampangan" }
  ];

  var MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function fmtWhen(f) {
    if (!f.start) return "";
    var a = new Date(f.start + "T00:00:00"), b = new Date((f.end || f.start) + "T00:00:00");
    var ma = MONTH_NAMES[a.getMonth()], mb = MONTH_NAMES[b.getMonth()];
    if (+a === +b) return a.getDate() + " " + ma + " " + a.getFullYear();
    if (ma === mb) return a.getDate() + " to " + b.getDate() + " " + mb + " " + b.getFullYear();
    return a.getDate() + " " + ma + " to " + b.getDate() + " " + mb + " " + b.getFullYear();
  }

  var FESTIVALS = EXTRA.slice();
  (posts || []).forEach(function (post) {
    (post.festival || []).forEach(function (f) {
      var month = f.month || (f.start ? +f.start.slice(5, 7) : 0);
      if (!f.name || !month) return;
      FESTIVALS.push({
        name: f.name, place: f.place || post.location || "", region: f.region || "", month: month,
        start: f.start, end: f.end || f.start, when: f.when || fmtWhen(f),
        about: f.about || post.desc || "", guide: (post.link || "").replace("./", "")
      });
    });
  });

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
        '<p class="fcal__meta">' + svgIcon("solid/location-dot") + ' ' + esc(f.place) +
        ' <span class="fcal__sep">·</span> ' + svgIcon("regular/calendar") + ' ' + esc(f.when) + "</p>" +
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
