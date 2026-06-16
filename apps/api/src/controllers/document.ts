import type { Request, Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

export async function getDocumentResources(req: Request, res: Response) {
  try {
    const { subject, level, search, isFree } = req.query;

    const whereClause: any = {
      isActive: true,
      isDeleted: false,
    };

    if (subject && subject !== 'all') {
      whereClause.subject = {
        equals: String(subject),
        mode: 'insensitive',
      };
    }

    if (level && level !== 'all') {
      whereClause.level = {
        equals: String(level),
        mode: 'insensitive',
      };
    }

    if (search) {
      whereClause.title = {
        contains: String(search),
        mode: 'insensitive',
      };
    }

    if (isFree !== undefined) {
      whereClause.isFree = isFree === 'true';
    }

    const docs = await prisma.documentResource.findMany({
      where: whereClause,
      orderBy: { id: 'asc' },
    });

    return res.status(200).json({ success: true, data: docs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getDocumentComments(req: Request, res: Response) {
  try {
    const documentId = Number(req.params.id);
    if (isNaN(documentId)) {
      return res.status(400).json({ success: false, error: 'Mã tài liệu không hợp lệ.' });
    }

    const comments = await prisma.documentComment.findMany({
      where: { documentId },
      include: {
        user: {
          select: {
            fullName: true,
            avatarUrl: true,
            role: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ success: true, data: comments });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function addDocumentComment(req: AuthRequest, res: Response) {
  try {
    const documentId = Number(req.params.id);
    const userId = req.user?.id;
    const { content } = req.body;

    if (isNaN(documentId)) {
      return res.status(400).json({ success: false, error: 'Mã tài liệu không hợp lệ.' });
    }
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Bạn cần đăng nhập để thảo luận.' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Nội dung bình luận không được để trống.' });
    }

    const comment = await prisma.documentComment.create({
      data: {
        documentId,
        userId,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            fullName: true,
            avatarUrl: true,
            role: true,
          }
        }
      }
    });

    return res.status(201).json({ success: true, data: comment });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

