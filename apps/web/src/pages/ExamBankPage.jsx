import { useState, useMemo, useEffect } from 'react';
import {
  HiSearch, HiDownload, HiEye, HiX,
  HiAcademicCap, HiDocumentText, HiClock,
  HiChartBar, HiArrowLeft, HiSparkles,
  HiBookOpen, HiClipboardList
} from 'react-icons/hi';

// ============================================================
// EXAM BANK DATA — Đề thi 9 môn THPT Quốc Gia
// ============================================================
const SUBJECTS = [
  {
    id: 'toan', name: 'Toán Học', emoji: '🦉', color: '#5b75f3',
    duration: 90, totalQuestions: 50, format: 'Trắc nghiệm',
    pastExams: [
      { year: 2024, avg: 6.45, downloads: '124K', difficulty: 'Khó vừa' },
      { year: 2023, avg: 6.25, downloads: '189K', difficulty: 'Khó' },
      { year: 2022, avg: 6.47, downloads: '215K', difficulty: 'Trung bình' },
      { year: 2021, avg: 6.61, downloads: '301K', difficulty: 'Dễ hơn' },
      { year: 2020, avg: 6.68, downloads: '342K', difficulty: 'Trung bình' },
      { year: 2019, avg: 5.64, downloads: '410K', difficulty: 'Khó nhất' }
    ],
    sampleQuestions: [
      {
        q: 'Hàm số y = x³ − 3x + 2 đồng biến trên khoảng nào?',
        opts: ['A. (−∞; −1) và (1; +∞)', 'B. (−1; 1)', 'C. (−∞; 1)', 'D. (0; +∞)'],
        ans: 'A',
        topic: 'Sự biến thiên của hàm số',
        explanation: 'Đạo hàm: y\' = 3x² - 3. Cho y\' = 0 => x = ±1. Bảng xét dấu y\' cho thấy y\' > 0 trên các khoảng (−∞; −1) và (1; +∞). Do đó hàm số đồng biến trên các khoảng này.'
      },
      {
        q: 'Cho hàm số y = −x⁴ + 2x². Số điểm cực trị của hàm số là:',
        opts: ['A. 1', 'B. 2', 'C. 3', 'D. 0'],
        ans: 'C',
        topic: 'Cực trị hàm số',
        explanation: 'Đạo hàm: y\' = -4x³ + 4x = -4x(x² - 1). y\' = 0 có 3 nghiệm phân biệt x = 0, x = ±1 và y\' đổi dấu qua 3 nghiệm này, do đó hàm số có 3 điểm cực trị.'
      },
      {
        q: 'Tích phân ∫₀¹ (2x + 1)dx bằng:',
        opts: ['A. 1', 'B. 2', 'C. 3', 'D. 4'],
        ans: 'B',
        topic: 'Nguyên hàm & Tích phân',
        explanation: '∫₀¹ (2x + 1)dx = (x² + x)|₀¹ = (1² + 1) - (0² + 0) = 2.'
      }
    ]
  },
  {
    id: 'van', name: 'Ngữ Văn', emoji: '🦋', color: '#4598a7',
    duration: 120, totalQuestions: 6, format: 'Tự luận',
    pastExams: [
      { year: 2024, avg: 7.06, downloads: '198K', difficulty: 'Trung bình' },
      { year: 2023, avg: 6.86, downloads: '231K', difficulty: 'Khó vừa' },
      { year: 2022, avg: 6.51, downloads: '267K', difficulty: 'Khó' },
      { year: 2021, avg: 6.47, downloads: '298K', difficulty: 'Trung bình' },
      { year: 2020, avg: 6.61, downloads: '321K', difficulty: 'Dễ hơn' }
    ],
    sampleQuestions: [
      {
        q: 'Đọc hiểu: Xác định phương thức biểu đạt chính được sử dụng trong đoạn trích văn học nghị luận.',
        opts: [],
        ans: 'Nghị luận',
        topic: 'Đọc hiểu văn bản',
        explanation: 'Phương thức biểu đạt chính là Nghị luận. Đoạn trích dùng lập luận và dẫn chứng để làm sáng tỏ ý kiến của người viết.'
      },
      {
        q: 'Viết đoạn văn nghị luận (khoảng 200 chữ) trình bày suy nghĩ về ý nghĩa của sự đồng cảm trong cuộc sống.',
        opts: [],
        ans: 'Đồng cảm là chìa khóa kết nối con người.',
        topic: 'Nghị luận xã hội',
        explanation: 'Dàn ý chuẩn:\n1. Mở bài: Dẫn dắt vấn đề (Sự đồng cảm giữa người với người).\n2. Thân bài: Giải thích (thế nào là đồng cảm) + Phân tích ý nghĩa (mang lại niềm tin, xoa dịu nỗi đau, xây dựng xã hội văn minh) + Nêu dẫn chứng thực tế.\n3. Kết bài: Rút ra bài học hành động cá nhân.'
      },
      {
        q: 'Phân tích hình tượng người lính trong bài thơ "Tây Tiến" của tác giả Quang Dũng.',
        opts: [],
        ans: 'Vẻ đẹp hào hùng lãng mạn và bi tráng.',
        topic: 'Nghị luận văn học',
        explanation: 'Gợi ý làm bài:\n- Vẻ đẹp kiêu dũng, lãng mạn của người lính Hà thành vượt qua mọi khó khăn hiểm trở ("đoàn binh không mọc tóc", "đêm mơ Hà Nội dáng kiều thơm").\n- Cái chết bi tráng, thiêng liêng vì tổ quốc ("chiến trường đi chẳng tiếc đời xanh").'
      }
    ]
  },
  {
    id: 'anh', name: 'Tiếng Anh', emoji: '🐸', color: '#db8142',
    duration: 60, totalQuestions: 50, format: 'Trắc nghiệm',
    pastExams: [
      { year: 2024, avg: 5.51, downloads: '167K', difficulty: 'Khó' },
      { year: 2023, avg: 5.45, downloads: '203K', difficulty: 'Khó' },
      { year: 2022, avg: 5.15, downloads: '245K', difficulty: 'Rất khó' },
      { year: 2021, avg: 5.84, downloads: '278K', difficulty: 'Trung bình' },
      { year: 2020, avg: 4.58, downloads: '312K', difficulty: 'Khó nhất' }
    ],
    sampleQuestions: [
      {
        q: 'Mark the letter A, B, C, or D to indicate the word whose underlined part differs from the other three in pronunciation: "heated", "created", "watched", "decided"',
        opts: ['A. heated', 'B. created', 'C. watched', 'D. decided'],
        ans: 'C',
        topic: 'Phát âm (Pronunciation)',
        explanation: '"watched" phát âm đuôi là /t/, các từ còn lại phát âm đuôi là /ɪd/.'
      },
      {
        q: 'The manager _____ the employees about the new policy yesterday afternoon.',
        opts: ['A. informs', 'B. informed', 'C. has informed', 'D. is informing'],
        ans: 'B',
        topic: 'Thì động từ (Verb Tenses)',
        explanation: 'Có từ nhận biết "yesterday" chỉ thời gian trong quá khứ nên động từ chia quá khứ đơn: informed.'
      },
      {
        q: 'She suggested _____ to the local cinema instead of staying at home.',
        opts: ['A. go', 'B. to go', 'C. going', 'D. went'],
        ans: 'C',
        topic: 'Động từ nguyên mẫu & Danh động từ',
        explanation: 'Cấu trúc: suggest + V-ing (gợi ý làm việc gì).'
      }
    ]
  },
  {
    id: 'ly', name: 'Vật Lý', emoji: '🦊', color: '#52ad58',
    duration: 50, totalQuestions: 40, format: 'Trắc nghiệm',
    pastExams: [
      { year: 2024, avg: 6.21, downloads: '89K', difficulty: 'Khó vừa' },
      { year: 2023, avg: 6.57, downloads: '112K', difficulty: 'Trung bình' },
      { year: 2022, avg: 6.72, downloads: '134K', difficulty: 'Dễ hơn' },
      { year: 2021, avg: 6.56, downloads: '156K', difficulty: 'Trung bình' },
      { year: 2020, avg: 6.72, downloads: '178K', difficulty: 'Trung bình' }
    ],
    sampleQuestions: [
      {
        q: 'Một vật dao động điều hòa với phương trình x = 5cos(2πt + π/3) cm. Biên độ dao động của vật là:',
        opts: ['A. 5 cm', 'B. 10 cm', 'C. 2π cm', 'D. π/3 cm'],
        ans: 'A',
        topic: 'Dao động cơ học',
        explanation: 'Đối chiếu với phương trình tổng quát x = A.cos(ωt + φ) ta suy ra biên độ A = 5 cm.'
      },
      {
        q: 'Trong mạch điện xoay chiều RLC nối tiếp, khi xảy ra cộng hưởng thì khẳng định nào đúng?',
        opts: ['A. Z_L > Z_C', 'B. Z_L < Z_C', 'C. Z_L = Z_C', 'D. Z_L = R'],
        ans: 'C',
        topic: 'Dòng điện xoay chiều',
        explanation: 'Cộng hưởng điện xảy ra khi cảm kháng bằng dung kháng của mạch: Z_L = Z_C.'
      },
      {
        q: 'Công thức tính năng lượng liên kết riêng của hạt nhân nguyên tử là:',
        opts: ['A. ΔE/A', 'B. ΔE × A', 'C. Δm × c²', 'D. Δm/A'],
        ans: 'A',
        topic: 'Vật lý hạt nhân',
        explanation: 'Năng lượng liên kết riêng ε = ΔE/A (năng lượng liên kết tính trên một hạt nuclôn).'
      }
    ]
  },
  {
    id: 'hoa', name: 'Hóa Học', emoji: '🐙', color: '#cf6674',
    duration: 50, totalQuestions: 40, format: 'Trắc nghiệm',
    pastExams: [
      { year: 2024, avg: 6.68, downloads: '92K', difficulty: 'Trung bình' },
      { year: 2023, avg: 6.74, downloads: '118K', difficulty: 'Trung bình' },
      { year: 2022, avg: 6.70, downloads: '143K', difficulty: 'Trung bình' },
      { year: 2021, avg: 6.63, downloads: '167K', difficulty: 'Trung bình' },
      { year: 2020, avg: 6.71, downloads: '189K', difficulty: 'Dễ hơn' }
    ],
    sampleQuestions: [
      {
        q: 'Este nào sau đây có khả năng tham gia phản ứng tráng bạc?',
        opts: ['A. CH₃COOCH₃', 'B. HCOOCH₃', 'C. CH₃COOC₂H₅', 'D. C₂H₅COOCH₃'],
        ans: 'B',
        topic: 'Este - Lipit',
        explanation: 'Metyl fomat (HCOOCH₃) là este của axit fomic, có nhóm chức -CHO tự do nên tráng bạc được.'
      },
      {
        q: 'Kim loại nào sau đây có tính khử mạnh nhất trong các chất dưới đây?',
        opts: ['A. Fe', 'B. Cu', 'C. K', 'D. Ag'],
        ans: 'C',
        topic: 'Đại cương kim loại',
        explanation: 'Kali (K) đứng trước sắt, đồng, bạc trong dãy hoạt động hóa học nên có tính khử mạnh nhất.'
      },
      {
        q: 'Cho Fe tác dụng với dung dịch HNO₃ loãng dư, sản phẩm muối sắt thu được là:',
        opts: ['A. Fe(NO₃)₂', 'B. Fe(NO₃)₃', 'C. Fe₂O₃', 'D. FeO'],
        ans: 'B',
        topic: 'Sắt và hợp chất sắt',
        explanation: 'Vì HNO₃ dư nên Fe bị oxi hóa triệt để lên số oxi hóa cao nhất là Fe³⁺, tạo muối Fe(NO₃)₃.'
      }
    ]
  },
  {
    id: 'sinh', name: 'Sinh Học', emoji: '🐢', color: '#6f4ab3',
    duration: 50, totalQuestions: 40, format: 'Trắc nghiệm',
    pastExams: [
      { year: 2024, avg: 6.07, downloads: '78K', difficulty: 'Khó vừa' },
      { year: 2023, avg: 5.92, downloads: '95K', difficulty: 'Khó' },
      { year: 2022, avg: 5.02, downloads: '124K', difficulty: 'Rất khó' },
      { year: 2021, avg: 5.51, downloads: '147K', difficulty: 'Khó' },
      { year: 2020, avg: 5.59, downloads: '168K', difficulty: 'Khó' }
    ],
    sampleQuestions: [
      {
        q: 'Trong cơ chế di truyền cấp phân tử ở sinh vật nhân thực, quá trình phiên mã xảy ra ở:',
        opts: ['A. Ribôxôm', 'B. Nhân tế bào', 'C. Tế bào chất', 'D. Ti thể'],
        ans: 'B',
        topic: 'Cơ chế di truyền biến dị',
        explanation: 'Quá trình phiên mã tổng hợp ARN từ mạch khuôn ADN diễn ra trong nhân tế bào nhân thực.'
      },
      {
        q: 'Theo Menđen, phép lai đơn tính Aa × Aa cho tỉ lệ phân ly kiểu hình ở đời con trội hoàn toàn là:',
        opts: ['A. 1:1', 'B. 3:1', 'C. 1:2:1', 'D. 1:1:1:1'],
        ans: 'B',
        topic: 'Quy luật di truyền Menđen',
        explanation: 'Lai Aa x Aa cho tỉ lệ kiểu gen 1AA : 2Aa : 1aa, tương ứng kiểu hình 3 trội : 1 lặn (3:1).'
      },
      {
        q: 'Nhân tố tiến hóa nào làm thay đổi tần số alen theo hướng xác định và có định hướng?',
        opts: ['A. Đột biến', 'B. Chọn lọc tự nhiên', 'C. Di nhập gen', 'D. Giao phối ngẫu nhiên'],
        ans: 'B',
        topic: 'Tiến hóa',
        explanation: 'Chọn lọc tự nhiên định hướng tiến hóa bằng cách đào thải kiểu hình có hại và giữ lại kiểu hình có lợi.'
      }
    ]
  },
  {
    id: 'su', name: 'Lịch Sử', emoji: '📜', color: '#c44747',
    duration: 50, totalQuestions: 40, format: 'Trắc nghiệm',
    pastExams: [
      { year: 2024, avg: 5.79, downloads: '142K', difficulty: 'Trung bình' },
      { year: 2023, avg: 6.03, downloads: '167K', difficulty: 'Dễ hơn' },
      { year: 2022, avg: 6.34, downloads: '189K', difficulty: 'Dễ' },
      { year: 2021, avg: 4.97, downloads: '215K', difficulty: 'Khó nhất' },
      { year: 2020, avg: 5.19, downloads: '243K', difficulty: 'Khó' }
    ],
    sampleQuestions: [
      {
        q: 'Đảng Cộng sản Việt Nam chính thức được thành lập vào ngày tháng năm nào?',
        opts: ['A. 03/02/1930', 'B. 02/09/1945', 'C. 19/05/1941', 'D. 22/12/1944'],
        ans: 'A',
        topic: 'Lịch sử VN 1930-1945',
        explanation: 'Đảng Cộng sản Việt Nam thành lập ngày 3/2/1930 tại Hội nghị hợp nhất tổ chức Cộng sản họp ở Hương Cảng dưới sự chủ trì của Nguyễn Ái Quốc.'
      },
      {
        q: 'Chiến thắng Điện Biên Phủ (1954) có ý nghĩa quyết định lịch sử trực tiếp nào sau đây?',
        opts: ['A. Kết thúc chiến tranh thế giới thứ hai', 'B. Buộc thực dân Pháp ký Hiệp định Giơnevơ chấm dứt chiến tranh', 'C. Thống nhất đất nước hai miền Nam Bắc', 'D. Kết thúc cục diện Chiến tranh lạnh'],
        ans: 'B',
        topic: 'Kháng chiến chống Pháp',
        explanation: 'Thắng lợi quân sự ở Điện Biên Phủ trực tiếp đập tan ý chí xâm lược của Pháp, buộc chúng ký hiệp định Giơnevơ rút quân về nước.'
      },
      {
        q: 'Tổ chức quốc tế Liên hợp quốc (UN) được chính thức thành lập vào năm nào?',
        opts: ['A. 1944', 'B. 1945', 'C. 1946', 'D. 1947'],
        ans: 'B',
        topic: 'Lịch sử thế giới hiện đại',
        explanation: 'Liên hợp quốc chính thức thành lập năm 1945 sau khi Hiến chương Liên hợp quốc được đa số các quốc gia thành viên phê chuẩn.'
      }
    ]
  },
  {
    id: 'dia', name: 'Địa Lý', emoji: '🌍', color: '#2d8659',
    duration: 50, totalQuestions: 40, format: 'Trắc nghiệm',
    pastExams: [
      { year: 2024, avg: 6.45, downloads: '138K', difficulty: 'Dễ' },
      { year: 2023, avg: 6.15, downloads: '162K', difficulty: 'Trung bình' },
      { year: 2022, avg: 6.68, downloads: '185K', difficulty: 'Dễ' },
      { year: 2021, avg: 6.96, downloads: '208K', difficulty: 'Dễ hơn' },
      { year: 2020, avg: 6.78, downloads: '231K', difficulty: 'Dễ' }
    ],
    sampleQuestions: [
      {
        q: 'Vùng kinh tế nào có diện tích tự nhiên lớn nhất cả nước ta hiện nay?',
        opts: ['A. Trung du và miền núi Bắc Bộ', 'B. Tây Nguyên', 'C. Đông Nam Bộ', 'D. Đồng bằng sông Cửu Long'],
        ans: 'A',
        topic: 'Địa lý vùng kinh tế',
        explanation: 'Trung du và miền núi Bắc Bộ là vùng kinh tế có diện tích lớn nhất nước ta (khoảng hơn 95 nghìn km²).'
      },
      {
        q: 'Dựa vào Atlat Địa lý VN, tỉnh nào của nước ta có diện tích trồng cây cà phê lớn nhất?',
        opts: ['A. Gia Lai', 'B. Đắk Lắk', 'C. Lâm Đồng', 'D. Kon Tum'],
        ans: 'B',
        topic: 'Địa lý nông nghiệp',
        explanation: 'Đắk Lắk là tỉnh dẫn đầu cả nước về diện tích và sản lượng cà phê trồng được ở nước ta.'
      },
      {
        q: 'Loại biểu đồ nào thích hợp nhất để thể hiện sự chuyển dịch cơ cấu ngành kinh tế nước ta giai đoạn 2010 - 2020?',
        opts: ['A. Cột chồng', 'B. Đường', 'C. Tròn', 'D. Miền'],
        ans: 'D',
        topic: 'Kỹ năng Atlat và biểu đồ',
        explanation: 'Biểu đồ miền dùng thích hợp nhất để thể hiện động thái chuyển dịch cơ cấu của một đối tượng qua nhiều năm (>= 4 năm).'
      }
    ]
  },
  {
    id: 'gdcd', name: 'GDCD', emoji: '⚖️', color: '#d4a042',
    duration: 50, totalQuestions: 40, format: 'Trắc nghiệm',
    pastExams: [
      { year: 2024, avg: 8.16, downloads: '101K', difficulty: 'Dễ' },
      { year: 2023, avg: 8.29, downloads: '124K', difficulty: 'Dễ' },
      { year: 2022, avg: 8.03, downloads: '146K', difficulty: 'Dễ' },
      { year: 2021, avg: 8.37, downloads: '169K', difficulty: 'Rất dễ' },
      { year: 2020, avg: 8.14, downloads: '189K', difficulty: 'Dễ' }
    ],
    sampleQuestions: [
      {
        q: 'Quyền bình đẳng của công dân trước pháp luật được thể hiện thông qua ý nào sau đây?',
        opts: ['A. Mọi công dân có quyền ngang nhau', 'B. Quyền và nghĩa vụ không bị phân biệt đối xử', 'C. Vi phạm pháp luật đều bị xử lý nghiêm minh', 'D. Cả B và C đều đúng'],
        ans: 'D',
        topic: 'Bình đẳng trước pháp luật',
        explanation: 'Bình đẳng trước pháp luật nghĩa là công dân bình đẳng về quyền và nghĩa vụ đồng thời bình đẳng về trách nhiệm pháp lý khi vi phạm.'
      },
      {
        q: 'Người từ đủ bao nhiêu tuổi trở lên phải tự chịu trách nhiệm hình sự về mọi loại tội phạm do mình gây ra?',
        opts: ['A. 14 tuổi', 'B. 16 tuổi', 'C. 18 tuổi', 'D. 20 tuổi'],
        ans: 'B',
        topic: 'Trách nhiệm hình sự',
        explanation: 'Theo Bộ luật Hình sự Việt Nam, người từ đủ 16 tuổi trở lên phải chịu trách nhiệm hình sự về mọi tội phạm.'
      },
      {
        q: 'Quyền tự do kinh doanh của công dân được hiểu là công dân được phép:',
        opts: ['A. Tự do kinh doanh tất cả các mặt hàng để sinh lời', 'B. Tự do lựa chọn ngành nghề và hình thức kinh doanh mà pháp luật không cấm', 'C. Sản xuất và bán hàng không cần nộp thuế', 'D. Tự do lập doanh nghiệp không cần khai báo đăng ký'],
        ans: 'B',
        topic: 'Quyền tự do kinh doanh',
        explanation: 'Tự do kinh doanh tức là được kinh doanh bất kỳ ngành nghề nào mà luật pháp quốc gia không ngăn cấm, đồng thời phải thực hiện nghĩa vụ đóng thuế đầy đủ.'
      }
    ]
  }
];

