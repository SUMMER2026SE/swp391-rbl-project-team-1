import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { getSubjectGroupForSubject, getSubjectsForSubjectGroup } from '../utils/subjectClassifier.js';

export async function getCourses(req: AuthRequest, res: Response) {
  const { subject, subjectGroup, price } = req.query;
  const userId = req.user?.id;
  console.log("Current User ID on Backend:", userId);

  try {
    const userProgress = userId
      ? await prisma.userLessonProgress.findMany({
          where: { userId, isCompleted: true }
        })
      : [];

    const filters: any = { isApproved: true };
    if (subject) {
      filters.subject = String(subject);
    } else if (subjectGroup) {
      const subjectsForGroup = getSubjectsForSubjectGroup(String(subjectGroup));
      filters.subject = { in: subjectsForGroup };
    }
    if (price === 'free') filters.price = 0;
    else if (price === 'paid') filters.price = { gt: 0 };

    const list = await prisma.course.findMany({
      where: filters,
      include: {
        teacher: {
          include: {
            user: { select: { fullName: true, avatarUrl: true } }
          }
        },
        lessons: {
          select: {
            id: true,
            title: true,
            order: true,
            duration: true,
            videoUrl: true
          }
        },
        reviews: true,
        enrollments: true
      }
    });

    const mappedList = list.map(c => {
      const totalLessons = c.lessons?.length || 0;
      const completedLessons = userProgress.filter(p => p.courseId === c.id).length;
      const progress = Number(totalLessons) > 0 ? Math.round((Number(completedLessons) / Number(totalLessons)) * 100) : 0;
      console.log("Calculated Progress for Course:", progress);
      return {
        ...c,
        progress,
        subjectGroup: getSubjectGroupForSubject(c.subject)
      };
    });

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
        teacher: { include: { user: { select: { fullName: true, avatarUrl: true } } } },
        reviews: { include: { student: { include: { user: { select: { fullName: true } } } } } },
        enrollments: true
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
  const { title, description, subject, price, discount, thumbnailUrl } = req.body;
  const teacherId = req.user?.id;

  if (!teacherId) return res.status(401).json({ success: false, error: 'Chưa xác thực!' });

  try {
    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        subject,
        price: Number(price),
        discount: discount !== undefined ? Number(discount) : 0,
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

export async function completeLesson(req: AuthRequest, res: Response) {
  const { courseId, lessonId } = req.params;
  const userId = req.user?.id;
  const { isCompleted } = req.body;

  if (!userId) return res.status(401).json({ success: false, error: 'Chưa xác thực!' });

  try {
    const isCompVal = isCompleted !== undefined ? Boolean(isCompleted) : true;

    // Load lesson details to check access permission
    const lesson = await prisma.lesson.findUnique({
      where: { id: Number(lessonId) },
      include: { course: true }
    });

    if (!lesson) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy bài học!' });
    }

    const isPaidCourse = lesson.course.price > 0;
    const isVipLesson = lesson.order !== 1;
    const hasBypass = req.user?.role === 'ADMIN' || req.user?.role === 'TEACHER';

    if (isPaidCourse && isVipLesson && !hasBypass) {
      // Check if user has purchased the course
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          studentId: userId,
          courseId: Number(courseId)
        }
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          error: 'Bài học thuộc diện VIP. Bạn cần mua khóa học để ghi nhận tiến độ!'
        });
      }
    }

    const progress = await prisma.userLessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId: Number(lessonId)
        }
      },
      update: {
        isCompleted: isCompVal
      },
      create: {
        userId,
        courseId: Number(courseId),
        lessonId: Number(lessonId),
        isCompleted: isCompVal
      }
    });

    return res.status(200).json({ success: true, data: progress });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getCourseProgress(req: AuthRequest, res: Response) {
  const { courseId } = req.params;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ success: false, error: 'Chưa xác thực!' });

  try {
    const progress = await prisma.userLessonProgress.findMany({
      where: {
        userId,
        courseId: Number(courseId),
        isCompleted: true
      },
      select: {
        lessonId: true
      }
    });

    const completedIds = progress.map(p => p.lessonId);
    return res.status(200).json({ success: true, data: completedIds });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
