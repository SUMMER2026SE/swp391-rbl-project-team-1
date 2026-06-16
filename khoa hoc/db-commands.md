# Hướng dẫn Khởi tạo & Seed Dữ liệu Khóa học (EduPath Database Seed Commands)

Tệp này ghi lại các lệnh thiết lập cơ sở dữ liệu và chi tiết danh sách 27 khóa học mẫu đã được đưa vào hệ thống bao quát toàn bộ 9 môn học, các loại hình học phí (Miễn phí/Trả phí) và 3 cấp độ học tập ("Cơ bản", "Nâng cao", "Cấp tốc").

---

## 1. Các lệnh thực thi Cơ sở dữ liệu (Database Commands)

Để làm sạch cơ sở dữ liệu và nạp toàn bộ số liệu mẫu mới nhất, vui lòng chạy các lệnh sau tại thư mục gốc của dự án:

### Lệnh chỉ chạy Seeding 27 Khóa học mới (Khuyên dùng)
Lệnh này chạy tệp script riêng biệt `seed-courses.ts` để nạp bổ sung 27 khóa học mẫu mà không ảnh hưởng tới các dữ liệu gốc khác:
```bash
pnpm prisma:seed:courses
```

### Lệnh chạy Seeding toàn bộ (Bao gồm dữ liệu gốc & đề thi)
Lệnh này sẽ chạy trực tiếp file seed chính của hệ thống:
```bash
pnpm prisma:seed
```

### Lệnh làm sạch và đồng bộ lại cấu trúc Database (Nếu muốn reset hoàn toàn)
Lệnh này đồng bộ cấu trúc DB và tự động kích hoạt tiến trình seed lại từ đầu:
```bash
pnpm --filter @edupath/api exec prisma db push --accept-data-loss
pnpm prisma:seed
pnpm prisma:seed:courses
```

---

## 2. Danh sách 27 Khóa học mẫu được tạo tự động (27 Seeded Courses Details)

Dưới đây là bảng thống kê toàn bộ 27 khóa học mẫu đang có trong Database sau khi chạy Seed:

| STT | Môn học | Tên khóa học | Mức độ | Học phí | Giảng viên |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **1** | Toán học | Toán học Cơ bản lớp 12 | Cơ bản | **Miễn phí** | Thầy Nguyễn Thế Anh |
| **2** | Toán học | Khảo sát hàm số nâng cao THPTQG | Nâng cao | 499,000đ | Thầy Nguyễn Thế Anh |
| **3** | Toán học | Luyện thi cấp tốc Toán học THPTQG | Cấp tốc | 299,000đ | Cô Lê Thu Hương |
| **4** | Ngữ văn | Ngữ văn Cơ bản - Nghị luận Văn học | Cơ bản | 399,000đ | Cô Lê Thu Hương |
| **5** | Ngữ văn | Bí quyết đạt điểm 9+ Ngữ văn | Nâng cao | 499,000đ | Thầy Nguyễn Thế Anh |
| **6** | Ngữ văn | Chinh phục Ngữ văn cấp tốc | Cấp tốc | **Miễn phí** | Cô Lê Thu Hương |
| **7** | Tiếng Anh | Tiếng Anh Cơ bản cho người mất gốc | Cơ bản | **Miễn phí** | Thầy Nguyễn Thế Anh |
| **8** | Tiếng Anh | Tiếng Anh Nâng cao - Chinh phục 9+ THPTQG | Nâng cao | 599,000đ | Cô Lê Thu Hương |
| **9** | Tiếng Anh | Cú pháp và Từ vựng Tiếng Anh cấp tốc | Cấp tốc | 299,000đ | Thầy Nguyễn Thế Anh |
| **10** | Vật lý | Dao động cơ học và Sóng cơ cơ bản | Cơ bản | 349,000đ | Cô Lê Thu Hương |
| **11** | Vật lý | Vật lý Nâng cao - Đồ thị và Bài toán Cực trị | Nâng cao | 499,000đ | Thầy Nguyễn Thế Anh |
| **12** | Vật lý | Chuyên đề Dao động cơ học thi đại học | Cấp tốc | **Miễn phí** | Cô Lê Thu Hương |
| **13** | Hóa học | Hóa học hữu cơ Este - Lipit chuyên sâu | Cơ bản | 599,000đ | Thầy Nguyễn Thế Anh |
| **14** | Hóa học | Hóa học vô cơ Nâng cao lớp 12 | Nâng cao | **Miễn phí** | Cô Lê Thu Hương |
| **15** | Hóa học | Tổng ôn cấp tốc Hóa học lý thuyết THPTQG | Cấp tốc | 199,000đ | Thầy Nguyễn Thế Anh |
| **16** | Sinh học | Sinh học Cơ bản - Di truyền học quần thể | Cơ bản | **Miễn phí** | Cô Lê Thu Hương |
| **17** | Sinh học | Sinh học Nâng cao - Cơ chế di truyền và biến dị | Nâng cao | 450,000đ | Thầy Nguyễn Thế Anh |
| **18** | Sinh học | Sinh học Cấp tốc - Bí quyết 8+ thi đại học | Cấp tốc | 249,000đ | Cô Lê Thu Hương |
| **19** | Lịch sử | Lịch sử Việt Nam từ 1919 đến nay cơ bản | Cơ bản | 199,000đ | Thầy Nguyễn Thế Anh |
| **20** | Lịch sử | Lịch sử thế giới và Việt Nam Nâng cao | Nâng cao | 399,000đ | Cô Lê Thu Hương |
| **21** | Lịch sử | Tổng ôn Lịch sử cấp tốc bám sát đề minh họa | Cấp tốc | **Miễn phí** | Thầy Nguyễn Thế Anh |
| **22** | Địa lý | Địa lý tự nhiên và Dân cư Việt Nam cơ bản | Cơ bản | **Miễn phí** | Cô Lê Thu Hương |
| **23** | Địa lý | Địa lý các ngành kinh tế Nâng cao | Nâng cao | 349,000đ | Thầy Nguyễn Thế Anh |
| **24** | Địa lý | Địa lý Cấp tốc - Chinh phục điểm số trong 2 tuần | Cấp tốc | 149,000đ | Cô Lê Thu Hương |
| **25** | GDCD | Giáo dục Công dân Cơ bản lớp 12 | Cơ bản | 149,000đ | Thầy Nguyễn Thế Anh |
| **26** | GDCD | Phân tích tình huống GDCD nâng cao | Nâng cao | 299,000đ | Cô Lê Thu Hương |
| **27** | GDCD | Tổng ôn GDCD cấp tốc - Nhận diện từ khóa ăn điểm | Cấp tốc | **Miễn phí** | Thầy Nguyễn Thế Anh |

Mỗi khóa học trên đều đi kèm sẵn **04 bài giảng** có thứ tự và độ dài chi tiết để đảm bảo hiển thị đẹp mắt và đầy đủ tính năng khi nhấn xem lộ trình học hoặc xem thử.