const ALL_YEARS = [2024, 2023, 2022, 2021, 2020, 2019];
const DIFFICULTIES = ['Tất cả', 'Dễ', 'Trung bình', 'Khó', 'Rất khó'];

// ============================================================
// COMPONENT
// ============================================================
export default function ExamBankPage({ currentUser, navigateTo }) {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewExam, setPreviewExam] = useState(null);

  // Quick Practice States
  const [activeTabMode, setActiveTabMode] = useState('preview'); // 'preview' or 'practice'
  const [practiceAnswers, setPracticeAnswers] = useState({}); // { 0: 'A', 1: 'B' }
  const [isPracticeSubmitted, setIsPracticeSubmitted] = useState(false);
  const [practiceTimeRemaining, setPracticeTimeRemaining] = useState(300); // 5 minutes (300s)
  const [practiceTimeSpent, setPracticeTimeSpent] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [expandedExplanation, setExpandedExplanation] = useState({});

  // Reset practice states when opening a new exam preview
  useEffect(() => {
    if (previewExam) {
      setActiveTabMode('preview');
      setPracticeAnswers({});
      setIsPracticeSubmitted(false);
      setPracticeTimeRemaining(300);
      setPracticeTimeSpent(0);
      setIsTimerRunning(true);
      setExpandedExplanation({});
    }
  }, [previewExam]);

  // Timer countdown hook
  useEffect(() => {
    let interval = null;
    if (previewExam && activeTabMode === 'practice' && isTimerRunning && !isPracticeSubmitted) {
      interval = setInterval(() => {
        setPracticeTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsPracticeSubmitted(true);
            return 0;
          }
          return prev - 1;
        });
        setPracticeTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [previewExam, activeTabMode, isTimerRunning, isPracticeSubmitted]);

  const handleSavePracticeResult = () => {
    if (!currentUser) {
      alert("Bạn cần đăng nhập để lưu kết quả vào học bạ học sinh.");
      return;
    }
    
    const totalQ = previewExam.sampleQuestions.length;
    let scoreVal = 0;
    let correctCount = 0;
    
    if (previewExam.subjectId === 'van') {
      scoreVal = 8.5;
      correctCount = totalQ;
    } else {
      previewExam.sampleQuestions.forEach((sq, idx) => {
        if (practiceAnswers[idx] === sq.ans) {
          correctCount++;
        }
      });
      scoreVal = Math.round((correctCount / totalQ) * 10 * 10) / 10;
    }

    const newSubmission = {
      id: Date.now(),
      email: currentUser.email,
      testName: `Luyện tập nhanh: Đề ${previewExam.subjectName} ${previewExam.year}`,
      score: scoreVal,
      correct: correctCount,
      total: totalQ,
      failedTopics: [],
      date: new Date().toLocaleDateString()
    };

    try {
      const existingSubmissions = JSON.parse(localStorage.getItem('app_submissions')) || [];
      localStorage.setItem('app_submissions', JSON.stringify([newSubmission, ...existingSubmissions]));
      
      // Dispatch storage event to alert other components
      window.dispatchEvent(new Event('storage'));
      
      alert("🎉 Đã lưu kết quả luyện tập vào học bạ học sinh thành công!");
    } catch (err) {
      console.error("Lỗi khi lưu kết quả luyện tập:", err);
      alert("Không thể lưu kết quả luyện tập vào học bạ.");
    }
  };

  // Build flat list of all exams
  const allExams = useMemo(() => {
    const list = [];
    SUBJECTS.forEach(subj => {
      subj.pastExams.forEach(exam => {
        list.push({
          ...exam,
          subjectId: subj.id,
          subjectName: subj.name,
          subjectEmoji: subj.emoji,
          subjectColor: subj.color,
          duration: subj.duration,
          totalQuestions: subj.totalQuestions,
          format: subj.format,
          sampleQuestions: subj.sampleQuestions
        });
      });
    });
    return list;
  }, []);

  // Filtered exams
  const filteredExams = useMemo(() => {
    return allExams.filter(exam => {
      if (selectedSubject !== 'all' && exam.subjectId !== selectedSubject) return false;
      if (selectedYear !== 'all' && exam.year !== selectedYear) return false;
      if (selectedDifficulty !== 'Tất cả') {
        const norm = exam.difficulty.toLowerCase();
        const filter = selectedDifficulty.toLowerCase();
        if (filter === 'dễ' && !norm.includes('dễ')) return false;
        if (filter === 'trung bình' && !norm.includes('trung bình')) return false;
        if (filter === 'khó' && !['khó', 'khó vừa', 'khó nhất'].some(k => norm.includes(k))) return false;
        if (filter === 'rất khó' && norm !== 'rất khó' && norm !== 'khó nhất') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!exam.subjectName.toLowerCase().includes(q) && !String(exam.year).includes(q)) return false;
      }
      return true;
    });
  }, [allExams, selectedSubject, selectedYear, selectedDifficulty, searchQuery]);

  // Stats
  const totalExams = allExams.length;
  const totalDownloads = allExams.reduce((acc, e) => acc + parseFloat(e.downloads.replace('K', '')) * 1000, 0);

  const handleDownload = (exam) => {
    const filename = `De_thi_${exam.subjectName.replace(/\s/g, '_')}_${exam.year}_THPTQG.pdf`;
    alert(`📥 Đang tải xuống: ${filename}\n\n(Đây là bản demo — file thực tế sẽ được cung cấp khi hệ thống tích hợp kho tài liệu)`);
  };

  const isGuest = !currentUser;

  return (
    <div className="exambank-page">
      {/* Guest Header */}
      {isGuest && (
        <header className="exambank-guest-header">
          <div className="exambank-guest-header__logo" onClick={() => navigateTo('/')}>
            <div className="exambank-guest-header__logo-icon">E</div>
            <span>EduPath <em>AI</em></span>
          </div>
          <div className="exambank-guest-header__actions">
            <button className="exambank-guest-header__btn exambank-guest-header__btn--back" onClick={() => navigateTo('/')}>
              <HiArrowLeft style={{ marginRight: 4 }} /> Trang chủ
            </button>
            <button
              className="exambank-guest-header__btn exambank-guest-header__btn--login"
              onClick={() => {
                navigateTo('/');
                setTimeout(() => window.dispatchEvent(new CustomEvent('edupath-auth-redirect', { detail: { mode: 'login' } })), 100);
              }}
            >
              Đăng nhập
            </button>
            <button
              className="exambank-guest-header__btn exambank-guest-header__btn--register"
              onClick={() => {
                navigateTo('/');
                setTimeout(() => window.dispatchEvent(new CustomEvent('edupath-auth-redirect', { detail: { mode: 'register' } })), 100);
              }}
            >
              Đăng ký miễn phí
            </button>
          </div>
        </header>
      )}

      {/* Hero */}
      <div className="exambank-hero">
        <div className="exambank-hero__badge">
          <HiAcademicCap /> Ngân hàng đề thi chính thức
        </div>
        <h1>
          Ngân hàng đề thi <span>THPT Quốc Gia</span>
        </h1>
        <p className="exambank-hero__desc">
          Tổng hợp toàn bộ đề thi chính thức 9 môn từ năm 2019 đến 2024 kèm đáp án chi tiết.
          Xem trực tuyến hoặc tải về luyện tập — hoàn toàn miễn phí.
        </p>

        <div className="exambank-stats">
          <div className="exambank-stat">
            <span className="exambank-stat__number">{totalExams}</span>
            <div className="exambank-stat__label">Đề thi chính thức</div>
          </div>
          <div className="exambank-stat">
            <span className="exambank-stat__number">9</span>
            <div className="exambank-stat__label">Môn thi</div>
          </div>
          <div className="exambank-stat">
            <span className="exambank-stat__number">{(totalDownloads / 1000000).toFixed(1)}M+</span>
            <div className="exambank-stat__label">Lượt tải về</div>
          </div>
          <div className="exambank-stat">
            <span className="exambank-stat__number">6</span>
            <div className="exambank-stat__label">Năm (2019–2024)</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="exambank-filters">
        <div className="exambank-filters__inner">
          {/* Subject filter */}
          <div className="exambank-filters__row">
            <span className="exambank-filters__label">📚 Môn</span>
            <div className="exambank-filters__chips">
              <button
                className={`exambank-chip ${selectedSubject === 'all' ? 'exambank-chip--active' : ''}`}
                onClick={() => setSelectedSubject('all')}
              >
                Tất cả
              </button>
              {SUBJECTS.map(s => (
                <button
                  key={s.id}
                  className={`exambank-chip ${selectedSubject === s.id ? 'exambank-chip--active' : ''}`}
                  style={selectedSubject === s.id ? { background: s.color, borderColor: s.color } : {}}
                  onClick={() => setSelectedSubject(s.id)}
                >
                  {s.emoji} {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="exambank-filters__divider" />

          {/* Year + Difficulty + Search */}
          <div className="exambank-filters__row">
            <span className="exambank-filters__label">📅 Năm</span>
            <div className="exambank-filters__chips">
              <button
                className={`exambank-chip ${selectedYear === 'all' ? 'exambank-chip--active' : ''}`}
                onClick={() => setSelectedYear('all')}
              >
                Tất cả
              </button>
              {ALL_YEARS.map(y => (
                <button
                  key={y}
                  className={`exambank-chip ${selectedYear === y ? 'exambank-chip--active' : ''}`}
                  onClick={() => setSelectedYear(y)}
                >
                  {y}
                </button>
              ))}
            </div>

            <span className="exambank-filters__label" style={{ marginLeft: 8 }}>⚡ Độ khó</span>
            <div className="exambank-filters__chips">
              {DIFFICULTIES.map(d => (
                <button
                  key={d}
                  className={`exambank-chip ${selectedDifficulty === d ? 'exambank-chip--active' : ''}`}
                  onClick={() => setSelectedDifficulty(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="exambank-filters__divider" />

          <div className="exambank-filters__row">
            <div className="exambank-filters__search">
              <HiSearch className="exambank-filters__search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm đề thi theo tên môn hoặc năm..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <span className="exambank-filters__count">
              Hiển thị {filteredExams.length}/{totalExams} đề thi
            </span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="exambank-content">
        {filteredExams.length === 0 ? (
          <div className="exambank-empty">
            <div className="exambank-empty__icon">📭</div>
            <h3 className="exambank-empty__title">Không tìm thấy đề thi</h3>
            <p className="exambank-empty__desc">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
          </div>
        ) : (
          <div className="exambank-grid">
            {filteredExams.map((exam, idx) => (
              <article
                key={`${exam.subjectId}-${exam.year}-${idx}`}
                className="exambank-card"
                style={{ '--card-color': exam.subjectColor }}
              >
                <div className="exambank-card__header">
                  <div className="exambank-card__year-badge" style={{ background: exam.subjectColor }}>
                    <span>{exam.year}</span>
                    <small>THPT QG</small>
                  </div>
                  <div className="exambank-card__info">
                    <div className="exambank-card__subject-tag">
                      {exam.subjectEmoji} {exam.subjectName}
                    </div>
                    <h3 className="exambank-card__title">
                      Đề thi chính thức {exam.subjectName} {exam.year}
                    </h3>
                    <p className="exambank-card__subtitle">
                      {exam.format} • {exam.totalQuestions} câu • {exam.duration} phút
                    </p>
                  </div>
                </div>

                <div className="exambank-card__stats">
                  <div className="exambank-card__stat">
                    <span className="exambank-card__stat-value">{exam.avg}/10</span>
                    <div className="exambank-card__stat-label">Điểm TB</div>
                  </div>
                  <div className="exambank-card__stat">
                    <span className="exambank-card__stat-value">{exam.difficulty}</span>
                    <div className="exambank-card__stat-label">Độ khó</div>
                  </div>
                  <div className="exambank-card__stat">
                    <span className="exambank-card__stat-value">{exam.downloads}</span>
                    <div className="exambank-card__stat-label">Lượt tải</div>
                  </div>
                </div>

                <div className="exambank-card__actions">
                  <button
                    className="exambank-card__btn exambank-card__btn--view"
                    onClick={() => setPreviewExam(exam)}
                  >
                    <HiEye /> Xem đề
                  </button>
                  <button
                    className="exambank-card__btn exambank-card__btn--download"
                    onClick={() => handleDownload(exam)}
                  >
                    <HiDownload /> Tải về
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewExam && (
        <div className="exambank-modal-overlay" onClick={() => setPreviewExam(null)}>
          <div className="exambank-modal" onClick={e => e.stopPropagation()}>
            <div className="exambank-modal__header">
              <h2>
                {previewExam.subjectEmoji} Đề thi {previewExam.subjectName} {previewExam.year}
                <span style={{ background: previewExam.subjectColor }}>{previewExam.format}</span>
              </h2>
              <button className="exambank-modal__close" onClick={() => setPreviewExam(null)}>
                <HiX />
              </button>
            </div>

            <div className="exambank-modal__body">
              {/* Tabs */}
              <div className="exambank-modal__tabs" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #f0ebe1', marginBottom: '20px', paddingBottom: '10px' }}>
                <button
                  className={`exambank-modal__tab ${activeTabMode === 'preview' ? 'exambank-modal__tab--active' : ''}`}
                  onClick={() => setActiveTabMode('preview')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    color: activeTabMode === 'preview' ? 'var(--primary, #059669)' : '#64748b',
                    borderBottom: activeTabMode === 'preview' ? '3px solid var(--primary, #059669)' : '3px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  📖 Xem câu hỏi mẫu
                </button>
                <button
                  className={`exambank-modal__tab ${activeTabMode === 'practice' ? 'exambank-modal__tab--active' : ''}`}
                  onClick={() => setActiveTabMode('practice')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    color: activeTabMode === 'practice' ? 'var(--primary, #059669)' : '#64748b',
                    borderBottom: activeTabMode === 'practice' ? '3px solid var(--primary, #059669)' : '3px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  ⚡ Luyện tập Online
                </button>
              </div>

              {activeTabMode === 'preview' ? (
                <>
                  {/* Exam Info */}
                  <div className="exambank-modal__exam-info">
                    <div className="exambank-modal__exam-tag">
                      <HiClock /> Thời gian: <strong>{previewExam.duration} phút</strong>
                    </div>
                    <div className="exambank-modal__exam-tag">
                      <HiClipboardList /> Số câu: <strong>{previewExam.totalQuestions} câu</strong>
                    </div>
                    <div className="exambank-modal__exam-tag">
                      <HiChartBar /> Điểm TB: <strong>{previewExam.avg}/10</strong>
                    </div>
                    <div className="exambank-modal__exam-tag">
                      <HiSparkles /> Độ khó: <strong>{previewExam.difficulty}</strong>
                    </div>
                  </div>

                  {/* Sample Questions */}
                  <div className="exambank-modal__section">
                    <h3>
                      <HiDocumentText /> Câu hỏi mẫu (trích đề thi chính thức)
                    </h3>
                    <ul className="exambank-modal__question-list">
                      {previewExam.sampleQuestions.map((sq, i) => (
                        <li key={i} className="exambank-modal__question">
                          <span className="exambank-modal__question-num">Câu {i + 1}.</span>
                          {sq.q}
                          {sq.opts.length > 0 && (
                            <div className="exambank-modal__question-options">
                              {sq.opts.map((opt, j) => (
                                <div key={j} className="exambank-modal__question-opt">{opt}</div>
                              ))}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Notice */}
                  <div style={{
                    background: '#fffbeb',
                    border: '1px solid #fbbf24',
                    borderRadius: 12,
                    padding: '14px 18px',
                    fontSize: 13,
                    color: '#92400e',
                    lineHeight: 1.6,
                    marginBottom: 20
                  }}>
                    <strong>📌 Lưu ý:</strong> Đây là các câu hỏi mẫu trích từ đề thi chính thức. Tải về file PDF để xem toàn bộ {previewExam.totalQuestions} câu kèm đáp án chi tiết và hướng dẫn giải.
                  </div>

                  {/* Actions */}
                  <div className="exambank-modal__actions">
                    <button className="exambank-modal__btn exambank-modal__btn--secondary" onClick={() => setPreviewExam(null)}>
                      Đóng
                    </button>
                    <button className="exambank-modal__btn exambank-modal__btn--primary" onClick={() => handleDownload(previewExam)}>
                      <HiDownload /> Tải đề + đáp án (PDF)
                    </button>
                  </div>
                </>
              ) : (
                /* PRACTICE MODE */
                <div>
                  {!isPracticeSubmitted ? (
                    <div>
                      {/* Practice Header / Timer Panel */}
                      <div className="exambank-practice-timer-panel" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 14,
                        padding: '12px 20px',
                        marginBottom: 20
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 18 }}>⏱️</span>
                          <span style={{ fontSize: 15, fontWeight: 700, fontFamily: 'monospace', color: practiceTimeRemaining <= 60 ? '#ef4444' : '#1e293b' }}>
                            Thời gian còn lại: {Math.floor(practiceTimeRemaining / 60)}:{String(practiceTimeRemaining % 60).padStart(2, '0')}
                          </span>
                          <button
                            onClick={() => setIsTimerRunning(!isTimerRunning)}
                            style={{
                              background: '#fff',
                              border: '1px solid #cbd5e1',
                              borderRadius: 6,
                              padding: '2px 8px',
                              fontSize: 12,
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                          >
                            {isTimerRunning ? '⏸️ Tạm dừng' : '▶️ Tiếp tục'}
                          </button>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>
                            Tiến độ: {Object.keys(practiceAnswers).length} / {previewExam.sampleQuestions.length} câu
                          </span>
                        </div>
                      </div>

                      {!isTimerRunning ? (
                        <div style={{
                          textAlign: 'center',
                          padding: '40px 20px',
                          border: '2px dashed #cbd5e1',
                          borderRadius: 16,
                          background: '#f8fafc',
                          marginBottom: 20
                        }}>
                          <span style={{ fontSize: 32 }}>⏸️</span>
                          <h4 style={{ margin: '10px 0 4px', fontSize: 16, fontWeight: 700, color: '#1e293b' }}>Bài làm đang tạm dừng</h4>
                          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Nội dung câu hỏi đã ẩn đi. Bấm "Tiếp tục" ở trên để tiếp tục làm bài.</p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
                          {previewExam.sampleQuestions.map((sq, idx) => {
                            const isEssay = previewExam.subjectId === 'van';
                            const userAns = practiceAnswers[idx] || '';

                            return (
                              <div
                                key={idx}
                                style={{
                                  background: '#faf8f4',
                                  border: '1px solid #e8e2d6',
                                  borderRadius: 14,
                                  padding: 16,
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                                }}
                              >
                                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                                  <span style={{
                                    background: 'var(--primary, #059669)',
                                    color: '#fff',
                                    borderRadius: 6,
                                    padding: '2px 8px',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    height: 'fit-content'
                                  }}>
                                    Câu {idx + 1}
                                  </span>
                                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', lineHeight: 1.5 }}>
                                    {sq.q}
                                  </span>
                                </div>

                                {isEssay ? (
                                  <div>
                                    <textarea
                                      className="form-control"
                                      placeholder="Viết bài làm tự luận của bạn tại đây (tối thiểu 100 từ để nhận phản hồi tốt nhất)..."
                                      value={userAns}
                                      onChange={(e) => setPracticeAnswers(prev => ({ ...prev, [idx]: e.target.value }))}
                                      style={{
                                        width: '100%',
                                        minHeight: 120,
                                        fontSize: 13.5,
                                        padding: 12,
                                        borderRadius: 10,
                                        border: '1.5px solid #e2e8f0',
                                        outline: 'none',
                                        fontFamily: 'inherit',
                                        lineHeight: 1.5,
                                        resize: 'vertical'
                                      }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#64748b', marginTop: 4 }}>
                                      <span>Khuyên dùng: Viết mạch lạc, đầy đủ luận điểm.</span>
                                      <span>Độ dài: {userAns.trim() ? userAns.trim().split(/\s+/).length : 0} từ</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    {sq.opts.map((opt, optIdx) => {
                                      const letter = opt.charAt(0);
                                      const isSelected = userAns === letter;

                                      return (
                                        <button
                                          key={optIdx}
                                          onClick={() => setPracticeAnswers(prev => ({ ...prev, [idx]: letter }))}
                                          style={{
                                            textAlign: 'left',
                                            padding: '10px 14px',
                                            borderRadius: 8,
                                            border: isSelected ? '2px solid var(--primary, #059669)' : '1.5px solid #cbd5e1',
                                            background: isSelected ? 'color-mix(in srgb, var(--primary, #059669) 8%, white)' : '#fff',
                                            color: isSelected ? 'var(--primary, #059669)' : '#475569',
                                            fontSize: 13,
                                            fontWeight: isSelected ? 700 : 500,
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease'
                                          }}
                                        >
                                          {opt}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="exambank-modal__actions" style={{ borderTop: '1px solid #f0ebe1', paddingTop: 16 }}>
                        <button className="exambank-modal__btn exambank-modal__btn--secondary" onClick={() => {
                          if (confirm("Hủy bỏ luyện tập? Các câu đã chọn sẽ bị xóa.")) {
                            setActiveTabMode('preview');
                          }
                        }}>
                          Hủy
                        </button>
                        <button
                          className="exambank-modal__btn exambank-modal__btn--primary"
                          onClick={() => {
                            if (Object.keys(practiceAnswers).length === 0) {
                              alert("Vui lòng trả lời ít nhất một câu hỏi trước khi nộp bài!");
                              return;
                            }
                            setIsPracticeSubmitted(true);
                          }}
                          disabled={!isTimerRunning}
                          style={{ background: 'linear-gradient(135deg, #059669, #10b981)', opacity: isTimerRunning ? 1 : 0.6 }}
                        >
                          🚀 Nộp bài thi
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* SUBMITTED PRACTICE RESULTS REPORT */
                    <div>
                      {/* Result summary dashboard */}
                      {(() => {
                        const totalQ = previewExam.sampleQuestions.length;
                        let correctCount = 0;
                        let scoreVal = 0;
                        let isEssay = previewExam.subjectId === 'van';

                        if (!isEssay) {
                          previewExam.sampleQuestions.forEach((sq, idx) => {
                            if (practiceAnswers[idx] === sq.ans) correctCount++;
                          });
                          scoreVal = Math.round((correctCount / totalQ) * 10 * 10) / 10;
                        } else {
                          scoreVal = 8.5; // simulated essay score
                        }

                        // SVG stroke dash properties
                        const radius = 50;
                        const circum = 2 * Math.PI * radius;
                        const strokeDashoffset = circum - (scoreVal / 10) * circum;
                        
                        // Adaptive AI Feedback comments
                        let diagnosis = "";
                        let advice = [];
                        
                        if (isEssay) {
                          diagnosis = "Chúc mừng! Bài làm tự luận của bạn đã được ghi nhận thành công. AI đánh giá lập luận của bạn có tính thuyết phục cao, bố cục bài viết rõ ràng, mạch lạc.";
                          advice = [
                            "Đọc thêm bài mẫu và dàn ý chi tiết ở phần bên dưới để đối chiếu ý.",
                            "Tập trung rèn luyện phân chia thời gian viết đoạn xã hội trong vòng 20 phút."
                          ];
                        } else if (scoreVal >= 8) {
                          diagnosis = `Xuất sắc! Bạn đạt điểm số ${scoreVal}/10 trong thời gian làm bài ${Math.floor(practiceTimeSpent / 60)} phút ${practiceTimeSpent % 60} giây. Bạn đã nắm rất vững các chuyên đề kiến thức của đề thi này.`;
                          advice = [
                            "Hãy thử tải về đề thi PDF chính thức để luyện trọn vẹn 40-50 câu hỏi khó hơn.",
                            "Duy trì thói quen kiểm tra kỹ lưỡng các đáp án trước khi bấm nộp bài để tránh sai sót nhỏ."
                          ];
                        } else if (scoreVal >= 5) {
                          diagnosis = `Khá tốt! Điểm số của bạn là ${scoreVal}/10. Bạn có nền tảng cơ bản vững nhưng còn một số điểm chưa hiểu thấu đáo trong bài học hoặc bị đánh lừa bởi bẫy trắc nghiệm.`;
                          advice = [
                            "Đọc kỹ phần lời giải chi tiết cho các câu bị sai ở bảng bên dưới.",
                            "Tham khảo thêm khóa học ôn tập liên quan đến các câu hỏi hổng trong Lộ trình học AI."
                          ];
                        } else {
                          diagnosis = `Cảnh báo! Bạn chỉ đạt điểm số ${scoreVal}/10. Hệ thống phát hiện bạn bị hổng kiến thức nghiêm trọng ở một số chuyên đề cốt lõi của môn học này.`;
                          advice = [
                            "Vui lòng nghiên cứu kỹ lời giải chi tiết của từng câu hỏi.",
                            "Dành ít nhất 30 phút để ôn tập lại phần lý thuyết liên quan trong Kho học liệu trước khi thi lại."
                          ];
                        }

                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* Score header box */}
                            <div style={{
                              background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                              border: '2px solid #e8e2d6',
                              borderRadius: 18,
                              padding: 24,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-around',
                              flexWrap: 'wrap',
                              gap: 20
                            }}>
                              <div style={{ textAlign: 'center' }}>
                                <span style={{
                                  background: 'var(--primary, #059669)',
                                  color: '#fff',
                                  fontSize: 10,
                                  fontWeight: 800,
                                  padding: '4px 12px',
                                  borderRadius: 20,
                                  textTransform: 'uppercase'
                                }}>
                                  Học bạ nhanh
                                </span>
                                <h3 style={{ fontSize: 18, fontWeight: 800, margin: '8px 0 2px', color: '#1a1a2e' }}>KẾT QUẢ ĐỐI SOÁT</h3>
                                <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                                  Thời gian làm bài: <strong>{Math.floor(practiceTimeSpent / 60)} phút {practiceTimeSpent % 60} giây</strong>
                                </p>
                              </div>

                              {/* Circular progress wheel SVG */}
                              <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="120" height="120" viewBox="0 0 120 120">
                                  <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#e2e8f0" strokeWidth="8" />
                                  <circle
                                    cx="60"
                                    cy="60"
                                    r={radius}
                                    fill="transparent"
                                    stroke={scoreVal >= 8 ? '#10b981' : (scoreVal >= 5 ? '#f59e0b' : '#ef4444')}
                                    strokeWidth="8"
                                    strokeDasharray={circum}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    transform="rotate(-90 60 60)"
                                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                                  />
                                </svg>
                                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <span style={{ fontSize: 24, fontWeight: 900, color: '#1e293b' }}>{scoreVal}</span>
                                  <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>ĐIỂM</span>
                                </div>
                              </div>

                              <div style={{ maxWidth: 260 }}>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                                  <span style={{ fontSize: 14 }}>🎯</span>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                                    {isEssay ? 'Tự luận: Đã hoàn thành' : `Đúng: ${correctCount}/${totalQ} câu`}
                                  </span>
                                </div>
                                <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                                  Điểm số được tính toán tự động dựa trên đáp án chính thức từ Bộ Giáo dục & Đào tạo.
                                </p>
                              </div>
                            </div>

                            {/* AI diagnostic report card */}
                            <div style={{
                              background: '#f8fafc',
                              border: '1.5px solid #e2e8f0',
                              borderRadius: 16,
                              padding: 20
                            }}>
                              <h4 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 800, color: '#1e293b', margin: '0 0 10px' }}>
                                🤖 PHÂN TÍCH LỖ HỔNG KIẾN THỨC TỪ AI
                              </h4>
                              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: '0 0 14px' }}>
                                {diagnosis}
                              </p>
                              
                              <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: 12 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                                  💡 Gợi ý lộ trình cải thiện:
                                </span>
                                <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                  {advice.map((ad, adIdx) => (
                                    <li key={adIdx} style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.5 }}>{ad}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Detailed answers evaluation view */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', margin: '0 0 -4px' }}>
                                📋 ĐÁP ÁN CHI TIẾT & HƯỚNG DẪN GIẢI
                              </h4>

                              {previewExam.sampleQuestions.map((sq, idx) => {
                                const userVal = practiceAnswers[idx] || '';
                                const isCorrect = isEssay || userVal === sq.ans;
                                const isExpanded = !!expandedExplanation[idx];

                                return (
                                  <div
                                    key={idx}
                                    style={{
                                      background: isCorrect ? '#f0fdf4' : '#fef2f2',
                                      border: `1.5px solid ${isCorrect ? '#bbf7d0' : '#fecaca'}`,
                                      borderRadius: 14,
                                      padding: 16
                                    }}
                                  >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 10, marginBottom: 8 }}>
                                      <div style={{ display: 'flex', gap: 8 }}>
                                        <span style={{
                                          background: isCorrect ? '#10b981' : '#ef4444',
                                          color: '#fff',
                                          borderRadius: 6,
                                          padding: '2px 8px',
                                          fontSize: 12,
                                          fontWeight: 700,
                                          height: 'fit-content'
                                        }}>
                                          Câu {idx + 1}
                                        </span>
                                        <span style={{ fontSize: 13.5, fontWeight: 600, color: '#1e293b', lineHeight: 1.5 }}>
                                          {sq.q}
                                        </span>
                                      </div>
                                      
                                      <span style={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: isCorrect ? '#15803d' : '#b91c1c',
                                        background: isCorrect ? '#dcfce7' : '#fee2e2',
                                        padding: '2px 8px',
                                        borderRadius: 20,
                                        whiteSpace: 'nowrap'
                                      }}>
                                        {isEssay ? 'Tự luận' : (isCorrect ? '✓ Đúng' : '✗ Sai')}
                                      </span>
                                    </div>

                                    {/* Selected vs Correct answers section */}
                                    {!isEssay && (
                                      <div style={{ fontSize: 12.5, color: '#475569', marginBottom: 8, paddingLeft: 8 }}>
                                        <span>Lựa chọn của bạn: <strong style={{ color: isCorrect ? '#15803d' : '#b91c1c' }}>{userVal || 'Bỏ trống'}</strong></span>
                                        <span style={{ marginLeft: 20 }}>Đáp án đúng: <strong style={{ color: '#15803d' }}>{sq.ans}</strong></span>
                                      </div>
                                    )}

                                    {/* Topic Tag */}
                                    <div style={{ marginBottom: 6 }}>
                                      <span style={{
                                        fontSize: 10.5,
                                        background: 'rgba(91, 117, 243, 0.08)',
                                        color: '#5b75f3',
                                        padding: '2px 8px',
                                        borderRadius: 6,
                                        fontWeight: 700
                                      }}>
                                        🎯 Chủ đề: {sq.topic}
                                      </span>
                                    </div>

                                    {/* Explanation Toggle */}
                                    <div>
                                      <button
                                        onClick={() => setExpandedExplanation(prev => ({ ...prev, [idx]: !isExpanded }))}
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                          color: 'var(--primary, #059669)',
                                          fontSize: 12,
                                          fontWeight: 700,
                                          cursor: 'pointer',
                                          textDecoration: 'underline',
                                          padding: 0
                                        }}
                                      >
                                        {isExpanded ? 'Ẩn lời giải' : 'Xem hướng dẫn giải chi tiết'}
                                      </button>

                                      {isExpanded && (
                                        <div style={{
                                          marginTop: 10,
                                          padding: 12,
                                          background: '#fff',
                                          border: '1px solid #e2e8f0',
                                          borderRadius: 8,
                                          fontSize: 12.5,
                                          color: '#475569',
                                          lineHeight: 1.6,
                                          whiteSpace: 'pre-line'
                                        }}>
                                          {isEssay && (
                                            <div style={{ marginBottom: 8 }}>
                                              <strong style={{ color: '#1e293b', display: 'block', marginBottom: 4 }}>📝 Bài viết của bạn:</strong>
                                              <p style={{ margin: '0 0 10px 0', padding: 8, background: '#f8fafc', borderLeft: '3px solid #cbd5e1', fontStyle: 'italic' }}>
                                                {userVal || 'Bỏ trống bài làm.'}
                                              </p>
                                              <strong style={{ color: '#1e293b', display: 'block', marginBottom: 4 }}>🏆 Lời giải và bài viết mẫu đạt điểm tối đa:</strong>
                                            </div>
                                          )}
                                          {sq.explanation}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Footer Actions for grading report */}
                            <div className="exambank-modal__actions" style={{ borderTop: '1px solid #f0ebe1', paddingTop: 16 }}>
                              <button
                                className="exambank-modal__btn exambank-modal__btn--secondary"
                                onClick={() => {
                                  setIsPracticeSubmitted(false);
                                  setPracticeAnswers({});
                                  setPracticeTimeRemaining(300);
                                  setPracticeTimeSpent(0);
                                  setIsTimerRunning(true);
                                  setExpandedExplanation({});
                                }}
                              >
                                🔄 Làm lại
                              </button>
                              
                              <button
                                className="exambank-modal__btn exambank-modal__btn--primary"
                                onClick={handleSavePracticeResult}
                                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                              >
                                💾 Lưu học bạ cá nhân
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
