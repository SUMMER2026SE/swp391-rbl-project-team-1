import React, { useState, useRef, useEffect } from 'react';
<<<<<<< HEAD
import { HiPaperAirplane, HiSparkles, HiCamera, HiX, HiArrowLeft, HiUser, HiChat } from 'react-icons/hi';
import { API_BASE } from '../api';

const channels = [
  { 
    id: 'ai-tutor', 
    name: 'Trợ lý AI EduBot', 
    type: 'ai', 
    subject: 'Hỗ trợ tất cả môn', 
    avatar: '🤖', 
    welcome: 'Chào em! Mình là EduBot, trợ lý học tập AI của em. Hãy gửi đề bài bằng văn bản hoặc bấm nút đính kèm ảnh chụp bài tập 📷, mình sẽ nhận diện OCR và hướng dẫn em cách giải chi tiết từng bước nhé!' 
  },
  { 
    id: 'teacher-math', 
    name: 'Thầy Thế Anh', 
    type: 'teacher', 
    subject: 'Toán học THPT', 
    avatar: '👨‍🏫', 
    welcome: 'Chào em! Thầy Thế Anh đây. Thầy vừa cập nhật ngân hàng đề thi thử Hàm số và Tích phân. Có phần lý thuyết hay câu hỏi thực hành nào làm khó em không? Nhắn cho thầy nhé!' 
  },
  { 
    id: 'teacher-physics', 
    name: 'Cô Thu Hương', 
    type: 'teacher', 
    subject: 'Vật lý THPT', 
    avatar: '👩‍🏫', 
    welcome: 'Chào em! Cô Thu Hương đây. Cô thấy em làm rất tốt phần Dao động điều hòa. Phần Sóng cơ và dòng điện xoay chiều có bài tập nào cần cô phân tích giản đồ vector không?' 
  },
  { 
    id: 'teacher-english', 
    name: 'Cô Quỳnh Chi', 
    type: 'teacher', 
    subject: 'Tiếng Anh THPT', 
    avatar: '👩‍🏫', 
    welcome: 'Hi there! Cô Quỳnh Chi đây. Cấu trúc câu gián tiếp, câu điều kiện hay từ vựng phần Đọc hiểu có chỗ nào cần cô hỗ trợ mẹo ghi nhớ nhanh không?' 
  }
];

const QUICK_PROMPTS = {
  'ai-tutor': [
    'Giải hộ em bài tập Toán phần Tích phân...',
    'Tóm tắt lý thuyết Dao động điều hòa Vật lý 12',
    'Mẹo làm bài đọc hiểu Tiếng Anh nhanh không bị bẫy',
    'Gợi ý lộ trình ôn thi khối A01 đạt điểm 9+'
  ],
  'teacher-math': [
    'Thầy hướng dẫn em bấm Casio cực trị hàm số',
    'Giải chi tiết câu cực trị hình học Oxyz khó',
    'Công thức tính nhanh thể tích khối đa diện'
  ],
  'teacher-physics': [
    'Cô giải thích giúp em hiện tượng cộng hưởng điện',
    'Làm thế nào để nhớ nhanh công thức sóng dừng?',
    'Giải câu đồ thị dao động cơ trong đề minh họa'
  ],
  'teacher-english': [
    'Cô chỉ mẹo phát âm -ed và -s không bao giờ sai',
    'Phân biệt giúp em used to, be used to và get used to',
    'Cách suy luận từ vựng mới trong bài Đọc hiểu'
  ]
};

// OCR Sample Responses
const OCR_RESPONSES = {
  'ai-tutor': `🔍 **[Hệ thống OCR]** Nhận diện đề bài thành công:
  *Đề bài:* Cho hàm số y = x³ - 3x² + 2. Tìm điểm cực đại của đồ thị hàm số.
  
  **EduBot AI hướng dẫn giải:**
  - **Bước 1 (Đạo hàm):** Ta có y' = 3x² - 6x.
  - **Bước 2 (Tìm nghiệm):** y' = 0 <=> 3x(x - 2) = 0 <=> x = 0 hoặc x = 2.
  - **Bước 3 (Bảng biến thiên):**
    - Hệ số a = 1 > 0. y' dương trên khoảng (-∞; 0) và (2; +∞), y' âm trên khoảng (0; 2).
    - Do đó, hàm số đạt cực đại tại x = 0.
  - **Bước 4 (Kết luận):** Giá trị cực đại y_CĐ = y(0) = 2. Vậy điểm cực đại của đồ thị là (0; 2).`,
  
  'teacher-math': `🔍 **[Hệ thống OCR]** Nhận diện đề bài Toán học:
  *Đề bài:* Tính tích phân I = ∫[0 -> 1] (2x + 1) e^x dx.
  
  **Thầy Thế Anh hướng dẫn giải:**
  Chào em, đây là dạng bài tích phân từng phần:
  - Đặt u = 2x + 1 => du = 2 dx.
  - Đặt dv = e^x dx => Chọn v = e^x.
  - Áp dụng công thức ∫ u dv = u.v - ∫ v du:
    I = (2x + 1)e^x |_[0 -> 1] - ∫[0 -> 1] 2 e^x dx
    I = [3e^1 - 1e^0] - [2e^x] |_[0 -> 1]
    I = 3e - 1 - [2e - 2]
    I = e + 1.
  Em ghi nhớ quy tắc đặt u theo thứ tự "Nhất lô, nhì đa, tam lượng, tứ mũ" nhé!`,
  
  'teacher-physics': `🔍 **[Hệ thống OCR]** Nhận diện đề bài Vật lý:
  *Đề bài:* Một vật dao động điều hòa với chu kỳ T = 2s. Biên độ A = 10cm. Tính tốc độ của vật khi đi qua vị trí x = 6cm.
  
  **Cô Thu Hương hướng dẫn giải:**
  Chào em, bài này ta dùng công thức độc lập với thời gian:
  - Tần số góc ω = 2π / T = 2π / 2 = π (rad/s).
  - Áp dụng hệ thức: A² = x² + v²/ω²
  - Thay số: 10² = 6² + v²/π²
    => v²/π² = 100 - 36 = 64
    => v²/π² = 64 => |v|/π = 8
    => |v| = 8π ≈ 25.13 (cm/s).
  Chúc em làm bài tốt, cần hỏi thêm cứ nhắn cô nhé!`,
  
  'teacher-english': `🔍 **[Hệ thống OCR]** Nhận diện đề bài Tiếng Anh:
  *Đề bài:* Choose the word whose underlined part differs from the other three:
  A. determin**ed**  B. sacrific**ed**  C. expir**ed**  D. reserv**ed**
  
  **Cô Quỳnh Chi hướng dẫn giải:**
  Chào em! Đây là câu hỏi kinh điển về cách phát âm đuôi -ed:
  - Quy tắc phát âm /t/: khi từ kết thúc bằng các âm vô thanh /p, k, f, s, ʃ, tʃ/. Ở đây, "sacrifice" kết thúc bằng âm /s/ => sacrific**ed** phát âm là /t/.
  - Quy tắc phát âm /d/: khi từ kết thúc bằng nguyên âm và các âm hữu thanh còn lại:
    - determine kết thúc bằng âm /n/ => determin**ed** phát âm là /d/.
    - expire kết thúc bằng nguyên âm /aɪə/ => expir**ed** phát âm là /d/.
    - reserve kết thúc bằng âm /v/ => reserv**ed** phát âm là /d/.
  Do đó, đáp án đúng là **B**.`
};

