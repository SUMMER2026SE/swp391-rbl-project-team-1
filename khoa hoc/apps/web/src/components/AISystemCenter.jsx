import { useState, useMemo, useEffect, useRef } from "react";
import { 
  HiSparkles, 
  HiTrendingUp, 
  HiAcademicCap, 
  HiCheck, 
  HiLockClosed, 
  HiDownload, 
  HiPaperAirplane, 
  HiInformationCircle 
} from 'react-icons/hi';
import { api } from '../api';

/* ─── DATA CURRICULUM ─── */
const CURRICULUM = [
  {
    id: "foundation",
    order: "01",
    label: "Giai đoạn 1 — Nền tảng",
    period: "Tháng 9 – Tháng 11",
    tagline: "Lấp lỗ hổng kiến thức, xây gốc vững cho từng môn.",
    accent: "moss",
    subjects: [
      {
        name: "Toán học",
        icon: "math",
        chapters: [
          {
            title: "Hàm số & Đồ thị",
            lessons: [
              { id: 1, title: "Bài 1: Khái niệm tính đơn điệu hàm số", duration: "15", courseId: 1, lessonId: 1 },
              { id: 2, title: "Bài 2: Kỹ thuật tìm cực trị hàm số nhanh", duration: "18", courseId: 1, lessonId: 2 },
              { id: 3, title: "Bài 3: Bài toán min-max chứa tham số m", duration: "22", courseId: 1, lessonId: 3 },
              { id: 4, title: "Bài 4: Khảo sát đồ thị và bài toán tiệm cận", duration: "20", courseId: 1, lessonId: 4 },
              { id: 5, title: "Bài 5: Luyện đề tổng hợp cực trị hàm số", duration: "28", courseId: 1, lessonId: 5 }
            ]
          },
          {
            title: "Hàm số Mũ & Lôgarit",
            lessons: [
              { id: 6, title: "Bài 1: Lũy thừa và Hàm số lũy thừa", duration: "14" },
              { id: 7, title: "Bài 2: Logarit và tính chất biến đổi", duration: "16" },
              { id: 8, title: "Bài 3: Phương trình mũ cơ bản", duration: "18" }
            ]
          }
        ]
      },
      {
        name: "Vật lý",
        icon: "physics",
        chapters: [
          {
            title: "Chương I: Dao động cơ học",
            lessons: [
              { id: 9, title: "Bài 1: Khái niệm Dao động điều hòa cơ học", duration: "20", courseId: 3, lessonId: 11 },
              { id: 10, title: "Bài 2: Con lắc lò xo và phương trình li độ", duration: "22", courseId: 3, lessonId: 12 },
              { id: 11, title: "Bài 3: Con lắc đơn và bài toán tính chu kỳ", duration: "18", courseId: 3, lessonId: 13 }
            ]
          }
        ]
      },
      {
        name: "Hóa học",
        icon: "chemistry",
        chapters: [
          {
            title: "Chương I: Este - Lipit",
            lessons: [
              { id: 12, title: "Bài 1: Este lý thuyết căn bản", duration: "12", courseId: 2, lessonId: 6 },
              { id: 13, title: "Bài 2: Tính chất hóa học Este nâng cao", duration: "16", courseId: 2, lessonId: 7 },
              { id: 14, title: "Bài 3: Phản ứng thủy phân và bài toán xà phòng hóa", duration: "24", courseId: 2, lessonId: 8 }
            ]
          }
        ]
      },
      {
        name: "Tiếng Anh",
        icon: "lang",
        chapters: [
          {
            title: "Ngữ pháp cốt lõi",
            lessons: [
              { id: 15, title: "Bài 1: Câu hỏi đuôi (Tag Questions)", duration: "12" },
              { id: 16, title: "Bài 2: Hệ thống 12 thì cơ bản", duration: "15" },
              { id: 17, title: "Bài 3: Câu so sánh hơn và so sánh nhất", duration: "14" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "intensive",
    order: "02",
    label: "Giai đoạn 2 — Tăng tốc",
    period: "Tháng 12 – Tháng 3",
    tagline: "Luyện chuyên đề nâng cao, làm quen dạng đề khó.",
    accent: "sage",
    subjects: [
      {
        name: "Toán học",
        icon: "math",
        chapters: [
          {
            title: "Hình học không gian Oxyz",
            lessons: [
              { id: 18, title: "Bài 1: Tọa độ điểm và vectơ trong Oxyz", duration: "18" },
              { id: 19, title: "Bài 2: Phương trình mặt phẳng Oxyz", duration: "22" }
            ]
          },
          {
            title: "Số phức",
            lessons: [
              { id: 20, title: "Bài 1: Khái niệm số phức và biểu diễn hình học", duration: "15" },
              { id: 21, title: "Bài 2: Phép toán cộng trừ nhân chia số phức", duration: "18" }
            ]
          }
        ]
      },
      {
        name: "Vật lý",
        icon: "physics",
        chapters: [
          {
            title: "Chương II: Sóng cơ & Giao thoa sóng",
            lessons: [
              { id: 22, title: "Bài 1: Định nghĩa sự truyền sóng cơ", duration: "17" },
              { id: 23, title: "Bài 2: Giao thoa sóng hai nguồn cùng pha", duration: "25" }
            ]
          }
        ]
      },
      {
        name: "Hóa học",
        icon: "chemistry",
        chapters: [
          {
            title: "Chương II: Cacbohiđrat & Polime",
            lessons: [
              { id: 24, title: "Bài 1: Glucozơ và Fructozơ cấu tạo", duration: "16" },
              { id: 25, title: "Bài 2: Saccarozơ và Xenlulozơ tính chất", duration: "18" }
            ]
          }
        ]
      },
      {
        name: "Tiếng Anh",
        icon: "lang",
        chapters: [
          {
            title: "Đọc hiểu nâng cao",
            lessons: [
              { id: 26, title: "Bài 1: Kỹ thuật Skimming & Scanning bài đọc", duration: "20" },
              { id: 27, title: "Bài 2: Phân tích ngữ cảnh đoán nghĩa từ vựng", duration: "22" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "sprint",
    order: "03",
    label: "Giai đoạn 3 — Về đích",
    period: "Tháng 4 – Tháng 6",
    tagline: "Thi thử liên tục, rà soát lỗi sai, giữ phong độ.",
    accent: "amber",
    subjects: [
      {
        name: "Toán học",
        icon: "math",
        chapters: [
          {
            title: "Giải đề thi thử THPTQG 2026",
            lessons: [
              { id: 28, title: "Đề số 01: Chuẩn cấu trúc Bộ GD&ĐT", duration: "90" },
              { id: 29, title: "Đề số 02: Bứt phá điểm 9+ nâng cao", duration: "90" }
            ]
          }
        ]
      },
      {
        name: "Vật lý",
        icon: "physics",
        chapters: [
          {
            title: "Luyện đề thi thử Vật lý chuẩn hóa",
            lessons: [
              { id: 30, title: "Đề số 01: Ôn luyện tổng hợp các chương", duration: "50" }
            ]
          }
        ]
      },
      {
        name: "Hóa học",
        icon: "chemistry",
        chapters: [
          {
            title: "Luyện đề lý thuyết đếm mệnh đề Hóa học",
            lessons: [
              { id: 31, title: "Chuyên đề: 50 câu đếm mệnh đề chọn lọc", duration: "45" }
            ]
          }
        ]
      },
      {
        name: "Tiếng Anh",
        icon: "lang",
        chapters: [
          {
            title: "Giải đề thi thử Tiếng Anh full 50 câu",
            lessons: [
              { id: 32, title: "Đề số 01: Chữa chi tiết ngữ âm & đọc hiểu", duration: "60" }
            ]
          }
        ]
      }
    ]
  }
];

/* ─── Bảng màu accent (mô tả inline style do không có Tailwind) ─── */
const ACCENT_STYLES = {
  moss: {
    text: "#047857", // emerald-700
    bgSoft: "#ecfdf5", // emerald-50
    border: "#a7f3d0", // emerald-200
    dot: "#10b981", // emerald-500
    bar: "#10b981",
    ring: "rgba(16, 185, 129, 0.2)",
    solid: "linear-gradient(135deg, #059669, #047857)",
    chipBg: "#d1fae5",
    chipText: "#065f46"
  },
  sage: {
    text: "#0f766e", // teal-700
    bgSoft: "#f0fdfa", // teal-50
    border: "#99f6e4", // teal-200
    dot: "#14b8a6", // teal-500
    bar: "#14b8a6",
    ring: "rgba(20, 184, 166, 0.2)",
    solid: "linear-gradient(135deg, #0d9488, #0f766e)",
    chipBg: "#ccfbf1",
    chipText: "#115e59"
  },
  amber: {
    text: "#b45309", // amber-700
    bgSoft: "#fffbeb", // amber-50
    border: "#fde68a", // amber-200
    dot: "#f59e0b", // amber-500
    bar: "#f59e0b",
    ring: "rgba(245, 158, 11, 0.2)",
    solid: "linear-gradient(135deg, #d97706, #b45309)",
    chipBg: "#fef3c7",
    chipText: "#92400e"
  }
};

export default function AISystemCenter({ submissions, addLog, currentUser, navigateTo }) {
  const [activePhase, setActivePhase] = useState(CURRICULUM[0].id);
  const [doneLessons, setDoneLessons] = useState({}); // email_lessonId -> boolean
  const [expandedCards, setExpandedCards] = useState({}); // subjectName_phaseId -> boolean
  
  // AI Coach State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: 'Chào em! Thầy là AI Coach đồng hành cùng lộ trình của em. Hãy hỏi thầy bất cứ câu hỏi nào về các chương học để được giải đáp tức thì nhé! 🤖',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  const phaseRefs = useRef({});

  // Fetch checked lessons from localStorage on load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`edupath_done_lessons_${currentUser?.email || 'guest'}`);
      if (saved) {
        setDoneLessons(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Compute weak topics from test attempts
  const detectedWeaknesses = useMemo(() => {
    if (!submissions || submissions.length === 0) return [];
    const weakList = [];
    submissions.forEach(sub => {
      if (sub.score < 8) {
        sub.failedTopics?.forEach(topic => {
          if (!weakList.includes(topic)) weakList.push(topic);
        });
      }
    });
    return weakList;
  }, [submissions]);

  // Toggle lesson done state
  const handleToggleLesson = (lessonId, subjectName, chapterTitle) => {
    const key = `${currentUser?.email || 'guest'}_${lessonId}`;
    const nextState = {
      ...doneLessons,
      [key]: !doneLessons[key]
    };
    setDoneLessons(nextState);
    
    try {
      localStorage.setItem(`edupath_done_lessons_${currentUser?.email || 'guest'}`, JSON.stringify(nextState));
      const text = nextState[key] ? 'Đã hoàn thành' : 'Chưa hoàn thành';
      addLog(`Cập nhật tiến trình: ${text} bài học môn ${subjectName} - ${chapterTitle}`, 'sys');
    } catch (e) {
      console.error(e);
    }
  };

  // Helper calculations
  const getSubjectProgress = (subject, phaseId) => {
    let total = 0;
    let done = 0;
    subject.chapters.forEach(ch => {
      ch.lessons.forEach(l => {
        total++;
        const key = `${currentUser?.email || 'guest'}_${l.id}`;
        if (doneLessons[key]) done++;
      });
    });
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  };

  const getPhaseProgress = (phase) => {
    let total = 0;
    let done = 0;
    phase.subjects.forEach(s => {
      const sp = getSubjectProgress(s, phase.id);
      total += sp.total;
      done += sp.done;
    });
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  };

  const overall = useMemo(() => {
    let total = 0;
    let done = 0;
    CURRICULUM.forEach(p => {
      let phaseTotal = 0;
      let phaseDone = 0;
      p.subjects.forEach(s => {
        s.chapters.forEach(ch => {
          ch.lessons.forEach(l => {
            phaseTotal++;
            const key = `${currentUser?.email || 'guest'}_${l.id}`;
            if (doneLessons[key]) phaseDone++;
          });
        });
      });
      total += phaseTotal;
      done += phaseDone;
    });
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [doneLessons, currentUser]);

  const scrollTo = (id) => {
    setActivePhase(id);
    const element = phaseRefs.current[id];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const isCourseOwned = (courseId) => {
    if (!courseId) return false;
    if (courseId === 1) return true; // Free course
    return currentUser?.unlockedCourses?.includes(courseId);
  };

  const handleLearnClick = (courseId, lessonId) => {
    if (!courseId) return;
    if (isCourseOwned(courseId)) {
      if (navigateTo) {
        navigateTo(`/learn/${courseId}${lessonId ? `/lesson/${lessonId}` : ''}`);
      }
    } else {
      if (navigateTo) {
        navigateTo(`/courses/${courseId}`);
      }
    }
  };

  // Send message to AI Coach chatbot
  const handleSendChatMessage = async (presetText) => {
    const textToSend = presetText || chatInput;
    if (!textToSend.trim()) return;

    // Add user bubble
    const userMsg = {
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await api.chatbot(textToSend, []);
      const botMsg = {
        sender: 'bot',
        text: response || 'Thầy rất tiếc hệ thống AI Coach đang bận. Em thử lại sau nhé!',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error("AI Coach Error:", err);
      const errMsg = {
        sender: 'bot',
        text: 'Lỗi kết nối máy chủ AI. Em hãy ôn tập kỹ nội dung bài học lý thuyết và thử lại nhé!',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  // Export path to file
  const handleExportRoadmap = () => {
    let doc = `# BÁO CÁO LỘ TRÌNH HỌC TẬP THÍCH ỨNG AI - EDUPATH\n`;
    doc += `Học sinh: ${currentUser?.fullName || 'Học viên'}\n`;
    doc += `Email: ${currentUser?.email || ''}\n`;
    doc += `Thời gian xuất bản: ${new Date().toLocaleString('vi-VN')}\n\n`;
    doc += `Tổng quan hoàn thành: ${overall.done}/${overall.total} bài học (${overall.pct}%)\n`;
    doc += `====================================================\n\n`;

    CURRICULUM.forEach(phase => {
      const pp = getPhaseProgress(phase);
      doc += `## Giai đoạn: ${phase.label} (${pp.pct}% hoàn thành)\n`;
      doc += `* Thời gian: ${phase.period}\n`;
      doc += `* Trọng tâm: ${phase.tagline}\n\n`;

      phase.subjects.forEach(subject => {
        const sp = getSubjectProgress(subject, phase.id);
        doc += `  ### Môn học: ${subject.name} (Hoàn thành ${sp.done}/${sp.total} bài)\n`;
        
        subject.chapters.forEach(ch => {
          doc += `    - Chương: ${ch.title}\n`;
          ch.lessons.forEach(l => {
            const key = `${currentUser?.email || 'guest'}_${l.id}`;
            const status = doneLessons[key] ? '[x] Đã hoàn thành' : '[ ] Chưa hoàn thành';
            doc += `      * ${status} - ${l.title} (${l.duration} phút)\n`;
          });
        });
        doc += `\n`;
      });
      doc += `----------------------------------------------------\n\n`;
    });

    const blob = new Blob([doc], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Lo_trinh_on_thi_AI_${currentUser?.fullName || 'edupath'}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog(`Đã xuất file báo cáo lộ trình học tập cá nhân`, 'sys');
  };

  return (
    <div className="learning-path-container" style={{ backgroundColor: '#F5F1E8', color: '#292524', borderRadius: '24px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
      {/* 1. HERO HEADER */}
      <header className="learning-path-hero" style={{ 
        borderRadius: '24px', 
        border: '1px solid #a7f3d0', 
        background: 'linear-gradient(135deg, #ffffff 0%, rgba(236, 253, 245, 0.8) 100%)', 
        padding: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div style={{ flex: '1', minWidth: '280px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#d1fae5',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '700',
            color: '#065f46',
            letterSpacing: '0.5px',
            marginBottom: '12px'
          }}>
            <span style={{ width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%' }} />
            LỘ TRÌNH ÔN THI THPTQG CÁ NHÂN HÓA
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#1c1917', margin: '0 0 10px 0', lineHeight: '1.2' }}>
            Chinh phục kỳ thi THPT Quốc Gia<br />theo từng chặng khoa học
          </h1>
          <p style={{ fontSize: '13.5px', color: '#57534e', margin: 0, maxWidth: '600px', lineHeight: '1.6' }}>
            Chương trình ôn tập thiết kế 3 chặng vững chắc từ nền tảng đến về đích. 
            Hệ thống tự động chấm điểm yếu và cập nhật tiến trình ôn luyện.
          </p>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
            <button 
              onClick={handleExportRoadmap}
              className="btn-primary"
              style={{
                background: 'linear-gradient(135deg, #059669, #047857)',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)'
              }}
            >
              <HiDownload /> Xuất lộ trình (.MD)
            </button>
            
            <button
              onClick={() => handleSendChatMessage('Hãy gợi ý cho em phương pháp học tốt trong giai đoạn này')}
              style={{
                background: '#fff',
                color: '#44403c',
                border: '1px solid #d6d3d1',
                padding: '10px 20px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Lời khuyên học tập
            </button>
          </div>
        </div>

        {/* Circular gauge */}
        <div className="learning-path-overall-ring" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid #e7e5e4',
          borderRadius: '20px',
          padding: '20px',
          textAlign: 'center',
          minWidth: '150px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
        }}>
          <div style={{ position: 'relative', width: '100px', height: '100px' }}>
            <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f5f5f4" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#10b981"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={263.89}
                strokeDashoffset={263.89 - (263.89 * overall.pct) / 100}
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '22px', fontWeight: '900', color: '#1c1917' }}>{overall.pct}%</span>
              <span style={{ fontSize: '9px', color: '#78716c', fontWeight: '700', textTransform: 'uppercase' }}>Xong</span>
            </div>
          </div>
          <span style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#44403c', marginTop: '10px' }}>
            {overall.done}/{overall.total} bài học
          </span>
        </div>
      </header>

      {/* 2. DUAL COLUMN LAYOUT */}
      <div className="student-dashboard__row student-dashboard__row--mission" style={{ gridTemplateColumns: '260px 1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* Left Column: Sidebar Stages navigation */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #e7e5e4',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
          }}>
            <h3 style={{ fontSize: '11px', fontWeight: '800', color: '#78716c', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
              Các giai đoạn ôn luyện
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {CURRICULUM.map(phase => {
                const a = ACCENT_STYLES[phase.accent];
                const pp = getPhaseProgress(phase);
                const isActive = activePhase === phase.id;

                return (
                  <button
                    key={phase.id}
                    onClick={() => scrollTo(phase.id)}
                    className="learning-path-sidebar-btn"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      borderRadius: '12px',
                      border: `1.5px solid ${isActive ? a.border : 'transparent'}`,
                      padding: '10px 12px',
                      width: '100%',
                      textAlign: 'left',
                      background: isActive ? a.bgSoft : 'transparent',
                      color: isActive ? a.text : '#57534e',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: isActive ? a.dot : '#e7e5e4',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      {phase.order}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {phase.label.split('—')[1]?.trim() || phase.label}
                      </span>
                      <span style={{ display: 'block', fontSize: '10.5px', color: '#a8a29e' }}>
                        {pp.pct}% đã xong
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick AI Diagnostic Box */}
          <div style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '20px',
            padding: '20px'
          }}>
            <h4 style={{ fontSize: '12.5px', fontWeight: '850', color: '#065f46', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HiSparkles /> Chẩn đoán học lực AI
            </h4>
            <p style={{ fontSize: '11.5px', color: '#047857', lineHeight: '1.5', margin: '0 0 12px 0' }}>
              {detectedWeaknesses.length > 0 
                ? `AI phát hiện em đang có kết quả chưa tốt ở phần: ${detectedWeaknesses.join(', ')}. Hãy tập trung hoàn thành các chặng này.`
                : 'Tuyệt vời! Kết quả thi thử cho thấy em chưa bị hổng kiến thức nặng. Hãy bám sát lộ trình ôn tập!'
              }
            </p>
          </div>
        </aside>

        {/* Right Column: Timeline blocks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
          
          {/* Vertical connection line */}
          <div style={{
            position: 'absolute',
            left: '20px',
            top: '10px',
            bottom: '10px',
            width: '2px',
            background: 'linear-gradient(to bottom, #10b981 0%, #14b8a6 50%, #f59e0b 100%)',
            zIndex: 0
          }} />

          {CURRICULUM.map(phase => {
            const a = ACCENT_STYLES[phase.accent];
            const pp = getPhaseProgress(phase);

            return (
              <section 
                key={phase.id}
                ref={el => phaseRefs.current[phase.id] = el}
                style={{ position: 'relative', paddingLeft: '50px', zIndex: 1 }}
              >
                {/* Node circle */}
                <div style={{
                  position: 'absolute',
                  left: '0px',
                  top: '2px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: a.dot,
                  color: '#fff',
                  border: '4px solid #F5F1E8',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 'bold'
                }}>
                  {phase.order}
                </div>

                {/* Phase Title */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#1c1917', margin: 0 }}>
                      {phase.label}
                    </h2>
                    <span style={{
                      backgroundColor: a.chipBg,
                      color: a.chipText,
                      padding: '2px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '700'
                    }}>
                      {phase.period}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#57534e', margin: '4px 0 0 0' }}>
                    {phase.tagline}
                  </p>

                  {/* Progress bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                    <div style={{ flex: 1, height: '6px', backgroundColor: '#e7e5e4', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        background: a.solid,
                        borderRadius: '4px',
                        width: `${pp.pct}%`,
                        transition: 'width 0.7s ease'
                      }} />
                    </div>
                    <span style={{ fontSize: '12.5px', fontWeight: '800', color: a.text }}>
                      {pp.pct}%
                    </span>
                  </div>
                </div>

                {/* Subject Expandable Cards List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {phase.subjects.map(subject => {
                    const sp = getSubjectProgress(subject, phase.id);
                    const isCompleted = sp.pct === 100;
                    const cardKey = `${subject.name}_${phase.id}`;
                    const isOpen = !!expandedCards[cardKey];

                    return (
                      <div 
                        key={subject.name}
                        className="learning-path-subject-card"
                        style={{
                          backgroundColor: '#ffffff',
                          border: `1.5px solid ${isOpen ? a.border : '#e7e5e4'}`,
                          borderRadius: '16px',
                          overflow: 'hidden',
                          boxShadow: isOpen ? '0 4px 15px rgba(0,0,0,0.03)' : '0 2px 6px rgba(0,0,0,0.01)',
                          transition: 'all 0.2s'
                        }}
                      >
                        {/* Header trigger button */}
                        <button
                          onClick={() => setExpandedCards(prev => ({ ...prev, [cardKey]: !prev[cardKey] }))}
                          style={{
                            display: 'flex',
                            width: '100%',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '16px 20px',
                            border: 'none',
                            background: 'none',
                            textAlign: 'left',
                            cursor: 'pointer'
                          }}
                        >
                          {/* Subject icon */}
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: a.bgSoft,
                            color: a.text,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            flexShrink: 0
                          }}>
                            <SubjectIcon name={subject.icon} />
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <h4 style={{ fontSize: '15px', fontWeight: '850', color: '#1c1917', margin: 0 }}>
                                {subject.name}
                              </h4>
                              {isCompleted && (
                                <span style={{
                                  backgroundColor: '#d1fae5',
                                  color: '#065f46',
                                  fontSize: '9.5px',
                                  fontWeight: '700',
                                  padding: '2px 8px',
                                  borderRadius: '20px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '2px'
                                }}>
                                  ✓ Hoàn thành
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '11.5px', color: '#78716c' }}>
                              {sp.done}/{sp.total} bài học · {subject.chapters.length} chương
                            </span>
                          </div>

                          {/* Progress number & Chevron */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '800', color: a.text }}>
                              {sp.pct}%
                            </span>
                            <svg
                              style={{
                                width: '18px',
                                height: '18px',
                                color: '#a8a29e',
                                transform: isOpen ? 'rotate(180deg)' : 'none',
                                transition: 'transform 0.2s'
                              }}
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              viewBox="0 0 24 24"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M6 9l6 6 6-6" />
                            </svg>
                          </div>
                        </button>

                        {/* Collapsible Chapters */}
                        {isOpen && (
                          <div style={{ borderTop: '1px solid #f5f5f4', padding: '16px 20px', backgroundColor: '#fafaf9', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {subject.chapters.map((ch, chIdx) => {
                              // Check if AI detected poor accuracy on topics matching this chapter
                              const isWeak = detectedWeaknesses.some(w => ch.title.toLowerCase().includes(w.toLowerCase()));

                              return (
                                <div key={chIdx} style={{
                                  borderRadius: '12px',
                                  border: '1px solid #e7e5e4',
                                  backgroundColor: '#ffffff',
                                  padding: '16px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '12px'
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                                    <div>
                                      <h5 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1c1917', margin: 0 }}>
                                        Chương {chIdx + 1}: {ch.title}
                                      </h5>
                                      {isWeak && (
                                        <span style={{
                                          color: '#ef4444',
                                          fontSize: '10.5px',
                                          fontWeight: '700',
                                          display: 'inline-block',
                                          marginTop: '4px'
                                        }}>
                                          ⚠️ AI Cảnh báo: Tỉ lệ sai hỏng cao ở đề thi thử. Cần củng cố gấp!
                                        </span>
                                      )}
                                    </div>
                                    
                                    <button
                                      onClick={() => handleSendChatMessage(`Giúp em giải thích lý thuyết chương ${ch.title} môn ${subject.name}`)}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#059669',
                                        fontSize: '11.5px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        textDecoration: 'underline'
                                      }}
                                    >
                                      Hỏi AI Coach 🤖
                                    </button>
                                  </div>

                                  {/* List of lessons (Checklist chi tiết) */}
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '8px' }}>
                                    {ch.lessons.map(lesson => {
                                      const lessonKey = `${currentUser?.email || 'guest'}_${lesson.id}`;
                                      const isDone = !!doneLessons[lessonKey];
                                      const owned = isCourseOwned(lesson.courseId);

                                      return (
                                        <div 
                                          key={lesson.id} 
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            backgroundColor: '#f5f5f4',
                                            gap: '10px'
                                          }}
                                        >
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                                            <input
                                              type="checkbox"
                                              checked={isDone}
                                              onChange={() => handleToggleLesson(lesson.id, subject.name, ch.title)}
                                              style={{
                                                width: '16px',
                                                height: '16px',
                                                accentColor: '#10b981',
                                                cursor: 'pointer'
                                              }}
                                            />
                                            <span style={{ 
                                              fontSize: '12.5px', 
                                              color: isDone ? '#78716c' : '#44403c', 
                                              fontWeight: '600',
                                              textDecoration: isDone ? 'line-through' : 'none',
                                              whiteSpace: 'nowrap',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis'
                                            }}>
                                              {lesson.title}
                                            </span>
                                            <span style={{ fontSize: '10.5px', color: '#a8a29e', fontWeight: 'bold' }}>
                                              ⏱ {lesson.duration} phút
                                            </span>
                                          </div>

                                          {lesson.courseId && (
                                            <button
                                              onClick={() => handleLearnClick(lesson.courseId, lesson.lessonId)}
                                              style={{
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                border: '1px solid #d6d3d1',
                                                backgroundColor: owned ? '#ecfdf5' : '#ffffff',
                                                color: owned ? '#059669' : '#44403c',
                                                cursor: 'pointer'
                                              }}
                                            >
                                              {owned ? 'Học ngay 📖' : 'Xem khóa học 🛒'}
                                            </button>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

      </div>

      {/* 3. FLOATING OR INLINE CHATBOT FOR LEARNING PATH */}
      <section style={{
        marginTop: '40px',
        backgroundColor: '#ffffff',
        border: '1px solid #e7e5e4',
        borderRadius: '24px',
        padding: '24px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#1c1917', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HiSparkles style={{ color: '#f59e0b' }} /> TRỢ LÝ AI COACH ÔN THI
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
          
          {/* Chat bubbles viewport */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              height: '240px',
              overflowY: 'auto',
              border: '1px solid #e7e5e4',
              borderRadius: '16px',
              padding: '16px',
              backgroundColor: '#fafaf9',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {chatMessages.map((msg, idx) => {
                const isBot = msg.sender === 'bot';
                return (
                  <div
                    key={idx}
                    style={{
                      alignSelf: isBot ? 'flex-start' : 'flex-end',
                      maxWidth: '80%',
                      backgroundColor: isBot ? '#ffffff' : '#e6f4ea',
                      color: isBot ? '#44403c' : '#047857',
                      padding: '10px 14px',
                      borderRadius: isBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                      border: `1px solid ${isBot ? '#e7e5e4' : '#a7f3d0'}`,
                      fontSize: '12.5px',
                      lineHeight: '1.6',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.01)'
                    }}
                  >
                    <div>{msg.text}</div>
                    <div style={{ fontSize: '9px', color: '#a8a29e', marginTop: '4px', textAlign: 'right' }}>
                      {msg.time}
                    </div>
                  </div>
                );
              })}
              {chatLoading && (
                <div style={{ alignSelf: 'flex-start', padding: '8px 12px', background: '#ffffff', border: '1px solid #e7e5e4', borderRadius: '10px', fontSize: '12px', color: '#a8a29e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div className="progress-spinner" style={{ width: '12px', height: '12px', border: '2px solid #e7e5e4', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <span>AI Coach đang phân tích câu hỏi...</span>
                </div>
              )}
            </div>

            {/* Input row */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendChatMessage()}
                placeholder="Nhập câu hỏi lý thuyết hoặc bài tập để hỏi thầy cô AI Coach..."
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #d6d3d1',
                  fontSize: '13px',
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
                disabled={chatLoading}
              />
              <button
                onClick={() => handleSendChatMessage()}
                className="btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  color: '#fff',
                  border: 'none',
                  padding: '0 20px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                disabled={chatLoading}
              >
                <HiPaperAirplane style={{ transform: 'rotate(90deg)' }} /> Gửi
              </button>
            </div>
          </div>

          {/* Quick presets list */}
          <div style={{
            border: '1px solid #e7e5e4',
            borderRadius: '16px',
            padding: '16px',
            backgroundColor: '#fafaf9',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              💡 Câu hỏi gợi ý ôn luyện
            </span>
            <button
              onClick={() => handleSendChatMessage('Em hãy hướng dẫn cách nhớ nhanh bảng xét dấu đạo hàm?')}
              style={{ fontSize: '11.5px', textAlign: 'left', background: '#ffffff', border: '1px solid #e7e5e4', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', color: '#44403c', fontWeight: '600', transition: 'all 0.2s' }}
            >
              • Cách nhớ nhanh bảng xét dấu đạo hàm?
            </button>
            <button
              onClick={() => handleSendChatMessage('Làm sao tính nhanh chu kỳ con lắc đơn chịu lực quán tính?')}
              style={{ fontSize: '11.5px', textAlign: 'left', background: '#ffffff', border: '1px solid #e7e5e4', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', color: '#44403c', fontWeight: '600', transition: 'all 0.2s' }}
            >
              • Con lắc đơn chịu lực quán tính?
            </button>
            <button
              onClick={() => handleSendChatMessage('Mẹo giải nhanh các câu hỏi câu điều kiện Tiếng Anh?')}
              style={{ fontSize: '11.5px', textAlign: 'left', background: '#ffffff', border: '1px solid #e7e5e4', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', color: '#44403c', fontWeight: '600', transition: 'all 0.2s' }}
            >
              • Mẹo làm câu điều kiện Tiếng Anh?
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}

/* ─── SUBJECT ICONS ─── */
function SubjectIcon({ name }) {
  const paths = {
    math: (
      <>
        <path d="M4 7h16M4 7l3 3M4 7l3-3" />
        <path d="M4 17h7M15 14l5 5M20 14l-5 5" />
      </>
    ),
    book: (
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z" />
    ),
    lang: (
      <>
        <path d="M3 5h12M9 3v2M11 5c-.6 4-2.5 7-7 9M5 9c1.5 3 4 5 7 6" />
        <path d="M14 21l4-9 4 9M15.5 17h5" />
      </>
    ),
    physics: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M3 12a9 9 0 1 0 18 0A9 9 0 0 0 3 12z" />
        <path d="M12 3a9 9 0 0 0-9 9h18a9 9 0 0 0-9-9z" />
      </>
    ),
    chemistry: (
      <>
        <path d="M10 2v4M14 2v4M8 6h8M6.5 20h11l-3.5-9V6H10v5z" />
      </>
    )
  };
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
      {paths[name] || paths['book']}
    </svg>
  );
}
