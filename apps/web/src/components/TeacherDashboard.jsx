import { useState, useEffect, useRef } from 'react';
import { toast } from '../utils/toast';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  HiChartBar, 
  HiBookOpen, 
  HiDatabase, 
  HiCollection, 
  HiTrendingUp, 
  HiUsers, 
  HiCurrencyDollar, 
  HiPlus, 
  HiTrash, 
  HiCheck, 
  HiPlusCircle, 
  HiArrowUp, 
  HiArrowDown, 
  HiEye, 
  HiDownload, 
  HiUpload, 
  HiPencil, 
  HiAcademicCap,
  HiClipboardList,
  HiBriefcase,
  HiHome,
  HiUser,
  HiStar,
  HiFire,
  HiBell,
  HiCog,
  HiQuestionMarkCircle,
  HiSearch,
  HiChevronRight
} from 'react-icons/hi';
import { api } from '../api';
import '../styles/teacherDashboard.css';

export default function TeacherDashboard({
  currentUser,
  courses: initialCourses,
  onCreateCourse,
  onDeleteCourse,
  questionBank: initialQuestionBank,
  onAddQuestion,
  addLog,
  activeTab: propActiveTab = 'overview',
  setActiveTab,
  onUpdateUser
}) {
  // --- SUB TAB SYSTEM ---
  const [localTab, setLocalTab] = useState(() => {
    if (propActiveTab === 'home' || propActiveTab === 'overview') return 'overview';
    if (propActiveTab === 'questions') return 'questions';
    if (propActiveTab === 'stats' || propActiveTab === 'students') return 'students';
    return propActiveTab; // courses, exams, revenue, etc.
  });

  const handleTabChange = (tab) => {
    setLocalTab(tab);
    if (setActiveTab) {
      if (tab === 'overview') setActiveTab('home');
      else if (tab === 'questions') setActiveTab('questions');
      else if (tab === 'students') setActiveTab('stats');
      else setActiveTab(tab);
    }
  };

  // --- STATE STORES ---
  const [courses, setCourses] = useState(initialCourses || []);
  const [questionBank, setQuestionBank] = useState(initialQuestionBank || []);
  const [activeCoursePreview, setActiveCoursePreview] = useState(null);

  // --- DATABASE DRIVEN STATES ---
  const [dbStats, setDbStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const loadTeacherStats = async () => {
    try {
      setLoadingStats(true);
      const data = await api.getTeacherStats();
      if (data) {
        setDbStats(data);
        if (data.classesList) {
          setTeacherClasses(data.classesList);
        }
        if (data.recentMaterialsList) {
          const mappedMaterials = data.recentMaterialsList.map(m => ({
            id: m.id,
            name: m.name,
            type: m.type.toLowerCase(),
            size: m.size,
            date: m.date
          }));
          setTeacherMaterials(mappedMaterials);
        }
        if (data.studentsList) {
          setStudents(data.studentsList);
        }
      }
    } catch (err) {
      console.error('Failed to load teacher stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Sync props
  useEffect(() => {
    if (initialCourses) setCourses(initialCourses);
  }, [initialCourses]);

  useEffect(() => {
    if (initialQuestionBank) setQuestionBank(initialQuestionBank);
  }, [initialQuestionBank]);

  // --- OVERVIEW: Essay Review State ---
  const [essays, setEssays] = useState([
    { id: 1, studentName: 'Trần Minh Hoàng', topic: 'Nghị luận văn học bài thơ Tây Tiến', date: 'Hôm nay', answer: 'Tây Tiến của Quang Dũng đã khắc họa bức tranh thiên nhiên miền Tây hùng vĩ dữ dội và vẻ đẹp người lính hào hoa bi tráng. Em tâm đắc nhất hình ảnh đoàn binh không mọc tóc...', score: '', comment: '' },
    { id: 2, studentName: 'Vũ Quốc Đạt', topic: 'Phân tích nhân vật Tràng trong Vợ Nhặt', date: 'Hôm qua', answer: 'Nhân vật Tràng đại diện cho người nông dân nghèo trước Cách mạng. Qua hình ảnh nhặt vợ giữa ngày đói, Kim Lân thể hiện khát vọng sống mãnh liệt...', score: '', comment: '' }
  ]);
  const [reviewScore, setReviewScore] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [selectedEssayId, setSelectedEssayId] = useState(null);

  // --- QUESTION BANK: CRUD, Filters, Excel Import ---
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [qText, setQText] = useState('');
  const [qSubject, setQSubject] = useState('Toán học');
  const [qTopic, setQTopic] = useState('Hàm số');
  const [qDiff, setQDiff] = useState('MEDIUM');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [qCorrect, setQCorrect] = useState('A');
  const [excelImporting, setExcelImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  // --- COURSES: Lesson Reorder & Student Preview ---
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  // --- EXAMS: Builder & Stats ---
  const [exams, setExams] = useState([]);
  const [examTitle, setExamTitle] = useState('');
  const [examSubject, setExamSubject] = useState('Toán học');
  const [examDuration, setExamDuration] = useState('90');
  const [examGrade, setExamGrade] = useState('12');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [examSubTab, setExamSubTab] = useState('list'); // list, build, moderate

  // --- STUDENTS: Enrolled directory ---
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // --- REVENUE: breakdowns ---
  const revenueSummary = {
    grossEarnings: '38.600.000đ',
    netEarnings: '30.880.000đ', // 80% payout
    payoutRate: '80%',
    pendingPayout: '4.500.000đ',
    nextPayoutDate: '30/06/2026'
  };

  const invoices = [
    { id: 'INV-091', studentName: 'Nguyễn Minh Anh', courseName: 'Chuyên đề Tích phân & Giải tích 12', date: '15/06/2026', amount: '599.000đ', commission: '119.800đ' },
    { id: 'INV-088', studentName: 'Lê Hải Nam', courseName: 'Chuyên đề Tích phân & Giải tích 12', date: '14/06/2026', amount: '599.000đ', commission: '119.800đ' },
    { id: 'INV-085', studentName: 'Phạm Khánh Huyền', courseName: 'Khóa học tiếng Anh THPTQG 9+', date: '12/06/2026', amount: '699.000đ', commission: '139.800đ' },
    { id: 'INV-082', studentName: 'Vũ Quốc Đạt', courseName: 'Khóa học lý thuyết Vật lý 12', date: '10/06/2026', amount: '499.000đ', commission: '99.800đ' }
  ];

  // --- OVERVIEW: Chart data & Heatmap matrix ---
  const enrollmentChartData = [
    { name: 'T1', students: 18 },
    { name: 'T2', students: 32 },
    { name: 'T3', students: 54 },
    { name: 'T4', students: 88 },
    { name: 'T5', students: 115 },
    { name: 'T6', students: 148 }
  ];

  const revenueChartData = [
    { name: 'T1', revenue: 8.5 },
    { name: 'T2', revenue: 12.0 },
    { name: 'T3', revenue: 19.5 },
    { name: 'T4', revenue: 27.2 },
    { name: 'T5', revenue: 31.8 },
    { name: 'T6', revenue: 38.6 }
  ];

  const heatmapData = {
    students: ['Nguyễn Minh Anh', 'Lê Hải Nam', 'Phạm Khánh Huyền', 'Nguyễn Đức Thắng'],
    exams: ['Toán khảo sát', 'Toán giải tích', 'Lý dao động', 'Lý sóng cơ'],
    matrix: [
      [9.2, 8.4, 7.8, 8.0], // student 1
      [7.5, 6.8, 8.2, 7.0], // student 2
      [9.8, 9.5, 9.0, 9.2], // student 3
      [5.5, 6.0, 5.0, 4.5], // student 4
    ]
  };

  // --- TEACHER REDESIGN STATES ---
  const [teacherMaterials, setTeacherMaterials] = useState([]);
  const [materialSearch, setMaterialSearch] = useState('');
  
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [newClassName, setNewClassName] = useState('');
  const [newClassId, setNewClassId] = useState('');

  const avatarInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [teacherName, setTeacherName] = useState(currentUser?.fullName || 'Thầy Nguyễn Thế Anh');
  const [teacherPhone, setTeacherPhone] = useState(currentUser?.phone || '0987654321');
  const [teacherEmail, setTeacherEmail] = useState(currentUser?.email || 'theanh.math@edupath.vn');
  const [teacherBio, setTeacherBio] = useState(currentUser?.teacher?.bio || 'Giảng viên chuyên ôn Toán THPTQG với 12 năm kinh nghiệm.');

  useEffect(() => {
    if (currentUser) {
      setTeacherName(currentUser.fullName || '');
      setTeacherPhone(currentUser.phone || '');
      setTeacherEmail(currentUser.email || '');
      setTeacherBio(currentUser.teacher?.bio || '');
    }
  }, [currentUser]);

  const teacherLeaderboard = [
    { rank: 1, name: 'Thầy Nguyễn Thế Anh', coursesCount: 5, rating: 4.9, activeStudents: 245, points: 1250 },
    { rank: 2, name: 'Cô Lê Thu Hương', coursesCount: 4, rating: 4.8, activeStudents: 198, points: 1080 },
    { rank: 3, name: 'Cô Phạm Quỳnh Chi', coursesCount: 4, rating: 4.7, activeStudents: 185, points: 950 },
    { rank: 4, name: 'Thầy Nguyễn Văn Chờ', coursesCount: 2, rating: 4.5, activeStudents: 88, points: 420 }
  ];

  const getVietnameseDate = () => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const now = new Date();
    const dayName = days[now.getDay()];
    const dateStr = now.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return `${dayName}, ${dateStr}`;
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await api.uploadFile(file);
      if (res && res.url) {
        const updatedUser = await api.updateProfile({ avatarUrl: res.url });
        if (onUpdateUser) {
          onUpdateUser(updatedUser);
        }
        toast('Cập nhật ảnh đại diện thành công!', 'success');
      }
    } catch (err) {
      console.error('[Avatar Upload Error]', err);
      toast('Tải ảnh lên thất bại, vui lòng thử lại!', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = await api.updateProfile({
        fullName: teacherName,
        phone: teacherPhone,
        bio: teacherBio
      });
      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }
      toast('Cập nhật thông tin hồ sơ thành công!', 'success');
    } catch (err) {
      console.error('[Profile Update Submit Error]', err);
      toast('Cập nhật hồ sơ thất bại, vui lòng thử lại!', 'error');
    }
  };

  const handleCreateClass = (e) => {
    e.preventDefault();
    if (!newClassName.trim() || !newClassId.trim()) {
      toast('Vui lòng nhập tên lớp và mã lớp!', 'warning');
      return;
    }
    const newClass = {
      id: newClassId.toUpperCase(),
      name: newClassName,
      students: 0,
      pendingHomework: 0,
      progress: 0,
      avgScore: 0.0,
      schedule: 'Chưa sắp xếp'
    };
    setTeacherClasses([...teacherClasses, newClass]);
    setNewClassName('');
    setNewClassId('');
    toast(`Tạo lớp học ${newClassName} (${newClassId.toUpperCase()}) thành công!`, 'success');
  };

  const handleUploadMaterial = (e) => {
    e.preventDefault();
    toast('Tải lên tài liệu thành công!', 'success');
    const newMat = {
      id: teacherMaterials.length + 1,
      name: 'Tài liệu mới tải lên_' + Date.now().toString().slice(-4),
      type: 'pdf',
      size: '1.2 MB',
      date: new Date().toLocaleDateString('vi-VN')
    };
    setTeacherMaterials([newMat, ...teacherMaterials]);
  };

  // --- HANDLERS ---
  const fileInputRef = useRef(null);

  const handleUploadExamJson = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const json = JSON.parse(evt.target.result);
          const imported = await api.importExam(json);
          toast(`Nhập đề thi "${imported.title}" thành công! Trạng thái: Chờ duyệt.`, 'success');
          addLog(`Nhập đề thi mới: ${imported.title}`, 'sys');
          loadExamsList();
        } catch (err) {
          toast(`Lỗi import: ${err.message}`, 'error');
        }
      };
      reader.readAsText(file);
    } catch (err) {
      toast('Không thể đọc file!', 'error');
    }
  };

  const handleApproveExam = async (examId) => {
    try {
      await api.updateExamStatus(examId, 'published');
      toast('Phê duyệt đề thi thành công! Đề thi đã được phát hành tới học sinh.', 'success');
      addLog(`Phê duyệt đề thi ID #${examId}`, 'sys');
      loadExamsList();
    } catch (err) {
      toast(`Lỗi phê duyệt: ${err.message}`, 'error');
    }
  };

  const loadExamsList = async () => {
    try {
      const data = await api.getExams();
      if (data && data.length > 0) {
        const mapped = data.map(e => ({
          id: e.id,
          title: e.title,
          subject: e.subject,
          duration: e.duration || 90,
          questionCount: e.questions?.length || e.examQuestions?.length || 0,
          attempts: e.attempts?.length || 0,
          avgScore: e.attempts && e.attempts.length > 0 ? Number((e.attempts.reduce((acc, a) => acc + (a.score || 0), 0) / e.attempts.length).toFixed(1)) : 0,
          maxScore: e.attempts && e.attempts.length > 0 ? Number(Math.max(...e.attempts.map(a => a.score || 0)).toFixed(1)) : 0,
          status: e.status || 'published',
          grade: e.grade
        }));
        setExams(mapped);
      } else {
        const saved = localStorage.getItem('teacher_created_exams');
        const fallback = saved ? JSON.parse(saved) : [
          { id: 101, title: 'Đề thi thử THPTQG Toán học số 1', subject: 'Toán học', duration: 90, questionCount: 50, attempts: 24, avgScore: 7.6, maxScore: 9.8, status: 'published', grade: 12 },
          { id: 102, title: 'Đề khảo sát Chất lượng Vật lý kì 1', subject: 'Vật lý', duration: 50, questionCount: 40, attempts: 18, avgScore: 6.8, maxScore: 9.5, status: 'published', grade: 11 }
        ];
        setExams(fallback);
      }
    } catch (err) {
      console.error('Failed to load exams in TeacherDashboard:', err);
    }
  };

  useEffect(() => {
    loadTeacherStats();
    loadExamsList();
  }, []);

  const excelPct = dbStats?.scoreDistribution?.excelPct ?? 18;
  const goodPct = dbStats?.scoreDistribution?.goodPct ?? 32;
  const fairPct = dbStats?.scoreDistribution?.fairPct ?? 28;
  const avgPct = dbStats?.scoreDistribution?.avgPct ?? 18;
  const weakPct = dbStats?.scoreDistribution?.weakPct ?? 6;
  const averageScore = dbStats?.scoreDistribution?.averageScore ?? 7.85;

  const offset1 = 25;
  const offset2 = (offset1 - excelPct + 100) % 100;
  const offset3 = (offset2 - goodPct + 100) % 100;
  const offset4 = (offset3 - fairPct + 100) % 100;
  const offset5 = (offset4 - avgPct + 100) % 100;


  const handleGradeEssay = (e) => {
    e.preventDefault();
    if (!reviewScore || !reviewComment) {
      toast('Vui lòng nhập điểm và lời bình xét duyệt!', 'warning');
      return;
    }
    setEssays(essays.filter(ess => ess.id !== selectedEssayId));
    setSelectedEssayId(null);
    setReviewScore('');
    setReviewComment('');
    addLog(`Giáo viên chấm điểm luận: ${reviewScore}/10`, 'sys');
    toast('Chấm điểm và gửi nhận xét thành công!', 'success');
  };

  const handleAddQuestionLocal = (e) => {
    e.preventDefault();
    if (!qText.trim() || !optA || !optB || !optC || !optD) {
      toast('Vui lòng điền đầy đủ câu hỏi và 4 đáp án!', 'warning');
      return;
    }

    const newQ = {
      id: questionBank.length + 1,
      content: qText,
      question: qText, // compatibility
      options: [
        { key: 'A', value: optA },
        { key: 'B', value: optB },
        { key: 'C', value: optC },
        { key: 'D', value: optD }
      ],
      correctAnswer: qCorrect,
      difficulty: qDiff,
      topic: qTopic,
      subject: qSubject,
      successRate: '85%'
    };

    if (onAddQuestion) {
      onAddQuestion(newQ);
    } else {
      setQuestionBank([newQ, ...questionBank]);
    }

    setQText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    toast('Thêm câu hỏi mới thành công!', 'success');
  };

  const handleExcelImport = () => {
    setExcelImporting(true);
    setImportProgress(0);
    const interval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setExcelImporting(false);
          // Insert 2 mock questions
          const mockQ = [
            { id: questionBank.length + 1, content: 'Tìm nguyên hàm của hàm số f(x) = e^2x.', options: [{key:'A',value:'1/2 e^2x + C'},{key:'B',value:'e^2x + C'},{key:'C',value:'2e^2x + C'},{key:'D',value:'e^x + C'}], correctAnswer: 'A', difficulty: 'EASY', topic: 'Tích phân', subject: 'Toán học', successRate: '92%' },
            { id: questionBank.length + 2, content: 'Một vật dao động điều hòa với chu kì T = 2s. Tần số góc của vật là:', options: [{key:'A',value:'pi rad/s'},{key:'B',value:'2pi rad/s'},{key:'C',value:'0.5pi rad/s'},{key:'D',value:'4pi rad/s'}], correctAnswer: 'A', difficulty: 'EASY', topic: 'Dao động cơ', subject: 'Vật lý', successRate: '88%' }
          ];
          setQuestionBank([...mockQ, ...questionBank]);
          toast('Nhập dữ liệu Excel thành công! Đã thêm 2 câu hỏi mới.', 'success');
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  const moveLesson = (courseId, lessonIndex, direction) => {
    const targetCourse = courses.find(c => c.id === courseId);
    if (!targetCourse) return;

    const lessons = [...targetCourse.lessons];
    const newIdx = lessonIndex + direction;
    if (newIdx < 0 || newIdx >= lessons.length) return;

    // swap order keys
    const temp = lessons[lessonIndex];
    lessons[lessonIndex] = lessons[newIdx];
    lessons[newIdx] = temp;

    const updatedCourses = courses.map(c => {
      if (c.id === courseId) {
        return { ...c, lessons };
      }
      return c;
    });

    setCourses(updatedCourses);
    toast('Đã thay đổi thứ tự bài học thành công!', 'success');
  };

  const handleToggleQuestionSelect = (qId) => {
    if (selectedQuestions.includes(qId)) {
      setSelectedQuestions(selectedQuestions.filter(id => id !== qId));
    } else {
      setSelectedQuestions([...selectedQuestions, qId]);
    }
  };

  const handleBuildExam = async (e) => {
    e.preventDefault();
    if (!examTitle.trim()) {
      toast('Vui lòng điền tiêu đề đề thi!', 'warning');
      return;
    }
    if (selectedQuestions.length === 0) {
      toast('Vui lòng chọn ít nhất 1 câu hỏi từ ngân hàng!', 'warning');
      return;
    }

    try {
      const mappedQuestions = selectedQuestions.map((qId, idx) => {
        const q = questionBank.find(item => item.id === qId);
        if (!q) return null;
        
        const optionsArray = Array.isArray(q.options) ? q.options : [];
        const mappedOpts = optionsArray.map(opt => {
          const key = opt.key || opt.label || '';
          const value = opt.value || opt.text || '';
          return {
            option_label: key,
            option_text: value,
            is_correct: key === q.correctAnswer
          };
        });

        return {
          question_number: idx + 1,
          question_text: q.content || q.question || '',
          question_type: 'multiple_choice',
          difficulty: q.difficulty || 'MEDIUM',
          explanation: q.explanation || '',
          topic: q.topic || 'Chung',
          options: mappedOpts,
          question_image_url: q.imageUrl || q.question_image_url || null,
          audio_url: q.audioUrl || q.audio_url || null
        };
      }).filter(Boolean);

      const subjectSlug = examSubject === 'Toán học' ? 'toan-hoc' :
                          examSubject === 'Vật lý' ? 'vat-ly' :
                          examSubject === 'Hóa học' ? 'hoa-hoc' : 'tieng-anh';

      const examData = {
        title: examTitle,
        subject_slug: subjectSlug,
        subject_name: examSubject,
        year: new Date().getFullYear(),
        exam_code: 'EXAM_' + Date.now().toString().slice(-6),
        exam_type: 'internal',
        source: 'Giáo viên tự tạo',
        duration_minutes: Number(examDuration),
        total_questions: mappedQuestions.length,
        description: `Đề kiểm tra tự biên soạn môn ${examSubject}`,
        grade: Number(examGrade),
        questions: mappedQuestions
      };

      const res = await api.importExam(examData);
      toast(`Soạn đề thi thành công! ID đề: #${res.examId}. Trạng thái: Chờ duyệt.`, 'success');
      
      setExamTitle('');
      setSelectedQuestions([]);
      setExamSubTab('list');
      loadExamsList();
    } catch (err) {
      console.error(err);
      toast(`Lỗi khi tạo đề thi: ${err.message}`, 'error');
    }
  };

  const filteredQuestions = questionBank.filter(q => {
    const textMatch = q.content?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      q.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      q.topic?.toLowerCase().includes(searchQuery.toLowerCase());
    const subjectMatch = filterSubject === 'All' || q.subject === filterSubject;
    const diffMatch = filterDifficulty === 'All' || q.difficulty === filterDifficulty;
    return textMatch && subjectMatch && diffMatch;
  });

  return (
    <div className="teacher-dashboard-layout">
      {/* LEFT SIDEBAR */}
      <aside className="tdb-left-sidebar">
        <div className="tdb-logo-section">
          <div className="tdb-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '20px', height: '20px' }}>
              <path d="M18 6H8.5a4 4 0 100 8h8" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 10H8.5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="18" cy="6" r="1.5" fill="#FFD234" />
              <circle cx="16.5" cy="14" r="1.5" fill="#FFD234" />
            </svg>
          </div>
          <span className="tdb-logo-text">EduPath <em>AI</em></span>
        </div>

        {/* Menu Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
          <ul className="tdb-menu-list">
            <button 
              className={`tdb-menu-item ${localTab === 'overview' ? 'active' : ''}`}
              onClick={() => handleTabChange('overview')}
            >
              <span className="tdb-menu-icon"><HiHome /></span>
              <span>Tổng quan</span>
            </button>
          </ul>

          <div className="tdb-menu-category">Giảng dạy</div>
          <ul className="tdb-menu-list">
            <button 
              className={`tdb-menu-item ${localTab === 'courses' ? 'active' : ''}`}
              onClick={() => handleTabChange('courses')}
            >
              <span className="tdb-menu-icon"><HiAcademicCap /></span>
              <span>Khóa học của tôi</span>
            </button>
            <button 
              className={`tdb-menu-item ${localTab === 'materials' ? 'active' : ''}`}
              onClick={() => handleTabChange('materials')}
            >
              <span className="tdb-menu-icon"><HiCollection /></span>
              <span>Tài liệu giảng dạy</span>
            </button>
            <button 
              className={`tdb-menu-item ${localTab === 'exams' ? 'active' : ''}`}
              onClick={() => handleTabChange('exams')}
            >
              <span className="tdb-menu-icon"><HiClipboardList /></span>
              <span>Đề thi & Bài kiểm tra</span>
            </button>
            <button 
              className={`tdb-menu-item ${localTab === 'questions' ? 'active' : ''}`}
              onClick={() => handleTabChange('questions')}
            >
              <span className="tdb-menu-icon"><HiDatabase /></span>
              <span>Ngân hàng câu hỏi</span>
            </button>
          </ul>

          <div className="tdb-menu-category">Quản lý lớp học</div>
          <ul className="tdb-menu-list">
            <button 
              className={`tdb-menu-item ${localTab === 'classes' ? 'active' : ''}`}
              onClick={() => handleTabChange('classes')}
            >
              <span className="tdb-menu-icon"><HiBriefcase /></span>
              <span>Lớp học của tôi</span>
            </button>
            <button 
              className={`tdb-menu-item ${localTab === 'students' ? 'active' : ''}`}
              onClick={() => handleTabChange('students')}
            >
              <span className="tdb-menu-icon"><HiUsers /></span>
              <span>Học sinh</span>
            </button>
          </ul>

          <div className="tdb-menu-category">Công cụ hỗ trợ</div>
          <ul className="tdb-menu-list">
            <button 
              className={`tdb-menu-item ${localTab === 'leaderboard' ? 'active' : ''}`}
              onClick={() => handleTabChange('leaderboard')}
            >
              <span className="tdb-menu-icon"><HiChartBar /></span>
              <span>Bảng xếp hạng</span>
            </button>
            <button 
              className={`tdb-menu-item ${localTab === 'notifications' ? 'active' : ''}`}
              onClick={() => handleTabChange('notifications')}
            >
              <span className="tdb-menu-icon"><HiBell /></span>
              <span>Thông báo</span>
              {essays.length > 0 && <span className="tdb-icon-badge" style={{ position: 'relative', top: 0, right: 0, marginLeft: 'auto', width: '18px', height: '18px' }}>{essays.length}</span>}
            </button>
          </ul>

          <div className="tdb-menu-category">Khác</div>
          <ul className="tdb-menu-list">
            <button 
              className={`tdb-menu-item ${localTab === 'settings' ? 'active' : ''}`}
              onClick={() => handleTabChange('settings')}
            >
              <span className="tdb-menu-icon"><HiCog /></span>
              <span>Cài đặt</span>
            </button>
            <button 
              className={`tdb-menu-item ${localTab === 'help' ? 'active' : ''}`}
              onClick={() => handleTabChange('help')}
            >
              <span className="tdb-menu-icon"><HiQuestionMarkCircle /></span>
              <span>Trợ giúp</span>
            </button>
          </ul>
        </nav>

        {/* Upgrade Card */}
        <div className="tdb-upgrade-card">
          <span className="tdb-upgrade-cap">🎓</span>
          <h4 className="tdb-upgrade-title">Nâng cấp tài khoản</h4>
          <p className="tdb-upgrade-desc">Trải nghiệm đầy đủ tính năng dành cho giáo viên.</p>
          <button className="tdb-upgrade-btn" onClick={() => toast('Tính năng nâng cấp tài khoản đang được phát triển!', 'info')}>
            Nâng cấp ngay 🌟
          </button>
        </div>
      </aside>

      {/* RIGHT PANE: CONTENT AREA */}
      <main className="tdb-content-pane">
        {/* Top Header Row */}
        <div className="tdb-header-bar">
          <div style={{ textAlign: 'left' }}>
            <h1 className="tdb-greeting-title">
              Xin chào, {currentUser?.fullName || 'Thầy Nguyễn Thế Anh'}! 👋
            </h1>
            <p className="tdb-greeting-subtitle">Chào mừng bạn quay trở lại với EduPath AI</p>
          </div>

          <div className="tdb-header-actions">
            {/* Search Input with Ctrl+K shortcut badge */}
            <div className="tdb-search-wrap">
              <span className="tdb-search-icon"><HiSearch /></span>
              <input 
                type="text" 
                placeholder="Tìm kiếm khóa học, học sinh, tài liệu..." 
                className="tdb-search-input" 
                onClick={() => toast('Tính năng tìm kiếm đang phát triển!', 'info')}
              />
              <kbd className="tdb-search-kbd">Ctrl + K</kbd>
            </div>

            {/* Notification Bell Icon */}
            <button 
              className="tdb-action-icon-btn" 
              onClick={() => handleTabChange('notifications')}
              title="Thông báo mới"
            >
              <HiBell />
              {essays.length > 0 && <span className="tdb-icon-badge">{essays.length}</span>}
            </button>

            {/* Profile Avatar & Info */}
            <div className="tdb-header-user">
              {currentUser?.avatarUrl || currentUser?.avatar ? (
                <img 
                  src={currentUser.avatarUrl || currentUser.avatar} 
                  alt="Avatar" 
                  className="tdb-header-user-avatar"
                />
              ) : (
                <div 
                  className="tdb-header-user-avatar"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #a5b4fc)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  {(currentUser?.fullName || currentUser?.name || 'GV').slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="tdb-header-user-text">
                <h5 className="tdb-header-user-name">{currentUser?.fullName || 'Thầy Nguyễn Thế Anh'}</h5>
                <p className="tdb-header-user-role">Giáo viên</p>
              </div>
            </div>

            {/* Date Widget */}
            <div className="tdb-date-widget">
              {getVietnameseDate()}
            </div>
          </div>
        </div>

        {/* ================= TAB 1: OVERVIEW ================= */}
        {localTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Metrics Grid */}
            <div className="tdb-metrics-grid">
              <div className="tdb-metric-card">
                <div className="tdb-metric-icon-wrap purple"><HiBookOpen /></div>
                <div className="tdb-metric-info">
                  <span className="tdb-metric-label">Khóa học đang dạy</span>
                  <span className="tdb-metric-value">{dbStats?.metrics?.coursesCount ?? courses.length}</span>
                  <span className="tdb-metric-trend">↑ Dữ liệu thực tế</span>
                </div>
              </div>

              <div className="tdb-metric-card">
                <div className="tdb-metric-icon-wrap green"><HiUsers /></div>
                <div className="tdb-metric-info">
                  <span className="tdb-metric-label">Tổng số học sinh</span>
                  <span className="tdb-metric-value">{dbStats?.metrics?.studentsCount ?? 0}</span>
                  <span className="tdb-metric-trend">↑ Từ các lớp đăng ký</span>
                </div>
              </div>

              <div className="tdb-metric-card">
                <div className="tdb-metric-icon-wrap orange"><HiAcademicCap /></div>
                <div className="tdb-metric-info">
                  <span className="tdb-metric-label">Đề thi đã tạo</span>
                  <span className="tdb-metric-value">{dbStats?.metrics?.examsCount ?? exams.length}</span>
                  <span className="tdb-metric-trend">↑ Luyện tập & khảo sát</span>
                </div>
              </div>

              <div className="tdb-metric-card">
                <div className="tdb-metric-icon-wrap blue"><HiCollection /></div>
                <div className="tdb-metric-info">
                  <span className="tdb-metric-label">Tài liệu đã đăng</span>
                  <span className="tdb-metric-value">{dbStats?.metrics?.materialsCount ?? 0}</span>
                  <span className="tdb-metric-trend">↑ Học liệu lưu hành</span>
                </div>
              </div>

              <div className="tdb-metric-card">
                <div className="tdb-metric-icon-wrap pink"><HiTrendingUp /></div>
                <div className="tdb-metric-info">
                  <span className="tdb-metric-label">Lượt thi (tuần)</span>
                  <span className="tdb-metric-value">{dbStats?.metrics?.weeklyAttemptsCount ?? 0}</span>
                  <span className="tdb-metric-trend">↑ Đánh giá năng lực</span>
                </div>
              </div>
            </div>

            {/* Middle Row Layout */}
            <div className="tdb-dashboard-grid">
              {/* Chart 1: Hoạt động giảng dạy */}
              <div className="tdb-card">
                <div className="tdb-card-title-row">
                  <h3 className="tdb-card-title">Hoạt động giảng dạy</h3>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>7 ngày qua ▾</span>
                </div>
                <div style={{ width: '100%', height: '220px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dbStats?.chartData || [
                      { name: '14/06', students: 0, submissions: 0 },
                      { name: '15/06', students: 0, submissions: 0 },
                      { name: '16/06', students: 0, submissions: 0 },
                      { name: '17/06', students: 0, submissions: 0 },
                      { name: '18/06', students: 0, submissions: 0 },
                      { name: '19/06', students: 0, submissions: 0 },
                      { name: '20/06', students: 0, submissions: 0 }
                    ]} margin={{ left: -20, top: 10 }}>
                      <defs>
                        <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" style={{ fontWeight: '600', fontSize: '11px', fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis style={{ fontWeight: '600', fontSize: '11px', fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Area name="Lượt học tập" type="monotone" dataKey="students" stroke="#6366f1" fillOpacity={1} fill="url(#colorStudents)" strokeWidth={3} />
                      <Area name="Lượt nộp bài" type="monotone" dataKey="submissions" stroke="#10b981" fillOpacity={1} fill="url(#colorSubmissions)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Donut Chart: Phân bố điểm số */}
              <div className="tdb-card">
                <h3 className="tdb-card-title">Phân bố điểm số trung bình</h3>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '10px' }}>
                  <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                    <svg width="100%" height="100%" viewBox="0 0 42 42" className="donut">
                      <circle className="donut-hole" cx="21" cy="21" r="15.91549430918954" fill="#fff"></circle>
                      <circle className="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f1f5f9" strokeWidth="3"></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#6366f1" strokeWidth="4.5" strokeDasharray={`${excelPct} ${100 - excelPct}`} strokeDashoffset={offset1}></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#3b82f6" strokeWidth="4.5" strokeDasharray={`${goodPct} ${100 - goodPct}`} strokeDashoffset={offset2}></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f59e0b" strokeWidth="4.5" strokeDasharray={`${fairPct} ${100 - fairPct}`} strokeDashoffset={offset3}></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#10b981" strokeWidth="4.5" strokeDasharray={`${avgPct} ${100 - avgPct}`} strokeDashoffset={offset4}></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#ef4444" strokeWidth="4.5" strokeDasharray={`${weakPct} ${100 - weakPct}`} strokeDashoffset={offset5}></circle>
                    </svg>
                    <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>T.Bình lớp</span>
                      <span style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{averageScore}</span>
                    </div>
                  </div>

                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6366f1' }}></span>Xuất sắc (9.0-10.0)</span>
                      <span>{excelPct}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></span>Giỏi (8.0-8.9)</span>
                      <span>{goodPct}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></span>Khá (70-7.9)</span>
                      <span>{fairPct}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>Trung bình (5.0-6.9)</span>
                      <span>{avgPct}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>Yếu (Dưới 5.0)</span>
                      <span>{weakPct}%</span>
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', fontSize: '11.5px', color: '#4338ca', fontWeight: 700, width: '100%', textAlign: 'center' }}>
                    Điểm trung bình lớp của bạn: {averageScore}
                  </div>
                </div>
              </div>

              {/* Column 3: Thông báo mới */}
              <div className="tdb-card">
                <div className="tdb-card-title-row">
                  <h3 className="tdb-card-title">Thông báo mới</h3>
                  <span className="tdb-card-action-link" onClick={() => handleTabChange('notifications')}>Xem tất cả</span>
                </div>
                <div className="tdb-notif-list">
                  {dbStats?.notifications && dbStats.notifications.length > 0 ? (
                    dbStats.notifications.slice(0, 5).map((notif) => (
                      <div key={notif.id} className="tdb-notif-item animate-in">
                        <span className="tdb-notif-icon-dot orange">🔔</span>
                        <div className="tdb-notif-body">
                          <p className="tdb-notif-text">{notif.message}</p>
                          <span className="tdb-notif-time">
                            {new Date(notif.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="tdb-notif-item">
                        <span className="tdb-notif-icon-dot orange">✍️</span>
                        <div className="tdb-notif-body">
                          <p className="tdb-notif-text">Học sinh <strong>Trần Minh Hoàng</strong> nộp bài tập "Bài tập chương 3"</p>
                          <span className="tdb-notif-time">2 phút trước</span>
                        </div>
                      </div>

                      <div className="tdb-notif-item">
                        <span className="tdb-notif-icon-dot tdb-notif-icon-green">🏆</span>
                        <div className="tdb-notif-body">
                          <p className="tdb-notif-text">Lớp <strong>12A1</strong> có 5 học sinh đạt điểm cao trong bài kiểm tra</p>
                          <span className="tdb-notif-time">1 giờ trước</span>
                        </div>
                      </div>

                      <div className="tdb-notif-item">
                        <span className="tdb-notif-icon-dot tdb-notif-icon-purple">📢</span>
                        <div className="tdb-notif-body">
                          <p className="tdb-notif-text">Hệ thống cập nhật tài liệu mới <strong>"Hướng dẫn sử dụng tính năng thi thử"</strong></p>
                          <span className="tdb-notif-time">3 giờ trước</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Row Layout */}
            <div className="tdb-dashboard-grid">
              {/* Lớp học của tôi */}
              <div className="tdb-card">
                <div className="tdb-card-title-row">
                  <h3 className="tdb-card-title">Lớp học của tôi</h3>
                  <span className="tdb-card-action-link" onClick={() => handleTabChange('classes')}>Xem tất cả</span>
                </div>
                <div className="tdb-class-list">
                  {teacherClasses.length > 0 ? (
                    teacherClasses.slice(0, 4).map((c, i) => {
                      const tagColors = ['purple', 'blue', 'green', 'orange'];
                      const tagColor = tagColors[i % tagColors.length];
                      return (
                        <div key={c.id} className="tdb-class-item">
                          <span className={`tdb-class-tag ${tagColor}`}>{c.id.replace('C-', '')}</span>
                          <div className="tdb-class-info">
                            <h5 className="tdb-class-name">{c.name}</h5>
                            <span className="tdb-class-subtext">{c.students} học sinh • Lịch học: {c.schedule}</span>
                          </div>
                          <div className="tdb-class-progress-wrap">
                            <span className="tdb-class-progress-pct">{c.progress}%</span>
                            <div className="tdb-class-progress-track">
                              <div className="tdb-class-progress-bar" style={{ width: `${c.progress}%` }}></div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: '20px', color: '#64748b', fontSize: '13px', textAlign: 'center' }}>
                      Chưa có lớp học nào phụ trách.
                    </div>
                  )}
                </div>
              </div>

              {/* Đề thi gần đây */}
              <div className="tdb-card">
                <div className="tdb-card-title-row">
                  <h3 className="tdb-card-title">Đề thi gần đây</h3>
                  <span className="tdb-card-action-link" onClick={() => handleTabChange('exams')}>Xem tất cả</span>
                </div>
                <div className="tdb-exam-list">
                  {dbStats?.recentExamsList && dbStats.recentExamsList.length > 0 ? (
                    dbStats.recentExamsList.map((ex, i) => {
                      const icons = ['📝', '📝', '📝', '📝'];
                      const colors = ['', 'green', 'orange', 'purple'];
                      return (
                        <div key={ex.id} className="tdb-exam-item">
                          <span className={`tdb-exam-icon ${colors[i % colors.length]}`}>{icons[i % icons.length]}</span>
                          <div className="tdb-exam-info">
                            <h5 className="tdb-exam-name">{ex.title}</h5>
                            <span className="tdb-exam-date">{ex.subject} • {ex.date}</span>
                          </div>
                          <span className="tdb-exam-pill">{ex.attemptsDisplay}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: '20px', color: '#64748b', fontSize: '13px', textAlign: 'center' }}>
                      Chưa có đề thi nào được tạo.
                    </div>
                  )}
                </div>
              </div>

              {/* Tài liệu mới nhất */}
              <div className="tdb-card">
                <div className="tdb-card-title-row">
                  <h3 className="tdb-card-title">Tài liệu mới nhất</h3>
                  <span className="tdb-card-action-link" onClick={() => handleTabChange('materials')}>Xem tất cả</span>
                </div>
                <div className="tdb-material-list">
                  {teacherMaterials.length > 0 ? (
                    teacherMaterials.slice(0, 4).map(m => (
                      <div key={m.id} className="tdb-material-item" onClick={() => toast('Đang mở xem tài liệu...', 'info')} style={{ cursor: 'pointer' }}>
                        <span className={`tdb-material-icon ${m.type}`}>{m.type.toUpperCase()}</span>
                        <div className="tdb-material-info">
                          <h5 className="tdb-material-name">{m.name}</h5>
                          <span className="tdb-material-meta">{m.type.toUpperCase()} • {m.size}</span>
                        </div>
                        <span className="tdb-material-date">{m.date}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '20px', color: '#64748b', fontSize: '13px', textAlign: 'center' }}>
                      Chưa có tài liệu nào được tải lên.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pending Essay Grade Console */}
            <div className="tdb-card" style={{ background: '#eff6ff' }}>
              <h3 className="tdb-card-title">✍️ Chấm thi tự luận ({essays.length})</h3>
              {essays.length > 0 ? (
                selectedEssayId === null ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {essays.map((ess) => (
                      <div 
                        key={ess.id}
                        onClick={() => setSelectedEssayId(ess.id)}
                        style={{ padding: '14px', border: '1px solid #cbd5e1', borderRadius: '12px', background: '#fff', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>
                          <span>{ess.studentName}</span>
                          <span>{ess.date}</span>
                        </div>
                        <h4 style={{ fontSize: '13.5px', fontWeight: 'bold', margin: '0 0 6px 0', color: '#0f172a' }}>{ess.topic}</h4>
                        <p style={{ fontSize: '12px', color: '#475569', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ess.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    {(() => {
                      const ess = essays.find(e => e.id === selectedEssayId);
                      return (
                        <form onSubmit={handleGradeEssay} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ fontSize: '13px', fontWeight: 600 }}>Học viên: <strong style={{ color: '#0f172a' }}>{ess.studentName}</strong></div>
                          <div style={{ fontSize: '13px', fontWeight: 600 }}>Đề tài: <strong style={{ color: '#0f172a' }}>{ess.topic}</strong></div>
                          <div style={{ 
                            padding: '12px', border: '1px solid #cbd5e1', borderRadius: '10px', background: '#fff', 
                            fontSize: '12.5px', maxHeight: '120px', overflowY: 'auto', fontStyle: 'italic', color: '#334155'
                          }}>
                            "{ess.answer}"
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Điểm (0-10):</label>
                              <input 
                                type="number" 
                                min="0" max="10" step="0.5" 
                                className="tdb-search-input" 
                                style={{ width: '100%', borderRadius: '8px' }}
                                value={reviewScore}
                                onChange={e => setReviewScore(e.target.value)}
                                required 
                              />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Nhận xét giáo viên:</label>
                              <input 
                                type="text" 
                                className="tdb-search-input" 
                                style={{ width: '100%', borderRadius: '8px' }}
                                placeholder="Bài viết tốt, lập luận chặt chẽ..."
                                value={reviewComment}
                                onChange={e => setReviewComment(e.target.value)}
                                required 
                              />
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                            <button type="submit" className="tdb-upgrade-btn" style={{ flex: 1, background: '#6366f1', boxShadow: 'none' }}>
                              Lưu điểm
                            </button>
                            <button type="button" onClick={() => setSelectedEssayId(null)} className="tdb-upgrade-btn" style={{ flex: 1, background: '#ffffff', color: '#6366f1', border: '1px solid #6366f1', boxShadow: 'none' }}>
                              Quay lại
                            </button>
                          </div>
                        </form>
                      );
                    })()}
                  </div>
                )
              ) : (
                <div style={{ fontSize: '13.5px', color: '#64748b', textAlign: 'center', padding: '20px' }}>
                  🎉 Không có bài luận nào cần chấm điểm!
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: COURSES ================= */}
        {localTab === 'courses' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '24px', textAlign: 'left' }}>
            <div className="tdb-card">
              <h3 className="tdb-card-title" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '10px' }}>
                📚 Các khóa học của bạn
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {courses.map((course) => (
                  <div 
                    key={course.id} 
                    style={{ 
                      padding: '16px', border: '1px solid #e2e8f0', borderRadius: '16px', background: '#f8fafc',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                  >
                    <div>
                      <span className="tdb-exam-pill">{course.subject}</span>
                      <h4 style={{ fontSize: '15px', fontWeight: '800', margin: '8px 0 4px 0', color: '#0f172a' }}>{course.title}</h4>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '11.5px', fontWeight: '600', color: '#64748b' }}>
                        <span>Bài học: {course.lessons?.length || 0} bài</span>
                        <span>Học viên: {course.enrollments?.length || 12} học sinh</span>
                        <span style={{ color: '#10b981' }}>Trạng thái: Đã kích hoạt</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => setSelectedCourseId(course.id)}
                        className="tdb-upgrade-btn" 
                        style={{ padding: '8px 12px', background: '#ffffff', color: '#6366f1', border: '1px solid #6366f1', boxShadow: 'none' }}
                      >
                        Chi tiết
                      </button>
                      <button 
                        onClick={() => setActiveCoursePreview(course.id)}
                        className="tdb-upgrade-btn" 
                        style={{ padding: '8px 12px', background: '#6366f1', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: 'none' }}
                      >
                        <HiEye /> Xem thử
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="tdb-card" style={{ background: '#fffbeb' }}>
              <h3 className="tdb-card-title" style={{ borderBottom: '1px solid #fcd34d', paddingBottom: '14px', marginBottom: '10px' }}>
                📝 Quản lý bài học (Thay đổi thứ tự)
              </h3>
              {selectedCourseId ? (
                (() => {
                  const course = courses.find(c => c.id === selectedCourseId);
                  return (
                    <div>
                      <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>{course.title}</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {course.lessons.map((lesson, idx) => (
                          <div 
                            key={lesson.id}
                            style={{ 
                              padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#fff',
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}
                          >
                            <span style={{ fontSize: '12.5px', fontWeight: '600', color: '#0f172a' }}>
                              {idx + 1}. {lesson.name || lesson.title}
                            </span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button 
                                onClick={() => moveLesson(course.id, idx, -1)}
                                disabled={idx === 0}
                                style={{ padding: '2px 6px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', opacity: idx === 0 ? 0.3 : 1 }}
                              >
                                <HiArrowUp />
                              </button>
                              <button 
                                onClick={() => moveLesson(course.id, idx, 1)}
                                disabled={idx === course.lessons.length - 1}
                                style={{ padding: '2px 6px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', opacity: idx === course.lessons.length - 1 ? 0.3 : 1 }}
                              >
                                <HiArrowDown />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div style={{ fontSize: '13.5px', color: '#64748b', padding: '30px', textAlign: 'center' }}>
                  💡 Hãy chọn một khóa học ở cột bên trái để quản lý và thay đổi thứ tự các bài giảng học tập.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: QUESTION BANK ================= */}
        {localTab === 'questions' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', textAlign: 'left' }}>
            <div className="tdb-card" style={{ background: '#fffbeb' }}>
              <h3 className="tdb-card-title" style={{ borderBottom: '1px solid #fcd34d', paddingBottom: '14px', marginBottom: '10px' }}>
                ➕ Thêm câu hỏi vào ngân hàng
              </h3>
              <form onSubmit={handleAddQuestionLocal} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11.5px', fontWeight: 'bold' }}>Nội dung câu hỏi:</label>
                  <textarea 
                    className="tdb-search-input" 
                    rows="2" 
                    style={{ borderRadius: '8px', padding: '10px', height: '60px', boxSizing: 'border-box' }}
                    value={qText}
                    onChange={e => setQText(e.target.value)}
                    placeholder="Ví dụ: Tính đạo hàm của y = tan(x)..." 
                    required 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11.5px', fontWeight: 'bold' }}>Môn học:</label>
                    <select className="tdb-search-input" style={{ borderRadius: '8px', height: '36px' }} value={qSubject} onChange={e => setQSubject(e.target.value)}>
                      <option value="Toán học">Toán học</option>
                      <option value="Vật lý">Vật lý</option>
                      <option value="Hóa học">Hóa học</option>
                      <option value="Tiếng Anh">Tiếng Anh</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11.5px', fontWeight: 'bold' }}>Chương/Chuyên đề:</label>
                    <input type="text" className="tdb-search-input" style={{ borderRadius: '8px', height: '36px' }} value={qTopic} onChange={e => setQTopic(e.target.value)} placeholder="Tích phân" required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11.5px', fontWeight: 'bold' }}>Độ khó:</label>
                    <select className="tdb-search-input" style={{ borderRadius: '8px', height: '36px' }} value={qDiff} onChange={e => setQDiff(e.target.value)}>
                      <option value="EASY">Dễ</option>
                      <option value="MEDIUM">Trung bình</option>
                      <option value="HARD">Khó</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11.5px', fontWeight: 'bold' }}>Đáp án Đúng:</label>
                    <select className="tdb-search-input" style={{ borderRadius: '8px', height: '36px' }} value={qCorrect} onChange={e => setQCorrect(e.target.value)}>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Đáp án A:</label>
                    <input type="text" className="tdb-search-input" style={{ borderRadius: '8px', height: '36px' }} value={optA} onChange={e => setOptA(e.target.value)} required />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Đáp án B:</label>
                    <input type="text" className="tdb-search-input" style={{ borderRadius: '8px', height: '36px' }} value={optB} onChange={e => setOptB(e.target.value)} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Đáp án C:</label>
                    <input type="text" className="tdb-search-input" style={{ borderRadius: '8px', height: '36px' }} value={optC} onChange={e => setOptC(e.target.value)} required />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Đáp án D:</label>
                    <input type="text" className="tdb-search-input" style={{ borderRadius: '8px', height: '36px' }} value={optD} onChange={e => setOptD(e.target.value)} required />
                  </div>
                </div>

                <button type="submit" className="tdb-upgrade-btn" style={{ background: '#6366f1', marginTop: '6px' }}>
                  📥 Thêm vào ngân hàng đề
                </button>
              </form>

              <div style={{ borderTop: '1px solid #fcd34d', marginTop: '16px', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>🚀 Nhập đề từ Excel / CSV</h4>
                <button 
                  onClick={handleExcelImport}
                  disabled={excelImporting}
                  className="tdb-upgrade-btn"
                  style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', boxShadow: 'none' }}
                >
                  <HiUpload /> {excelImporting ? `Đang xử lý ${importProgress}%...` : 'Upload File Excel (.xlsx, .csv)'}
                </button>
              </div>
            </div>

            <div className="tdb-card">
              <h3 className="tdb-card-title" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '10px' }}>
                📂 Danh sách câu hỏi ({filteredQuestions.length})
              </h3>
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  className="tdb-search-input" 
                  placeholder="Tìm nhanh..." 
                  style={{ flex: 1, borderRadius: '8px' }}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <select className="tdb-search-input" style={{ width: '110px', borderRadius: '8px' }} value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
                  <option value="All">Tất cả môn</option>
                  <option value="Toán học">Toán học</option>
                  <option value="Vật lý">Vật lý</option>
                  <option value="Hóa học">Hóa học</option>
                  <option value="Tiếng Anh">Tiếng Anh</option>
                </select>
                <select className="tdb-search-input" style={{ width: '100px', borderRadius: '8px' }} value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}>
                  <option value="All">Mọi độ khó</option>
                  <option value="EASY">Dễ</option>
                  <option value="MEDIUM">Trung bình</option>
                  <option value="HARD">Khó</option>
                </select>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px' }}>
                {filteredQuestions.map(q => (
                  <div key={q.id} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748b', fontWeight: 'bold', marginBottom: '6px' }}>
                      <span>#{q.id} • {q.subject} • Chuyên đề: {q.topic}</span>
                      <span style={{ 
                        color: q.difficulty === 'EASY' ? '#10b981' : (q.difficulty === 'MEDIUM' ? '#f59e0b' : '#ef4444')
                      }}>
                        {q.difficulty}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: '700', margin: '0 0 8px 0', color: '#0f172a' }}>{q.content || q.question}</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '11.5px', color: '#475569', marginBottom: '8px' }}>
                      {q.options?.map((opt, i) => (
                        <div key={i} style={{ fontWeight: q.correctAnswer === opt.key ? 'bold' : 'normal', color: q.correctAnswer === opt.key ? '#10b981' : 'inherit' }}>
                          {opt.key}. {opt.value}
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '6px', fontSize: '11px', fontWeight: '600' }}>
                      <span style={{ color: '#2563eb' }}>📊 Tỷ lệ làm đúng: {q.successRate || '78%'}</span>
                      <button 
                        onClick={() => {
                          setQuestionBank(questionBank.filter(item => item.id !== q.id));
                          toast('Đã xóa câu hỏi khỏi ngân hàng đề!', 'info');
                        }}
                        style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Xóa câu hỏi
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: EXAMS ================= */}
        {localTab === 'exams' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              {[
                { id: 'list', name: '📋 Danh sách đề thi' },
                { id: 'build', name: '🛠️ Soạn & Upload đề thi' },
                { id: 'moderate', name: '⚖️ Kiểm duyệt đề thi (' + exams.filter(e => e.status === 'pending').length + ')' }
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setExamSubTab(sub.id)}
                  className="tdb-upgrade-btn"
                  style={{
                    width: 'auto',
                    padding: '8px 16px',
                    background: examSubTab === sub.id ? '#6366f1' : '#ffffff',
                    color: examSubTab === sub.id ? '#ffffff' : '#6366f1',
                    border: '1px solid #6366f1',
                    boxShadow: 'none'
                  }}
                >
                  {sub.name}
                </button>
              ))}
            </div>

            {/* Subtab 1: List */}
            {examSubTab === 'list' && (
              <div className="tdb-card">
                <h3 className="tdb-card-title" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '10px' }}>
                  📋 Danh sách đề thi hệ thống
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                  {exams.map((ex) => (
                    <div key={ex.id} style={{ padding: '14px', border: '1px solid #e2e8f0', borderRadius: '16px', background: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <h4 style={{ fontSize: '13.5px', fontWeight: '800', margin: 0, color: '#0f172a' }}>{ex.title}</h4>
                          <span className="tdb-exam-pill" style={{ fontSize: '9px' }}>{ex.subject}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 'bold', borderRadius: '6px', padding: '2px 6px', background: ex.status === 'pending' ? '#fef3c7' : '#d1fae5', color: ex.status === 'pending' ? '#d97706' : '#059669' }}>
                            {ex.status === 'pending' ? '⏱️ CHỜ DUYỆT' : '✓ ĐÃ PHÁT HÀNH'}
                          </span>
                          {ex.grade && (
                            <span style={{ fontSize: '10px', fontWeight: 'bold', borderRadius: '6px', padding: '2px 6px', background: '#e0e7ff', color: '#4f46e5' }}>
                              Lớp {ex.grade}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', background: '#fff', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '10px', fontWeight: '600', textAlign: 'center' }}>
                        <div>
                          <div style={{ color: '#64748b' }}>Câu hỏi</div>
                          <div style={{ fontSize: '12px', color: '#0f172a', fontWeight: 'bold' }}>{ex.questionCount}</div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b' }}>Lượt thi</div>
                          <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 'bold' }}>{ex.attempts}</div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b' }}>T.Bình</div>
                          <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 'bold' }}>{ex.avgScore ? `${ex.avgScore}đ` : '---'}</div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b' }}>Cao nhất</div>
                          <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold' }}>{ex.maxScore ? `${ex.maxScore}đ` : '---'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subtab 2: Build & Import */}
            {examSubTab === 'build' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="tdb-card" style={{ background: '#f5f3ff' }}>
                  <h3 className="tdb-card-title" style={{ borderBottom: '1px solid #ddd6fe', paddingBottom: '14px', marginBottom: '10px' }}>
                    🛠️ Soạn đề kiểm tra mới
                  </h3>
                  <form onSubmit={handleBuildExam} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11.5px', fontWeight: 'bold' }}>Tiêu đề đề thi:</label>
                      <input 
                        type="text" 
                        className="tdb-search-input" 
                        value={examTitle}
                        onChange={e => setExamTitle(e.target.value)}
                        placeholder="Ví dụ: Đề khảo sát chất lượng tháng 6" 
                        required 
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11.5px', fontWeight: 'bold' }}>Bộ môn:</label>
                        <select className="tdb-search-input" value={examSubject} onChange={e => setExamSubject(e.target.value)}>
                          <option value="Toán học">Toán học</option>
                          <option value="Vật lý">Vật lý</option>
                          <option value="Hóa học">Hóa học</option>
                          <option value="Tiếng Anh">Tiếng Anh</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11.5px', fontWeight: 'bold' }}>Thời gian (Phút):</label>
                        <input type="number" className="tdb-search-input" value={examDuration} onChange={e => setExamDuration(e.target.value)} required />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11.5px', fontWeight: 'bold' }}>Khối lớp:</label>
                        <select className="tdb-search-input" value={examGrade} onChange={e => setExamGrade(e.target.value)}>
                          <option value="10">Lớp 10</option>
                          <option value="11">Lớp 11</option>
                          <option value="12">Lớp 12</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '11.5px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                        Chọn câu hỏi từ ngân hàng ({selectedQuestions.length} đã chọn):
                      </label>
                      <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', background: '#fff', maxHeight: '180px', overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {questionBank.map(q => (
                          <label key={q.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer', fontSize: '12px' }}>
                            <input 
                              type="checkbox" 
                              checked={selectedQuestions.includes(q.id)}
                              onChange={() => handleToggleQuestionSelect(q.id)}
                            />
                            <span><strong>#{q.id}</strong> ({q.subject}): {q.content || q.question}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <button type="submit" className="tdb-upgrade-btn" style={{ background: '#6366f1' }}>
                      🎉 Phát hành đề thi thử
                    </button>
                  </form>
                </div>

                <div className="tdb-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <span style={{ fontSize: '48px' }}>📄</span>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '16px 0 8px 0', color: '#0f172a' }}>
                    Upload đề thi từ File .json
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0', maxWidth: '340px', textAlign: 'center', lineHeight: 1.5 }}>
                    Nhập đề thi trắc nghiệm đầy đủ (kèm đáp án, giải thích chi tiết, âm thanh ngoại ngữ và hình ảnh) nhanh chóng bằng file cấu trúc chuẩn JSON.
                  </p>
                  
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="tdb-upgrade-btn"
                    style={{ width: 'auto', padding: '12px 28px', background: '#e0f2fe', color: '#0369a1', boxShadow: 'none' }}
                  >
                    <HiUpload /> Upload File JSON đề thi
                  </button>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleUploadExamJson} 
                    accept=".json" 
                    style={{ display: 'none' }} 
                  />
                </div>
              </div>
            )}

            {/* Subtab 3: Moderate */}
            {examSubTab === 'moderate' && (
              <div className="tdb-card">
                <h3 className="tdb-card-title" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '10px' }}>
                  ⚖️ Đề thi đang chờ kiểm duyệt & xuất bản
                </h3>
                {exams.filter(e => e.status === 'pending').length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
                    {exams.filter(e => e.status === 'pending').map((ex) => (
                      <div key={ex.id} style={{ padding: '16px', border: '1px solid #cbd5e1', borderRadius: '16px', background: '#FFFDF5', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: '#0f172a' }}>{ex.title}</h4>
                            <span className="tdb-exam-pill" style={{ fontSize: '9px' }}>{ex.subject}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', fontSize: '11.5px', fontWeight: '600', color: '#64748b' }}>
                            <span>Số câu hỏi: <strong>{ex.questionCount} câu</strong></span>
                            <span>•</span>
                            <span>Thời gian: <strong>{ex.duration} phút</strong></span>
                            {ex.grade && (
                              <>
                                <span>•</span>
                                <span style={{ color: '#4f46e5' }}>Lớp {ex.grade}</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px', borderTop: '1px dashed #cbd5e1', paddingTop: '12px', marginTop: '10px' }}>
                          <button 
                            onClick={() => handleApproveExam(ex.id)}
                            className="tdb-upgrade-btn"
                            style={{ flex: 1, background: '#d1fae5', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', boxShadow: 'none' }}
                          >
                            <HiCheck /> Duyệt đề thi
                          </button>
                          <button 
                            onClick={() => {
                              setExams(exams.filter(e => e.id !== ex.id));
                              toast('Đã từ chối và xóa đề thi khỏi hàng đợi kiểm duyệt.', 'info');
                            }}
                            className="tdb-upgrade-btn"
                            style={{ width: 'auto', padding: '8px 12px', background: '#fee2e2', color: '#b91c1c', boxShadow: 'none' }}
                          >
                            Từ chối
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '13.5px' }}>
                    🎉 Không có đề thi nào đang chờ phê duyệt. Tất cả các đề đã được kiểm duyệt!
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 5: STUDENTS ================= */}
        {localTab === 'students' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', textAlign: 'left' }}>
            <div className="tdb-card">
              <h3 className="tdb-card-title" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '10px' }}>
                👥 Danh sách học viên lớp học
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {students.map(st => (
                  <div 
                    key={st.id}
                    onClick={() => setSelectedStudentId(st.id)}
                    style={{ 
                      padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer',
                      background: selectedStudentId === st.id ? '#d1fae5' : '#f8fafc',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '13.5px', fontWeight: '800', margin: '0 0 2px 0', color: '#0f172a' }}>{st.name}</h4>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Lớp: {st.grade} • Lượt kiểm tra: {st.attempts} bài</span>
                    </div>
                    <span style={{ 
                      fontSize: '11px', fontWeight: '700', borderRadius: '20px', padding: '2px 8px',
                      background: st.status === 'Xuất sắc' || st.status === 'Chăm chỉ' ? '#d1fae5' : '#fef3c7',
                      color: st.status === 'Xuất sắc' || st.status === 'Chăm chỉ' ? '#065f46' : '#d97706'
                    }}>
                      {st.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="tdb-card" style={{ background: '#ecfdf5' }}>
              <h3 className="tdb-card-title" style={{ borderBottom: '1px solid #a7f3d0', paddingBottom: '14px', marginBottom: '10px' }}>
                🔬 Phân tích tiến độ chi tiết
              </h3>
              
              {selectedStudentId ? (
                (() => {
                  const st = students.find(s => s.id === selectedStudentId);
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#065f46' }}>{st.name}</h4>
                        <strong style={{ fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '4px 8px', background: '#fff', color: '#0f172a' }}>🔥 Streak: {st.streak} ngày</strong>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' }}>
                          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>ĐIỂM TRUNG BÌNH</div>
                          <div style={{ fontSize: '22px', fontWeight: '800', color: '#059669' }}>{st.avgScore} / 10đ</div>
                        </div>
                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' }}>
                          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>XẾP HẠNG LỚP</div>
                          <div style={{ fontSize: '22px', fontWeight: '800', color: '#2563eb' }}>Top 5</div>
                        </div>
                      </div>

                      <div>
                        <h5 style={{ fontSize: '12.5px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px', color: '#0f172a' }}>📚 Kiến thức cần bồi dưỡng thêm:</h5>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {st.weakness.map((w, idx) => (
                            <span key={idx} style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700' }}>
                              ⚠️ {w}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 style={{ fontSize: '12.5px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px', color: '#0f172a' }}>⏱ Nhật ký học tập gần nhất:</h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#334155', background: '#fff', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                          <div>• Đã hoàn thành Đề ôn tập Giải tích 12: <strong>8.8 điểm</strong></div>
                          <div>• Luyện 15 câu trắc nghiệm Tích phân phân thức</div>
                          <div>• Đọc tài liệu bài giảng Dao động tắt dần</div>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div style={{ fontSize: '13.5px', color: '#64748b', padding: '30px', textAlign: 'center' }}>
                  💡 Chọn một học viên ở cột bên trái để hiển thị thông tin phân tích học tập chi tiết và lịch sử làm đề của họ.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 6: REVENUE ================= */}
        {localTab === 'revenue' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { title: 'Doanh thu phát sinh', val: revenueSummary.grossEarnings, desc: 'Tổng học viên thanh toán khóa học', bg: '#ffffff' },
                { title: 'Hoa hồng thụ hưởng (80%)', val: revenueSummary.netEarnings, desc: 'Lợi nhuận thực tế sau chiết khấu', bg: '#ecfdf5' },
                { title: 'Tỷ lệ thụ hưởng', val: revenueSummary.payoutRate, desc: 'Cấu hình chiết khấu của giáo viên', bg: '#fffbeb' },
                { title: 'Số dư chờ thanh toán', val: revenueSummary.pendingPayout, desc: 'Kỳ thanh toán tiếp theo: ' + revenueSummary.nextPayoutDate, bg: '#eff6ff' }
              ].map((box, i) => (
                <div key={i} style={{ background: box.bg, border: '1px solid #e2e8f0', borderRadius: '16px', padding: '18px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>{box.title}</div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>{box.val}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>{box.desc}</div>
                </div>
              ))}
            </div>

            <div className="tdb-card">
              <div className="tdb-card-title-row" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '10px' }}>
                <h3 className="tdb-card-title">🧾 Nhật ký giao dịch mua khóa học</h3>
                <button 
                  onClick={() => {
                    toast('Đang khởi tạo tải xuống file CSV giao dịch...', 'info');
                    setTimeout(() => {
                      toast('Đã tải xuống file báo cáo doanh thu thành công!', 'success');
                    }, 800);
                  }}
                  className="tdb-upgrade-btn"
                  style={{ width: 'auto', padding: '6px 12px', background: '#ffffff', color: '#6366f1', border: '1px solid #6366f1', boxShadow: 'none' }}
                >
                  <HiDownload /> Xuất báo cáo doanh thu (CSV)
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '12px' }}>Mã hóa đơn</th>
                      <th style={{ padding: '12px' }}>Học viên</th>
                      <th style={{ padding: '12px' }}>Tên khóa học</th>
                      <th style={{ padding: '12px' }}>Ngày giao dịch</th>
                      <th style={{ padding: '12px' }}>Học phí</th>
                      <th style={{ padding: '12px' }}>Trích hoa hồng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => (
                      <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#0f172a' }}>{inv.id}</td>
                        <td style={{ padding: '12px', fontWeight: '700', color: '#334155' }}>{inv.studentName}</td>
                        <td style={{ padding: '12px', textAlign: 'left' }}>{inv.courseName}</td>
                        <td style={{ padding: '12px', color: '#64748b' }}>{inv.date}</td>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#059669' }}>{inv.amount}</td>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#6366f1' }}>{inv.commission}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= NEW TAB: MATERIALS ================= */}
        {localTab === 'materials' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
            <div className="tdb-card">
              <div className="tdb-card-title-row" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '10px' }}>
                <h3 className="tdb-card-title">📚 Kho tài liệu giảng dạy của tôi</h3>
                <form onSubmit={handleUploadMaterial} style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="tdb-upgrade-btn" style={{ width: 'auto', background: '#6366f1' }}>
                    + Tải lên tài liệu mới
                  </button>
                </form>
              </div>

              <div style={{ display: 'flex', gap: '12px', margin: '10px 0 14px 0' }}>
                <div className="tdb-search-wrap" style={{ width: '100%', maxWidth: '400px' }}>
                  <span className="tdb-search-icon"><HiSearch /></span>
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm tài liệu..." 
                    className="tdb-search-input" 
                    value={materialSearch}
                    onChange={e => setMaterialSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="tdb-material-list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {teacherMaterials.filter(m => m.name.toLowerCase().includes(materialSearch.toLowerCase())).map(m => (
                  <div key={m.id} className="tdb-material-item" style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                    <span className={`tdb-material-icon ${m.type}`} style={{ width: '42px', height: '42px', fontSize: '12px' }}>{m.type.toUpperCase()}</span>
                    <div className="tdb-material-info" style={{ padding: '0 16px' }}>
                      <h5 className="tdb-material-name" style={{ fontSize: '14px' }}>{m.name}</h5>
                      <span className="tdb-material-meta">{m.size} • Đăng ngày {m.date}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="tdb-action-icon-btn" onClick={() => toast('Đang tải tài liệu...', 'success')} title="Tải xuống"><HiDownload /></button>
                      <button className="tdb-action-icon-btn" onClick={() => {
                        setTeacherMaterials(teacherMaterials.filter(item => item.id !== m.id));
                        toast('Đã xóa tài liệu khỏi hệ thống!', 'info');
                      }} title="Xóa" style={{ color: '#ef4444' }}><HiTrash /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= NEW TAB: CLASSES ================= */}
        {localTab === 'classes' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', textAlign: 'left' }}>
            <div className="tdb-card">
              <h3 className="tdb-card-title" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '10px' }}>
                🏫 Danh sách lớp học phụ trách
              </h3>
              <div className="tdb-class-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {teacherClasses.map(c => (
                  <div key={c.id} className="tdb-class-item" style={{ padding: '16px' }}>
                    <span className={`tdb-class-tag ${c.id === '12A1' ? 'purple' : c.id === '11B2' ? 'blue' : c.id === '10A3' ? 'green' : 'orange'}`}>{c.id}</span>
                    <div className="tdb-class-info">
                      <h5 className="tdb-class-name" style={{ fontSize: '15px' }}>{c.name}</h5>
                      <span className="tdb-class-subtext">Sĩ số: {c.students} học sinh • Điểm trung bình: {c.avgScore}đ • Lịch học: {c.schedule}</span>
                    </div>
                    <div className="tdb-class-progress-wrap" style={{ width: '120px' }}>
                      <span className="tdb-class-progress-pct">Hoàn thành: {c.progress}%</span>
                      <div className="tdb-class-progress-track">
                        <div className="tdb-class-progress-bar" style={{ width: `${c.progress}%`, backgroundColor: c.progress >= 70 ? '#10b981' : '#f59e0b' }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="tdb-card" style={{ background: '#f8fafc' }}>
              <h3 className="tdb-card-title" style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>➕ Tạo lớp học mới</h3>
              <form onSubmit={handleCreateClass} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Mã lớp học (Ví dụ: 12A2, 10B5):</label>
                  <input 
                    type="text" 
                    className="tdb-search-input" 
                    style={{ width: '100%', borderRadius: '10px' }} 
                    value={newClassId}
                    onChange={e => setNewClassId(e.target.value)}
                    placeholder="Nhập mã lớp..."
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Tên môn học & Phân nhóm:</label>
                  <input 
                    type="text" 
                    className="tdb-search-input" 
                    style={{ width: '100%', borderRadius: '10px' }} 
                    value={newClassName}
                    onChange={e => setNewClassName(e.target.value)}
                    placeholder="Ví dụ: Toán học 12 - Cơ bản..."
                    required
                  />
                </div>
                <button type="submit" className="tdb-upgrade-btn" style={{ background: '#6366f1', marginTop: '10px' }}>
                  Xác nhận tạo lớp học
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= NEW TAB: LEADERBOARD ================= */}
        {localTab === 'leaderboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
            <div className="tdb-card">
              <h3 className="tdb-card-title" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '10px' }}>
                🏆 Bảng xếp hạng giáo viên tích cực tuần này
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', textAlign: 'left', background: '#f8fafc' }}>
                    <th style={{ padding: '12px 16px' }}>Hạng</th>
                    <th style={{ padding: '12px 16px' }}>Giáo viên</th>
                    <th style={{ padding: '12px 16px' }}>Số khóa học</th>
                    <th style={{ padding: '12px 16px' }}>Đánh giá trung bình</th>
                    <th style={{ padding: '12px 16px' }}>Học sinh đang theo học</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Điểm tích cực</th>
                  </tr>
                </thead>
                <tbody>
                  {teacherLeaderboard.map((t) => (
                    <tr key={t.rank} style={{ borderBottom: '1px solid #e2e8f0', background: t.rank === 1 ? 'rgba(99, 102, 241, 0.03)' : 'transparent' }}>
                      <td style={{ padding: '16px', fontWeight: 'bold' }}>
                        {t.rank === 1 ? '🥇 1' : t.rank === 2 ? '🥈 2' : t.rank === 3 ? '🥉 3' : `${t.rank}`}
                      </td>
                      <td style={{ padding: '16px', fontWeight: 'bold', color: '#0f172a' }}>{t.name}</td>
                      <td style={{ padding: '16px' }}>{t.coursesCount} lớp học</td>
                      <td style={{ padding: '16px', color: '#f59e0b', fontWeight: 'bold' }}>⭐ {t.rating}</td>
                      <td style={{ padding: '16px' }}>{t.activeStudents} học sinh</td>
                      <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold', color: '#6366f1' }}>{t.points} XP</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= NEW TAB: NOTIFICATIONS ================= */}
        {localTab === 'notifications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
            <div className="tdb-card">
              <h3 className="tdb-card-title" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '10px' }}>
                🔔 Hộp thư thông báo giáo vụ & hệ thống
              </h3>
              <div className="tdb-notif-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {dbStats?.notifications && dbStats.notifications.length > 0 ? (
                  dbStats.notifications.map((notif) => (
                    <div key={notif.id} className="tdb-notif-item animate-in" style={{ padding: '12px 0' }}>
                      <span className="tdb-notif-icon-dot orange">🔔</span>
                      <div className="tdb-notif-body">
                        <p className="tdb-notif-text">{notif.message}</p>
                        <span className="tdb-notif-time">
                          {new Date(notif.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="tdb-notif-item" style={{ padding: '12px 0' }}>
                      <span className="tdb-notif-icon-dot orange">✍️</span>
                      <div className="tdb-notif-body">
                        <p className="tdb-notif-text">Học sinh <strong>Trần Minh Hoàng</strong> vừa nộp bài tự luận chuyên đề <strong>Tây Tiến</strong></p>
                        <span className="tdb-notif-time">2 phút trước</span>
                      </div>
                      <button className="tdb-upgrade-btn" style={{ width: 'auto', background: '#6366f1', padding: '6px 12px' }} onClick={() => handleTabChange('overview')}>Chấm bài ngay</button>
                    </div>

                    <div className="tdb-notif-item" style={{ padding: '12px 0' }}>
                      <span className="tdb-notif-icon-dot tdb-notif-icon-green">🏆</span>
                      <div className="tdb-notif-body">
                        <p className="tdb-notif-text">Lớp <strong>12A1</strong> hoàn thành bài thi thử chương 3 với điểm trung bình đạt <strong>8.5</strong></p>
                        <span className="tdb-notif-time">1 giờ trước</span>
                      </div>
                    </div>

                    <div className="tdb-notif-item" style={{ padding: '12px 0' }}>
                      <span className="tdb-notif-icon-dot tdb-notif-icon-purple">📢</span>
                      <div className="tdb-notif-body">
                        <p className="tdb-notif-text">Hệ thống cập nhật thành công tài liệu giảng dạy <strong>"Phương pháp rèn luyện kỹ năng bấm Casio tích phân"</strong></p>
                        <span className="tdb-notif-time">3 giờ trước</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= NEW TAB: HELP ================= */}
        {localTab === 'help' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
            <div className="tdb-card">
              <h3 className="tdb-card-title" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '10px' }}>
                ❓ Trợ giúp giáo viên & FAQs
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14.5px', lineHeight: 1.5 }}>
                <div>
                  <h4 style={{ fontWeight: 'bold', margin: '0 0 6px 0', color: '#0f172a' }}>1. Làm thế nào để tạo đề thi thử trắc nghiệm?</h4>
                  <p style={{ color: '#475569', margin: 0 }}>Bạn có thể vào tab <strong>Đề thi & Bài kiểm tra</strong>, chọn <strong>Soạn đề từ ngân hàng câu hỏi</strong> hoặc trực tiếp upload file có định dạng <strong>JSON chuẩn</strong> cấu trúc đề thi để phát hành nhanh.</p>
                </div>
                <div>
                  <h4 style={{ fontWeight: 'bold', margin: '0 0 6px 0', color: '#0f172a' }}>2. Cơ chế kiểm duyệt tài liệu của tôi diễn ra thế nào?</h4>
                  <p style={{ color: '#475569', margin: 0 }}>Mọi tài liệu sau khi đăng tải sẽ ở trạng thái <strong>Chờ phê duyệt</strong>. Đội ngũ Quản trị viên (Admin) sẽ kiểm tra nội dung và phê duyệt hiển thị trên thư viện công cộng trong vòng 24 giờ.</p>
                </div>
                <div>
                  <h4 style={{ fontWeight: 'bold', margin: '0 0 6px 0', color: '#0f172a' }}>3. Cách liên hệ với ban kỹ thuật khi gặp sự cố?</h4>
                  <p style={{ color: '#475569', margin: 0 }}>Vui lòng gửi email trực tiếp tới <strong>support@edupath.vn</strong> hoặc gọi hotline hỗ trợ dành riêng cho giáo viên: <strong>1900 6088</strong>.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= NEW TAB: SETTINGS ================= */}
        {localTab === 'settings' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', textAlign: 'left' }}>
            <div className="tdb-card">
              <h3 className="tdb-card-title" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '10px' }}>
                ⚙️ Cài đặt cấu hình hồ sơ giáo viên
              </h3>
              <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Họ và tên giáo viên:</label>
                  <input 
                    type="text" 
                    className="tdb-search-input" 
                    style={{ width: '100%', borderRadius: '10px' }} 
                    value={teacherName}
                    onChange={e => setTeacherName(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Số điện thoại liên lạc:</label>
                  <input 
                    type="text" 
                    className="tdb-search-input" 
                    style={{ width: '100%', borderRadius: '10px' }} 
                    value={teacherPhone}
                    onChange={e => setTeacherPhone(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Email đăng nhập:</label>
                  <input 
                    type="email" 
                    className="tdb-search-input" 
                    style={{ width: '100%', borderRadius: '10px', backgroundColor: '#f1f5f9', cursor: 'not-allowed' }} 
                    value={teacherEmail}
                    disabled
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Tiểu sử & Kinh nghiệm chuyên môn:</label>
                  <textarea 
                    className="tdb-search-input" 
                    style={{ width: '100%', height: '80px', borderRadius: '10px', padding: '10px', boxSizing: 'border-box' }} 
                    value={teacherBio}
                    onChange={e => setTeacherBio(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="tdb-upgrade-btn" style={{ background: '#6366f1', marginTop: '10px' }}>
                  Lưu thay đổi hồ sơ
                </button>
              </form>
            </div>

            <div className="tdb-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
              <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #6366f1', marginBottom: '14px' }}>
                {currentUser?.avatarUrl || currentUser?.avatar ? (
                  <img src={currentUser.avatarUrl || currentUser.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#6366f1', color: '#fff', fontSize: '28px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {(teacherName || 'GV').slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{teacherName}</h4>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>Chuyên môn: Toán THPTQG</p>
              <button 
                className="tdb-upgrade-btn" 
                style={{ width: 'auto', background: '#ffffff', color: '#6366f1', border: '1px solid #6366f1', boxShadow: 'none' }} 
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? 'Đang tải lên...' : 'Thay đổi ảnh đại diện'}
              </button>
              <input 
                type="file" 
                ref={avatarInputRef} 
                onChange={handleAvatarChange} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
            </div>
          </div>
        )}
      </main>

      {/* ================= OPTIONAL PREVIEW OVERLAY ================= */}
      {activeCoursePreview !== null && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 6000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div className="lp-lesson-player-modal" style={{ width: '90%', maxWidth: '900px', height: '80vh' }}>
            <div className="lp-lp-header">
              <div>
                <span className="lp-lp-badge">Chế độ xem trước (Học sinh)</span>
                <h4>{courses.find(c => c.id === activeCoursePreview)?.title}</h4>
              </div>
              <button 
                onClick={() => setActiveCoursePreview(null)}
                style={{ border: '2px solid #000', background: '#fff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontWeight: '900' }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', height: 'calc(100% - 70px)' }}>
              <div style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexDirection: 'column' }}>
                <span style={{ fontSize: '48px' }}>🎥</span>
                <p style={{ fontWeight: '800', marginTop: '10px' }}>Mô phỏng Trình phát video bài học</p>
                <div style={{ border: '2px solid #fff', padding: '6px 16px', borderRadius: '20px', fontSize: '11px', cursor: 'pointer' }} onClick={() => toast('Bắt đầu chơi video...', 'info')}>
                  Play Demo
                </div>
              </div>

              <div style={{ borderLeft: '3px solid #000', background: '#F8FAFC', overflowY: 'auto', padding: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '950', textTransform: 'uppercase', marginBottom: '10px', textAlign: 'left' }}>Nội dung bài học:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {courses.find(c => c.id === activeCoursePreview)?.lessons.map((less, idx) => (
                    <div key={idx} style={{ padding: '8px 10px', border: '1.5px solid #000', borderRadius: '6px', background: '#fff', fontSize: '12px', display: 'flex', gap: '6px', textAlign: 'left' }}>
                      <span>📖</span>
                      <span>Bài {idx + 1}: {less.name || less.title} ({less.duration || '15m'})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
