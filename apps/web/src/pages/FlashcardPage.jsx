import React, { useState, useRef, useEffect } from 'react';
import { 
  HiSparkles, HiPlus, HiMinus, HiTrash, HiSave, HiDownload, 
  HiDocumentText, HiRefresh, HiUpload, HiX, HiChevronRight, 
  HiChevronLeft, HiFolder, HiBadgeCheck, HiStar, HiVolumeUp
} from 'react-icons/hi';
import Tesseract from 'tesseract.js';
import { api } from '../api';
import { toast } from '../utils/toast';

const DEFAULT_DECK = [
  {
    front: "artifact",
    back: "Là một vật thể được tạo ra bởi con người, đặc biệt có giá trị khảo cổ hoặc lịch sử.",
    image: null,
    partOfSpeech: "Danh từ",
    hashtag: "# Lịch sử"
  },
  {
    front: "excavation",
    back: "Hoạt động đào bới lòng đất một cách khoa học để tìm kiếm cổ vật cổ xưa.",
    image: null,
    partOfSpeech: "Danh từ",
    hashtag: "# Khảo cổ"
  },
  {
    front: "dynasty",
    back: "Một triều đại, thời kỳ lịch sử được cai trị bởi một gia tộc phong kiến nối tiếp nhau.",
    image: null,
    partOfSpeech: "Danh từ",
    hashtag: "# Lịch sử"
  },
  {
    front: "fossil",
    back: "Hóa thạch - Dấu vết hoặc di tích còn lại của sinh vật cổ đại được lưu giữ trong đá.",
    image: null,
    partOfSpeech: "Danh từ",
    hashtag: "# Khảo cổ"
  },
  {
    front: "heritage",
    back: "Di sản lịch sử, truyền thống hoặc giá trị văn hóa được truyền lại từ tổ tiên.",
    image: null,
    partOfSpeech: "Danh từ",
    hashtag: "# Văn hóa"
  }
];

