const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class Element {
  constructor() {
    this.dataset = {};
    this.attributes = {};
    this.listeners = {};
    this.children = [];
    this.style = {};
    this.paused = true;
    this.classList = {
      values: new Set(),
      add(value) { this.values.add(value); },
      remove(value) { this.values.delete(value); },
      toggle(value, enabled) { if (enabled) this.values.add(value); else this.values.delete(value); },
      contains(value) { return this.values.has(value); }
    };
  }
  setAttribute(name, value) { this.attributes[name] = value; }
  addEventListener(name, callback) { this.listeners[name] = callback; }
  append(child) { this.children.push(child); }
  contains(target) { return target === this; }
  scrollIntoView(options) { this.scrollOptions = options; }
  showModal() { this.open = true; }
  close() { this.open = false; }
  click() { this.clicked = true; }
  play() { this.paused = false; this.listeners.play?.(); return Promise.resolve(); }
  pause() { this.paused = true; this.listeners.pause?.(); }
  remove() { this.removed = true; }
}
const root = path.resolve(__dirname, '..');
const elements = new Map();
const select = (selector) => {
  if (!elements.has(selector)) elements.set(selector, new Element());
  return elements.get(selector);
};
const windowListeners = {};
const documentListeners = {};
const document = {
  querySelector: select,
  querySelectorAll: () => [],
  getElementById: (identifier) => select(`#${identifier}`),
  createElement: () => new Element(),
  body: new Element(),
  documentElement: { scrollHeight: 5000 },
  addEventListener: (name, callback) => { documentListeners[name] = callback; }
};
const context = vm.createContext({
  document, Date, TextEncoder, Blob, URL, URLSearchParams,
  window: {
    navigator: { userAgent: 'Desktop browser', maxTouchPoints: 0 },
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    setInterval() {}, setTimeout() {}, cancelAnimationFrame() {}, requestAnimationFrame() { return 1; },
    addEventListener: (name, callback) => { windowListeners[name] = callback; },
    scrollY: 0, innerHeight: 800, scrollBy() {}
  }
});
vm.runInContext(fs.readFileSync(path.join(root, 'config.js'), 'utf8'), context);
vm.runInContext(fs.readFileSync(path.join(root, 'app.js'), 'utf8'), context);
const evaluate = (source) => vm.runInContext(source, context);

const before = JSON.parse(JSON.stringify(evaluate("countdownParts(new Date('2026-12-19T01:27:56Z').getTime())")));
assert.deepEqual(before, { days: 1, hours: 2, minutes: 2, seconds: 4 });
const after = JSON.parse(JSON.stringify(evaluate("countdownParts(new Date('2026-12-21T00:00:00Z').getTime())")));
assert.deepEqual(after, { days: 0, hours: 0, minutes: 0, seconds: 0 });

const cells = select('#calendarDays').children;
assert.equal(cells.length, 32);
assert.equal(cells[1].textContent, 1);
assert.equal(cells[20].textContent, 20);
assert.equal(cells[20].className, 'selected');
assert.equal(cells[31].textContent, 31);

const music = select('#weddingMusic');
const soundToggle = select('#soundToggle');
assert.equal(music.src, 'music/le-duong-music.m4a');
assert.equal(music.loop, true);
assert.equal(soundToggle.attributes['aria-pressed'], 'false');
select('#startInvitation').listeners.click();
assert.equal(select('#opening').classList.contains('is-open'), true);
assert.equal(select('#home').scrollOptions.behavior, 'instant');
assert.equal(select('#countdown').scrollOptions, undefined);
assert.equal(select('#scrollToggle').attributes['aria-pressed'], 'true');
assert.equal(music.paused, false);
assert.equal(soundToggle.attributes['aria-pressed'], 'true');
soundToggle.listeners.click();
assert.equal(music.paused, true);
assert.equal(soundToggle.attributes['aria-pressed'], 'false');
soundToggle.listeners.click();
assert.equal(music.paused, false);
assert.equal(soundToggle.attributes['aria-pressed'], 'true');

const googleCalendar = new URL(evaluate('googleCalendarUrl()'));
assert.equal(googleCalendar.origin, 'https://calendar.google.com');
assert.equal(googleCalendar.searchParams.get('text'), 'Tiệc cưới nhà gái Minh Tâm & Minh Tuấn');
assert.equal(googleCalendar.searchParams.get('dates'), '20261220T030000Z/20261220T063000Z');
assert.equal(googleCalendar.searchParams.get('location'), 'Crown Palace, 779 Đường Tự Minh · P. Quan Triều · Tỉnh Thái Nguyên');
assert.ok(googleCalendar.searchParams.get('details').includes('Đón khách và chụp ảnh 10:00'));
assert.ok(googleCalendar.searchParams.get('details').includes('https://maps.app.goo.gl/MUk89jSk6gXEgYFA7'));

