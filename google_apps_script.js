/**
 * ============================================================================
 * CivicPulse — Google Sheets Integration Webhook (Google Apps Script)
 * ============================================================================
 * 
 * INSTRUCTIONS TO DEPLOY:
 * 1. Open Google Sheets (https://sheets.new)
 * 2. Rename the Sheet tab to "Grievances"
 * 3. Go to: Extensions > Apps Script
 * 4. Paste this complete code into the editor (replace any existing code)
 * 5. Click "Save" (disk icon)
 * 6. Click "Deploy" > "New deployment"
 * 7. Click the gear icon next to "Select type" and choose "Web app"
 * 8. Set:
 *    - Description: "CivicPulse Webhook Sync"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (crucial for client-side POST requests)
 * 9. Click "Deploy" and authorize the script permissions
 * 10. Copy the Web App URL (starts with https://script.google.com/macros/s/...)
 * 11. Paste that URL into CivicPulse (or in .env as VITE_GOOGLE_SHEETS_WEBHOOK_URL)
 */

function setupHeaders(sheet) {
  const headers = [
    "Timestamp",
    "Grievance ID",
    "Title",
    "Category",
    "Priority",
    "Status",
    "Location",
    "Reported By",
    "Contact Email",
    "Upvotes",
    "Image URL"
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight("bold")
    .setBackground("#0284c7")
    .setFontColor("#ffffff")
    .setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("Grievances");
    if (!sheet) {
      sheet = ss.insertSheet("Grievances");
      setupHeaders(sheet);
    } else if (sheet.getLastRow() === 0) {
      setupHeaders(sheet);
    }

    const data = JSON.parse(e.postData.contents);
    const action = data.action || "CREATE"; // CREATE, BULK_SYNC, or SEND_OTP

    // 1. Direct Email OTP Dispatch (Real inbox delivery via Google Apps Script Mailer)
    if (action === "SEND_OTP") {
      const recipient = data.email;
      const otp = data.otp;
      const name = data.fullName || "Citizen";

      MailApp.sendEmail({
        to: recipient,
        subject: "Your CivicPulse Verification Code: " + otp,
        htmlBody: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
            <div style="margin-bottom: 24px;">
              <span style="font-size: 24px;">🏛️</span>
              <span style="font-size: 20px; font-weight: 800; color: #1e1b4b; letter-spacing: -0.5px; margin-left: 8px;">CivicPulse</span>
            </div>
            <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 8px;">Verify Your Email Address</h2>
            <p style="font-size: 14px; color: #475569; line-height: 1.5; margin-bottom: 24px;">
              Hello <strong>${name}</strong>,<br>
              Please use the verification code below to complete your registration or login on CivicPulse.
            </p>
            <div style="background: #f5f3ff; border: 1px dashed #c4b5fd; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #7c3aed; margin-bottom: 6px;">Your 6-Digit OTP Code</div>
              <div style="font-size: 36px; font-weight: 800; font-family: monospace; letter-spacing: 8px; color: #5b21b6;">${otp}</div>
            </div>
            <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 16px;">
              ⏱️ This code expires in 10 minutes. If you did not request this code, you can safely ignore this email.
            </p>
            <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; font-size: 11px; color: #94a3b8;">
              CivicPulse Municipal Infrastructure Portal • Ward 14 Redressal System
            </div>
          </div>
        `
      });

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "OTP code dispatched directly to " + recipient,
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "BULK_SYNC" && Array.isArray(data.items)) {
      // Clear old rows except header and rewrite
      if (sheet.getLastRow() > 1) {
        sheet.deleteRows(2, sheet.getLastRow() - 1);
      }
      const rows = data.items.map(item => [
        new Date().toISOString(),
        item.id || Utilities.getUuid(),
        item.title || "Untitled",
        item.category || "General",
        item.priority || "Medium",
        item.status || "Pending Review",
        item.location || "N/A",
        item.reported_by_name || "Anonymous",
        item.reported_by_email || "N/A",
        item.upvotes || 0,
        item.image_url || ""
      ]);

      if (rows.length > 0) {
        sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Bulk synchronized " + rows.length + " grievances into Google Sheets",
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Default: Single row append
    const item = data.item || data;
    const row = [
      new Date().toISOString(),
      item.id || Utilities.getUuid(),
      item.title || "Untitled",
      item.category || "General",
      item.priority || "Medium",
      item.status || "Pending Review",
      item.location || "N/A",
      item.reported_by_name || "Anonymous",
      item.reported_by_email || "N/A",
      item.upvotes || 1,
      item.image_url || ""
    ];

    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Grievance logged successfully into Google Sheets",
      id: item.id,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Test endpoint / connectivity check
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "CivicPulse Google Sheets Webhook Sync Engine",
    time: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
