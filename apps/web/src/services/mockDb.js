// Mock Database for EduPath AI Course Feature (13-Table Supabase Schema)
// Used as a fallback when Supabase is not configured.
// Persists in localStorage for a consistent demo experience.

const MOCK_SUBJECTS = [
  { id: 1, name: "Toán học", code: "toan" },
  { id: 2, name: "Ngữ văn", code: "van" },
  { id: 3, name: "Tiếng Anh", code: "anh" },
  { id: 4, name: "Vật lý", code: "ly" },
  { id: 5, name: "Hóa học", code: "hoa" },
  { id: 6, name: "Sinh học", code: "sinh" },
  { id: 7, name: "Lịch sử", code: "su" },
  { id: 8, name: "Địa lý", code: "dia" },
  { id: 9, name: "GDCD", code: "gdcd" }
];

const MOCK_TEACHER_PROFILES = [
  { id: 1, full_name: "Thầy Thế Anh", avatar_url: "TA", bio: "Thạc sĩ Toán học ĐHSP Hà Nội, 15 năm kinh nghiệm luyện thi THPT Quốc Gia, chuyên gia Casio giải nhanh." },
  { id: 2, full_name: "Cô Thu Hương", avatar_url: "TH", bio: "Giảng viên Vật lý Đại học Khoa học Tự nhiên, nổi tiếng với sơ đồ tư duy giản đồ vector." },
  { id: 3, full_name: "Cô Quỳnh Chi", avatar_url: "QC", bio: "Cựu thủ khoa ĐH Ngoại ngữ, IELTS 8.5, giáo viên ôn thi tiếng Anh chuyên sâu." },
  { id: 4, full_name: "Thầy Khắc Ngọc", avatar_url: "KN", bio: "Tiến sĩ Hóa học, chuyên gia xây dựng sơ đồ chuỗi phản ứng vô cơ và hữu cơ cực dễ nhớ." },
  { id: 5, full_name: "Cô Minh Trang", avatar_url: "MT", bio: "Thạc sĩ Ngữ Văn, chuyên gia hướng dẫn kỹ năng phân tích và viết văn nghị luận xã hội đạt điểm tối đa." },
  { id: 6, full_name: "Thầy Nguyễn Đức", avatar_url: "ND", bio: "Giáo sư Sinh học, tác giả của nhiều đầu sách luyện thi trắc nghiệm Sinh học chất lượng cao." }
];