export default function AITutorPage({ currentUser, navigateTo, addLog }) {
  const [activeChannel, setActiveChannel] = useState(channels[0]);
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);
  const [guestCount, setGuestCount] = useState(() => {
    return parseInt(localStorage.getItem('edupath_guest_questions_count') || '0', 10);
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState('');
  const fileInputRef = useRef(null);

  const [chatHistories, setChatHistories] = useState(() => {
    // Attempt to load from localStorage to preserve guest chats or session chats
    const saved = localStorage.getItem('edupath_tutor_chat_histories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback below
      }
    }
    return {
      'ai-tutor': [{ sender: 'bot', text: channels[0].welcome, time: 'Hệ thống' }],
      'teacher-math': [{ sender: 'bot', text: channels[1].welcome, time: 'Giảng viên' }],
      'teacher-physics': [{ sender: 'bot', text: channels[2].welcome, time: 'Giảng viên' }],
      'teacher-english': [{ sender: 'bot', text: channels[3].welcome, time: 'Giảng viên' }]
    };
  });

  const messagesEndRef = useRef(null);

  // Sync URLs query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const channelId = params.get('channel');
    if (channelId) {
      const found = channels.find(c => c.id === channelId);
      if (found) {
        setActiveChannel(found);
      }
    }
  }, []);

  const handleChannelChange = (channel) => {
    setActiveChannel(channel);
    const params = new URLSearchParams(window.location.search);
    params.set('channel', channel.id);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  // Scroll to bottom when messages or typing changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistories, typing, activeChannel]);

  // Persist chat history
  useEffect(() => {
    localStorage.setItem('edupath_tutor_chat_histories', JSON.stringify(chatHistories));
  }, [chatHistories]);

  // Update guest count in localStorage
  useEffect(() => {
    localStorage.setItem('edupath_guest_questions_count', guestCount.toString());
  }, [guestCount]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    // Create preview URL
    const url = URL.createObjectURL(file);
    setSelectedFileUrl(url);
=======
import { 
  HiSparkles, HiPlus, HiMinus, HiTrash, HiSave, HiDownload, 
  HiDocumentText, HiRefresh, HiUpload, HiX, HiSearch, HiFolder,
  HiChat, HiChevronRight, HiChevronLeft, HiPlay
} from 'react-icons/hi';
import Tesseract from 'tesseract.js';
import { api, API_BASE } from '../api';
import { toast } from '../utils/toast';

// Default welcome mindmap to show on first load
const WELCOME_MINDMAP = {
  name: "Sơ đồ Tư duy AI",
  description: "Trình trực quan hóa kiến thức thông minh bằng AI. Tải tài liệu lên hoặc dán nội dung để bắt đầu lập sơ đồ tư duy ngay lập tức.",
  children: [
    {
      name: "1. Nhập Dữ Liệu",
      description: "Bạn có thể đưa kiến thức vào hệ thống bằng nhiều cách linh hoạt.",
      children: [
        {
          name: "Tải file văn bản",
          description: "Hỗ trợ các định dạng file TXT, MD chứa thông tin bài học."
        },
        {
          name: "Ảnh chụp (OCR)",
          description: "Chụp/Tải ảnh sách giáo khoa, ghi chép. AI sẽ dùng Tesseract để nhận diện chữ tiếng Việt cực chuẩn."
        },
        {
          name: "Dán văn bản",
          description: "Copy trực tiếp tài liệu từ trình duyệt hoặc ghi chú vào ô nhập liệu."
        }
      ]
    },
    {
      name: "2. Tính Năng Canvas",
      description: "Khám phá giao diện tương tác sơ đồ dạng hình cây cực kỳ mượt mà.",
      children: [
        {
          name: "Kéo thả & Thu phóng",
          description: "Dùng chuột kéo để di chuyển (pan), lăn chuột hoặc nhấn nút để phóng to, thu nhỏ."
        },
        {
          name: "Đóng / Mở nhánh",
          description: "Nhấp vào nút (+) hoặc (-) ở mép mỗi nút để ẩn hoặc hiện các nhánh con."
        },
        {
          name: "Xuất dữ liệu",
          description: "Tải sơ đồ về máy dưới dạng ảnh SVG chất lượng cao hoặc file dữ liệu JSON."
        }
      ]
    },
    {
      name: "3. Hỏi Đáp Với Nút",
      description: "Tương tác trực tiếp với từng phần kiến thức trên sơ đồ.",
      children: [
        {
          name: "Bảng Chi Tiết",
          description: "Nhấp vào bất kỳ nút nào để mở ngăn bên phải, hiển thị định nghĩa và diễn giải chi tiết."
        },
        {
          name: "Hỏi AI Theo Ngữ Cảnh",
          description: "Gửi câu hỏi trực tiếp cho AI về khái niệm của nút đó. AI sẽ trả lời bám sát vị trí kiến thức đó."
        }
      ]
    }
  ]
};

export default function AITutorPage({ currentUser, navigateTo, addLog }) {
  // Tabs & Views states
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'history'
  const [mindmapData, setMindmapData] = useState(null);
  
  // Input states
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  
  // Interactive Mindmap Canvas States
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [selectedNode, setSelectedNode] = useState(null);
  const [pan, setPan] = useState({ x: 50, y: 150 });
  const [zoom, setZoom] = useState(0.9);
  
  // Dragging Canvas State
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Node details chat states
  const [nodeChatMessages, setNodeChatMessages] = useState({}); // { [nodeId]: [{ sender, text, time }] }
  const [nodeChatInput, setNodeChatInput] = useState('');
  const [isNodeChatTyping, setIsNodeChatTyping] = useState(false);
  
  // Node CRUD States
  const [editNodeName, setEditNodeName] = useState('');
  const [editNodeDesc, setEditNodeDesc] = useState('');
  const [newChildName, setNewChildName] = useState('');
  const [newChildDesc, setNewChildDesc] = useState('');
  // Sidebar resizing and node shapes states
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [editNodeShape, setEditNodeShape] = useState('oval');
  const isDraggingSidebarRef = useRef(false);
  const [blankMindmapTitle, setBlankMindmapTitle] = useState('Sơ đồ tư duy mới');
  const examFileInputRef = useRef(null);
  const [isDraggingExamFile, setIsDraggingExamFile] = useState(false);

  const handleExamDragOver = (e) => {
    e.preventDefault();
    setIsDraggingExamFile(true);
  };

  const handleExamDragLeave = () => {
    setIsDraggingExamFile(false);
  };

  const handleExamDrop = (e) => {
    e.preventDefault();
    setIsDraggingExamFile(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      handleExamUpload(file);
    }
  };

  // Node Mastery Progress
  const [nodeProgressMap, setNodeProgressMap] = useState({});

  // Node Quiz States
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [quizStartTime, setQuizStartTime] = useState(0);

  // Weakness Analysis State
  const [isGeneratingWeakness, setIsGeneratingWeakness] = useState(false);

  // Exam Paper Analysis States
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [examUploadLoading, setExamUploadLoading] = useState(false);
  const [examAnalysisLoading, setExamAnalysisLoading] = useState(false);
  const [examText, setExamText] = useState('');
  const [examTitle, setExamTitle] = useState('');
  const [examFileUrl, setExamFileUrl] = useState('');
  const [examFileType, setExamFileType] = useState('');
  const [uploadedFileId, setUploadedFileId] = useState(null);
  const handleSidebarMouseDown = (e) => {
    e.preventDefault();
    isDraggingSidebarRef.current = true;
    document.body.style.cursor = 'col-resize';
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingSidebarRef.current) return;
      const newWidth = Math.max(200, Math.min(600, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isDraggingSidebarRef.current) {
        isDraggingSidebarRef.current = false;
        document.body.style.cursor = '';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
  
  // Saved Mindmaps History List
  const [savedMindmaps, setSavedMindmaps] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [activeMindmapDbId, setActiveMindmapDbId] = useState(null);

  // Refs
  const fileInputRef = useRef(null);
  const svgRef = useRef(null);
  const chatEndRef = useRef(null);

  const loadSharedMindmap = async (id) => {
    setIsLoading(true);
    setLoadingStep('Đang tải sơ đồ tư duy được chia sẻ...');
    try {
      const data = await api.getPublicMindmapById(id);
      const parsed = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
      const structured = assignIds(parsed);
      setMindmapData(structured);
      setActiveMindmapDbId(data.id);
      setSelectedNode(null);

      // Auto expand root + level 1
      const newExpanded = new Set();
      newExpanded.add(structured.id);
      structured.children?.forEach(ch => {
        newExpanded.add(ch.id);
      });
      setExpandedNodes(newExpanded);

      // Reset coordinates
      setZoom(0.9);
      setPan({ x: 50, y: 150 });
      
      toast(`Đã tải sơ đồ tư duy được chia sẻ: ${data.title}`, 'success');
    } catch (err) {
      console.error(err);
      toast('Không thể tải sơ đồ tư duy được chia sẻ hoặc link đã hết hạn.', 'error');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('share');
    if (shareId) {
      loadSharedMindmap(shareId);
    } else {
      // Load default mindmap
      const mapped = assignIds(WELCOME_MINDMAP);
      setMindmapData(mapped);
      
      // Auto-expand root and first level children
      const initialExpanded = new Set();
      initialExpanded.add(mapped.id);
      mapped.children?.forEach(ch => {
        initialExpanded.add(ch.id);
      });
      setExpandedNodes(initialExpanded);
    }

    // Fetch saved list if logged in
    if (currentUser) {
      fetchHistory();
    }
  }, [currentUser]);

  // Adjust scroll when new messages arrive in drawer
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [nodeChatMessages, selectedNode, isNodeChatTyping]);

  // Sync selected node with edit fields
  useEffect(() => {
    if (selectedNode) {
      setEditNodeName(selectedNode.name || '');
      setEditNodeDesc(selectedNode.description || '');
      setEditNodeShape(selectedNode.shape || 'oval');
      setNewChildName('');
      setNewChildDesc('');
    }
  }, [selectedNode]);

  // Panning & Zooming SVG passive event hook
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const scaleChange = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => Math.max(0.15, Math.min(3, prev * scaleChange)));
    };

    svgEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      svgEl.removeEventListener('wheel', handleWheel);
    };
  }, [svgRef.current]);

  // Fetch saved history
  const fetchHistory = async () => {
    if (!currentUser) {
      loadLocalHistory();
      return;
    }
    setIsHistoryLoading(true);
    try {
      const data = await api.getMindmaps();
      setSavedMindmaps(data || []);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const loadLocalHistory = () => {
    try {
      const stored = localStorage.getItem('edupath_saved_mindmaps');
      setSavedMindmaps(stored ? JSON.parse(stored) : []);
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to assign sequential unique ID paths to mindmap nodes
  const assignIds = (node, path = '0') => {
    const newNode = { ...node, id: path };
    if (node.children && node.children.length > 0) {
      newNode.children = node.children.map((child, idx) => assignIds(child, `${path}-${idx}`));
    }
    return newNode;
  };

  // Find node by path ID
  const findNodeById = (node, id) => {
    if (!node) return null;
    if (node.id === id) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findNodeById(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  // File drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  // Extract text from files (OCR or File Reader)
  const processFile = async (file) => {
    setSelectedFile(file);
    setIsLoading(true);
    
    try {
      if (file.type.startsWith('image/')) {
        setLoadingStep('Đang khởi tạo công cụ nhận dạng chữ OCR...');
        const result = await Tesseract.recognize(file, 'vie+eng', {
          logger: m => {
            if (m.status === 'recognizing') {
              setLoadingStep(`Nhận diện chữ trong ảnh (OCR): ${Math.round(m.progress * 100)}%`);
            }
          }
        });
        const text = result.data.text;
        if (!text || !text.trim()) {
          toast('Không tìm thấy văn bản nào trong ảnh này!', 'warning');
        } else {
          setInputText(text);
          toast('Nhận diện chữ thành công từ hình ảnh!', 'success');
        }
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        setLoadingStep('Đang đọc nội dung file văn bản...');
        const text = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (err) => reject(err);
          reader.readAsText(file);
        });
        setInputText(text);
        toast('Đã nạp văn bản từ file thành công!', 'success');
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setLoadingStep('Đang nạp công cụ đọc file PDF...');
        
        // Dynamically load PDF.js from cdnjs
        const pdfjs = await new Promise((resolve, reject) => {
          if (window.pdfjsLib) {
            resolve(window.pdfjsLib);
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
          script.onload = () => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
            resolve(window.pdfjsLib);
          };
          script.onerror = (err) => reject(new Error('Không thể tải thư viện xử lý PDF.'));
          document.body.appendChild(script);
        });

        setLoadingStep('Đang trích xuất nội dung chữ từ file PDF...');
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        const numPages = pdf.numPages;

        for (let i = 1; i <= numPages; i++) {
          setLoadingStep(`Đang trích xuất văn bản trang ${i} / ${numPages}...`);
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n';
        }

        if (!fullText.trim()) {
          toast('Không tìm thấy văn bản trong tệp PDF. Tệp có thể chứa ảnh quét (cần OCR).', 'warning');
          setInputText(`Tài liệu PDF: ${file.name}. Hãy tạo sơ đồ tư duy cho tài liệu này.`);
        } else {
          setInputText(fullText.substring(0, 15000)); // Limit to safe payload length
          toast(`Đã trích xuất văn bản từ ${numPages} trang PDF thành công!`, 'success');
        }
      } else {
        // PDF or other binary file fallback (simulate text extraction or guide user)
        setLoadingStep('Đang đọc dữ liệu cấu trúc file tài liệu...');
        await new Promise(r => setTimeout(r, 1200));
        
        const promptText = `Tài liệu: ${file.name} (Kích thước: ${Math.round(file.size / 1024)} KB). Hãy phân tích và tạo một sơ đồ tư duy phân chia các chủ đề cốt lõi của môn học/lĩnh vực này.`;
        setInputText(promptText);
        toast(`Đã nhận diện file ${file.name}. Nhấn 'Tạo Sơ Đồ' để AI phân tích theo tên tài liệu.`, 'success');
      }
    } catch (err) {
      console.error(err);
      toast('Lỗi khi đọc file tài liệu!', 'error');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
>>>>>>> 4bc1289b76ef82769a2eecdb6c5655fe53eecbeb
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
<<<<<<< HEAD
    if (selectedFileUrl) {
      URL.revokeObjectURL(selectedFileUrl);
      setSelectedFileUrl('');
    }
=======
    setInputText('');
>>>>>>> 4bc1289b76ef82769a2eecdb6c5655fe53eecbeb
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

<<<<<<< HEAD
  const handleSendMessage = async (textToSend = '') => {
    const text = textToSend || inputText;
    
    // Check if input is empty and no file attached
    if (!text.trim() && !selectedFile) return;

    // Check guest limits
    const isGuest = !currentUser;
    if (isGuest && guestCount >= 5) {
      return; // Intercepted by limit banner
    }

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const channelId = activeChannel.id;

    // Construct User Message
    const userMsg = {
      sender: 'user',
      text: text,
      time: timeString,
    };

    if (selectedFileUrl) {
      userMsg.image = selectedFileUrl;
      userMsg.fileName = selectedFile.name;
    }

    // Update state immediately
    const currentChannelHistory = chatHistories[channelId] || [];
    const updatedHistory = [...currentChannelHistory, userMsg];
    
    setChatHistories(prev => ({
      ...prev,
      [channelId]: updatedHistory
    }));

    // Reset input fields
    setInputText('');
    setSelectedFile(null);
    setSelectedFileUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setTyping(true);

    if (isGuest) {
      // Guest local streaming simulation
      setGuestCount(prev => prev + 1);
      
      setTimeout(() => {
        setTyping(false);
        let replyText = '';

        if (userMsg.image) {
          // Send OCR Response
          replyText = OCR_RESPONSES[channelId] || OCR_RESPONSES['ai-tutor'];
        } else {
          // Standard text replies
          if (channelId === 'ai-tutor') {
            replyText = `🤖 **EduBot AI trả lời:**\nChào em! Cảm ơn em đã gửi câu hỏi: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}".\n\nĐây là câu trả lời thử nghiệm của EduBot AI. Để có thể giải nhanh và phân tích sâu sắc các dạng bài Toán/Lý/Hóa/Anh chuẩn đề thi THPTQG 2026, em hãy đăng ký tài khoản Học viên nhé!`;
          } else {
            replyText = `Chào em! Thầy/Cô đã nhận được câu hỏi ôn thi của em. Thầy/Cô sẽ phân tích chi tiết và phản hồi lại em ngay sau khi lớp học kết thúc nhé. Trong lúc chờ đợi, em hãy làm thử các câu hỏi trắc nghiệm cùng chuyên đề để nâng cao kỹ năng nhé! 💪`;
          }
        }

        // Simulating character by character or word by word streaming response
        const botMsgId = Date.now();
        const initialBotMsg = {
          id: botMsgId,
          sender: 'bot',
          text: '',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setChatHistories(prev => ({
          ...prev,
          [channelId]: [...(prev[channelId] || []), initialBotMsg]
        }));

        let currentIdx = 0;
        const words = replyText.split(' ');
        const streamInterval = setInterval(() => {
          if (currentIdx < words.length) {
            const currentStr = words.slice(0, currentIdx + 1).join(' ');
            setChatHistories(prev => {
              const hist = prev[channelId] || [];
              const updated = hist.map(m => m.id === botMsgId ? { ...m, text: currentStr } : m);
              return { ...prev, [channelId]: updated };
            });
            currentIdx++;
          } else {
            clearInterval(streamInterval);
          }
        }, 80);

        if (addLog) {
          addLog(`Khách vãng lai (Guest) gửi câu hỏi thử nghiệm (${guestCount + 1}/5)`, 'sys');
        }
      }, 1200);

    } else {
      // Logged-in STUDENT: actual API call
      if (addLog) {
        addLog(`Học viên gửi câu hỏi cho AI: "${text.substring(0, 40)}..."`, 'sys');
      }

      if (channelId === 'ai-tutor') {
        const botMessageId = Date.now();
        const initialBotMsg = {
          id: botMessageId,
          sender: 'bot',
          text: '',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setChatHistories(prev => ({
          ...prev,
          [channelId]: [...(prev[channelId] || []), initialBotMsg]
        }));

        try {
          // Call Backend SSE stream API
          const response = await fetch(`${API_BASE}/ai/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({ message: text })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder('utf-8');
          let currentResponse = '';
          setTyping(false);

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6).trim();
                if (dataStr === '[DONE]') {
                  break;
                }
                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.text) {
                    currentResponse += parsed.text;
                    setChatHistories(prev => {
                      const hist = prev[channelId] || [];
                      const updated = hist.map(msg => 
                        msg.id === botMessageId ? { ...msg, text: currentResponse } : msg
                      );
                      return {
                        ...prev,
                        [channelId]: updated
                      };
                    });
                  }
                } catch (e) {
                  // ignore incomplete JSON
                }
              }
            }
          }
          if (addLog) addLog(`AI trả lời hoàn tất cho Học viên`, 'ai');
        } catch (err) {
          console.error("SSE Error:", err);
          setTyping(false);
          
          // Local fallback in case of connection issue
          let fallbackText = '';
          if (userMsg.image) {
            fallbackText = OCR_RESPONSES[channelId] || OCR_RESPONSES['ai-tutor'];
          } else {
            fallbackText = `Chào em! EduBot AI đã nhận được câu hỏi. Tuy nhiên, hệ thống kết nối AI đang quá tải hoặc cấu hình server của em chưa hoàn tất. \n\nEm có thể thử lại sau giây lát, hoặc đặt câu hỏi sang các kênh của các Thầy Cô nhé!`;
          }

          setChatHistories(prev => {
            const hist = prev[channelId] || [];
            const updated = hist.map(msg => 
              msg.id === botMessageId ? { ...msg, text: fallbackText } : msg
            );
            return {
              ...prev,
              [channelId]: updated
            };
          });
        }
      } else {
        // Other Teacher Channels (Mock responses)
        setTimeout(() => {
          setTyping(false);
          let replyText = '';
          if (userMsg.image) {
            replyText = OCR_RESPONSES[channelId];
          } else {
            replyText = `Cảm ơn em đã gửi câu hỏi. Thầy/Cô đã nhận được và sẽ sớm phản hồi chi tiết vào tối nay sau khi chấm xong bài thi thử của cả lớp nhé. Trong lúc đó, em hãy xem lại video bài giảng và giải trước bài tập tự luyện của chuyên đề này nhé! Chúc em học tốt! 💪`;
          }

          const botMessage = { 
            sender: 'bot', 
            text: replyText, 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          };

          setChatHistories(prev => ({
            ...prev,
            [channelId]: [...(prev[channelId] || []), botMessage]
          }));
        }, 1500);
      }
    }
  };

  const handleQuickPromptClick = (prompt) => {
    handleSendMessage(prompt);
=======
  // Trigger OpenRouter AI generation via Backend API
  const handleGenerateMindmap = async () => {
    const content = inputText.trim();
    if (!content) {
      toast('Vui lòng nhập văn bản hoặc tải file lên để tạo sơ đồ!', 'warning');
      return;
    }

    setIsLoading(true);
    setLoadingStep('AI đang phân tích kiến thức và trích xuất cấu trúc sơ đồ (khoảng 10-15s)...');
    setSelectedNode(null);

    if (addLog) {
      addLog(`Lập sơ đồ tư duy AI cho nội dung: "${content.substring(0, 50)}..."`, 'sys');
    }

    try {
      const result = await api.generateMindmap(content);
      
      const structured = assignIds(result);
      setMindmapData(structured);
      setActiveMindmapDbId(null); // unsaved new mindmap

      // Auto-expand root and first level
      const newExpanded = new Set();
      newExpanded.add(structured.id);
      structured.children?.forEach(ch => {
        newExpanded.add(ch.id);
      });
      setExpandedNodes(newExpanded);

      // Center layout
      setZoom(0.95);
      setPan({ x: 80, y: 180 });
      
      toast('Đã tạo sơ đồ tư duy thành công!', 'success');
      if (addLog) addLog('Đã trích xuất sơ đồ tư duy AI hoàn tất', 'ai');
    } catch (err) {
      console.error(err);
      toast(err.message || 'Lỗi khi tạo sơ đồ tư duy từ AI. Vui lòng thử lại!', 'error');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Node collapse / expand toggle handler
  const handleToggleExpand = (id) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
  };

  // SVB Tree coordinate layout algorithm (Horizontal Tree left-to-right)
  const computeTreeLayout = () => {
    if (!mindmapData) return { nodes: [], links: [] };

    // Inner recursive tree coordinate assigner
    const layoutSubtree = (node, depth = 0, state = { currentY: 50 }) => {
      const isExpanded = expandedNodes.has(node.id);
      const children = (isExpanded && node.children) ? node.children : [];
      
      const layoutNode = {
        id: node.id,
        name: node.name,
        description: node.description || '',
        depth,
        x: depth * 310 + 130, // spacing between columns
        y: 0,
        children: []
      };

      if (children.length === 0) {
        layoutNode.y = state.currentY;
        state.currentY += 95; // spacing between sibling leaves
      } else {
        const childLayouts = children.map(child => layoutSubtree(child, depth + 1, state));
        layoutNode.children = childLayouts;
        
        // Parent node Y coordinate is average of first and last child
        const firstY = childLayouts[0].y;
        const lastY = childLayouts[childLayouts.length - 1].y;
        layoutNode.y = (firstY + lastY) / 2;
      }
      return layoutNode;
    };

    const rootLayout = layoutSubtree(mindmapData);
    
    // Flatten helper
    const nodesList = [];
    const linksList = [];

    const flatten = (layoutNode) => {
      const rawNode = findNodeById(mindmapData, layoutNode.id);
      const hasChildren = rawNode && rawNode.children && rawNode.children.length > 0;

      nodesList.push({
        id: layoutNode.id,
        name: layoutNode.name,
        description: layoutNode.description,
        depth: layoutNode.depth,
        x: layoutNode.x,
        y: layoutNode.y,
        hasChildren,
        shape: rawNode?.shape || 'oval'
      });

      layoutNode.children.forEach(child => {
        linksList.push({
          id: `${layoutNode.id}->${child.id}`,
          source: { x: layoutNode.x, y: layoutNode.y },
          target: { x: child.x, y: child.y },
          depth: layoutNode.depth
        });
        flatten(child);
      });
    };

    flatten(rootLayout);
    return { nodes: nodesList, links: linksList };
  };

  const { nodes, links } = computeTreeLayout();

  // Canvas zoom actions
  const zoomIn = () => setZoom(prev => Math.min(3, prev * 1.15));
  const zoomOut = () => setZoom(prev => Math.max(0.15, prev * 0.85));
  const resetZoom = () => {
    setZoom(0.9);
    setPan({ x: 50, y: 150 });
  };

  // Canvas drag handlers
  const handleCanvasMouseDown = (e) => {
    // Drag allowed on background or svg element directly
    if (e.target.tagName === 'svg' || e.target.getAttribute('data-canvas-bg') === 'true') {
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (isDraggingCanvas) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingCanvas(false);
  };

  // Save mindmap to Database or localStorage
  const handleSaveMindmap = async () => {
    if (!mindmapData) return;

    if (!currentUser) {
      // Guest localStorage fallback
      try {
        const localId = activeMindmapDbId || `local-${Date.now()}`;
        const newMindmap = {
          id: localId,
          title: mindmapData.name.trim() || 'Sơ đồ tư duy không tên',
          content: mindmapData,
          createdAt: new Date().toISOString()
        };

        const stored = localStorage.getItem('edupath_saved_mindmaps');
        let list = stored ? JSON.parse(stored) : [];
        
        const existingIdx = list.findIndex(m => m.id === localId);
        if (existingIdx > -1) {
          list[existingIdx] = newMindmap;
        } else {
          list = [newMindmap, ...list];
        }

        localStorage.setItem('edupath_saved_mindmaps', JSON.stringify(list));
        setActiveMindmapDbId(localId);
        toast('Đã lưu sơ đồ tư duy vào bộ nhớ tạm trình duyệt!', 'success');
        
        loadLocalHistory();
      } catch (err) {
        console.error(err);
        toast('Lỗi khi lưu sơ đồ vào trình duyệt!', 'error');
      }
      return;
    }

    try {
      const response = await api.saveMindmap(mindmapData.name, mindmapData, activeMindmapDbId);
      toast('Đã lưu sơ đồ tư duy vào Thư viện thành công!', 'success');
      setActiveMindmapDbId(response.id);
      fetchHistory();
    } catch (err) {
      console.error(err);
      toast('Không thể lưu sơ đồ tư duy!', 'error');
    }
  };

  const fetchNodeProgress = async (mindmapId) => {
    if (!mindmapId || String(mindmapId).startsWith('local-')) return;
    try {
      const res = await api.getNodeProgress(mindmapId);
      if (res && res.success && res.data) {
        setNodeProgressMap(res.data);
      }
    } catch (e) {
      console.error("Lỗi khi tải tiến trình học tập:", e);
    }
  };

  useEffect(() => {
    if (activeMindmapDbId && !String(activeMindmapDbId).startsWith('local-')) {
      fetchNodeProgress(activeMindmapDbId);
    } else {
      setNodeProgressMap({});
    }
  }, [activeMindmapDbId]);

  const handleStartNodeQuiz = async () => {
    if (!mindmapData) return;
    if (!selectedNode) {
      toast("Vui lòng chọn một nút trên sơ đồ tư duy để làm quiz.", "warning");
      return;
    }
    
    let targetMindmapId = activeMindmapDbId;
    if (!targetMindmapId || String(targetMindmapId).startsWith('local-')) {
      toast("Đang tự động lưu sơ đồ tư duy trước khi làm quiz...", "info");
      try {
        const response = await api.saveMindmap(mindmapData.name, mindmapData, null);
        if (response && response.data) {
          targetMindmapId = response.data.id;
          setActiveMindmapDbId(targetMindmapId);
          const data = await api.getMindmaps();
          setSavedMindmaps(data || []);
        } else {
          toast("Lỗi tự động lưu sơ đồ tư duy.", "error");
          return;
        }
      } catch (e) {
        console.error("Lỗi tự động lưu:", e);
        toast("Lỗi tự động lưu sơ đồ tư duy.", "error");
        return;
      }
    }

    setQuizLoading(true);
    setIsQuizModalOpen(true);
    setQuizQuestions([]);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizResult(null);
    setQuizStartTime(Date.now());

    try {
      const res = await api.generateNodeQuiz(targetMindmapId, selectedNode.id);
      if (res && res.success && res.data) {
        setQuizQuestions(res.data);
      } else {
        toast("Không thể tải câu hỏi luyện tập.", "error");
        setIsQuizModalOpen(false);
      }
    } catch (e) {
      console.error(e);
      toast("Lỗi khi tải câu hỏi luyện tập từ AI.", "error");
      setIsQuizModalOpen(false);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSelectQuizOption = (questionId, optionIdx) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const handleSubmitQuiz = async () => {
    if (quizQuestions.length === 0 || quizSubmitted) return;
    
    if (Object.keys(selectedAnswers).length < quizQuestions.length) {
      toast("Vui lòng trả lời đầy đủ các câu hỏi trước khi nộp bài.", "warning");
      return;
    }

    setQuizLoading(true);
    const completionTime = Math.round((Date.now() - quizStartTime) / 1000);
    const formattedAnswers = Object.entries(selectedAnswers).map(([qId, optIdx]) => ({
      questionId: Number(qId),
      selectedOption: Number(optIdx)
    }));

    try {
      const res = await api.submitNodeQuiz(activeMindmapDbId, selectedNode.id, formattedAnswers, completionTime);
      if (res && res.success && res.data) {
        setQuizResult(res.data);
        setQuizSubmitted(true);
        fetchNodeProgress(activeMindmapDbId);
        toast(`Nộp bài thành công! Bạn đạt ${res.data.score}/${res.data.total} câu.`, "success");
      } else {
        toast("Lỗi nộp bài thi trắc nghiệm.", "error");
      }
    } catch (e) {
      console.error(e);
      toast("Lỗi nộp bài thi trắc nghiệm.", "error");
    } finally {
      setQuizLoading(false);
    }
  };

  const handleGenerateWeaknessMindmap = async () => {
    setIsGeneratingWeakness(true);
    try {
      const res = await api.generateWeaknessMindmap();
      if (res && res.success && res.data) {
        const parsed = typeof res.data.content === 'string' ? JSON.parse(res.data.content) : res.data.content;
        const structured = assignIds(parsed);
        setMindmapData(structured);
        setActiveMindmapDbId(res.data.id);
        setSelectedNode(null);

        const newExpanded = new Set();
        newExpanded.add(structured.id);
        structured.children?.forEach(ch => {
          newExpanded.add(ch.id);
        });
        setExpandedNodes(newExpanded);

        const listData = await api.getMindmaps();
        setSavedMindmaps(listData || []);
        
        toast("Đã tạo thành công Sơ đồ tư duy khắc phục lỗ hổng kiến thức!", "success");
      } else if (res && res.message) {
        toast(res.message, "info");
      } else {
        toast("Không thể chẩn đoán vùng yếu. Hãy làm thêm một số bài quiz nhé!", "warning");
      }
    } catch (e) {
      console.error(e);
      toast("Lỗi khi tạo sơ đồ vùng yếu bằng AI.", "error");
    } finally {
      setIsGeneratingWeakness(false);
    }
  };

  const handleExamUpload = async (file) => {
    if (!file) return;
    const allowed = ['pdf', 'docx', 'png', 'jpg', 'jpeg', 'txt', 'md'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !allowed.includes(ext)) {
      toast("Tệp tin không được hỗ trợ! Chỉ cho phép PDF, DOCX, Hình ảnh hoặc Văn bản.", "warning");
      return;
    }

    setExamUploadLoading(true);
    setExamTitle(file.name.replace(/\.[^/.]+$/, ""));

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.uploadExamFile(formData);
      if (res && res.success && res.data) {
        setExamText(res.data.extractedText || '');
        setExamFileUrl(res.data.fileUrl || '');
        setExamFileType(res.data.fileType || '');
        setUploadedFileId(res.data.id);
        toast("Tải lên đề thi thành công! Đã trích xuất nội dung.", "success");
      } else {
        toast("Không thể trích xuất nội dung file.", "error");
      }
    } catch (e) {
      console.error(e);
      toast("Lỗi tải lên tệp tin.", "error");
    } finally {
      setExamUploadLoading(false);
    }
  };

  const handleAnalyzeExam = async () => {
    if (!examText.trim()) {
      toast("Nội dung đề thi trống. Hãy viết hoặc tải tệp tin.", "warning");
      return;
    }

    setExamAnalysisLoading(true);
    try {
      const res = await api.generateExamMindmap({
        title: examTitle.trim() || "Phân tích Đề thi",
        text: examText,
        fileUrl: examFileUrl,
        fileType: examFileType,
        uploadId: uploadedFileId
      });

      if (res && res.success && res.data) {
        const data = await api.getMindmapById(res.data.mindmapId);
        if (data) {
          const parsed = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
          const structured = assignIds(parsed);
          setMindmapData(structured);
          setActiveMindmapDbId(data.id);
          setSelectedNode(null);

          const newExpanded = new Set();
          newExpanded.add(structured.id);
          structured.children?.forEach(ch => {
            newExpanded.add(ch.id);
          });
          setExpandedNodes(newExpanded);

          const listData = await api.getMindmaps();
          setSavedMindmaps(listData || []);
          
          setIsExamModalOpen(false);
          toast("Đã lập thành công Sơ đồ tư duy cấu trúc đề thi!", "success");
        }
      } else {
        toast("AI lỗi khi phân tích đề thi.", "error");
      }
    } catch (e) {
      console.error(e);
      toast("Lỗi khi lập sơ đồ đề thi bằng AI.", "error");
    } finally {
      setExamAnalysisLoading(false);
    }
  };

  const getNodeProgressStyle = (node, isRoot, isLevel1) => {
    const nodeId = node.id;
    
    if (node.priority) {
      const priority = node.priority.toLowerCase();
      let priorityBg = 'rgba(249, 115, 22, 0.15)';
      let priorityBorder = '#F97316';
      if (priority === 'critical') {
        priorityBg = 'rgba(153, 27, 27, 0.18)';
        priorityBorder = '#991B1B';
      } else if (priority === 'high') {
        priorityBg = 'rgba(220, 38, 38, 0.15)';
        priorityBorder = '#DC2626';
      } else if (priority === 'medium') {
        priorityBg = 'rgba(217, 119, 6, 0.15)';
        priorityBorder = '#D97606';
      } else if (priority === 'low') {
        priorityBg = 'rgba(202, 138, 4, 0.15)';
        priorityBorder = '#CA8A04';
      }
      
      return {
        background: priorityBg,
        border: `2px solid ${priorityBorder}`,
        borderLeft: `6px solid ${priorityBorder}`,
        color: 'var(--text-primary)'
      };
    }

    const progress = nodeProgressMap[nodeId];
    if (!progress || progress.mastery === undefined) {
      return {
        background: isRoot 
          ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' 
          : (isLevel1 ? 'var(--bg-card)' : 'var(--bg-main)'),
        borderLeft: isRoot ? 'none' : (isLevel1 ? '6px solid #8B5CF6' : '6px solid #0D9488'),
        border: isRoot ? 'none' : (isLevel1 ? '2px solid #8B5CF6' : '1px solid var(--border)'),
        color: isRoot ? '#FFFFFF' : 'var(--text-primary)'
      };
    }

    const mastery = progress.mastery;
    let masteryColor = '#94A3B8';
    let borderColor = '#94A3B8';

    if (mastery < 0.4) {
      masteryColor = 'rgba(239, 68, 68, 0.15)';
      borderColor = '#EF4444';
    } else if (mastery < 0.6) {
      masteryColor = 'rgba(249, 115, 22, 0.15)';
      borderColor = '#F97316';
    } else if (mastery < 0.8) {
      masteryColor = 'rgba(234, 179, 8, 0.15)';
      borderColor = '#EAB308';
    } else if (mastery < 0.9) {
      masteryColor = 'rgba(59, 130, 246, 0.15)';
      borderColor = '#3B82F6';
    } else {
      masteryColor = 'rgba(16, 185, 129, 0.15)';
      borderColor = '#10B981';
    }

    if (isRoot) {
      return {
        background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
        border: `3px solid ${borderColor}`,
        color: '#FFFFFF',
        borderLeft: 'none'
      };
    }

    return {
      background: masteryColor,
      border: `2px solid ${borderColor}`,
      borderLeft: `6px solid ${borderColor}`,
      color: 'var(--text-primary)'
    };
  };

  const getNodeTooltip = (node) => {
    const nodeId = node.id;
    const progress = nodeProgressMap[nodeId];
    
    if (node.priority) {
      return `${node.name}\n---\nKhắc phục sai sót [Mức: ${node.priority}]\nGợi ý: ${node.description || 'Xem lại kiến thức'}`;
    }
    
    if (!progress || progress.mastery === undefined) {
      return `${node.name}\nTiến độ: Chưa bắt đầu`;
    }
    
    const mastery = progress.mastery;
    let status = 'Chưa luyện tập';
    if (mastery < 0.4) status = 'Yếu';
    else if (mastery < 0.6) status = 'Cơ bản';
    else if (mastery < 0.8) status = 'Khá';
    else if (mastery < 0.9) status = 'Giỏi';
    else status = 'Thành thạo';

    const dateStr = progress.lastPracticed ? new Date(progress.lastPracticed).toLocaleDateString('vi-VN') : 'Chưa rõ';

    return `${node.name}\n---\nĐộ thành thạo: ${status} (${Math.round(mastery * 100)}%)\nĐiểm cao nhất: ${progress.bestScore || 0}/10\nSố lần luyện tập: ${progress.attempts || 0}\nLần luyện tập cuối: ${dateStr}`;
  };

  const handleShareMindmap = () => {
    if (!activeMindmapDbId) {
      toast('Vui lòng lưu sơ đồ tư duy trước khi chia sẻ!', 'warning');
      return;
    }
    const shareUrl = `${window.location.origin}/ai-tutor?share=${activeMindmapDbId}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        toast('Đã sao chép liên kết chia sẻ sơ đồ tư duy!', 'success');
      })
      .catch((err) => {
        console.error(err);
        toast('Không thể sao chép liên kết chia sẻ!', 'error');
      });
  };

  const handleCreateBlankMindmap = () => {
    const name = prompt('Nhập tiêu đề cho sơ đồ tư duy mới của bạn:', 'Sơ đồ tư duy của tôi');
    if (name === null) return;
    const finalName = name.trim() || 'Sơ đồ tư duy của tôi';

    const newRoot = {
      name: finalName,
      description: 'Chủ đề gốc. Chọn nút này và sử dụng bảng bên phải để thêm nút con hoặc chỉnh sửa nội dung.',
      children: []
    };

    const structured = assignIds(newRoot);
    setMindmapData(structured);
    setActiveMindmapDbId(null);
    setSelectedNode(null);

    // Expand root node
    const newExpanded = new Set();
    newExpanded.add(structured.id);
    setExpandedNodes(newExpanded);

    // Center layout
    setZoom(1.0);
    setPan({ x: 150, y: 200 });

    toast('Đã khởi tạo sơ đồ tư duy trống mới! Bấm chọn nút và sử dụng bảng bên phải để bắt đầu thiết kế.', 'success');
  };

  // Node CRUD Action Handlers
  const handleUpdateNode = () => {
    if (!editNodeName.trim()) {
      toast('Tên nút không được để trống!', 'warning');
      return;
    }
    const nodeId = selectedNode.id;
    const name = editNodeName.trim();
    const desc = editNodeDesc.trim();
    const shape = editNodeShape;

    const updateNodeInTree = (node) => {
      if (node.id === nodeId) {
        return { ...node, name, description: desc, shape };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateNodeInTree)
        };
      }
      return node;
    };

    const updatedData = updateNodeInTree(mindmapData);
    setMindmapData(updatedData);
    setSelectedNode(findNodeById(updatedData, nodeId));
    toast('Đã cập nhật thông tin nút sơ đồ!', 'success');
  };

  const handleAddChildNode = () => {
    if (!newChildName.trim()) {
      toast('Tên nút con không được để trống!', 'warning');
      return;
    }
    const parentId = selectedNode.id;
    const name = newChildName.trim();
    const desc = newChildDesc.trim();

    const addChildToTree = (node) => {
      if (node.id === parentId) {
        const newChild = {
          name,
          description: desc,
          children: []
        };
        return {
          ...node,
          children: node.children ? [...node.children, newChild] : [newChild]
        };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(addChildToTree)
        };
      }
      return node;
    };

    const updatedData = addChildToTree(mindmapData);
    const structured = assignIds(updatedData);
    setMindmapData(structured);
    
    // Automatically expand parent node to see the new child
    setExpandedNodes(prev => {
      const next = new Set(prev);
      next.add(parentId);
      return next;
    });

    setSelectedNode(findNodeById(structured, parentId));
    setNewChildName('');
    setNewChildDesc('');
    toast('Đã thêm nút con thành công!', 'success');
  };

  const handleDeleteNode = () => {
    if (selectedNode.id === mindmapData.id) {
      toast('Không thể xóa nút gốc của sơ đồ tư duy! Bạn có thể chỉnh sửa nó.', 'warning');
      return;
    }
    if (!confirm('Bạn có chắc chắn muốn xóa nút này cùng tất cả các nhánh con của nó?')) return;
    
    const nodeId = selectedNode.id;

    const deleteNodeFromTree = (node) => {
      if (node.children) {
        const hasTarget = node.children.some(ch => ch.id === nodeId);
        if (hasTarget) {
          return {
            ...node,
            children: node.children.filter(ch => ch.id !== nodeId)
          };
        }
        return {
          ...node,
          children: node.children.map(deleteNodeFromTree)
        };
      }
      return node;
    };

    const updatedData = deleteNodeFromTree(mindmapData);
    const structured = assignIds(updatedData);
    setMindmapData(structured);
    setSelectedNode(null); // Close drawer since selected node is deleted
    toast('Đã xóa nút sơ đồ thành công!', 'success');
  };

  // Load mindmap from history
  const handleLoadMindmap = (savedItem) => {
    try {
      const parsed = typeof savedItem.content === 'string' ? JSON.parse(savedItem.content) : savedItem.content;
      const structured = assignIds(parsed);
      setMindmapData(structured);
      setActiveMindmapDbId(savedItem.id);
      setSelectedNode(null);

      // Auto expand root + level 1
      const newExpanded = new Set();
      newExpanded.add(structured.id);
      structured.children?.forEach(ch => {
        newExpanded.add(ch.id);
      });
      setExpandedNodes(newExpanded);

      // Reset coordinates
      setZoom(0.9);
      setPan({ x: 50, y: 150 });
      
      toast(`Đã tải sơ đồ: ${savedItem.title}`, 'success');
    } catch (err) {
      console.error(err);
      toast('Không thể parse dữ liệu sơ đồ tư duy đã lưu!', 'error');
    }
  };

  // Delete saved mindmap
  const handleDeleteMindmap = async (e, id) => {
    e.stopPropagation(); // stop click from loading
    if (!confirm('Bạn có chắc chắn muốn xóa sơ đồ tư duy này?')) return;

    if (!currentUser || String(id).startsWith('local-')) {
      // Local delete
      try {
        const stored = localStorage.getItem('edupath_saved_mindmaps');
        if (stored) {
          const list = JSON.parse(stored);
          const nextList = list.filter(m => m.id !== id);
          localStorage.setItem('edupath_saved_mindmaps', JSON.stringify(nextList));
          if (activeMindmapDbId === id) {
            setActiveMindmapDbId(null);
          }
          loadLocalHistory();
          toast('Đã xóa sơ đồ tư duy khỏi trình duyệt!', 'success');
        }
      } catch (err) {
        console.error(err);
        toast('Lỗi khi xóa sơ đồ tư duy!', 'error');
      }
      return;
    }

    try {
      await api.deleteMindmap(id);
      toast('Đã xóa sơ đồ tư duy khỏi Thư viện!', 'success');
      if (activeMindmapDbId === id) {
        setActiveMindmapDbId(null);
      }
      fetchHistory();
    } catch (err) {
      console.error(err);
      toast('Lỗi khi xóa sơ đồ tư duy!', 'error');
    }
  };

  // Export options
  const handleExportSvg = () => {
    if (!svgRef.current) return;
    try {
      const svgString = new XMLSerializer().serializeToString(svgRef.current);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = `${mindmapData?.name || 'mindmap'}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast('Đã xuất file SVG thành công!', 'success');
    } catch (err) {
      console.error(err);
      toast('Lỗi khi xuất SVG!', 'error');
    }
  };

  const handleExportJson = () => {
    if (!mindmapData) return;
    try {
      const jsonString = JSON.stringify(mindmapData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = `${mindmapData.name || 'mindmap'}.json`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast('Đã xuất file JSON thành công!', 'success');
    } catch (err) {
      console.error(err);
      toast('Lỗi khi xuất JSON!', 'error');
    }
  };

  // Q&A Node Chat submissions (calls Backend chat endpoint streaming response)
  const handleSendNodeQuestion = async (predefinedText = '') => {
    const text = predefinedText || nodeChatInput;
    if (!text.trim() || !selectedNode || isNodeChatTyping) return;

    const nodeId = selectedNode.id;
    const currentMessages = nodeChatMessages[nodeId] || [];
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const userMsg = { sender: 'user', text, time: timeString };
    const updatedMsgs = [...currentMessages, userMsg];

    setNodeChatMessages(prev => ({
      ...prev,
      [nodeId]: updatedMsgs
    }));
    
    setNodeChatInput('');
    setIsNodeChatTyping(true);

    if (addLog) {
      addLog(`Hỏi AI về nút [${selectedNode.name}]: "${text.substring(0, 30)}..."`, 'sys');
    }

    // Embed contextual node info to instruct AI
    const contextualPrompt = `Trong sơ đồ tư duy tên "${mindmapData.name}", tôi đang quan sát mục "${selectedNode.name}" có phần nội dung tóm tắt là: "${selectedNode.description}". Hãy giải đáp chi tiết câu hỏi này của tôi liên quan đến khái niệm này: "${text}"`;

    // Bot message template
    const botMsgId = Date.now();
    const initialBotMsg = { id: botMsgId, sender: 'bot', text: '', time: 'Hệ thống' };
    
    setNodeChatMessages(prev => ({
      ...prev,
      [nodeId]: [...(prev[nodeId] || []), initialBotMsg]
    }));

    try {
      const response = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
        },
        body: JSON.stringify({ message: contextualPrompt })
      });

      if (!response.ok) {
        throw new Error(`Connection status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let botResponseText = '';
      setIsNodeChatTyping(false);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                botResponseText += parsed.text;
                
                setNodeChatMessages(prev => {
                  const list = prev[nodeId] || [];
                  const mapped = list.map(m => m.id === botMsgId ? { ...m, text: botResponseText } : m);
                  return { ...prev, [nodeId]: mapped };
                });
              }
            } catch (e) {
              // ignore JSON fragments
            }
          }
        }
      }

      if (addLog) addLog('AI trả lời câu hỏi nút hoàn thành', 'ai');
    } catch (err) {
      console.error(err);
      setIsNodeChatTyping(false);
      
      const errorMsg = 'Chào bạn! EduBot AI đã nhận được câu hỏi. Tuy nhiên kết nối máy chủ AI đang tải hoặc tài khoản của bạn chưa đăng nhập. Bạn hãy đăng nhập để hỏi đáp đầy đủ cùng AI nhé!';
      setNodeChatMessages(prev => {
        const list = prev[nodeId] || [];
        const mapped = list.map(m => m.id === botMsgId ? { ...m, text: errorMsg } : m);
        return { ...prev, [nodeId]: mapped };
      });
    }
>>>>>>> 4bc1289b76ef82769a2eecdb6c5655fe53eecbeb
  };

  const handleNavigateToAuth = (mode) => {
    navigateTo('/');
<<<<<<< HEAD
    // Use timeout to let navigation take effect
=======
>>>>>>> 4bc1289b76ef82769a2eecdb6c5655fe53eecbeb
    setTimeout(() => {
      const event = new CustomEvent('edupath-auth-redirect', { detail: { mode } });
      window.dispatchEvent(event);
    }, 100);
  };

  return (
    <div className="aitutor-page">
      {/* Stand-alone Header for Guests */}
      {!currentUser && (
        <header className="aitutor-guest-header animate-in">
          <a href="/" className="aitutor-guest-logo" onClick={(e) => { e.preventDefault(); navigateTo('/'); }}>
            <span>EduPath <em>AI</em></span>
          </a>
          <div className="aitutor-guest-nav">
            <a href="/" onClick={(e) => { e.preventDefault(); navigateTo('/'); }}>Trang chủ</a>
            <a href="/courses" onClick={(e) => { e.preventDefault(); navigateTo('/courses'); }}>Khóa học</a>
            <a href="/mock-exams" onClick={(e) => { e.preventDefault(); navigateTo('/mock-exams'); }}>Thi thử</a>
            <button className="aitutor-guest-btn-login" onClick={() => handleNavigateToAuth('login')}>Đăng nhập</button>
            <button className="aitutor-guest-btn-signup" onClick={() => handleNavigateToAuth('signup')}>Đăng ký</button>
          </div>
        </header>
      )}

      {/* Main Workspace grid */}
<<<<<<< HEAD
      <div className="aitutor-workspace">
        {/* Left sidebar: channels */}
        <aside className="aitutor-sidebar">
          <div className="aitutor-sidebar-title">Hội thoại gia sư AI</div>
          <div className="aitutor-channels-list">
            {channels.map((ch) => {
              const isActive = activeChannel.id === ch.id;
              return (
                <button
                  key={ch.id}
                  className={`aitutor-channel-item ${isActive ? 'aitutor-channel-item--active' : ''}`}
                  onClick={() => handleChannelChange(ch)}
                >
                  <div className="aitutor-channel-avatar">{ch.avatar}</div>
                  <div className="aitutor-channel-info">
                    <div className="aitutor-channel-name">{ch.name}</div>
                    <div className="aitutor-channel-subject">{ch.subject}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right chat panel */}
        <main className="aitutor-chat-panel">
          {/* Panel Header */}
          <div className="aitutor-chat-header">
            <div className="aitutor-chat-header-left">
              <div className="aitutor-channel-avatar" style={{ width: 38, height: 38, fontSize: 18 }}>
                {activeChannel.avatar}
              </div>
              <div>
                <h4 className="aitutor-active-title">{activeChannel.name}</h4>
                <div className="aitutor-active-status">
                  <span className="aitutor-status-dot" /> Đang trực tuyến
                </div>
              </div>
            </div>
            
            <div className="aitutor-badge-pro">
              <HiSparkles /> {activeChannel.type === 'ai' ? 'Trợ lý AI' : 'Gia sư Chuyên môn'}
            </div>
          </div>

          {/* Messages display */}
          <div className="aitutor-chat-messages">
            {chatHistories[activeChannel.id]?.map((msg, index) => {
              const isUser = msg.sender === 'user';
              return (
                <div 
                  key={index} 
                  className={`aitutor-msg-wrapper ${isUser ? 'aitutor-msg-wrapper--user' : 'aitutor-msg-wrapper--bot'}`}
                >
                  {/* Photo attachment display if present */}
                  {msg.image && (
                    <div className="aitutor-ocr-image-preview">
                      <img src={msg.image} alt="Bài tập đính kèm" />
                    </div>
                  )}

                  <div className={`aitutor-msg-bubble ${isUser ? 'aitutor-msg-bubble--user' : 'aitutor-msg-bubble--bot'}`}>
                    {msg.text.split('\n').map((line, lIdx) => (
                      <div key={lIdx} style={{ minHeight: '1.2em' }}>
                        {line.startsWith('🔍 **[Hệ thống OCR]**') ? (
                          <div className="aitutor-ocr-pill">
                            <HiCamera /> Nhận diện OCR bài tập thành công
                          </div>
                        ) : null}
                        
                        {/* Render simple bold markings in instructions */}
                        {line.includes('**') ? (
                          line.split('**').map((part, pIdx) => (
                            pIdx % 2 === 1 ? <strong key={pIdx}>{part}</strong> : part
                          ))
                        ) : line}
                      </div>
                    ))}
                  </div>
                  <span className="aitutor-msg-time">{msg.time}</span>
                </div>
              );
            })}

            {/* Typing indicator */}
            {typing && (
              <div className="aitutor-typing-bubble">
                <span className="aitutor-typing-dot" />
                <span className="aitutor-typing-dot" />
                <span className="aitutor-typing-dot" />
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Footer actions and typing */}
          <footer className="aitutor-chat-footer">
            {/* Quick Pills */}
            <div className="aitutor-quick-pills">
              {QUICK_PROMPTS[activeChannel.id]?.map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  className="aitutor-pill-btn"
                  onClick={() => handleQuickPromptClick(prompt)}
                  disabled={!currentUser && guestCount >= 5}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Pending Upload Preview */}
            {selectedFileUrl && (
              <div className="aitutor-pending-attachment">
                <img src={selectedFileUrl} alt="Thumbnail" className="aitutor-pending-thumb" />
                <span className="aitutor-pending-name">{selectedFile.name}</span>
                <button className="aitutor-pending-clear" onClick={clearSelectedFile}>
                  <HiX />
                </button>
              </div>
            )}

            {/* Main Input Row */}
            <div className="aitutor-input-row">
              {/* Attach camera button */}
              <button 
                className="aitutor-attach-btn" 
                onClick={() => fileInputRef.current?.click()}
                title="Đính kèm ảnh bài tập để OCR nhận diện giải nhanh"
                disabled={!currentUser && guestCount >= 5}
              >
                <HiCamera />
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />

              <input
                type="text"
                className="aitutor-input-field"
                placeholder={
                  !currentUser && guestCount >= 5 
                    ? "Đăng nhập để tiếp tục hỏi..." 
                    : activeChannel.type === 'ai' 
                      ? "Nhập câu hỏi hoặc đính kèm ảnh bài tập cần giải..." 
                      : `Gửi tin nhắn thảo luận cho ${activeChannel.name}...`
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={!currentUser && guestCount >= 5}
              />

              <button
                className="aitutor-send-btn"
                onClick={() => handleSendMessage()}
                disabled={(!currentUser && guestCount >= 5) || (!inputText.trim() && !selectedFile)}
              >
                <HiPaperAirplane style={{ transform: 'rotate(90deg)' }} />
              </button>
            </div>

            {/* Guest limit warning banner */}
            {!currentUser && guestCount >= 5 && (
              <div className="aitutor-limit-banner animate-in">
                <div className="aitutor-limit-text">
                  ⚠️ Bạn đã dùng hết 5 lượt đặt câu hỏi thử nghiệm miễn phí dành cho khách. Hãy đăng nhập hoặc đăng ký tài khoản Học viên để tiếp tục học tập không giới hạn cùng EduBot AI nhé!
                </div>
                <div className="aitutor-limit-actions">
                  <button className="aitutor-limit-btn-login" onClick={() => handleNavigateToAuth('login')}>Đăng nhập</button>
                  <button className="aitutor-limit-btn-signup" onClick={() => handleNavigateToAuth('signup')}>Đăng ký</button>
                </div>
              </div>
            )}
          </footer>
        </main>
      </div>
=======
      <div 
        className="aitutor-workspace"
        style={{
          gridTemplateColumns: `${sidebarWidth}px 6px 1fr`,
          gap: '0px'
        }}
      >
        {/* Left sidebar: Control & history */}
        <aside className="aitutor-sidebar">
          {/* Tabs header */}
          <div className="aitutor-sidebar-tabs">
            <button 
              className={`aitutor-tab-btn ${activeTab === 'create' ? 'aitutor-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              <HiSparkles /> Tạo sơ đồ AI
            </button>
            <button 
              className={`aitutor-tab-btn ${activeTab === 'manual' ? 'aitutor-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('manual')}
            >
              <HiPlus /> Tự thiết kế
            </button>
            <button 
              className={`aitutor-tab-btn ${activeTab === 'history' ? 'aitutor-tab-btn--active' : ''}`}
              onClick={() => {
                setActiveTab('history');
                if (currentUser) fetchHistory();
              }}
            >
              <HiFolder /> Thư viện
            </button>
          </div>

          {/* Creation Panel */}
          {activeTab === 'create' && (
            <div className="aitutor-panel-content">
              <button 
                className="flashcard-btn-create-deck" 
                onClick={handleCreateBlankMindmap}
                style={{ marginBottom: '16px' }}
                title="Tự tay thiết kế sơ đồ tư duy của riêng bạn"
              >
                <HiPlus />
                <span>Tạo sơ đồ trống mới</span>
              </button>

              {/* Mindmap Guide card */}
              <div className="aitutor-guide-card" style={{
                background: 'rgba(255, 226, 89, 0.03)',
                border: '1px dashed rgba(255, 226, 89, 0.2)',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '16px',
                fontSize: '11px',
                color: 'var(--text-secondary)'
              }}>
                <h5 style={{ color: 'var(--fc-gold)', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 'bold' }}>
                  💡 HƯỚNG DẪN SỬ DỤNG HIỆU QUẢ
                </h5>
                <ul style={{ margin: 0, paddingLeft: '14px', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <li><strong>Tự động tạo:</strong> Dán văn bản hoặc tải file PDF/Ảnh học tập để AI phân tích vẽ sơ đồ.</li>
                  <li><strong>Tương tác kéo thả:</strong> Nhấp giữ chuột vào khoảng trống canvas để kéo sơ đồ, cuộn chuột để phóng to/thu nhỏ.</li>
                  <li><strong>Hỏi đáp chuyên sâu:</strong> Click chọn bất kỳ nút nào để mở bảng chat bên phải, chọn <em>Giải thích sâu</em> hoặc <em>Ví dụ</em> để ôn tập cùng EduBot AI.</li>
                  <li><strong>Lưu & Chia sẻ:</strong> Bấm <strong>Lưu</strong> ở trên cùng để đưa vào Thư viện cá nhân. Sau khi lưu, bấm <strong>🔗 Chia sẻ</strong> để copy link gửi cho bạn bè!</li>
                </ul>
              </div>

              {/* Drag & drop upload area */}
              <div 
                className={`aitutor-dropzone ${isDraggingFile ? 'aitutor-dropzone--active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  accept="image/*,text/plain,.txt,.md,application/pdf,.pdf"
                  style={{ display: 'none' }} 
                />
                <HiUpload className="aitutor-dropzone-icon" />
                <p className="aitutor-dropzone-title">Kéo & thả file vào đây</p>
                <p className="aitutor-dropzone-desc">Hỗ trợ Ảnh học tập (OCR), file ghi chú TXT, MD hoặc PDF</p>
                
                {selectedFile && (
                  <div className="aitutor-uploaded-tag" onClick={(e) => e.stopPropagation()}>
                    <HiDocumentText />
                    <span>{selectedFile.name}</span>
                    <button className="aitutor-clear-file" onClick={clearSelectedFile}>
                      <HiX />
                    </button>
                  </div>
                )}
              </div>

              {/* Paste Text input area */}
              <div className="aitutor-text-area-container">
                <label className="aitutor-textarea-label">Hoặc nhập/dán tài liệu kiến thức:</label>
                <textarea
                  className="aitutor-textarea"
                  placeholder="Dán đề bài, nội dung bài học hoặc đoạn văn bản tóm tắt vào đây. AI sẽ phân tích cấu trúc sơ đồ tư duy..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Action Trigger Button */}
              <button
                className="aitutor-action-btn"
                onClick={handleGenerateMindmap}
                disabled={isLoading || !inputText.trim()}
              >
                {isLoading ? (
                  <>
                    <span className="spinner" /> Đang phân tích...
                  </>
                ) : (
                  <>
                    <HiSparkles /> Tạo Sơ đồ tư duy AI
                  </>
                )}
              </button>

              {/* Loading progress status messages */}
              {isLoading && loadingStep && (
                <div className="aitutor-step-progress animate-in">
                  <span className="spinner-secondary" />
                  <p>{loadingStep}</p>
                </div>
              )}
            </div>
          )}

          {/* Manual Design Panel */}
          {activeTab === 'manual' && (
            <div className="aitutor-panel-content">
              {/* Section 1: Create Blank Mindmap */}
              <div className="manual-section" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '8px' }}>
                <h5 style={{ color: 'var(--fc-gold)', fontSize: '11px', fontWeight: 'bold', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  🆕 Tạo sơ đồ trống mới
                </h5>
                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                  <input
                    type="text"
                    className="flashcard-modal-input"
                    style={{ background: '#141410', width: '100%', fontSize: '12.5px', padding: '8px 10px', height: '36px', boxSizing: 'border-box' }}
                    placeholder="Nhập tên sơ đồ..."
                    value={blankMindmapTitle}
                    onChange={(e) => setBlankMindmapTitle(e.target.value)}
                  />
                  <button 
                    className="aitutor-action-btn"
                    style={{ padding: '8px 12px', fontSize: '12px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => {
                      const finalName = blankMindmapTitle.trim() || 'Sơ đồ tư duy của tôi';
                      const newRoot = {
                        name: finalName,
                        description: 'Chủ đề gốc. Chọn nút này để thêm nút con hoặc chỉnh sửa nội dung.',
                        children: []
                      };
                      const structured = assignIds(newRoot);
                      setMindmapData(structured);
                      setActiveMindmapDbId(null);
                      setSelectedNode(structured);
                      const newExpanded = new Set();
                      newExpanded.add(structured.id);
                      setExpandedNodes(newExpanded);
                      setZoom(1.0);
                      setPan({ x: 150, y: 200 });
                      toast('Đã khởi tạo sơ đồ tư duy trống mới!', 'success');
                    }}
                  >
                    <HiPlus /> Khởi tạo ngay
                  </button>
                </div>
              </div>

              {/* Section 2: CRUD Selected Node */}
              {selectedNode ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} className="animate-in">
                  <div className="manual-section">
                    <h5 style={{ color: 'var(--fc-gold)', fontSize: '11px', fontWeight: 'bold', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                      ✏️ Chỉnh sửa nút đã chọn
                    </h5>
                    
                    <label className="flashcard-modal-label" style={{ marginBottom: '4px', display: 'block', fontSize: '10px', color: 'var(--text-secondary)' }}>Tên nút sơ đồ</label>
                    <input 
                      type="text"
                      className="flashcard-modal-input"
                      style={{ background: '#141410', width: '100%', marginBottom: '10px', fontSize: '13px', height: '36px', padding: '0 10px', boxSizing: 'border-box' }}
                      value={editNodeName}
                      onChange={(e) => setEditNodeName(e.target.value)}
                    />

                    <label className="flashcard-modal-label" style={{ marginBottom: '4px', display: 'block', fontSize: '10px', color: 'var(--text-secondary)' }}>Mô tả chi tiết</label>
                    <textarea 
                      className="flashcard-modal-textarea"
                      style={{ background: '#141410', width: '100%', marginBottom: '10px', fontSize: '12px', padding: '8px 10px', boxSizing: 'border-box' }}
                      value={editNodeDesc}
                      onChange={(e) => setEditNodeDesc(e.target.value)}
                      rows={2}
                    />

                    <label className="flashcard-modal-label" style={{ marginBottom: '4px', display: 'block', fontSize: '10px', color: 'var(--text-secondary)' }}>Hình dạng nút</label>
                    <select 
                      className="flashcard-modal-input"
                      style={{ background: '#141410', width: '100%', marginBottom: '12px', fontSize: '12.5px', color: 'var(--text-primary)', border: '1px solid var(--border)', height: '36px', borderRadius: '10px', padding: '0 8px', boxSizing: 'border-box' }}
                      value={editNodeShape}
                      onChange={(e) => setEditNodeShape(e.target.value)}
                    >
                      <option value="oval">Hình Bầu Dục (Oval)</option>
                      <option value="rectangle">Hình Chữ Nhật (Rectangle)</option>
                      <option value="circle">Hình Tròn (Circle)</option>
                      <option value="rhombus">Hình Thoi (Rhombus)</option>
                    </select>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="flashcard-header-btn" 
                        onClick={handleUpdateNode}
                        style={{ background: 'var(--fc-gold)', color: '#12120e', border: 'none', padding: '8px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', flex: 1, borderRadius: '8px' }}
                      >
                        Cập nhật
                      </button>
                      {selectedNode.id !== '0' && (
                        <button 
                          className="flashcard-header-btn" 
                          onClick={handleDeleteNode}
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '8px 12px', fontSize: '11px', cursor: 'pointer', flex: 1, borderRadius: '8px' }}
                        >
                          Xóa nút
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="manual-section" style={{ borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                    <h5 style={{ color: 'var(--fc-gold)', fontSize: '11px', fontWeight: 'bold', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                      ➕ Thêm ý con vào nhánh
                    </h5>
                    
                    <input 
                      type="text"
                      className="flashcard-modal-input"
                      style={{ background: '#141410', width: '100%', marginBottom: '8px', fontSize: '12px', padding: '8px 10px', height: '36px', boxSizing: 'border-box' }}
                      placeholder="Nhập tiêu đề ý con..."
                      value={newChildName}
                      onChange={(e) => setNewChildName(e.target.value)}
                    />
                    <textarea 
                      className="flashcard-modal-textarea"
                      style={{ background: '#141410', width: '100%', marginBottom: '8px', fontSize: '12px', padding: '8px 10px', boxSizing: 'border-box' }}
                      placeholder="Nhập tóm tắt mô tả..."
                      value={newChildDesc}
                      onChange={(e) => setNewChildDesc(e.target.value)}
                      rows={2}
                    />
                    <button 
                      className="flashcard-header-btn" 
                      onClick={handleAddChildNode}
                      style={{ background: 'transparent', borderColor: 'var(--border)', padding: '8px 12px', fontSize: '11.5px', cursor: 'pointer', width: '100%', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      <HiPlus /> Thêm nút con
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '24px 12px',
                  fontSize: '11.5px',
                  color: 'var(--text-secondary)',
                  border: '1px dashed var(--border)',
                  borderRadius: '12px',
                  background: 'rgba(0,0,0,0.1)',
                  lineHeight: '1.5'
                }}>
                  🖱️ Hãy chọn một nút bất kỳ trên sơ đồ để bắt đầu chỉnh sửa hoặc thêm nhánh con mới.
                </div>
              )}
            </div>
          )}

          {/* History Saved Panel */}
          {activeTab === 'history' && (
            <div className="aitutor-panel-content" style={{ padding: '12px' }}>
              {!currentUser && (
                <div style={{
                  background: 'rgba(255, 226, 89, 0.03)',
                  border: '1px dashed rgba(255, 226, 89, 0.2)',
                  borderRadius: '10px',
                  padding: '10px',
                  marginBottom: '10px',
                  fontSize: '10.5px',
                  color: 'var(--mm-text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }} className="animate-in">
                  <span>💡 Bạn đang lưu sơ đồ tạm thời trên trình duyệt này.</span>
                  <button 
                    onClick={() => handleNavigateToAuth('login')}
                    style={{ background: 'var(--mm-gold)', color: '#12120e', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Đăng nhập để đồng bộ đám mây
                  </button>
                </div>
              )}
              {isHistoryLoading ? (
                <div className="aitutor-history-loading">
                  <span className="spinner-secondary" /> Đang tải danh sách...
                </div>
              ) : savedMindmaps.length === 0 ? (
                <div className="aitutor-history-empty">
                  Bạn chưa lưu sơ đồ tư duy nào.
                </div>
              ) : (
                <div className="aitutor-history-list">
                  {savedMindmaps.map((item) => (
                    <div 
                      key={item.id} 
                      className={`aitutor-history-item ${activeMindmapDbId === item.id ? 'aitutor-history-item--active' : ''}`}
                      onClick={() => handleLoadMindmap(item)}
                    >
                      <div className="aitutor-history-item-body">
                        <span className="aitutor-history-item-icon">🧠</span>
                        <div className="aitutor-history-item-details">
                          <p className="aitutor-history-item-title">{item.title}</p>
                          <span className="aitutor-history-item-date">
                            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                      <button 
                        className="aitutor-history-item-delete"
                        onClick={(e) => handleDeleteMindmap(e, item.id)}
                        title="Xóa sơ đồ tư duy"
                      >
                        <HiTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>

        <div className="aitutor-sidebar-resizer" onMouseDown={handleSidebarMouseDown} />

        {/* Center Canvas Workspace */}
        <main className="aitutor-chat-panel">
          {/* Header Actions */}
          <div className="aitutor-chat-header">
            <div className="aitutor-chat-header-left">
              <span className="aitutor-channel-avatar" style={{ width: 38, height: 38, fontSize: 18, background: '#EEF2F6', border: '1px solid var(--border)' }}>
                🧠
              </span>
              <div>
                <h4 className="aitutor-active-title" style={{ fontSize: '14.5px', fontWeight: 'bold' }}>
                  {mindmapData ? mindmapData.name : 'Sơ đồ tư duy'}
                </h4>
                <div className="aitutor-active-status" style={{ fontSize: '11px' }}>
                  {activeMindmapDbId ? '✓ Đã lưu đồng bộ' : '☁ Bản nháp (chưa lưu)'}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {mindmapData && (
                <>
                  <button 
                    className="canvas-action-pill"
                    onClick={handleGenerateWeaknessMindmap}
                    disabled={isGeneratingWeakness}
                    style={{
                      background: 'rgba(239, 68, 68, 0.12)',
                      borderColor: 'rgba(239, 68, 68, 0.3)',
                      color: '#EF4444'
                    }}
                    title="Phân tích lỗi sai & tạo sơ đồ lấp lỗ hổng kiến thức"
                  >
                    {isGeneratingWeakness ? (
                      <><span className="spinner-mini" style={{ display: 'inline-block', width: '10px', height: '10px', border: '2px solid #ef4444', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', marginRight: '4px' }} /> Đang tạo...</>
                    ) : (
                      <>⚡ Sơ đồ vùng yếu</>
                    )}
                  </button>

                  <button 
                    className="canvas-action-pill"
                    onClick={() => {
                      setIsExamModalOpen(true);
                      setExamText('');
                      setExamFileUrl('');
                      setExamFileType('');
                      setUploadedFileId(null);
                    }}
                    style={{
                      background: 'rgba(59, 130, 246, 0.12)',
                      borderColor: 'rgba(59, 130, 246, 0.3)',
                      color: '#3B82F6'
                    }}
                    title="Tải lên đề thi (PDF, DOCX, Ảnh) để lập sơ đồ cấu trúc chủ đề"
                  >
                    📝 Sơ đồ đề thi
                  </button>

                  <button 
                    className="canvas-action-pill" 
                    onClick={handleSaveMindmap} 
                    title="Lưu sơ đồ tư duy vào thư viện"
                  >
                    <HiSave /> Lưu
                  </button>
                  {activeMindmapDbId && (
                    <button 
                      className="canvas-action-pill" 
                      onClick={handleShareMindmap} 
                      title="Sao chép liên kết chia sẻ công khai"
                      style={{ background: 'rgba(255, 226, 89, 0.1)', color: 'var(--fc-gold)', border: '1px solid rgba(255, 226, 89, 0.2)' }}
                    >
                      🔗 Chia sẻ
                    </button>
                  )}
                  <div className="canvas-export-dropdown">
                    <button className="canvas-action-pill">
                      <HiDownload /> Xuất sơ đồ
                    </button>
                    <div className="canvas-export-menu">
                      <button onClick={handleExportSvg}>Xuất file SVG ảnh</button>
                      <button onClick={handleExportJson}>Xuất file JSON</button>
                    </div>
                  </div>
                </>
              )}
              <div className="aitutor-badge-pro">
                <HiSparkles /> Không gian AI
              </div>
            </div>
          </div>

          {/* Interactive SVG Canvas */}
          <div 
            className="aitutor-canvas-container"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            style={{ cursor: isDraggingCanvas ? 'grabbing' : 'grab' }}
          >
            {mindmapData ? (
              <svg 
                ref={svgRef}
                className="aitutor-svg"
                width="100%"
                height="100%"
              >
                {/* Background grid representation */}
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="var(--border)" strokeWidth="0.5" opacity="0.6" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" data-canvas-bg="true" />

                {/* Transform group with zoom/pan vector */}
                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                  
                  {/* Connection lines (bezier links) */}
                  {links.map((link) => {
                    const x1 = link.source.x + 110;
                    const y1 = link.source.y;
                    const x2 = link.target.x - 110;
                    const y2 = link.target.y;
                    const cx1 = x1 + 55;
                    const cy1 = y1;
                    const cx2 = x2 - 55;
                    const cy2 = y2;
                    const pathData = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
                    
                    // Style links based on hierarchy depth
                    let strokeColor = 'var(--border)';
                    if (link.depth === 0) strokeColor = '#818CF8'; // Indigo for Root -> Level 1
                    else if (link.depth === 1) strokeColor = '#C084FC'; // Purple for Level 1 -> Level 2

                    return (
                      <path
                        key={link.id}
                        d={pathData}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="2.5"
                        strokeDasharray={selectedNode?.id === link.target.id ? "4 2" : "none"}
                        style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
                      />
                    );
                  })}

                  {/* Nodes list mapping */}
                  {nodes.map((node) => {
                    const isSelected = selectedNode?.id === node.id;
                    const isRoot = node.depth === 0;
                    const isLevel1 = node.depth === 1;
                    const isExpanded = expandedNodes.has(node.id);

                    // Progress-based Styling
                    const progressStyle = getNodeProgressStyle(node, isRoot, isLevel1);

                    // Custom Shapes Styling
                    let borderRadius = '14px';
                    let borderLeft = progressStyle.borderLeft;
                    let border = progressStyle.border;
                    let clipPath = 'none';
                    let width = '100%';
                    let height = '100%';
                    let margin = '0';
                    let padding = '8px 12px';

                    if (node.shape === 'rectangle') {
                      borderRadius = '4px';
                    } else if (node.shape === 'oval') {
                      borderRadius = '100px';
                    } else if (node.shape === 'circle') {
                      borderRadius = '50%';
                      width = '80px';
                      height = '80px';
                      margin = '0 auto';
                      borderLeft = 'none';
                      border = progressStyle.border;
                      padding = '6px';
                    } else if (node.shape === 'rhombus') {
                      clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
                      borderRadius = '0px';
                      borderLeft = 'none';
                      border = progressStyle.border;
                      padding = '12px 28px';
                    }

                    return (
                      <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                        {/* Interactive HTML inside SVG foreignObject */}
                        <foreignObject x="-110" y="-40" width="220" height="80">
                          <div 
                            xmlns="http://www.w3.org/1999/xhtml"
                            onClick={() => handleNodeSelect(node)}
                            title={getNodeTooltip(node)}
                            style={{
                              width: width,
                              height: height,
                              margin: margin,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textAlign: 'center',
                              padding: padding,
                              boxSizing: 'border-box',
                              background: progressStyle.background,
                              color: progressStyle.color,
                              border: border,
                              borderLeft: borderLeft,
                              borderRadius: borderRadius,
                              clipPath: clipPath,
                              boxShadow: isSelected 
                                ? '0 0 0 3px #FFA751, 0 8px 16px rgba(0,0,0,0.12)' 
                                : '0 3px 8px rgba(0,0,0,0.06)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              overflow: 'hidden',
                              userSelect: 'none'
                            }}
                            className={`canvas-node-card ${isSelected ? 'canvas-node-card--selected' : ''}`}
                          >
                            <span 
                              style={{ 
                                fontSize: '11px', 
                                fontWeight: 'bold', 
                                lineHeight: '1.3',
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                display: '-webkit-box', 
                                WebkitLineClamp: 3, 
                                WebkitBoxOrient: 'vertical' 
                              }}
                              title={node.name}
                            >
                              {node.name}
                            </span>
                          </div>
                        </foreignObject>

                        {/* Node Collapse/Expand Toggle Controller */}
                        {node.hasChildren && (
                          <g 
                            transform="translate(110, 0)"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleExpand(node.id);
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            <circle 
                              r="10" 
                              fill="var(--bg-card)" 
                              stroke={isRoot ? '#4F46E5' : '#8B5CF6'}
                              strokeWidth="2"
                              style={{ transition: 'all 0.2s' }}
                            />
                            <text
                              textAnchor="middle"
                              dominantBaseline="central"
                              fontSize="13"
                              fontWeight="900"
                              fill="var(--text-primary)"
                              y="0.5"
                              style={{ userSelect: 'none' }}
                            >
                              {isExpanded ? '-' : '+'}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </g>
              </svg>
            ) : (
              <div className="aitutor-canvas-empty">
                <p>Nhập tài liệu ở cột trái để bắt đầu lập sơ đồ tư duy</p>
              </div>
            )}

            {/* Floating Zoom & Tool Controls bar */}
            {mindmapData && (
              <div className="aitutor-canvas-controls">
                <button className="control-btn" onClick={zoomIn} title="Phóng to (Scroll Up)">
                  <HiPlus />
                </button>
                <button className="control-btn" onClick={zoomOut} title="Thu nhỏ (Scroll Down)">
                  <HiMinus />
                </button>
                <button className="control-btn" onClick={resetZoom} title="Mặc định / Căn giữa">
                  <HiRefresh /> Căn giữa
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Right slide-in drawer details & AI mini-chat */}
        {selectedNode && (
          <aside className="aitutor-drawer animate-in-right">
            {/* Header */}
            <div className="aitutor-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>
                  {selectedNode.depth === 0 ? '👑' : (selectedNode.depth === 1 ? '🎯' : '💡')}
                </span>
                <span className="drawer-depth-tag">
                  {selectedNode.depth === 0 ? 'Chủ đề gốc' : (selectedNode.depth === 1 ? 'Chủ đề cấp 1' : 'Chi tiết cấp 2')}
                </span>
              </div>
              <button className="drawer-close-btn" onClick={() => setSelectedNode(null)}>
                <HiX />
              </button>
            </div>

            {/* Content Body scrollable */}
            <div className="aitutor-drawer-body">
              {/* Node Title & Description with CRUD Edits */}
              <div className="drawer-section">
                <label className="flashcard-modal-label" style={{ marginBottom: '4px', display: 'block', fontSize: '10px', color: 'var(--text-secondary)' }}>Tên nút sơ đồ</label>
                <input 
                  type="text"
                  className="flashcard-modal-input"
                  style={{ background: '#141410', width: '100%', marginBottom: '10px', fontSize: '14.5px', fontWeight: 'bold' }}
                  value={editNodeName}
                  onChange={(e) => setEditNodeName(e.target.value)}
                />

                <label className="flashcard-modal-label" style={{ marginBottom: '4px', display: 'block', fontSize: '10px', color: 'var(--text-secondary)' }}>Mô tả chi tiết</label>
                <textarea 
                  className="flashcard-modal-textarea"
                  style={{ background: '#141410', width: '100%', marginBottom: '10px', fontSize: '13px' }}
                  value={editNodeDesc}
                  onChange={(e) => setEditNodeDesc(e.target.value)}
                  rows={3}
                />

                <label className="flashcard-modal-label" style={{ marginBottom: '4px', display: 'block', fontSize: '10px', color: 'var(--text-secondary)' }}>Hình dạng nút</label>
                <select 
                  className="flashcard-modal-input"
                  style={{ background: '#141410', width: '100%', marginBottom: '12px', fontSize: '13.5px', color: 'var(--text-primary)', border: '1px solid var(--border)', height: '38px', borderRadius: '10px', padding: '0 10px' }}
                  value={editNodeShape}
                  onChange={(e) => setEditNodeShape(e.target.value)}
                >
                  <option value="oval">Hình Bầu Dục (Oval)</option>
                  <option value="rectangle">Hình Chữ Nhật (Rectangle)</option>
                  <option value="circle">Hình Tròn (Circle)</option>
                  <option value="rhombus">Hình Thoi (Rhombus)</option>
                </select>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <button 
                    className="flashcard-header-btn" 
                    onClick={handleUpdateNode}
                    style={{ background: 'var(--fc-gold)', color: '#12120e', border: 'none', padding: '6px 12px', fontSize: '11.5px', cursor: 'pointer' }}
                  >
                    Cập nhật nút
                  </button>
                  {selectedNode.id !== '0' && (
                    <button 
                      className="flashcard-header-btn" 
                      onClick={handleDeleteNode}
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '6px 12px', fontSize: '11.5px', cursor: 'pointer' }}
                    >
                      Xóa nút này
                    </button>
                  )}
                </div>
              </div>

              {/* Practice & Progress stats and quiz trigger */}
              <div className="drawer-section" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginBottom: '16px' }}>
                <h4 className="drawer-chat-title" style={{ marginBottom: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🎯 Luyện tập trắc nghiệm
                </h4>
                
                {/* Stats cards grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Độ thành thạo</div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: nodeProgressMap[selectedNode.id]?.mastery !== undefined
                        ? (nodeProgressMap[selectedNode.id].mastery >= 0.9 ? '#10B981' : nodeProgressMap[selectedNode.id].mastery >= 0.8 ? '#3B82F6' : nodeProgressMap[selectedNode.id].mastery >= 0.6 ? '#EAB308' : nodeProgressMap[selectedNode.id].mastery >= 0.4 ? '#F97316' : '#EF4444')
                        : 'var(--text-secondary)'
                    }}>
                      {nodeProgressMap[selectedNode.id]?.mastery !== undefined
                        ? `${Math.round(nodeProgressMap[selectedNode.id].mastery * 100)}%`
                        : 'Chưa học'
                      }
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Điểm cao nhất</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--fc-gold)' }}>
                      {nodeProgressMap[selectedNode.id]?.bestScore !== undefined
                        ? `${nodeProgressMap[selectedNode.id].bestScore}/10`
                        : '- / 10'
                      }
                    </div>
                  </div>
                </div>

                <button 
                  className="aitutor-action-btn" 
                  onClick={handleStartNodeQuiz}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '12.5px',
                    background: 'linear-gradient(135deg, #F97316, #FFE259)',
                    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '800',
                    color: '#12120e',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <HiSparkles /> Bắt đầu Quiz 10 câu
                </button>
              </div>

              {/* Add Child Node Form */}
              <div className="drawer-section" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginBottom: '16px' }}>
                <h4 className="drawer-chat-title" style={{ marginBottom: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ➕ Thêm ý con vào nhánh này
                </h4>
                
                <input 
                  type="text"
                  className="flashcard-modal-input"
                  style={{ background: '#141410', width: '100%', marginBottom: '8px', fontSize: '12px', padding: '8px 10px' }}
                  placeholder="Nhập tiêu đề ý con..."
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                />
                <textarea 
                  className="flashcard-modal-textarea"
                  style={{ background: '#141410', width: '100%', marginBottom: '8px', fontSize: '12px', padding: '8px 10px' }}
                  placeholder="Nhập tóm tắt mô tả..."
                  value={newChildDesc}
                  onChange={(e) => setNewChildDesc(e.target.value)}
                  rows={2}
                />
                <button 
                  className="flashcard-header-btn" 
                  onClick={handleAddChildNode}
                  style={{ background: 'transparent', borderColor: 'var(--border)', padding: '6px 12px', fontSize: '11.5px', cursor: 'pointer' }}
                >
                  <HiPlus style={{ marginRight: '4px' }} /> Thêm nút con
                </button>
              </div>

              {/* Contextual Q&A Section */}
              <div className="drawer-section drawer-chat-container">
                <h4 className="drawer-chat-title">
                  <HiChat style={{ marginRight: '6px', fontSize: '16px' }} />
                  Hỏi AI về nội dung này
                </h4>
                
                {/* Message Log */}
                <div className="drawer-chat-log">
                  <div className="drawer-msg drawer-msg--bot">
                    <div className="drawer-bubble">
                      Chào bạn! Có điểm lý thuyết nào ở phần <strong>{selectedNode.name}</strong> khiến bạn băn khoăn không? Hãy chọn câu hỏi gợi ý bên dưới hoặc tự đặt câu hỏi để mình giải đáp nhé!
                    </div>
                  </div>

                  {/* Log mapping */}
                  {nodeChatMessages[selectedNode.id]?.map((msg, idx) => (
                    <div key={idx} className={`drawer-msg drawer-msg--${msg.sender}`}>
                      <div className="drawer-bubble">
                        {msg.text.split('\n').map((line, lineIdx) => (
                          <div key={lineIdx}>{line}</div>
                        ))}
                      </div>
                      <span className="drawer-msg-time">{msg.time}</span>
                    </div>
                  ))}

                  {/* AI thinking state */}
                  {isNodeChatTyping && (
                    <div className="drawer-msg drawer-msg--bot">
                      <div className="drawer-bubble drawer-bubble--typing">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </div>
                    </div>
                  )}
                  
                  <div ref={chatEndRef} />
                </div>

                {/* Pre-defined Chips */}
                <div className="drawer-chat-chips">
                  <button 
                    onClick={() => handleSendNodeQuestion("Giải thích chi tiết hơn cho em phần kiến thức này")}
                    disabled={isNodeChatTyping}
                  >
                    🔍 Giải thích sâu
                  </button>
                  <button 
                    onClick={() => handleSendNodeQuestion("Cho em xin 2 ví dụ thực tế liên quan")}
                    disabled={isNodeChatTyping}
                  >
                    💡 Ví dụ cụ thể
                  </button>
                  <button 
                    onClick={() => handleSendNodeQuestion("Tạo 2 câu hỏi trắc nghiệm nhanh để ôn luyện phần này")}
                    disabled={isNodeChatTyping}
                  >
                    ✏️ Luyện tập nhanh
                  </button>
                </div>

                {/* Question Input */}
                <div className="drawer-chat-input-bar">
                  <input
                    type="text"
                    placeholder="Hỏi AI thêm về phần này..."
                    value={nodeChatInput}
                    onChange={(e) => setNodeChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendNodeQuestion()}
                    disabled={isNodeChatTyping}
                  />
                  <button 
                    onClick={() => handleSendNodeQuestion()}
                    disabled={isNodeChatTyping || !nodeChatInput.trim()}
                  >
                    <HiPlay />
                  </button>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Quiz Modal overlay */}
      {isQuizModalOpen && (
        <div className="mm-modal-overlay animate-in">
          <div className="mm-modal-card mm-quiz-modal">
            {/* Header */}
            <div className="mm-modal-header">
              <h3 className="mm-modal-title">
                🎯 Luyện tập: {selectedNode?.name}
              </h3>
              <button 
                className="mm-modal-close" 
                onClick={() => {
                  if (quizSubmitted || confirm("Bạn đang làm dở bài quiz. Bạn có chắc chắn muốn thoát?")) {
                    setIsQuizModalOpen(false);
                  }
                }}
              >
                <HiX />
              </button>
            </div>

            {/* Body */}
            <div className="mm-modal-body">
              {quizLoading ? (
                <div className="mm-quiz-loading-container">
                  <span className="spinner-secondary mm-quiz-spinner" />
                  <p className="mm-quiz-loading-text">
                    EduPath AI đang biên tập 10 câu hỏi trắc nghiệm bám sát cấu trúc đề thi THPT Quốc gia...
                  </p>
                  <p className="mm-quiz-loading-sub">Vui lòng chờ trong giây lát (khoảng 5-10 giây)</p>
                </div>
              ) : quizQuestions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                  Không thể tải câu hỏi trắc nghiệm. Hãy đóng modal và thử lại.
                </div>
              ) : (
                <>
                  {/* Progress Header / Sequential Nav */}
                  {!quizSubmitted && (
                    <div className="mm-quiz-progress-bar">
                      <div className="mm-quiz-progress-text">
                        <span>Câu hỏi {currentQuestionIdx + 1} / {quizQuestions.length}</span>
                        <span>Đã trả lời: {Object.keys(selectedAnswers).length} / {quizQuestions.length}</span>
                      </div>
                      <div className="mm-quiz-progress-track">
                        <div 
                          className="mm-quiz-progress-fill" 
                          style={{ width: `${((currentQuestionIdx + 1) / quizQuestions.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Sequential Question View */}
                  {!quizSubmitted ? (
                    <div className="mm-quiz-question-container">
                      <h4 className="mm-quiz-question-text">
                        {quizQuestions[currentQuestionIdx]?.questionText}
                      </h4>
                      
                      <div className="mm-quiz-options-grid">
                        {(quizQuestions[currentQuestionIdx]?.options || []).map((option, idx) => {
                          const isSelected = selectedAnswers[quizQuestions[currentQuestionIdx].id] === idx;
                          return (
                            <button
                              key={idx}
                              className={`mm-quiz-option-btn ${isSelected ? 'mm-quiz-option-btn--selected' : ''}`}
                              onClick={() => handleSelectQuizOption(quizQuestions[currentQuestionIdx].id, idx)}
                            >
                              <span className="option-label">
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span className="option-text">{option}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Navigation buttons */}
                      <div className="mm-quiz-navigation">
                        <button
                          className="mm-quiz-nav-btn"
                          disabled={currentQuestionIdx === 0}
                          onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                        >
                          <HiChevronLeft /> Câu trước
                        </button>
                        
                        {currentQuestionIdx < quizQuestions.length - 1 ? (
                          <button
                            className="mm-quiz-nav-btn"
                            onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                          >
                            Câu tiếp <HiChevronRight />
                          </button>
                        ) : (
                          <button
                            className="mm-quiz-submit-btn"
                            onClick={handleSubmitQuiz}
                          >
                            <HiSparkles /> Nộp bài & Xem kết quả
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Quiz Results Dashboard & Review */
                    <div className="mm-quiz-results-container">
                      {/* Score circle & details */}
                      <div className="mm-quiz-score-card">
                        <div className="score-circle">
                          <span className="score-num">{quizResult?.score}</span>
                          <span className="score-total">/10</span>
                        </div>
                        <div className="score-details">
                          <h4>
                            {quizResult?.score >= 9 ? '🏆 Xuất sắc!' : quizResult?.score >= 8 ? '🌟 Rất tốt!' : quizResult?.score >= 6 ? '👍 Khá' : quizResult?.score >= 4 ? '⚠️ Cần cải thiện' : '❌ Yếu'}
                          </h4>
                          <p>
                            Độ thành thạo cập nhật: <strong>{Math.round((quizResult?.mastery || 0) * 100)}%</strong>
                          </p>
                          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            Thời gian hoàn thành: {quizResult?.completionTime || 0} giây
                          </p>
                        </div>
                      </div>

                      {/* Question Corrections Review List */}
                      <div className="mm-quiz-review-section">
                        <h4 className="review-title">Xem lại đáp án chi tiết</h4>
                        <div className="review-list">
                          {quizQuestions.map((q, idx) => {
                            const correction = quizResult?.corrections?.find(c => c.questionId === q.id) || {};
                            const userAns = correction.selectedOption;
                            const correctAns = correction.correctOption;
                            const isCorrect = correction.isCorrect;

                            return (
                              <div key={q.id} className={`review-item ${isCorrect ? 'review-item--correct' : 'review-item--incorrect'}`}>
                                <div className="review-question-header">
                                  <span className={`review-status-badge ${isCorrect ? 'badge-correct' : 'badge-incorrect'}`}>
                                    {isCorrect ? 'Đúng' : 'Sai'}
                                  </span>
                                  <h5>Câu {idx + 1}: {q.questionText}</h5>
                                </div>
                                <div className="review-options-list">
                                  {(q.options || []).map((opt, oIdx) => {
                                    let classSuffix = '';
                                    if (oIdx === correctAns) classSuffix = '--correct';
                                    else if (oIdx === userAns && !isCorrect) classSuffix = '--user-incorrect';

                                    return (
                                      <div key={oIdx} className={`review-option-item${classSuffix}`}>
                                        <span className="opt-label">{String.fromCharCode(65 + oIdx)}</span>
                                        <span className="opt-text">{opt}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="review-explanation">
                                  <strong>💡 Giải thích chi tiết:</strong>
                                  <p>{correction.explanation || q.explanation}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="mm-quiz-results-footer">
                        <button 
                          className="mm-quiz-action-btn-secondary" 
                          onClick={() => {
                            setIsQuizModalOpen(false);
                          }}
                        >
                          Quay lại sơ đồ
                        </button>
                        <button 
                          className="mm-quiz-action-btn-primary" 
                          onClick={handleStartNodeQuiz}
                        >
                          <HiRefresh /> Luyện tập lại
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Exam Upload & Analyse Modal */}
      {isExamModalOpen && (
        <div className="mm-modal-overlay animate-in" onDragOver={handleExamDragOver} onDragLeave={handleExamDragLeave} onDrop={handleExamDrop}>
          <div className="mm-modal-card mm-exam-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="mm-modal-header">
              <h3 className="mm-modal-title">
                📝 Lập sơ đồ cấu trúc đề thi bằng AI
              </h3>
              <button 
                className="mm-modal-close" 
                onClick={() => {
                  if (!examAnalysisLoading) setIsExamModalOpen(false);
                }}
              >
                <HiX />
              </button>
            </div>

            {/* Body */}
            <div className="mm-modal-body">
              {examAnalysisLoading ? (
                <div className="mm-quiz-loading-container">
                  <span className="spinner-secondary mm-quiz-spinner" />
                  <p className="mm-quiz-loading-text">
                    EduPath AI đang đọc đề thi, phân loại các dạng toán, ước lượng trọng số điểm và thiết lập sơ đồ...
                  </p>
                  <p className="mm-quiz-loading-sub">Quá trình này có thể mất 15-20 giây. Vui lòng không đóng cửa sổ.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Title Input */}
                  <div>
                    <label className="flashcard-modal-label" style={{ marginBottom: '6px', display: 'block', fontSize: '12px' }}>
                      Tiêu đề sơ đồ / Tên đề thi:
                    </label>
                    <input 
                      type="text" 
                      className="flashcard-modal-input"
                      placeholder="Ví dụ: Đề thi thử THPT Quốc gia môn Toán 2026 - Chuyên KHTN"
                      value={examTitle}
                      onChange={(e) => setExamTitle(e.target.value)}
                      style={{ background: '#141410', width: '100%', padding: '10px 12px', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* File Upload drag/drop zone */}
                  <div>
                    <label className="flashcard-modal-label" style={{ marginBottom: '6px', display: 'block', fontSize: '12px' }}>
                      Tải đề thi lên (Hỗ trợ PDF, DOCX, Ảnh, Text):
                    </label>
                    <div 
                      className={`aitutor-dropzone ${examUploadLoading ? 'aitutor-dropzone--active' : ''} ${isDraggingExamFile ? 'aitutor-dropzone--dragging' : ''}`}
                      onClick={() => !examUploadLoading && examFileInputRef.current?.click()}
                      style={{ padding: '28px 16px' }}
                    >
                      <input 
                        type="file" 
                        ref={examFileInputRef} 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleExamUpload(file);
                        }}
                        accept="image/*,text/plain,.txt,.md,application/pdf,.pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        style={{ display: 'none' }} 
                      />
                      {examUploadLoading ? (
                        <>
                          <span className="spinner" />
                          <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--mm-gold)' }}>
                            Đang trích xuất nội dung đề thi (OCR)...
                          </p>
                        </>
                      ) : (
                        <>
                          <HiUpload className="aitutor-dropzone-icon" />
                          <p className="aitutor-dropzone-title">Kéo thả đề thi vào đây hoặc click để chọn file</p>
                          <p className="aitutor-dropzone-desc">File PDF, Word (.docx), Ảnh đề thi hoặc file văn bản ghi chú</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Raw Exam Text / Extracted Text Review Area */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="flashcard-modal-label" style={{ fontSize: '12px' }}>
                        Nội dung văn bản đề thi (Xem/chỉnh sửa trực tiếp):
                      </label>
                      {examFileUrl && (
                        <span style={{ fontSize: '11px', color: 'var(--mm-gold)' }}>
                          ✓ Trích xuất từ file thành công
                        </span>
                      )}
                    </div>
                    <textarea
                      className="aitutor-textarea"
                      placeholder="Dán nội dung đề thi của bạn vào đây nếu không tải tệp lên. Càng chi tiết thì AI phân loại càng chuẩn..."
                      value={examText}
                      onChange={(e) => setExamText(e.target.value)}
                      style={{ minHeight: '140px', background: '#141410', fontSize: '12px', width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Trigger Button */}
                  <button
                    className="aitutor-action-btn"
                    onClick={handleAnalyzeExam}
                    disabled={!examText.trim() || examAnalysisLoading}
                    style={{
                      marginTop: '10px',
                      padding: '12px',
                      fontSize: '13px',
                      fontWeight: '800',
                      background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    🚀 Bắt đầu Phân tích cấu trúc & Lập sơ đồ
                  </button>

                </div>
              )}
            </div>
          </div>
        </div>
      )}
>>>>>>> 4bc1289b76ef82769a2eecdb6c5655fe53eecbeb
    </div>
  );
}
