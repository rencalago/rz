// "Where should you go?" quiz. Any post in allPost.js with a "quiz" field joins
// the quiz automatically:
//   quiz: { name: "Siquijor", vibes: ["beach", "nature", "slow"], cost: 1, reach: 2, minDays: 3,
//           family: true, boats: 1, goodMonths: [3, 4], why: "one-line reason shown in the result" },
// vibes: beach, dive, nature, adventure, food, culture, cool, surf, party, slow (first = what it does best).
// cost 1 budget to 3 pricey; reach 1 easy to 3 long trip; boats 0 none, 1 some, 2 boat-heavy.
// name defaults to the post's location; goodMonths (1-12) is optional.
import { newPostTwo as posts } from "./allPost.js";

(function () {
  "use strict";

  // Destinations come from allPost.js: any post with a "quiz" field joins.
  var DESTS = [];
  (posts || []).forEach(function (post) {
    var q = post.quiz;
    if (!q || !q.vibes || !q.vibes.length) return;
    DESTS.push({
      name: q.name || post.location || post.title, guide: (post.link || "").replace("./", ""),
      vibes: q.vibes, cost: q.cost || 2, reach: q.reach || 2, minDays: q.minDays || 2,
      family: q.family !== false, boats: q.boats || 0, goodMonths: q.goodMonths, why: q.why || post.desc || ""
    });
  });

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
