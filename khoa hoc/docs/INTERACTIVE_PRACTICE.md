# ⚡ Tài liệu Hướng dẫn Chế độ Luyện tập Trực tuyến (Quick Practice Mode)

Tài liệu này mô tả chi tiết chức năng **Luyện tập Trực tuyến (Quick Practice Mode)** đã được phát triển cho trang **Ngân hàng đề thi (Exam Bank)** của hệ thống EduPath AI.

## 🎯 Giới thiệu tính năng
Nhằm hỗ trợ học sinh có trải nghiệm tự học và kiểm tra kiến thức nhanh trước khi tải đề thi chính thức (PDF), hệ thống cung cấp chế độ **Luyện tập Trực tuyến** ngay trong cửa sổ xem trước đề thi.

---

## 🛠️ Các thành phần cốt lõi

### 1. Phân loại theo 9 Môn thi THPT Quốc Gia
Tích hợp câu hỏi mẫu có độ bao phủ cao cho toàn bộ 9 môn học:
- **Toán Học**: Trắc nghiệm đạo hàm, cực trị, tích phân.
- **Ngữ Văn**: Tự luận đọc hiểu, nghị luận xã hội và nghị luận văn học.
- **Tiếng Anh**: Trắc nghiệm ngữ âm, thì động từ và danh động từ.
- **Vật Lý**: Trắc nghiệm dao động cơ, dòng điện xoay chiều và hạt nhân.
- **Hóa Học**: Trắc nghiệm este - lipit, đại cương kim loại và sắt.
- **Sinh Học**: Trắc nghiệm phiên mã, di truyền Menđen và tiến hóa.
- **Lịch Sử**: Trắc nghiệm lịch sử Việt Nam và lịch sử thế giới.
- **Địa Lý**: Trắc nghiệm vùng kinh tế, nông nghiệp và kỹ năng Atlat.
- **GDCD**: Trắc nghiệm quyền bình đẳng, trách nhiệm pháp lý và tự do kinh doanh.

### 2. Bộ đếm ngược thời gian và Chống gian lận (Anti-Cheat)
- Bộ đếm thời gian mặc định **5 phút (300 giây)** cho phép học sinh rèn luyện khả năng phản xạ nhanh dưới áp lực thời gian.
- Tính năng **Tạm dừng (Pause)**: Khi học sinh nhấn nút tạm dừng, toàn bộ nội dung câu hỏi sẽ bị ẩn đi nhằm ngăn chặn việc gian lận thời gian làm bài.

### 3. Trình soạn thảo Tự luận (Ngữ Văn)
- Cung cấp khung soạn thảo văn bản hỗ trợ đếm số lượng từ thời gian thực.
- Sau khi nộp bài, hệ thống hiển thị dàn ý phân tích chi tiết và bài mẫu đạt điểm tối đa giúp học sinh tự đối chiếu.

### 4. Bảng chấm điểm & Chẩn đoán Adaptive AI
- **Biểu đồ tròn kết quả**: Sử dụng SVG động hiển thị trực quan điểm số trên thang điểm 10.
- **Chẩn đoán AI**: Đưa ra nhận xét tổng quan, phát hiện các chuyên đề kiến thức bị hổng và gợi ý lộ trình cải thiện tương ứng trên hệ thống.
- **Lịch sử học bạ**: Tự động lưu kết quả vào lịch sử làm bài cá nhân của học sinh thông qua LocalStorage (`app_submissions`).