const MOCK_COURSES = [
  {
    id: 1,
    title: "Chuyên đề ứng dụng đạo hàm & khảo sát đồ thị hàm số 12",
    subject_id: 1,
    subject: "Toán học",
    subject_group: "A01",
    price: 499000,
    original_price: 990000,
    discount_percent: 50,
    rating: 4.8,
    student_count: 1240,
    lesson_count: 5,
    duration: "12 giờ",
    badge: "Best seller",
    teacher_profile_id: 1,
    teacher_name: "Thầy Thế Anh",
    teacher_avatar: "TA",
    description: "Khóa học cung cấp trọn bộ kiến thức và kỹ thuật bấm máy Casio từ cơ bản đến nâng cao về khảo sát hàm số, giúp học sinh ăn chắc điểm 8+ trong kỳ thi THPT Quốc Gia.",
    is_published: true
  },
  {
    id: 2,
    title: "Chinh phục toàn diện Dao động cơ & Sóng cơ học 12",
    subject_id: 4,
    subject: "Vật lý",
    subject_group: "A01",
    price: 599000,
    original_price: 1200000,
    discount_percent: 50,
    rating: 4.9,
    student_count: 850,
    lesson_count: 5,
    duration: "15 giờ",
    badge: "Hot",
    teacher_profile_id: 2,
    teacher_name: "Cô Thu Hương",
    teacher_avatar: "TH",
    description: "Phân tích bản chất vật lý, thiết lập phương trình dao động điều hòa, con lắc lò xo và giải nhanh các bài toán sóng cơ nâng cao bằng giản đồ Vector.",
    is_published: true
  },
  {
    id: 3,
    title: "Ngữ pháp Tiếng Anh trọng tâm thi THPT Quốc Gia 2026",
    subject_id: 3,
    subject: "Tiếng Anh",
    subject_group: "D01",
    price: 399000,
    original_price: 800000,
    discount_percent: 50,
    rating: 4.7,
    student_count: 2100,
    lesson_count: 5,
    duration: "10 giờ",
    badge: "Recommended",
    teacher_profile_id: 3,
    teacher_name: "Cô Quỳnh Chi",
    teacher_avatar: "QC",
    description: "Hệ thống hóa 12 thì tiếng Anh, câu bị động, câu điều kiện, mệnh đề quan hệ và phương pháp làm bài đọc hiểu lấy trọn điểm cấu trúc mới.",
    is_published: true
  },
  {
    id: 4,
    title: "Làm chủ Hóa hữu cơ 12 toàn diện ôn thi đại học",
    subject_id: 5,
    subject: "Hóa học",
    subject_group: "B00",
    price: 450000,
    original_price: 900000,
    discount_percent: 50,
    rating: 4.8,
    student_count: 670,
    lesson_count: 5,
    duration: "11 giờ",
    badge: "New",
    teacher_profile_id: 4,
    teacher_name: "Thầy Khắc Ngọc",
    teacher_avatar: "KN",
    description: "Giải mã Este, Lipit, Cacbohidrat, Amin, Amino Axit và Peptit với các phương pháp quy đổi, đồng đẳng hóa độc quyền giúp tối ưu hóa thời gian thi thử.",
    is_published: true
  },
  {
    id: 5,
    title: "Ôn tập Ngữ Văn 12 - Nghị luận văn học đạt điểm 9+",
    subject_id: 2,
    subject: "Ngữ văn",
    subject_group: "D01",
    price: 350000,
    original_price: 700000,
    discount_percent: 50,
    rating: 4.9,
    student_count: 1540,
    lesson_count: 5,
    duration: "9 giờ",
    badge: "Best seller",
    teacher_profile_id: 5,
    teacher_name: "Cô Minh Trang",
    teacher_avatar: "MT",
    description: "Bí quyết triển khai ý, lập luận chặt chẽ cho các tác phẩm trọng điểm như Vợ Chồng A Phủ, Vợ Nhặt, Người Lái Đò Sông Đà, Đất Nước, Sóng.",
    is_published: true
  },
  {
    id: 6,
    title: "Trọn bộ Di truyền & Sinh thái học ôn thi đại học khối B",
    subject_id: 6,
    subject: "Sinh học",
    subject_group: "B00",
    price: 390000,
    original_price: 800000,
    discount_percent: 51,
    rating: 4.6,
    student_count: 450,
    lesson_count: 5,
    duration: "8 giờ",
    badge: "New",
    teacher_profile_id: 6,
    teacher_name: "Thầy Nguyễn Đức",
    teacher_avatar: "ND",
    description: "Hướng dẫn phương pháp giải nhanh bài tập quy luật di truyền Men-đen, tương tác gen, di truyền quần thể và cơ chế tiến hóa.",
    is_published: true
  },
  {
    id: 7,
    title: "Lịch sử Việt Nam từ 1919 đến 2000 - Ăn chắc điểm Sử",
    subject_id: 7,
    subject: "Lịch sử",
    subject_group: "C00",
    price: 299000,
    original_price: 600000,
    discount_percent: 50,
    rating: 4.7,
    student_count: 780,
    lesson_count: 5,
    duration: "10 giờ",
    badge: "Recommended",
    teacher_profile_id: 5,
    teacher_name: "Cô Minh Trang",
    teacher_avatar: "MT",
    description: "Tái hiện dòng lịch sử Việt Nam qua các mốc kháng chiến chống Pháp, chống Mỹ và công cuộc Đổi mới bằng sơ đồ thời gian dễ nhớ, giúp ghi nhớ sự kiện sâu sắc.",
    is_published: true
  },
  {
    id: 8,
    title: "Địa lý tự nhiên & Địa lý các vùng kinh tế Việt Nam",
    subject_id: 8,
    subject: "Địa lý",
    subject_group: "C00",
    price: 299000,
    original_price: 600000,
    discount_percent: 50,
    rating: 4.8,
    student_count: 890,
    lesson_count: 5,
    duration: "10 giờ",
    badge: "Hot",
    teacher_profile_id: 2,
    teacher_name: "Cô Thu Hương",
    teacher_avatar: "TH",
    description: "Luyện kỹ năng khai thác Atlat Địa lý Việt Nam tối đa, đọc biểu đồ, phân tích bảng số liệu và làm chủ phần địa lý các vùng kinh tế trọng điểm.",
    is_published: true
  },
  {
    id: 9,
    title: "Giáo dục công dân 12 - Hiến pháp & Pháp luật Việt Nam",
    subject_id: 9,
    subject: "GDCD",
    subject_group: "C00",
    price: 199000,
    original_price: 400000,
    discount_percent: 50,
    rating: 4.9,
    student_count: 1120,
    lesson_count: 5,
    duration: "7 giờ",
    badge: "New",
    teacher_profile_id: 1,
    teacher_name: "Thầy Thế Anh",
    teacher_avatar: "TA",
    description: "Tập hợp các tình huống thực tế thường gặp trong đề thi THPT Quốc Gia môn GDCD, phân tích quyền dân chủ, quyền bình đẳng của công dân.",
    is_published: true
  },
  {
    id: 10,
    title: "Hình học không gian & Phép tính tích phân 12 chuyên sâu",
    subject_id: 1,
    subject: "Toán học",
    subject_group: "A01",
    price: 499000,
    original_price: 900000,
    discount_percent: 45,
    rating: 4.8,
    student_count: 560,
    lesson_count: 5,
    duration: "12 giờ",
    badge: "Hot",
    teacher_profile_id: 1,
    teacher_name: "Thầy Thế Anh",
    teacher_avatar: "TA",
    description: "Trọn bộ chuyên đề khối đa diện, thể tích hình chóp, hình lăng trụ và các phương pháp giải bài toán Tích phân - Nguyên hàm nâng cao.",
    is_published: true
  },
  {
    id: 11,
    title: "Khóa học Tiếng Anh cấp tốc - Luyện đề THPT Quốc Gia",
    subject_id: 3,
    subject: "Tiếng Anh",
    subject_group: "D01",
    price: 299000,
    original_price: 600000,
    discount_percent: 50,
    rating: 4.7,
    student_count: 940,
    lesson_count: 5,
    duration: "9 giờ",
    badge: "Recommended",
    teacher_profile_id: 3,
    teacher_name: "Cô Quỳnh Chi",
    teacher_avatar: "QC",
    description: "Khóa học thực chiến giải chi tiết 30 đề thi chuẩn cấu trúc minh họa của Bộ GD&ĐT, chỉ ra những lỗi sai kinh điển giúp cải thiện 2-3 điểm cấp tốc.",
    is_published: true
  },
  {
    id: 12,
    title: "Hóa vô cơ 12 - Phân nhóm kim loại kiềm, kiềm thổ & nhôm",
    subject_id: 5,
    subject: "Hóa học",
    subject_group: "B00",
    price: 399000,
    original_price: 800000,
    discount_percent: 50,
    rating: 4.8,
    student_count: 420,
    lesson_count: 5,
    duration: "10 giờ",
    badge: "New",
    teacher_profile_id: 4,
    teacher_name: "Thầy Khắc Ngọc",
    teacher_avatar: "KN",
    description: "Chi tiết tính chất hóa học và phương pháp giải toán đồ thị nhôm, toán sục khí CO2 vào dung dịch kiềm thổ cực nhanh không cần lập hệ phương trình phức tạp.",
    is_published: true
  }
];

