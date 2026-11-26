const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const scrollToggle = document.querySelector('#scrollToggle');
const opening = document.querySelector('#opening');
const heroPhoto = document.querySelector('.hero__photo');
const weddingMusic = document.querySelector('#weddingMusic');
const soundToggle = document.querySelector('#soundToggle');
let autoScroll = false;
let autoScrollTarget = null;
let autoScrollHoldUntil = 0;
let lastFrame = 0;
let scrollFrame = 0;

document.querySelectorAll('[data-field]').forEach((element) => {
  element.textContent = WEDDING[element.dataset.field];
});
document.querySelectorAll('[data-image]').forEach((element) => {
  element.src = WEDDING[element.dataset.image];
});
document.querySelectorAll('[data-map]').forEach((element) => {
  element.href = WEDDING.mapUrl;
});
weddingMusic.src = WEDDING.musicFile;
weddingMusic.loop = true;
document.title = `${WEDDING.brideShort} & ${WEDDING.groomShort} | Thiệp cưới nhà gái`;

function renderIcons() {
  if (window.lucide) window.lucide.createIcons();
}
renderIcons();

function updateSoundButton() {
  const playing = !weddingMusic.paused;
  soundToggle.classList.toggle?.('is-playing', playing);
  soundToggle.setAttribute('aria-pressed', String(playing));
  const label = playing ? 'Tắt nhạc' : 'Bật nhạc';
  soundToggle.setAttribute('aria-label', label);
  soundToggle.title = label;
  soundToggle.innerHTML = '<i data-lucide="music-2" aria-hidden="true"></i>';
  renderIcons();
}
async function playWeddingMusic() {
  try {
    await weddingMusic.play();
    document.querySelector('#actionStatus').textContent = 'Nhạc đang phát.';
  } catch {
    document.querySelector('#actionStatus').textContent = 'Chưa thể phát nhạc. Hãy thử bật nhạc bằng nút điều khiển.';
  }
  updateSoundButton();
}
weddingMusic.addEventListener('play', updateSoundButton);
weddingMusic.addEventListener('pause', updateSoundButton);
weddingMusic.addEventListener('error', () => {
  document.querySelector('#actionStatus').textContent = 'Không tải được tệp nhạc.';
  updateSoundButton();
});
soundToggle.addEventListener('click', () => {
  if (weddingMusic.paused) playWeddingMusic();
  else weddingMusic.pause();
});
updateSoundButton();

const targetDate = new Date(WEDDING.date).getTime();
function countdownParts(now) {
  const remaining = Math.max(0, targetDate - now);
  return {
    days: Math.floor(remaining / 86400000),
    hours: Math.floor(remaining / 3600000) % 24,
    minutes: Math.floor(remaining / 60000) % 60,
    seconds: Math.floor(remaining / 1000) % 60
  };
}
function updateCountdown() {
  Object.entries(countdownParts(Date.now())).forEach(([identifier, value]) => {
    document.getElementById(identifier).textContent = String(value).padStart(2, '0');
  });
  if (Date.now() >= targetDate) {
    document.querySelector('#countdownLabel').textContent = 'NGÀY VUI ĐÃ ĐẾN · CẢM ƠN BẠN ĐÃ CHUNG VUI';
  }
}
updateCountdown();
window.setInterval(updateCountdown, 1000);

const calendarDate = new Date(WEDDING.date);
const calendarDays = document.querySelector('#calendarDays');
const firstDay = new Date(Date.UTC(calendarDate.getUTCFullYear(), calendarDate.getUTCMonth(), 1));
const offset = (firstDay.getUTCDay() + 6) % 7;
const totalDays = new Date(Date.UTC(calendarDate.getUTCFullYear(), calendarDate.getUTCMonth() + 1, 0)).getUTCDate();
for (let dayIndex = 0; dayIndex < offset + totalDays; dayIndex += 1) {
  const cell = document.createElement('span');
  if (dayIndex >= offset) {
    const day = dayIndex - offset + 1;
    cell.textContent = day;
    if (day === calendarDate.getUTCDate()) {
      cell.className = 'selected';
      cell.setAttribute('aria-label', `Ngày ${day}, ngày tiệc cưới`);
    }
  } else {
    cell.setAttribute('aria-hidden', 'true');
  }
  calendarDays.append(cell);
}

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  document.body.classList.add('motion-ready');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal:not(.gallery__item)').forEach((element) => observer.observe(element));
}

