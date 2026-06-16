import React, { useState, useRef, useEffect } from 'react';
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
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setInputText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
        hasChildren
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

  // Save mindmap to Database
  const handleSaveMindmap = async () => {
    if (!currentUser) {
      toast('Bạn cần đăng nhập để lưu sơ đồ tư duy vào tài khoản Học viên!', 'warning');
      return;
    }
    if (!mindmapData) return;

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

    const updateNodeInTree = (node) => {
      if (node.id === nodeId) {
        return { ...node, name, description: desc };
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
    if (!confirm('Bạn có chắc chắn muốn xóa sơ đồ tư duy này khỏi thư viện?')) return;

    try {
      await api.deleteMindmap(id);
      toast('Đã xóa sơ đồ tư duy!', 'success');
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
  };

  const handleNavigateToAuth = (mode) => {
    navigateTo('/');
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
      <div className="aitutor-workspace">
        {/* Left sidebar: Control & history */}
        <aside className="aitutor-sidebar">
          {/* Tabs header */}
          <div className="aitutor-sidebar-tabs">
            <button 
              className={`aitutor-tab-btn ${activeTab === 'create' ? 'aitutor-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              <HiSparkles /> Tạo sơ đồ
            </button>
            <button 
              className={`aitutor-tab-btn ${activeTab === 'history' ? 'aitutor-tab-btn--active' : ''}`}
              onClick={() => {
                setActiveTab('history');
                if (currentUser) fetchHistory();
              }}
            >
              <HiFolder /> Đã lưu
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

          {/* History Saved Panel */}
          {activeTab === 'history' && (
            <div className="aitutor-panel-content" style={{ padding: '12px' }}>
              {!currentUser ? (
                <div className="aitutor-auth-prompt animate-in">
                  <p>Hãy đăng nhập tài khoản Học viên để lưu và xem lại các sơ đồ tư duy kiến thức của bạn.</p>
                  <button className="aitutor-auth-prompt-btn" onClick={() => handleNavigateToAuth('login')}>Đăng nhập ngay</button>
                </div>
              ) : isHistoryLoading ? (
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

                    return (
                      <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                        {/* Interactive HTML inside SVG foreignObject */}
                        <foreignObject x="-110" y="-35" width="220" height="70">
                          <div 
                            xmlns="http://www.w3.org/1999/xhtml"
                            onClick={() => handleNodeSelect(node)}
                            style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textAlign: 'center',
                              padding: '8px 12px',
                              boxSizing: 'border-box',
                              background: isRoot 
                                ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' 
                                : (isLevel1 ? 'var(--bg-card)' : 'var(--bg-main)'),
                              color: isRoot ? '#FFFFFF' : 'var(--text-primary)',
                              border: isRoot ? 'none' : (isLevel1 ? '2px solid #8B5CF6' : '1px solid var(--border)'),
                              borderLeft: isRoot ? 'none' : (isLevel1 ? '6px solid #8B5CF6' : '6px solid #0D9488'),
                              borderRadius: '14px',
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
    </div>
  );
}
