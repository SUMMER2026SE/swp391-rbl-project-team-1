import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { startOfDayUTC } from '../lib/monthlyStats.js';

// ────────────────────────────────────────────────────────────
// Utilities
// ────────────────────────────────────────────────────────────

function getPeriodLabel(filter: string): string {
  switch (filter) {
    case 'this-month': return 'tháng này';
    case 'last-month': return 'tháng trước';
    case '3-months':   return '3 tháng qua';
    case '6-months':   return '6 tháng qua';
    case 'this-year':  return 'năm nay';
    default:           return 'trong kỳ';
  }
}

function formatDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function calcChange(cur: number, prev: number): number {
  return prev > 0 ? parseFloat((((cur - prev) / prev) * 100).toFixed(1)) : 0;
}

// Build danh sách (month, year) cho monthly-level filter
function buildMonthKeys(filter: string, now: Date) {
  const cm = now.getMonth() + 1;
  const cy = now.getFullYear();

  if (filter === 'this-month') return [{ month: cm, year: cy }];
  if (filter === 'last-month') {
    return [{ month: cm === 1 ? 12 : cm - 1, year: cm === 1 ? cy - 1 : cy }];
  }
  if (filter === '3-months') {
    return Array.from({ length: 3 }, (_, i) => {
      const rawM = cm - (2 - i);
      return { month: rawM <= 0 ? rawM + 12 : rawM, year: rawM <= 0 ? cy - 1 : cy };
    });
  }
  if (filter === '6-months') {
    return Array.from({ length: 6 }, (_, i) => {
      const rawM = cm - (5 - i);
      return { month: rawM <= 0 ? rawM + 12 : rawM, year: rawM <= 0 ? cy - 1 : cy };
    });
  }
  if (filter === 'this-year') {
    return Array.from({ length: cm }, (_, i) => ({ month: i + 1, year: cy }));
  }
  return [{ month: cm, year: cy }];
}

function buildPrevMonthKeys(filter: string, now: Date) {
  const keys = buildMonthKeys(filter, now);
  const count = keys.length;
  const first = keys[0];
  return Array.from({ length: count }, (_, i) => {
    const rawM = first.month - count + i;
    return { month: rawM <= 0 ? rawM + 12 : rawM, year: rawM <= 0 ? first.year - 1 : first.year };
  });
}

// ────────────────────────────────────────────────────────────
// Main Stats Handler
// ────────────────────────────────────────────────────────────

