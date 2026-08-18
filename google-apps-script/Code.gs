const NOTIFY_EMAIL = 'Hilltopprayerministry@gmail.com';
const SPREADSHEET_NAME = 'Hilltop Prayer & Evangelical Ministry Submissions';

function getSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('SPREADSHEET_ID');

  if (id) {
    try {
      return SpreadsheetApp.openById(id);
    } catch (e) {
      props.deleteProperty('SPREADSHEET_ID');
    }
  }

  const spreadsheet = SpreadsheetApp.create(SPREADSHEET_NAME);
  props.setProperty('SPREADSHEET_ID', spreadsheet.getId());

  const members = spreadsheet.getSheets()[0];
  members.setName('Members');
  members.appendRow(['Timestamp', 'Name', 'Email', 'Phone']);

  const prayers = spreadsheet.insertSheet('Prayer Points');
  prayers.appendRow(['Timestamp', 'Name', 'Email', 'Phone', 'Prayer Point']);

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: 'Hilltop submissions spreadsheet created',
    htmlBody: 'A Google Sheet has been created for Hilltop Prayer & Evangelical Ministry submissions.<br><br><a href="' + spreadsheet.getUrl() + '">Open the Hilltop submissions spreadsheet</a>'
  });

  return spreadsheet;
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const spreadsheet = getSpreadsheet_();
    const timestamp = new Date();

    if (payload.type === 'member') {
      const sheet = spreadsheet.getSheetByName('Members');
      sheet.appendRow([timestamp, payload.name || '', payload.email || '', payload.phone || '']);

      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: 'New Hilltop church member registration',
        htmlBody: '<h2>New Member Registration</h2>' +
          '<p><strong>Name:</strong> ' + escapeHtml_(payload.name) + '</p>' +
          '<p><strong>Email:</strong> ' + escapeHtml_(payload.email) + '</p>' +
          '<p><strong>Phone:</strong> ' + escapeHtml_(payload.phone) + '</p>' +
          '<p><a href="' + spreadsheet.getUrl() + '">Open the Members spreadsheet</a></p>'
      });
    } else if (payload.type === 'prayer_point') {
      const sheet = spreadsheet.getSheetByName('Prayer Points');
      sheet.appendRow([timestamp, payload.name || '', payload.email || '', payload.phone || '', payload.prayerPoint || '']);

      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: 'New Hilltop prayer point submitted',
        htmlBody: '<h2>New Prayer Point</h2>' +
          '<p><strong>Name:</strong> ' + escapeHtml_(payload.name) + '</p>' +
          '<p><strong>Email:</strong> ' + escapeHtml_(payload.email) + '</p>' +
          '<p><strong>Phone:</strong> ' + escapeHtml_(payload.phone) + '</p>' +
          '<p><strong>Prayer Point:</strong><br>' + escapeHtml_(payload.prayerPoint) + '</p>' +
          '<p><a href="' + spreadsheet.getUrl() + '">Open the Prayer Points spreadsheet</a></p>'
      });
    } else {
      throw new Error('Unknown submission type');
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function escapeHtml_(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br>');
}
