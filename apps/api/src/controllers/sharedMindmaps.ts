import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Shared JSON database path
const SHARED_JSON_PATH = path.join(__dirname, '../../data/shared_mindmaps.json');

// Ensure data folder and file exists
function ensureFileExists() {
  const dir = path.dirname(SHARED_JSON_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(SHARED_JSON_PATH)) {
    fs.writeFileSync(SHARED_JSON_PATH, JSON.stringify([], null, 2), 'utf-8');
  }
}

// Helper to read shared mindmaps
function readSharedMindmaps(): any[] {
  ensureFileExists();
  try {
    const content = fs.readFileSync(SHARED_JSON_PATH, 'utf-8');
    return JSON.parse(content || '[]');
  } catch (e) {
    console.error('[readSharedMindmaps] Error parsing JSON:', e);
    return [];
  }
}

// Helper to write shared mindmaps
function writeSharedMindmaps(data: any[]) {
  ensureFileExists();
  fs.writeFileSync(SHARED_JSON_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getSharedMindmaps(req: AuthRequest, res: Response) {
  try {
    const { search, subject } = req.query;
    let list = readSharedMindmaps();

    // Filter by subject
    if (subject && typeof subject === 'string' && subject !== 'All') {
      list = list.filter(m => m.subject?.toLowerCase() === subject.toLowerCase());
    }

    // Filter by search query (title or description)
    if (search && typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(m => 
        m.title?.toLowerCase().includes(q) || 
        m.description?.toLowerCase().includes(q)
      );
    }

    // Return newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.status(200).json({ success: true, data: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function shareMindmap(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  const { mindmapId, subject, description } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Chưa xác thực!' });
  }
  if (!mindmapId) {
    return res.status(400).json({ success: false, error: 'Thiếu mã sơ đồ tư duy.' });
  }

  try {
    // 1. Fetch mindmap and check ownership
    const mindmap = await prisma.mindmap.findFirst({
      where: { id: Number(mindmapId), userId },
      include: { user: true }
    });

    if (!mindmap) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy sơ đồ tư duy này hoặc bạn không có quyền chia sẻ.' });
    }

    const list = readSharedMindmaps();
    
    // Check if already shared, if so update it
    const existingIdx = list.findIndex(m => m.mindmapId === mindmap.id);
    
    const sharedData = {
      id: existingIdx !== -1 ? list[existingIdx].id : `shared-${Date.now()}`,
      mindmapId: mindmap.id,
      title: mindmap.title,
      description: description || (mindmap.content as any)?.description || 'Không có mô tả sơ đồ.',
      content: mindmap.content,
      subject: subject || 'Toán',
      authorId: userId,
      authorName: mindmap.user?.fullName || 'Người dùng EduPath',
      authorAvatar: mindmap.user?.avatarUrl || null,
      likes: existingIdx !== -1 ? list[existingIdx].likes : 0,
      likedBy: existingIdx !== -1 ? list[existingIdx].likedBy : [],
      downloads: existingIdx !== -1 ? list[existingIdx].downloads : 0,
      createdAt: existingIdx !== -1 ? list[existingIdx].createdAt : new Date().toISOString()
    };

    if (existingIdx !== -1) {
      list[existingIdx] = sharedData;
    } else {
      list.push(sharedData);
    }

    writeSharedMindmaps(list);

    return res.status(200).json({ success: true, message: 'Chia sẻ sơ đồ tư duy lên diễn đàn thành công!', data: sharedData });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function likeSharedMindmap(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Chưa xác thực!' });
  }

  try {
    const list = readSharedMindmaps();
    const idx = list.findIndex(m => m.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy sơ đồ chia sẻ này.' });
    }

    const item = list[idx];
    const likedBy = item.likedBy || [];

    // Toggle like
    if (likedBy.includes(userId)) {
      // Unlike
      item.likedBy = likedBy.filter((uid: number) => uid !== userId);
      item.likes = Math.max(0, item.likes - 1);
    } else {
      // Like
      item.likedBy.push(userId);
      item.likes += 1;
    }

    list[idx] = item;
    writeSharedMindmaps(list);

    return res.status(200).json({ success: true, likes: item.likes, isLiked: !likedBy.includes(userId) });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function cloneSharedMindmap(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Chưa xác thực!' });
  }

  try {
    const list = readSharedMindmaps();
    const idx = list.findIndex(m => m.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy sơ đồ chia sẻ này.' });
    }

    const item = list[idx];

    // Save as a new personal mindmap for this user
    const mindmap = await prisma.mindmap.create({
      data: {
        userId,
        title: `${item.title} (Nhập từ Diễn đàn)`,
        content: item.content
      }
    });

    // Extract nodes and sync in database
    const nodesToSync: { nodeKey: string; name: string; description: string }[] = [];
    function traverse(node: any, path = '0') {
      if (!node) return;
      nodesToSync.push({
        nodeKey: path,
        name: node.name || 'Nút không tên',
        description: node.description || ''
      });
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach((child: any, idx: number) => {
          traverse(child, `${path}-${idx}`);
        });
      }
    }
    traverse(item.content);

    if (nodesToSync.length > 0) {
      await prisma.mindmapNode.createMany({
        data: nodesToSync.map(n => ({
          mindmapId: mindmap.id,
          nodeKey: n.nodeKey,
          name: n.name,
          description: n.description
        }))
      });
    }

    // Increment downloads
    item.downloads = (item.downloads || 0) + 1;
    list[idx] = item;
    writeSharedMindmaps(list);

    return res.status(201).json({ success: true, message: 'Nhập sơ đồ tư duy về thư viện thành công!', data: mindmap });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
