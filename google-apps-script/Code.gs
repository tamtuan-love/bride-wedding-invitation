const SPREADSHEET_ID = '1gVEeNlDlu2KJvrlCGS9k2x2DqUHy1HZZiAKJvjdj3sQ';
const SHEET_NAME = 'RSVP_BRIDE';

function doPost(event) {
  try {
    const data = JSON.parse(event.postData.contents);
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    const attendance = data.attendance;
    const guests = data.guests;
    if (!name || name.length > 100 || !['yes', 'no'].includes(attendance) ||
        !Number.isInteger(guests) || (attendance === 'yes' && (guests < 1 || guests > 10)) ||
        (attendance === 'no' && guests !== 0)) {
      throw new Error('Invalid RSVP');
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['Thời gian gửi', 'Họ và tên', 'Tham dự', 'Số lượng']);
        sheet.setFrozenRows(1);
      }
      const safeName = /^[=+\-@]/.test(name) ? "'" + name : name;
      sheet.appendRow([new Date(), safeName, attendance === 'yes' ? 'Có' : 'Không', guests]);
    } finally {
      lock.releaseLock();
    }
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false })).setMimeType(ContentService.MimeType.JSON);
  }
}