function getPeriodRanges(filter: string, customStart?: string, customEnd?: string) {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;
  let prevStartDate: Date;
  let prevEndDate: Date;

  if (filter === 'this-month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date();
    prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    prevEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else if (filter === 'last-month') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    prevStartDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    prevEndDate = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59, 999);
  } else if (filter === '3-months') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    endDate = new Date();
    prevStartDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    prevEndDate = new Date(now.getFullYear(), now.getMonth() - 2, 0, 23, 59, 59, 999);
  } else if (filter === '6-months') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    endDate = new Date();
    prevStartDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    prevEndDate = new Date(now.getFullYear(), now.getMonth() - 5, 0, 23, 59, 59, 999);
  } else if (filter === 'this-year') {
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date();
    prevStartDate = new Date(now.getFullYear() - 1, 0, 1);
    prevEndDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
  } else {
    const start = customStart ? new Date(customStart) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const end = customEnd ? new Date(customEnd) : new Date();
    end.setHours(23, 59, 59, 999);
    
    startDate = start;
    endDate = end;
    const diff = end.getTime() - start.getTime();
    prevStartDate = new Date(start.getTime() - diff);
    prevEndDate = new Date(start.getTime() - 1);
  }

  return { startDate, endDate, prevStartDate, prevEndDate };
}

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const filter = String(req.query.filter || 'this-month');
    const now = new Date();
    const periodLabel = getPeriodLabel(filter);

    const { startDate, endDate, prevStartDate, prevEndDate } = getPeriodRanges(
      filter,
      req.query.startDate ? String(req.query.startDate) : undefined,
      req.query.endDate ? String(req.query.endDate) : undefined
    );

    // 1. Total registered users
    const totalUsers = await prisma.user.count();
    const prevTotalUsers = await prisma.user.count({
      where: {
        createdAt: { lt: startDate }
      }
    });

    // 2. New users registered in current and previous periods
    const newUsers = await prisma.user.count({
      where: {
        createdAt: { gte: startDate, lte: endDate }
      }
    });
    const prevNewUsers = await prisma.user.count({
      where: {
        createdAt: { gte: prevStartDate, lte: prevEndDate }
      }
    });

    // 3. Total exam attempts in current and previous periods
    const totalAttempts = await prisma.testAttempt.count({
      where: {
        startedAt: { gte: startDate, lte: endDate }
      }
    });
    const prevTotalAttempts = await prisma.testAttempt.count({
      where: {
        startedAt: { gte: prevStartDate, lte: prevEndDate }
      }
    });

    // 4. Total AI questions
    const totalAiQ = await prisma.chatMessage.count({
      where: {
        role: 'user',
        createdAt: { gte: startDate, lte: endDate }
      }
    });
    const prevTotalAiQ = await prisma.chatMessage.count({
      where: {
        role: 'user',
        createdAt: { gte: prevStartDate, lte: prevEndDate }
      }
    });

    // 5. Total revenue
    const enrollments = await prisma.enrollment.findMany({
      where: {
        paidAt: { gte: startDate, lte: endDate }
      },
      include: {
        course: true
      }
    });
    const totalRevenue = enrollments.reduce((sum, e) => {
      const price = e.course?.price ?? 0;
      const discount = e.course?.discount ?? 0;
      const finalPrice = price * (1 - discount / 100);
      return sum + finalPrice;
    }, 0);

    const prevEnrollments = await prisma.enrollment.findMany({
      where: {
        paidAt: { gte: prevStartDate, lte: prevEndDate }
      },
      include: {
        course: true
      }
    });
    const prevRevenue = prevEnrollments.reduce((sum, e) => {
      const price = e.course?.price ?? 0;
      const discount = e.course?.discount ?? 0;
      const finalPrice = price * (1 - discount / 100);
      return sum + finalPrice;
    }, 0);

    // --- Chart Data logic based on period range ---
    let attemptsChart: { date: string; count: number }[] = [];
    let aiQuestionsChart: { date: string; count: number }[] = [];
    let revenueChart: { label: string; revenue: number }[] = [];

    const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const showDaily = diffDays <= 32;

    if (showDaily) {
      const attemptsList = await prisma.testAttempt.findMany({
        where: { startedAt: { gte: startDate, lte: endDate } },
        select: { startedAt: true }
      });
      const chatList = await prisma.chatMessage.findMany({
        where: { role: 'user', createdAt: { gte: startDate, lte: endDate } },
        select: { createdAt: true }
      });
      const enrollList = await prisma.enrollment.findMany({
        where: { paidAt: { gte: startDate, lte: endDate } },
        include: { course: true }
      });

      const daysList: Date[] = [];
      const cursor = new Date(startDate);
      while (cursor <= endDate) {
        daysList.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }

      const formatDateKey = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`;

      attemptsChart = daysList.map(d => {
        const key = formatDateKey(d);
        const count = attemptsList.filter(att => formatDateKey(new Date(att.startedAt)) === key).length;
        return { date: key, count };
      });

      aiQuestionsChart = daysList.map(d => {
        const key = formatDateKey(d);
        const count = chatList.filter(msg => formatDateKey(new Date(msg.createdAt)) === key).length;
        return { date: key, count };
      });

      revenueChart = daysList.map(d => {
        const key = formatDateKey(d);
        const revenue = enrollList
          .filter(e => formatDateKey(new Date(e.paidAt)) === key)
          .reduce((sum, e) => {
            const price = e.course?.price ?? 0;
            const discount = e.course?.discount ?? 0;
            return sum + price * (1 - discount / 100);
          }, 0);
        return { label: key, revenue };
      });
    } else {
      const attemptsList = await prisma.testAttempt.findMany({
        where: { startedAt: { gte: startDate, lte: endDate } },
        select: { startedAt: true }
      });
      const chatList = await prisma.chatMessage.findMany({
        where: { role: 'user', createdAt: { gte: startDate, lte: endDate } },
        select: { createdAt: true }
      });
      const enrollList = await prisma.enrollment.findMany({
        where: { paidAt: { gte: startDate, lte: endDate } },
        include: { course: true }
      });

      const monthsList: { month: number; year: number }[] = [];
      const cursor = new Date(startDate);
      while (cursor <= endDate) {
        const m = cursor.getMonth();
        const y = cursor.getFullYear();
        if (!monthsList.find(item => item.month === m && item.year === y)) {
          monthsList.push({ month: m, year: y });
        }
        cursor.setMonth(cursor.getMonth() + 1);
      }

      const formatMonthKey = (m: number) => `Thg ${m + 1}`;

      attemptsChart = monthsList.map(item => {
        const count = attemptsList.filter(att => {
          const d = new Date(att.startedAt);
          return d.getMonth() === item.month && d.getFullYear() === item.year;
        }).length;
        return { date: formatMonthKey(item.month), count };
      });

      aiQuestionsChart = monthsList.map(item => {
        const count = chatList.filter(msg => {
          const d = new Date(msg.createdAt);
          return d.getMonth() === item.month && d.getFullYear() === item.year;
        }).length;
        return { date: formatMonthKey(item.month), count };
      });

      revenueChart = monthsList.map(item => {
        const revenue = enrollList
          .filter(e => {
            const d = new Date(e.paidAt);
            return d.getMonth() === item.month && d.getFullYear() === item.year;
          })
          .reduce((sum, e) => {
            const price = e.course?.price ?? 0;
            const discount = e.course?.discount ?? 0;
            return sum + price * (1 - discount / 100);
          }, 0);
        return { label: formatMonthKey(item.month), revenue };
      });
    }

    res.json({
      success: true,
      data: {
        kpi: {
          totalUsers: {
            value: totalUsers,
            prevValue: prevTotalUsers,
            change: calcChange(totalUsers, prevTotalUsers),
            description: `Tài khoản tính đến hôm nay (${formatDate(now)})`
          },
          newUsersThisWeek: {
            value: newUsers,
            prevValue: prevNewUsers,
            change: calcChange(newUsers, prevNewUsers),
            description: `Đăng ký ${periodLabel}`
          },
          totalAttempts: {
            value: totalAttempts,
            prevValue: prevTotalAttempts,
            change: calcChange(totalAttempts, prevTotalAttempts),
            description: `Lượt thi thử ${periodLabel}`
          },
          totalAiQuestions: {
            value: totalAiQ,
            prevValue: prevTotalAiQ,
            change: calcChange(totalAiQ, prevTotalAiQ),
            description: `Câu hỏi AI ${periodLabel}`
          },
          revenue: {
            value: totalRevenue,
            prevValue: prevRevenue,
            change: calcChange(totalRevenue, prevRevenue),
            description: `Doanh thu học phí ${periodLabel}`
          }
        },
        attemptsChart,
        aiQuestionsChart,
        revenueChart
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ────────────────────────────────────────────────────────────
// Users Manager
// ────────────────────────────────────────────────────────────

export const getAdminUsers = async (req: Request, res: Response) => {
  try {
    const search = req.query.search ? String(req.query.search).trim() : '';
    const role = req.query.role ? String(req.query.role) : '';
    const status = req.query.status ? String(req.query.status) : '';
    const startDate = req.query.startDate ? String(req.query.startDate) : '';
    const endDate = req.query.endDate ? String(req.query.endDate) : '';
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.max(1, Number(req.query.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role && role !== 'all') {
      where.role = role.toUpperCase();
    }

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [totalUsers, totalStudents, totalTeachers, totalBlocked] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'TEACHER' } }),
      prisma.user.count({ where: { status: 'BLOCKED' } })
    ]);

    const totalFiltered = await prisma.user.count({ where });
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        role: true,
        status: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        blockedAt: true,
        blockedReason: true,
        blockedBy: true
      },
      orderBy: { id: 'desc' },
      skip,
      take: limit
    });

    res.json({
      success: true,
      data: {
        users: users.map(u => ({
          id: u.id,
          name: u.fullName,
          email: u.email,
          avatarUrl: u.avatarUrl,
          role: u.role,
          status: u.status,
          isActive: u.isActive,
          isBanned: !u.isActive || u.status === 'BLOCKED',
          registeredDate: u.createdAt.toISOString().split('T')[0],
          lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
          blockedAt: u.blockedAt ? u.blockedAt.toISOString() : null,
          blockedReason: u.blockedReason,
          blockedBy: u.blockedBy
        })),
        pagination: {
          total: totalFiltered,
          page,
          limit,
          totalPages: Math.ceil(totalFiltered / limit)
        },
        stats: {
          totalUsers,
          totalStudents,
          totalTeachers,
          totalBlocked
        }
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const toggleUserBan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) return res.status(404).json({ success: false, error: 'User không tồn tại' });

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: { isActive: !user.isActive }
    });

    res.json({ success: true, data: { id: updated.id, isBanned: !updated.isActive } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getUserDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: {
        student: true,
        teacher: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User không tồn tại' });
    }

    let stats: any = {};

    if (user.role === 'STUDENT') {
      const totalAttempts = await prisma.testAttempt.count({
        where: { studentId: Number(id), status: 'SUBMITTED' }
      });
      const avgScoreAgg = await prisma.testAttempt.aggregate({
        where: { studentId: Number(id), status: 'SUBMITTED' },
        _avg: { score: true }
      });
      const averageScore = avgScoreAgg._avg.score ? parseFloat(avgScoreAgg._avg.score.toFixed(2)) : 0;
      const totalAiQuestions = user.student?.totalAiQuestions || 0;
      const enrolledCourses = await prisma.enrollment.count({
        where: { studentId: Number(id) }
      });

      stats = {
        totalAttempts,
        averageScore,
        totalAiQuestions,
        enrolledCourses
      };
    } else if (user.role === 'TEACHER') {
      const createdCourses = await prisma.course.count({
        where: { teacherId: Number(id) }
      });
      const approvedCourses = await prisma.course.count({
        where: { teacherId: Number(id), isApproved: true }
      });
      const studentCount = await prisma.enrollment.count({
        where: { course: { teacherId: Number(id) } }
      });

      stats = {
        createdCourses,
        approvedCourses,
        studentCount
      };
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.fullName,
          email: user.email,
          phone: user.phone || null,
          avatarUrl: user.avatarUrl,
          role: user.role,
          status: user.status,
          isActive: user.isActive,
          createdAt: user.createdAt.toISOString(),
          lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
          blockedAt: user.blockedAt ? user.blockedAt.toISOString() : null,
          blockedReason: user.blockedReason,
          blockedBy: user.blockedBy
        },
        stats
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const blockUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = (req as any).user?.id;
    const adminEmail = (req as any).user?.email || 'Admin';

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, error: 'Vui lòng cung cấp lý do khóa tài khoản!' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'Người dùng không tồn tại!' });
    }

    if (targetUser.id === adminId) {
      return res.status(400).json({ success: false, error: 'Bạn không thể tự khóa tài khoản của chính mình!' });
    }

    if (targetUser.role === 'ADMIN') {
      const activeAdminCount = await prisma.user.count({
        where: { role: 'ADMIN', status: 'ACTIVE' }
      });
      if (activeAdminCount <= 1 && targetUser.status === 'ACTIVE') {
        return res.status(400).json({ success: false, error: 'Không thể khóa tài khoản Admin duy nhất còn hoạt động trong hệ thống!' });
      }
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        status: 'BLOCKED',
        isActive: false,
        blockedAt: new Date(),
        blockedReason: reason.trim(),
        blockedBy: adminEmail
      }
    });

    res.json({
      success: true,
      message: 'Khóa tài khoản thành công',
      data: {
        id: updated.id,
        status: updated.status,
        isActive: updated.isActive
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const unblockUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const targetUser = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'Người dùng không tồn tại!' });
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        status: 'ACTIVE',
        isActive: true,
        blockedAt: null,
        blockedReason: null,
        blockedBy: null
      }
    });

    res.json({
      success: true,
      message: 'Mở khóa tài khoản thành công',
      data: {
        id: updated.id,
        status: updated.status,
        isActive: updated.isActive
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ────────────────────────────────────────────────────────────
// Leads Manager
// ────────────────────────────────────────────────────────────

export const getAdminLeads = async (req: Request, res: Response) => {
  try {
    const leads = await prisma.lead.findMany({ orderBy: { id: 'desc' } });
    res.json({
      success: true,
      data: leads.map(l => ({
        id: l.id, name: l.name, phone: l.phone, email: l.email,
        target: l.target,
        registeredDate: l.registeredDate.toISOString().split('T')[0],
        status: l.status
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createAdminLead = async (req: Request, res: Response) => {
  try {
    const { name, phone, email, target } = req.body;
    if (!name || !email) return res.status(400).json({ success: false, error: 'Thiếu name hoặc email' });

    const lead = await prisma.lead.create({
      data: { name, phone: phone || 'Chưa cung cấp', email, target: target || 'Tư vấn lộ trình', status: 'Chờ tư vấn' }
    });
    res.json({ success: true, data: lead });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateAdminLeadStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const lead = await prisma.lead.update({ where: { id: Number(id) }, data: { status } });
    res.json({ success: true, data: lead });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ────────────────────────────────────────────────────────────
// Feature Flags
// ────────────────────────────────────────────────────────────

export const getFeatureFlags = async (req: Request, res: Response) => {
  try {
    let flags = await prisma.featureFlag.findMany();

    const defaultFlags = [
      { id: 'mockExams',   name: 'Thi thử THPTQG' },
      { id: 'chatbot',     name: 'Trợ lý ảo AI Coach' },
      { id: 'flashcards',  name: 'Flashcards Tài liệu' },
      { id: 'mindmaps',    name: 'Sơ đồ tư duy AI' },
      { id: 'forum',       name: 'Diễn đàn Thảo luận' },
      { id: 'documents',   name: 'Tài liệu ôn tập' }
    ];

    for (const df of defaultFlags) {
      if (!flags.find(f => f.id === df.id)) {
        const flag = await prisma.featureFlag.create({ data: { id: df.id, name: df.name, isEnabled: true } });
        flags.push(flag);
      }
    }

    res.json({ success: true, data: flags });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const toggleFeatureFlag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isEnabled } = req.body;
    const flag = await prisma.featureFlag.update({ where: { id }, data: { isEnabled: Boolean(isEnabled) } });
    res.json({ success: true, data: flag });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
