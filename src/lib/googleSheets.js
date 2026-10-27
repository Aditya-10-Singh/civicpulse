const STORAGE_KEY_WEBHOOK = 'civicpulse_sheets_webhook';
const STORAGE_KEY_LOGS = 'civicpulse_sheets_logs';

export function getGoogleSheetsWebhookUrl() {
  const envUrl = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL;
  const storedUrl = localStorage.getItem(STORAGE_KEY_WEBHOOK);
  return storedUrl || (envUrl && !envUrl.includes('your-deployment-id') ? envUrl : '');
}

export function saveGoogleSheetsWebhookUrl(url) {
  if (url) localStorage.setItem(STORAGE_KEY_WEBHOOK, url.trim());
}

export function clearGoogleSheetsWebhookUrl() {
  localStorage.removeItem(STORAGE_KEY_WEBHOOK);
}

export function isGoogleSheetsConfigured() {
  const url = getGoogleSheetsWebhookUrl();
  return Boolean(url && url.startsWith('http'));
}

export function getSyncLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addSyncLog(entry) {
  const logs = getSyncLogs();
  const updated = [
    {
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      ...entry
    },
    ...logs.slice(0, 19) // keep last 20
  ];
  localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated));
  return updated;
}

/**
 * Dispatches a grievance to the Google Apps Script Web App.
 * Handles the standard Google Apps Script redirects with fetch mode: 'no-cors' fallback.
 */
export async function syncSingleGrievanceToSheets(item) {
  const webhookUrl = getGoogleSheetsWebhookUrl();
  const isMock = !webhookUrl;

  const payload = {
    action: "CREATE",
    item: {
      id: item.id,
      title: item.title,
      category: item.category,
      priority: item.priority,
      status: item.status,
      location: item.location,
      reported_by_name: item.reported_by_name,
      reported_by_email: item.reported_by_email,
      upvotes: item.upvotes || 0,
      image_url: item.image_url || ""
    }
  };

  if (isMock) {
    // Simulated sync for offline/demonstration mode
    await new Promise(r => setTimeout(r, 600));
    addSyncLog({
      type: "SINGLE_SYNC",
      status: "Simulated Success (Demo Mode)",
      itemTitle: item.title,
      details: "Mock sync completed. Connect live webhook URL to post to real Google Sheet."
    });
    return { success: true, mode: "demo", message: "Mock synced to Google Sheets" };
  }

  try {
    // Google Apps Script requires text/plain body to bypass pre-flight CORS when no-cors is used
    await fetch(webhookUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    addSyncLog({
      type: "SINGLE_SYNC",
      status: "Live Dispatched",
      itemTitle: item.title,
      details: "POST dispatched to Google Apps Script Web App"
    });

    return { success: true, mode: "live", message: "Dispatched to Google Sheet" };
  } catch (err) {
    console.error("Google Sheets Webhook Error:", err);
    addSyncLog({
      type: "SINGLE_SYNC",
      status: "Error",
      itemTitle: item.title,
      details: err.message
    });
    throw err;
  }
}

/**
 * Dispatches an email OTP via Google Apps Script Mailer (100 free real emails/day).
 */
export async function sendOtpViaGoogleSheets(email, otp, fullName) {
  const webhookUrl = getGoogleSheetsWebhookUrl();
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    return { success: false, mode: 'unconfigured' };
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        action: "SEND_OTP",
        email: email.trim().toLowerCase(),
        otp,
        fullName: fullName || "Citizen"
      })
    });

    addSyncLog({
      type: "OTP_DISPATCH",
      status: "Email Sent",
      itemTitle: `OTP for ${email}`,
      details: "Dispatched verification email to inbox via Google Apps Script"
    });

    return { success: true, mode: 'live' };
  } catch (err) {
    console.warn("Google Apps Script email dispatch error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Dispatches all grievances in a batch to overwrite/sync the Google Sheet tab.
 */
export async function syncAllGrievancesToSheets(items) {
  const webhookUrl = getGoogleSheetsWebhookUrl();
  const isMock = !webhookUrl;

  const payload = {
    action: "BULK_SYNC",
    items: items.map(item => ({
      id: item.id,
      title: item.title,
      category: item.category,
      priority: item.priority,
      status: item.status,
      location: item.location,
      reported_by_name: item.reported_by_name,
      reported_by_email: item.reported_by_email,
      upvotes: item.upvotes || 0,
      image_url: item.image_url || ""
    }))
  };

  if (isMock) {
    await new Promise(r => setTimeout(r, 900));
    addSyncLog({
      type: "BULK_SYNC",
      status: "Simulated Success (Demo Mode)",
      itemTitle: `${items.length} records`,
      details: `Simulated bulk sync of ${items.length} rows to Google Sheets.`
    });
    return { success: true, mode: "demo", count: items.length };
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    addSyncLog({
      type: "BULK_SYNC",
      status: "Live Dispatched",
      itemTitle: `${items.length} records`,
      details: `Bulk sync payload sent to Google Apps Script.`
    });

    return { success: true, mode: "live", count: items.length };
  } catch (err) {
    console.error("Bulk sync error:", err);
    addSyncLog({
      type: "BULK_SYNC",
      status: "Error",
      itemTitle: `${items.length} records`,
      details: err.message
    });
    throw err;
  }
}

/**
 * Instant CSV export for offline Google Sheets / Excel import
 */
export function exportToCsv(items) {
  const headers = [
    "ID", "Title", "Category", "Priority", "Status", "Location", 
    "Reported By", "Email", "Upvotes", "Created At"
  ];

  const rows = items.map(i => [
    `"${i.id}"`,
    `"${(i.title || '').replace(/"/g, '""')}"`,
    `"${i.category || ''}"`,
    `"${i.priority || ''}"`,
    `"${i.status || ''}"`,
    `"${(i.location || '').replace(/"/g, '""')}"`,
    `"${(i.reported_by_name || '').replace(/"/g, '""')}"`,
    `"${i.reported_by_email || ''}"`,
    i.upvotes || 0,
    `"${i.created_at || ''}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `CivicPulse_Grievances_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
