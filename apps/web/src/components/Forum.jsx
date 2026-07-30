import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { toast } from '../utils/toast';
import DOMPurify from 'dompurify';
import {
  HiChat, HiHeart, HiSearch, HiPlus, HiArrowLeft, HiUser, HiTag,
  HiCheckCircle, HiDownload, HiUserGroup, HiStar, HiTrendingUp,
  HiSparkles, HiShieldCheck, HiFlag, HiRefresh, HiHome,
  HiChatAlt, HiBookmark, HiOutlineBookmark, HiShare
} from 'react-icons/hi';
import { HiTrophy } from 'react-icons/hi2';
import { io } from 'socket.io-client';
import { api, API_BASE } from '../api';
import LoadingOverlay from './LoadingOverlay';

function resolveImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const cleanUrl = url.startsWith('/') ? url : '/' + url;
  return `${API_BASE}${cleanUrl}`;
}

function stripImages(text) {
  if (!text) return '';
  return text.replace(/!\[(.*?)\]\((.*?)\)/g, '').trim();
}

function getFirstImageUrl(text) {
  if (!text) return null;
  const regex = /!\[(.*?)\]\((.*?)\)/;
  const match = regex.exec(text);
  return match ? resolveImageUrl(match[2]) : null;
}

function renderSanitizedContent(content) {
  if (!content) return null;
  let html = content;
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, src) => {
    return `<img src="${resolveImageUrl(src)}" alt="${alt}" class="forum-content-image" />`;
  });
  html = html.replace(/(@[A-Za-z0-9_À-ỹ]+(?:\s+[A-Za-z0-9_À-ỹ]+)*)/g, '<span style="color: var(--primary); font-weight: bold;">$1</span>');
  html = html.replace(/\n/g, '<br />');
  const sanitized = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}

function extractFirstImageUrl(content) {
  if (!content) return null;
  const match = content.match(/!\[.*?\]\((.*?)\)/);
  return match ? match[1] : null;
}