const galleryCarousel = document.querySelector('#galleryCarousel');
const galleryTrack = document.querySelector('#galleryTrack');
const galleryPagination = document.querySelector('#galleryPagination');
const galleryItems = Array.from(document.querySelectorAll('.gallery__item'));
let activeGalleryIndex = 0;
let galleryTimer;
let touchStartX = 0;
let touchStartY = 0;

function renderGallery(index) {
  if (!galleryItems.length) return;
  activeGalleryIndex = (index + galleryItems.length) % galleryItems.length;
  galleryItems.forEach((item, itemIndex) => {
    let offset = itemIndex - activeGalleryIndex;
    if (offset > galleryItems.length / 2) offset -= galleryItems.length;
    if (offset < -galleryItems.length / 2) offset += galleryItems.length;
    const distance = Math.abs(offset);
    item.style.setProperty('--slide-x', `${offset * 74}%`);
    item.style.setProperty('--slide-scale', distance === 0 ? '1' : distance === 1 ? '.84' : '.68');
    item.style.setProperty('--slide-rotate', offset === 0 ? '0deg' : offset < 0 ? '13deg' : '-13deg');
    item.style.setProperty('--slide-opacity', distance === 0 ? '1' : distance === 1 ? '.72' : distance === 2 ? '.22' : '0');
    item.style.setProperty('--slide-depth', String(5 - distance));
    item.classList.toggle('is-active', distance === 0);
    item.setAttribute('aria-hidden', String(distance > 1));
    item.querySelector('img').loading = distance <= 1 ? 'eager' : 'lazy';
    if (itemIndex < galleryPagination.children.length) {
      galleryPagination.children[itemIndex].setAttribute('aria-current', String(itemIndex === activeGalleryIndex));
    }
  });
}

galleryItems.forEach((item, itemIndex) => {
  const dot = document.createElement('button');
  dot.className = 'gallery__dot';
  dot.type = 'button';
  dot.setAttribute('aria-label', `Xem ảnh ${itemIndex + 1} trong ${galleryItems.length}`);
  dot.addEventListener('click', () => renderGallery(itemIndex));
  galleryPagination.append(dot);
  item.addEventListener('click', () => renderGallery(itemIndex));
});

function startGalleryAutoplay() {
  if (reducedMotion.matches || galleryItems.length < 2 || galleryTimer) return;
  galleryTimer = window.setInterval(() => renderGallery(activeGalleryIndex + 1), 5200);
}
function stopGalleryAutoplay() {
  if (!galleryTimer) return;
  window.clearInterval(galleryTimer);
  galleryTimer = undefined;
}

document.querySelector('#galleryPrevious').addEventListener('click', () => renderGallery(activeGalleryIndex - 1));
document.querySelector('#galleryNext').addEventListener('click', () => renderGallery(activeGalleryIndex + 1));
galleryCarousel.addEventListener('mouseenter', stopGalleryAutoplay);
galleryCarousel.addEventListener('mouseleave', startGalleryAutoplay);
galleryCarousel.addEventListener('focusin', stopGalleryAutoplay);
galleryCarousel.addEventListener('focusout', (event) => {
  if (!galleryCarousel.contains(event.relatedTarget)) startGalleryAutoplay();
});
galleryCarousel.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    renderGallery(activeGalleryIndex + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
galleryTrack.addEventListener('touchstart', (event) => {
  touchStartX = event.changedTouches[0].clientX;
  touchStartY = event.changedTouches[0].clientY;
  stopGalleryAutoplay();
}, { passive: true });
galleryTrack.addEventListener('touchend', (event) => {
  const deltaX = event.changedTouches[0].clientX - touchStartX;
  const deltaY = event.changedTouches[0].clientY - touchStartY;
  if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
    renderGallery(activeGalleryIndex + (deltaX < 0 ? 1 : -1));
  }
  startGalleryAutoplay();
}, { passive: true });
renderGallery(0);
startGalleryAutoplay();