export default function FlashcardPage({ currentUser, navigateTo, addLog }) {
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'history'
  const [deckTitle, setDeckTitle] = useState('Chủ đề Lịch sử & Khảo cổ học');
  const [cards, setCards] = useState(DEFAULT_DECK);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Card learning state logs
  const [learnedCards, setLearnedCards] = useState(new Set());
  const [reviewCards, setReviewCards] = useState(new Set());
  const [isFinished, setIsFinished] = useState(false);

  // Active study filter state (all / learned / remaining / review)
  const [studyFilter, setStudyFilter] = useState('all');

  const getActiveCards = () => {
    return cards.map((card, originalIdx) => ({ card, originalIdx })).filter(({ card, originalIdx }) => {
      if (studyFilter === 'learned') return learnedCards.has(originalIdx);
      if (studyFilter === 'remaining') return !learnedCards.has(originalIdx);
      if (studyFilter === 'review') return reviewCards.has(originalIdx);
      return true;
    });
  };
  const activeCards = getActiveCards();

  const handleFilterStudy = (filterType) => {
    setStudyFilter(filterType);
    setCurrentIdx(0);
    setIsFlipped(false);
    setIsFinished(false);
    toast(`Đã chuyển sang nhóm: ${filterType === 'learned' ? 'Đã thuộc' : filterType === 'remaining' ? 'Chưa thuộc' : filterType === 'review' ? 'Cần ôn tập' : 'Tất cả'}`, 'info');
  };

  // AI Chatbot States
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: 'Chào em! Anh là EduBot, trợ lý học tập đồng hành cùng em. Em có thể hỏi anh bất kỳ câu hỏi nào về học tập, hoặc nhập yêu cầu để anh tạo ngay một bộ flashcard học tập mới theo chủ đề nhé!\n\nVí dụ:\n- "Tạo bộ thẻ từ vựng IELTS chủ đề Môi trường"\n- "Tạo bộ thẻ các công thức Vật Lý 12 chương 1"\n- "Cách phân biệt Danh từ và Động từ?"'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatTyping, setIsChatTyping] = useState(false);
  const chatEndRef = useRef(null);

  // AI Chatbot Resizer States and Handlers
  const [sidebarWidth, setSidebarWidth] = useState(320); // Default to 320px
  const isDraggingRef = useRef(false);

  const handleMouseDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    // Window width minus mouse x coordinate, with margin adjustments
    const newWidth = window.innerWidth - e.clientX - 24;
    if (newWidth > 260 && newWidth < 600) {
      setSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Clean up drag events on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Auto scroll to bottom of chat log
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatTyping]);

  const SUGGESTED_CHIPS = [
    { label: '✈️ Từ vựng Du lịch', prompt: 'Tạo bộ thẻ về từ vựng IELTS chủ đề Du lịch' },
    { label: '📐 Công thức Toán', prompt: 'Tạo bộ thẻ về các công thức đạo hàm và tích phân lớp 12' },
    { label: '🌍 Lịch sử Việt Nam', prompt: 'Tạo bộ thẻ về các cột mốc lịch sử Việt Nam thế kỷ 20' },
    { label: '🧪 Nguyên tố Hóa học', prompt: 'Tạo bộ thẻ về tính chất các nguyên tố hóa học nhóm halogen' }
  ];

  const handleSendChatMessage = async (e, overrideText) => {
    if (e) e.preventDefault();
    const textToSend = overrideText || chatInput;
    const message = textToSend.trim();
    if (!message) return;

    // Add user message to conversation list
    setChatMessages(prev => [...prev, { sender: 'user', text: message }]);
    if (!overrideText) {
      setChatInput('');
    }
    setIsChatTyping(true);

    const cleanText = message.toLowerCase();
    const isGen = cleanText.includes("tạo bộ thẻ") || 
                  cleanText.includes("tạo flashcard") || 
                  cleanText.includes("tạo thẻ học") || 
                  cleanText.includes("tạo bộ card") || 
                  cleanText.includes("thiết kế bộ thẻ") || 
                  cleanText.includes("thiết kế flashcard") || 
                  cleanText.includes("làm bộ thẻ") || 
                  cleanText.includes("làm flashcard") ||
                  cleanText.includes("generate flashcard");

    if (isGen) {
      // Add standard loading message from bot
      setChatMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'Đang khởi tạo và thiết kế bộ thẻ học theo yêu cầu của em. Quá trình này có thể mất vài giây...' 
      }]);

      try {
        const result = await api.generateFlashcards(message);
        
        if (!Array.isArray(result) || result.length === 0) {
          throw new Error('Dữ liệu flashcard trả về không hợp lệ.');
        }

        const formatted = result.map((c, index) => ({
          ...c,
          image: null,
          partOfSpeech: index % 2 === 0 ? "Khái niệm" : "Định nghĩa",
          hashtag: "# Học tập"
        }));

        setCards(formatted);
        setCurrentIdx(0);
        setIsFlipped(false);
        setIsFinished(false);
        setIsEditingCurrent(false);
        setLearnedCards(new Set());
        setReviewCards(new Set());

        // Infer a nice deck title from the user prompt
        let extractedTitle = '';
        const match = message.match(/(?:tạo|thiết kế|làm)\s+(?:bộ\s+thẻ|bộ\s+card|flashcard|thẻ\s+học|thẻ|bộ\s+thẻ\s+học)\s+(?:về|chủ đề|cho)?\s*(.+)/i);
        if (match && match[1]) {
          extractedTitle = match[1].trim();
          extractedTitle = extractedTitle.charAt(0).toUpperCase() + extractedTitle.slice(1);
        } else {
          extractedTitle = 'Flashcard AI - ' + new Date().toLocaleDateString('vi-VN');
        }

        setDeckTitle(extractedTitle);
        toast(`Đã tạo thành công bộ thẻ "${extractedTitle}" với ${formatted.length} thẻ!`, 'success');
        if (addLog) addLog(`Đã tạo bộ thẻ AI: ${extractedTitle}`, 'ai');

        setChatMessages(prev => [...prev, { 
          sender: 'bot', 
          text: `Anh đã thiết kế thành công bộ thẻ "${extractedTitle}" gồm ${formatted.length} thẻ học cho em rồi đấy! Hãy cùng ôn luyện ở màn hình chính nhé. 🚀` 
        }]);
      } catch (err) {
        console.error(err);
        toast(err.message || 'Lỗi khi tạo flashcard từ AI!', 'error');
        setChatMessages(prev => [...prev, { 
          sender: 'bot', 
          text: 'Rất tiếc, đã xảy ra lỗi trong quá trình tự động thiết kế bộ thẻ. Em vui lòng thử lại hoặc mô tả rõ hơn nhé!' 
        }]);
      } finally {
        setIsChatTyping(false);
      }
    } else {
      // Normal conversational helper queries
      try {
        const historyToSend = chatMessages.slice(-8).map(msg => ({
          sender: msg.sender,
          text: msg.text
        }));

        const res = await api.chatbot(message, historyToSend);
        setChatMessages(prev => [...prev, { sender: 'bot', text: res.reply }]);
      } catch (err) {
        console.error(err);
        setChatMessages(prev => [...prev, { 
          sender: 'bot', 
          text: 'Có lỗi kết nối với trợ lý AI. Em hãy thử lại sau nhé!' 
        }]);
      } finally {
        setIsChatTyping(false);
      }
    }
  };

  // Manual Editing States
  const [isEditingCurrent, setIsEditingCurrent] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');
  const [editImage, setEditImage] = useState(null);
  const [editPartOfSpeech, setEditPartOfSpeech] = useState('Danh từ');
  const [editHashtag, setEditHashtag] = useState('# Lịch sử');

  // Input states
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [autoPronounce, setAutoPronounce] = useState(false);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  // History state
  const [savedDecks, setSavedDecks] = useState([]);

  // Refs
  const fileInputRef = useRef(null);
  const cardImageInputRef = useRef(null);

  // Initial load history
  useEffect(() => {
    loadSavedDecks();
  }, []);

  // Keyboard listener for Space (Flip) and Arrows (Prev/Next)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in inputs or textareas
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      } else if (e.code === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIdx, activeCards.length]);

  // Voice synthesis auto pronounce when changing cards or flipping
  useEffect(() => {
    if (autoPronounce && activeCards.length > 0 && !isEditingCurrent && !isFinished) {
      const textToSpeak = isFlipped ? activeCards[currentIdx]?.card?.back : activeCards[currentIdx]?.card?.front;
      if (textToSpeak) {
        speakText(textToSpeak);
      }
    }
  }, [currentIdx, isFlipped, autoPronounce, isFinished, isEditingCurrent, activeCards]);

  const loadSavedDecks = () => {
    try {
      const stored = localStorage.getItem('edupath_saved_flashcard_decks');
      if (stored) {
        setSavedDecks(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // cancel playing voice first
      const utterance = new SpeechSynthesisUtterance(text);
      const isVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text);
      utterance.lang = isVietnamese ? 'vi-VN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      toast('Trình duyệt không hỗ trợ tổng hợp giọng nói.', 'warning');
    }
  };

  // Drag & drop file handlers
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

  const processFile = async (file) => {
    setSelectedFile(file);
    setIsLoading(true);
    
    try {
      if (file.type.startsWith('image/')) {
        setLoadingStep('Đang khởi tạo OCR nhận diện chữ trong ảnh...');
        const result = await Tesseract.recognize(file, 'vie+eng', {
          logger: m => {
            if (m.status === 'recognizing') {
              setLoadingStep(`Nhận diện chữ trong ảnh: ${Math.round(m.progress * 100)}%`);
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
        setLoadingStep('Đang đọc file văn bản...');
        const text = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (err) => reject(err);
          reader.readAsText(file);
        });
        setInputText(text);
        toast('Đã nạp văn bản thành công!', 'success');
      } else {
        setLoadingStep('Đang đọc cấu trúc tệp...');
        await new Promise(r => setTimeout(r, 1000));
        const promptText = `Tài liệu: ${file.name}. Hãy tạo các thẻ flashcard ôn tập.`;
        setInputText(promptText);
        toast(`Đã nhận diện file ${file.name}.`, 'success');
      }
    } catch (err) {
      console.error(err);
      toast('Lỗi khi đọc file tài liệu!', 'error');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setInputText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger AI Flashcards generation
  const handleGenerateFlashcards = async () => {
    const content = inputText.trim();
    if (!content) {
      toast('Vui lòng nhập văn bản hoặc tải file lên!', 'warning');
      return;
    }

    setIsLoading(true);
    setLoadingStep('AI đang phân tích kiến thức và thiết kế thẻ học...');
    setIsFlipped(false);
    setIsFinished(false);
    setIsEditingCurrent(false);
    setLearnedCards(new Set());
    setReviewCards(new Set());

    if (addLog) {
      addLog(`Tạo bộ flashcard AI từ tài liệu: "${content.substring(0, 50)}..."`, 'sys');
    }

    try {
      const result = await api.generateFlashcards(content);
      
      if (!Array.isArray(result) || result.length === 0) {
        throw new Error('Dữ liệu flashcard trả về không hợp lệ.');
      }

      // Add extra defaults
      const formatted = result.map((c, index) => ({
        ...c,
        image: null,
        partOfSpeech: index % 2 === 0 ? "Khái niệm" : "Định nghĩa",
        hashtag: selectedFile ? `# ${selectedFile.name.substring(0, 8)}` : "# Học tập"
      }));
      
      setCards(formatted);
      setCurrentIdx(0);
      setDeckTitle(selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, "") : `Flashcard ${new Date().toLocaleDateString('vi-VN')}`);
      toast(`Đã tạo thành công ${formatted.length} thẻ ghi nhớ AI!`, 'success');
      if (addLog) addLog('Đã tạo thành công bộ flashcard AI', 'ai');
    } catch (err) {
      console.error(err);
      toast(err.message || 'Lỗi khi tạo flashcard từ AI. Vui lòng thử lại!', 'error');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Manual Card Operations
  const handleStartEditCurrent = () => {
    if (activeCards.length === 0) return;
    const cur = activeCards[currentIdx]?.card;
    if (!cur) return;
    setEditFront(cur.front || '');
    setEditBack(cur.back || '');
    setEditImage(cur.image || null);
    setEditPartOfSpeech(cur.partOfSpeech || 'Khái niệm');
    setEditHashtag(cur.hashtag || '# Ôn tập');
    setIsAddingCard(false);
    setIsEditingCurrent(true);
  };

  const handleSaveCurrentEdit = () => {
    if (!editFront.trim() || !editBack.trim()) {
      toast('Nội dung mặt trước và mặt sau không được bỏ trống!', 'warning');
      return;
    }

    if (isAddingCard) {
      const newCard = {
        front: editFront.trim(),
        back: editBack.trim(),
        image: editImage,
        partOfSpeech: editPartOfSpeech.trim(),
        hashtag: editHashtag.trim()
      };
      const nextCards = [...cards, newCard];
      setCards(nextCards);
      setCurrentIdx(nextCards.length - 1);
      setIsAddingCard(false);
      toast('Đã thêm thẻ mới thành công!', 'success');
    } else {
      const origIdx = activeCards[currentIdx]?.originalIdx;
      if (origIdx === undefined) return;
      const nextCards = [...cards];
      nextCards[origIdx] = {
        front: editFront.trim(),
        back: editBack.trim(),
        image: editImage,
        partOfSpeech: editPartOfSpeech.trim(),
        hashtag: editHashtag.trim()
      };
      setCards(nextCards);
      toast('Đã cập nhật thẻ thành công!', 'success');
    }
    setIsEditingCurrent(false);
  };

  const handleAddCard = () => {
    setEditFront('');
    setEditBack('');
    setEditImage(null);
    setEditPartOfSpeech('Khái niệm');
    setEditHashtag('# Tự tạo');
    setIsAddingCard(true);
    setIsEditingCurrent(true);
  };

  const handleCreateNewDeck = () => {
    const name = prompt('Nhập tên bộ thẻ mới:', 'Bộ thẻ học mới');
    if (name === null) return;
    const finalName = name.trim() || 'Bộ thẻ học mới';

    const newCard = {
      front: 'Từ / Khái niệm mới',
      back: 'Định nghĩa / Giải thích mới',
      image: null,
      partOfSpeech: 'Khái niệm',
      hashtag: '# Tự tạo'
    };

    setDeckTitle(finalName);
    setCards([newCard]);
    setCurrentIdx(0);
    setIsFlipped(false);
    setIsFinished(false);

    // Auto start editing the first card
    setEditFront(newCard.front);
    setEditBack(newCard.back);
    setEditImage(null);
    setEditPartOfSpeech(newCard.partOfSpeech);
    setEditHashtag(newCard.hashtag);
    setIsEditingCurrent(true);

    toast('Đã khởi tạo bộ thẻ mới. Vui lòng đặt lại từ và định nghĩa cho thẻ đầu tiên!', 'success');
  };

  const handleDeleteCard = () => {
    if (activeCards.length === 0) return;
    if (cards.length <= 1) {
      toast('Không thể xóa vì bộ phải có ít nhất 1 thẻ!', 'warning');
      return;
    }
    if (!confirm('Bạn có chắc chắn muốn xóa thẻ này khỏi bộ?')) return;
    
    const origIdx = activeCards[currentIdx]?.originalIdx;
    if (origIdx === undefined) return;
    const nextCards = cards.filter((_, idx) => idx !== origIdx);
    setCards(nextCards);
    setIsEditingCurrent(false);
    setCurrentIdx(prev => Math.max(0, prev - 1));
    toast('Đã xóa thẻ khỏi bộ thành công!', 'success');
  };

  const handleCardImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast('Vui lòng chọn tệp hình ảnh hợp lệ!', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setEditImage(uploadEvent.target.result);
        toast('Đã nạp hình ảnh lên thẻ!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShuffleDeck = () => {
    if (cards.length <= 1) return;
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIdx(0);
    setIsFlipped(false);
    setIsFinished(false);
    toast('Đã trộn ngẫu nhiên bộ thẻ!', 'success');
  };

  // Study Deck review navigation
  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIdx < activeCards.length - 1) {
        setCurrentIdx(prev => prev + 1);
      } else {
        setIsFinished(true);
      }
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIdx > 0) {
        setCurrentIdx(prev => prev - 1);
      }
    }, 150);
  };

  const markAsLearned = () => {
    const origIdx = activeCards[currentIdx]?.originalIdx;
    if (origIdx === undefined) return;
    setLearnedCards(prev => {
      const next = new Set(prev);
      next.add(origIdx);
      return next;
    });
    setReviewCards(prev => {
      const next = new Set(prev);
      next.delete(origIdx);
      return next;
    });
    handleNext();
  };

  const markForReview = () => {
    const origIdx = activeCards[currentIdx]?.originalIdx;
    if (origIdx === undefined) return;
    setReviewCards(prev => {
      const next = new Set(prev);
      next.add(origIdx);
      return next;
    });
    setLearnedCards(prev => {
      const next = new Set(prev);
      next.delete(origIdx);
      return next;
    });
    handleNext();
  };

  const restartReview = () => {
    setCurrentIdx(0);
    setIsFlipped(false);
    setIsFinished(false);
    setIsEditingCurrent(false);
    setLearnedCards(new Set());
    setReviewCards(new Set());
  };

  // Save deck to localStorage
  const handleSaveDeck = () => {
    if (cards.length === 0) return;
    
    const newDeck = {
      id: Date.now().toString(),
      title: deckTitle.trim() || 'Thẻ ghi nhớ không tên',
      cards: cards,
      createdAt: new Date().toISOString()
    };

    const nextDecks = [newDeck, ...savedDecks.filter(d => d.title !== newDeck.title)];
    setSavedDecks(nextDecks);
    localStorage.setItem('edupath_saved_flashcard_decks', JSON.stringify(nextDecks));
    toast('Đã lưu bộ thẻ học thành công!', 'success');
  };

  // Load deck from history
  const handleLoadDeck = (deck) => {
    setCards(deck.cards);
    setDeckTitle(deck.title);
    setCurrentIdx(0);
    setIsFlipped(false);
    setIsFinished(false);
    setIsEditingCurrent(false);
    setLearnedCards(new Set());
    setReviewCards(new Set());
    toast(`Đã tải bộ thẻ: ${deck.title}`, 'success');
  };

  // Delete saved deck
  const handleDeleteDeck = (e, id) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc chắn muốn xóa bộ thẻ này?')) return;

    const nextDecks = savedDecks.filter(d => d.id !== id);
    setSavedDecks(nextDecks);
    localStorage.setItem('edupath_saved_flashcard_decks', JSON.stringify(nextDecks));
    toast('Đã xóa bộ thẻ thành công!', 'success');
  };

  // Mastery percentage calculation
  const masteryPercent = Math.round((learnedCards.size / cards.length) * 100 || 0);
  const remainingCount = cards.length - learnedCards.size;

  return (
    <div className="flashcard-page-container">
      <div 
        className="flashcard-workspace-grid"
        style={{ 
          gridTemplateColumns: `220px 1fr 6px ${sidebarWidth}px`,
          gap: '12px'
        }}
      >
        
        {/* ================= LEFT SIDEBAR ================= */}
        <aside className="flashcard-left-sidebar">
          <div className="flashcard-nav-menu">
            <h4 className="flashcard-menu-title">HỌC TẬP</h4>

            <button 
              className="flashcard-btn-create-deck" 
              onClick={handleCreateNewDeck} 
              title="Khởi tạo một bộ thẻ ghi nhớ hoàn toàn mới"
            >
              <HiPlus />
              <span>Tạo bộ thẻ mới</span>
            </button>
            
            <button className="flashcard-menu-item" onClick={() => navigateTo('/')}>
              <span className="flashcard-menu-item-left">
                <span className="flashcard-menu-item-icon">📊</span>
                <span>Tổng quan</span>
              </span>
            </button>
            
            <button className="flashcard-menu-item" style={{ cursor: 'default' }}>
              <span className="flashcard-menu-item-left">
                <span className="flashcard-menu-item-icon">📁</span>
                <span style={{ fontSize: '11.5px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                  {deckTitle}
                </span>
              </span>
            </button>

            <button 
              className={`flashcard-menu-item ${studyFilter === 'all' ? 'flashcard-menu-item--active' : ''}`}
              onClick={() => handleFilterStudy('all')}
            >
              <span className="flashcard-menu-item-left">
                <span className="flashcard-menu-item-icon">🗂️</span>
                <span>Flashcard</span>
              </span>
            </button>

            <button 
              className={`flashcard-menu-item ${studyFilter === 'learned' ? 'flashcard-menu-item--active' : ''}`}
              onClick={() => handleFilterStudy('learned')}
            >
              <span className="flashcard-menu-item-left">
                <span className="flashcard-menu-item-icon" style={{ color: '#10b981' }}>✓</span>
                <span>Đã nhớ</span>
              </span>
              <span className="flashcard-menu-item-counter">{learnedCards.size}</span>
            </button>

            <button 
              className={`flashcard-menu-item ${studyFilter === 'remaining' ? 'flashcard-menu-item--active' : ''}`}
              onClick={() => handleFilterStudy('remaining')}
            >
              <span className="flashcard-menu-item-left">
                <span className="flashcard-menu-item-icon" style={{ color: '#ef4444' }}>✕</span>
                <span>Chưa nhớ</span>
              </span>
              <span className="flashcard-menu-item-counter">{remainingCount}</span>
            </button>

            <button 
              className={`flashcard-menu-item ${studyFilter === 'review' ? 'flashcard-menu-item--active' : ''}`}
              onClick={() => handleFilterStudy('review')}
            >
              <span className="flashcard-menu-item-left">
                <span className="flashcard-menu-item-icon" style={{ color: '#f59e0b' }}>↺</span>
                <span>Cần ôn tập</span>
              </span>
              <span className="flashcard-menu-item-counter">{reviewCards.size}</span>
            </button>

            <button className="flashcard-menu-item" onClick={() => setIsFinished(true)}>
              <span className="flashcard-menu-item-left">
                <span className="flashcard-menu-item-icon">📈</span>
                <span>Thống kê</span>
              </span>
            </button>

            <button className="flashcard-menu-item" onClick={() => setActiveTab(activeTab === 'history' ? 'create' : 'history')}>
              <span className="flashcard-menu-item-left">
                <span className="flashcard-menu-item-icon">⏱️</span>
                <span>Lịch sử làm bài</span>
              </span>
              <span className="flashcard-menu-item-counter" style={{ fontSize: '9px' }}>{savedDecks.length}</span>
            </button>
          </div>

          {/* Left panel inputs inside sidebar */}
          {activeTab === 'create' ? (
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--fc-border-dark)', paddingTop: '16px' }}>
              <div 
                className={`aitutor-dropzone ${isDraggingFile ? 'aitutor-dropzone--active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{ padding: '12px 6px', minHeight: '100px' }}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  accept="image/*,text/plain,.txt,.md"
                  style={{ display: 'none' }} 
                />
                <HiUpload style={{ fontSize: '18px', color: '#9CA3AF' }} />
                <p style={{ fontSize: '11px', fontWeight: 'bold', margin: '4px 0 0 0' }}>Tải ảnh/tệp trích xuất</p>
                
                {selectedFile && (
                  <div className="aitutor-uploaded-tag" onClick={(e) => e.stopPropagation()} style={{ width: '90%', fontSize: '10px' }}>
                    <span>{selectedFile.name}</span>
                    <button className="aitutor-clear-file" onClick={clearSelectedFile}><HiX /></button>
                  </div>
                )}
              </div>

              <textarea
                className="aitutor-textarea"
                placeholder="Dán tóm tắt kiến thức vào đây để AI phân tích tạo thẻ học..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
                style={{ minHeight: '90px' }}
              />

              <button
                className="aitutor-action-btn"
                onClick={handleGenerateFlashcards}
                disabled={isLoading || !inputText.trim()}
                style={{ padding: '8px' }}
              >
                {isLoading ? <span className="spinner" /> : <><HiSparkles /> Tạo bộ thẻ AI</>}
              </button>

              {isLoading && loadingStep && (
                <div className="aitutor-step-progress" style={{ fontSize: '10px', padding: '6px' }}>
                  <p>{loadingStep}</p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ marginTop: '16px', borderTop: '1px solid var(--fc-border-dark)', paddingTop: '16px', maxHeight: '250px', overflowY: 'auto' }}>
              <h5 style={{ fontSize: '11px', margin: '0 0 8px 0', color: 'var(--fc-text-secondary)' }}>BỘ THẺ ĐÃ LƯU</h5>
              {savedDecks.length === 0 ? (
                <p style={{ fontSize: '11px', color: 'var(--fc-text-secondary)', textAlign: 'center' }}>Chưa có bộ thẻ nào.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {savedDecks.map(deck => (
                    <div 
                      key={deck.id}
                      onClick={() => handleLoadDeck(deck)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', border: '1px solid var(--fc-border-dark)' }}
                    >
                      <span style={{ fontSize: '11.5px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                        {deck.title}
                      </span>
                      <button 
                        onClick={(e) => handleDeleteDeck(e, deck.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }}
                      >
                        <HiTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Streak Flame card at bottom left */}
          <div className="flashcard-streak-card">
            <span className="flashcard-streak-icon">🔥</span>
            <div className="flashcard-streak-text">
              <span className="flashcard-streak-value">1 ngày</span>
              <span className="flashcard-streak-label">Chuỗi học liên tục</span>
            </div>
          </div>
        </aside>

        {/* ================= CENTER WORKSPACE ================= */}
        <main className="flashcard-center-workspace">
          <div className="flashcard-center-header">
            <div>
              <div className="flashcard-header-breadcrumb">ĐANG HỌC · BỘ THẺ</div>
              <div className="flashcard-header-title-row">
                <input 
                  type="text" 
                  className="flashcard-title-creator-input"
                  value={deckTitle}
                  onChange={(e) => setDeckTitle(e.target.value)}
                  placeholder="Nhập tên bộ thẻ học..."
                  style={{ width: '420px', fontSize: '18px', fontWeight: 'bold' }}
                />
                <span className="flashcard-header-tag">Academic</span>
              </div>
            </div>

            <div className="flashcard-header-actions">
              <button className="flashcard-header-btn" onClick={handleShuffleDeck} title="Trộn thẻ ngẫu nhiên">
                Trộn thẻ
              </button>
              <button 
                className="flashcard-header-btn" 
                onClick={() => setAutoPronounce(!autoPronounce)}
                style={{ borderColor: autoPronounce ? 'var(--fc-gold)' : '', color: autoPronounce ? 'var(--fc-gold)' : '' }}
                title="Tự động đọc nội dung thẻ bằng giọng nói"
              >
                🔊 Tự động phát âm: {autoPronounce ? 'BẬT' : 'TẮT'}
              </button>
              <button className="flashcard-header-btn" onClick={handleAddCard}>
                <HiPlus /> Thêm thẻ mới
              </button>
              {cards.length > 0 && (
                <button className="flashcard-header-btn" onClick={handleSaveDeck} style={{ background: 'var(--fc-gold)', color: '#12120e' }}>
                  <HiSave /> Lưu bộ thẻ
                </button>
              )}
            </div>
          </div>

          {/* Flashcard Render Canvas */}
          <div className="flashcard-canvas-card-area">
            {!isFinished && activeCards.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
                
                {/* 3D Starry Flippable Card */}
                <div 
                  className={`flashcard-3d-card-wrapper ${isFlipped ? 'flashcard-3d-card-wrapper--flipped' : ''}`}
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  
                  {/* Front Side */}
                  <div className="flashcard-night-face">
                    <div className="flashcard-star-particles" />
                    
                    <span className="flashcard-card-part-of-speech">
                      {activeCards[currentIdx]?.card?.partOfSpeech || 'Khái niệm'} (Mặt trước)
                    </span>

                    <div className="flashcard-card-top-actions" onClick={e => e.stopPropagation()}>
                      <button 
                        className="flashcard-card-action-circle"
                        onClick={() => speakText(activeCards[currentIdx]?.card?.front)}
                        title="Đọc từ vựng"
                      >
                        <HiVolumeUp />
                      </button>
                      <button 
                        className="flashcard-card-action-circle"
                        onClick={handleStartEditCurrent}
                        title="Sửa nội dung thẻ này"
                      >
                        ✏️
                      </button>
                      <button 
                        className="flashcard-card-action-circle"
                        onClick={handleDeleteCard}
                        title="Xóa thẻ này"
                        style={{ color: '#ef4444' }}
                      >
                        <HiTrash />
                      </button>
                    </div>

                    <div className="flashcard-card-word-title">
                      {activeCards[currentIdx]?.card?.front}
                    </div>

                    {activeCards[currentIdx]?.card?.image && (
                      <div className="flashcard-uploaded-img-wrapper">
                        <img src={activeCards[currentIdx].card.image} alt="Card illustration" />
                      </div>
                    )}

                    <span className="flashcard-card-hashtag">
                      {activeCards[currentIdx]?.card?.hashtag || '# Học tập'}
                    </span>

                    <span className="flashcard-card-prompt-bottom">
                      Nhấp vào thẻ để xem nghĩa ↺
                    </span>

                    {/* Cartoon happy mascot bouncing */}
                    <svg className="moon-mascot" width="48" height="48" viewBox="0 0 64 64" fill="none">
                      <circle cx="32" cy="32" r="28" fill="#FFFFFF" />
                      <circle cx="24" cy="28" r="2.5" fill="#1E1E18" />
                      <circle cx="40" cy="28" r="2.5" fill="#1E1E18" />
                      <path d="M 28 36 Q 32 40 36 36" stroke="#1E1E18" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                      <circle cx="19" cy="32" r="3" fill="#FFB4B4" opacity="0.6" />
                      <circle cx="45" cy="32" r="3" fill="#FFB4B4" opacity="0.6" />
                    </svg>
                  </div>

                  {/* Back Side */}
                  <div className="flashcard-night-face flashcard-night-face--back">
                    <div className="flashcard-star-particles" />
                    
                    <span className="flashcard-card-part-of-speech" style={{ color: 'var(--fc-gold)' }}>
                      GIẢI THÍCH (Mặt sau)
                    </span>

                    <div className="flashcard-card-top-actions" onClick={e => e.stopPropagation()}>
                      <button 
                        className="flashcard-card-action-circle"
                        onClick={() => speakText(activeCards[currentIdx]?.card?.back)}
                        title="Đọc giải thích"
                      >
                        <HiVolumeUp />
                      </button>
                      <button 
                        className="flashcard-card-action-circle"
                        onClick={handleStartEditCurrent}
                        title="Sửa nội dung thẻ này"
                      >
                        ✏️
                      </button>
                    </div>

                    <div className="flashcard-card-word-title" style={{ fontSize: '16px', fontWeight: '500', padding: '0 12px', lineHeight: '1.6' }}>
                      {activeCards[currentIdx]?.card?.back}
                    </div>

                    {activeCards[currentIdx]?.card?.image && (
                      <div className="flashcard-uploaded-img-wrapper">
                        <img src={activeCards[currentIdx].card.image} alt="Card illustration" />
                      </div>
                    )}

                    <span className="flashcard-card-hashtag" style={{ color: 'var(--fc-gold)', background: 'rgba(255, 226, 89, 0.05)' }}>
                      {activeCards[currentIdx]?.card?.hashtag || '# Học tập'}
                    </span>

                    <span className="flashcard-card-prompt-bottom">
                      Nhấp vào thẻ để xem lại câu hỏi ↺
                    </span>

                    {/* Cartoon happy mascot bouncing */}
                    <svg className="moon-mascot" width="48" height="48" viewBox="0 0 64 64" fill="none">
                      <circle cx="32" cy="32" r="28" fill="#FFFFFF" />
                      <circle cx="24" cy="28" r="2.5" fill="#1E1E18" />
                      <circle cx="40" cy="28" r="2.5" fill="#1E1E18" />
                      <path d="M 28 36 Q 32 40 36 36" stroke="#1E1E18" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                      <circle cx="19" cy="32" r="3" fill="#FFB4B4" opacity="0.6" />
                      <circle cx="45" cy="32" r="3" fill="#FFB4B4" opacity="0.6" />
                    </svg>
                  </div>
                </div>

                {/* Progress indicators under card */}
                <div style={{ display: 'flex', width: '100%', maxWidth: '580px', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--fc-text-secondary)' }}>
                  <span>Thẻ {currentIdx + 1} / {activeCards.length}</span>
                  <div style={{ width: '150px', background: 'var(--fc-border-dark)', height: '6px', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                    <div style={{ background: 'var(--fc-gold)', height: '100%', width: `${((currentIdx + 1) / activeCards.length) * 100}%`, transition: 'width 0.2s' }} />
                  </div>
                  <span>Đã thuộc: {learnedCards.size} / {cards.length}</span>
                </div>
              </div>
            ) : activeCards.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: 'var(--fc-text-secondary)', fontSize: '13px' }}>
                  {studyFilter === 'all' 
                    ? 'Bộ thẻ ghi nhớ trống. Hãy nhập kiến thức bên trái để tạo thẻ tự động, hoặc bấm "Thêm thẻ mới"!'
                    : `Không có thẻ nào trong nhóm "${studyFilter === 'learned' ? 'Đã thuộc' : studyFilter === 'remaining' ? 'Chưa thuộc' : 'Cần ôn tập'}". Hãy chọn nhóm học khác hoặc tiếp tục học nhé!`
                  }
                </p>
                {studyFilter !== 'all' && (
                  <button 
                    className="flashcard-header-btn" 
                    onClick={() => setStudyFilter('all')}
                    style={{ marginTop: '16px', background: 'var(--fc-gold)', color: '#12120e', border: 'none', padding: '8px 16px' }}
                  >
                    Xem tất cả thẻ
                  </button>
                )}
              </div>
            ) : (
              /* Finish summary screen */
              <div className="flashcard-finish-screen animate-in" style={{ background: 'var(--fc-starry-bg)', border: '1px solid var(--fc-border-dark)', borderRadius: '28px', padding: '40px', width: '100%', maxWidth: '580px', textAlign: 'center' }}>
                <div className="finish-emoji" style={{ fontSize: '48px', animation: 'float-moon 2s infinite' }}>🏆</div>
                <h3 className="finish-title" style={{ fontSize: '20px', fontWeight: '900', color: 'var(--fc-gold)' }}>Hoàn thành buổi ôn tập!</h3>
                <p className="finish-desc" style={{ fontSize: '13px', color: 'var(--fc-text-secondary)' }}>Bạn đã hoàn thành việc ôn luyện bộ thẻ học <strong>{deckTitle}</strong>.</p>
                
                {/* Result Statistics */}
                <div className="finish-stats-card" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--fc-border-dark)', borderRadius: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '16px', margin: '20px 0' }}>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '28px', fontWeight: '900', color: '#10b981' }}>{learnedCards.size}</span>
                    <span style={{ fontSize: '11px', color: 'var(--fc-text-secondary)' }}>Thẻ đã nhớ</span>
                  </div>
                  <div style={{ textAlign: 'center', borderLeft: '1px solid var(--fc-border-dark)' }}>
                    <span style={{ display: 'block', fontSize: '28px', fontWeight: '900', color: '#f59e0b' }}>{reviewCards.size}</span>
                    <span style={{ fontSize: '11px', color: 'var(--fc-text-secondary)' }}>Cần ôn tập lại</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button className="flashcard-header-btn" onClick={restartReview} style={{ background: 'var(--fc-gold)', color: '#12120e', border: 'none' }}>
                    <HiRefresh /> Ôn lại từ đầu
                  </button>
                  <button className="flashcard-header-btn" onClick={() => navigateTo('/')}>
                    Về Trang chủ
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom review actions buttons */}
          {!isFinished && activeCards.length > 0 && (
            <div className="flashcard-bottom-actions-bar">
              <button 
                className="flashcard-bottom-btn flashcard-bottom-btn--review" 
                onClick={markForReview}
                title="Đánh dấu thẻ này chưa thuộc (Phím mũi tên Trái)"
              >
                ✕ Chưa nhớ <span className="flashcard-bottom-btn-count">{reviewCards.size}</span>
              </button>
              
              <button 
                className="flashcard-bottom-btn flashcard-bottom-btn--flip" 
                onClick={() => setIsFlipped(!isFlipped)}
                title="Lật thẻ qua lại (Phím cách Space)"
              >
                Lật thẻ <span className="flashcard-bottom-btn-count" style={{ fontSize: '9px' }}>Space</span>
              </button>
              
              <button 
                className="flashcard-bottom-btn flashcard-bottom-btn--learned" 
                onClick={markAsLearned}
                title="Đánh dấu thẻ này đã thuộc lòng (Phím mũi tên Phải)"
              >
                ✓ Đã nhớ <span className="flashcard-bottom-btn-count">{learnedCards.size}</span>
              </button>
            </div>
          )}
        </main>

        {/* Resizable Divider */}
        <div 
          className="flashcard-sidebar-resizer"
          onMouseDown={handleMouseDown}
          title="Kéo để co giãn sidebar"
        />

        {/* ================= RIGHT SIDEBAR ================= */}
        <aside className="flashcard-right-sidebar">
          {/* Chat Header */}
          <div className="flashcard-chat-header">
            <h5 className="flashcard-chat-header-title">EDUBOT ĐỒNG HÀNH</h5>
            <span className="flashcard-chat-header-status">Hoạt động</span>

            {/* Mascot decoration */}
            <svg 
              style={{ animation: 'float-moon 4s ease-in-out infinite' }} 
              width="24" 
              height="24" 
              viewBox="0 0 64 64"
            >
              <circle cx="32" cy="32" r="28" fill="#FFFFFF" />
              <circle cx="24" cy="28" r="2.5" fill="#1E1E18" />
              <circle cx="40" cy="28" r="2.5" fill="#1E1E18" />
              <path d="M 28 36 Q 32 40 36 36" stroke="#1E1E18" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <circle cx="19" cy="32" r="3" fill="#FFB4B4" opacity="0.6" />
              <circle cx="45" cy="32" r="3" fill="#FFB4B4" opacity="0.6" />
            </svg>
          </div>

          {/* Chat Messages */}
          <div className="flashcard-chat-messages-container">
            {chatMessages.map((msg, index) => (
              <div 
                key={index} 
                className={`flashcard-chat-bubble ${msg.sender === 'user' ? 'flashcard-chat-bubble--user' : 'flashcard-chat-bubble--bot'}`}
              >
                <span className="flashcard-chat-bubble-sender">
                  {msg.sender === 'user' ? 'Bạn' : 'EduBot'}
                </span>
                <div>{msg.text}</div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isChatTyping && (
              <div className="flashcard-chat-typing-container">
                <span className="flashcard-chat-bubble-sender" style={{ marginBottom: 0 }}>EduBot</span>
                <div className="flashcard-chat-typing-dots">
                  <span className="flashcard-chat-typing-dot"></span>
                  <span className="flashcard-chat-typing-dot"></span>
                  <span className="flashcard-chat-typing-dot"></span>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Suggested Prompts Chips */}
          <div className="flashcard-chat-chips-container">
            <h6 className="flashcard-chat-chips-title">Gợi ý tạo bộ thẻ nhanh</h6>
            <div className="flashcard-chat-chips-row">
              {SUGGESTED_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="flashcard-chat-chip"
                  onClick={() => handleSendChatMessage(null, chip.prompt)}
                  title={chip.prompt}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input Field Form */}
          <form className="flashcard-chat-input-wrapper" onSubmit={(e) => handleSendChatMessage(e)}>
            <textarea
              className="flashcard-chat-input-field"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Hỏi EduBot hoặc yêu cầu tạo bộ thẻ..."
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendChatMessage(e);
                }
              }}
            />
            <button 
              type="submit" 
              className="flashcard-chat-send-btn" 
              disabled={isChatTyping || !chatInput.trim()}
              title="Gửi tin nhắn"
            >
              <HiSparkles />
            </button>
          </form>
        </aside>

      </div>

      {/* Modal for Creating and Editing Cards */}
      {isEditingCurrent && (
        <div className="flashcard-modal-overlay" onClick={() => setIsEditingCurrent(false)}>
          <div className="flashcard-modal-card animate-in" onClick={e => e.stopPropagation()}>
            <div className="flashcard-modal-header">
              <h3 className="flashcard-modal-title">
                {isAddingCard ? "Thêm thẻ ghi nhớ mới" : "Chỉnh sửa thẻ ghi nhớ"}
              </h3>
              <button className="flashcard-modal-close-btn" onClick={() => setIsEditingCurrent(false)}>
                <HiX />
              </button>
            </div>
            
            <div className="flashcard-modal-body">
              {/* Front side content */}
              <div className="flashcard-modal-field">
                <label className="flashcard-modal-label">Thuật ngữ / Khái niệm (Mặt trước)</label>
                <input 
                  type="text" 
                  className="flashcard-modal-input"
                  value={editFront}
                  onChange={(e) => setEditFront(e.target.value)}
                  placeholder="Ví dụ: artifact, photosynthesis..."
                  autoFocus
                />
              </div>

              {/* Part of speech */}
              <div className="flashcard-modal-field">
                <label className="flashcard-modal-label">Từ loại / Phân loại</label>
                <input 
                  type="text" 
                  className="flashcard-modal-input"
                  value={editPartOfSpeech}
                  onChange={(e) => setEditPartOfSpeech(e.target.value)}
                  placeholder="Ví dụ: Danh từ, Động từ, Thuật ngữ..."
                />
              </div>

              {/* Back side content */}
              <div className="flashcard-modal-field">
                <label className="flashcard-modal-label">Định nghĩa / Giải thích (Mặt sau)</label>
                <textarea 
                  className="flashcard-modal-textarea"
                  value={editBack}
                  onChange={(e) => setEditBack(e.target.value)}
                  placeholder="Giải thích chi tiết nghĩa của từ..."
                  rows={3}
                />
              </div>

              {/* Hashtag */}
              <div className="flashcard-modal-field">
                <label className="flashcard-modal-label">Hashtag / Chủ đề</label>
                <input 
                  type="text" 
                  className="flashcard-modal-input"
                  value={editHashtag}
                  onChange={(e) => setEditHashtag(e.target.value)}
                  placeholder="Ví dụ: # Lịch sử, # Hóa học..."
                />
              </div>

              {/* Image Upload */}
              <div className="flashcard-modal-field">
                <label className="flashcard-modal-label">Hình ảnh minh họa</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                  <button 
                    type="button"
                    className="flashcard-header-btn" 
                    onClick={() => cardImageInputRef.current?.click()}
                    style={{ background: 'rgba(255, 255, 255, 0.05)', fontSize: '12px' }}
                  >
                    🖼️ Chọn hình ảnh
                  </button>
                  <input 
                    type="file"
                    ref={cardImageInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleCardImageUpload}
                  />
                  {editImage && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="flashcard-modal-img-preview">
                        <img src={editImage} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--fc-border-dark)' }} />
                      </div>
                      <button 
                        type="button"
                        onClick={() => setEditImage(null)} 
                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '11px' }}
                      >
                        Xóa ảnh
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flashcard-modal-footer">
              <button 
                type="button"
                className="flashcard-header-btn" 
                onClick={() => setIsEditingCurrent(false)}
                style={{ background: 'transparent', borderColor: 'var(--fc-border-dark)' }}
              >
                Hủy bỏ
              </button>
              <button 
                type="button"
                className="flashcard-header-btn" 
                onClick={handleSaveCurrentEdit}
                style={{ background: 'var(--fc-gold)', color: '#12120e', border: 'none' }}
              >
                Lưu thẻ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