export default function Forum({ currentUser }) {
  // Global View Controls
  const [activeTab, setActiveTab] = useState(() => {
    const hasSavedGroup = localStorage.getItem('forum_active_group');
    return hasSavedGroup ? 'groups' : 'feed';
  }); // feed, groups, drive, leaderboard
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(() => {
    const saved = localStorage.getItem('forum_active_group');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [groupTab, setGroupTab] = useState(() => {
    return localStorage.getItem('forum_active_group_tab') || 'announcements';
  });
  
  // API State data
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [comments, setComments] = useState([]);
  const [studyGroups, setStudyGroups] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [gamifyProfile, setGamifyProfile] = useState({ level: 1, xp: 50, streakDays: 1, progress: 50, nextLevelXP: 100, badges: [] });
  const [groupAnnouncements, setGroupAnnouncements] = useState([]);
  const [groupPosts, setGroupPosts] = useState([]);
  const [groupChatMessages, setGroupChatMessages] = useState([]);
  const [groupMembers, setGroupMembers] = useState({ accepted: [], pending: [] });
  const [joiningGroupId, setJoiningGroupId] = useState(null);
  const [sidebarOverlapOffset, setSidebarOverlapOffset] = useState(0);
  const [profileSubTab, setProfileSubTab] = useState('my_posts'); // my_posts, saved_posts
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  // Sync selectedGroup to localStorage
  useEffect(() => {
    if (selectedGroup) {
      localStorage.setItem('forum_active_group', JSON.stringify(selectedGroup));
    } else {
      localStorage.removeItem('forum_active_group');
      localStorage.removeItem('forum_active_group_tab');
    }
  }, [selectedGroup]);

  // Sync groupTab to localStorage
  useEffect(() => {
    if (groupTab) {
      localStorage.setItem('forum_active_group_tab', groupTab);
    }
  }, [groupTab]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate Footer Overlap dynamically to prevent sidebar clashing with footer
  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer') || document.querySelector('.lp-footer') || document.querySelector('.fts-footer');
      if (footer) {
        const rect = footer.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        if (rect.top < viewportHeight) {
          const overlap = viewportHeight - rect.top;
          setSidebarOverlapOffset(Math.max(0, overlap + 20));
        } else {
          setSidebarOverlapOffset(0);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Loading & Filtering controls
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedType, setSelectedType] = useState('All'); // All, GENERAL, QA, RESOURCE
  const [sortType, setSortType] = useState('newest');

  // Modals & Inputs
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editPostType, setEditPostType] = useState('GENERAL');
  const [editDifficulty, setEditDifficulty] = useState('MEDIUM');
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTagsString, setEditTagsString] = useState('');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState({ postId: null, commentId: null });
  const [reportReason, setReportReason] = useState('');

  // Post Creator form states
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newPostType, setNewPostType] = useState('GENERAL');
  const [newDifficulty, setNewDifficulty] = useState('MEDIUM');
  const [newTagsString, setNewTagsString] = useState('');
  
  // Group Announcement form states
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [chatInput, setChatInput] = useState('');

  // Resource file attachment states
  const [resourceFile, setResourceFile] = useState(null); // { fileUrl, fileType, fileSize }

  // New Comment / Reply state
  const [commentText, setCommentText] = useState('');
  const [replyTargetId, setReplyTargetId] = useState(null); // Track which comment we are replying to
  const [submitting, setSubmitting] = useState(false);

  // Advanced Filtering controls
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [filterResolved, setFilterResolved] = useState('All');
  const [filterHasAttachment, setFilterHasAttachment] = useState(false);
  const [filterDateRange, setFilterDateRange] = useState('All');

  // Image Upload Previews & Drag states
  const [postImages, setPostImages] = useState([]);
  const [commentImages, setCommentImages] = useState([]);
  const [dragOverPost, setDragOverPost] = useState(false);
  const [dragOverComment, setDragOverComment] = useState(false);

  // New States for community enhancements
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [showXPHelp, setShowXPHelp] = useState(false);
  const [uploadingResource, setUploadingResource] = useState(false);

  // Socket setup
  const socketRef = useRef(null);
  const selectedGroupIdRef = useRef(null);
  const activeRoomRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket Server
    socketRef.current = io(API_BASE);

    socketRef.current.on('connect', () => {
      console.log('[Socket] Connected to server from Forum view');
      if (selectedGroupIdRef.current) {
        const room = `group_${selectedGroupIdRef.current}`;
        socketRef.current.emit('join_room', room);
        activeRoomRef.current = room;
      }
    });

    // Listen to real-time incoming comments on active thread
    socketRef.current.on('comment_received', (newComment) => {
      setComments(prev => {
        // If parentId, append to replies nested node
        if (newComment.parentId) {
          return prev.map(c => {
            if (c.id === newComment.parentId) {
              if (c.replies?.some(r => r.id === newComment.id)) return c;
              return { ...c, replies: [...(c.replies || []), newComment] };
            }
            return c;
          });
        }
        // Check for duplicates
        if (prev.some(c => c.id === newComment.id)) return prev;
        return [...prev, newComment];
      });
    });

    socketRef.current.on('receive_message', (msg) => {
      if (msg.roomId === `group_${selectedGroupIdRef.current}`) {
        setGroupChatMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          const mappedMsg = {
            ...msg,
            authorName: msg.authorName || (msg.role === 'ADMIN' ? 'Quản trị viên' : (msg.role === 'TEACHER' ? 'Giáo viên' : 'Học sinh'))
          };
          return [...prev, mappedMsg];
        });
      }
    });

    socketRef.current.on('study_group_created', () => {
      console.log('[Socket] New study group created, refreshing list...');
      fetchStudyGroups();
    });

    socketRef.current.on('study_group_deleted', () => {
      console.log('[Socket] Study group deleted, refreshing...');
      fetchStudyGroups();
    });

    socketRef.current.on('study_group_join_request', (data) => {
      console.log('[Socket] New study group join request received:', data);
      fetchStudyGroups();
      if (selectedGroupIdRef.current === data.groupId) {
        fetchGroupMembers(data.groupId);
      }
    });

    // Fetch initial categories and study groups
    fetchCategories();
    fetchStudyGroups();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Fetch posts on filters change or tab change
  useEffect(() => {
    if (activeTab === 'feed' || activeTab === 'saved') {
      fetchPosts();
    } else if (activeTab === 'groups') {
      fetchStudyGroups();
    } else if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    }
    fetchGamifyProfile();
  }, [activeTab, selectedCategory, selectedType, selectedTag, sortType, filterDifficulty, filterResolved, filterHasAttachment, filterDateRange]);

  // Monitor room join / leave on post selection
  useEffect(() => {
    if (socketRef.current) {
      if (selectedPost) {
        socketRef.current.emit('join_post', selectedPost.id);
        fetchComments(selectedPost.id);
      } else {
        // Leave room
        setComments([]);
      }
    }
  }, [selectedPost]);

  // Monitor room join / leave on group selection
  useEffect(() => {
    selectedGroupIdRef.current = selectedGroup ? selectedGroup.id : null;
    if (selectedGroup) {
      if (socketRef.current) {
        const room = `group_${selectedGroup.id}`;
        if (activeRoomRef.current && activeRoomRef.current !== room) {
          socketRef.current.emit('leave_room', activeRoomRef.current);
        }
        socketRef.current.emit('join_room', room);
        activeRoomRef.current = room;
      }
      fetchGroupAnnouncements(selectedGroup.id);
      fetchGroupPosts(selectedGroup.id);
      fetchGroupMessages(selectedGroup.id);
      fetchGroupMembers(selectedGroup.id);
    } else {
      if (socketRef.current && activeRoomRef.current) {
        socketRef.current.emit('leave_room', activeRoomRef.current);
        activeRoomRef.current = null;
      }
      setGroupChatMessages([]);
    }
  }, [selectedGroup]);

  // Re-fetch group messages & members as soon as currentUser finishes authenticating/loading
  useEffect(() => {
    if (currentUser && selectedGroup) {
      fetchGroupMessages(selectedGroup.id);
      fetchGroupMembers(selectedGroup.id);
    }
  }, [currentUser]);

  // =========================================================================
  // API CLIENT CALLS
  // =========================================================================

  const fetchCategories = async () => {
    try {
      const data = await api.getForumCategories();
      setCategories(data || []);
      if (data && data.length > 0) {
        setNewCategoryId(data[0].id);
      }
    } catch (err) {
      console.error('Lỗi tải danh mục:', err);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = {
        categoryId: selectedCategory === 'All' ? '' : selectedCategory,
        postType: selectedType === 'All' ? '' : selectedType,
        tag: selectedTag,
        search: searchQuery,
        sort: sortType === 'newest' ? '' : sortType,
        difficulty: filterDifficulty === 'All' ? '' : filterDifficulty,
        resolved: filterResolved === 'All' ? '' : filterResolved,
        hasAttachment: filterHasAttachment ? 'true' : '',
        dateRange: filterDateRange === 'All' ? '' : filterDateRange,
        isSaved: activeTab === 'saved' ? 'true' : ''
      };
      const data = await api.getForumPosts(params);
      setPosts(data || []);
    } catch (err) {
      console.error('Lỗi tải bài viết:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupAnnouncements = async (groupId) => {
    try {
      const data = await api.getGroupAnnouncements(groupId);
      setGroupAnnouncements(data || []);
    } catch (err) {
      console.error('Lỗi tải thông báo nhóm:', err);
    }
  };

  const fetchGroupPosts = async (groupId) => {
    try {
      const data = await api.getForumPosts({ studyGroupId: groupId });
      setGroupPosts(data || []);
    } catch (err) {
      console.error('Lỗi tải bài viết nhóm:', err);
    }
  };

  const fetchGroupMessages = async (groupId) => {
    if (!groupId) return;
    try {
      const res = await api.getStudyGroupMessages(groupId);
      const messagesList = Array.isArray(res) ? res : (res?.data || res?.messages || []);
      const welcome = {
        id: 'welcome',
        roomId: `group_${groupId}`,
        role: 'SYSTEM',
        content: `Chào mừng bạn đến với kênh trò chuyện của nhóm "${selectedGroup?.name || ''}". Hãy thảo luận lịch học và ôn thi tại đây!`,
        createdAt: new Date().toISOString()
      };
      setGroupChatMessages([welcome, ...messagesList]);
    } catch (err) {
      console.error('Lỗi tải tin nhắn nhóm:', err);
    }
  };

  const fetchGroupMembers = async (groupId) => {
    if (!groupId) return;
    try {
      const res = await api.getStudyGroupMembers(groupId);
      const membersData = res?.accepted ? res : (res?.data || { accepted: [], pending: [] });
      setGroupMembers(membersData);
    } catch (err) {
      console.error('Lỗi tải thành viên nhóm:', err);
    }
  };

  const handleApproveRequest = async (groupId, targetUserId) => {
    try {
      const res = await api.approveJoinRequest(groupId, targetUserId);
      if (res && res.success) {
        toast('Đã duyệt thành viên gia nhập nhóm thành công!', 'success');
        fetchGroupMembers(groupId);
        fetchStudyGroups();
      }
    } catch (err) {
      toast(err.message || 'Lỗi duyệt yêu cầu gia nhập!', 'error');
    }
  };

  const handleRejectRequest = async (groupId, targetUserId) => {
    try {
      const res = await api.rejectJoinRequest(groupId, targetUserId);
      if (res && res.success) {
        toast('Đã từ chối yêu cầu gia nhập nhóm!', 'info');
        fetchGroupMembers(groupId);
        fetchStudyGroups();
      }
    } catch (err) {
      toast(err.message || 'Lỗi từ chối yêu cầu gia nhập!', 'error');
    }
  };

  const handleJoinStudyGroup = async (groupId, isPrivate) => {
    setJoiningGroupId(groupId);
    try {
      const res = await api.joinStudyGroup(groupId);
      if (res && res.success) {
        await fetchStudyGroups();
        if (isPrivate) {
          toast('Yêu cầu gia nhập nhóm riêng tư đã được gửi. Vui lòng chờ quản trị viên duyệt!', 'info');
          alert('Yêu cầu gia nhập nhóm của bạn đã được gửi. Vui lòng chờ quản trị viên duyệt!');
        } else {
          toast('Gia nhập nhóm học tập thành công!', 'success');
        }
      }
    } catch (err) {
      toast(err.message || err.error || 'Lỗi gia nhập nhóm!', 'error');
    } finally {
      setJoiningGroupId(null);
    }
  };

  const handleCreateGroupAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim() || submitting) return;
    setSubmitting(true);
    try {
      await api.createGroupAnnouncement(selectedGroup.id, newAnnTitle, newAnnContent);
      setNewAnnTitle('');
      setNewAnnContent('');
      fetchGroupAnnouncements(selectedGroup.id);
      toast('Đăng thông báo nhóm thành công!', 'success');
    } catch (err) {
      toast(err.message || 'Lỗi đăng thông báo nhóm!', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateGroupPost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || submitting) return;
    setSubmitting(true);
    try {
      const postPayload = {
        title: newTitle,
        content: newContent,
        categoryId: Number(newCategoryId),
        postType: newPostType,
        difficulty: newPostType === 'QA' ? newDifficulty : undefined,
        tags: newTagsString.split(',').map(t => t.trim()).filter(t => t.length > 0),
        studyGroupId: selectedGroup.id
      };
      await api.createForumPost(postPayload);
      setNewTitle('');
      setNewContent('');
      setNewTagsString('');
      fetchGroupPosts(selectedGroup.id);
      toast('Đăng bài thảo luận vào nhóm thành công!', 'success');
    } catch (err) {
      toast(err.message || 'Lỗi đăng bài viết nhóm!', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedGroup) return;

    const textToSend = chatInput.trim();
    setChatInput('');

    try {
      // 1. Send via HTTP POST API (saves to DB synchronously and broadcasts via socket)
      const res = await api.sendStudyGroupMessage(selectedGroup.id, textToSend);
      if (res && res.success && res.data) {
        setGroupChatMessages(prev => {
          if (prev.some(m => m.id === res.data.id)) return prev;
          return [...prev, res.data];
        });
      }
    } catch (err) {
      console.error('Lỗi gửi tin nhắn chat:', err);
      // 2. Fallback emit via socket if HTTP fails
      if (socketRef.current) {
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const senderName = currentUser?.fullName || currentUser?.name || 'Học sinh';
        socketRef.current.emit('send_message', {
          id: messageId,
          roomId: `group_${selectedGroup.id}`,
          studentId: currentUser?.id,
          role: currentUser?.role || 'STUDENT',
          content: textToSend,
          authorName: senderName
        });
      }
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (!window.confirm('Bạn có chắc chắn muốn rời nhóm học tập này?')) return;
    setLoading(true);
    try {
      await api.leaveStudyGroup(groupId);
      setSelectedGroup(null);
      await fetchStudyGroups();
      toast('Đã rời khỏi nhóm học tập!', 'success');
    } catch (err) {
      toast(err.message || 'Không thể rời nhóm!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId) => {
    setCommentsLoading(true);
    try {
      const data = await api.getForumComments(postId);
      setComments(data || []);
    } catch (err) {
      console.error('Lỗi tải bình luận:', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const fetchStudyGroups = async () => {
    setLoading(true);
    try {
      const data = await api.getStudyGroups();
      setStudyGroups(data || []);
    } catch (err) {
      console.error('Lỗi tải nhóm học tập:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await api.getForumLeaderboard();
      setLeaderboard(data || []);
    } catch (err) {
      console.error('Lỗi tải bảng xếp hạng:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGamifyProfile = async () => {
    try {
      const data = await api.getUserGamificationProfile();
      const profileData = data?.data || data;
      if (profileData && profileData.level) {
        setGamifyProfile(profileData);
      } else {
        setGamifyProfile(prev => prev || { level: 1, xp: 50, streakDays: 1, progress: 50, nextLevelXP: 100, badges: [] });
      }
    } catch (err) {
      console.error('Lỗi tải gamification profile:', err);
      setGamifyProfile(prev => prev || { level: 1, xp: 50, streakDays: 1, progress: 50, nextLevelXP: 100, badges: [] });
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || submitting) return;
    setSubmitting(true);
    try {
      const parsedTags = newTagsString
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      let finalContent = newContent.trim();
      if (postImages.length > 0) {
        finalContent += '\n\n' + postImages.map(img => `![ảnh](${img})`).join('\n');
      }

      const postPayload = {
        title: newTitle,
        content: finalContent,
        categoryId: Number(newCategoryId),
        postType: newPostType,
        difficulty: newPostType === 'QA' ? newDifficulty : undefined,
        tags: parsedTags,
        resourceFile: newPostType === 'RESOURCE' ? resourceFile : undefined
      };

      await api.createForumPost(postPayload);
      
      // Reset form & close modal
      setNewTitle('');
      setNewContent('');
      setNewTagsString('');
      setResourceFile(null);
      setPostImages([]);
      setShowCreateModal(false);
      
      // Reload stream
      fetchPosts();
      fetchGamifyProfile();
      toast('Đăng bài thảo luận thành công!', 'success');
    } catch (err) {
      toast(err.message || 'Đăng bài viết thất bại!', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) return;
    try {
      await api.deleteForumPost(postId);
      toast('Xóa bài viết thành công!', 'success');
      setSelectedPost(null);
      fetchPosts();
    } catch (err) {
      toast(err.message || 'Xóa bài viết thất bại!', 'error');
    }
  };

  const handleOpenEditModal = (post) => {
    setEditingPost(post);
    setEditCategoryId(post.categoryId);
    setEditPostType(post.postType);
    setEditDifficulty(post.difficulty || 'MEDIUM');
    setEditTitle(post.title);
    setResourceFile(post.resourceFile || null);
    
    // Parse out markdown images and separate the content
    const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
    const urls = [];
    const cleanContent = post.content.replace(imgRegex, (m, alt, src) => {
      urls.push(src);
      return '';
    }).trim();
    
    setEditContent(cleanContent);
    setPostImages(urls);
    setEditTagsString(post.tags?.map(t => t.name).join(', ') || '');
    setShowEditModal(true);
  };

  const handleEditPost = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editContent.trim() || submitting) return;
    setSubmitting(true);
    try {
      const parsedTags = editTagsString
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      let finalContent = editContent.trim();
      if (postImages.length > 0) {
        finalContent += '\n\n' + postImages.map(img => `![ảnh](${img})`).join('\n');
      }

      const postPayload = {
        title: editTitle,
        content: finalContent,
        categoryId: Number(editCategoryId),
        postType: editPostType,
        difficulty: editPostType === 'QA' ? editDifficulty : undefined,
        tags: parsedTags,
        resourceFile: resourceFile || undefined
      };

      const res = await api.updateForumPost(editingPost.id, postPayload);
      
      // Update detailed view state if it is currently open
      if (selectedPost && selectedPost.id === editingPost.id) {
        setSelectedPost(res.data);
      }
      
      setShowEditModal(false);
      fetchPosts();
      toast('Cập nhật bài viết thành công!', 'success');
    } catch (err) {
      toast(err.message || 'Cập nhật bài viết thất bại!', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Bạn có chắc chắn muốn giải tán (xóa) nhóm học tập này? Hành động này không thể hoàn tác.')) return;
    setLoading(true);
    try {
      await api.deleteStudyGroup(groupId);
      setSelectedGroup(null);
      await fetchStudyGroups();
      toast('Đã xóa nhóm học tập thành công!', 'success');
    } catch (err) {
      toast(err.message || 'Xóa nhóm học tập thất bại!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleUploadImageForPost = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const data = await api.uploadFile(file);
      if (data && data.url) {
        setPostImages(prev => [...prev, data.url]);
        toast('Tải ảnh lên thành công!', 'success');
      }
    } catch (err) {
      toast(err.message || 'Tải ảnh lên thất bại!', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUploadImageForComment = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const data = await api.uploadFile(file);
      if (data && data.url) {
        setCommentImages(prev => [...prev, data.url]);
        toast('Tải ảnh lên thành công!', 'success');
      }
    } catch (err) {
      toast(err.message || 'Tải ảnh lên thất bại!', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDocumentUpload = async (file) => {
    if (!file) return;
    setUploadingResource(true);
    try {
      const data = await api.uploadFile(file);
      if (data && data.url) {
        setResourceFile({
          fileUrl: data.url,
          fileName: file.name,
          fileType: file.name.split('.').pop()?.toUpperCase() || 'PDF',
          fileSize: file.size
        });
        toast('Tải tệp tài liệu lên thành công!', 'success');
      }
    } catch (err) {
      toast(err.message || 'Tải tệp tài liệu lên thất bại!', 'error');
    } finally {
      setUploadingResource(false);
    }
  };

  const handlePasteImage = async (e, isPost = true) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (!file) continue;
        
        setUploadingImage(true);
        try {
          const data = await api.uploadFile(file);
          if (data && data.url) {
            if (isPost) {
              setPostImages(prev => [...prev, data.url]);
            } else {
              setCommentImages(prev => [...prev, data.url]);
            }
            toast('Dán ảnh thành công!', 'success');
          }
        } catch (err) {
          toast(err.message || 'Tải ảnh từ clipboard thất bại!', 'error');
        } finally {
          setUploadingImage(false);
        }
        break;
      }
    }
  };

  const handleDropImage = async (e, isPost = true) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (file.type.indexOf('image') === -1) {
      toast('Chỉ hỗ trợ tải lên tệp hình ảnh!', 'warning');
      return;
    }
    
    setUploadingImage(true);
    try {
      const data = await api.uploadFile(file);
      if (data && data.url) {
        if (isPost) {
          setPostImages(prev => [...prev, data.url]);
        } else {
          setCommentImages(prev => [...prev, data.url]);
        }
        toast('Tải ảnh lên từ kéo thả thành công!', 'success');
      }
    } catch (err) {
      toast(err.message || 'Tải ảnh lên thất bại!', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() && commentImages.length === 0) return;

    let finalComment = commentText.trim();
    if (commentImages.length > 0) {
      finalComment += '\n\n' + commentImages.map(img => `![ảnh](${img})`).join('\n');
    }

    const tempId = `temp-${Date.now()}`;
    const targetParentId = replyTargetId;
    const tempComment = {
      id: tempId,
      content: finalComment,
      authorId: currentUser?.id,
      author: {
        fullName: currentUser?.fullName || 'Người dùng EduPath',
        avatarUrl: currentUser?.avatarUrl
      },
      createdAt: new Date().toISOString(),
      userReaction: null,
      reactionCounts: {},
      replies: [],
      parentId: targetParentId
    };

    // 1. Optimistic Update (< 0.01s)
    if (targetParentId) {
      setComments(prev => prev.map(c => {
        if (c.id === targetParentId) {
          return { ...c, replies: [...(c.replies || []), tempComment] };
        }
        return c;
      }));
    } else {
      setComments(prev => [...prev, tempComment]);
    }

    const savedText = commentText;
    const savedImages = [...commentImages];
    setCommentText('');
    setCommentImages([]);
    setReplyTargetId(null);

    // 2. Async API Call
    try {
      const newComment = await api.createForumComment(selectedPost.id, finalComment, targetParentId);

      setComments(prev => {
        const updateTree = (list) => {
          return (list || []).map(c => {
            if (c.id === tempId) return newComment;
            if (c.id === targetParentId) {
              const updatedReplies = (c.replies || []).map(r => r.id === tempId ? newComment : r);
              return { ...c, replies: updatedReplies };
            }
            return { ...c, replies: updateTree(c.replies) };
          });
        };
        return updateTree(prev);
      });

      if (selectedPost) {
        setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p));
        setSelectedPost(prev => prev ? { ...prev, commentCount: (prev.commentCount || 0) + 1 } : null);
      }
      fetchGamifyProfile();
    } catch (err) {
      toast(err.message || 'Không thể gửi bình luận!', 'error');
      // Rollback
      setComments(prev => prev.filter(c => c.id !== tempId));
      setCommentText(savedText);
      setCommentImages(savedImages);
    }
  };

  const handleLikePost = async (postId) => {
    await handleReactPost(postId, 'UPVOTE');
  };

  const handleReactPost = async (eOrPostId, postIdOrType, typeParam) => {
    let postId, type;
    if (eOrPostId && eOrPostId.stopPropagation) {
      eOrPostId.stopPropagation();
      postId = postIdOrType;
      type = typeParam || 'UPVOTE';
    } else {
      postId = eOrPostId;
      type = postIdOrType || 'UPVOTE';
    }

    if (!postId) return;
    if (!currentUser) {
      toast('Vui lòng đăng nhập để bày tỏ cảm xúc!', 'warning');
      return;
    }

    // 1. Optimistic Update (< 0.01s)
    const prevPosts = [...posts];
    const prevSelectedPost = selectedPost ? { ...selectedPost } : null;

    const applyOptimisticLike = (postObj) => {
      if (!postObj) return null;
      const isLiked = postObj.userReaction === 'UPVOTE' || postObj.likedBy?.includes(currentUser?.id);
      const newReaction = isLiked ? null : 'UPVOTE';
      const updatedLikedBy = isLiked
        ? (postObj.likedBy || []).filter(id => id !== currentUser?.id)
        : [...(postObj.likedBy || []), currentUser?.id];
      const delta = isLiked ? -1 : 1;
      const newLikes = Math.max(0, (postObj.likes || 0) + delta);
      const newReactionCounts = { ...(postObj.reactionCounts || {}) };
      newReactionCounts['UPVOTE'] = Math.max(0, (newReactionCounts['UPVOTE'] || 0) + delta);

      return {
        ...postObj,
        likes: newLikes,
        likedBy: updatedLikedBy,
        userReaction: newReaction,
        reactionCounts: newReactionCounts
      };
    };

    setPosts(prev => prev.map(p => p.id === postId ? applyOptimisticLike(p) : p));
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost(prev => applyOptimisticLike(prev));
    }

    // 2. Async API Call
    try {
      const result = await api.reactForumPost(postId, type);
      setPosts(prev => prev.map(p => p.id === postId ? {
        ...p,
        likes: result.likes,
        userReaction: result.userReaction,
        reactionCounts: result.reactionCounts
      } : p));
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(prev => prev ? {
          ...prev,
          likes: result.likes,
          userReaction: result.userReaction,
          reactionCounts: result.reactionCounts
        } : null);
      }
    } catch (err) {
      setPosts(prevPosts);
      if (prevSelectedPost) setSelectedPost(prevSelectedPost);
      toast(err.message || 'Thao tác bày tỏ cảm xúc thất bại!', 'error');
    }
  };

  const handleReactComment = async (commentId, type) => {
    if (!currentUser) {
      toast('Vui lòng đăng nhập để bày tỏ cảm xúc!', 'warning');
      return;
    }
    try {
      const result = await api.reactForumComment(commentId, type);
      
      setComments(prev => {
        const updateReplies = (replies) => {
          return (replies || []).map(r => {
            if (r.id === commentId) {
              return { ...r, reactionCounts: result.reactionCounts, userReaction: result.userReaction };
            }
            return { ...r, replies: updateReplies(r.replies) };
          });
        };

        return prev.map(c => {
          if (c.id === commentId) {
            return { ...c, reactionCounts: result.reactionCounts, userReaction: result.userReaction };
          }
          return { ...c, replies: updateReplies(c.replies) };
        });
      });
    } catch (err) {
      toast(err.message || 'Thao tác bày tỏ cảm xúc thất bại!', 'error');
    }
  };

  const handleToggleSavePost = async (eOrPost, postOrId) => {
    let targetPostId = null;
    if (eOrPost && eOrPost.stopPropagation) {
      eOrPost.stopPropagation();
      if (typeof postOrId === 'object' && postOrId !== null) {
        targetPostId = postOrId.id;
      } else {
        targetPostId = postOrId;
      }
    } else if (typeof eOrPost === 'object' && eOrPost !== null) {
      targetPostId = eOrPost.id;
    } else {
      targetPostId = eOrPost;
    }

    if (!targetPostId) return;

    if (!currentUser) {
      toast('Vui lòng đăng nhập để lưu bài viết!', 'warning');
      return;
    }

    // 1. Optimistic Update (< 0.01s)
    const targetPost = posts.find(p => p.id === targetPostId) || selectedPost;
    const isCurrentlySaved = !!targetPost?.isSaved;
    const newIsSaved = !isCurrentlySaved;

    setPosts(prev => prev.map(p => p.id === targetPostId ? { ...p, isSaved: newIsSaved } : p));
    if (selectedPost && selectedPost.id === targetPostId) {
      setSelectedPost(prev => prev ? { ...prev, isSaved: newIsSaved } : null);
    }

    // 2. Async API Call
    try {
      const res = await api.toggleSaveForumPost(targetPostId);
      setPosts(prev => prev.map(p => p.id === targetPostId ? { ...p, isSaved: res.isSaved } : p));
      if (selectedPost && selectedPost.id === targetPostId) {
        setSelectedPost(prev => prev ? { ...prev, isSaved: res.isSaved } : null);
      }
      toast(res.isSaved ? 'Đã lưu bài viết vào bộ sưu tập!' : 'Đã bỏ lưu bài viết!', 'success');
    } catch (err) {
      // Rollback on error
      setPosts(prev => prev.map(p => p.id === targetPostId ? { ...p, isSaved: isCurrentlySaved } : p));
      if (selectedPost && selectedPost.id === targetPostId) {
        setSelectedPost(prev => prev ? { ...prev, isSaved: isCurrentlySaved } : null);
      }
      toast(err.message || 'Thao tác lưu bài viết thất bại!', 'error');
    }
  };

  const handleAcceptSolution = async (commentId) => {
    try {
      await api.acceptCommentSolution(commentId);
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return { ...c, isSolution: !c.isSolution };
        }
        return c;
      }));
      toast('Đã cập nhật trạng thái lời giải hay!', 'success');
      fetchGamifyProfile();
    } catch (err) {
      toast(err.message || 'Không thể chọn câu trả lời này!', 'error');
    }
  };

  const handleCreateStudyGroup = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const name = e.target.groupName.value;
    const description = e.target.groupDesc.value;
    const isPrivate = e.target.groupPrivate.checked;

    setSubmitting(true);
    try {
      await api.createStudyGroup({ name, description, isPrivate });
      setShowGroupModal(false);
      fetchStudyGroups();
      toast('Tạo nhóm học tập thành công!', 'success');
    } catch (err) {
      toast(err.message || 'Tạo nhóm thất bại!', 'error');
    } finally {
      setSubmitting(false);
    }
  };



  const handleDownloadFile = async (resourceId, fileUrl) => {
    try {
      await api.downloadResource(resourceId);
      // Open file in new tab to download
      window.open(fileUrl, '_blank');
      fetchGamifyProfile();
    } catch (err) {
      console.error(err);
      window.open(fileUrl, '_blank');
    }
  };

  const handleSendReport = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return;

    try {
      await api.createForumReport(reportTarget.postId, reportTarget.commentId, reportReason);
      setReportReason('');
      setShowReportModal(false);
      toast('Cảm ơn bạn! Báo cáo đã được gửi tới Ban quản trị kiểm duyệt.', 'success');
    } catch (err) {
      toast(err.message || 'Lỗi gửi báo cáo!', 'error');
    }
  };

  const getFilteredPosts = (items) => {
    if (!items) return [];
    return items.filter(post => {
      // 1. Search Query
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = post.title?.toLowerCase().includes(query);
        const matchesContent = post.content?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesContent) return false;
      }
      
      // 2. Category
      if (selectedCategory && selectedCategory !== 'All') {
        if (post.categoryName !== selectedCategory) return false;
      }
      
      // 3. Post Type
      if (selectedType && selectedType !== 'All') {
        if (post.postType !== selectedType) return false;
      }
      
      // 4. Difficulty (only for Q&A)
      if (filterDifficulty && filterDifficulty !== 'All') {
        if (post.difficulty !== filterDifficulty) return false;
      }
      
      // 5. Resolved Status (only for Q&A)
      if (filterResolved && filterResolved !== 'All') {
        const isResolved = filterResolved === 'RESOLVED';
        if (post.isResolved !== isResolved) return false;
      }
      
      // 6. Has Attachment
      if (filterHasAttachment) {
        if (!post.resourceFile && !post.resourceId) return false;
      }
      
      // 7. Date Range
      if (filterDateRange && filterDateRange !== 'All') {
        const postDate = new Date(post.createdAt);
        const now = new Date();
        if (filterDateRange === 'today') {
          const isToday = postDate.getDate() === now.getDate() &&
                          postDate.getMonth() === now.getMonth() &&
                          postDate.getFullYear() === now.getFullYear();
          if (!isToday) return false;
        } else if (filterDateRange === 'week') {
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (postDate < oneWeekAgo) return false;
        } else if (filterDateRange === 'month') {
          const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (postDate < oneMonthAgo) return false;
        }
      }
      
      return true;
    });
  };

  // =========================================================================
  // RENDER SUB-COMPONENTS & VIEW LAYOUTS
  // =========================================================================

    return (
    <div className="forum-container animate-in" style={{ background: 'var(--bg-main)', minHeight: '100vh', color: 'var(--text-main)', fontFamily: "'Inter', sans-serif" }}>
      {/* EduPath Loading Overlay */}
      {(loading || submitting || commentsLoading) && (
        <LoadingOverlay message={submitting ? "Đang xử lý bình luận..." : (commentsLoading ? "Đang tải bài viết..." : "Đang tải dữ liệu...")} />
      )}

      <div style={{ display: 'flex', gap: '32px', width: '100%', margin: 0, padding: '24px 16px', minHeight: '100vh', boxSizing: 'border-box', position: 'relative' }}>
        
        {/* ================= LEFT SIDEBAR (Desktop Only, Portal Fixed to Viewport) ================= */}
        {!isMobile && createPortal(
          <aside className="forum-desktop-sidebar" style={{ position: 'fixed', top: '90px', left: '24px', width: '280px', maxHeight: sidebarOverlapOffset > 0 ? `calc(100vh - 110px - ${sidebarOverlapOffset}px)` : 'calc(100vh - 110px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '28px', borderRight: '1px solid var(--border)', paddingRight: '20px', boxSizing: 'border-box', zIndex: 99, background: 'transparent', transition: 'max-height 0.05s ease-out' }}>
            <div>
              {/* Navigation Items */}
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { id: 'feed', label: 'Dành cho bạn', icon: <HiHome style={{ fontSize: '20px' }} /> },
                  { id: 'search', label: 'Tìm kiếm', icon: <HiSearch style={{ fontSize: '20px' }} /> },
                  { id: 'profile', label: 'Trang cá nhân', icon: <HiUser style={{ fontSize: '20px' }} /> },
                  { id: 'groups', label: 'Nhóm học tập', icon: <HiUserGroup style={{ fontSize: '20px' }} /> },
                ].map((item) => {
                  const isSelected = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSelectedGroup(null);
                        if (item.id === 'leaderboard') fetchLeaderboard();
                        if (item.id === 'profile') fetchGamifyProfile();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: 'none',
                        background: isSelected ? 'var(--primary-bg)' : 'transparent',
                        color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: isSelected ? '800' : '600',
                        fontSize: '14.5px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        width: '100%'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'var(--bg-card)';
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }
                      }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Nhóm học tập / Suggestions box */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1.5px dashed var(--border)',
              borderRadius: '16px',
              padding: '16px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <h4 style={{ margin: 0, fontSize: '12.5px', fontWeight: '900', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: 'var(--primary)' }}>•</span> Nhóm học tập của bạn
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {studyGroups.filter(g => g.isMember).slice(0, 3).map(group => (
                  <div 
                    key={group.id} 
                    onClick={() => {
                      setSelectedGroup(group);
                      setActiveTab('groups');
                      setGroupTab('announcements');
                      fetchGroupAnnouncements(group.id);
                    }}
                    style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '8px', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-main)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: '14px' }}>👥</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{group.name}</span>
                  </div>
                ))}
                {studyGroups.filter(g => g.isMember).length === 0 && (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 8px' }}>Bạn chưa tham gia nhóm nào.</span>
                )}
              </div>

              <button 
                onClick={() => { setActiveTab('groups'); setSelectedGroup(null); }}
                style={{
                  marginTop: '6px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: 'var(--primary)',
                  color: '#fff',
                  fontWeight: '800',
                  border: 'none',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(108, 92, 231, 0.15)',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Khám phá nhóm học tập
              </button>
            </div>
          </aside>,
          document.body
        )}

        {/* ================= MAIN CONTENT ================= */}
        <main className="forum-main-content" style={{ flex: 1, minWidth: 0, maxWidth: '920px', marginLeft: isMobile ? 0 : '312px', width: isMobile ? '100%' : 'calc(100% - 312px)', boxSizing: 'border-box' }}>
          
          {/* Mobile Sleek Horizontal Navigation Bar */}
          {isMobile && (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0 12px 0', marginBottom: '16px', borderBottom: '1px solid var(--border)', WebkitOverflowScrolling: 'touch' }}>
              {[
                { id: 'feed', label: 'Dành cho bạn', icon: '🏠' },
                { id: 'search', label: 'Tìm kiếm', icon: '🔍' },
                { id: 'profile', label: 'Trang cá nhân', icon: '👤' },
                { id: 'groups', label: 'Nhóm học tập', icon: '👥' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSelectedGroup(null);
                    if (item.id === 'profile') fetchGamifyProfile();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '20px',
                    border: 'none',
                    background: activeTab === item.id ? 'var(--primary)' : 'var(--bg-card)',
                    color: activeTab === item.id ? '#fff' : 'var(--text-secondary)',
                    fontWeight: '700',
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    boxShadow: activeTab === item.id ? '0 4px 12px rgba(108, 92, 231, 0.25)' : 'var(--shadow-sm)'
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
          
          {/* 1. FEED VIEW */}
          {activeTab === 'feed' && (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>Dành cho bạn</h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: 'var(--text-secondary)' }}>Bảng tin cộng đồng học tập EduPath</p>
                </div>
              </div>

              {/* Feed Post Create Quick Box */}
              <div 
                onClick={() => setShowCreateModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold' }}>
                  {currentUser?.fullName?.substring(0, 2).toUpperCase() || 'EP'}
                </div>
                <div style={{ flex: 1, background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '24px', padding: '10px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  Bạn có câu hỏi gì cần thảo luận hôm nay? Đăng bài ✍️
                </div>
              </div>

              {/* Threads Feed List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {getFilteredPosts(posts).map((post) => (
                  <article
                    key={post.id}
                    className="card post-item"
                    onClick={() => setSelectedPost(post)}
                    style={{
                      padding: '20px',
                      cursor: 'pointer',
                      borderRadius: '16px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-card)',
                      transition: 'all 0.2s ease',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      gap: '16px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      e.currentTarget.style.borderColor = 'var(--primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                      e.currentTarget.style.borderColor = 'var(--border)';
                    }}
                  >
                    {/* Left Thread bar */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '900', boxShadow: '0 2px 8px rgba(108, 92, 231, 0.2)' }}>
                        {post.authorName?.substring(0, 2).toUpperCase() || 'EP'}
                      </div>
                      <div style={{ width: '2px', flexGrow: 1, background: 'var(--border)', marginTop: '8px', borderRadius: '1px' }}></div>
                    </div>

                    {/* Right post contents */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Header metadata row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-primary)' }}>{post.authorName}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>•</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{post.categoryName}</span>
                          {post.postType === 'QA' && (
                            <span style={{ fontSize: '10.5px', background: '#ffeaa7', color: '#d63031', fontWeight: '800', padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                              Q&A
                            </span>
                          )}
                          {post.postType === 'RESOURCE' && (
                            <span style={{ fontSize: '10.5px', background: '#e3faf2', color: '#00b894', fontWeight: '800', padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                              Học liệu
                            </span>
                          )}
                          {post.difficulty && (
                            <span style={{
                              fontSize: '10.5px',
                              background: post.difficulty === 'EASY' ? '#d4edda' : (post.difficulty === 'MEDIUM' ? '#fff3cd' : '#f8d7da'),
                              color: post.difficulty === 'EASY' ? '#155724' : (post.difficulty === 'MEDIUM' ? '#856404' : '#721c24'),
                              fontWeight: '800',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              textTransform: 'uppercase'
                            }}>
                              {post.difficulty === 'EASY' ? 'Dễ' : (post.difficulty === 'MEDIUM' ? 'T.Bình' : 'Khó')}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>

                      {/* Title & snippet */}
                      <h3 style={{ fontSize: '16.5px', fontWeight: '900', color: 'var(--text-primary)', marginTop: 0, marginBottom: '6px', lineHeight: 1.3 }}>{post.title}</h3>
                      <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: '0 0 12px 0', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                        {post.content ? post.content.replace(/!\[(.*?)\]\((.*?)\)/g, '').trim() : ''}
                      </p>

                      {/* Image Thumbnail Preview directly on Card */}
                      {extractFirstImageUrl(post.content) && (
                        <div style={{ marginBottom: '12px', borderRadius: '12px', overflow: 'hidden', maxHeight: '280px', border: '1px solid var(--border)' }}>
                          <img 
                            src={resolveImageUrl(extractFirstImageUrl(post.content))} 
                            alt={post.title} 
                            style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', display: 'block' }} 
                          />
                        </div>
                      )}

                      {/* Resource Attachment Card directly on Feed */}
                      {post.resourceFile && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--primary-bg)', border: '1px solid var(--primary)', borderRadius: '10px', padding: '10px 14px', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '20px' }}>📄</span>
                            <div>
                              <div style={{ fontSize: '12.5px', fontWeight: 'bold', color: 'var(--primary)' }}>{post.resourceFile.fileName || 'Tài liệu học tập'}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{post.resourceFile.fileType || 'PDF'} • {Math.round((post.resourceFile.fileSize || 0) / 1024)} KB</div>
                            </div>
                          </div>
                          <a 
                            href={resolveImageUrl(post.resourceFile.fileUrl)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--primary)', textDecoration: 'none', background: 'var(--bg-card)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--primary)' }}
                          >
                            Tải tài liệu 📥
                          </a>
                        </div>
                      )}

                      {/* Tag chips */}
                      {post.tags && post.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                          {post.tags.map(t => (
                            <span key={t.id} style={{ fontSize: '11px', background: 'var(--bg-main)', color: 'var(--text-secondary)', padding: '3px 8px', borderRadius: '6px', fontWeight: '600', border: '1px solid var(--border)' }}>
                              #{t.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action buttons row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                        <div style={{ display: 'flex', gap: '20px' }}>
                          {/* Heart Likes */}
                          <button
                            type="button"
                            onClick={(e) => handleReactPost(e, post.id, 'UPVOTE')}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '13px',
                              color: post.userReaction === 'UPVOTE' ? '#ff7675' : 'var(--text-muted)',
                              fontWeight: 'bold',
                              padding: 0
                            }}
                          >
                            {post.userReaction === 'UPVOTE' ? (
                              <HiHeart style={{ fontSize: '18px', fill: '#ff7675' }} />
                            ) : (
                              <HiHeart style={{ fontSize: '18px' }} />
                            )}
                            <span>{Object.values(post.reactionCounts || {}).reduce((a, b) => a + b, 0) || 0}</span>
                          </button>

                          {/* Comments count */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                            <HiChatAlt style={{ fontSize: '18px' }} />
                            <span>{post.commentCount || 0} bình luận</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                          {/* Copy Share Link */}
                          <button
                            type="button"
                            onClick={(e) => handleSharePost(e, post)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                            title="Sao chép liên kết"
                          >
                            <HiShare style={{ fontSize: '17px' }} />
                          </button>

                          {/* Bookmark Save */}
                          <button
                            type="button"
                            onClick={(e) => handleToggleSavePost(e, post.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '6px',
                              transition: 'transform 0.15s ease'
                            }}
                            title={post.isSaved ? "Bỏ lưu bài viết" : "Lưu bài viết"}
                          >
                            {post.isSaved ? (
                              <HiBookmark style={{ fontSize: '22px', color: '#e67e22' }} />
                            ) : (
                              <HiOutlineBookmark style={{ fontSize: '22px', color: '#000000', strokeWidth: 2 }} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}

                {getFilteredPosts(posts).length === 0 && (
                  <div style={{ padding: '48px', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px' }}>
                    <span style={{ fontSize: '32px', display: 'block', marginBottom: '10px' }}>🔍</span>
                    <h4 style={{ margin: 0, fontWeight: 'bold', color: 'var(--text-primary)' }}>Không tìm thấy bài viết nào phù hợp</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>Bạn hãy đổi bộ lọc hoặc từ khóa tìm kiếm nhé.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. SEARCH VIEW */}
          {activeTab === 'search' && (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>Tìm kiếm nâng cao</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: 'var(--text-secondary)' }}>Bộ lọc tìm kiếm toàn diện dữ liệu cộng đồng</p>
              </div>

              {/* Main Search Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ position: 'relative' }}>
                  <HiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '18px' }} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập từ khóa tìm kiếm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '38px', width: '100%', height: '42px', fontSize: '13.5px', borderRadius: '10px' }}
                  />
                </div>

                {/* Categories badges filter in Search view */}
                <div className="no-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('All')}
                    className={`btn ${selectedCategory === 'All' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '12px', whiteSpace: 'nowrap', fontWeight: 'bold' }}
                  >
                    Tất cả môn học
                  </button>
                  {categories.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`btn ${selectedCategory === cat.name ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '12px', whiteSpace: 'nowrap', fontWeight: 'bold' }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Môn học / Danh mục</label>
                    <select className="form-control" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ fontSize: '12.5px', height: '36px' }}>
                      <option value="All">Tất cả môn học</option>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Dạng bài viết</label>
                    <select className="form-control" value={selectedType} onChange={(e) => setSelectedType(e.target.value)} style={{ fontSize: '12.5px', height: '36px' }}>
                      <option value="All">Tất cả dạng bài</option>
                      <option value="GENERAL">Thảo luận chung</option>
                      <option value="QA">Hỏi & Đáp (Q&A)</option>
                      <option value="RESOURCE">Học liệu / Tài liệu</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Độ khó</label>
                    <select className="form-control" value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)} style={{ fontSize: '12.5px', height: '36px' }}>
                      <option value="All">Tất cả độ khó</option>
                      <option value="EASY">Dễ</option>
                      <option value="MEDIUM">Trung bình</option>
                      <option value="HARD">Khó</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 'bold', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={filterHasAttachment}
                      onChange={(e) => setFilterHasAttachment(e.target.checked)}
                    />
                    Chỉ hiển thị bài viết có tài liệu đính kèm
                  </label>
                  
                  <button 
                    onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedType('All'); setFilterDifficulty('All'); setFilterHasAttachment(false); }}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', fontSize: '12.5px', cursor: 'pointer' }}
                  >
                    Đặt lại bộ lọc
                  </button>
                </div>
              </div>

              {/* Search Results list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {getFilteredPosts(posts).map((post) => (
                  <article
                    key={post.id}
                    className="card post-item"
                    onClick={() => setSelectedPost(post)}
                    style={{
                      padding: '20px',
                      cursor: 'pointer',
                      borderRadius: '16px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-card)',
                      transition: 'all 0.2s ease',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      gap: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '900' }}>
                        {post.authorName?.substring(0, 2).toUpperCase() || 'EP'}
                      </div>
                      <div style={{ width: '2px', flexGrow: 1, background: 'var(--border)', marginTop: '8px' }}></div>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '800', fontSize: '14px' }}>{post.authorName}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>•</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{post.categoryName}</span>
                        </div>
                        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 style={{ fontSize: '16.5px', fontWeight: '900', color: 'var(--text-primary)', margin: '0 0 6px 0' }}>{post.title}</h3>
                      <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: '0 0 12px 0', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {post.content ? post.content.replace(/!\[(.*?)\]\((.*?)\)/g, '[Ảnh]') : ''}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* 3. PROFILE VIEW */}
          {activeTab === 'profile' && (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>Trang cá nhân của bạn</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: 'var(--text-secondary)' }}>Học viên: {currentUser?.fullName}</p>
              </div>

              {/* Two columns: Posts left, Card right (Stacks on mobile) */}
              <div className="forum-profile-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 320px', gap: isMobile ? '20px' : '32px', alignItems: 'start' }}>
                {/* Left side: Sub-tabs and Posts list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid var(--border)', paddingBottom: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setProfileSubTab('my_posts')}
                      style={{
                        background: profileSubTab === 'my_posts' ? 'var(--primary-bg)' : 'transparent',
                        color: profileSubTab === 'my_posts' ? 'var(--primary)' : 'var(--text-secondary)',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        fontWeight: '900',
                        fontSize: '14.5px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Bài đăng của tôi 📝 ({posts.filter(p => Number(p.authorId) === Number(currentUser?.id) || p.authorName === currentUser?.fullName).length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setProfileSubTab('saved_posts')}
                      style={{
                        background: profileSubTab === 'saved_posts' ? 'var(--primary-bg)' : 'transparent',
                        color: profileSubTab === 'saved_posts' ? 'var(--primary)' : 'var(--text-secondary)',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        fontWeight: '900',
                        fontSize: '14.5px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Bài viết đã lưu 🔖 ({posts.filter(p => p.isSaved).length})
                    </button>
                  </div>

                  {/* 1. My Posts */}
                  {profileSubTab === 'my_posts' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {posts.filter(p => Number(p.authorId) === Number(currentUser?.id) || p.authorName === currentUser?.fullName).map((post) => (
                        <article
                          key={post.id}
                          className="card post-item"
                          onClick={() => setSelectedPost(post)}
                          style={{
                            padding: '16px',
                            cursor: 'pointer',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            background: 'var(--bg-card)',
                            boxShadow: 'var(--shadow-sm)',
                            display: 'flex',
                            gap: '12px'
                          }}
                        >
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '900', flexShrink: 0 }}>
                            {post.authorName?.substring(0, 2).toUpperCase() || 'EP'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{post.categoryName}</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h4 style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>{post.title}</h4>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                              {post.content ? post.content.replace(/!\[(.*?)\]\((.*?)\)/g, '[Ảnh]') : ''}
                            </p>
                          </div>
                        </article>
                      ))}
                      {posts.filter(p => Number(p.authorId) === Number(currentUser?.id) || p.authorName === currentUser?.fullName).length === 0 && (
                        <div style={{ padding: '36px', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                          <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>📝</span>
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 'bold' }}>Bạn chưa đăng tải thảo luận nào trên diễn đàn.</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. Saved Posts */}
                  {profileSubTab === 'saved_posts' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {posts.filter(p => p.isSaved).map((post) => (
                        <article
                          key={post.id}
                          className="card post-item"
                          onClick={() => setSelectedPost(post)}
                          style={{
                            padding: '16px',
                            cursor: 'pointer',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            background: 'var(--bg-card)',
                            boxShadow: 'var(--shadow-sm)',
                            display: 'flex',
                            gap: '12px'
                          }}
                        >
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '900', flexShrink: 0 }}>
                            🔖
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Tác giả: {post.authorName} • {post.categoryName}</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h4 style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>{post.title}</h4>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                              {post.content ? post.content.replace(/!\[(.*?)\]\((.*?)\)/g, '[Ảnh]') : ''}
                            </p>
                          </div>
                        </article>
                      ))}
                      {posts.filter(p => p.isSaved).length === 0 && (
                        <div style={{ padding: '36px', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                          <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>🔖</span>
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 'bold' }}>Bạn chưa lưu bài viết nào vào thư viện.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right side: Gamification Profile Card */}
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: 'var(--shadow-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  position: 'sticky',
                  top: '80px'
                }}>
                  {/* Top user header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '900', boxShadow: '0 4px 12px rgba(108, 92, 231, 0.3)' }}>
                      {currentUser?.fullName?.substring(0, 2).toUpperCase() || 'EP'}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: 'var(--text-primary)' }}>{currentUser?.fullName}</h4>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '700' }}>Cấp độ hiện tại: <span style={{ color: 'var(--primary)', fontSize: '13px' }}>Cấp {gamifyProfile?.level || 1}</span></span>
                    </div>
                  </div>

                  {/* Level progress bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '700', marginBottom: '8px', alignItems: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        Tiến trình cấp độ 
                        <button 
                          type="button" 
                          onClick={() => setShowXPHelp(true)} 
                          style={{ background: 'var(--primary-bg)', color: 'var(--primary)', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                          title="Giải thích cách tính điểm XP"
                        >
                          ?
                        </button>
                      </span>
                      <span>{gamifyProfile?.xp || 0} XP / {gamifyProfile?.nextLevelXP || 100} XP</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${gamifyProfile?.progress || 0}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary) 0%, #a55eea 100%)', borderRadius: '4px' }}></div>
                    </div>
                  </div>

                  {/* Streak and stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '16px 0' }}>
                    <div style={{ textAlign: 'center', borderRight: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '24px', display: 'block' }}>🔥</span>
                      <span style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-primary)', display: 'block', marginTop: '4px' }}>{gamifyProfile?.streakDays || 0} ngày</span>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 'bold' }}>Chuỗi học tập</span>
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '24px', display: 'block' }}>🏆</span>
                      <span style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-primary)', display: 'block', marginTop: '4px' }}>Cấp {gamifyProfile?.level || 1}</span>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 'bold' }}>Hạng danh vọng</span>
                    </div>
                  </div>

                  {/* Badges list */}
                  <div>
                    <h5 style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>Huy hiệu đạt được</h5>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {Array.isArray(gamifyProfile?.badges) && gamifyProfile.badges.map((badgeItem, idx) => {
                        const badgeName = typeof badgeItem === 'string' ? badgeItem : (badgeItem?.badge?.name || badgeItem?.name || 'Huy hiệu EduPath');
                        const badgeIcon = badgeItem?.badge?.iconUrl || badgeItem?.iconUrl || '🏅';
                        return (
                          <div
                            key={idx}
                            style={{
                              background: 'var(--bg-main)',
                              border: '1.5px solid var(--primary)',
                              borderRadius: '12px',
                              padding: '8px 12px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: 'var(--shadow-sm)'
                            }}
                          >
                            {typeof badgeIcon === 'string' && (badgeIcon.startsWith('/') || badgeIcon.startsWith('http') || badgeIcon.includes('.')) ? (
                              <img 
                                src={badgeIcon} 
                                alt={badgeName} 
                                style={{ width: '20px', height: '20px', objectFit: 'contain' }} 
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : null}
                            <span style={{ fontSize: '15px' }}>🏅</span>
                            <span>{badgeName}</span>
                          </div>
                        );
                      })}
                      {(!gamifyProfile?.badges || !Array.isArray(gamifyProfile.badges) || gamifyProfile.badges.length === 0) && (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Chưa có huy hiệu nào. Hãy đóng góp tích cực để nhận thưởng!</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. GROUPS VIEW */}
          {activeTab === 'groups' && (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Group workspace is selected */}
              {selectedGroup ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Group header banner */}
                  <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', borderRadius: '16px', padding: '24px', color: '#fff', position: 'relative', boxShadow: 'var(--shadow-md)' }}>
                    <button
                      onClick={() => setSelectedGroup(null)}
                      style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', color: '#fff', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px' }}
                    >
                      ← Quay lại danh sách nhóm
                    </button>
                    
                    <h2 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: '900' }}>👥 {selectedGroup.name}</h2>
                    <p style={{ margin: '0 0 16px 0', fontSize: '13.5px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>{selectedGroup.description}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '16px' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 'bold' }}>Mã nhóm: <code style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px' }}>{selectedGroup.id}</code></span>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {currentUser && selectedGroup.creatorId === currentUser.id ? (
                          <button
                            onClick={() => handleDeleteGroup(selectedGroup.id)}
                            style={{ background: '#ff7675', border: 'none', borderRadius: '8px', color: '#fff', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            Giải tán nhóm
                          </button>
                        ) : (
                          <button
                            onClick={() => handleLeaveGroup(selectedGroup.id)}
                            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', color: '#fff', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            Rời nhóm
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Group Navigation tabs */}
                  <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                    {[
                      { id: 'announcements', label: '📢 Thông báo' },
                      { id: 'discussion', label: '💬 Thảo luận nhóm' },
                      { id: 'chat', label: '⚡ Chat trực tuyến' },
                      { id: 'members', label: '👥 Thành viên' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setGroupTab(tab.id);
                          if (tab.id === 'announcements') fetchGroupAnnouncements(selectedGroup.id);
                          if (tab.id === 'discussion') fetchGroupPosts(selectedGroup.id);
                          if (tab.id === 'chat') fetchGroupMessages(selectedGroup.id);
                          if (tab.id === 'members') fetchGroupMembers(selectedGroup.id);
                        }}
                        style={{
                          background: groupTab === tab.id ? 'var(--primary-bg)' : 'transparent',
                          color: groupTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Group Sub-tab Content Area */}
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', minHeight: '300px', boxShadow: 'var(--shadow-sm)' }}>
                    {/* tab: announcements */}
                    {groupTab === 'announcements' && (
                      <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {currentUser && selectedGroup.creatorId === currentUser.id && (
                          <form 
                            onSubmit={async (e) => {
                              e.preventDefault();
                              const title = e.target.annTitle.value.trim();
                              const content = e.target.annContent.value.trim();
                              if (!title || !content || submitting) return;

                              setSubmitting(true);
                              try {
                                await api.createGroupAnnouncement(selectedGroup.id, title, content);
                                e.target.reset();
                                fetchGroupAnnouncements(selectedGroup.id);
                                toast('Đã đăng thông báo nhóm thành công!', 'success');
                              } catch (err) {
                                toast(err.message || 'Lỗi gửi thông báo!', 'error');
                              } finally {
                                setSubmitting(false);
                              }
                            }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg-main)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}
                          >
                            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold' }}>Tạo thông báo nhóm mới</h4>
                            <input
                              name="annTitle"
                              type="text"
                              className="form-control"
                              placeholder="Tiêu đề thông báo..."
                              style={{ fontSize: '12.5px', height: '36px' }}
                              required
                            />
                            <textarea
                              name="annContent"
                              className="form-control"
                              placeholder="Nội dung thông báo chi tiết..."
                              style={{ fontSize: '12.5px', minHeight: '80px', resize: 'vertical' }}
                              required
                            />
                            <button type="submit" className="btn-primary" style={{ padding: '8px 16px', alignSelf: 'flex-end', fontSize: '12px' }}>Đăng thông báo</button>
                          </form>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {groupAnnouncements.map(ann => (
                            <div key={ann.id} style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--bg-main)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '13.5px', color: 'var(--text-primary)' }}>📢 {ann.title}</span>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(ann.createdAt).toLocaleString()}</span>
                              </div>
                              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{ann.content}</p>
                            </div>
                          ))}
                          {groupAnnouncements.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', fontSize: '13px' }}>Nhóm chưa có thông báo nào.</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* tab: discussion */}
                    {groupTab === 'discussion' && (
                      <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Box to quickly create a post inside the group */}
                        <form 
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const title = e.target.postTitle.value.trim();
                            const content = e.target.postContent.value.trim();
                            if (!title || !content || submitting) return;

                            setSubmitting(true);
                            try {
                              const postPayload = {
                                title,
                                content,
                                categoryId: categories[0]?.id || 1,
                                postType: 'GENERAL',
                                studyGroupId: selectedGroup.id
                              };
                              await api.createForumPost(postPayload);
                              e.target.reset();
                              fetchGroupPosts(selectedGroup.id);
                              toast('Đăng bài thảo luận vào nhóm thành công!', 'success');
                            } catch (err) {
                              toast(err.message || 'Lỗi đăng bài viết nhóm!', 'error');
                            } finally {
                              setSubmitting(false);
                            }
                          }}
                          style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg-main)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}
                        >
                          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold' }}>Chia sẻ thảo luận với nhóm của bạn</h4>
                          <input
                            name="postTitle"
                            type="text"
                            className="form-control"
                            placeholder="Tiêu đề thảo luận..."
                            style={{ fontSize: '12.5px', height: '36px' }}
                            required
                          />
                          <textarea
                            name="postContent"
                            className="form-control"
                            placeholder="Nội dung chi tiết..."
                            style={{ fontSize: '12.5px', minHeight: '80px', resize: 'vertical' }}
                            required
                          />
                          <button type="submit" className="btn-primary" style={{ padding: '8px 16px', alignSelf: 'flex-end', fontSize: '12px' }}>Đăng bài viết</button>
                        </form>

                        {/* List of group posts */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {groupPosts.map(post => (
                            <div 
                              key={post.id} 
                              onClick={() => setSelectedPost(post)}
                              style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--bg-main)', cursor: 'pointer' }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{post.authorName}</span>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(post.createdAt).toLocaleDateString()}</span>
                              </div>
                              <h4 style={{ margin: '0 0 4px 0', fontSize: '14.5px', fontWeight: 'bold' }}>{post.title}</h4>
                              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {post.content}
                              </p>
                            </div>
                          ))}
                          {groupPosts.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', fontSize: '13px' }}>Chưa có thảo luận nào trong nhóm này.</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* tab: chat */}
                    {groupTab === 'chat' && (
                      <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
                        {/* Messages display */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px' }}>
                          {groupChatMessages.map(msg => {
                            const isMe = currentUser?.id && msg.studentId === currentUser.id;
                            return (
                              <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%', background: isMe ? 'var(--primary)' : 'var(--bg-card)', color: isMe ? '#fff' : 'var(--text-primary)', padding: '10px 14px', borderRadius: '12px', border: isMe ? 'none' : '1px solid var(--border)' }}>
                                <div style={{ fontSize: '10.5px', opacity: isMe ? 0.9 : 0.7, fontWeight: 'bold', marginBottom: '2px' }}>
                                  {msg.authorName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div style={{ fontSize: '13px', lineHeight: 1.4 }}>{msg.content}</div>
                              </div>
                            );
                          })}
                          {groupChatMessages.length === 0 && (
                            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12.5px' }}>Bắt đầu cuộc hội thoại chat nhóm trực tuyến tại đây...</div>
                          )}
                        </div>

                        {/* Send bar */}
                        <form onSubmit={handleSendChatMessage} style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Nhập tin nhắn chat nhóm..."
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            style={{ flex: 1, fontSize: '13px' }}
                          />
                          <button type="submit" className="btn-primary" style={{ padding: '0 20px', fontSize: '13px' }}>Gửi</button>
                        </form>
                      </div>
                    )}

                    {/* tab: members */}
                    {groupTab === 'members' && (
                      <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        {/* Pending Requests Section for Admin/Creator */}
                        {currentUser && (Number(selectedGroup?.creatorId) === Number(currentUser?.id) || String(currentUser?.role).toUpperCase() === 'ADMIN') && groupMembers.pending && groupMembers.pending.length > 0 && (
                          <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1.5px solid #f59e0b', borderRadius: '14px', padding: '16px' }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold', color: '#b45309', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>⏳ Danh sách chờ duyệt gia nhập ({groupMembers.pending.length})</span>
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {groupMembers.pending.map(m => (
                                <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {m.avatarUrl ? (
                                      <img src={resolveImageUrl(m.avatarUrl)} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold' }}>
                                        {m.fullName?.substring(0, 2).toUpperCase() || 'HS'}
                                      </div>
                                    )}
                                    <div>
                                      <span style={{ fontSize: '13.5px', fontWeight: 'bold', display: 'block', color: 'var(--text-primary)' }}>{m.fullName}</span>
                                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Muốn gia nhập nhóm • {new Date(m.joinedAt).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                      onClick={() => handleApproveRequest(selectedGroup.id, m.userId)}
                                      style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                      ✓ Đồng ý
                                    </button>
                                    <button
                                      onClick={() => handleRejectRequest(selectedGroup.id, m.userId)}
                                      style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                      ✕ Từ chối
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Accepted Members List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                            Thành viên chính thức ({groupMembers.accepted ? groupMembers.accepted.length : 0})
                          </h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                            {groupMembers.accepted && groupMembers.accepted.map(m => {
                              const isCreator = m.role === 'CREATOR' || Number(m.userId) === Number(selectedGroup?.creatorId);
                              const isMe = Number(currentUser?.id) === Number(m.userId);
                              return (
                                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'var(--bg-main)', borderRadius: '10px', border: isCreator ? '1.5px solid #f59e0b' : '1px solid var(--border)' }}>
                                  {m.avatarUrl ? (
                                    <img src={resolveImageUrl(m.avatarUrl)} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                                  ) : (
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: isCreator ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold' }}>
                                      {m.fullName?.substring(0, 2).toUpperCase() || 'HS'}
                                    </div>
                                  )}
                                  <div>
                                    <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', color: 'var(--text-primary)' }}>
                                      {m.fullName} {isMe ? '(Bạn)' : ''}
                                    </span>
                                    <span style={{ fontSize: '11px', color: isCreator ? '#b45309' : 'var(--text-muted)', fontWeight: isCreator ? 'bold' : 'normal' }}>
                                      {isCreator ? 'Quản trị viên (Creator)' : 'Thành viên học tập'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // 3-Column Study Groups Listing (Redesigned)
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>Nhóm học tập 👥</h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: 'var(--text-secondary)' }}>Tìm kiếm và tham gia nhóm học tập cùng bạn bè</p>
                  </div>

                  {/* Group Search Bar */}
                  <div style={{ position: 'relative' }}>
                    <HiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '18px' }} />
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="Tìm kiếm nhóm học tập..."
                      value={groupSearchQuery}
                      onChange={e => setGroupSearchQuery(e.target.value)}
                      style={{ paddingLeft: '38px', width: '100%', border: '1px solid var(--border)', borderRadius: '10px', height: '42px', fontSize: '13.5px', background: 'var(--bg-card)' }}
                    />
                  </div>

                  {/* 1. Nhóm của tôi (Created by user) */}
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      🌟 Nhóm học tập của tôi ({studyGroups.filter(g => g.creatorId === currentUser?.id && g.name.toLowerCase().includes(groupSearchQuery.toLowerCase())).length})
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' }}>
                      {studyGroups.filter(g => g.creatorId === currentUser?.id && g.name.toLowerCase().includes(groupSearchQuery.toLowerCase())).map(group => (
                        <div key={group.id} style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', boxShadow: 'var(--shadow-sm)', transition: 'border 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                          <h4 style={{ margin: '0 0 8px 0', fontSize: '14.5px', fontWeight: '900', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>👥 {group.name}</h4>
                          <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.4, flexGrow: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{group.description}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>1 thành viên</span>
                            <button 
                              onClick={() => {
                                setSelectedGroup(group);
                                setGroupTab('announcements');
                                fetchGroupAnnouncements(group.id);
                              }}
                              style={{ background: 'var(--primary-bg)', color: 'var(--primary)', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                              Vào nhóm
                            </button>
                          </div>
                        </div>
                      ))}
                      {studyGroups.filter(g => g.creatorId === currentUser?.id && g.name.toLowerCase().includes(groupSearchQuery.toLowerCase())).length === 0 && (
                        <div style={{ gridColumn: 'span 3', padding: '20px', textAlign: 'center', background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: '12px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                          Bạn chưa tạo nhóm học tập nào.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Nhóm tôi đã tham gia */}
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      ✅ Nhóm đã tham gia ({studyGroups.filter(g => g.isMember && g.creatorId !== currentUser?.id && g.name.toLowerCase().includes(groupSearchQuery.toLowerCase())).length})
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' }}>
                      {studyGroups.filter(g => g.isMember && g.creatorId !== currentUser?.id && g.name.toLowerCase().includes(groupSearchQuery.toLowerCase())).map(group => (
                        <div key={group.id} style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', boxShadow: 'var(--shadow-sm)', transition: 'border 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                          <h4 style={{ margin: '0 0 8px 0', fontSize: '14.5px', fontWeight: '900', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>👥 {group.name}</h4>
                          <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.4, flexGrow: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{group.description}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>2 thành viên</span>
                            <button 
                              onClick={() => {
                                setSelectedGroup(group);
                                setGroupTab('announcements');
                                fetchGroupAnnouncements(group.id);
                              }}
                              style={{ background: 'var(--primary-bg)', color: 'var(--primary)', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                              Vào nhóm
                            </button>
                          </div>
                        </div>
                      ))}
                      {studyGroups.filter(g => g.isMember && g.creatorId !== currentUser?.id && g.name.toLowerCase().includes(groupSearchQuery.toLowerCase())).length === 0 && (
                        <div style={{ gridColumn: 'span 3', padding: '20px', textAlign: 'center', background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: '12px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                          Bạn chưa tham gia nhóm học tập nào khác.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. Gợi ý nhóm học tập (Chưa tham gia) */}
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      🔥 Gợi ý nhóm học tập ({studyGroups.filter(g => !g.isMember && g.name.toLowerCase().includes(groupSearchQuery.toLowerCase())).length})
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' }}>
                      {studyGroups.filter(g => !g.isMember && g.name.toLowerCase().includes(groupSearchQuery.toLowerCase())).map(group => (
                        <div key={group.id} style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', boxShadow: 'var(--shadow-sm)', transition: 'border 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                          <h4 style={{ margin: '0 0 8px 0', fontSize: '14.5px', fontWeight: '900', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            👥 {group.name} {group.isPrivate ? '🔒' : '🌐'}
                          </h4>
                          <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.4, flexGrow: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{group.description}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                              {group.memberCount || 1} thành viên {group.isPrivate ? '• Riêng tư' : '• Công khai'}
                            </span>
                            {group.memberStatus === 'PENDING' ? (
                              <button 
                                disabled 
                                style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'not-allowed' }}
                              >
                                ⏳ Đang chờ phê duyệt
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleJoinStudyGroup(group.id, group.isPrivate)}
                                style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                              >
                                {group.isPrivate ? 'Xin gia nhập' : 'Tham gia'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {studyGroups.filter(g => !g.isMember && g.name.toLowerCase().includes(groupSearchQuery.toLowerCase())).length === 0 && (
                        <div style={{ gridColumn: 'span 3', padding: '20px', textAlign: 'center', background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: '12px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                          Không có gợi ý nhóm học tập mới nào.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. LEADERBOARD VIEW */}
          {activeTab === 'leaderboard' && (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>Bảng xếp hạng danh vọng</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: 'var(--text-secondary)' }}>Tích lũy điểm XP để tranh đua thứ hạng cùng mọi người</p>
              </div>

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px 10px', fontSize: '12.5px', fontWeight: 'bold' }}>Hạng</th>
                      <th style={{ padding: '12px 10px', fontSize: '12.5px', fontWeight: 'bold' }}>Học viên</th>
                      <th style={{ padding: '12px 10px', fontSize: '12.5px', fontWeight: 'bold' }}>Cấp độ</th>
                      <th style={{ padding: '12px 10px', fontSize: '12.5px', fontWeight: 'bold', textAlign: 'right' }}>Tổng điểm XP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((user, index) => (
                      <tr key={user.id} style={{ borderBottom: '1px solid var(--border)', fontWeight: (currentUser?.id && user.id === currentUser.id) ? 'bold' : 'normal', background: (currentUser?.id && user.id === currentUser.id) ? 'var(--primary-bg)' : 'transparent' }}>
                        <td style={{ padding: '14px 10px', fontSize: '14px' }}>
                          {index === 0 && <span style={{ fontSize: '18px' }}>🥇</span>}
                          {index === 1 && <span style={{ fontSize: '18px' }}>🥈</span>}
                          {index === 2 && <span style={{ fontSize: '18px' }}>🥉</span>}
                          {index > 2 && index + 1}
                        </td>
                        <td style={{ padding: '14px 10px', fontSize: '14px', color: 'var(--text-primary)' }}>{user.fullName}</td>
                        <td style={{ padding: '14px 10px', fontSize: '14px', color: 'var(--text-secondary)' }}>Cấp {user.level}</td>
                        <td style={{ padding: '14px 10px', fontSize: '14px', textAlign: 'right', color: 'var(--primary)', fontWeight: 'bold' }}>{user.totalXp} XP</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Action Button (FAB) at bottom-right */}
      {createPortal(
        <button 
          onClick={() => {
            if (activeTab === 'groups' && !selectedGroup) {
              setShowGroupModal(true);
            } else {
              setShowCreateModal(true);
            }
          }}
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            color: '#FFFFFF',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(108, 92, 231, 0.4)',
            zIndex: 9999,
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          title={activeTab === 'groups' && !selectedGroup ? "Tạo nhóm học tập mới" : "Tạo bài thảo luận mới"}
        >
          <HiPlus style={{ fontSize: '24px' }} />
        </button>,
        document.body
      )}

      {/* ================= MODALS & POPUPS ================= */}

      {/* Detailed Post Popup Modal (With nested comment threads) */}
      {selectedPost && createPortal(
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 999 }}>
          <div className="modal-card card animate-in" style={{ maxWidth: '820px', width: '90%', maxHeight: '90vh', overflowY: 'auto', padding: '28px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', boxShadow: 'var(--shadow-lg)' }}>
            
            {/* Header close bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <button 
                onClick={() => setSelectedPost(null)}
                style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)', padding: '8px 16px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                ← Quay lại danh sách
              </button>
              <button onClick={() => setSelectedPost(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: 'var(--text-muted)' }}>✕</button>
            </div>

            {/* Author info card */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900', fontSize: '16px', boxShadow: '0 4px 10px rgba(108, 92, 231, 0.2)' }}>
                  {selectedPost.authorName?.substring(0, 2).toUpperCase() || 'EP'}
                </div>
                <div>
                  <h4 style={{ fontWeight: '900', fontSize: '15.5px', color: 'var(--text-primary)', margin: 0 }}>{selectedPost.authorName}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    Đăng vào: {new Date(selectedPost.createdAt).toLocaleString()} • 
                    <span className="badge-pill" style={{ background: 'var(--primary-bg)', color: 'var(--primary)', marginLeft: '8px' }}>
                      {selectedPost.categoryName}
                    </span>
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {(currentUser?.role === 'ADMIN' || currentUser?.role === 'TEACHER' || selectedPost.authorId === currentUser?.id) && (
                  <>
                    <button 
                      onClick={() => handleOpenEditModal(selectedPost)}
                      style={{
                        background: 'none',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        color: 'var(--primary)',
                        cursor: 'pointer'
                      }}
                    >
                      Sửa
                    </button>
                    <button 
                      onClick={() => handleDeletePost(selectedPost.id)}
                      style={{
                        background: 'none',
                        border: '1px solid rgba(231, 76, 60, 0.2)',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        color: '#ff7675',
                        cursor: 'pointer'
                      }}
                    >
                      Xóa
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Post main details */}
            <h2 style={{ fontSize: '21px', fontWeight: '900', color: 'var(--text-primary)', marginTop: 0, marginBottom: '16px', lineHeight: 1.35 }}>{selectedPost.title}</h2>
            
            <div style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px', overflowWrap: 'break-word' }}>
              {renderSanitizedContent(selectedPost.content)}
            </div>

            {/* Document attachment slot */}
            {selectedPost.postType === 'RESOURCE' && selectedPost.resourceFile && (
              <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <span style={{ fontSize: '32px' }}>📄</span>
                  <div>
                    <h5 style={{ fontWeight: '800', fontSize: '14.5px', margin: 0, color: 'var(--text-primary)' }}>{selectedPost.resourceFile.fileName}</h5>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Định dạng: {selectedPost.resourceFile.fileType} | Kích thước: {Math.round((selectedPost.resourceFile.fileSize || 0) / 1024)} KB</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDownloadFile(selectedPost.resourceId, selectedPost.resourceFile.fileUrl)}
                  className="btn-primary" 
                  style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold' }}
                >
                  Tải xuống học liệu
                </button>
              </div>
            )}

            {/* Likes count & reactions row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '12px 0', marginBottom: '24px' }}>
              <button
                onClick={(e) => handleReactPost(e, selectedPost.id, 'UPVOTE')}
                style={{ background: 'var(--primary-bg)', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--primary)', fontWeight: 'bold', padding: '8px 16px' }}
              >
                <HiHeart style={{ fontSize: '18px', fill: selectedPost.userReaction === 'UPVOTE' ? 'var(--primary)' : 'none' }} />
                <span>{Object.values(selectedPost.reactionCounts || {}).reduce((a, b) => a + b, 0) || 0} lượt thích</span>
              </button>

              <button
                onClick={(e) => handleToggleSavePost(e, selectedPost.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  color: selectedPost.isSaved ? '#e67e22' : '#000000',
                  fontWeight: '700',
                  padding: '6px 8px',
                  transition: 'all 0.15s ease'
                }}
              >
                {selectedPost.isSaved ? (
                  <HiBookmark style={{ fontSize: '22px', color: '#e67e22' }} />
                ) : (
                  <HiOutlineBookmark style={{ fontSize: '22px', color: '#000000', strokeWidth: 2 }} />
                )}
                <span>{selectedPost.isSaved ? 'Đã lưu bài viết' : 'Lưu bài viết'}</span>
              </button>
            </div>

            {/* Thread comments - 2 level tree structure */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '16px' }}>Hội thoại thảo luận ({comments.length})</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
                {comments.filter(c => !c.parentId).map(parentComment => {
                  const hasReplies = comments.filter(r => r.parentId === parentComment.id);
                  const isCLiked = parentComment.userReaction === 'UPVOTE';
                  return (
                    <div key={parentComment.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Parent level comment item */}
                      <div style={{ display: 'flex', gap: '14px', background: 'var(--bg-main)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)', position: 'relative' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '900' }}>
                            {parentComment.author?.fullName?.substring(0, 2).toUpperCase() || 'EP'}
                          </div>
                          {hasReplies.length > 0 && (
                            <div style={{ width: '2px', flexGrow: 1, background: 'var(--primary-bg)', margin: '8px 0' }}></div>
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontWeight: '800', fontSize: '13.5px', color: 'var(--text-primary)' }}>{parentComment.author?.fullName}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(parentComment.createdAt).toLocaleDateString()}</span>
                          </div>

                          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                            {renderSanitizedContent(parentComment.content)}
                          </div>

                          <div style={{ display: 'flex', gap: '16px', marginTop: '12px', alignItems: 'center' }}>
                            {/* Like parent comment */}
                            <button
                              onClick={() => handleReactComment(parentComment.id, 'UPVOTE')}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11.5px', color: isCLiked ? '#ff7675' : 'var(--text-secondary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                            >
                              <HiHeart style={{ fontSize: '14px', fill: isCLiked ? '#ff7675' : 'none' }} />
                              <span>{Object.values(parentComment.reactionCounts || {}).reduce((a, b) => a + b, 0) || 0} thích</span>
                            </button>

                            {/* Reply button */}
                            <button
                              onClick={() => { setReplyTargetId(parentComment.id); setCommentText(`@${parentComment.author?.fullName} `); }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11.5px', color: 'var(--primary)', fontWeight: 'bold', padding: 0 }}
                            >
                              Phản hồi
                            </button>

                            {/* Report comment */}
                            <button
                              onClick={() => { setReportTarget({ postId: null, commentId: parentComment.id }); setShowReportModal(true); }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11.5px', color: 'var(--text-muted)', padding: 0 }}
                            >
                              Báo cáo
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Nested child level comment items */}
                      {hasReplies.map(childComment => {
                        const isChildLiked = childComment.userReaction === 'UPVOTE';
                        return (
                          <div key={childComment.id} style={{ display: 'flex', gap: '14px', paddingLeft: '52px', position: 'relative' }}>
                            {/* Visual connector line indicator */}
                            <div style={{ position: 'absolute', left: '26px', top: '-12px', bottom: '18px', width: '2px', background: 'var(--primary-bg)' }}></div>
                            <div style={{ position: 'absolute', left: '26px', bottom: '18px', width: '16px', height: '2px', background: 'var(--primary-bg)' }}></div>

                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '900', flexShrink: 0, zIndex: 1 }}>
                              {childComment.author?.fullName?.substring(0, 2).toUpperCase() || 'EP'}
                            </div>

                            <div style={{ flex: 1, background: 'var(--bg-card)', padding: '12px 14px', borderRadius: '14px', border: '1px solid var(--border)', minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: '800', fontSize: '12.5px', color: 'var(--text-primary)' }}>{childComment.author?.fullName}</span>
                                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{new Date(childComment.createdAt).toLocaleDateString()}</span>
                              </div>

                              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                {renderSanitizedContent(childComment.content)}
                              </div>

                              <div style={{ display: 'flex', gap: '14px', marginTop: '8px', alignItems: 'center' }}>
                                {/* Like child comment */}
                                <button
                                  onClick={() => handleReactComment(childComment.id, 'UPVOTE')}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: isChildLiked ? '#ff7675' : 'var(--text-secondary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                                >
                                  <HiHeart style={{ fontSize: '12px', fill: isChildLiked ? '#ff7675' : 'none' }} />
                                  <span>{Object.values(childComment.reactionCounts || {}).reduce((a, b) => a + b, 0) || 0}</span>
                                </button>
                                
                                <button
                                  onClick={() => { setReportTarget({ postId: null, commentId: childComment.id }); setShowReportModal(true); }}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: 'var(--text-muted)', padding: 0 }}
                                >
                                  Báo cáo
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Add comment submit row */}
              <form onSubmit={handleSendComment} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {replyTargetId && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--primary-bg)', padding: '8px 12px', borderRadius: '10px', fontSize: '12px', color: 'var(--primary)', fontWeight: 'bold' }}>
                    <span>Đang soạn phản hồi trả lời...</span>
                    <button type="button" onClick={() => { setReplyTargetId(null); setCommentText(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '900' }}>Hủy bỏ</button>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Viết phản hồi thảo luận của bạn tại đây... (nhắc tên bằng @)"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    style={{ flex: 1, borderRadius: '10px', height: '40px', fontSize: '13.5px' }}
                    required
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '0 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold' }} disabled={submitting}>
                    Phản hồi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Create New Post Modal Redesigned */}
      {showCreateModal && createPortal(
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 999 }}>
          <div className="modal-card card animate-in" style={{ maxWidth: '640px', width: '90%', maxHeight: '90vh', overflowY: 'auto', padding: '28px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', boxShadow: 'var(--shadow-lg)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '900', color: 'var(--text-primary)' }}>Tạo bài thảo luận mới ✍️</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--text-muted)' }}>✕</button>
            </div>

            <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Category selector */}
              <div className="form-group">
                <label style={{ fontSize: '12px', fontWeight: '800', marginBottom: '8px', display: 'block', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>Chủ đề / Môn học:</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {categories.map(cat => {
                    const isSelected = newCategoryId === String(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setNewCategoryId(String(cat.id))}
                        style={{
                          background: isSelected ? 'var(--primary)' : 'var(--bg-main)',
                          color: isSelected ? '#fff' : 'var(--text-secondary)',
                          border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                          borderRadius: '10px',
                          padding: '8px 16px',
                          fontSize: '12.5px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Post type selector */}
              <div className="form-group">
                <label style={{ fontSize: '12px', fontWeight: '800', marginBottom: '8px', display: 'block', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>Dạng bài đăng:</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { id: 'GENERAL', label: '💬 Thảo luận' },
                    { id: 'QA', label: '❓ Hỏi & Đáp (Q&A)' },
                    { id: 'RESOURCE', label: '📄 Học liệu / Đề thi' }
                  ].map(t => {
                    const isSelected = newPostType === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setNewPostType(t.id)}
                        style={{
                          flex: 1,
                          background: isSelected ? 'var(--primary)' : 'var(--bg-main)',
                          color: isSelected ? '#fff' : 'var(--text-secondary)',
                          border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                          borderRadius: '10px',
                          padding: '10px',
                          fontSize: '12.5px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty selector (For Q&A type) */}
              {newPostType === 'QA' && (
                <div className="form-group animate-in">
                  <label style={{ fontSize: '12px', fontWeight: '800', marginBottom: '8px', display: 'block', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>Độ khó câu hỏi:</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                      { id: 'EASY', label: '🟢 Dễ', color: '#2ecc71' },
                      { id: 'MEDIUM', label: '🟡 Trung bình', color: '#f1c40f' },
                      { id: 'HARD', label: '🔴 Khó', color: '#e74c3c' }
                    ].map(d => {
                      const isSelected = newDifficulty === d.id;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setNewDifficulty(d.id)}
                          style={{
                            flex: 1,
                            background: isSelected ? d.color : 'var(--bg-main)',
                            color: isSelected ? '#fff' : 'var(--text-secondary)',
                            border: isSelected ? `1px solid ${d.color}` : '1px solid var(--border)',
                            borderRadius: '10px',
                            padding: '10px',
                            fontSize: '12.5px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Document upload widget (For RESOURCE type) */}
              {newPostType === 'RESOURCE' && (
                <div className="form-group animate-in" style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                  <label style={{ fontSize: '12px', fontWeight: '800', marginBottom: '8px', display: 'block', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>Đính kèm tệp học liệu (.pdf, .doc, .xlsx, .zip):</label>
                  
                  {resourceFile ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '20px' }}>📄</span>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block' }}>{resourceFile.fileName}</span>
                          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Định dạng: {resourceFile.fileType} | {Math.round(resourceFile.fileSize / 1024)} KB</span>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setResourceFile(null)}
                        style={{ background: 'none', border: 'none', color: '#ff7675', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                      >
                        ✕ Xóa file
                      </button>
                    </div>
                  ) : (
                    <div 
                      onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--primary)'; }}
                      onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                      onDrop={e => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleDocumentUpload(file);
                      }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px', cursor: 'pointer', textAlign: 'center' }}
                      onClick={() => document.getElementById('document-file-picker').click()}
                    >
                      <span style={{ fontSize: '32px', marginBottom: '8px' }}>📤</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{uploadingResource ? 'Đang tải tệp lên...' : 'Kéo thả file tài liệu vào đây hoặc click để chọn'}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Hỗ trợ các file đề thi thử, tóm tắt lý thuyết</span>
                      <input 
                        type="file" 
                        id="document-file-picker" 
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleDocumentUpload(file);
                        }} 
                        style={{ display: 'none' }} 
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Title Input */}
              <div className="form-group">
                <label style={{ fontSize: '12px', fontWeight: '800', marginBottom: '6px', display: 'block', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Tiêu đề bài viết:</label>
                <input 
                  type="text" className="form-control" placeholder="Nhập tiêu đề tóm tắt nội dung chính thảo luận..."
                  value={newTitle} onChange={e => setNewTitle(e.target.value)} style={{ width: '100%', borderRadius: '10px', height: '40px' }} required
                />
              </div>

              {/* Detail content input with drag-drop and paste previews */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '800', margin: 0, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Nội dung chi tiết:</label>
                  <label className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '4px 10px', fontSize: '11.5px', margin: 0, borderRadius: '8px' }}>
                    📷 {uploadingImage ? 'Đang tải...' : 'Chèn ảnh'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleUploadImageForPost} 
                      disabled={uploadingImage} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>
                <textarea 
                  className="form-control" placeholder="Nhập nội dung chi tiết bài toán... (Kéo thả ảnh hoặc dán Ctrl+V trực tiếp vào đây)"
                  value={newContent} onChange={e => setNewContent(e.target.value)} 
                  onPaste={(e) => handlePasteImage(e, true)}
                  onDragOver={(e) => { e.preventDefault(); setDragOverPost(true); }}
                  onDragLeave={() => setDragOverPost(false)}
                  onDrop={(e) => { setDragOverPost(false); handleDropImage(e, true); }}
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    resize: 'vertical',
                    borderRadius: '10px',
                    border: dragOverPost ? '2px dashed var(--primary)' : '1px solid var(--border)',
                    background: dragOverPost ? 'var(--primary-bg)' : 'var(--bg-card)',
                    transition: 'all 0.15s ease'
                  }} required
                />

                {postImages.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {postImages.map((url, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                        <img src={url} alt="Uploaded preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => setPostImages(prev => prev.filter((_, i) => i !== idx))}
                          style={{
                            position: 'absolute', top: '2px', right: '2px',
                            background: '#ff7675', color: '#fff', border: 'none',
                            borderRadius: '50%', width: '18px', height: '18px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', fontSize: '9px', fontWeight: 'bold'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags Input */}
              <div className="form-group">
                <label style={{ fontSize: '12px', fontWeight: '800', marginBottom: '6px', display: 'block', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Thẻ phân loại (ngăn cách bởi dấu phẩy):</label>
                <input 
                  type="text" className="form-control" placeholder="Ví dụ: casio, daoham, toan12, thi_thu"
                  value={newTagsString} onChange={e => setNewTagsString(e.target.value)} style={{ width: '100%', borderRadius: '10px', height: '40px' }}
                />
              </div>

              {/* Submit actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <button type="button" className="btn-outline" onClick={() => setShowCreateModal(false)} style={{ borderRadius: '10px', padding: '10px 20px', fontSize: '13px' }} disabled={submitting}>Hủy bỏ</button>
                <button type="submit" className="btn-primary" style={{ borderRadius: '10px', padding: '10px 20px', fontSize: '13px' }} disabled={submitting}>
                  {submitting ? 'Đang tạo bài...' : 'Đăng lên diễn đàn'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Post Modal */}
      {showEditModal && createPortal(
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 999 }}>
          <div className="modal-card card animate-in" style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 'bold' }}>Chỉnh sửa bài viết</h3>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-muted)' }}>✕</button>
            </div>

            <form onSubmit={handleEditPost} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Chủ đề / Môn học:</label>
                <select className="form-control" value={editCategoryId} onChange={e => setEditCategoryId(e.target.value)} style={{ width: '100%' }}>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Dạng bài đăng:</label>
                <select className="form-control" value={editPostType} onChange={e => setEditPostType(e.target.value)} style={{ width: '100%' }}>
                  <option value="GENERAL">Thảo luận chung</option>
                  <option value="QA">Hỏi & Đáp (Q&A)</option>
                  <option value="RESOURCE">Chia sẻ tài liệu / Đề thi</option>
                </select>
              </div>

              {editPostType === 'QA' && (
                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Độ khó:</label>
                  <select className="form-control" value={editDifficulty} onChange={e => setEditDifficulty(e.target.value)} style={{ width: '100%' }}>
                    <option value="EASY">Dễ</option>
                    <option value="MEDIUM">Trung bình</option>
                    <option value="HARD">Khó</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Tiêu đề câu hỏi / bài thảo luận:</label>
                <input 
                  type="text" className="form-control" placeholder="Ví dụ: Cách bấm máy Casio nghiệm nguyên đạo hàm?"
                  value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ width: '100%' }} required
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', margin: 0 }}>Nội dung chi tiết câu hỏi:</label>
                  <label className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '4px 10px', fontSize: '11px', margin: 0 }}>
                    📷 {uploadingImage ? 'Đang tải...' : 'Chèn ảnh'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleUploadImageForPost} 
                      disabled={uploadingImage} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>
                <textarea 
                  className="form-control" placeholder="Nhập nội dung chi tiết bài toán..."
                  value={editContent} onChange={e => setEditContent(e.target.value)} 
                  onPaste={(e) => handlePasteImage(e, false)}
                  onDragOver={(e) => { e.preventDefault(); setDragOverPost(true); }}
                  onDragLeave={() => setDragOverPost(false)}
                  onDrop={(e) => { setDragOverPost(false); handleDropImage(e, false); }}
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    resize: 'vertical',
                    border: dragOverPost ? '2px dashed var(--primary)' : '1px solid var(--border)',
                    background: dragOverPost ? 'var(--primary-bg)' : 'var(--bg-card)',
                    transition: 'all 0.15s ease'
                  }} required
                />

                {postImages.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {postImages.map((url, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                        <img src={resolveImageUrl(url)} alt="Uploaded preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => setPostImages(prev => prev.filter((_, i) => i !== idx))}
                          style={{ position: 'absolute', top: '2px', right: '2px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Thẻ phân loại (ngăn cách bởi dấu phẩy):</label>
                <input 
                  type="text" className="form-control" placeholder="Ví dụ: casio, daoham, toan12"
                  value={editTagsString} onChange={e => setEditTagsString(e.target.value)} style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn-outline" onClick={() => setShowEditModal(false)} disabled={submitting}>Hủy bỏ</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Create New Group Modal Redesigned */}
      {showGroupModal && createPortal(
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 999 }}>
          <div className="modal-card card animate-in" style={{ maxWidth: '520px', width: '90%', padding: '28px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '900', color: 'var(--text-primary)' }}>Tạo nhóm học tập mới 👥</h3>
              <button onClick={() => setShowGroupModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--text-muted)' }}>✕</button>
            </div>

            <form onSubmit={handleCreateStudyGroup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label style={{ fontSize: '12px', fontWeight: '800', marginBottom: '8px', display: 'block', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Tên nhóm học tập:</label>
                <input type="text" name="groupName" className="form-control" placeholder="Ví dụ: Luyện đề Toán Lý Hóa 2026 THPTQG" style={{ width: '100%', borderRadius: '10px', height: '40px' }} required />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '12px', fontWeight: '800', marginBottom: '8px', display: 'block', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Mô tả mục tiêu nhóm:</label>
                <textarea name="groupDesc" className="form-control" placeholder="Ví dụ: Nhóm học nhóm vào mỗi tối thứ 2, 4, 6 chia sẻ tài liệu nâng cao..." style={{ width: '100%', minHeight: '100px', borderRadius: '10px', resize: 'vertical' }} required />
              </div>

              <div className="form-group" style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'var(--bg-main)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <input type="checkbox" name="groupPrivate" id="groupPrivate" style={{ width: '16px', height: '16px' }} />
                <label htmlFor="groupPrivate" style={{ fontSize: '13px', fontWeight: 'bold', margin: 0, cursor: 'pointer', color: 'var(--text-primary)' }}>Đặt nhóm ở chế độ riêng tư (Yêu cầu lời mời)</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <button type="button" className="btn-outline" onClick={() => setShowGroupModal(false)} style={{ borderRadius: '10px', padding: '10px 20px' }} disabled={submitting}>Hủy bỏ</button>
                <button type="submit" className="btn-primary" style={{ borderRadius: '10px', padding: '10px 20px' }} disabled={submitting}>
                  {submitting ? 'Đang tạo...' : 'Tạo nhóm học tập'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Safety Report Modal */}
      {showReportModal && createPortal(
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 999 }}>
          <div className="modal-card card animate-in" style={{ maxWidth: '440px', width: '90%', padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-primary)' }}>Báo cáo nội dung vi phạm</h3>
              <button onClick={() => setShowReportModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-muted)' }}>✕</button>
            </div>

            <form onSubmit={handleSendReport} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label style={{ fontSize: '12.5px', marginBottom: '8px', display: 'block', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Lý do báo cáo chi tiết:</label>
                <textarea 
                  id="report-reason-input"
                  className="form-control" 
                  placeholder="Vui lòng nêu rõ lý do vi phạm (Ví dụ: Spam quảng cáo, xúc phạm danh dự người khác, đáp án sai lệch gây tranh cãi ác ý...)" 
                  value={reportReason} 
                  onChange={e => setReportReason(e.target.value)} 
                  style={{ width: '100%', minHeight: '110px', borderRadius: '10px' }} 
                  required 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                <button id="report-cancel-btn" type="button" className="btn-outline" onClick={() => setShowReportModal(false)} style={{ borderRadius: '8px' }}>Hủy</button>
                <button id="report-submit-btn" type="submit" className="btn-primary" style={{ borderRadius: '8px' }}>Gửi báo cáo vi phạm</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* XP calculations guide modal */}
      {showXPHelp && createPortal(
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 999 }}>
          <div className="modal-card card animate-in" style={{ maxWidth: '420px', width: '90%', padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>💡 Thể lệ tính điểm XP</h3>
              <button onClick={() => setShowXPHelp(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-muted)' }}>✕</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <p style={{ margin: 0 }}>Điểm kinh nghiệm (XP) dùng để thăng cấp học viên và xếp hạng trên bảng vinh danh EduPath Community.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-main)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>✍️ Đăng câu hỏi mới:</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>+5 XP</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>💬 Đóng góp bình luận:</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>+2 XP</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>✓ Lời giải được chọn:</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>+15 XP</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>📥 Tải tài liệu hữu ích:</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>+5 XP</span>
                </div>
              </div>
              
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>* Tích cực tham gia thảo luận và chia sẻ tài liệu chính xác sẽ giúp bạn đạt được các huy hiệu vinh danh độc quyền!</p>
            </div>

            <button 
              onClick={() => setShowXPHelp(false)} 
              className="btn-primary" 
              style={{ width: '100%', marginTop: '20px', borderRadius: '10px', height: '38px', fontSize: '13px', fontWeight: 'bold' }}
            >
              Tôi đã hiểu
            </button>
          </div>
        </div>,
        document.body
      )}
      {/* Global Loading Overlay on Join Request */}
      {joiningGroupId && (
        <LoadingOverlay message="Đang gửi yêu cầu gia nhập nhóm học tập EduPath..." />
      )}
    </div>
  );
}

