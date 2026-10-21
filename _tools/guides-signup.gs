/**
 * Free travel guides sign-up: Google Apps Script web app.
 *
 * Saves each sign-up from rencalago.com to a Google Sheet and emails the
 * download links from the Google account that deploys it. Nothing here is
 * published on the site (this folder starts with "_"); it is kept in the repo
 * so the code that receives the form lives next to the form.
 *
 * SET UP (about 10 minutes, once)
 *  1. Open https://sheets.new while signed in as the blog's Google account and
 *     name the sheet "Free guides sign-ups".
 *  2. In the sheet: Extensions > Apps Script. Delete what is in Code.gs and
 *     paste this whole file in. Save.
 *  3. Run the function `setup` once (pick it in the toolbar, press Run) and
 *     allow the permissions it asks for. It adds the header row.
 *  4. Deploy > New deployment > type "Web app".
 *       Execute as: Me
 *       Who has access: Anyone
 *     Press Deploy and copy the Web app URL (it ends in /exec).
 *  5. Paste that URL into ENDPOINT at the top of guides-signup.js in the repo.
 *
 * After changing this code later: Deploy > Manage deployments > edit (pencil)
 * > Version: New version > Deploy. The URL stays the same.
 *
 * Gmail limits how many emails a script can send per day. If the quota runs
 * out, the row is still saved and the reader still gets the downloads on the
 * page; the "emailed" column shows "quota" for anyone who missed the email.
 */

const SITE = "https://www.rencalago.com";
const SHEET_NAME = "Sign-ups";
const HEADERS = ["Date", "Name", "Email", "Guides", "Consent", "Source", "Page", "Emailed"];

const GUIDES = {
  "weekend-escapes": { title: "Weekend Escapes from Cebu", file: "/downloads/weekend-escapes-from-cebu.pdf" },
  "bisaya-phrasebook": { title: "Bisaya Phrasebook", file: "/downloads/bisaya-phrasebook.pdf" },
  "food-passport": { title: "Visayas Food Passport", file: "/downloads/visayas-food-passport.pdf" },
};

function setup() {
  const sheet = getSheet_();
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  sheet.setFrozenRows(1);
}

function doPost(e) {
  const p = (e && e.parameter) || {};
  const email = String(p.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return ok_();

  const chosen = String(p.guides || "")
    .split(",")
    .map((g) => g.trim())
    .filter((g) => GUIDES[g]);
  const guides = chosen.length ? chosen : Object.keys(GUIDES);
  const name = clean_(p.name, 60);

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  let row;
  try {
    const sheet = getSheet_();
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
    sheet.appendRow([new Date(), name, email, guides.join(", "), clean_(p.consent, 10), clean_(p.source, 80), clean_(p.page, 300), "pending"]);
    row = sheet.getLastRow();
  } finally {
    lock.releaseLock();
  }

  let status = "sent";
  try {
    if (MailApp.getRemainingDailyQuota() < 1) {
      status = "quota";
    } else {
      sendGuides_(email, name, guides);
    }
  } catch (err) {
    status = "error: " + String(err).slice(0, 80);
  }
  getSheet_().getRange(row, HEADERS.length).setValue(status);
  return ok_();
}

function sendGuides_(email, name, guides) {
  const hello = name ? "Hi " + name + "," : "Hi,";
  const items = guides.map((g) => GUIDES[g]);
  const text =
    hello + "\n\nThanks for signing up. Here are your free guides:\n\n" +
    items.map((g) => "- " + g.title + ": " + SITE + g.file).join("\n") +
    "\n\nPrint them, or keep them on your phone for the trip.\n\nRen Calago\n" + SITE +
    "\n\nYou're getting this because you asked for these guides on rencalago.com. Reply \"unsubscribe\" and we'll stop emailing you.";
  const html =
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1b2626;max-width:560px">' +
    "<p>" + escape_(hello) + "</p><p>Thanks for signing up. Here are your free guides:</p>" +
    items
      .map(
        (g) =>
          '<p style="margin:10px 0"><a href="' + SITE + g.file + '" style="display:inline-block;padding:10px 18px;border-radius:999px;background:#e0a526;color:#1b2626;font-weight:bold;text-decoration:none">Download ' +
          escape_(g.title) + "</a></p>"
      )
      .join("") +
    "<p>Print them, or keep them on your phone for the trip.</p>" +
    '<p>Ren Calago<br><a href="' + SITE + '" style="color:#0b7a7c">rencalago.com</a></p>' +
    '<p style="font-size:12px;color:#64716f">You\'re getting this because you asked for these guides on rencalago.com. Reply "unsubscribe" and we\'ll stop emailing you.</p></div>';
  MailApp.sendEmail({ to: email, subject: "Your free travel guides from Ren Calago Blog", body: text, htmlBody: html, name: "Ren Calago Blog" });
}

function getSheet_() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  return book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
}

function clean_(value, max) {
  // A leading = + - or @ would make the sheet treat the value as a formula.
  return String(value || "").replace(/[\r\n\t]+/g, " ").replace(/^[=+\-@]+/, "").trim().slice(0, max);
}

function escape_(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function ok_() {
  return ContentService.createTextOutput("ok");
}
