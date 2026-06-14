import { useState, useMemo } from 'react';
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
      { q: 'Hàm số y = x³ − 3x + 2 đồng biến trên khoảng nào?', opts: ['A. (−∞; −1)', 'B. (−1; 1)', 'C. (−∞; −1) ∪ (1; +∞)', 'D. (1; +∞)'] },
      { q: 'Cho hàm số y = −x⁴ + 2x². Số điểm cực trị của hàm số là:', opts: ['A. 1', 'B. 2', 'C. 3', 'D. 0'] },
      { q: 'Tích phân ∫₀¹ (2x + 1)dx bằng:', opts: ['A. 1', 'B. 2', 'C. 3', 'D. 4'] }
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
      { q: 'Đọc hiểu: Xác định phương thức biểu đạt chính được sử dụng trong đoạn trích trên.', opts: [] },
      { q: 'Viết đoạn văn nghị luận (khoảng 200 chữ) trình bày suy nghĩ về ý nghĩa của sự đồng cảm trong cuộc sống.', opts: [] },
      { q: 'Phân tích hình tượng người lính trong bài thơ "Tây Tiến" của Quang Dũng.', opts: [] }
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
      { q: 'Mark the letter A, B, C, or D to indicate the word whose underlined part differs from the other three: "heated", "created", "watched", "decided"', opts: ['A. heated', 'B. created', 'C. watched', 'D. decided'] },
      { q: 'The manager _____ the employees about the new policy yesterday.', opts: ['A. informs', 'B. informed', 'C. has informed', 'D. is informing'] },
      { q: 'She suggested _____ to the cinema instead of staying at home.', opts: ['A. go', 'B. to go', 'C. going', 'D. went'] }
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
      { q: 'Một vật dao động điều hòa với phương trình x = 5cos(2πt + π/3) cm. Biên độ dao động là:', opts: ['A. 5 cm', 'B. 10 cm', 'C. 2π cm', 'D. π/3 cm'] },
      { q: 'Trong mạch điện xoay chiều RLC nối tiếp, khi xảy ra cộng hưởng thì:', opts: ['A. Z_L > Z_C', 'B. Z_L < Z_C', 'C. Z_L = Z_C', 'D. Z_L = R'] },
      { q: 'Công thức tính năng lượng liên kết riêng của hạt nhân là:', opts: ['A. ΔE/A', 'B. ΔE×A', 'C. Δm×c²', 'D. Δm/A'] }
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
      { q: 'Este nào sau đây có phản ứng tráng bạc?', opts: ['A. CH₃COOCH₃', 'B. HCOOCH₃', 'C. CH₃COOC₂H₅', 'D. C₂H₅COOCH₃'] },
      { q: 'Kim loại nào sau đây có tính khử mạnh nhất?', opts: ['A. Fe', 'B. Cu', 'C. K', 'D. Ag'] },
      { q: 'Cho Fe tác dụng với dung dịch HNO₃ loãng dư, sản phẩm muối thu được là:', opts: ['A. Fe(NO₃)₂', 'B. Fe(NO₃)₃', 'C. Fe₂O₃', 'D. FeO'] }
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
      { q: 'Trong cơ chế di truyền cấp phân tử, quá trình phiên mã xảy ra ở:', opts: ['A. Ribôxôm', 'B. Nhân tế bào', 'C. Tế bào chất', 'D. Ti thể'] },
      { q: 'Theo Menđen, phép lai Aa × Aa cho tỉ lệ kiểu hình:', opts: ['A. 1:1', 'B. 3:1', 'C. 1:2:1', 'D. 1:1:1:1'] },
      { q: 'Nhân tố tiến hóa nào làm thay đổi tần số alen theo hướng xác định?', opts: ['A. Đột biến', 'B. Chọn lọc tự nhiên', 'C. Di nhập gen', 'D. Giao phối ngẫu nhiên'] }
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
      { q: 'Đảng Cộng sản Việt Nam ra đời năm nào?', opts: ['A. 1929', 'B. 1930', 'C. 1945', 'D. 1954'] },
      { q: 'Chiến thắng Điện Biên Phủ (1954) có ý nghĩa lịch sử nào sau đây?', opts: ['A. Kết thúc chiến tranh thế giới thứ hai', 'B. Chấm dứt ách thống trị của thực dân Pháp', 'C. Thống nhất đất nước', 'D. Kết thúc Chiến tranh lạnh'] },
      { q: 'Tổ chức Liên hợp quốc được thành lập vào năm:', opts: ['A. 1944', 'B. 1945', 'C. 1946', 'D. 1947'] }
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
      { q: 'Vùng kinh tế nào có diện tích lớn nhất Việt Nam?', opts: ['A. Trung du và miền núi Bắc Bộ', 'B. Tây Nguyên', 'C. Đông Nam Bộ', 'D. ĐBSCL'] },
      { q: 'Dựa vào Atlat Địa lý VN, tỉnh nào sau đây có diện tích trồng cà phê lớn nhất?', opts: ['A. Gia Lai', 'B. Đắk Lắk', 'C. Lâm Đồng', 'D. Kon Tum'] },
      { q: 'Loại biểu đồ nào thích hợp nhất thể hiện cơ cấu GDP theo khu vực kinh tế?', opts: ['A. Cột chồng', 'B. Đường', 'C. Tròn', 'D. Miền'] }
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
      { q: 'Quyền bình đẳng trước pháp luật có nghĩa là:', opts: ['A. Mọi công dân đều có quyền ngang nhau', 'B. Quyền và nghĩa vụ không phân biệt giới tính', 'C. Quyền và nghĩa vụ không bị phân biệt bởi bất kỳ yếu tố nào', 'D. Tất cả đều đúng'] },
      { q: 'Người từ đủ bao nhiêu tuổi phải chịu trách nhiệm hình sự về mọi tội phạm?', opts: ['A. 14 tuổi', 'B. 16 tuổi', 'C. 18 tuổi', 'D. 20 tuổi'] },
      { q: 'Quyền tự do kinh doanh là quyền:', opts: ['A. Dân sự', 'B. Kinh tế', 'C. Chính trị', 'D. Văn hóa'] }
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
                lineHeight: 1.6
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