function createHearts() {
  if (reducedMotion.matches) return;
  for (let heartIndex = 0; heartIndex < 9; heartIndex += 1) {
    window.setTimeout(() => {
      const heart = document.createElement('span');
      heart.className = 'heart';
      heart.textContent = '♥';
      heart.style.left = `${25 + Math.random() * 50}%`;
      document.querySelector('#hearts').append(heart);
      heart.addEventListener('animationend', () => heart.remove(), { once: true });
    }, heartIndex * 120);
  }
}

function gentlyScroll(timestamp) {
  if (!autoScroll) return;
  if (lastFrame) {
    const elapsed = Math.min(timestamp - lastFrame, 100);
    if (autoScrollTarget) {
      const remaining = autoScrollTarget.getBoundingClientRect().top - 56;
      if (remaining > 1) {
        window.scrollBy({ top: Math.min(remaining, elapsed * 0.8), behavior: 'instant' });
      } else {
        autoScrollTarget = null;
        autoScrollHoldUntil = timestamp + 1000;
      }
    } else if (timestamp >= autoScrollHoldUntil && timestamp - lastFrame > 14) {
      window.scrollBy({ top: 1, behavior: 'instant' });
      lastFrame = timestamp;
    }
  }
  if (!lastFrame || autoScrollTarget || timestamp < autoScrollHoldUntil) lastFrame = timestamp;
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
    setAutoScroll(false);
    return;
  }
  scrollFrame = window.requestAnimationFrame(gentlyScroll);
}
function setAutoScroll(enabled, target = null, initialHold = 0) {
  autoScroll = enabled;
  autoScrollTarget = enabled ? target : null;
  autoScrollHoldUntil = initialHold ? performance.now() + initialHold : 0;
  window.cancelAnimationFrame(scrollFrame);
  lastFrame = 0;
  scrollToggle.setAttribute('aria-pressed', String(enabled));
  const label = enabled ? 'Tạm dừng tự cuộn' : 'Bật tự cuộn';
  scrollToggle.setAttribute('aria-label', label);
  scrollToggle.title = label;
  scrollToggle.innerHTML = `<i data-lucide="${enabled ? 'pause' : 'play'}" aria-hidden="true"></i>`;
  renderIcons();
  if (enabled) scrollFrame = window.requestAnimationFrame(gentlyScroll);
}
scrollToggle.addEventListener('click', () => setAutoScroll(!autoScroll));
document.querySelector('#openGroomGift').addEventListener('click', () => {
  if (autoScroll) setAutoScroll(false);
  document.querySelector('#groomGiftDialog').showModal();
});
document.querySelector('#openBrideGift').addEventListener('click', () => {
  if (autoScroll) setAutoScroll(false);
  document.querySelector('#brideGiftDialog').showModal();
});
document.querySelectorAll('.gift-dialog__download').forEach((link) => {
  link.addEventListener('click', async (event) => {
    const device = window.navigator;
    const mobile = /Android|iPhone|iPad|iPod/i.test(device.userAgent || '') || (/Macintosh/i.test(device.userAgent || '') && device.maxTouchPoints > 1);
    if (!mobile || !device.share || !device.canShare || !window.isSecureContext) return;
    event.preventDefault();
    try {
      const response = await fetch(link.href);
      if (!response.ok) throw new Error('Cannot load QR image');
      const file = new File([await response.blob()], link.download, { type: 'image/jpeg' });
      const shareData = { files: [file] };
      if (!device.canShare(shareData)) throw new Error('File sharing unavailable');
      await device.share(shareData);
    } catch (error) {
      if (error.name === 'AbortError') return;
      const fallback = document.createElement('a');
      fallback.href = link.href;
      fallback.download = link.download;
      fallback.target = '_blank';
      fallback.rel = 'noopener';
      document.body.append(fallback);
      fallback.click();
      fallback.remove();
    }
  });
});
window.addEventListener('wheel', () => { if (autoScroll) setAutoScroll(false); }, { passive: true });
window.addEventListener('touchstart', (event) => {
  if (autoScroll && !scrollToggle.contains(event.target)) setAutoScroll(false);
}, { passive: true });
window.addEventListener('keydown', (event) => {
  if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key) && autoScroll) setAutoScroll(false);
});
document.addEventListener('visibilitychange', () => { if (document.hidden && autoScroll) setAutoScroll(false); });
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) {
    setAutoScroll(false);
    stopGalleryAutoplay();
    document.body.classList.remove('motion-ready');
  } else {
    startGalleryAutoplay();
  }
});
function revealInvitation() {
  if (!opening.classList.contains('is-open')) {
    opening.classList.add('is-open');
    opening.setAttribute('aria-hidden', 'true');
  }
  createHearts();
}
function openRsvp() {
  setAutoScroll(false);
  document.querySelector('#rsvpForm').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'center' });
}
function startCoverAndAutoScroll() {
  if (opening.classList.contains('is-opening') || opening.classList.contains('is-open')) return;
  if (window.scrollY !== 0 || window.scrollX !== 0) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  if (heroPhoto) heroPhoto.style.opacity = '1';
  opening.classList.add('is-opening');
  if (weddingMusic.paused) playWeddingMusic();
  const finishOpening = () => {
    revealInvitation();
    setAutoScroll(!reducedMotion.matches, null, 1000);
  };
  if (reducedMotion.matches) finishOpening();
  else window.setTimeout(finishOpening, 1900);
}
document.querySelector('#openInvitation').addEventListener('click', openRsvp);
document.querySelector('#startInvitation').addEventListener('click', startCoverAndAutoScroll);

