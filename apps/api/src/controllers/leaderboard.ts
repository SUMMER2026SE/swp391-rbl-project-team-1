import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

// ═════════════════════════════════════════════════════════
// Badge generator — auto-assign titles based on performance
// ═════════════════════════════════════════════════════════
function getScoreBadge(avgScore: number, subjectGroup: string): string {
  const subjectNames: Record<string, string> = {
    'A01': 'Lý',
    'B00': 'Hóa Học',
    'D01': 'Anh ngữ'
  };
  const subjectLabel = subjectNames[subjectGroup] || subjectGroup;

  if (avgScore >= 9.5) return `Thủ khoa ${subjectLabel}`;
  if (avgScore >= 9.0) return `Thần tốc ${subjectLabel}`;
  if (avgScore >= 8.5) return `Chiến thần ${subjectLabel}`;
  if (avgScore >= 8.0) return `Đệ nhất ${subjectLabel}`;
  if (avgScore >= 7.0) return `Xuất sắc ${subjectLabel}`;
  return `Nỗ lực ${subjectLabel}`;
}

function getStreakBadge(days: number): string {
  if (days >= 100) return '🏆 Huyền thoại kiên trì';
  if (days >= 60) return '💎 Siêu bền bỉ';
  if (days >= 30) return '🔥 Chiến binh 30 ngày';
  if (days >= 14) return '⚡ Chuỗi ấn tượng';
  if (days >= 7) return '✨ Khởi đầu vững chắc';
  return '🌱 Đang nỗ lực';
}

function getCourseBadge(count: number): string {
  if (count >= 10) return '🎓 Học giả uyên bác';
  if (count >= 7) return '📚 Mọt sách chăm chỉ';
  if (count >= 5) return '⭐ Học viên tích cực';
  if (count >= 3) return '💪 Chinh phục kiến thức';
  return '🌟 Khám phá tri thức';
}

// ═════════════════════════════════════════════════════════
// GET /leaderboard/scores — Top students by avg test score
// ═════════════════════════════════════════════════════════
export async function getScoreLeaderboard(req: Request, res: Response) {
  const { subjectGroup } = req.query;

  try {
    // Find students with test attempts, optionally filtered by subject group
    const whereClause: any = {};
    if (subjectGroup && typeof subjectGroup === 'string' && subjectGroup !== 'ALL') {
      whereClause.subjectGroup = subjectGroup;
    }

    const students = await prisma.student.findMany({
      where: {
        ...whereClause,
        testAttempts: { some: {} }
      },
      include: {
        user: { select: { id: true, fullName: true, avatarUrl: true } },
        testAttempts: {
          select: { score: true },
          orderBy: { startedAt: 'desc' }
        }
      }
    });

    // Calculate average score for each student
    const ranked = students.map(student => {
      const scores = student.testAttempts.map(a => a.score);
      const avgScore = scores.length > 0
        ? scores.reduce((sum, s) => sum + s, 0) / scores.length
        : 0;
      const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

      return {
        userId: student.userId,
        fullName: student.user.fullName,
        avatarUrl: student.user.avatarUrl,
        subjectGroup: student.subjectGroup,
        avgScore: Math.round(avgScore * 10) / 10,
        bestScore: Math.round(bestScore * 10) / 10,
        totalAttempts: scores.length,
        badge: getScoreBadge(avgScore, student.subjectGroup)
      };
    });

    // Sort by average score descending, take top 20
    ranked.sort((a, b) => b.avgScore - a.avgScore);
    const top20 = ranked.slice(0, 20).map((item, index) => ({
      rank: index + 1,
      ...item
    }));

    return res.status(200).json({
      success: true,
      data: {
        type: 'scores',
        entries: top20,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (err: any) {
    console.error('[Leaderboard] Score error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ═════════════════════════════════════════════════════════
// GET /leaderboard/streaks — Top students by learning streak
// ═════════════════════════════════════════════════════════
export async function getStreakLeaderboard(req: Request, res: Response) {
  try {
    const streaks = await prisma.learningStreak.findMany({
      where: { currentStreak: { gt: 0 } },
      include: {
        student: {
          include: {
            user: { select: { id: true, fullName: true, avatarUrl: true } }
          }
        }
      },
      orderBy: { currentStreak: 'desc' },
      take: 20
    });

    const entries = streaks.map((s, index) => ({
      rank: index + 1,
      userId: s.studentId,
      fullName: s.student.user.fullName,
      avatarUrl: s.student.user.avatarUrl,
      subjectGroup: s.student.subjectGroup,
      currentStreak: s.currentStreak,
      longestStreak: s.longestStreak,
      lastActiveDate: s.lastActiveDate.toISOString(),
      badge: getStreakBadge(s.currentStreak)
    }));

    return res.status(200).json({
      success: true,
      data: {
        type: 'streaks',
        entries,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (err: any) {
    console.error('[Leaderboard] Streak error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ═════════════════════════════════════════════════════════
// GET /leaderboard/courses — Top students by enrolled courses
// ═════════════════════════════════════════════════════════
export async function getCourseLeaderboard(req: Request, res: Response) {
  try {
    const students = await prisma.student.findMany({
      where: { enrollments: { some: {} } },
      include: {
        user: { select: { id: true, fullName: true, avatarUrl: true } },
        _count: { select: { enrollments: true } }
      }
    });

    const ranked = students
      .map(student => ({
        userId: student.userId,
        fullName: student.user.fullName,
        avatarUrl: student.user.avatarUrl,
        subjectGroup: student.subjectGroup,
        courseCount: student._count.enrollments,
        badge: getCourseBadge(student._count.enrollments)
      }))
      .sort((a, b) => b.courseCount - a.courseCount)
      .slice(0, 20)
      .map((item, index) => ({ rank: index + 1, ...item }));

    return res.status(200).json({
      success: true,
      data: {
        type: 'courses',
        entries: ranked,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (err: any) {
    console.error('[Leaderboard] Course error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