// Seed chapters & lessons
const MOCK_CHAPTERS = [];
const MOCK_LESSONS = [];

MOCK_COURSES.forEach(c => {
  const chap1Id = c.id * 10 + 1;
  const chap2Id = c.id * 10 + 2;

  MOCK_CHAPTERS.push(
    { id: chap1Id, course_id: c.id, title: "Chương I: Lý thuyết cốt lõi & Phương pháp căn bản", order: 1 },
    { id: chap2Id, course_id: c.id, title: "Chương II: Kỹ thuật thực chiến, Casio & Vận dụng cao", order: 2 }
  );

  MOCK_LESSONS.push(
    { id: c.id * 100 + 1, course_id: c.id, chapter_id: chap1Id, title: "Bài 1: Khái niệm lý thuyết mở đầu và kiến thức nền tảng", order: 1, video_url: "https://www.w3schools.com/html/mov_bbb.mp4", duration: "15:30", content: "Trong bài học này chúng ta sẽ cùng ôn tập các kiến thức cơ bản cốt lõi nhất của chuyên đề này. Hãy ghi chép cẩn thận các định lý và công thức.", is_preview: true },
    { id: c.id * 100 + 2, course_id: c.id, chapter_id: chap1Id, title: "Bài 2: Các dạng bài tập nhận biết - thông hiểu thường gặp", order: 2, video_url: "https://www.w3schools.com/html/movie.mp4", duration: "20:45", content: "Bài giảng đi sâu vào giải các câu hỏi trắc nghiệm mức độ Nhận biết và Thông hiểu trong đề thi chính thức các năm gần đây để giúp các em tránh mất điểm đáng tiếc.", is_preview: false },
    { id: c.id * 100 + 3, course_id: c.id, chapter_id: chap1Id, title: "Bài 3: Phương pháp giải nhanh bằng sơ đồ tư duy & mẹo thi", order: 3, video_url: "https://www.w3schools.com/html/mov_bbb.mp4", duration: "18:20", content: "Hướng dẫn tối ưu hóa cách tư duy, sử dụng sơ đồ tư duy để xâu chuỗi kiến thức và các mẹo loại trừ phương án sai nhanh chóng trong phòng thi.", is_preview: false },
    { id: c.id * 100 + 4, course_id: c.id, chapter_id: chap2Id, title: "Bài 4: Kỹ thuật bấm máy Casio hỗ trợ giải toán trắc nghiệm", order: 4, video_url: "https://www.w3schools.com/html/movie.mp4", duration: "25:10", content: "Khóa học hướng dẫn chi tiết cách dùng Casio FX-580VNX và FX-880BTG để xử lý nhanh các bài toán phức tạp giúp tiết kiệm thời gian tối đa.", is_preview: false },
    { id: c.id * 100 + 5, course_id: c.id, chapter_id: chap2Id, title: "Bài 5: Chinh phục các câu hỏi Vận dụng cao (9+) chuẩn cấu trúc", order: 5, video_url: "https://www.w3schools.com/html/mov_bbb.mp4", duration: "30:15", content: "Bài học cuối cùng tập trung giải quyết các câu hỏi lấy điểm 9 và 10, phân tích các xu hướng ra đề mới nhất của Bộ Giáo Dục và Đào Tạo.", is_preview: false }
  );
});

