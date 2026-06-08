import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  HiArrowLeft, HiArrowRight, HiBookOpen, HiClock, HiDocumentText,
  HiLightBulb, HiAcademicCap, HiChartBar, HiDownload, HiStar,
  HiCheck, HiCalendar, HiSparkles, HiUsers,
  HiClipboardList, HiSearch, HiBadgeCheck, HiShieldCheck,
  HiPlay, HiTrendingUp
} from 'react-icons/hi';

import educatorsTeamImg from '../assets/educators_team.png';
import studentSuccessImg from '../assets/student_success.png';
import teacherMathImg from '../assets/teacher_math.png';
import studentLearningImg from '../assets/student_learning.png';

function useDebounce(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function useInView(options = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsInView(true); obs.unobserve(el); } },
      { threshold: 0.15, ...options }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, isInView];
}

function AnimatedCounter({ end, suffix = '', duration = 1800 }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView();
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.max(1, Math.floor(end / (duration / 16)));
    const id = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(id); }
      else setCount(start);
    }, 16);
    return () => clearInterval(id);
  }, [inView, end, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ============================================================
// SUBJECT DATA — 9 môn THPT Quốc Gia
// ============================================================
const SUBJECTS_DATA = [
  {
    id: 'toan', name: 'Toán Học', nameEn: 'Mathematics',
    color: '#5b75f3', emoji: '🦉', symbol: '∫', tagline: 'Cốt lõi của 4/5 khối thi',
    short: 'Môn thi bắt buộc, kiểm tra tư duy logic, đại số và hình học không gian.',
    combos: ['A00', 'A01', 'B00', 'D01'],
    stats: { yearAvg: 6.45, candidates: '1,021,000', maxScore: 10, passRate: '82%' },
    overview: {
      description: 'Toán là môn thi bắt buộc trong kỳ thi THPT Quốc Gia và là môn xét tuyển chính cho hầu hết khối thi đại học. Đề thi đánh giá toàn diện kiến thức từ lớp 10 đến lớp 12.',
      outcomes: [
        'Giải phương trình, bất phương trình, hệ phương trình thành thạo',
        'Khảo sát và vẽ đồ thị hàm số bậc 2, 3, 4',
        'Tính toán nhanh trên máy tính Casio fx-580/880',
        'Giải bài toán hình học không gian, tọa độ Oxyz',
        'Xác suất - thống kê - tổ hợp cơ bản'
      ],
      importance: 'Là môn hệ số 1 trong xét tuyển khối A00/A01/B00/D01. Trọng tâm vào lớp 12 chiếm 75% đề.'
    },
    examStructure: {
      format: 'Trắc nghiệm khách quan', duration: 90, totalQuestions: 50, maxScore: 10,
      difficulty: { easy: 20, medium: 20, hard: 10 },
      distribution: [
        { topic: 'Hàm số & Đồ thị', percent: 24, questions: 12 },
        { topic: 'Hình học không gian', percent: 20, questions: 10 },
        { topic: 'Phương pháp tọa độ Oxyz', percent: 16, questions: 8 },
        { topic: 'Mũ - Logarit - Lượng giác', percent: 16, questions: 8 },
        { topic: 'Tổ hợp - Xác suất', percent: 12, questions: 6 },
        { topic: 'Số phức - Tích phân', percent: 12, questions: 6 }
      ]
    },
    curriculum: {
      grade10: ['Mệnh đề - Tập hợp', 'Hàm số bậc nhất, bậc hai', 'Phương trình & Bất phương trình', 'Thống kê - Xác suất', 'Vectơ', 'Lượng giác cơ bản'],
      grade11: ['Hàm số lượng giác', 'Tổ hợp - Xác suất', 'Dãy số - Cấp số cộng/nhân', 'Giới hạn - Liên tục', 'Đạo hàm', 'Hình học không gian'],
      grade12: ['★ Khảo sát hàm số', 'Hàm mũ - Logarit', '★ Nguyên hàm - Tích phân', '★ Số phức', 'Khối đa diện - Tròn xoay', '★ Phương pháp tọa độ Oxyz']
    },
    materials: [
      { type: 'SGK', title: 'SGK Toán 12 - Cánh Diều', author: 'NXB Giáo dục VN', year: 2024, size: '85 MB', pages: 250 },
      { type: 'SGK', title: 'SGK Toán 12 - Kết Nối Tri Thức', author: 'NXB Giáo dục VN', year: 2024, size: '90 MB', pages: 275 },
      { type: 'Tham khảo', title: 'Bí quyết giải nhanh 35 dạng Toán Casio', author: 'Bùi Thái Học', year: 2024, size: '12 MB', pages: 180 },
      { type: 'Tham khảo', title: '1000 câu hỏi Vận Dụng - Vận Dụng Cao', author: 'Đặng Việt Hùng', year: 2024, size: '18 MB', pages: 320 },
      { type: 'Bộ đề', title: '50 đề thi thử THPTQG 2024', author: 'EduPath Team', year: 2024, size: '25 MB', pages: 500 }
    ],
    pastExams: [
      { year: 2024, avg: 6.45, downloads: '124K', difficulty: 'Khó vừa' },
      { year: 2023, avg: 6.25, downloads: '189K', difficulty: 'Khó' },
      { year: 2022, avg: 6.47, downloads: '215K', difficulty: 'Trung bình' },
      { year: 2021, avg: 6.61, downloads: '301K', difficulty: 'Dễ hơn' },
      { year: 2020, avg: 6.68, downloads: '342K', difficulty: 'Trung bình' },
      { year: 2019, avg: 5.64, downloads: '410K', difficulty: 'Khó nhất' }
    ],
    tips: [
      { icon: '🧮', title: 'Khai thác tối đa Casio fx-580/880', desc: 'Học các phím tắt SOLVE, TABLE, CALC để giải nhanh phương trình, tích phân, xác suất. Tiết kiệm 30% thời gian.' },
      { icon: '📐', title: 'Vẽ hình KHÔNG nhanh - vẽ ĐÚNG', desc: 'Câu hình không gian, dành 1-2 phút vẽ hình rõ ràng giúp giảm 50% sai sót.' },
      { icon: '⚡', title: 'Phân loại 3 lượt làm bài', desc: 'Lượt 1 (30p): câu dễ. Lượt 2 (40p): trung bình. Lượt 3 (20p): khó & VDC.' },
      { icon: '📊', title: 'Bảng công thức nằm lòng', desc: 'Đạo hàm, nguyên hàm, hằng đẳng thức lượng giác phải thuộc. Tự test mỗi sáng 5 phút.' },
      { icon: '🚫', title: 'Lỗi sai thường gặp', desc: 'Quên điều kiện xác định, sai dấu khi nhân chia bất phương trình, đổi đơn vị độ-radian.' }
    ],
    timeline: [
      { phase: '12 tháng', focus: 'Nền tảng lớp 10-11, ôn lại đại số cơ bản', color: '#0984E3' },
      { phase: '6 tháng', focus: 'Học chương trình 12, bám sát SGK, làm BT SGK', color: '#00B894' },
      { phase: '3 tháng', focus: 'Luyện đề theo dạng, 1 đề/ngày, bấm máy thông minh', color: '#F39C12' },
      { phase: '1 tháng', focus: 'Thi thử cường độ cao, sửa lỗi sai, ôn lý thuyết', color: '#E74C3C' }
    ]
  },
  {
    id: 'van', name: 'Ngữ Văn', nameEn: 'Literature',
    color: '#4598a7', emoji: '🦋', symbol: '✒', tagline: 'Môn duy nhất tự luận 100%',
    short: 'Đánh giá năng lực đọc - hiểu, nghị luận xã hội và cảm thụ văn học.',
    combos: ['C00', 'D01'],
    stats: { yearAvg: 7.06, candidates: '1,021,000', maxScore: 10, passRate: '94%' },
    overview: {
      description: 'Ngữ Văn là môn thi bắt buộc, hoàn toàn tự luận, đánh giá kỹ năng đọc hiểu, viết nghị luận và cảm thụ tác phẩm văn học từ lớp 12.',
      outcomes: [
        'Đọc hiểu văn bản: nhận diện phương thức biểu đạt, biện pháp tu từ',
        'Viết đoạn nghị luận xã hội (200 chữ) khoa học, lập luận chặt chẽ',
        'Phân tích tác phẩm văn học theo nhiều góc độ',
        'Sử dụng dẫn chứng linh hoạt, sinh động',
        'Trình bày sạch đẹp, đúng chính tả, ngữ pháp'
      ],
      importance: 'Môn thi bắt buộc duy nhất tự luận. Trung bình cao nhất trong các môn (7.06/10).'
    },
    examStructure: {
      format: 'Tự luận 100%', duration: 120, totalQuestions: 6, maxScore: 10,
      difficulty: { easy: 2, medium: 3, hard: 1 },
      distribution: [
        { topic: 'Đọc hiểu (Phần I)', percent: 30, questions: 4 },
        { topic: 'Nghị luận xã hội (200 chữ)', percent: 20, questions: 1 },
        { topic: 'Nghị luận văn học', percent: 50, questions: 1 }
      ]
    },
    curriculum: {
      grade10: ['Văn học dân gian VN', 'Thơ Đường - Thơ Hồ Xuân Hương', 'Truyện ngắn hiện đại VN', 'Thực hành làm văn nghị luận'],
      grade11: ['Văn học trung đại VN', 'Thơ Mới (1932-1945)', 'Truyện và Ký hiện đại', 'Rèn kỹ năng đọc hiểu, viết đoạn'],
      grade12: ['★ Tây Tiến - Quang Dũng', '★ Việt Bắc - Tố Hữu', '★ Đất Nước - Nguyễn Khoa Điềm', '★ Sóng - Xuân Quỳnh', '★ Người lái đò Sông Đà - Nguyễn Tuân', '★ Vợ chồng A Phủ - Tô Hoài', '★ Vợ nhặt - Kim Lân', '★ Chiếc thuyền ngoài xa - Nguyễn Minh Châu']
    },
    materials: [
      { type: 'SGK', title: 'SGK Ngữ Văn 12 tập 1 & 2', author: 'NXB Giáo dục VN', year: 2024, size: '120 MB', pages: 480 },
      { type: 'Tham khảo', title: 'Kỹ năng đọc hiểu Ngữ Văn theo chủ đề', author: 'Đỗ Kim Hảo', year: 2024, size: '8 MB', pages: 220 },
      { type: 'Tham khảo', title: 'Tuyển tập 100 bài văn mẫu lớp 12', author: 'Nguyễn Đăng Mạnh', year: 2024, size: '15 MB', pages: 380 },
      { type: 'Bộ đề', title: 'Tuyển tập đề thi thử Ngữ Văn 2024', author: 'EduPath Team', year: 2024, size: '20 MB', pages: 250 }
    ],
    pastExams: [
      { year: 2024, avg: 7.06, downloads: '198K', difficulty: 'Trung bình' },
      { year: 2023, avg: 6.86, downloads: '231K', difficulty: 'Khó vừa' },
      { year: 2022, avg: 6.51, downloads: '267K', difficulty: 'Khó' },
      { year: 2021, avg: 6.47, downloads: '298K', difficulty: 'Trung bình' },
      { year: 2020, avg: 6.61, downloads: '321K', difficulty: 'Dễ hơn' }
    ],
    tips: [
      { icon: '📝', title: 'Lập dàn ý 5 phút trước khi viết', desc: 'Dàn ý rõ ràng giúp bài viết logic, không lan man. Đầu tư 5 phút tiết kiệm 30 phút sửa lỗi.' },
      { icon: '💎', title: 'Học thuộc 10-15 dẫn chứng "vàng"', desc: 'Mỗi tác phẩm 2-3 dẫn chứng quan trọng. Phân loại theo chủ đề: yêu nước, tình yêu, hạnh phúc, nỗi đau.' },
      { icon: '⏰', title: 'Quản lý thời gian 120 phút', desc: 'Đọc hiểu: 20p | NLXH: 25p | NLVH: 70p | Soát lỗi: 5p. Tuân thủ tuyệt đối.' },
      { icon: '🎯', title: 'Mở bài "định hướng - sáng tạo"', desc: 'Tránh mở bài dài 200 chữ. 3-5 câu nêu vấn đề + cảm xúc + giới thiệu là đủ.' },
      { icon: '🚫', title: 'Lỗi sai thường gặp', desc: 'Phân tích lan man không bám đề, thiếu dẫn chứng, sai chính tả tên nhân vật.' }
    ],
    timeline: [
      { phase: '12 tháng', focus: 'Đọc kỹ tác phẩm SGK, ghi chép cảm nhận cá nhân', color: '#0984E3' },
      { phase: '6 tháng', focus: 'Luyện viết đoạn NLXH, học thuộc dẫn chứng theo chủ đề', color: '#00B894' },
      { phase: '3 tháng', focus: 'Viết bài hoàn chỉnh, chữa lỗi với giáo viên', color: '#F39C12' },
      { phase: '1 tháng', focus: 'Tổng ôn 8 tác phẩm trọng tâm, viết tốc độ', color: '#E74C3C' }
    ]
  },
  {
    id: 'anh', name: 'Tiếng Anh', nameEn: 'English',
    color: '#db8142', emoji: '🐸', symbol: 'A', tagline: 'Ngôn ngữ toàn cầu',
    short: 'Đánh giá ngữ pháp, từ vựng, đọc hiểu và kỹ năng giao tiếp tiếng Anh.',
    combos: ['A01', 'D01'],
    stats: { yearAvg: 5.51, candidates: '906,000', maxScore: 10, passRate: '63%' },
    overview: {
      description: 'Tiếng Anh là môn xét tuyển chính cho khối A01, D01 và nhiều ngành hot như Kinh tế đối ngoại, Truyền thông quốc tế. Đề thi gồm ngữ âm, từ vựng, ngữ pháp và đọc hiểu.',
      outcomes: [
        'Nắm vững 12 thì cơ bản và 8 thì nâng cao',
        'Từ vựng theo chủ đề: 3000-5000 từ',
        'Kỹ năng đọc hiểu: skim, scan, infer',
        'Phân biệt phát âm /s/, /es/, /ed/, đánh dấu trọng âm',
        'Nhận diện và sửa lỗi câu, viết lại câu giữ nguyên nghĩa'
      ],
      importance: 'Môn có sự phân hóa cao nhất, học sinh giỏi dễ đạt 9-10, học sinh yếu thường dưới 5.'
    },
    examStructure: {
      format: 'Trắc nghiệm khách quan', duration: 60, totalQuestions: 50, maxScore: 10,
      difficulty: { easy: 25, medium: 15, hard: 10 },
      distribution: [
        { topic: 'Ngữ âm - Trọng âm', percent: 8, questions: 4 },
        { topic: 'Ngữ pháp - Từ vựng', percent: 30, questions: 15 },
        { topic: 'Tìm lỗi sai - Đồng nghĩa', percent: 16, questions: 8 },
        { topic: 'Đọc điền từ', percent: 16, questions: 8 },
        { topic: 'Đọc hiểu (2 bài)', percent: 24, questions: 12 },
        { topic: 'Giao tiếp - Viết lại câu', percent: 6, questions: 3 }
      ]
    },
    curriculum: {
      grade10: ['12 thì cơ bản', 'Câu điều kiện loại 1, 2, 3', 'Từ vựng 1500 từ cốt lõi', 'Phát âm cơ bản'],
      grade11: ['Câu bị động - Câu gián tiếp', 'Mệnh đề quan hệ', 'Câu giả định', 'Đảo ngữ', 'Từ vựng 2500 từ'],
      grade12: ['★ Tổng hợp ngữ pháp 12 thì', '★ Từ vựng học thuật 3500 từ', '★ Đọc hiểu nâng cao', 'Phrasal verbs', 'Idioms thông dụng']
    },
    materials: [
      { type: 'SGK', title: 'SGK Tiếng Anh 12 - Friends Global', author: 'NXB Giáo dục VN', year: 2024, size: '95 MB', pages: 220 },
      { type: 'Tham khảo', title: 'Destination B1 + B2 (Macmillan)', author: 'Malcolm Mann', year: 2023, size: '40 MB', pages: 450 },
      { type: 'Tham khảo', title: 'Cambridge Grammar in Use', author: 'Raymond Murphy', year: 2023, size: '35 MB', pages: 380 },
      { type: 'Tham khảo', title: 'Bộ 3000 từ vựng THPT theo chủ đề', author: 'EduPath Team', year: 2024, size: '8 MB', pages: 180 },
      { type: 'Bộ đề', title: '50 đề thi thử Tiếng Anh 2024', author: 'Cô Mai Phương', year: 2024, size: '22 MB', pages: 400 }
    ],
    pastExams: [
      { year: 2024, avg: 5.51, downloads: '167K', difficulty: 'Khó' },
      { year: 2023, avg: 5.45, downloads: '203K', difficulty: 'Khó' },
      { year: 2022, avg: 5.15, downloads: '245K', difficulty: 'Rất khó' },
      { year: 2021, avg: 5.84, downloads: '278K', difficulty: 'Trung bình' },
      { year: 2020, avg: 4.58, downloads: '312K', difficulty: 'Khó nhất' }
    ],
    tips: [
      { icon: '🔤', title: 'Học từ vựng theo cụm (collocations)', desc: 'Thay vì học "make" riêng, học "make a decision", "make an effort". Nhớ lâu hơn 3x.' },
      { icon: '📖', title: 'Đọc tiếng Anh mỗi ngày 15 phút', desc: 'Đọc tin BBC Learning, VOA. Không cần hiểu 100%, chỉ cần hiểu ý chính.' },
      { icon: '🎧', title: 'Nghe podcast khi rảnh', desc: 'TED-Ed, 6 Minute English. Vừa giải trí vừa luyện kỹ năng nghe và ngữ pháp tự nhiên.' },
      { icon: '🎯', title: 'Phân bổ thời gian 60 phút', desc: 'Ngữ âm + ngữ pháp: 20p | Đọc hiểu: 30p | Còn lại + soát: 10p.' },
      { icon: '🚫', title: 'Lỗi sai thường gặp', desc: 'Sai trọng âm các từ tận cùng -tion, -sion. Confuse subject-verb agreement. Sai giới từ.' }
    ],
    timeline: [
      { phase: '12 tháng', focus: 'Xây nền tảng ngữ pháp 12 thì + 1500 từ cốt lõi', color: '#0984E3' },
      { phase: '6 tháng', focus: 'Mở rộng từ vựng theo chủ đề + luyện đọc hiểu', color: '#00B894' },
      { phase: '3 tháng', focus: 'Luyện đề chính thức, sửa lỗi từng dạng', color: '#F39C12' },
      { phase: '1 tháng', focus: 'Mỗi ngày 1 đề, học lại lỗi sai cố hữu', color: '#E71C3C' }
    ]
  },
  {
    id: 'ly', name: 'Vật Lý', nameEn: 'Physics',
    color: '#52ad58', emoji: '🦊', symbol: 'Φ', tagline: 'Khoa học của tự nhiên',
    short: 'Đánh giá tư duy logic, vận dụng công thức và giải bài tập tính toán.',
    combos: ['A00', 'A01'],
    stats: { yearAvg: 6.21, candidates: '321,000', maxScore: 10, passRate: '78%' },
    overview: {
      description: 'Vật Lý là môn xét tuyển khối A00, A01. Đề thi bao gồm cơ học, điện học, sóng, lượng tử và hạt nhân - đòi hỏi nắm vững công thức và kỹ năng tính toán.',
      outcomes: [
        'Áp dụng công thức cơ học, dao động, sóng cơ',
        'Giải bài toán mạch điện xoay chiều bằng phương pháp giản đồ vector',
        'Hiện tượng quang điện, sóng ánh sáng, lượng tử',
        'Phản ứng hạt nhân, năng lượng liên kết',
        'Sử dụng máy tính Casio và kỹ thuật tính nhanh'
      ],
      importance: 'Trọng tâm vào Dao động cơ, Điện xoay chiều - chiếm 60% đề. Lý là môn dễ "ăn điểm" nếu học chuyên sâu.'
    },
    examStructure: {
      format: 'Trắc nghiệm khách quan', duration: 50, totalQuestions: 40, maxScore: 10,
      difficulty: { easy: 16, medium: 16, hard: 8 },
      distribution: [
        { topic: 'Dao động cơ', percent: 22.5, questions: 9 },
        { topic: 'Sóng cơ - Sóng âm', percent: 15, questions: 6 },
        { topic: 'Dòng điện xoay chiều', percent: 22.5, questions: 9 },
        { topic: 'Dao động & Sóng điện từ', percent: 10, questions: 4 },
        { topic: 'Sóng ánh sáng', percent: 10, questions: 4 },
        { topic: 'Lượng tử ánh sáng - Hạt nhân', percent: 20, questions: 8 }
      ]
    },
    curriculum: {
      grade10: ['Động học chất điểm', 'Động lực học (3 định luật Newton)', 'Tĩnh học', 'Các định luật bảo toàn', 'Nhiệt học'],
      grade11: ['Điện tích - Điện trường', 'Dòng điện không đổi', 'Từ trường - Cảm ứng điện từ', 'Khúc xạ - Phản xạ ánh sáng', 'Mắt và các dụng cụ quang'],
      grade12: ['★ Dao động cơ học', '★ Sóng cơ và sóng âm', '★ Dòng điện xoay chiều', 'Dao động và sóng điện từ', 'Sóng ánh sáng', '★ Lượng tử ánh sáng - Hạt nhân']
    },
    materials: [
      { type: 'SGK', title: 'SGK Vật Lý 12 - Cánh Diều', author: 'NXB Giáo dục VN', year: 2024, size: '70 MB', pages: 240 },
      { type: 'Tham khảo', title: 'Sổ tay 100 công thức giải nhanh Vật Lý', author: 'Chu Văn Biên', year: 2024, size: '5 MB', pages: 95 },
      { type: 'Tham khảo', title: 'Phương pháp giản đồ vector cho dòng điện', author: 'Bùi Quang Hân', year: 2024, size: '8 MB', pages: 180 },
      { type: 'Bộ đề', title: '40 đề thi thử Vật Lý 2024', author: 'Vũ Ngọc Anh', year: 2024, size: '18 MB', pages: 320 }
    ],
    pastExams: [
      { year: 2024, avg: 6.21, downloads: '89K', difficulty: 'Khó vừa' },
      { year: 2023, avg: 6.57, downloads: '112K', difficulty: 'Trung bình' },
      { year: 2022, avg: 6.72, downloads: '134K', difficulty: 'Dễ hơn' },
      { year: 2021, avg: 6.56, downloads: '156K', difficulty: 'Trung bình' },
      { year: 2020, avg: 6.72, downloads: '178K', difficulty: 'Trung bình' }
    ],
    tips: [
      { icon: '⚡', title: 'Học công thức theo "gói" chủ đề', desc: 'Mỗi chương 10-15 công thức gốc. Học hiểu bản chất, không học vẹt. Vẽ sơ đồ tư duy.' },
      { icon: '📐', title: 'Vẽ giản đồ vector cho điện xoay chiều', desc: 'Bài toán mạch điện R-L-C trở nên đơn giản gấp 5 lần khi dùng vector. Bắt buộc thành thạo.' },
      { icon: '🧮', title: 'Casio fx-580/880 cho số phức', desc: 'Đổi sang chế độ CMPLX để giải nhanh mạch điện. Tiết kiệm 50% thời gian.' },
      { icon: '📊', title: 'Đồ thị là chìa khóa Dao động cơ', desc: 'Vẽ vòng tròn lượng giác cho dao động điều hòa, đọc các đại lượng x, v, a trực tiếp.' },
      { icon: '🚫', title: 'Lỗi sai thường gặp', desc: 'Quên đổi đơn vị (rad/s ↔ Hz), sai chiều của lực, nhầm pha giữa u và i.' }
    ],
    timeline: [
      { phase: '12 tháng', focus: 'Củng cố cơ học lớp 10, điện học lớp 11', color: '#0984E3' },
      { phase: '6 tháng', focus: 'Học chương trình 12, lập sổ tay công thức', color: '#00B894' },
      { phase: '3 tháng', focus: 'Luyện đề theo từng chương, thành thạo Casio', color: '#F39C12' },
      { phase: '1 tháng', focus: '1 đề/ngày, ôn lỗi sai cố hữu', color: '#E74C3C' }
    ]
  },
  {
    id: 'hoa', name: 'Hóa Học', nameEn: 'Chemistry',
    color: '#cf6674', emoji: '🐙', symbol: '⚗', tagline: 'Hai vũ khí: lý thuyết + bài tập',
    short: 'Cân bằng giữa lý thuyết hóa học hữu cơ - vô cơ và bài toán hóa học.',
    combos: ['A00', 'B00'],
    stats: { yearAvg: 6.68, candidates: '345,000', maxScore: 10, passRate: '85%' },
    overview: {
      description: 'Hóa Học gồm 3 phần: hóa vô cơ, hóa hữu cơ và bài toán hóa. Đề thi đánh giá khả năng cân bằng phương trình, tính toán theo định luật bảo toàn và áp dụng tính chất hóa học.',
      outcomes: [
        'Cân bằng phương trình hóa học (oxi hóa - khử)',
        'Áp dụng định luật bảo toàn khối lượng, nguyên tố, electron',
        'Nhận biết các chất hữu cơ qua phản ứng đặc trưng',
        'Giải bài toán hỗn hợp bằng phương pháp đường chéo, đường đẳng nhiệt',
        'Tính toán pH, nồng độ dung dịch'
      ],
      importance: 'Là môn xét tuyển khối B00 - Y Dược. Trọng tâm vào este, amin, peptit và hợp chất hữu cơ chứa N.'
    },
    examStructure: {
      format: 'Trắc nghiệm khách quan', duration: 50, totalQuestions: 40, maxScore: 10,
      difficulty: { easy: 16, medium: 16, hard: 8 },
      distribution: [
        { topic: 'Este - Lipit', percent: 12.5, questions: 5 },
        { topic: 'Cacbohiđrat', percent: 7.5, questions: 3 },
        { topic: 'Amin - Amino axit - Peptit', percent: 15, questions: 6 },
        { topic: 'Polime - Vật liệu polime', percent: 5, questions: 2 },
        { topic: 'Đại cương Kim loại', percent: 15, questions: 6 },
        { topic: 'Kim loại kiềm - kiềm thổ - nhôm', percent: 15, questions: 6 },
        { topic: 'Crom - Sắt - Đồng', percent: 15, questions: 6 },
        { topic: 'Hóa học và môi trường', percent: 15, questions: 6 }
      ]
    },
    curriculum: {
      grade10: ['Cấu tạo nguyên tử - Bảng tuần hoàn', 'Liên kết hóa học', 'Phản ứng oxi hóa - khử', 'Tốc độ phản ứng - Cân bằng hóa học', 'Halogen', 'Oxi - Lưu huỳnh'],
      grade11: ['Sự điện li', 'Nitơ - Photpho', 'Cacbon - Silic', 'Đại cương hóa hữu cơ', 'Hiđrocacbon no, không no, thơm', 'Dẫn xuất halogen, ancol, phenol'],
      grade12: ['★ Este - Lipit', '★ Cacbohiđrat', '★ Amin - Amino axit - Peptit', 'Polime', 'Đại cương kim loại', '★ Kim loại kiềm, kiềm thổ, nhôm', '★ Crom - Sắt - Đồng']
    },
    materials: [
      { type: 'SGK', title: 'SGK Hóa Học 12 - Cánh Diều', author: 'NXB Giáo dục VN', year: 2024, size: '75 MB', pages: 260 },
      { type: 'Tham khảo', title: 'Phương pháp giải nhanh Hóa hữu cơ', author: 'Lê Phạm Thành', year: 2024, size: '12 MB', pages: 220 },
      { type: 'Tham khảo', title: 'Tuyển tập câu hỏi VDC Hóa học', author: 'Nguyễn Văn Đậu', year: 2024, size: '15 MB', pages: 280 },
      { type: 'Bộ đề', title: '40 đề thi thử Hóa Học 2024', author: 'EduPath Team', year: 2024, size: '20 MB', pages: 360 }
    ],
    pastExams: [
      { year: 2024, avg: 6.68, downloads: '92K', difficulty: 'Trung bình' },
      { year: 2023, avg: 6.74, downloads: '118K', difficulty: 'Trung bình' },
      { year: 2022, avg: 6.70, downloads: '143K', difficulty: 'Trung bình' },
      { year: 2021, avg: 6.63, downloads: '167K', difficulty: 'Trung bình' },
      { year: 2020, avg: 6.71, downloads: '189K', difficulty: 'Dễ hơn' }
    ],
    tips: [
      { icon: '⚖️', title: 'Bảo toàn là vũ khí số 1', desc: 'BT khối lượng, BT nguyên tố, BT electron, BT điện tích. 4 định luật giải 80% bài toán.' },
      { icon: '🧪', title: 'Học theo dãy phản ứng', desc: 'Mỗi chất nắm 5-7 phản ứng đặc trưng. Lập sơ đồ chuyển hóa C → CH4 → CO2... ' },
      { icon: '🎯', title: 'Phân loại câu hỏi 4 mức', desc: 'Lý thuyết nhận biết: 1p/câu | BT cơ bản: 2p | VD: 3p | VDC: 5p. Quản lý chặt thời gian.' },
      { icon: '📋', title: 'Bảng tuần hoàn là bạn', desc: 'Nắm vững nhóm IA, IIA, IIIA và kim loại chuyển tiếp. Quy luật biến đổi tính chất.' },
      { icon: '🚫', title: 'Lỗi sai thường gặp', desc: 'Quên cân bằng phương trình, sai số mol, nhầm hóa trị Fe (2 và 3), tính sai pH.' }
    ],
    timeline: [
      { phase: '12 tháng', focus: 'Hệ thống lại lớp 10-11, tập phản ứng cơ bản', color: '#0984E3' },
      { phase: '6 tháng', focus: 'Học chương trình 12, phương pháp giải nhanh', color: '#00B894' },
      { phase: '3 tháng', focus: 'Luyện đề theo chủ đề, làm BT bảo toàn', color: '#F39C12' },
      { phase: '1 tháng', focus: 'Thi thử, tổng ôn este - amin - peptit', color: '#E74C3C' }
    ]
  },
  {
    id: 'sinh', name: 'Sinh Học', nameEn: 'Biology',
    color: '#6f4ab3', emoji: '🐢', symbol: '🧬', tagline: 'Khoa học sự sống',
    short: 'Đánh giá kiến thức di truyền, tiến hóa, sinh thái và sinh học cơ thể.',
    combos: ['B00'],
    stats: { yearAvg: 6.07, candidates: '298,000', maxScore: 10, passRate: '72%' },
    overview: {
      description: 'Sinh Học là môn xét tuyển khối B00 - Y, Dược, Răng-hàm-mặt. Đề thi tập trung vào di truyền học (50%) và sinh thái - tiến hóa - sinh học cơ thể (50%).',
      outcomes: [
        'Áp dụng quy luật Mendel để giải bài tập di truyền',
        'Tính toán xác suất tổ hợp lai, di truyền liên kết, hoán vị gen',
        'Hiểu cơ chế biến dị: đột biến gen, đột biến NST',
        'Nắm vững học thuyết tiến hóa Darwin và tiến hóa hiện đại',
        'Phân tích hệ sinh thái, chuỗi - lưới thức ăn'
      ],
      importance: 'Môn quan trọng nhất khối B00. Trọng tâm di truyền lớp 12 (cơ chế phân tử, quy luật).'
    },
    examStructure: {
      format: 'Trắc nghiệm khách quan', duration: 50, totalQuestions: 40, maxScore: 10,
      difficulty: { easy: 16, medium: 16, hard: 8 },
      distribution: [
        { topic: 'Cơ chế di truyền cấp phân tử', percent: 15, questions: 6 },
        { topic: 'Cơ chế di truyền cấp tế bào', percent: 10, questions: 4 },
        { topic: 'Tính quy luật của hiện tượng di truyền', percent: 25, questions: 10 },
        { topic: 'Di truyền học quần thể', percent: 10, questions: 4 },
        { topic: 'Tiến hóa', percent: 15, questions: 6 },
        { topic: 'Sinh thái học', percent: 15, questions: 6 },
        { topic: 'Sinh học cơ thể (lớp 11)', percent: 10, questions: 4 }
      ]
    },
    curriculum: {
      grade10: ['Sinh học tế bào', 'Chuyển hóa vật chất và năng lượng', 'Sinh học vi sinh vật'],
      grade11: ['Chuyển hóa vật chất ở động vật', 'Cảm ứng', 'Sinh trưởng và phát triển', 'Sinh sản'],
      grade12: ['★ Cơ chế di truyền và biến dị', '★ Tính quy luật của hiện tượng di truyền', '★ Di truyền học quần thể', 'Ứng dụng di truyền học', '★ Tiến hóa', '★ Sinh thái học']
    },
    materials: [
      { type: 'SGK', title: 'SGK Sinh Học 12 - Cánh Diều', author: 'NXB Giáo dục VN', year: 2024, size: '80 MB', pages: 280 },
      { type: 'Tham khảo', title: 'Bí kíp giải nhanh bài tập Di truyền', author: 'Phan Khắc Nghệ', year: 2024, size: '10 MB', pages: 200 },
      { type: 'Tham khảo', title: 'Atlat Sinh học - Sơ đồ tư duy', author: 'Đỗ Mạnh Hùng', year: 2024, size: '15 MB', pages: 150 },
      { type: 'Bộ đề', title: '40 đề Sinh Học 2024 - chuẩn cấu trúc', author: 'EduPath Team', year: 2024, size: '18 MB', pages: 300 }
    ],
    pastExams: [
      { year: 2024, avg: 6.07, downloads: '78K', difficulty: 'Khó vừa' },
      { year: 2023, avg: 5.92, downloads: '95K', difficulty: 'Khó' },
      { year: 2022, avg: 5.02, downloads: '124K', difficulty: 'Rất khó' },
      { year: 2021, avg: 5.51, downloads: '147K', difficulty: 'Khó' },
      { year: 2020, avg: 5.59, downloads: '168K', difficulty: 'Khó' }
    ],
    tips: [
      { icon: '🧬', title: 'Sơ đồ tư duy cho di truyền', desc: 'Mỗi quy luật di truyền vẽ sơ đồ riêng. Mendel, Morgan, di truyền liên kết, hoán vị gen.' },
      { icon: '🎲', title: 'Xác suất là chìa khóa', desc: 'Học công thức xác suất tổ hợp gen, tỷ lệ kiểu hình. Phân biệt rõ "ít nhất 1", "đúng 1".' },
      { icon: '🌿', title: 'Sinh thái học - học theo chuỗi', desc: 'Quần thể → quần xã → hệ sinh thái → sinh quyển. Mỗi cấp có đặc trưng riêng.' },
      { icon: '⏱️', title: 'Phân bổ thời gian 50 phút', desc: 'Câu lý thuyết: 30-45s | Câu BT cơ bản: 2p | VDC: 4-5p. Bỏ câu khó nếu kẹt.' },
      { icon: '🚫', title: 'Lỗi sai thường gặp', desc: 'Nhầm tỷ lệ kiểu gen và kiểu hình, sai khi liên kết-hoán vị, quên ảnh hưởng môi trường.' }
    ],
    timeline: [
      { phase: '12 tháng', focus: 'Sinh học tế bào và sinh học cơ thể (10-11)', color: '#0984E3' },
      { phase: '6 tháng', focus: 'Học chương trình 12, đặc biệt di truyền học', color: '#00B894' },
      { phase: '3 tháng', focus: 'Luyện bài tập di truyền phức tạp, VDC', color: '#F39C12' },
      { phase: '1 tháng', focus: 'Tổng ôn, làm đề chuẩn, cải thiện tốc độ', color: '#E74C3C' }
    ]
  },
  {
    id: 'su', name: 'Lịch Sử', nameEn: 'History',
    color: '#c44747', emoji: '📜', symbol: '⚔', tagline: 'Hành trình dân tộc',
    short: 'Đánh giá kiến thức lịch sử Việt Nam và thế giới từ 1858 đến nay.',
    combos: ['C00'],
    stats: { yearAvg: 5.79, candidates: '548,000', maxScore: 10, passRate: '65%' },
    overview: {
      description: 'Lịch Sử thi cùng tổ hợp KHXH, xét tuyển khối C00. Đề bao gồm lịch sử Việt Nam (60%) và lịch sử thế giới (40%) từ giữa thế kỷ XIX đến đầu thế kỷ XXI.',
      outcomes: [
        'Nắm vững các giai đoạn lịch sử Việt Nam 1858-1975',
        'Hiểu các sự kiện thế giới: hai cuộc thế chiến, Chiến tranh lạnh',
        'Phân tích nguyên nhân - diễn biến - kết quả - ý nghĩa các sự kiện',
        'So sánh đối chiếu các cuộc cách mạng, kháng chiến',
        'Vận dụng kiến thức để giải các câu hỏi vận dụng cao'
      ],
      importance: 'Môn xét tuyển khối C00 - các ngành Luật, Báo chí, Quan hệ quốc tế. Cần ghi nhớ chính xác mốc thời gian.'
    },
    examStructure: {
      format: 'Trắc nghiệm khách quan', duration: 50, totalQuestions: 40, maxScore: 10,
      difficulty: { easy: 18, medium: 14, hard: 8 },
      distribution: [
        { topic: 'Lịch sử thế giới (1945-2000)', percent: 40, questions: 16 },
        { topic: 'Lịch sử Việt Nam (1919-1945)', percent: 25, questions: 10 },
        { topic: 'Lịch sử Việt Nam (1945-1975)', percent: 25, questions: 10 },
        { topic: 'Lịch sử Việt Nam (1975-2000)', percent: 10, questions: 4 }
      ]
    },
    curriculum: {
      grade10: ['Lịch sử thế giới cổ đại - trung đại', 'Lịch sử Việt Nam cổ - trung đại'],
      grade11: ['Lịch sử thế giới cận đại', 'Lịch sử Việt Nam 1858-1918'],
      grade12: ['★ Lịch sử thế giới 1945-2000', '★ Việt Nam 1919-1930 (Đảng ra đời)', '★ Việt Nam 1930-1945 (Cách mạng tháng 8)', '★ Việt Nam 1945-1954 (Kháng chiến chống Pháp)', '★ Việt Nam 1954-1975 (Kháng chiến chống Mỹ)', 'Việt Nam 1975-2000 (Xây dựng CNXH)']
    },
    materials: [
      { type: 'SGK', title: 'SGK Lịch Sử 12 - Cánh Diều', author: 'NXB Giáo dục VN', year: 2024, size: '95 MB', pages: 320 },
      { type: 'Tham khảo', title: 'Sơ đồ tư duy Lịch Sử THPT', author: 'Trần Thái Hà', year: 2024, size: '20 MB', pages: 180 },
      { type: 'Tham khảo', title: 'Niên biểu Lịch Sử Việt Nam', author: 'NXB Đại học Sư phạm', year: 2024, size: '8 MB', pages: 120 },
      { type: 'Bộ đề', title: '40 đề Lịch Sử bám sát cấu trúc', author: 'EduPath Team', year: 2024, size: '15 MB', pages: 280 }
    ],
    pastExams: [
      { year: 2024, avg: 5.79, downloads: '142K', difficulty: 'Trung bình' },
      { year: 2023, avg: 6.03, downloads: '167K', difficulty: 'Dễ hơn' },
      { year: 2022, avg: 6.34, downloads: '189K', difficulty: 'Dễ' },
      { year: 2021, avg: 4.97, downloads: '215K', difficulty: 'Khó nhất' },
      { year: 2020, avg: 5.19, downloads: '243K', difficulty: 'Khó' }
    ],
    tips: [
      { icon: '🗓️', title: 'Lập niên biểu trực quan', desc: 'Vẽ trục thời gian dài, ghi rõ sự kiện. Phân màu theo giai đoạn. In to dán tường.' },
      { icon: '🔗', title: 'Liên kết sự kiện theo chuỗi nhân-quả', desc: 'Mỗi sự kiện có nguyên nhân - diễn biến - kết quả. Học theo logic, không thuộc lòng.' },
      { icon: '📍', title: 'So sánh đối chiếu', desc: 'So sánh CM tháng 8 với CM tháng 10 Nga, kháng chiến chống Pháp & chống Mỹ.' },
      { icon: '🎯', title: 'Đọc kỹ đề - bẫy chi tiết', desc: 'Đề thường thay đổi ngày tháng, tên người, địa danh để bẫy. Đọc 2-3 lần trước khi chọn.' },
      { icon: '🚫', title: 'Lỗi sai thường gặp', desc: 'Nhầm năm 1930 & 1945, nhầm Nguyễn Ái Quốc & Hồ Chí Minh trong giai đoạn cụ thể.' }
    ],
    timeline: [
      { phase: '12 tháng', focus: 'Học bao quát lịch sử thế giới và VN cận đại', color: '#0984E3' },
      { phase: '6 tháng', focus: 'Tập trung lớp 12, lập sơ đồ tư duy từng chương', color: '#00B894' },
      { phase: '3 tháng', focus: 'Luyện đề theo từng giai đoạn lịch sử', color: '#F39C12' },
      { phase: '1 tháng', focus: 'Niên biểu tổng hợp, làm đề chuẩn', color: '#E74C3C' }
    ]
  },
  {
    id: 'dia', name: 'Địa Lý', nameEn: 'Geography',
    color: '#2d8659', emoji: '🌍', symbol: '🗺', tagline: 'Hiểu Việt Nam và thế giới',
    short: 'Đánh giá kiến thức địa lý tự nhiên, kinh tế xã hội và kỹ năng sử dụng Atlat.',
    combos: ['C00'],
    stats: { yearAvg: 6.45, candidates: '548,000', maxScore: 10, passRate: '83%' },
    overview: {
      description: 'Địa Lý thi cùng tổ hợp KHXH. Đề thi có đặc thù riêng: 15 câu sử dụng Atlat Địa lý VN, các câu còn lại về kinh tế - xã hội và địa lý tự nhiên VN.',
      outcomes: [
        'Sử dụng thành thạo Atlat Địa lý Việt Nam (Nhà xuất bản Giáo dục)',
        'Phân tích biểu đồ, bảng số liệu kinh tế',
        'Hiểu đặc điểm tự nhiên các vùng kinh tế VN',
        'Nắm xu hướng phát triển kinh tế - xã hội',
        'Vận dụng kiến thức vào thực tiễn'
      ],
      importance: 'Môn "ăn điểm" nếu thành thạo Atlat. 15/40 câu (37.5%) có thể tra cứu trực tiếp Atlat.'
    },
    examStructure: {
      format: 'Trắc nghiệm khách quan', duration: 50, totalQuestions: 40, maxScore: 10,
      difficulty: { easy: 20, medium: 12, hard: 8 },
      distribution: [
        { topic: 'Sử dụng Atlat Địa lý VN', percent: 37.5, questions: 15 },
        { topic: 'Địa lý tự nhiên VN', percent: 15, questions: 6 },
        { topic: 'Địa lý dân cư', percent: 7.5, questions: 3 },
        { topic: 'Địa lý các ngành kinh tế', percent: 20, questions: 8 },
        { topic: 'Địa lý các vùng kinh tế', percent: 20, questions: 8 }
      ]
    },
    curriculum: {
      grade10: ['Bản đồ', 'Trái Đất', 'Khí quyển - Thủy quyển', 'Thổ nhưỡng - Sinh quyển'],
      grade11: ['Khái quát kinh tế - xã hội thế giới', 'Các nước phát triển - đang phát triển', 'Các khu vực trên thế giới'],
      grade12: ['★ Vị trí địa lý - Phạm vi lãnh thổ VN', '★ Đặc điểm chung tự nhiên VN', '★ Địa lý dân cư VN', '★ Địa lý các ngành kinh tế', '★ Địa lý các vùng kinh tế (7 vùng)', '★ Atlat Địa lý VN']
    },
    materials: [
      { type: 'Atlat', title: 'Atlat Địa lý Việt Nam - NXB GD', author: 'NXB Giáo dục VN', year: 2024, size: '45 MB', pages: 32 },
      { type: 'SGK', title: 'SGK Địa Lý 12 - Cánh Diều', author: 'NXB Giáo dục VN', year: 2024, size: '85 MB', pages: 290 },
      { type: 'Tham khảo', title: 'Sổ tay Atlat - 30 dạng câu hỏi', author: 'Lê Mỹ Phong', year: 2024, size: '12 MB', pages: 180 },
      { type: 'Bộ đề', title: '40 đề Địa Lý 2024 + đáp án chi tiết', author: 'EduPath Team', year: 2024, size: '16 MB', pages: 290 }
    ],
    pastExams: [
      { year: 2024, avg: 6.45, downloads: '138K', difficulty: 'Dễ' },
      { year: 2023, avg: 6.15, downloads: '162K', difficulty: 'Trung bình' },
      { year: 2022, avg: 6.68, downloads: '185K', difficulty: 'Dễ' },
      { year: 2021, avg: 6.96, downloads: '208K', difficulty: 'Dễ hơn' },
      { year: 2020, avg: 6.78, downloads: '231K', difficulty: 'Dễ' }
    ],
    tips: [
      { icon: '🗺', title: 'Atlat là "phao cứu sinh"', desc: '15/40 câu có thể tra Atlat. Làm những câu này đầu tiên, đảm bảo 3.75/10 điểm chắc chắn.' },
      { icon: '📊', title: 'Đọc biểu đồ thành thạo', desc: 'Cột, đường, tròn, miền. Mỗi loại có công thức tính riêng. Luyện đề biểu đồ chuyên sâu.' },
      { icon: '🌏', title: 'Học 7 vùng kinh tế theo bảng', desc: 'Trung du miền núi BB, ĐB sông Hồng, Bắc Trung Bộ... Mỗi vùng: thuận lợi - khó khăn - hướng phát triển.' },
      { icon: '📋', title: 'Nhớ số liệu theo xu hướng', desc: 'Không cần nhớ chính xác con số. Nhớ "tăng", "giảm", "đứng đầu" là đủ với câu trắc nghiệm.' },
      { icon: '🚫', title: 'Lỗi sai thường gặp', desc: 'Nhầm các tỉnh trong vùng, sai loại biểu đồ phù hợp, tính sai tỷ lệ trong câu biểu đồ tròn.' }
    ],
    timeline: [
      { phase: '12 tháng', focus: 'Làm quen Atlat, học địa lý tự nhiên', color: '#0984E3' },
      { phase: '6 tháng', focus: 'Học chương trình 12, các vùng kinh tế', color: '#00B894' },
      { phase: '3 tháng', focus: 'Luyện đọc Atlat tốc độ, làm đề biểu đồ', color: '#F39C12' },
      { phase: '1 tháng', focus: 'Đề chuẩn, ôn lại 7 vùng kinh tế', color: '#E74C3C' }
    ]
  },
  {
    id: 'gdcd', name: 'GDCD', nameEn: 'Civic Education',
    color: '#d4a042', emoji: '⚖️', symbol: '§', tagline: 'Pháp luật & Công dân',
    short: 'Đánh giá hiểu biết về pháp luật, đạo đức công dân và tình huống thực tiễn.',
    combos: ['C00'],
    stats: { yearAvg: 8.16, candidates: '548,000', maxScore: 10, passRate: '97%' },
    overview: {
      description: 'Giáo dục công dân thi cùng tổ hợp KHXH. Đây là môn có điểm trung bình cao nhất (8.16/10). Đề thi tập trung vào luật pháp Việt Nam và tình huống thực tế.',
      outcomes: [
        'Hiểu các quyền và nghĩa vụ cơ bản của công dân',
        'Vận dụng kiến thức pháp luật vào tình huống thực tiễn',
        'Nhận biết các loại hợp đồng, tranh chấp dân sự',
        'Hiểu pháp luật về kinh tế, hôn nhân, lao động',
        'Phân tích vai trò Nhà nước trong các vấn đề xã hội'
      ],
      importance: 'Môn dễ "ăn điểm" cao nhất kỳ thi. 70% học sinh đạt từ 7 trở lên. Là cứu cánh cho khối C00.'
    },
    examStructure: {
      format: 'Trắc nghiệm khách quan', duration: 50, totalQuestions: 40, maxScore: 10,
      difficulty: { easy: 22, medium: 12, hard: 6 },
      distribution: [
        { topic: 'Công dân với KT', percent: 15, questions: 6 },
        { topic: 'Công dân với pháp luật', percent: 30, questions: 12 },
        { topic: 'Pháp luật và đời sống', percent: 25, questions: 10 },
        { topic: 'Quyền bình đẳng - tự do - dân chủ', percent: 20, questions: 8 },
        { topic: 'Tình huống thực tiễn (VDC)', percent: 10, questions: 4 }
      ]
    },
    curriculum: {
      grade10: ['Đạo đức và đạo đức xã hội', 'Quan hệ xã hội', 'Pháp luật và đời sống cơ bản'],
      grade11: ['Công dân với kinh tế', 'Công dân với chính trị - xã hội'],
      grade12: ['★ Pháp luật và đời sống', '★ Thực hiện pháp luật', '★ Công dân bình đẳng', '★ Quyền tự do cơ bản', '★ Quyền dân chủ', 'Pháp luật về phát triển kinh tế']
    },
    materials: [
      { type: 'SGK', title: 'SGK GDCD 12 - Cánh Diều', author: 'NXB Giáo dục VN', year: 2024, size: '60 MB', pages: 200 },
      { type: 'Tham khảo', title: 'Sổ tay tình huống pháp luật', author: 'Phan Thị Thu Hà', year: 2024, size: '8 MB', pages: 150 },
      { type: 'Bộ đề', title: '40 đề GDCD 2024 - dễ đạt 9+', author: 'EduPath Team', year: 2024, size: '12 MB', pages: 220 }
    ],
    pastExams: [
      { year: 2024, avg: 8.16, downloads: '101K', difficulty: 'Dễ' },
      { year: 2023, avg: 8.29, downloads: '124K', difficulty: 'Dễ' },
      { year: 2022, avg: 8.03, downloads: '146K', difficulty: 'Dễ' },
      { year: 2021, avg: 8.37, downloads: '169K', difficulty: 'Rất dễ' },
      { year: 2020, avg: 8.14, downloads: '189K', difficulty: 'Dễ' }
    ],
    tips: [
      { icon: '⚖️', title: 'Học theo loại quyền', desc: 'Quyền bình đẳng, quyền tự do, quyền dân chủ. Mỗi loại có 5-7 quyền con. Phân biệt rõ.' },
      { icon: '📋', title: 'Tình huống = áp dụng', desc: 'Đọc kỹ tình huống, xác định: ai vi phạm, vi phạm gì, hậu quả pháp lý.' },
      { icon: '🔑', title: 'Từ khóa pháp luật', desc: 'Quyền - nghĩa vụ - trách nhiệm. "Có quyền" ≠ "bắt buộc". Phân biệt rõ.' },
      { icon: '🎯', title: 'Câu VDC = đời sống', desc: 'Câu khó thường về hợp đồng, hôn nhân, lao động, dân chủ. Học kỹ luật cơ bản.' },
      { icon: '🚫', title: 'Lỗi sai thường gặp', desc: 'Nhầm thẩm quyền cơ quan, sai độ tuổi chịu trách nhiệm hình sự (14, 16, 18).' }
    ],
    timeline: [
      { phase: '12 tháng', focus: 'Đọc SGK lớp 10-11 nắm khái niệm cơ bản', color: '#0984E3' },
      { phase: '6 tháng', focus: 'Học chương trình 12 chi tiết', color: '#00B894' },
      { phase: '3 tháng', focus: 'Luyện đề tình huống thực tiễn', color: '#F39C12' },
      { phase: '1 tháng', focus: 'Thi thử mục tiêu 9+', color: '#E74C3C' }
    ]
  }
];

const COMBO_INFO = {
  A00: { name: 'Toán - Lý - Hóa', subjects: ['toan', 'ly', 'hoa'], industries: 'Kỹ thuật, Công nghệ' },
  A01: { name: 'Toán - Lý - Anh', subjects: ['toan', 'ly', 'anh'], industries: 'CNTT, Kinh tế quốc tế' },
  B00: { name: 'Toán - Hóa - Sinh', subjects: ['toan', 'hoa', 'sinh'], industries: 'Y, Dược, Sinh học' },
  C00: { name: 'Văn - Sử - Địa', subjects: ['van', 'su', 'dia'], industries: 'Luật, Báo chí, Sư phạm' },
  D01: { name: 'Toán - Văn - Anh', subjects: ['toan', 'van', 'anh'], industries: 'Kinh tế, Ngoại ngữ' }
};

const TEACHER_DATA = {
  toan:  { name: 'Thầy Nguyễn Đức Anh',  cred: 'Thủ khoa Toán K60 ĐHQGHN · Chuyên gia Casio',      initials: 'NĐA', bg: '#5b75f3', rating: 4.9, reviews: 3240 },
  van:   { name: 'Cô Trần Thị Hà',        cred: 'Thạc sĩ Ngôn ngữ học · 8 năm luyện thi THPTQG',   initials: 'TTH', bg: '#4598a7', rating: 4.8, reviews: 2890 },
  anh:   { name: 'Thầy Quang Chung',      cred: 'IELTS 8.5 · Giảng viên ĐH Ngoại Thương HN',       initials: 'QC',  bg: '#db8142', rating: 4.9, reviews: 2654 },
  ly:    { name: 'Thầy Bùi Hữu Nam',      cred: 'Thạc sĩ Vật lý ĐH Sư Phạm · 10 năm kinh nghiệm',initials: 'BHN', bg: '#52ad58', rating: 4.7, reviews: 1980 },
  hoa:   { name: 'Cô Lê Thị Phương',      cred: 'Tiến sĩ Hóa học · Cựu GV THPT Chuyên',           initials: 'LTP', bg: '#cf6674', rating: 4.8, reviews: 2120 },
  sinh:  { name: 'Thầy Đỗ Mạnh Hùng',    cred: 'Thạc sĩ Sinh học · Chuyên gia di truyền học',     initials: 'ĐMH', bg: '#6f4ab3', rating: 4.7, reviews: 1760 },
  su:    { name: 'Cô Nguyễn Bích Ngọc',   cred: 'Thạc sĩ Sử học · 12 năm luyện thi THPTQG',       initials: 'NBN', bg: '#c44747', rating: 4.6, reviews: 3100 },
  dia:   { name: 'Thầy Lê Mỹ Phong',      cred: 'Cử nhân Địa lý · Chuyên gia Atlat Địa lý VN',    initials: 'LMP', bg: '#2d8659', rating: 4.7, reviews: 2870 },
  gdcd:  { name: 'Cô Phan Thị Thu Hà',    cred: 'Luật sư · Thạc sĩ GDCD · 6 năm giảng dạy',       initials: 'PTH', bg: '#d4a042', rating: 4.8, reviews: 2560 },
};

const REVIEWS = [
  { name: 'Nguyễn Minh Khôi',   school: 'THPT Chuyên Hà Nội Amsterdam', score: '28.5 điểm', subject: 'Toán',     text: 'Nhờ thầy Đức Anh hướng dẫn kỹ thuật Casio, em từ 7.5 lên 9.0 chỉ sau 2 tháng. Phương pháp phân loại đề thực sự rất hiệu quả.' },
  { name: 'Trần Thị Bảo Châu',  school: 'THPT Kim Liên, Hà Nội',         score: '27.8 điểm', subject: 'Tiếng Anh', text: 'Phương pháp đọc hiểu của thầy Quang Chung rất khác biệt. Điểm Tiếng Anh tăng từ 6.4 lên 8.6 sau 3 tháng học.' },
  { name: 'Phạm Văn Tuấn',      school: 'THPT Lê Hồng Phong, TP.HCM',   score: '26.5 điểm', subject: 'Hóa Học',  text: 'Cô Phương giải thích bảo toàn electron cực kỳ dễ hiểu. Hóa từ môn sợ nhất trở thành điểm mạnh của em.' },
  { name: 'Lê Hoàng Anh',       school: 'THPT Chuyên Lam Sơn, Thanh Hóa', score: '29.0 điểm', subject: 'Vật Lý',   text: 'Phương pháp giản đồ vector của thầy Nam giúp em giải bài mạch điện xoay chiều siêu nhanh. Từ 6.0 lên 8.8!' },
  { name: 'Đặng Thị Thu Hương', school: 'THPT Chu Văn An, Hà Nội',       score: '27.2 điểm', subject: 'Ngữ Văn',  text: 'Cô Hà chữa bài rất tận tâm. Em học được cách dẫn dắt bài NLVH rất mượt, từ 6.5 lên 8.5 chỉ sau 4 tháng.' },
  { name: 'Vũ Đức Minh',        school: 'THPT Chuyên Bắc Ninh',           score: '28.0 điểm', subject: 'Sinh Học', text: 'Sơ đồ tư duy di truyền của thầy Hùng giúp em nhớ rất lâu. Sinh từ 5.5 lên 9.0, vượt xa mong đợi!' },
];

// ============================================================
// QUICK PRACTICE — 3 câu hỏi nhanh cho mỗi môn
// ============================================================
const QUICK_PRACTICE = {
  toan: [
    { q: 'Hàm số y = x³ - 3x + 2 có bao nhiêu cực trị?', opts: ['0', '1', '2', '3'], ans: 2, explain: 'y\' = 3x²-3 = 0 → x = ±1. y\'\' đổi dấu qua cả 2 nghiệm → 2 cực trị.' },
    { q: 'Tích phân ∫₀¹ x·eˣ dx bằng?', opts: ['1', 'e-1', 'e', '2e-1'], ans: 0, explain: 'Tích phân từng phần: u=x, dv=eˣdx → kq = [xeˣ - eˣ]₀¹ = 1.' },
    { q: 'Số phức z = 3 + 4i có mô-đun bằng?', opts: ['5', '7', '25', '√7'], ans: 0, explain: '|z| = √(3²+4²) = √25 = 5.' },
  ],
  van: [
    { q: 'Bài thơ "Tây Tiến" của Quang Dũng sáng tác năm nào?', opts: ['1946', '1948', '1950', '1954'], ans: 1, explain: 'Quang Dũng viết Tây Tiến năm 1948 tại Phù Lưu Chanh.' },
    { q: 'Tác phẩm nào KHÔNG nằm trong chương trình Ngữ Văn 12?', opts: ['Vợ nhặt', 'Chí Phèo', 'Sóng', 'Người lái đò Sông Đà'], ans: 1, explain: 'Chí Phèo là chương trình Ngữ Văn 11, không nằm trong trọng tâm lớp 12.' },
    { q: '"Đất nước" của Nguyễn Khoa Điềm thuộc thể loại gì?', opts: ['Truyện ngắn', 'Thơ tự do', 'Trường ca', 'Tùy bút'], ans: 2, explain: '"Đất nước" trích từ trường ca "Mặt đường khát vọng" (1971).' },
  ],
  anh: [
    { q: 'Choose the word with different stress: "economic", "education", "politic", "geography"', opts: ['economic', 'education', 'politic', 'geography'], ans: 2, explain: '"politic" has stress on 1st syllable (POL-i-tic), others on 3rd.' },
    { q: 'If I _____ you, I would study harder.', opts: ['am', 'was', 'were', 'be'], ans: 2, explain: 'Câu điều kiện loại 2: If + S + were/V2...' },
    { q: 'The word "endangered" is closest in meaning to:', opts: ['dangerous', 'threatened', 'extinct', 'protected'], ans: 1, explain: '"Endangered" = bị đe dọa (threatened), không phải "dangerous" (nguy hiểm).' },
  ],
  ly: [
    { q: 'Dao động điều hòa có ω = 10 rad/s. Chu kỳ T bằng?', opts: ['0.2π s', 'π/5 s', '0.628 s', 'Cả A và C'], ans: 3, explain: 'T = 2π/ω = 2π/10 = π/5 ≈ 0.628s. Đáp án A và C đều đúng.' },
    { q: 'Trong mạch RLC nối tiếp, cộng hưởng xảy ra khi:', opts: ['ZL = ZC', 'ZL > ZC', 'R = 0', 'U = 0'], ans: 0, explain: 'Cộng hưởng khi ZL = ZC, lúc đó Z = R (min), I max.' },
    { q: 'Năng lượng liên kết riêng lớn nhất ở nhân nào?', opts: ['Heli-4', 'Sắt-56', 'Urani-238', 'Cacbon-12'], ans: 1, explain: 'Fe-56 có năng lượng liên kết riêng lớn nhất (~8.8 MeV/nucleon).' },
  ],
  hoa: [
    { q: 'Este CH₃COOC₂H₅ có tên gọi là:', opts: ['Metyl axetat', 'Etyl axetat', 'Etyl fomat', 'Metyl propanoat'], ans: 1, explain: 'CH₃COO- là gốc axetat, C₂H₅- là etyl → Etyl axetat.' },
    { q: 'Amino axit nào là amino axit thiết yếu?', opts: ['Glyxin', 'Alanin', 'Lysin', 'Glutamic'], ans: 2, explain: 'Lysin là amino axit thiết yếu — cơ thể không tự tổng hợp được.' },
    { q: 'Kim loại nào phản ứng với nước ở nhiệt độ thường?', opts: ['Fe', 'Cu', 'Na', 'Al'], ans: 2, explain: 'Na (kim loại kiềm) phản ứng mãnh liệt với nước: 2Na + 2H₂O → 2NaOH + H₂↑' },
  ],
  sinh: [
    { q: 'Trong phép lai AaBb × AaBb, tỷ lệ kiểu hình trội cả 2 tính trạng?', opts: ['1/16', '3/16', '9/16', '1/4'], ans: 2, explain: 'Phân li độc lập: 3/4 × 3/4 = 9/16.' },
    { q: 'Đột biến gen xảy ra ở loại tế bào nào sẽ di truyền?', opts: ['Tế bào soma', 'Tế bào sinh dục', 'Cả hai', 'Không loại nào'], ans: 1, explain: 'Đột biến ở tế bào sinh dục truyền qua giao tử cho thế hệ sau.' },
    { q: 'Chuỗi thức ăn bắt đầu bằng sinh vật nào?', opts: ['SV tiêu thụ bậc 1', 'SV sản xuất', 'SV phân giải', 'SV tiêu thụ bậc 2'], ans: 1, explain: 'Chuỗi thức ăn bắt đầu bằng sinh vật sản xuất (thực vật/tảo).' },
  ],
  su: [
    { q: 'Đảng Cộng sản Việt Nam được thành lập vào ngày?', opts: ['3/2/1930', '19/5/1941', '2/9/1945', '22/12/1944'], ans: 0, explain: 'Đảng thành lập ngày 3/2/1930 tại Hương Cảng (Hong Kong).' },
    { q: 'Chiến thắng Điện Biên Phủ diễn ra năm nào?', opts: ['1953', '1954', '1955', '1956'], ans: 1, explain: 'Chiến dịch ĐBP kết thúc 7/5/1954, buộc Pháp ký Hiệp định Genève.' },
    { q: 'Chiến tranh lạnh kết thúc với sự kiện nào?', opts: ['Bức tường Berlin sụp đổ', 'Liên Xô tan rã', 'Chiến tranh Triều Tiên', 'Hiệp ước INF'], ans: 1, explain: 'Liên Xô tan rã (25/12/1991) đánh dấu chấm dứt Chiến tranh lạnh.' },
  ],
  dia: [
    { q: 'Việt Nam có bao nhiêu vùng kinh tế?', opts: ['5', '6', '7', '8'], ans: 2, explain: 'VN có 7 vùng: TD&MNBB, ĐB sông Hồng, BTB, DHNTB, TN, ĐNB, ĐB sông Cửu Long.' },
    { q: 'Tỉnh nào có diện tích lớn nhất Việt Nam?', opts: ['Nghệ An', 'Gia Lai', 'Đắk Lắk', 'Sơn La'], ans: 0, explain: 'Nghệ An có diện tích lớn nhất VN (~16,490 km²).' },
    { q: 'Trong đề thi THPTQG, bao nhiêu câu sử dụng Atlat?', opts: ['10/40', '15/40', '20/40', '5/40'], ans: 1, explain: '15/40 câu (37.5%) có thể tra Atlat — nguồn điểm "chắc" nhất.' },
  ],
  gdcd: [
    { q: 'Công dân đủ bao nhiêu tuổi có quyền bầu cử?', opts: ['16 tuổi', '18 tuổi', '20 tuổi', '21 tuổi'], ans: 1, explain: 'Theo Hiến pháp 2013, công dân đủ 18 tuổi có quyền bầu cử.' },
    { q: 'Hình thức thực hiện pháp luật nào phổ biến nhất?', opts: ['Tuân thủ PL', 'Thi hành PL', 'Sử dụng PL', 'Áp dụng PL'], ans: 0, explain: 'Tuân thủ PL (không làm điều PL cấm) là hình thức phổ biến nhất.' },
    { q: 'Quyền bất khả xâm phạm về thân thể thuộc nhóm quyền nào?', opts: ['Quyền chính trị', 'Quyền tự do cơ bản', 'Quyền kinh tế', 'Quyền văn hóa'], ans: 1, explain: 'Thuộc nhóm Quyền tự do cơ bản — được Hiến pháp 2013 bảo đảm.' },
  ],
};

// ============================================================
// POPULAR DOCUMENTS — Tài liệu nổi bật
// ============================================================
const POPULAR_DOCS = [
  { title: 'Trọn bộ công thức Toán THPTQG 2025', subject: 'toan', type: 'PDF', size: '12 MB', downloads: 45200, rating: 4.9, pages: 95, tag: 'Hot 🔥' },
  { title: '100 bài văn mẫu Nghị luận điểm cao', subject: 'van', type: 'PDF', size: '18 MB', downloads: 38100, rating: 4.8, pages: 380, tag: 'Mới' },
  { title: '3000 từ vựng Tiếng Anh theo chủ đề', subject: 'anh', type: 'PDF', size: '8 MB', downloads: 52300, rating: 4.9, pages: 180, tag: 'Hot 🔥' },
  { title: 'Sổ tay công thức Vật Lý 12', subject: 'ly', type: 'PDF', size: '5 MB', downloads: 29800, rating: 4.7, pages: 95, tag: 'Mới' },
  { title: 'Phương pháp giải nhanh Hóa hữu cơ', subject: 'hoa', type: 'PDF', size: '12 MB', downloads: 31500, rating: 4.8, pages: 220, tag: '' },
  { title: 'Atlat Địa lý VN — Hướng dẫn chi tiết', subject: 'dia', type: 'PDF', size: '45 MB', downloads: 41200, rating: 4.9, pages: 32, tag: 'Hot 🔥' },
  { title: 'Bí kíp giải BT Di truyền Sinh 12', subject: 'sinh', type: 'PDF', size: '10 MB', downloads: 24600, rating: 4.7, pages: 200, tag: '' },
  { title: 'Niên biểu Lịch Sử VN từ 1858-1975', subject: 'su', type: 'PDF', size: '8 MB', downloads: 27300, rating: 4.6, pages: 120, tag: 'Mới' },
];

const PLATFORM_STATS = [
  { icon: '👨‍🏫', value: '100%', label: 'Giáo viên đạt 8.0+',    sub: 'Kiểm định chất lượng mỗi năm' },
  { icon: '👩‍🎓', value: '42,500+', label: 'Học sinh đồng hành', sub: 'Trên toàn quốc 2020–2025' },
  { icon: '🎯', value: '90%',     label: 'Đạt mục tiêu điểm',     sub: 'Trong 3 tháng ôn cuối' },
  { icon: '📅', value: '5 năm',   label: 'Kinh nghiệm',           sub: 'Được học sinh tin tưởng' },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function SubjectsPage({ onNavigateToCourses, onNavigateToLibrary, addLog }) {
  const [selectedId, setSelectedId] = useState(null);
  const [comboFilter, setComboFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const searchText = useDebounce(searchInput);

  const filtered = useMemo(() => {
    return SUBJECTS_DATA.filter(s => {
      const matchCombo = comboFilter === 'all' || s.combos.includes(comboFilter);
      const q = searchText.toLowerCase();
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.nameEn.toLowerCase().includes(q);
      return matchCombo && matchSearch;
    });
  }, [comboFilter, searchText]);

  const selected = selectedId ? SUBJECTS_DATA.find(s => s.id === selectedId) : null;

  if (selected) {
    return (
      <SubjectDetail
        subject={selected}
        onBack={() => setSelectedId(null)}
        onNavigateToCourses={onNavigateToCourses}
        onNavigateToLibrary={onNavigateToLibrary}
        addLog={addLog}
      />
    );
  }

  return (
    <SubjectsListing
      subjects={filtered}
      comboFilter={comboFilter}
      setComboFilter={setComboFilter}
      searchText={searchInput}
      setSearchText={setSearchInput}
      onSelect={(id) => { setSelectedId(id); addLog && addLog(`Xem chi tiết môn ${SUBJECTS_DATA.find(s => s.id === id)?.name}`, 'sys'); }}
      onNavigateToCourses={onNavigateToCourses}
      onNavigateToLibrary={onNavigateToLibrary}
      addLog={addLog}
    />
  );
}

// ============================================================
// INTERACTIVE STATISTICS DASHBOARD
// ============================================================
function InteractiveStatsSection() {
  const [ref, inView] = useInView();
  const sortedSubjects = [...SUBJECTS_DATA].sort((a, b) => b.stats.yearAvg - a.stats.yearAvg);

  return (
    <section ref={ref} className={`subj-stats-section animate-on-scroll ${inView ? 'is-visible' : ''}`}>
      <div className="subj-section-lbl">
        <span className="subj-badge-lbl"><HiTrendingUp /> Báo cáo chất lượng</span>
        <h2>Số Liệu Đào Tạo & Biểu Đồ So Sánh</h2>
        <p>Báo cáo thống kê trung thực về kết quả học tập của học sinh đồng hành cùng EduPath qua kỳ thi THPT Quốc Gia.</p>
      </div>

      <div className="subj-stats-dashboard">
        <div className="subj-stats-counter-grid">
          <div className="subj-stat-counter-card">
            <div className="counter-icon">🎓</div>
            <h3>
              <AnimatedCounter end={42500} suffix="+" />
            </h3>
            <p>Học sinh đồng hành</p>
            <span>Học sinh trên toàn quốc đăng ký học tập trong niên khóa 2020 - 2025.</span>
          </div>
          <div className="subj-stat-counter-card">
            <div className="counter-icon">🎯</div>
            <h3>
              <AnimatedCounter end={90} suffix="%" />
            </h3>
            <p>Đạt mục tiêu cam kết</p>
            <span>Tỷ lệ học sinh đạt điểm số kỳ vọng hoặc đỗ nguyện vọng 1 Đại học.</span>
          </div>
          <div className="subj-stat-counter-card">
            <div className="counter-icon">📚</div>
            <h3>
              <AnimatedCounter end={1500000} suffix="+" />
            </h3>
            <p>Lượt tải tài liệu</p>
            <span>Kho tài liệu mở được học sinh khai thác ôn tập mỗi tháng.</span>
          </div>
          <div className="subj-stat-counter-card">
            <div className="counter-icon">⭐</div>
            <h3>
              <AnimatedCounter end={98} suffix="%" />
            </h3>
            <p>Phản hồi tích cực</p>
            <span>Tỷ lệ học sinh hài lòng với phương pháp giảng dạy và hỗ trợ từ thầy cô.</span>
          </div>
        </div>

        {/* Comparison Chart */}
        <div className="subj-stats-chart-card">
          <div className="chart-header">
            <h4>Biểu đồ so sánh điểm trung bình toàn quốc năm 2024</h4>
            <p>So sánh điểm trung bình giữa các môn học. Môn Giáo dục Công dân đạt điểm TB cao nhất (8.16/10), trong khi các môn Lịch sử và Ngoại ngữ là thách thức lớn.</p>
          </div>
          <div className="chart-container">
            <div className="chart-bars-horizontal">
              {sortedSubjects.map(s => {
                const percent = (s.stats.yearAvg / 10) * 100;
                return (
                  <div key={s.id} className="chart-row">
                    <div className="chart-row-label">
                      <span className="chart-row-emoji">{s.emoji}</span>
                      <span className="chart-row-name">{s.name}</span>
                    </div>
                    <div className="chart-row-bar-wrap">
                      <div
                        className="chart-row-bar"
                        style={{
                          width: inView ? `${percent}%` : '0%',
                          background: `linear-gradient(90deg, ${s.color}aa, ${s.color})`,
                        }}
                      >
                        <span className="chart-row-value">{s.stats.yearAvg}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="chart-footer">
            <div className="chart-legend">
              <span className="legend-item"><span className="legend-dot" style={{ background: '#5b75f3' }} /> Môn Tự nhiên</span>
              <span className="legend-item"><span className="legend-dot" style={{ background: '#d4a042' }} /> Môn Xã hội</span>
            </div>
            <p className="chart-note">* Nguồn: Phân tích dữ liệu từ kết quả thi tốt nghiệp THPT Quốc Gia của Bộ Giáo Dục & Đào Tạo.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// QUICK PRACTICE SECTION
// ============================================================
function QuickPracticeSection({ addLog, onNavigateToLibrary }) {
  const [activeSubj, setActiveSubj] = useState('toan');
  const [answers, setAnswers] = useState({}); // { [questionId]: selectedOptionIndex }
  const [ref, inView] = useInView();

  const questions = QUICK_PRACTICE[activeSubj] || [];

  const handleSelectOption = (qIdx, optIdx) => {
    const key = `${activeSubj}-${qIdx}`;
    if (answers[key] !== undefined) return;
    setAnswers(prev => ({ ...prev, [key]: optIdx }));
    addLog && addLog(`Trả lời câu hỏi trắc nghiệm nhanh môn ${SUBJECTS_DATA.find(s => s.id === activeSubj)?.name}`, 'info');
  };

  const handleReset = () => {
    const prefix = `${activeSubj}-`;
    setAnswers(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        if (k.startsWith(prefix)) delete next[k];
      });
      return next;
    });
  };

  return (
    <section ref={ref} className={`subj-practice-section animate-on-scroll ${inView ? 'is-visible' : ''}`}>
      <div className="subj-section-lbl">
        <span className="subj-badge-lbl"><HiSparkles /> Tự học hiệu quả</span>
        <h2>Luyện Tập Nhanh — Thử Thách Trắc Nghiệm</h2>
        <p>Chọn môn học bên dưới để thử sức nhanh với 3 câu hỏi trắc nghiệm tiêu biểu có đáp án và lời giải chi tiết.</p>
      </div>

      <div className="subj-practice-tabs-scroll">
        <div className="subj-practice-tabs">
          {SUBJECTS_DATA.map(s => (
            <button
              key={s.id}
              className={`subj-practice-tab ${activeSubj === s.id ? 'active' : ''}`}
              style={{ '--active-color': s.color }}
              onClick={() => setActiveSubj(s.id)}
            >
              <span className="tab-emoji">{s.emoji}</span>
              <span className="tab-name">{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="subj-practice-content">
        <div className="subj-practice-grid">
          {questions.map((q, idx) => {
            const key = `${activeSubj}-${idx}`;
            const selectedOpt = answers[key];
            const isCorrect = selectedOpt === q.ans;
            const hasAnswered = selectedOpt !== undefined;

            return (
              <div key={idx} className={`subj-practice-card ${hasAnswered ? 'answered' : ''}`} style={{ '--subj-color': SUBJECTS_DATA.find(s => s.id === activeSubj)?.color }}>
                <div className="card-q-header">
                  <span className="card-q-num">Câu hỏi {idx + 1}</span>
                  {hasAnswered && (
                    <span className={`card-q-status ${isCorrect ? 'correct' : 'incorrect'}`}>
                      {isCorrect ? <><HiCheck /> Chính xác</> : 'Chưa đúng'}
                    </span>
                  )}
                </div>
                <p className="card-q-text">{q.q}</p>
                <div className="card-q-options">
                  {q.opts.map((opt, optIdx) => {
                    let btnClass = '';
                    if (hasAnswered) {
                      if (optIdx === q.ans) btnClass = 'correct-opt';
                      else if (optIdx === selectedOpt) btnClass = 'incorrect-opt';
                      else btnClass = 'disabled-opt';
                    }
                    return (
                      <button
                        key={optIdx}
                        disabled={hasAnswered}
                        className={`card-q-opt-btn ${btnClass}`}
                        onClick={() => handleSelectOption(idx, optIdx)}
                      >
                        <span className="opt-letter">{String.fromCharCode(65 + optIdx)}</span>
                        <span className="opt-text">{opt}</span>
                      </button>
                    );
                  })}
                </div>
                {hasAnswered && (
                  <div className="card-q-explanation animate-fade-in">
                    <h5><HiLightBulb /> Lời giải chi tiết:</h5>
                    <p>{q.explain}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="subj-practice-actions">
          <button className="subj-practice-btn-reset" onClick={handleReset}>
            Làm lại câu hỏi môn này
          </button>
          <button className="subj-practice-btn-more" onClick={onNavigateToLibrary}>
            Thử sức đề thi đầy đủ <HiArrowRight />
          </button>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// POPULAR DOCUMENTS SECTION
// ============================================================
function PopularDocsSection({ onNavigateToLibrary, addLog }) {
  const [filter, setFilter] = useState('all');
  const [downloading, setDownloading] = useState({}); // { [docTitle]: progress }
  const [ref, inView] = useInView();

  const handleDownload = (doc) => {
    if (downloading[doc.title] !== undefined) return;
    
    addLog && addLog(`Bắt đầu tải tài liệu: ${doc.title}`, 'info');
    setDownloading(prev => ({ ...prev, [doc.title]: 0 }));
    
    let prog = 0;
    const interval = setInterval(() => {
      prog += 20;
      if (prog >= 100) {
        setDownloading(prev => ({ ...prev, [doc.title]: 100 }));
        clearInterval(interval);
        addLog && addLog(`Đã tải thành công tài liệu: ${doc.title}`, 'success');
      } else {
        setDownloading(prev => ({ ...prev, [doc.title]: prog }));
      }
    }, 200);
  };

  const filteredDocs = filter === 'all'
    ? POPULAR_DOCS
    : POPULAR_DOCS.filter(d => d.subject === filter);

  return (
    <section ref={ref} className={`subj-docs-section animate-on-scroll ${inView ? 'is-visible' : ''}`}>
      <div className="subj-section-lbl">
        <span className="subj-badge-lbl"><HiDocumentText /> Thư viện mở</span>
        <h2>Tài Liệu Ôn Thi Tiêu Biểu</h2>
        <p>Hệ thống tài liệu PDF tóm tắt công thức, đề thi thử có hướng dẫn giải chi tiết được tải nhiều nhất.</p>
      </div>

      <div className="subj-docs-filters">
        <button
          className={`subj-doc-filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tất cả
        </button>
        {SUBJECTS_DATA.map(s => {
          const hasDocs = POPULAR_DOCS.some(d => d.subject === s.id);
          if (!hasDocs) return null;
          return (
            <button
              key={s.id}
              className={`subj-doc-filter-btn ${filter === s.id ? 'active' : ''}`}
              style={{ '--subj-color': s.color }}
              onClick={() => setFilter(s.id)}
            >
              {s.emoji} {s.name}
            </button>
          );
        })}
      </div>

      <div className="subj-docs-grid">
        {filteredDocs.map((doc, idx) => {
          const s = SUBJECTS_DATA.find(item => item.id === doc.subject);
          const progress = downloading[doc.title];
          const isDownloading = progress !== undefined && progress < 100;
          const isDownloaded = progress === 100;

          return (
            <div key={idx} className="subj-doc-card" style={{ '--subj-color': s?.color || '#5b75f3' }}>
              {doc.tag && <span className="subj-doc-tag">{doc.tag}</span>}
              <div className="subj-doc-icon">
                <HiDocumentText />
                <span className="subj-doc-ext">{doc.type}</span>
              </div>
              <div className="subj-doc-info">
                <span className="subj-doc-subj-badge" style={{ background: `${s?.color}15`, color: s?.color }}>
                  {s?.name}
                </span>
                <h4>{doc.title}</h4>
                <div className="subj-doc-stats">
                  <span><HiDownload /> {(doc.downloads + (isDownloaded ? 1 : 0)).toLocaleString()} lượt tải</span>
                  <span><HiStar style={{ color: '#f39c12' }} /> {doc.rating}</span>
                  <span>{doc.pages} trang</span>
                </div>
              </div>

              {isDownloading && (
                <div className="subj-doc-progress-container">
                  <div className="subj-doc-progress-bar" style={{ width: `${progress}%`, background: s?.color }} />
                  <span className="subj-doc-progress-text">Đang tải... {progress}%</span>
                </div>
              )}

              <button
                className={`subj-doc-download-btn ${isDownloaded ? 'downloaded' : ''} ${isDownloading ? 'loading' : ''}`}
                style={{ background: isDownloaded ? '#2ecc71' : s?.color }}
                onClick={() => handleDownload(doc)}
                disabled={isDownloading}
              >
                {isDownloaded ? (
                  <><HiCheck /> Đã tải thành công</>
                ) : isDownloading ? (
                  'Đang xử lý...'
                ) : (
                  <><HiDownload /> Tải tài liệu miễn phí</>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="subj-docs-more">
        <button className="subj-docs-more-btn" onClick={onNavigateToLibrary}>
          Khám phá thêm 1,500+ tài liệu khác <HiArrowRight />
        </button>
      </div>
    </section>
  );
}

// ============================================================
// LISTING VIEW
// ============================================================
function SubjectsListing({
  subjects,
  comboFilter,
  setComboFilter,
  searchText,
  setSearchText,
  onSelect,
  onNavigateToCourses,
  onNavigateToLibrary,
  addLog
}) {
  const [whyRef, whyInView] = useInView();
  const [testRef, testInView] = useInView();
  const [teachRef, teachInView] = useInView();
  const [comboRef, comboInView] = useInView();

  return (
    <div className="subj-page animate-in">

      {/* ── HERO ── */}
      <section className="subj-hero2">
        <div className="subj-hero2-content">
          <span className="subj-hero2-badge">
            <HiBadgeCheck /> Đội ngũ Sư Phạm 8.0+ · Kiểm định nghiêm ngặt
          </span>
          <h1>
            Học đúng trọng tâm —<br />
            <span className="subj-hero2-highlight">chạm mốc điểm mơ</span>
          </h1>
          <p>
            9 môn học THPT Quốc Gia với lộ trình cá nhân hóa, tài liệu chuẩn sư
            phạm và đội ngũ thầy cô trực tiếp đồng hành mỗi ngày.
          </p>
          <div className="subj-hero2-stats">
            {PLATFORM_STATS.map((st, i) => (
              <div key={i} className="subj-hero2-stat">
                <strong>{st.value}</strong>
                <span>{st.label}</span>
                <small>{st.sub}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="subj-hero2-photo">
          <img src={educatorsTeamImg} alt="Đội ngũ giáo viên EduPath" />
          <div className="subj-hero2-photo-badge">
            <HiShieldCheck />
            <span>Kiểm định chất lượng 2024</span>
          </div>
        </div>
      </section>

      {/* ── SUBJECT CARDS ── */}
      <section className="subj-cards-section">
        <div className="subj-cards-header">
          <div>
            <h2>9 Môn Học THPT Quốc Gia</h2>
            <p>Cấu trúc đề thi, đề cương ôn tập, tài liệu PDF và bí quyết học cho từng môn.</p>
          </div>
          <div className="subj-cards-controls">
            <div className="subj-filter-search">
              <HiSearch />
              <input
                type="text"
                placeholder="Tìm môn học..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
            </div>
            <div className="subj-filter-combos">
              <button
                className={`subj-combo-pill ${comboFilter === 'all' ? 'active' : ''}`}
                onClick={() => setComboFilter('all')}
              >Tất cả</button>
              {Object.entries(COMBO_INFO).map(([code, info]) => (
                <button
                  key={code}
                  title={`${info.name} — ${info.industries}`}
                  className={`subj-combo-pill ${comboFilter === code ? 'active' : ''}`}
                  onClick={() => setComboFilter(code)}
                >{code}</button>
              ))}
            </div>
          </div>
        </div>

        {subjects.length === 0 ? (
          <div className="subj-empty">
            <div className="subj-empty-icon">🔍</div>
            <h3>Không tìm thấy môn học nào</h3>
            <p>Thử thay đổi bộ lọc khối thi hoặc xóa từ khóa tìm kiếm.</p>
            <button
              className="subj-empty-reset"
              onClick={() => { setComboFilter('all'); setSearchText(''); }}
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="subj-grid2">
            {subjects.map((s, idx) => {
              const teacher = TEACHER_DATA[s.id];
              return (
                <article
                  key={s.id}
                  className="subj-card2"
                  style={{ '--subj-color': s.color, animationDelay: `${idx * 0.05}s` }}
                  onClick={() => onSelect(s.id)}
                >
                  <div className="subj-card2-accent" style={{ background: `linear-gradient(90deg, ${s.color}, ${s.color}88)` }} />

                  <div className="subj-card2-top">
                    <span className="subj-card2-emoji">{s.emoji}</span>
                    <div className="subj-card2-combos">
                      {s.combos.map(c => (
                        <span key={c} className="subj-combo-tag" style={{ borderColor: s.color, color: s.color }}>{c}</span>
                      ))}
                    </div>
                  </div>

                  <div className="subj-card2-body">
                    <span className="subj-card2-tagline" style={{ color: s.color }}>{s.tagline}</span>
                    <h3>{s.name} <small>{s.nameEn}</small></h3>
                    <p className="subj-card2-desc">{s.short}</p>

                    {teacher && (
                      <div className="subj-card2-teacher">
                        <div className="subj-teacher-ava" style={{ background: teacher.bg }}>
                          {teacher.initials}
                        </div>
                        <div className="subj-teacher-info">
                          <span className="subj-teacher-name">{teacher.name}</span>
                          <span className="subj-teacher-cred">{teacher.cred}</span>
                        </div>
                      </div>
                    )}

                    <div className="subj-card2-rating">
                      <span className="subj-stars">{'★'.repeat(5)}</span>
                      <strong>{teacher?.rating ?? 4.7}</strong>
                      <span className="subj-rating-count">({(teacher?.reviews ?? 1800).toLocaleString()} đánh giá)</span>
                      <span className="subj-rating-sep">·</span>
                      <span>{s.stats.candidates} thí sinh</span>
                    </div>

                    <div className="subj-card2-meta">
                      <span><HiClock /> {s.examStructure.duration} phút</span>
                      <span><HiClipboardList /> {s.examStructure.totalQuestions} câu</span>
                      <span><HiDocumentText /> {s.materials.length} tài liệu</span>
                      <span><HiUsers /> Tỷ lệ đạt {s.stats.passRate}</span>
                    </div>

                    <div className="subj-card2-score">
                      <span>Điểm TB: <strong style={{ color: s.color }}>{s.stats.yearAvg}/10</strong></span>
                      <div className="subj-score-bar">
                        <div className="subj-score-fill" style={{ width: `${s.stats.yearAvg * 10}%`, background: s.color }} />
                      </div>
                    </div>
                  </div>

                  <button className="subj-card2-cta" style={{ '--c': s.color }}>
                    Xem chi tiết môn học <HiArrowRight />
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ── INTERACTIVE STATISTICS DASHBOARD ── */}
      <InteractiveStatsSection />

      {/* ── QUICK PRACTICE SECTION ── */}
      <QuickPracticeSection addLog={addLog} onNavigateToLibrary={onNavigateToLibrary} />

      {/* ── POPULAR DOCUMENTS SECTION ── */}
      <PopularDocsSection onNavigateToLibrary={onNavigateToLibrary} addLog={addLog} />

      {/* ── STUDENT PHOTO + WHY ── */}
      <section ref={whyRef} className={`subj-why animate-on-scroll ${whyInView ? 'is-visible' : ''}`}>
        <div className="subj-why-photo">
          <img src={studentSuccessImg} alt="Học sinh EduPath đạt thành tích cao" />
          <div className="subj-why-photo-badge">
            <strong>28.5+</strong>
            <span>Điểm THPTQG</span>
          </div>
        </div>
        <div className="subj-why-content">
          <span className="subj-why-eyebrow">Tại sao chọn EduPath?</span>
          <h2>Học thông minh —<br />không chỉ học chăm</h2>
          <ul className="subj-why-list">
            <li><HiCheck />AI phân tích điểm yếu, gợi ý đúng chương cần ôn ngay</li>
            <li><HiCheck />Đề thi bám sát cấu trúc Bộ GD&ĐT 2024–2025</li>
            <li><HiCheck />Lộ trình ôn tập cá nhân hóa theo từng khối thi</li>
            <li><HiCheck />Giáo viên trực tiếp chữa bài — không phải chatbot</li>
            <li><HiCheck />Học mọi lúc mọi nơi: điện thoại, máy tính, tablet</li>
          </ul>
          <div className="subj-why-stats">
            {PLATFORM_STATS.slice(0, 2).map((st, i) => (
              <div key={i} className="subj-why-stat">
                <strong>{st.value}</strong>
                <span>{st.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section ref={testRef} className={`subj-testimonials animate-on-scroll ${testInView ? 'is-visible' : ''}`}>
        <div className="subj-section-lbl">
          <h2>Học sinh nói gì về EduPath?</h2>
          <p>Hơn 42,500 học sinh đã tin tưởng đồng hành cùng chúng tôi.</p>
        </div>
        <div className="subj-reviews-grid">
          {REVIEWS.map((r, i) => {
            const scoreNum = parseFloat(r.score);
            let scoreTier = 'emerald';
            if (scoreNum >= 28.5) scoreTier = 'gold';
            else if (scoreNum >= 27.5) scoreTier = 'blue';
            return (
              <div key={i} className="subj-review-card">
                <div className="subj-review-top">
                  <div className="subj-review-ava">{r.name.split(' ').slice(-1)[0][0]}</div>
                  <div className="subj-review-meta">
                    <strong>{r.name}</strong>
                    <span>{r.school}</span>
                  </div>
                  <div className={`subj-review-score score-tier-${scoreTier}`}>🏆 {r.score}</div>
                </div>
                <p className="subj-review-text">"{r.text}"</p>
                <span className="subj-review-subject" style={{
                  background: `${SUBJECTS_DATA.find(s => s.name === r.subject || s.name.startsWith(r.subject))?.color || '#5b75f3'}15`,
                  color: SUBJECTS_DATA.find(s => s.name === r.subject || s.name.startsWith(r.subject))?.color || '#5b75f3'
                }}>
                  Môn {r.subject}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── TEACHER PHOTOS ── */}
      <section ref={teachRef} className={`subj-teachers-section animate-on-scroll ${teachInView ? 'is-visible' : ''}`}>
        <div className="subj-section-lbl">
          <h2>Gặp Gỡ Đội Ngũ Giáo Viên</h2>
          <p>Mỗi môn học đều có giáo viên chuyên sâu — kinh nghiệm thực chiến luyện thi THPTQG.</p>
        </div>
        <div className="subj-teachers-photos">
          <div className="subj-teacher-photo-card">
            <div className="subj-teacher-photo-wrap">
              <img src={teacherMathImg} alt="Giáo viên EduPath" />
            </div>
            <div className="subj-teacher-photo-info">
              <strong>Thầy Nguyễn Đức Anh</strong>
              <span>Toán Học · Vật Lý</span>
              <p>Thủ khoa Toán K60 ĐHQGHN, chuyên gia giải nhanh Casio, 5+ năm luyện thi chuyên sâu.</p>
              <div className="subj-teacher-photo-rating">
                <span className="subj-stars">★★★★★</span> 4.9 · 3,240 đánh giá
              </div>
            </div>
          </div>
          <div className="subj-teacher-photo-card">
            <div className="subj-teacher-photo-wrap">
              <img src={studentLearningImg} alt="Giáo viên EduPath" />
            </div>
            <div className="subj-teacher-photo-info">
              <strong>Cô Lê Thị Phương</strong>
              <span>Hóa Học · Sinh Học</span>
              <p>Tiến sĩ Hóa học, cựu GV THPT Chuyên, tác giả sách luyện thi được 50,000+ học sinh sử dụng.</p>
              <div className="subj-teacher-photo-rating">
                <span className="subj-stars">★★★★★</span> 4.8 · 2,120 đánh giá
              </div>
            </div>
          </div>
          <div className="subj-teacher-photo-card">
            <div className="subj-teacher-photo-wrap">
              <img src={educatorsTeamImg} alt="Đội ngũ giáo viên EduPath" />
            </div>
            <div className="subj-teacher-photo-info">
              <strong>Đội Ngũ EduPath</strong>
              <span>Tất cả 9 môn học</span>
              <p>Hơn 20 giáo viên chuyên khoa, tất cả đều đạt 8.0+ THPTQG và có bằng thạc sĩ/tiến sĩ.</p>
              <div className="subj-teacher-photo-rating">
                <span className="subj-stars">★★★★★</span> 4.8 · 9,200+ đánh giá
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMBO INFO ── */}
      <section ref={comboRef} className={`subj-combos-section animate-on-scroll ${comboInView ? 'is-visible' : ''}`}>
        <div className="subj-section-lbl">
          <h2>5 Khối Thi Phổ Biến Nhất</h2>
          <p>Chọn đúng khối thi giúp bạn định hướng môn học và tăng điểm xét tuyển hiệu quả.</p>
        </div>
        <div className="subj-combos-grid">
          {Object.entries(COMBO_INFO).map(([code, info]) => (
            <div key={code} className="subj-combo-card">
              <div className="subj-combo-card-code">{code}</div>
              <h4>{info.name}</h4>
              <p className="subj-combo-card-industry">{info.industries}</p>
              <div className="subj-combo-card-subjects">
                {info.subjects.map(sid => {
                  const sub = SUBJECTS_DATA.find(s => s.id === sid);
                  return sub ? (
                    <span key={sid} style={{ background: sub.color }} onClick={e => { e.stopPropagation(); onSelect(sid); }}>
                      {sub.emoji} {sub.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          ))}
        </div>
      </section>


    </div>
  );
}

// ============================================================
// DETAIL VIEW
// ============================================================
function SubjectDetail({ subject, onBack, onNavigateToCourses, onNavigateToLibrary, addLog }) {
  const [activeTab, setActiveTab] = useState('overview');
  const s = subject;

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: HiBookOpen },
    { id: 'exam', label: 'Cấu trúc đề thi', icon: HiClipboardList },
    { id: 'curriculum', label: 'Đề cương ôn tập', icon: HiAcademicCap },
    { id: 'materials', label: 'Tài liệu & Sách', icon: HiDocumentText },
    { id: 'past', label: 'Đề thi các năm', icon: HiCalendar },
    { id: 'tips', label: 'Mẹo học hiệu quả', icon: HiLightBulb },
    { id: 'stats', label: 'Khóa học & Thống kê', icon: HiChartBar }
  ];

  return (
    <div className="subj-detail animate-in">
      {/* Back */}
      <button className="subj-back-btn" onClick={onBack}>
        <HiArrowLeft /> Quay lại danh sách 9 môn học
      </button>

      {/* Hero */}
      <header className="subj-detail-hero" style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}dd)` }}>
        <div className="subj-detail-hero-left">
          <div className="subj-detail-hero-emoji">{s.emoji}</div>
          <div>
            <div className="subj-detail-tagline">{s.tagline}</div>
            <h1>{s.name}</h1>
            <p className="subj-detail-en">{s.nameEn}</p>
            <p className="subj-detail-short">{s.short}</p>
            <div className="subj-detail-combos">
              <span>Có trong các khối thi:</span>
              {s.combos.map(c => <strong key={c}>{c}</strong>)}
            </div>
          </div>
        </div>
        <div className="subj-detail-hero-stats">
          <div><span>{s.stats.yearAvg}<small>/10</small></span><label>Điểm TB 2024</label></div>
          <div><span>{s.stats.candidates}</span><label>Thí sinh dự thi</label></div>
          <div><span>{s.stats.passRate}</span><label>Tỷ lệ đạt 5+</label></div>
          <div><span>{s.examStructure.duration}<small>phút</small></span><label>Thời gian thi</label></div>
        </div>
      </header>

      {/* Tab nav */}
      <nav className="subj-tabs" role="tablist" aria-label={`Thông tin môn ${s.name}`}>
        {tabs.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={activeTab === t.id}
            className={`subj-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
            style={{ '--subj-color': s.color }}
          >
            <t.icon /> {t.label}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <div className="subj-tab-content" role="tabpanel">
        {activeTab === 'overview' && <TabOverview s={s} />}
        {activeTab === 'exam' && <TabExam s={s} />}
        {activeTab === 'curriculum' && <TabCurriculum s={s} />}
        {activeTab === 'materials' && <TabMaterials s={s} addLog={addLog} />}
        {activeTab === 'past' && <TabPastExams s={s} addLog={addLog} />}
        {activeTab === 'tips' && <TabTips s={s} />}
        {activeTab === 'stats' && <TabStats s={s} onNavigateToCourses={onNavigateToCourses} onNavigateToLibrary={onNavigateToLibrary} />}
      </div>
    </div>
  );
}

// ============================================================
// TAB COMPONENTS
// ============================================================
function TabOverview({ s }) {
  return (
    <div className="subj-tab-pane">
      <section className="subj-section">
        <h2><HiBookOpen /> Giới thiệu môn học</h2>
        <p className="subj-section-text">{s.overview.description}</p>
      </section>

      <section className="subj-section">
        <h2><HiSparkles /> Bạn sẽ học được gì?</h2>
        <ul className="subj-outcomes">
          {s.overview.outcomes.map((o, i) => (
            <li key={i}><HiCheck style={{ color: s.color }} /> {o}</li>
          ))}
        </ul>
      </section>

      <section className="subj-section subj-importance" style={{ borderLeftColor: s.color }}>
        <h2><HiStar /> Tầm quan trọng</h2>
        <p>{s.overview.importance}</p>
      </section>
    </div>
  );
}

function TabExam({ s }) {
  const e = s.examStructure;
  const totalD = e.difficulty.easy + e.difficulty.medium + e.difficulty.hard;
  return (
    <div className="subj-tab-pane">
      <section className="subj-section">
        <h2><HiClipboardList /> Tổng quan cấu trúc đề thi</h2>
        <div className="subj-exam-overview">
          <div className="subj-exam-meta">
            <div className="subj-exam-meta-item">
              <span className="subj-meta-num" style={{ color: s.color }}>{e.duration}<small>phút</small></span>
              <span className="subj-meta-lbl">Thời gian làm bài</span>
            </div>
            <div className="subj-exam-meta-item">
              <span className="subj-meta-num" style={{ color: s.color }}>{e.totalQuestions}</span>
              <span className="subj-meta-lbl">Số câu hỏi</span>
            </div>
            <div className="subj-exam-meta-item">
              <span className="subj-meta-num" style={{ color: s.color }}>{e.maxScore}<small>điểm</small></span>
              <span className="subj-meta-lbl">Điểm tối đa</span>
            </div>
            <div className="subj-exam-meta-item">
              <span className="subj-meta-num-text" style={{ color: s.color }}>{e.format}</span>
              <span className="subj-meta-lbl">Hình thức</span>
            </div>
          </div>
        </div>
      </section>

      <section className="subj-section">
        <h2><HiChartBar /> Phân bổ độ khó</h2>
        <div className="subj-difficulty-bars">
          {[
            { lbl: 'Nhận biết - Thông hiểu (Dễ)', val: e.difficulty.easy, color: '#00B894' },
            { lbl: 'Vận dụng (Trung bình)', val: e.difficulty.medium, color: '#F39C12' },
            { lbl: 'Vận dụng cao (Khó)', val: e.difficulty.hard, color: '#E74C3C' }
          ].map((b, i) => (
            <div key={i} className="subj-diff-row">
              <span className="subj-diff-lbl">{b.lbl}</span>
              <div className="subj-diff-bar-wrap">
                <div className="subj-diff-bar" style={{ width: `${(b.val/totalD)*100}%`, background: b.color }}>
                  {b.val} câu
                </div>
              </div>
              <span className="subj-diff-pct">{Math.round(b.val/totalD*100)}%</span>
            </div>
          ))}
        </div>
      </section>

      <section className="subj-section">
        <h2><HiSparkles /> Phân bổ kiến thức theo chuyên đề</h2>
        <div className="subj-dist-table">
          {e.distribution.map((d, i) => (
            <div key={i} className="subj-dist-row">
              <div className="subj-dist-name">{d.topic}</div>
              <div className="subj-dist-bar-wrap">
                <div className="subj-dist-bar" style={{ width: `${d.percent}%`, background: s.color }}></div>
              </div>
              <div className="subj-dist-val">
                <strong>{d.percent}%</strong> · {d.questions} câu
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function TabCurriculum({ s }) {
  return (
    <div className="subj-tab-pane">
      <section className="subj-section">
        <h2><HiAcademicCap /> Đề cương ôn tập theo từng lớp</h2>
        <p className="subj-section-text">Chương trình môn {s.name} trải dài qua 3 năm THPT. Trọng tâm chính nằm ở lớp 12 (chiếm 70-80% đề thi). Các chương đánh dấu ★ là quan trọng nhất.</p>
      </section>

      {['grade10', 'grade11', 'grade12'].map((g, idx) => {
        const grade = idx + 10;
        const isImportant = g === 'grade12';
        return (
          <section key={g} className={`subj-grade-card ${isImportant ? 'subj-grade-important' : ''}`} style={isImportant ? { borderLeftColor: s.color } : {}}>
            <div className="subj-grade-header">
              <div className="subj-grade-badge" style={{ background: isImportant ? s.color : '#636E72' }}>
                Lớp {grade}
              </div>
              {isImportant && <span className="subj-grade-tag" style={{ color: s.color }}>★ TRỌNG TÂM THI - 75% ĐỀ</span>}
            </div>
            <ul className="subj-chapters">
              {s.curriculum[g].map((ch, i) => (
                <li key={i} className={ch.startsWith('★') ? 'important' : ''}>
                  <span className="subj-chapter-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="subj-chapter-text">{ch.replace('★ ', '')}</span>
                  {ch.startsWith('★') && <span className="subj-chapter-star" style={{ color: s.color }}>★</span>}
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <section className="subj-section subj-importance" style={{ borderLeftColor: s.color }}>
        <h2><HiLightBulb /> Mẹo ôn theo đề cương</h2>
        <ul>
          <li>📅 <strong>Hè trước lớp 12:</strong> Hoàn thiện nền tảng lớp 10-11</li>
          <li>📅 <strong>Học kỳ 1 lớp 12:</strong> Hoàn thành chương trình SGK</li>
          <li>📅 <strong>Học kỳ 2 lớp 12:</strong> Luyện đề bám sát cấu trúc</li>
          <li>📅 <strong>1 tháng cuối:</strong> Tổng ôn các chương ★, thi thử cường độ cao</li>
        </ul>
      </section>
    </div>
  );
}

function TabMaterials({ s, addLog }) {
  const groups = useMemo(() => {
    const g = {};
    s.materials.forEach(m => {
      g[m.type] = g[m.type] || [];
      g[m.type].push(m);
    });
    return g;
  }, [s]);

  return (
    <div className="subj-tab-pane">
      <section className="subj-section">
        <h2><HiDocumentText /> Tài liệu & Sách giáo khoa chính thống</h2>
        <p className="subj-section-text">Tất cả tài liệu được tổng hợp từ NXB Giáo dục Việt Nam và các tác giả uy tín. Tải về để học offline mọi lúc mọi nơi.</p>
      </section>

      {Object.entries(groups).map(([type, items]) => (
        <section key={type} className="subj-section">
          <h3 className="subj-mat-group-title">
            {type === 'SGK' && '📘'} {type === 'Tham khảo' && '📗'} {type === 'Bộ đề' && '📕'} {type === 'Atlat' && '🗺'} {type}
          </h3>
          <div className="subj-mat-list">
            {items.map((m, i) => (
              <article key={i} className="subj-mat-card">
                <div className="subj-mat-card-icon" style={{ background: `${s.color}20`, color: s.color }}>
                  {type === 'SGK' && '📘'} {type === 'Tham khảo' && '📗'} {type === 'Bộ đề' && '📕'} {type === 'Atlat' && '🗺'}
                </div>
                <div className="subj-mat-card-body">
                  <span className="subj-mat-tag" style={{ background: `${s.color}15`, color: s.color }}>{m.type}</span>
                  <h4>{m.title}</h4>
                  <p className="subj-mat-author">✍ {m.author} · {m.year}</p>
                  <div className="subj-mat-meta">
                    <span>📄 {m.pages} trang</span>
                    <span>💾 {m.size}</span>
                  </div>
                </div>
                <button
                  className="subj-mat-dl"
                  style={{ background: s.color }}
                  onClick={() => addLog && addLog(`Tải tài liệu: ${m.title}`, 'sys')}
                >
                  <HiDownload /> Tải về
                </button>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function TabPastExams({ s, addLog }) {
  const totalDownloads = s.pastExams.reduce((acc, e) => {
    const num = parseFloat(e.downloads.replace('K', '')) * 1000;
    return acc + num;
  }, 0);

  return (
    <div className="subj-tab-pane">
      <section className="subj-section">
        <h2><HiCalendar /> Ngân hàng đề thi THPT Quốc Gia</h2>
        <p className="subj-section-text">Tổng hợp đề thi chính thức 6 năm gần nhất kèm đáp án chi tiết. Tổng lượt tải: <strong>{(totalDownloads/1000).toFixed(0)}K+</strong></p>
      </section>

      <section className="subj-section">
        <div className="subj-exams-grid">
          {s.pastExams.map((e, i) => (
            <article key={i} className="subj-exam-card" style={{ '--subj-color': s.color }}>
              <div className="subj-exam-year" style={{ background: s.color }}>
                <span>{e.year}</span>
                <small>THPT QG</small>
              </div>
              <div className="subj-exam-info">
                <h4>Đề thi chính thức {e.year}</h4>
                <div className="subj-exam-stats">
                  <div><span>Điểm TB</span><strong>{e.avg}/10</strong></div>
                  <div><span>Độ khó</span><strong>{e.difficulty}</strong></div>
                  <div><span>Tải về</span><strong>{e.downloads}</strong></div>
                </div>
                <div className="subj-exam-actions">
                  <button
                    className="subj-exam-btn"
                    style={{ borderColor: s.color, color: s.color }}
                    onClick={() => addLog && addLog(`Xem đề thi ${s.name} ${e.year}`, 'sys')}
                  >
                    👁 Xem đề
                  </button>
                  <button
                    className="subj-exam-btn subj-exam-btn-primary"
                    style={{ background: s.color }}
                    onClick={() => addLog && addLog(`Tải đề thi ${s.name} ${e.year}`, 'sys')}
                  >
                    <HiDownload /> Tải về + đáp án
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="subj-section subj-importance" style={{ borderLeftColor: s.color }}>
        <h2><HiLightBulb /> Cách luyện đề hiệu quả</h2>
        <ol style={{ paddingLeft: 20 }}>
          <li>Bắt đầu từ đề mới nhất → cũ nhất (xu hướng ra đề thay đổi qua từng năm)</li>
          <li>Mỗi đề làm trong điều kiện chuẩn: <strong>{s.examStructure.duration} phút, không tài liệu</strong></li>
          <li>Chấm điểm ngay sau khi làm, ghi lại lỗi sai vào sổ tay</li>
          <li>Phân tích các câu sai theo chương để tìm điểm yếu</li>
          <li>Sau 5-10 đề, tổng kết và tập trung ôn các chuyên đề yếu nhất</li>
        </ol>
      </section>
    </div>
  );
}

function TabTips({ s }) {
  return (
    <div className="subj-tab-pane">
      <section className="subj-section">
        <h2><HiLightBulb /> Bí quyết học hiệu quả môn {s.name}</h2>
        <p className="subj-section-text">5 phương pháp đã được hàng nghìn học sinh áp dụng thành công, giúp tăng điểm trung bình 1.5-2.5 điểm sau 3 tháng.</p>
      </section>

      <section className="subj-section">
        <div className="subj-tips-grid">
          {s.tips.map((t, i) => (
            <article key={i} className="subj-tip-card" style={{ borderTopColor: s.color }}>
              <div className="subj-tip-icon">{t.icon}</div>
              <h4>{t.title}</h4>
              <p>{t.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="subj-section">
        <h2><HiCalendar /> Lộ trình ôn luyện 12 tháng</h2>
        <div className="subj-timeline">
          {s.timeline.map((t, i) => (
            <div key={i} className="subj-timeline-item">
              <div className="subj-timeline-dot" style={{ background: t.color }}></div>
              <div className="subj-timeline-content" style={{ borderLeftColor: t.color }}>
                <h5 style={{ color: t.color }}>{t.phase} trước thi</h5>
                <p>{t.focus}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function TabStats({ s, onNavigateToCourses, onNavigateToLibrary }) {
  return (
    <div className="subj-tab-pane">
      <section className="subj-section">
        <h2><HiChartBar /> Thống kê & Xu hướng điểm số</h2>
        <p className="subj-section-text">Diễn biến điểm trung bình môn {s.name} qua các năm — căn cứ để dự đoán độ khó kỳ thi sắp tới.</p>
      </section>

      <section className="subj-section">
        <div className="subj-chart-card">
          <h4>Diễn biến điểm trung bình 6 năm gần nhất</h4>
          <div className="subj-chart-bars">
            {[...s.pastExams].reverse().map((e, i) => {
              const h = (e.avg / 10) * 100;
              return (
                <div key={i} className="subj-chart-bar-col">
                  <div className="subj-chart-bar-value">{e.avg}</div>
                  <div
                    className="subj-chart-bar-fill"
                    style={{ height: `${h}%`, background: `linear-gradient(180deg, ${s.color}dd, ${s.color}66)` }}
                  ></div>
                  <div className="subj-chart-bar-lbl">{e.year}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="subj-section">
        <h2><HiAcademicCap /> Khóa học & Tài liệu trên EduPath</h2>
        <div className="subj-cta-row">
          <div className="subj-cta-card" style={{ borderColor: s.color }}>
            <HiBookOpen style={{ color: s.color, fontSize: 32 }} />
            <h4>Kho khóa học</h4>
            <p>Khóa học video chất lượng cao từ các giáo viên hàng đầu môn {s.name}</p>
            <button
              className="subj-cta-btn"
              style={{ background: s.color }}
              onClick={onNavigateToCourses}
            >
              Khám phá khóa học <HiArrowRight />
            </button>
          </div>
          <div className="subj-cta-card" style={{ borderColor: s.color }}>
            <HiDocumentText style={{ color: s.color, fontSize: 32 }} />
            <h4>Thư viện tài liệu</h4>
            <p>{s.materials.length}+ tài liệu PDF, đề thi và bài tập miễn phí</p>
            <button
              className="subj-cta-btn"
              style={{ background: s.color }}
              onClick={onNavigateToLibrary}
            >
              Vào thư viện <HiArrowRight />
            </button>
          </div>
        </div>
      </section>

      <section className="subj-section subj-importance" style={{ borderLeftColor: s.color }}>
        <h2><HiSparkles /> Bí quyết "vượt qua" điểm trung bình</h2>
        <p>Điểm trung bình hiện tại của môn {s.name} là <strong>{s.stats.yearAvg}/10</strong>. Để đạt 8+ điểm — top 20% thí sinh — bạn cần:</p>
        <ul>
          <li>✅ Hoàn thành chương trình SGK lớp 12 trước tháng 1</li>
          <li>✅ Làm tối thiểu 30 đề thi thử trong 3 tháng cuối</li>
          <li>✅ Mỗi lỗi sai ghi vào sổ tay, ôn lại mỗi tuần</li>
          <li>✅ Học cùng nhóm 3-5 bạn để hỏi đáp</li>
          <li>✅ Sử dụng AI Tutor của EduPath khi cần giải thích sâu</li>
        </ul>
      </section>
    </div>
  );
}
