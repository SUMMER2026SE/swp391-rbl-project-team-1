import type { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.js';
import { prisma } from '../lib/prisma.js';

export async function ownsCourse(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Chưa xác thực!' });
  }

  if (req.user.role === 'ADMIN') {
    return next();
  }

  const courseId = Number(req.params.id);
  if (isNaN(courseId)) {
    return res.status(400).json({ success: false, error: 'ID khóa học không hợp lệ!' });
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy khóa học!' });
    }

    if (course.teacherId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Bạn không có quyền thực hiện hành động này đối với khóa học này!' });
    }

    next();
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function ownsLesson(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Chưa xác thực!' });
  }

  if (req.user.role === 'ADMIN') {
    return next();
  }

  const lessonId = Number(req.params.id);
  if (isNaN(lessonId)) {
    return res.status(400).json({ success: false, error: 'ID bài học không hợp lệ!' });
  }

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true }
    });

    if (!lesson) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy bài học!' });
    }

    if (lesson.course.teacherId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Bạn không có quyền thực hiện hành động này đối với bài học này!' });
    }

    next();
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function ownsAttempt(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Chưa xác thực!' });
  }

  if (req.user.role === 'ADMIN') {
    return next();
  }

  const rawAttemptId = req.params.attemptId;
  const isLocal = !rawAttemptId || isNaN(Number(rawAttemptId)) || String(rawAttemptId).startsWith('attempt-') || Number(rawAttemptId) > 1_000_000_000_000;
  if (isLocal) {
    return next();
  }

  const attemptId = Number(rawAttemptId);

  try {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId }
    });

    if (!attempt) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy lượt thi!' });
    }

    if (attempt.studentId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Bạn không có quyền thực hiện hành động này đối với lượt thi này!' });
    }

    next();
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function ownsMaterial(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Chưa xác thực!' });
  }

  if (req.user.role === 'ADMIN') {
    return next();
  }

  const materialId = Number(req.params.id);
  if (isNaN(materialId)) {
    return res.status(400).json({ success: false, error: 'ID tài liệu không hợp lệ!' });
  }

  try {
    const material = await prisma.teacherMaterial.findUnique({
      where: { id: materialId }
    });

    if (!material) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy tài liệu!' });
    }

    if (material.teacherId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Bạn không có quyền thực hiện hành động này đối với tài liệu này!' });
    }

    next();
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function ownsReferral(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Chưa xác thực!' });
  }

  if (req.user.role === 'ADMIN') {
    return next();
  }

  const referralId = Number(req.params.id);
  if (isNaN(referralId)) {
    return res.status(400).json({ success: false, error: 'ID giới thiệu không hợp lệ!' });
  }

  try {
    const referral = await prisma.referral.findUnique({
      where: { id: referralId }
    });

    if (!referral) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy thông tin giới thiệu!' });
    }

    if (referral.affiliateId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Bạn không có quyền thực hiện hành động này đối với thông tin giới thiệu này!' });
    }

    next();
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
