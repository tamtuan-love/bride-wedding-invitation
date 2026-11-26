const rsvpForm = document.querySelector('#rsvpForm');
const rsvpGuests = document.querySelector('#rsvpGuests');
const rsvpStatus = document.querySelector('#rsvpStatus');
const rsvpSubmit = rsvpForm.querySelector('button[type="submit"]');

rsvpForm.addEventListener('change', () => {
  const attendance = rsvpForm.querySelector('input[name="attendance"]:checked');
  rsvpGuests.disabled = attendance?.value === 'no';
});

rsvpForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(rsvpForm);
  const name = String(data.get('name') || '').trim();
  const attendance = data.get('attendance');
  const guests = attendance === 'no' ? 0 : Number(data.get('guests'));

  if (!name) {
    rsvpStatus.textContent = 'Bạn cho chúng mình xin tên nhé!';
    rsvpForm.querySelector('input[name="name"]').focus();
    return;
  }
  if (!['yes', 'no'].includes(attendance)) {
    rsvpStatus.textContent = 'Bạn chọn giúp chúng mình có thể tham dự không nha!';
    rsvpForm.querySelector('input[name="attendance"]').focus();
    return;
  }
  if (attendance === 'yes' && (!Number.isInteger(guests) || guests < 1 || guests > 10)) {
    rsvpStatus.textContent = 'Bạn chọn giúp chúng mình số người tham dự nha!';
    rsvpGuests.focus();
    return;
  }
  if (!RSVP_ENDPOINT) {
    rsvpStatus.textContent = 'Hiện chưa thể gửi xác nhận. Vui lòng liên hệ gia đình.';
    return;
  }

  rsvpSubmit.disabled = true;
  rsvpStatus.textContent = 'Đang gửi xác nhận...';
  try {
    await fetch(RSVP_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ name, attendance, guests })
    });
    const message = attendance === 'yes'
      ? `Hẹn gặp ${name} trong ngày vui!`
      : `Thật tiếc khi thiếu ${name}, mong sẽ có dịp gặp nhau sớm!`;
    rsvpStatus.textContent = `${message}`;
    rsvpSubmit.textContent = 'Đã gửi xác nhận';
  } catch {
    rsvpStatus.textContent = 'Chưa gửi được xác nhận. Vui lòng thử lại hoặc liên hệ gia đình.';
    rsvpSubmit.disabled = false;
  }
});