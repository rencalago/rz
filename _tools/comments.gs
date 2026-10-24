/**
 * Blog comments: Google Apps Script web app.
 *
 * Readers post comments from the form under each article. Each comment lands
 * in a Google Sheet unpublished; it only appears on the site after you tick
 * "Approved". A scheduled GitHub job (.github/workflows/publish-comments.yml)
 * reads the approved comments every few hours and writes them into the
 * article pages, so search engines see them as part of the page.
 *
 * Nothing here is published on the site (this folder starts with "_"); it is
 * kept in the repo so the code that receives the form lives next to the form.
 *
 * SET UP (about 10 minutes, once)
 *  1. Open https://sheets.new while signed in as the blog's Google account and
 *     name the sheet "Blog comments".
 *  2. In the sheet: Extensions > Apps Script. Delete what is in Code.gs and
 *     paste this whole file in. Save.
 *  3. Run the function `setup` once (pick it in the toolbar, press Run) and
 *     allow the permissions it asks for. It adds the header row and an
 *     hourly job that emails readers when you reply. Each comment gets its
 *     own "Approved" checkbox when it arrives.
 *
 *  Keep the sheet private (Share > General access > Restricted): it holds
 *  readers' email addresses.
 *  4. Deploy > New deployment > type "Web app".
 *       Execute as: Me
 *       Who has access: Anyone
 *     Press Deploy and copy the Web app URL (it ends in /exec).
 *  5. Paste that URL into COMMENTS_ENDPOINT in config.js in the repo.
 *
 * DAILY USE
 *  - You get an email for every new comment.
 *  - To publish it: tick "Approved". It goes live with the next scheduled run
 *    (every 3 hours), or straight away if you run "Publish comments" from the
 *    Actions tab on GitHub.
 *  - To answer it: type in "Your reply". Your reply shows under the comment,
 *    and if the reader left an email, they get a short note with a link.
 *  - To remove it from the site: untick "Approved". Spam can simply be deleted.
 *
 * After changing this code later: Deploy > Manage deployments > edit (pencil)
 * > Version: New version > Deploy. The URL stays the same.
 */

const SITE = "https://www.rencalago.com";
const SHEET_NAME = "Comments";
const HEADERS = ["Date", "Post", "Name", "Email", "Comment", "Approved", "Your reply", "Reader notified", "ID", "Page"];
const COL = { date: 1, post: 2, name: 3, email: 4, comment: 5, approved: 6, reply: 7, notified: 8, id: 9, page: 10 };
const MAX_COMMENT = 2000;
const MAX_LINKS = 2;

function setup() {
  const sheet = getSheet_();
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  sheet.setColumnWidth(COL.comment, 420);
  sheet.setColumnWidth(COL.reply, 320);
  tidyRows_(sheet);

  // Hourly job that emails readers when you have replied to them.
  const exists = ScriptApp.getProjectTriggers().some((t) => t.getHandlerFunction() === "notifyReplies");
  if (!exists) ScriptApp.newTrigger("notifyReplies").timeBased().everyHours(1).create();
}

// A reader posts the form.
function doPost(e) {
  const p = (e && e.parameter) || {};

  // Spam traps: a hidden field people never fill, and a minimum time on the
  // page before posting. Bots get a normal "ok" so they learn nothing.
  if (String(p.website || "").trim() !== "") return text_("ok");
  if (Number(p.elapsed || 0) < 3000) return text_("ok");

  const post = String(p.post || "").trim().toLowerCase();
  if (!/^[a-z0-9-]{1,120}$/.test(post)) return text_("ok");

  const name = clean_(p.name, 60);
  const comment = String(p.comment || "").replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n").trim().slice(0, MAX_COMMENT);
  if (!name || comment.length < 2) return text_("ok");
  if ((comment.match(/https?:\/\/|www\./gi) || []).length > MAX_LINKS) return text_("ok");

  let email = String(p.email || "").trim().toLowerCase();
  if (email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)) email = "";

  const id = Utilities.getUuid().replace(/-/g, "").slice(0, 10);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet_();
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
    // Written into the first empty row (by the Date column), so stray
    // checkboxes or formatting further down never push comments out of view.
    // Comment text keeps its line breaks; a leading = + - @ is neutralised so
    // the sheet never treats it as a formula.
    const row = lastRow_(sheet) + 1;
    if (row > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), 50);
    sheet.getRange(row, 1, 1, HEADERS.length).setValues([[new Date(), post, name, email, safeCell_(comment), false, "", "", id, clean_(p.page, 300)]]);
    sheet.getRange(row, COL.approved).insertCheckboxes();
  } finally {
    lock.releaseLock();
  }

  try {
    if (MailApp.getRemainingDailyQuota() > 1) {
      MailApp.sendEmail({
        to: Session.getEffectiveUser().getEmail(),
        subject: "New comment on " + post + " from " + name,
        body:
          name + " wrote on " + SITE + "/" + post + ":\n\n" + comment +
          "\n\nTick \"Approved\" in the sheet to publish it:\n" + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
        name: "Ren Calago Blog",
      });
    }
  } catch (err) {
    // The comment is saved either way.
  }
  return text_("ok");
}

