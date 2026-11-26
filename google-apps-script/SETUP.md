# Lưu xác nhận tham dự

GitHub Pages chỉ phục vụ trang tĩnh. Tạo Google Sheet riêng để lưu tên, trạng thái tham dự và số lượng khách:

1. Tạo Google Sheet bằng tài khoản gia đình; chỉ chia sẻ quyền xem với người cần quản lý danh sách.
2. Trong Sheet, chọn **Extensions → Apps Script**, thay nội dung mã bằng [Code.gs](Code.gs). Sao chép ID nằm giữa `/d/` và `/edit` trong URL của Sheet, thay vào `SPREADSHEET_ID`, rồi lưu.
3. Chọn **Deploy → New deployment → Web app**, đặt **Execute as: Me** và **Who has access: Anyone**. Cấp các quyền Google yêu cầu.
4. Sao chép URL web app kết thúc bằng `/exec` vào `RSVP_ENDPOINT` trong [config.js](../config.js), rồi deploy lại website GitHub Pages.
5. Gửi thử một phản hồi và kiểm tra sheet `RSVP` có dòng mới. Khi sửa Apps Script, tạo phiên bản deployment mới để `/exec` sử dụng mã mới.

URL web app xuất hiện công khai trong website và bất kỳ ai có URL đều có thể gửi dữ liệu, kể cả spam. Không chia sẻ công khai Google Sheet hoặc thông tin riêng của khách. Với `no-cors`, trình duyệt không đọc được kết quả ghi của Apps Script: thông báo gửi chỉ xác nhận yêu cầu đã được chuyển đi, không đảm bảo Sheet đã lưu. Nếu cần xác nhận đáng tin cậy hoặc chống spam, cần backend có CORS và cơ chế bảo vệ phù hợp.