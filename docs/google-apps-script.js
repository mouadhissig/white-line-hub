/**
 * Google Apps Script – White Line Hub Survey Webhook
 *
 * Deploy as a Web App (Execute as: Me, Who has access: Anyone).
 * After each redeploy you will get a new URL – update WEBHOOK_URL in
 * src/pages/Survey.tsx accordingly.
 *
 * POST  → records a new registration in the active sheet.
 * GET?action=counts → returns JSON { success, cap, counts: { atelier1..4 } }.
 */

/** Maximum registrations per atelier. Keep in sync with DEFAULT_ATELIER_CAP in src/pages/Survey.tsx. */
var CAP = 20;

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents || "{}");

    // Add header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Date",
        "Nom et prénom",
        "Email",
        "Statut",
        "Niveau d'étude",
        "Conférences",
        "AtelierId",
        "Atelier"
      ]);
    }

    // Accept stable id (atelier1..4) and/or human-readable label
    var atelierId    = String(data.atelierId    || data.atelier || "").trim();
    var atelierLabel = String(data.atelierLabel || data.atelier || "").trim();

    sheet.appendRow([
      data.date ? new Date(data.date) : new Date(),
      data.nomPrenom   || "",
      data.email       || "",
      data.statut      || "",
      data.niveauEtude || "",
      data.conferences || "",
      atelierId,
      atelierLabel
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "";

    if (action !== "counts") {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "Webhook actif" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var sheet  = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var values = sheet.getDataRange().getValues(); // includes header row
    var counts = { atelier1: 0, atelier2: 0, atelier3: 0, atelier4: 0 };

    if (values.length <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, cap: CAP, counts: counts }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Detect column indexes from header row
    var header       = values[0].map(String);
    var idxAtelierId = header.indexOf("AtelierId");
    var idxAtelier   = header.indexOf("Atelier");

    for (var i = 1; i < values.length; i++) {
      var row = values[i];
      var a   = "";

      if (idxAtelierId >= 0 && row[idxAtelierId]) {
        a = String(row[idxAtelierId]).trim();
      } else if (idxAtelier >= 0 && row[idxAtelier]) {
        // Backward compatibility: map French label → stable id
        var label = String(row[idxAtelier]).toLowerCase();
        if      (label.indexOf("atelier 1") !== -1 || label === "atelier1") a = "atelier1";
        else if (label.indexOf("atelier 2") !== -1 || label === "atelier2") a = "atelier2";
        else if (label.indexOf("atelier 3") !== -1 || label === "atelier3") a = "atelier3";
        else if (label.indexOf("atelier 4") !== -1 || label === "atelier4") a = "atelier4";
      }

      if (Object.prototype.hasOwnProperty.call(counts, a)) counts[a]++;
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, cap: CAP, counts: counts }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