// The scheduled GitHub job reads approved comments from here.
// Emails are never included.
function doGet() {
  const sheet = getSheet_();
  const last = lastRow_(sheet);
  const rows = last > 1 ? sheet.getRange(2, 1, last - 1, HEADERS.length).getValues() : [];
  const comments = rows
    .filter((r) => r[COL.approved - 1] === true && r[COL.id - 1] && r[COL.post - 1])
    .map((r) => ({
      id: String(r[COL.id - 1]),
      post: String(r[COL.post - 1]),
      name: unsafeCell_(String(r[COL.name - 1])),
      date: r[COL.date - 1] instanceof Date ? Utilities.formatDate(r[COL.date - 1], "Asia/Manila", "yyyy-MM-dd'T'HH:mm:ssXXX") : String(r[COL.date - 1]),
      comment: unsafeCell_(String(r[COL.comment - 1])),
      reply: unsafeCell_(String(r[COL.reply - 1] || "")),
    }));
  return ContentService.createTextOutput(JSON.stringify({ comments: comments })).setMimeType(ContentService.MimeType.JSON);
}

// Runs every hour: emails readers who left an address once you have replied
// to an approved comment.
function notifyReplies() {
  const sheet = getSheet_();
  const last = lastRow_(sheet);
  if (last < 2) return;
  const rows = sheet.getRange(2, 1, last - 1, HEADERS.length).getValues();
  rows.forEach((r, i) => {
    const email = String(r[COL.email - 1] || "").trim();
    const reply = String(r[COL.reply - 1] || "").trim();
    if (!email || !reply || r[COL.approved - 1] !== true || r[COL.notified - 1]) return;
    if (MailApp.getRemainingDailyQuota() < 1) return;
    const url = SITE + "/" + r[COL.post - 1] + "#comment-" + r[COL.id - 1];
    const name = String(r[COL.name - 1] || "");
    try {
      MailApp.sendEmail({
        to: email,
        subject: "Ren Calago replied to your comment",
        body:
          "Hi " + name + ",\n\nThanks for commenting on rencalago.com. I've replied to you here:\n" + url +
          "\n\n(The reply appears on the page within a few hours.)\n\nRen Calago\n" + SITE +
          "\n\nYou're getting this one email because you left your address with your comment.",
        name: "Ren Calago Blog",
      });
      sheet.getRange(i + 2, COL.notified).setValue(new Date());
    } catch (err) {
      sheet.getRange(i + 2, COL.notified).setValue("error: " + String(err).slice(0, 60));
    }
  });
}

// Each comment gets its own "Approved" checkbox when it arrives. Checkboxes on
// empty rows count as filled rows in Sheets and would push new comments to the
// bottom, so this moves every comment up under the header (keeping ticks and
// replies) and clears everything below them. Safe to run any time.
function tidyRows_(sheet) {
  const filled = sheet.getLastRow();
  if (filled < 2) return;
  const rows = sheet.getRange(2, 1, filled - 1, HEADERS.length).getValues();
  const keep = rows.filter((r) => r[COL.date - 1] !== "" && r[COL.date - 1] !== null);
  sheet.getRange(2, 1, filled - 1, HEADERS.length).clearDataValidations().clearContent();
  if (sheet.getMaxRows() > filled) sheet.getRange(filled + 1, 1, sheet.getMaxRows() - filled, HEADERS.length).clearDataValidations().clearContent();
  if (!keep.length) return;
  sheet.getRange(2, 1, keep.length, HEADERS.length).setValues(keep);
  sheet.getRange(2, COL.approved, keep.length, 1).insertCheckboxes();
}

// The last row that has a date in column A (1 = only the header row).
function lastRow_(sheet) {
  const filled = sheet.getLastRow();
  if (filled < 2) return Math.max(filled, 1);
  const dates = sheet.getRange(1, COL.date, filled, 1).getValues();
  for (let i = dates.length - 1; i >= 0; i--) if (dates[i][0] !== "" && dates[i][0] !== null) return i + 1;
  return 1;
}

function getSheet_() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  return book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
}

function clean_(value, max) {
  return safeCell_(String(value || "").replace(/[\r\n\t]+/g, " ").trim().slice(0, max));
}

// A leading = + - or @ would make the sheet treat the text as a formula, so
// it gets an invisible zero-width space in front, which the feed removes.
function safeCell_(s) {
  return /^[=+\-@]/.test(s) ? "​" + s : s;
}

function unsafeCell_(s) {
  return s.replace(/^​/, "");
}

function text_(s) {
  return ContentService.createTextOutput(s);
}
