import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

export function getSubjectGroupForSubject(subject: string): string {
  const s = subject.toLowerCase();
  if (s.includes('toán')) return 'A01'; // Default group containing Math
  if (s.includes('lý') || s.includes('vật lý')) return 'A01';
  if (s.includes('hóa') || s.includes('hóa học')) return 'B00';
  if (s.includes('sinh') || s.includes('sinh học')) return 'B00';
  if (s.includes('văn') || s.includes('ngữ văn')) return 'C00';
  if (s.includes('anh') || s.includes('tiếng anh')) return 'D01';
  if (s.includes('sử') || s.includes('lịch sử') || s.includes('địa') || s.includes('gdcd')) return 'C00';
  return 'A01'; // Fallback
}

export async function getCourses(req: AuthRequest, res: Response) {
  const { subject, subjectGroup, price } = req.query;

  try {
    const filters: any = { isApproved: true };
    if (subject) filters.subject = String(subject);
    
    if (subjectGroup) {
      const group = String(subjectGroup).toUpperCase();
      let subjectsForGroup: string[] = [];
      if (group === 'A00') subjectsForGroup = ['Toán học', 'Toán', 'Vật lý', 'Vật lí', 'Lý', 'Hóa học', 'Hóa'];
      else if (group === 'A01') subjectsForGroup = ['Toán học', 'Toán', 'Vật lý', 'Vật lí', 'Lý', 'Tiếng Anh', 'Anh'];
      else if (group === 'B00') subjectsForGroup = ['Toán học', 'Toán', 'Hóa học', 'Hóa', 'Sinh học', 'Sinh'];
      else if (group === 'C00') subjectsForGroup = ['Ngữ văn', 'Văn', 'Lịch sử', 'Sử', 'Địa lý', 'Địa', 'GDCD'];
      else if (group === 'D01') subjectsForGroup = ['Toán học', 'Toán', 'Ngữ văn', 'Văn', 'Tiếng Anh', 'Anh'];

      if (subjectsForGroup.length > 0) {
        if (filters.subject) {
          if (!subjectsForGroup.map(s => s.toLowerCase()).includes(filters.subject.toLowerCase())) {
            filters.subject = 'NONE'; // non-matching combination
          }
        } else {
          filters.subject = { in: subjectsForGroup };
        }
      }
    }

    if (price === 'free') filters.price = 0;
    else if (price === 'paid') filters.price = { gt: 0 };

    const list = await prisma.course.findMany({
      where: filters,
      include: {
        teacher: {
          include: {
            user: { select: { fullName: true } }
          }
        },
        lessons: { select: { id: true } }
      }
    });

    const mappedList = list.map(c => ({
      ...c,
      subjectGroup: getSubjectGroupForSubject(c.subject)
    }));

    return res.status(200).json({ success: true, data: mappedList });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getCourseById(req: AuthRequest, res: Response) {
  const { id } = req.params;

  try {
    const courseObj = await prisma.course.findUnique({
      where: { id: Number(id) },
      include: {
        lessons: { orderBy: { order: 'asc' } },
        teacher: { include: { user: { select: { fullName: true } } } },
        reviews: { include: { student: { include: { user: { select: { fullName: true } } } } } }
      }
    });

    if (!courseObj) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy khóa học này!' });
    }

    const mappedCourse = {
      ...courseObj,
      subjectGroup: getSubjectGroupForSubject(courseObj.subject)
    };

    return res.status(200).json({ success: true, data: mappedCourse });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function createCourse(req: AuthRequest, res: Response) {
  const { title, description, subject, price, thumbnailUrl, level } = req.body;
  const teacherId = req.user?.id;

  if (!teacherId) return res.status(401).json({ success: false, error: 'Chưa xác thực!' });

  try {
    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        subject,
        level: level || 'Cơ bản',
        price: Number(price),
        thumbnailUrl,
        isPublished: false,
        isApproved: false, // Pending Admin review approval!
        teacherId
      }
    });

    return res.status(201).json({ success: true, data: newCourse });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getCourseStats(req: AuthRequest, res: Response) {
  const { id } = req.params;

  try {
    const enrollmentsCount = await prisma.enrollment.count({
      where: { courseId: Number(id) }
    });

    const reviewsAvg = await prisma.review.aggregate({
      where: { courseId: Number(id) },
      _avg: { rating: true }
    });

    return res.status(200).json({
      success: true,
      data: {
        totalEnrollments: enrollmentsCount,
        averageRating: reviewsAvg._avg.rating || 5.0
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
