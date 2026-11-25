# Minh Tâm & Minh Tuấn · Thiệp cưới nhà gái

Website HTML/CSS/JavaScript tĩnh, không cần cài package, build hay backend. Có thể mở [index.html](index.html) trực tiếp để xem nội dung; để phát nhạc, hãy chạy trang qua HTTP hoặc mở bản đã deploy vì một số trình duyệt chặn media trên `file://`.

Thông tin từ [thiệp nhà gái](images/IMG_9177.jpg): **Chủ nhật 20/12/2026**, đón khách và chụp ảnh **10:00**, khai tiệc **10:30** tại **Crown Palace, 779 đường Tự Minh, P. Quan Triều, tỉnh Thái Nguyên**. Nội dung trích tại [content/reference-content.md](content/reference-content.md).

## Cấu trúc

- [config.js](config.js): dữ liệu cặp đôi, bố mẹ, ngày giờ, địa điểm, QR Maps, ảnh mở đầu và nhạc.
- [index.html](index.html): nội dung HTML đầy đủ để vẫn đọc được khi JavaScript không chạy. Khi đổi thông tin sự kiện, cập nhật cả nội dung dự phòng và metadata tại đây.
- [styles.css](styles.css) và [reference-theme.css](reference-theme.css): giao diện burgundy, Times New Roman, responsive, hỗ trợ giảm chuyển động.
- [app.js](app.js): đếm ngược, mở lời mời, phát/tạm dừng nhạc, tự cuộn, hiệu ứng và Google Calendar.
- [images/](images/): ảnh thiệp nhà gái và các ảnh cưới trong `images/optimized/` được thu nhỏ để tải nhanh.
- [images/IMG_9177.jpg](images/IMG_9177.jpg): ảnh thiệp nhà gái dùng để đối chiếu thông tin.
- [music/le-duong-music.m4a](music/le-duong-music.m4a): nhạc bắt đầu sau khi khách chạm mở thiệp, có nút bật/tắt riêng.

Lịch tiệc nhà trai có website riêng; thông tin sự kiện trên trang này chỉ dành cho nhà gái.

## Kiểm tra

Chạy từ thư mục này, cần Node.js:

```sh
node --check config.js
node --check app.js
node tests/config.test.cjs
node tests/behavior.test.cjs
```

## Deploy

Đẩy toàn bộ thư mục này lên repository. Với GitHub Pages, chọn **Settings → Pages → Deploy from a branch → main → / (root)**. Các đường dẫn tương đối hoạt động trên cả URL repo và custom domain. Chỉ cấu hình domain `tamtuan.love` trong Pages/DNS khi sẵn sàng xuất bản; chưa thêm CNAME hoặc thay đổi DNS.

## Lưu ý

- Ảnh, nhạc và thư viện biểu tượng đều được lưu cục bộ; website dùng Times New Roman hệ thống, không cần tải font ngoài.
- Nút chỉ đường dùng liên kết Google Maps do gia đình cung cấp. QR trên ảnh chưa được giải mã để đối chiếu.
- Nút lịch mở sự kiện điền sẵn trên Google Calendar để khách xác nhận lưu, trên cả máy tính và điện thoại. Lịch bắt đầu lúc đón khách 10:00 và kết thúc dự kiến lúc 13:30 giờ Việt Nam; giờ kết thúc là ước tính, không phải thông tin trong thiệp. Mô tả có ghi giờ khai tiệc 10:30.
- Không sao chép ảnh, nhạc, ngân hàng hay RSVP của cặp đôi mẫu. Nhạc sử dụng tệp riêng được cung cấp cho website này; chưa có dữ liệu nên chưa hiển thị liên hệ, quà mừng hoặc RSVP.
- Lucide v0.468.0 trong `vendor/` dùng ISC License; giấy phép đi kèm tại [vendor/LICENSE](vendor/LICENSE).