let heroFadeFrame = 0;
window.addEventListener('scroll', () => {
  if (!heroPhoto || heroFadeFrame) return;
  heroFadeFrame = window.requestAnimationFrame(() => {
    heroPhoto.style.opacity = String(1 - Math.min(1, window.scrollY / 300));
    heroFadeFrame = 0;
  });
}, { passive: true });

function formatCalendarDate(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}
function calendarDescription() {
  return `Bữa cơm thân mật mừng lễ thành hôn nhà gái. Đón khách và chụp ảnh ${WEDDING.receptionTime}; khai tiệc ${WEDDING.timeLabel}, ${WEDDING.fullDate} (giờ Việt Nam). Giờ kết thúc trên lịch chỉ là ước tính.\n${WEDDING.mapUrl}`;
}
function googleCalendarUrl() {
  const start = new Date(WEDDING.calendarStart);
  const end = new Date(new Date(WEDDING.date).getTime() + 3 * 3600000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Tiệc cưới nhà gái ${WEDDING.brideShort} & ${WEDDING.groomShort}`,
    dates: `${formatCalendarDate(start)}/${formatCalendarDate(end)}`,
    location: `${WEDDING.venue}, ${WEDDING.address}`,
    details: calendarDescription()
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
document.querySelector('#saveDate').addEventListener('click', () => {
  const anchor = document.createElement('a');
  anchor.href = googleCalendarUrl();
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  document.querySelector('#actionStatus').textContent = 'Đang mở sự kiện trong Google Calendar.';
});