select('#openInvitation').listeners.click();
assert.equal(select('#countdown').scrollOptions, undefined);
assert.equal(select('#scrollToggle').attributes['aria-pressed'], 'true');
assert.equal(select('#scrollToggle').attributes['aria-pressed'], 'true');
assert.equal(music.paused, false);
assert.equal(select('#hearts').children.length, 0);
select('#scrollToggle').listeners.click();
assert.equal(select('#scrollToggle').attributes['aria-pressed'], 'false');
windowListeners.wheel();
assert.equal(select('#scrollToggle').attributes['aria-pressed'], 'false');
select('#saveDate').listeners.click();
assert.ok(document.body.children.at(-1).clicked);
assert.ok(document.body.children.at(-1).href.startsWith('https://calendar.google.com/calendar/render?'));
assert.equal(document.body.children.at(-1).target, '_blank');
context.window.navigator.userAgent = 'iPhone';
select('#saveDate').listeners.click();
assert.ok(document.body.children.at(-1).clicked);
assert.equal(document.body.children.at(-1).href, googleCalendar.href);
context.window.navigator.userAgent = 'Android';
select('#saveDate').listeners.click();
assert.equal(document.body.children.at(-1).href, googleCalendar.href);
context.window.navigator.userAgent = 'Macintosh';
context.window.navigator.maxTouchPoints = 5;
select('#saveDate').listeners.click();
assert.equal(document.body.children.at(-1).href, googleCalendar.href);

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.equal((html.match(/>WEDDING INVITATION</g) || []).length, 2);
assert.ok(html.includes('id="countdown"'));
assert.equal((html.match(/class="countdown__separator"/g) || []).length, 3);
assert.ok(html.indexOf('id="countdownLabel"') < html.indexOf('id="familyPortraitsTitle"'));
assert.ok(html.indexOf('id="home"') < html.indexOf('id="countdownLabel"'));
assert.ok(html.includes('THƯ MỜI THAM DỰ LỄ CƯỚI'));
assert.ok(html.includes('Bạn &amp; Người thương'));
assert.ok(html.includes('Một tình yêu được khắc trên tim'));
assert.ok(html.includes('<h3><span data-field="groomFamilyName">Phạm</span> <span data-field="groomShort">Minh Tuấn</span></h3>'));
assert.ok(html.includes('<h3><span data-field="brideFamilyName">Dương Thị</span> <span data-field="brideShort">Minh Tâm</span></h3>'));
assert.ok(html.includes('class="event-card event-card--invitation reveal"'));
assert.ok(html.indexOf('id="invitation"') < html.indexOf('id="event"'));
assert.ok(html.indexOf('id="event"') < html.indexOf('aria-labelledby="galleryTitle"'));
assert.ok(html.includes('data-field="venue">Crown Palace'));
assert.ok(html.includes('data-field="receptionTime">10:00'));
assert.ok(html.includes('THÁNG 12 / 2026'));
assert.ok(fs.existsSync(path.join(root, 'images/optimized/family-background.jpeg')));
assert.ok(html.indexOf('family-portrait--groom') < html.indexOf('family-portrait--bride'));
assert.ok(html.indexOf('family-portrait--bride') < html.indexOf('family-portraits__families'));
assert.ok(html.includes('data-field="groomFather">Phạm Văn Linh'));
assert.ok(html.includes('data-field="brideFather">Dương Trung Dũng'));
assert.ok(!/03\.01\.2027|Nhà hàng Phố Mới|kiq6mT2zDrbaWFFt7/.test(html));
assert.ok(html.includes('<p class="footer__thank-you">Thank you</p>'));
const galleryImages = [...html.matchAll(/<figure class="gallery__item[^\"]*"><img src="([^\"]+)"/g)].map((match) => match[1]);
assert.equal(galleryImages.length, 12);
assert.equal(galleryImages.at(-1), 'images/optimized/TLG_8029.jpeg');
assert.ok(html.includes('id="galleryCarousel"'));
assert.ok(html.includes('id="galleryPrevious"'));
assert.ok(html.includes('id="galleryNext"'));
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const resource = match[1];
  if (!resource.startsWith('https:')) assert.ok(fs.existsSync(path.join(root, resource)), `Missing asset: ${resource}`);
}
for (const filename of ['index.html', 'config.js', 'app.js', 'content/reference-content.md']) {
  const content = fs.readFileSync(path.join(root, filename), 'utf8');
  assert.ok(!/Thanh Bình|Hải Dương|2026-09-27|bank_mimi|wedding-rsvps|cinelove\.me/.test(content), `Stale sample content in ${filename}`);
}
console.log('PASS: đếm ngược trước/sau tiệc, lịch tháng, mở thiệp, tự cuộn, modal, Google Calendar và asset cục bộ.');