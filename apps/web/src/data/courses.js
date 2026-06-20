// Mock Data 12 khóa học ôn thi THPT Quốc Gia - EduPath AI

export const MOCK_COURSES = [
  {
    id: "1",
    title: "Chuyên đề ứng dụng đạo hàm & khảo sát đồ thị hàm số 12",
    subject: "Toán",
    block: "Khối A00",
    thumbnail: "/course_thumb_math.png",
    badge: "BÁN CHẠY",
    description: "Khóa học cung cấp trọn bộ kiến thức và kỹ thuật bấm máy Casio từ cơ bản đến nâng cao về khảo sát hàm số, giúp học sinh ăn chắc điểm 8+ trong kỳ thi THPT Quốc Gia.",
    rating: 4.8,
    reviewCount: 1240,
    lessonCount: 6,
    durationHours: 12,
    studentCount: 3450,
    instructor: {
      name: "Thầy Thế Anh",
      title: "Thạc sĩ Toán học ĐHSP Hà Nội, 15 năm kinh nghiệm luyện thi",
      avatar: "TA"
    },
    priceOriginal: 990000,
    priceSale: 499000,
    discountPercent: 50,
    level: "Cơ bản",
    curriculum: [
      {
        title: "Chương 1: Tính đơn điệu & Cực trị hàm số",
        lessons: [
          { id: "101", title: "Sự đồng biến, nghịch biến của hàm số", type: "video", durationMin: 20, isPreview: true, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          { id: "102", title: "Cực trị của hàm số và kỹ thuật giải nhanh trắc nghiệm", type: "video", durationMin: 25, isPreview: true, videoUrl: "https://www.w3schools.com/html/movie.mp4" },
          { id: "103", title: "Bài tập tự luyện: Cực trị hàm số chứa tham số m", type: "quiz", durationMin: 15, isPreview: false }
        ]
      },
      {
        title: "Chương 2: Giá trị lớn nhất, nhỏ nhất & Khảo sát đồ thị",
        lessons: [
          { id: "104", title: "Giá trị lớn nhất, nhỏ nhất trên một đoạn", type: "video", durationMin: 22, isPreview: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          { id: "105", title: "Đường tiệm cận của đồ thị hàm số", type: "video", durationMin: 18, isPreview: false, videoUrl: "https://www.w3schools.com/html/movie.mp4" },
          { id: "106", title: "Tóm tắt công thức & Sơ đồ khảo sát đồ thị hàm số", type: "document", durationMin: 10, isPreview: false }
        ]
      }
    ]
  },
  {
    id: "2",
    title: "Chinh phục toàn diện Dao động cơ & Sóng cơ học 12",
    subject: "Vật lý",
    block: "Khối A01",
    thumbnail: "/course_thumb_physics.png",
    badge: "HOT",
    description: "Phân tích bản chất vật lý, thiết lập phương trình dao động điều hòa, con lắc lò xo và giải nhanh các bài toán sóng cơ nâng cao bằng giản đồ Vector.",
    rating: 4.9,
    reviewCount: 980,
    lessonCount: 5,
    durationHours: 15,
    studentCount: 2150,
    instructor: {
      name: "Cô Thu Hương",
      title: "Giảng viên Vật lý ĐHQGHN, nổi tiếng với phương pháp giải nhanh sơ đồ vector",
      avatar: "TH"
    },
    priceOriginal: 1200000,
    priceSale: 599000,
    discountPercent: 50,
    level: "Nâng cao",
    curriculum: [
      {
        title: "Chương 1: Dao động cơ học điều hòa",
        lessons: [
          { id: "201", title: "Khái niệm Dao động điều hòa và các phương trình cốt lõi", type: "video", durationMin: 20, isPreview: true, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          { id: "202", title: "Con lắc lò xo và bài toán năng lượng dao động", type: "video", durationMin: 26, isPreview: false, videoUrl: "https://www.w3schools.com/html/movie.mp4" },
          { id: "203", title: "Trắc nghiệm: Chu kỳ con lắc đơn biến thiên theo nhiệt độ", type: "quiz", durationMin: 15, isPreview: false }
        ]
      },
      {
        title: "Chương 2: Sóng cơ học và sự truyền sóng",
        lessons: [
          { id: "204", title: "Lý thuyết sóng cơ và phương trình truyền sóng cơ", type: "video", durationMin: 22, isPreview: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          { id: "205", title: "Tài liệu chuyên đề Giao thoa sóng cơ học", type: "document", durationMin: 12, isPreview: false }
        ]
      }
    ]
  },
  {
    id: "3",
    title: "Ngữ pháp Tiếng Anh trọng tâm thi THPT Quốc Gia 2026",
    subject: "Tiếng Anh",
    block: "Khối D01",
    thumbnail: "/course_thumb_english.png",
    badge: "ĐỀ XUẤT",
    description: "Hệ thống hóa 12 thì tiếng Anh, câu bị động, câu điều kiện, mệnh đề quan hệ và phương pháp làm bài đọc hiểu lấy trọn điểm cấu trúc mới.",
    rating: 4.7,
    reviewCount: 2100,
    lessonCount: 6,
    durationHours: 10,
    studentCount: 5400,
    instructor: {
      name: "Cô Quỳnh Chi",
      title: "Thủ khoa ĐH Ngoại ngữ, IELTS 8.5, giáo viên ôn luyện chuyên sâu",
      avatar: "QC"
    },
    priceOriginal: 800000,
    priceSale: 399000,
    discountPercent: 50,
    level: "Cơ bản",
    curriculum: [
      {
        title: "Chương 1: Các thì cốt lõi & Sự hòa hợp chủ vị",
        lessons: [
          { id: "301", title: "Trọn bộ 12 thì trong Tiếng Anh và dấu hiệu nhận biết", type: "video", durationMin: 18, isPreview: true, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          { id: "302", title: "Sự phối thì và Sự hòa hợp giữa Chủ ngữ & Động từ", type: "video", durationMin: 22, isPreview: true, videoUrl: "https://www.w3schools.com/html/movie.mp4" },
          { id: "303", title: "Bài tập thực hành: Phân biệt các thì quá khứ nâng cao", type: "quiz", durationMin: 12, isPreview: false }
        ]
      },
      {
        title: "Chương 2: Cấu trúc biến đổi câu nâng cao",
        lessons: [
          { id: "304", title: "Câu bị động và các dạng đặc biệt trong đề thi THPT", type: "video", durationMin: 20, isPreview: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          { id: "305", title: "Mệnh đề giả định và các cấu trúc biến thể", type: "video", durationMin: 18, isPreview: false, videoUrl: "https://www.w3schools.com/html/movie.mp4" },
          { id: "306", title: "Tài liệu ghi chú: 50 cấu trúc chuyển đổi câu ăn điểm", type: "document", durationMin: 10, isPreview: false }
        ]
      }
    ]
  },
  {
    id: "4",
    title: "Làm chủ Hóa hữu cơ 12 toàn diện ôn thi đại học",
    subject: "Hóa học",
    block: "Khối B00",
    thumbnail: "/course_thumb_chemistry.png",
    badge: "MỚI",
    description: "Giải mã Este, Lipit, Cacbohidrat, Amin, Amino Axit và Peptit với các phương pháp quy đổi, đồng đẳng hóa độc quyền giúp tối ưu hóa thời gian làm bài thi.",
    rating: 4.8,
    reviewCount: 670,
    lessonCount: 5,
    durationHours: 11,
    studentCount: 1280,
    instructor: {
      name: "Thầy Khắc Ngọc",
      title: "Tiến sĩ Hóa học ĐHKHTN, chuyên gia sơ đồ chuỗi phản ứng hữu cơ",
      avatar: "KN"
    },
    priceOriginal: 900000,
    priceSale: 450000,
    discountPercent: 50,
    level: "Nâng cao",
    curriculum: [
      {
        title: "Chương 1: Este & Chất béo (Lipit)",
        lessons: [
          { id: "401", title: "Định nghĩa, danh pháp và lý thuyết Este cốt lõi", type: "video", durationMin: 22, isPreview: true, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          { id: "402", title: "Bài toán thủy phân Este nâng cao và kỹ thuật quy đổi", type: "video", durationMin: 30, isPreview: false, videoUrl: "https://www.w3schools.com/html/movie.mp4" },
          { id: "403", title: "Bài kiểm tra nhanh chuyên đề chất béo và Lipit", type: "quiz", durationMin: 15, isPreview: false }
        ]
      },
      {
        title: "Chương 2: Cacbohidrat & Hợp chất chứa Nitơ",
        lessons: [
          { id: "404", title: "Cấu trúc, tính chất hóa học Glucozơ và Saccarozơ", type: "video", durationMin: 20, isPreview: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          { id: "405", title: "Bảng so sánh tính chất Amin - Amino Axit - Peptit", type: "document", durationMin: 12, isPreview: false }
        ]
      }
    ]
  },
  {
    id: "5",
    title: "Ôn tập Ngữ Văn 12 - Nghị luận văn học đạt điểm 9+",
    subject: "Ngữ văn",
    block: "Khối C00",
    thumbnail: "/course_thumb_literature.png",
    badge: "BÁN CHẠY",
    description: "Bí quyết triển khai ý, lập luận chặt chẽ cho các tác phẩm trọng điểm như Vợ Chồng A Phủ, Vợ Nhặt, Người Lái Đò Sông Đà, Đất Nước, Sóng.",
    rating: 4.9,
    reviewCount: 1540,
    lessonCount: 5,
    durationHours: 9,
    studentCount: 4100,
    instructor: {
      name: "Cô Minh Trang",
      title: "Thạc sĩ Ngữ Văn, chuyên gia hướng dẫn kỹ năng viết văn đạt điểm tối đa",
      avatar: "MT"
    },
    priceOriginal: 700000,
    priceSale: 350000,
    discountPercent: 50,
    level: "Cơ bản",
    curriculum: [
      {
        title: "Chương 1: Kỹ năng Nghị luận xã hội & Phân tích thơ",
        lessons: [
          { id: "501", title: "Cách viết đoạn văn Nghị luận xã hội 200 chữ mạch lạc", type: "video", durationMin: 15, isPreview: true, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          { id: "502", title: "Phân tích tác phẩm thơ Sóng (Xuân Quỳnh) và Đất Nước", type: "video", durationMin: 25, isPreview: false, videoUrl: "https://www.w3schools.com/html/movie.mp4" },
          { id: "503", title: "Đề dàn ý mẫu: Phân tích khổ 1, 2 của bài thơ Sóng", type: "document", durationMin: 10, isPreview: false }
        ]
      },
      {
        title: "Chương 2: Nghị luận văn xuôi hiện đại",
        lessons: [
          { id: "504", title: "Phân tích nhân vật Tràng và Thị trong truyện ngắn Vợ Nhặt", type: "video", durationMin: 28, isPreview: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          { id: "505", title: "Bài tập: So sánh vẻ đẹp khuất lấp của người đàn bà hàng chài", type: "quiz", durationMin: 15, isPreview: false }
        ]
      }
    ]
  },
  {
    id: "6",
    title: "Trọn bộ Di truyền & Sinh thái học ôn thi đại học khối B",
    subject: "Sinh học",
    block: "Khối B00",
    thumbnail: "/course_thumb_chemistry.png",
    badge: "MỚI",
    description: "Hướng dẫn phương pháp giải nhanh bài tập quy luật di truyền Men-đen, tương tác gen, di truyền quần thể và cơ thế tiến hóa chuẩn kiến thức thi THPT.",
    rating: 4.6,
    reviewCount: 450,
    lessonCount: 5,
    durationHours: 8,
    studentCount: 840,
    instructor: {
      name: "Thầy Nguyễn Đức",
      title: "Giáo sư Sinh học, tác giả nhiều đầu sách luyện thi chất lượng cao",
      avatar: "ND"
    },
    priceOriginal: 800000,
    priceSale: 390000,
    discountPercent: 51,
    level: "Nâng cao",
    curriculum: [
      {
        title: "Chương 1: Cơ sở vật chất & Quy luật di truyền",
        lessons: [
          { id: "601", title: "Gen, Mã di truyền và Cơ chế nhân đôi ADN", type: "video", durationMin: 18, isPreview: true, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          { id: "602", title: "Quy luật Men-đen: Phân ly và Phân ly độc lập", type: "video", durationMin: 24, isPreview: false, videoUrl: "https://www.w3schools.com/html/movie.mp4" },
          { id: "603", title: "Bài tập trắc nghiệm di truyền quần thể ngẫu phối", type: "quiz", durationMin: 15, isPreview: false }
        ]
      },
      {
        title: "Chương 2: Tiến hóa và Sinh thái học",
        lessons: [
          { id: "604", title: "Các nhân tố tiến hóa và vai trò của chọn lọc tự nhiên", type: "video", durationMin: 20, isPreview: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          { id: "605", title: "Tài liệu sơ đồ: Chuỗi và lưới thức ăn trong hệ sinh thái", type: "document", durationMin: 10, isPreview: false }
        ]
      }
    ]
  },
  {
    id: "7",
    title: "Lịch sử Việt Nam từ 1919 đến 2000 - Ăn chắc điểm Sử",
    subject: "Lịch sử",
    block: "Khối C00",
    thumbnail: "/course_thumb_literature.png",
    badge: "ĐỀ XUẤT",
    description: "Tái hiện dòng lịch sử Việt Nam qua các mốc kháng chiến chống Pháp, chống Mỹ và công cuộc Đổi mới bằng sơ đồ thời gian dễ nhớ, giúp ghi nhớ sự kiện sâu sắc.",
    rating: 4.7,
    reviewCount: 780,
    lessonCount: 5,
    durationHours: 10,
    studentCount: 1560,
    instructor: {
      name: "Cô Minh Trang",
      title: "Thạc sĩ Ngữ Văn, chuyên gia hướng dẫn kỹ năng ghi nhớ dòng lịch sử",
      avatar: "MT"
    },
    priceOriginal: 600000,
    priceSale: 299000,
    discountPercent: 50,
    level: "Cơ bản",
    curriculum: [
      {
        title: "Chương 1: Lịch sử VN giai đoạn 1919 - 1945",
        lessons: [
          { id: "701", title: "Cuộc khai thác thuộc địa lần hai của thực dân Pháp", type: "video", durationMin: 16, isPreview: true, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          { id: "702", title: "Đảng Cộng sản Việt Nam ra đời và Phong trào 30-31", type: "video", durationMin: 22, isPreview: false, videoUrl: "https://www.w3schools.com/html/movie.mp4" },
          { id: "703", title: "Trắc nghiệm nhanh: Tổng khởi nghĩa Cách mạng Tháng Tám", type: "quiz", durationMin: 12, isPreview: false }
        ]
      },
      {
        title: "Chương 2: Kháng chiến chống Pháp và chống Mỹ",
        lessons: [
          { id: "704", title: "Chiến dịch Điện Biên Phủ 1954 - Chiến thắng chấn động địa cầu", type: "video", durationMin: 25, isPreview: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          { id: "705", title: "Tài liệu ghi nhớ: 20 mốc thời gian lịch sử kinh điển", type: "document", durationMin: 12, isPreview: false }
        ]
      }
    ]
  },
  {
    id: "8",
    title: "Địa lý tự nhiên & Địa lý các vùng kinh tế Việt Nam",
    subject: "Địa lý",
    block: "Khối C00",
    thumbnail: "/course_thumb_physics.png",
    badge: "HOT",
    description: "Luyện kỹ năng khai thác Atlat Địa lý Việt Nam tối đa, đọc biểu đồ, phân tích bảng số liệu và làm chủ phần địa lý các vùng kinh tế trọng điểm.",
    rating: 4.8,
    reviewCount: 890,
    lessonCount: 5,
    durationHours: 10,
    studentCount: 1820,
    instructor: {
      name: "Cô Thu Hương",
      title: "Cố vấn địa lý ĐHQGHN, nhiều năm ra đề thi học sinh giỏi",
      avatar: "TH"
    },
    priceOriginal: 600000,
    priceSale: 299000,
    discountPercent: 50,
    level: "Cơ bản",
    curriculum: [
      {
        title: "Chương 1: Địa lý tự nhiên Việt Nam",
        lessons: [
          { id: "801", title: "Vị trí địa lý, phạm vi lãnh thổ và ý nghĩa tự nhiên", type: "video", durationMin: 18, isPreview: true, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          { id: "802", title: "Kỹ năng khai thác Atlat Địa lý: Khí hậu và Địa hình", type: "video", durationMin: 24, isPreview: false, videoUrl: "https://www.w3schools.com/html/movie.mp4" },
          { id: "803", title: "Trắc nghiệm nhanh: Đặc điểm sông ngòi nước ta", type: "quiz", durationMin: 15, isPreview: false }
        ]
      },
      {
        title: "Chương 2: Địa lý các vùng kinh tế",
        lessons: [
          { id: "804", title: "Vùng Trung du và miền núi Bắc Bộ - Thế mạnh khai thác", type: "video", durationMin: 20, isPreview: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          { id: "805", title: "Tài liệu số liệu kinh tế các vùng trọng điểm năm 2024", type: "document", durationMin: 10, isPreview: false }
        ]
      }
    ]
  },
  {
    id: "9",
    title: "Giáo dục công dân 12 - Hiến pháp & Pháp luật Việt Nam",
    subject: "GDCD",
    block: "Khối C00",
    thumbnail: "/course_thumb_literature.png",
    badge: "MỚI",
    description: "Tập hợp các tình huống thực tế thường gặp trong đề thi THPT Quốc Gia môn GDCD, phân tích quyền dân chủ, quyền bình đẳng của công dân.",
    rating: 4.9,
    reviewCount: 1120,
    lessonCount: 5,
    durationHours: 7,
    studentCount: 2340,
    instructor: {
      name: "Thầy Thế Anh",
      title: "Thạc sĩ Luật học, giảng dạy chuyên đề GDCD tại các trường chuyên",
      avatar: "TA"
    },
    priceOriginal: 400000,
    priceSale: 199000,
    discountPercent: 50,
    level: "Cơ bản",
    curriculum: [
      {
        title: "Chương 1: Pháp luật & Đời sống công dân",
        lessons: [
          { id: "901", title: "Pháp luật và vai trò của pháp luật trong đời sống", type: "video", durationMin: 15, isPreview: true, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          { id: "902", title: "Thực hiện pháp luật và các hành vi vi phạm pháp luật", type: "video", durationMin: 20, isPreview: false, videoUrl: "https://www.w3schools.com/html/movie.mp4" },
          { id: "903", title: "Phân tích tình huống: Trách nhiệm pháp lý của công dân", type: "quiz", durationMin: 15, isPreview: false }
        ]
      },
      {
        title: "Chương 2: Quyền bình đẳng của công dân",
        lessons: [
          { id: "904", title: "Bình đẳng trong hôn nhân gia đình và lao động kinh doanh", type: "video", durationMin: 18, isPreview: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          { id: "905", title: "Bảng tóm tắt quyền bình đẳng giữa các dân tộc, tôn giáo", type: "document", durationMin: 8, isPreview: false }
        ]
      }
    ]
  },
  {
    id: "10",
    title: "Hình học không gian & Phép tính tích phân 12 chuyên sâu",
    subject: "Toán",
    block: "Khối A00",
    thumbnail: "/course_thumb_math.png",
    badge: "HOT",
    description: "Trọn bộ chuyên đề khối đa diện, thể tích hình chóp, hình lăng trụ và các phương pháp giải bài toán Tích phân - Nguyên hàm nâng cao ăn chắc điểm 9+.",
    rating: 4.8,
    reviewCount: 560,
    lessonCount: 5,
    durationHours: 12,
    studentCount: 1100,
    instructor: {
      name: "Thầy Thế Anh",
      title: "Thạc sĩ Toán học ĐHSP Hà Nội, 15 năm kinh nghiệm luyện thi",
      avatar: "TA"
    },
    priceOriginal: 900000,
    priceSale: 499000,
    discountPercent: 45,
    level: "Nâng cao",
    curriculum: [
      {
        title: "Chương 1: Hình học không gian đa diện",
        lessons: [
          { id: "1001", title: "Tính thể tích khối chóp có cạnh bên vuông góc với đáy", type: "video", durationMin: 22, isPreview: true, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          { id: "1002", title: "Công thức giải nhanh khoảng cách và góc trong không gian", type: "video", durationMin: 28, isPreview: false, videoUrl: "https://www.w3schools.com/html/movie.mp4" },
          { id: "1003", title: "Trắc nghiệm: Vận dụng cao hình chóp ngoại tiếp mặt cầu", type: "quiz", durationMin: 20, isPreview: false }
        ]
      },
      {
        title: "Chương 2: Tích phân & Ứng dụng thực tế",
        lessons: [
          { id: "1004", title: "Nguyên hàm từng phần và phương pháp đặt ẩn phụ", type: "video", durationMin: 25, isPreview: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          { id: "1005", title: "Tài liệu: Ứng dụng tích phân tính diện tích và thể tích", type: "document", durationMin: 12, isPreview: false }
        ]
      }
    ]
  },
  {
    id: "11",
    title: "Khóa học Tiếng Anh cấp tốc - Luyện đề THPT Quốc Gia",
    subject: "Tiếng Anh",
    block: "Khối D01",
    thumbnail: "/course_thumb_english.png",
    badge: "ĐỀ XUẤT",
    description: "Khóa học thực chiến giải chi tiết 30 đề thi chuẩn cấu trúc minh họa của Bộ GD&ĐT, chỉ ra những lỗi sai kinh điển giúp cải thiện 2-3 điểm cấp tốc.",
    rating: 4.7,
    reviewCount: 940,
    lessonCount: 5,
    durationHours: 9,
    studentCount: 1950,
    instructor: {
      name: "Cô Quỳnh Chi",
      title: "Thủ khoa ĐH Ngoại ngữ, IELTS 8.5, giáo viên ôn luyện chuyên sâu",
      avatar: "QC"
    },
    priceOriginal: 600000,
    priceSale: 299000,
    discountPercent: 50,
    level: "Cấp tốc",
    curriculum: [
      {
        title: "Chương 1: Các chuyên đề lỗi sai kinh điển",
        lessons: [
          { id: "1101", title: "Phát hiện lỗi sai về từ vựng dễ gây nhầm lẫn", type: "video", durationMin: 20, isPreview: true, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          { id: "1102", title: "Mẹo làm phần tìm câu đồng nghĩa không cần dịch hết", type: "video", durationMin: 18, isPreview: false, videoUrl: "https://www.w3schools.com/html/movie.mp4" },
          { id: "1103", title: "Bài test phản xạ: Chữa lỗi sai ngữ pháp thường gặp", type: "quiz", durationMin: 15, isPreview: false }
        ]
      },
      {
        title: "Chương 2: Giải đề minh họa chi tiết",
        lessons: [
          { id: "1104", title: "Giải chi tiết Đề thi minh họa THPTQG 2026", type: "video", durationMin: 32, isPreview: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          { id: "1105", title: "Bộ đề ôn luyện cấp tốc có file PDF đi kèm", type: "document", durationMin: 15, isPreview: false }
        ]
      }
    ]
  },
  {
    id: "12",
    title: "Hóa vô cơ 12 - Phân nhóm kim loại kiềm, kiềm thổ & nhôm",
    subject: "Hóa học",
    block: "Khối A00",
    thumbnail: "/course_thumb_chemistry.png",
    badge: "MỚI",
    description: "Chi tiết tính chất hóa học và phương pháp giải toán đồ thị nhôm, toán sục khí CO2 vào dung dịch kiềm thổ cực nhanh không cần lập hệ phương trình phức tạp.",
    rating: 4.8,
    reviewCount: 420,
    lessonCount: 5,
    durationHours: 10,
    studentCount: 960,
    instructor: {
      name: "Thầy Khắc Ngọc",
      title: "Tiến sĩ Hóa học ĐHKHTN, chuyên gia sơ đồ chuỗi phản ứng hữu cơ",
      avatar: "KN"
    },
    priceOriginal: 800000,
    priceSale: 399000,
    discountPercent: 50,
    level: "Nâng cao",
    curriculum: [
      {
        title: "Chương 1: Kim loại Kiềm & Kiềm thổ",
        lessons: [
          { id: "1201", title: "Lý thuyết kim loại nhóm IA và IIA thường thi", type: "video", durationMin: 18, isPreview: true, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          { id: "1202", title: "Bài toán sục khí CO2 vào dung dịch nước vôi trong Ca(OH)2", type: "video", durationMin: 22, isPreview: false, videoUrl: "https://www.w3schools.com/html/movie.mp4" },
          { id: "1203", title: "Trắc nghiệm lý thuyết phản ứng nhiệt nhôm", type: "quiz", durationMin: 15, isPreview: false }
        ]
      },
      {
        title: "Chương 2: Nhôm và hợp chất lưỡng tính của nhôm",
        lessons: [
          { id: "1204", title: "Phản ứng của muối nhôm Al3+ với dung dịch kiềm OH-", type: "video", durationMin: 20, isPreview: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          { id: "1205", title: "Tài liệu ghi chú: Phương pháp đồ thị giải toán nhôm", type: "document", durationMin: 10, isPreview: false }
        ]
      }
    ]
  }
];