const MOCK_MATERIALS = [];
MOCK_LESSONS.forEach(l => {
  MOCK_MATERIALS.push(
    { id: l.id * 10 + 1, lesson_id: l.id, title: `Tóm tắt lý thuyết bài học - Bài ${l.order}`, file_url: "#", file_type: "PDF" },
    { id: l.id * 10 + 2, lesson_id: l.id, title: `Bài tập tự luyện trắc nghiệm (có đáp án chi tiết)`, file_url: "#", file_type: "PDF" },
    { id: l.id * 10 + 3, lesson_id: l.id, title: `Slide bài giảng giáo trình số`, file_url: "#", file_type: "Slide" }
  );
});

export const initMockDb = () => {
  if (!localStorage.getItem("supabase_mock_subjects")) {
    localStorage.setItem("supabase_mock_subjects", JSON.stringify(MOCK_SUBJECTS));
  }
  if (!localStorage.getItem("supabase_mock_teacher_profiles")) {
    localStorage.setItem("supabase_mock_teacher_profiles", JSON.stringify(MOCK_TEACHER_PROFILES));
  }
  if (!localStorage.getItem("supabase_mock_courses")) {
    localStorage.setItem("supabase_mock_courses", JSON.stringify(MOCK_COURSES));
  }
  if (!localStorage.getItem("supabase_mock_chapters")) {
    localStorage.setItem("supabase_mock_chapters", JSON.stringify(MOCK_CHAPTERS));
  }
  if (!localStorage.getItem("supabase_mock_lessons")) {
    localStorage.setItem("supabase_mock_lessons", JSON.stringify(MOCK_LESSONS));
  }
  if (!localStorage.getItem("supabase_mock_materials")) {
    localStorage.setItem("supabase_mock_materials", JSON.stringify(MOCK_MATERIALS));
  }
  if (!localStorage.getItem("supabase_mock_payments")) {
    localStorage.setItem("supabase_mock_payments", JSON.stringify([
      { id: 1, student_id: 101, course_id: 1, amount: 499000, transaction_id: "EP101C1", status: "completed", created_at: new Date().toISOString() }
    ]));
  }
  if (!localStorage.getItem("supabase_mock_course_enrollments")) {
    localStorage.setItem("supabase_mock_course_enrollments", JSON.stringify([
      { id: 1, student_id: 101, course_id: 1, payment_id: 1, status: "active", enrolled_at: new Date().toISOString() }
    ]));
  }
  if (!localStorage.getItem("supabase_mock_lesson_progress")) {
    localStorage.setItem("supabase_mock_lesson_progress", JSON.stringify([
      { id: 1, student_id: 101, lesson_id: 101, is_completed: true, updated_at: new Date().toISOString() }
    ]));
  }
  if (!localStorage.getItem("supabase_mock_reviews")) {
    const reviews = [];
    MOCK_COURSES.forEach(c => {
      reviews.push(
        { id: c.id * 10 + 1, course_id: c.id, student_id: 201, student_name: "Lê Minh Tuấn", student_avatar: "MT", rating: 5, comment: "Khóa học rất hay và bám sát đề thi thử của các trường chuyên!", created_at: new Date().toISOString() },
        { id: c.id * 10 + 2, course_id: c.id, student_id: 202, student_name: "Nguyễn Lâm Vy", student_avatar: "LV", rating: 4, comment: "Thầy giảng dễ hiểu, đặc biệt là mẹo bấm máy tính Casio hữu ích.", created_at: new Date().toISOString() }
      );
    });
    localStorage.setItem("supabase_mock_reviews", JSON.stringify(reviews));
  }
  if (!localStorage.getItem("supabase_mock_teacher_messages")) {
    localStorage.setItem("supabase_mock_teacher_messages", JSON.stringify([
      { id: 1, sender_id: 101, receiver_id: 102, content: "Thầy ơi, khóa học này em thi khối A01 có cần học thêm hình học không gian nâng cao không ạ?", created_at: new Date(Date.now() - 7200000).toISOString() },
      { id: 2, sender_id: 102, receiver_id: 101, content: "Chào em, khối A01 thường có khoảng 3-4 câu hình học không gian, có câu vận dụng cao đấy. Em cố gắng học kỹ các bài 3 và 4 trong chương nhé!", created_at: new Date(Date.now() - 3600000).toISOString() }
    ]));
  }
  if (!localStorage.getItem("supabase_mock_ai_messages")) {
    localStorage.setItem("supabase_mock_ai_messages", JSON.stringify([]));
  }
};

// Database operation helpers for local fallback
export const getLocalData = (key) => {
  initMockDb();
  let data = null;
  try {
    data = JSON.parse(localStorage.getItem(key));
  } catch (e) {
    data = null;
  }
  
  const pluralKeys = [
    'supabase_mock_subjects',
    'supabase_mock_teacher_profiles',
    'supabase_mock_courses',
    'supabase_mock_chapters',
    'supabase_mock_lessons',
    'supabase_mock_materials',
    'supabase_mock_payments',
    'supabase_mock_course_enrollments',
    'supabase_mock_lesson_progress',
    'supabase_mock_reviews',
    'supabase_mock_teacher_messages',
    'supabase_mock_ai_messages'
  ];

  if (!data || (pluralKeys.includes(key) && !Array.isArray(data))) {
    localStorage.removeItem(key);
    initMockDb();
    try {
      data = JSON.parse(localStorage.getItem(key));
    } catch (e) {
      data = [];
    }
  }
  return data;
};

export const setLocalData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};
