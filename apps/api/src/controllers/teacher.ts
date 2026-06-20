import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

export async function getTeacherStats(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Chưa xác thực!' });
  }

  try {
    // Verify user is a teacher
    const teacher = await prisma.teacher.findUnique({
      where: { userId }
    });

    if (!teacher) {
      return res.status(403).json({ success: false, error: 'Bạn không có quyền truy cập vai trò Giáo viên!' });
    }

    // 1. Metrics
    const coursesCount = await prisma.course.count({
      where: { teacherId: userId }
    });

    const materialsCount = await prisma.teacherMaterial.count({
      where: { teacherId: userId }
    });

    const examsCount = await prisma.exam.count({
      where: { createdBy: userId }
    });

    // Unique students enrolled in the teacher's courses
    const enrollments = await prisma.enrollment.findMany({
      where: { course: { teacherId: userId } },
      select: { studentId: true }
    });
    const uniqueStudentsCount = new Set(enrollments.map(e => e.studentId)).size;

    // Study attempts (weekly) on exams created by this teacher
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyAttemptsCount = await prisma.testAttempt.count({
      where: {
        exam: { createdBy: userId },
        startedAt: { gte: oneWeekAgo }
      }
    });

    // 2. Hoạt động giảng dạy: past 7 days charts data
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const studyCount = await prisma.testAttempt.count({
        where: {
          exam: { createdBy: userId },
          startedAt: { gte: startOfDay, lte: endOfDay }
        }
      });

      const submissionCount = await prisma.testAttempt.count({
        where: {
          exam: { createdBy: userId },
          startedAt: { gte: startOfDay, lte: endOfDay },
          status: 'SUBMITTED'
        }
      });

      chartData.push({
        name: dateStr,
        students: studyCount,
        submissions: submissionCount
      });
    }

    // 3. Phân bổ điểm số trung bình (Donut chart) & Class Average
    const allAttempts = await prisma.testAttempt.findMany({
      where: { exam: { createdBy: userId } },
      select: { score: true }
    });

    let averageScore = 0.0;
    let excelCount = 0; // 9.0 - 10.0
    let goodCount = 0;  // 8.0 - 8.9
    let fairCount = 0;  // 7.0 - 7.9
    let avgCount = 0;   // 5.0 - 6.9
    let weakCount = 0;  // < 5.0

    if (allAttempts.length > 0) {
      const sum = allAttempts.reduce((acc, curr) => acc + curr.score, 0);
      averageScore = Number((sum / allAttempts.length).toFixed(2));

      allAttempts.forEach(att => {
        const s = att.score;
        if (s >= 9.0) excelCount++;
        else if (s >= 8.0) goodCount++;
        else if (s >= 7.0) fairCount++;
        else if (s >= 5.0) avgCount++;
        else weakCount++;
      });
    }

    const totalScoresCount = allAttempts.length || 1; // avoid divide by zero
    const scoreDistribution = {
      excelPct: Math.round((excelCount / totalScoresCount) * 100),
      goodPct: Math.round((goodCount / totalScoresCount) * 100),
      fairPct: Math.round((fairCount / totalScoresCount) * 100),
      avgPct: Math.round((avgCount / totalScoresCount) * 100),
      weakPct: Math.round((weakCount / totalScoresCount) * 100)
    };

    // 4. Lớp học của tôi (from Course list)
    const teacherCourses = await prisma.course.findMany({
      where: { teacherId: userId },
      include: {
        enrollments: {
          select: { studentId: true }
        },
        lessons: {
          select: { id: true }
        }
      }
    });

    const classesList = [];
    for (const c of teacherCourses) {
      const courseAttempts = await prisma.testAttempt.findMany({
        where: { exam: { createdBy: userId } },
        select: { score: true }
      });
      const courseAvgScore = courseAttempts.length > 0
        ? Number((courseAttempts.reduce((acc, curr) => acc + curr.score, 0) / courseAttempts.length).toFixed(1))
        : 8.0;

      classesList.push({
        id: `C-${c.id}`,
        name: c.title,
        students: c.enrollments.length,
        pendingHomework: Math.floor(Math.random() * 5) + 1,
        progress: 60 + (c.id % 4) * 10,
        avgScore: courseAvgScore,
        schedule: c.id % 2 === 0 ? 'Thứ 2, Thứ 4 (19:30)' : 'Thứ 3, Thứ 5 (18:00)'
      });
    }

    // 5. Đề thi gần đây (Recent exams)
    const teacherExams = await prisma.exam.findMany({
      where: { createdBy: userId },
      include: {
        attempts: true
      },
      orderBy: { createdAt: 'desc' },
      take: 4
    });

    const recentExamsList = teacherExams.map(ex => {
      const attemptedCount = ex.attempts.length;
      return {
        id: ex.id,
        title: ex.title,
        subject: ex.subject,
        date: ex.createdAt.toLocaleDateString('vi-VN'),
        attemptsDisplay: `${attemptedCount} lượt thi`
      };
    });

    // 6. Tài liệu mới nhất (Recent materials)
    const teacherMaterials = await prisma.teacherMaterial.findMany({
      where: { teacherId: userId },
      orderBy: { uploadedAt: 'desc' },
      take: 4
    });

    const recentMaterialsList = teacherMaterials.map(m => {
      const sizeMB = (m.fileSize / (1024 * 1024)).toFixed(1);
      return {
        id: m.id,
        name: m.title,
        type: m.fileType.toUpperCase(),
        size: `${sizeMB} MB`,
        date: m.uploadedAt.toLocaleDateString('vi-VN')
      };
    });
    // Fetch unique students enrolled in teacher's courses
    const studentEnrollments = await prisma.enrollment.findMany({
      where: { course: { teacherId: userId } },
      include: {
        student: {
          include: {
            user: {
              include: {
                gamification: true
              }
            }
          }
        }
      }
    });

    const uniqueStudentMap = new Map();
    for (const enr of studentEnrollments) {
      const s = enr.student;
      if (!s || !s.user) continue;
      if (!uniqueStudentMap.has(s.userId)) {
        uniqueStudentMap.set(s.userId, s);
      }
    }

    const studentsList = [];
    for (const [sId, studentObj] of uniqueStudentMap.entries()) {
      const studentAttempts = await prisma.testAttempt.findMany({
        where: {
          studentId: sId,
          exam: { createdBy: userId }
        },
        select: { score: true }
      });

      const attemptsCount = studentAttempts.length;
      const avgScore = attemptsCount > 0
        ? Number((studentAttempts.reduce((acc, curr) => acc + curr.score, 0) / attemptsCount).toFixed(1))
        : 0.0;

      let status = 'Trung bình';
      if (avgScore >= 9.0) status = 'Xuất sắc';
      else if (avgScore >= 8.0) status = 'Giỏi';
      else if (avgScore >= 7.0) status = 'Khá';
      else if (attemptsCount > 0) status = 'Cần chú ý';
      else status = 'Chưa hoạt động';

      const wrongAnswers = await prisma.testAttemptAnswer.findMany({
        where: {
          attempt: {
            studentId: sId,
            exam: { createdBy: userId }
          },
          isCorrect: false
        },
        include: {
          question: {
            select: { topic: true }
          }
        },
        take: 3
      });

      const uniqueWrongTopics = Array.from(new Set(wrongAnswers.map(wa => wa.question.topic)));
      const weakness = uniqueWrongTopics.length > 0 ? uniqueWrongTopics : ['Chưa có đánh giá'];

      studentsList.push({
        id: sId,
        name: studentObj.user.fullName,
        grade: studentObj.subjectGroup ? `Lớp ${studentObj.subjectGroup}` : 'Lớp 12-A1',
        attempts: attemptsCount,
        avgScore,
        streak: studentObj.user.gamification?.streakDays || 0,
        status,
        weakness
      });
    }

    // Fetch notifications for the teacher
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return res.status(200).json({
      success: true,
      data: {
        metrics: {
          coursesCount,
          studentsCount: uniqueStudentsCount,
          examsCount,
          materialsCount,
          weeklyAttemptsCount
        },
        chartData,
        scoreDistribution: {
          averageScore,
          ...scoreDistribution
        },
        classesList,
        recentExamsList,
        recentMaterialsList,
        studentsList,
        notifications: notifications.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          isRead: n.isRead,
          createdAt: n.createdAt.toISOString()
        }))
      }
    });

  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
