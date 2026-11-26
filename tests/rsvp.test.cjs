const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'rsvp.js'), 'utf8');

async function checkForm(endpoint, values, fail = false) {
  const listeners = {};
  const guests = { disabled: false };
  const status = { textContent: '' };
  const submit = { disabled: false };
  const requests = [];
  const form = {
    addEventListener(name, callback) { listeners[name] = callback; },
    querySelector(selector) {
      if (selector.includes(':checked')) return values.attendance ? { value: values.attendance } : null;
      if (selector.includes('input[')) return { focus() {} };
      return submit;
    }
  };
  const context = {
    RSVP_ENDPOINT: endpoint,
    document: { querySelector(selector) { return selector === '#rsvpForm' ? form : selector === '#rsvpGuests' ? guests : status; } },
    FormData: class { get(key) { return values[key] ?? null; } },
    fetch: async (url, options) => { requests.push({ url, options }); if (fail) throw new Error('offline'); }
  };
  vm.runInNewContext(source, context);
  listeners.change();
  await listeners.submit({ preventDefault() {} });
  return { guests, status, requests, submit };
}

function checkReceiver() {
  const rows = [];
  let releases = 0;
  const sheet = { getLastRow: () => rows.length, appendRow: (row) => rows.push(row), setFrozenRows() {} };
  const context = {
    SpreadsheetApp: { openById: () => ({ getSheetByName: () => sheet }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() { releases += 1; } }) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (text) => ({ text, setMimeType() { return this; } }) }
  };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'google-apps-script/Code.gs'), 'utf8'), context);
  const send = (data) => JSON.parse(context.doPost({ postData: { contents: JSON.stringify(data) } }).text);
  assert.equal(send({ name: ' Khách ', attendance: 'yes', guests: 2 }).ok, true);
  assert.equal(send({ name: '=2+2', attendance: 'no', guests: 0 }).ok, true);
  assert.deepEqual(Array.from(rows[1]).slice(1), ['Khách', 'Có', 2]);
  assert.deepEqual(Array.from(rows[2]).slice(1), ["'=2+2", 'Không', 0]);
  assert.equal(send({ name: 'Khách', attendance: 'no', guests: 2 }).ok, false);
  assert.equal(rows.length, 3);
  assert.equal(releases, 2);
}

(async () => {
  let result = await checkForm('', { name: 'An', attendance: 'yes', guests: '2' });
  assert.match(result.status.textContent, /chưa thể gửi/);
  assert.equal(result.requests.length, 0);
  result = await checkForm('https://example.test/exec', { name: ' An ', attendance: 'yes', guests: '2' });
  assert.deepEqual(JSON.parse(result.requests[0].options.body), { name: 'An', attendance: 'yes', guests: 2 });
  assert.match(result.status.textContent, /^Hẹn gặp An trong ngày vui!/);
  assert.equal(result.submit.disabled, true);
  assert.equal(result.submit.textContent, 'Đã gửi xác nhận');
  result = await checkForm('https://example.test/exec', { name: 'An', attendance: 'no', guests: '2' });
  assert.equal(result.guests.disabled, true);
  assert.equal(JSON.parse(result.requests[0].options.body).guests, 0);
  assert.match(result.status.textContent, /^Thật tiếc khi thiếu An, mong sẽ có dịp gặp nhau sớm!/);
  assert.equal(result.submit.disabled, true);
  assert.equal(result.submit.textContent, 'Đã gửi xác nhận');
  result = await checkForm('https://example.test/exec', { name: 'An', attendance: 'yes', guests: '1' }, true);
  assert.match(result.status.textContent, /Chưa gửi được/);
  assert.equal(result.submit.disabled, false);
  result = await checkForm('https://example.test/exec', { name: '  ', attendance: 'yes', guests: '1' });
  assert.equal(result.requests.length, 0);
  assert.equal(result.status.textContent, 'Bạn cho chúng mình xin tên nhé!');
  result = await checkForm('https://example.test/exec', { name: 'An', guests: '1' });
  assert.equal(result.status.textContent, 'Bạn chọn giúp chúng mình có thể tham dự không nhé!');
  assert.equal(result.requests.length, 0);
  checkReceiver();
  console.log('PASS: xác nhận tham dự, lỗi kết nối và ghi Google Sheet.');
})().catch((error) => { console.error(error); process.exitCode = 1; });