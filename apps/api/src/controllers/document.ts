import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import jwt from 'jsonwebtoken';
import type { AuthRequest } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'edupath_jwt_secret_key_2026';

export async function getDocumentResources(req: Request, res: Response) {
  try {
    const { subject, level, search, isFree, page: pageParam, limit: limitParam } = req.query;

    const page = Math.max(1, Number(pageParam) || 1);
    const limit = Math.max(1, Number(limitParam) || 30);
    const skip = (page - 1) * limit;

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

    // Get total items for metadata
    const totalItems = await prisma.documentResource.count({
      where: whereClause,
    });

    const docs = await prisma.documentResource.findMany({
      where: whereClause,
      orderBy: { id: 'asc' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;

    // Parse user ID from token optional auth header
    let userId: number | null = null;
    let isPro = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        userId = Number(decoded.id) || null;
        if (userId) {
          const userObj = await prisma.user.findUnique({
            where: { id: userId },
            select: { isPro: true }
          });
          isPro = !!userObj?.isPro;
        }
      } catch (err) {
        // silent catch
      }
    }

    let purchasedDocIds = new Set<number>();
    if (userId) {
      const purchased = await prisma.userDocument.findMany({
        where: { userId },
        select: { documentId: true }
      });
      purchasedDocIds = new Set(purchased.map(p => p.documentId));
    }

    const sanitizedDocs = docs.map(doc => {
      // If it is free (price = 0 or isFree = true), keep it
      if (doc.isFree || doc.price === 0) {
        return doc;
      }
      
      // If user is PRO or has purchased it, keep it
      if (isPro || (userId && purchasedDocIds.has(doc.id))) {
        return doc;
      }

      // Otherwise hide driveUrl
      return {
        ...doc,
        driveUrl: null
      };
    });

    return res.status(200).json({
      success: true,
      data: sanitizedDocs,
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
        hasNextPage,
      },
    });
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

export async function checkDocumentOwnership(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  const documentId = Number(req.params.id);

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Chưa xác thực!' });
  }

  if (isNaN(documentId)) {
    return res.status(400).json({ success: false, error: 'Thiếu hoặc sai mã tài liệu!' });
  }

  try {
    // 1. Check if user is PRO
    const userObj = await prisma.user.findUnique({
      where: { id: userId },
      select: { isPro: true }
    });
    const isPro = !!userObj?.isPro;

    // 2. Check if user has purchased the document
    const userDoc = await prisma.userDocument.findFirst({
      where: {
        userId,
        documentId
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        isPurchased: isPro || !!userDoc,
        userDoc
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}


