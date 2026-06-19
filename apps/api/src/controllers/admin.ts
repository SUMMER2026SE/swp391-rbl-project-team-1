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

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const filter = String(req.query.filter || 'this-month');
    const now = new Date();
    const periodLabel = getPeriodLabel(filter);

    const monthKeys = buildMonthKeys(filter, now);
    const prevMonthKeys = buildPrevMonthKeys(filter, now);

    // ── Query MonthlyStatistic (dùng cho KPI và multi-month charts) ──
    const monthlyRecords = await prisma.monthlyStatistic.findMany({
      where: { OR: monthKeys.map(k => ({ month: k.month, year: k.year })) }
    });
    const prevMonthlyRecords = await prisma.monthlyStatistic.findMany({
      where: { OR: prevMonthKeys.map(k => ({ month: k.month, year: k.year })) }
    });

    const findMonthly = (m: number, y: number) =>
      monthlyRecords.find(r => r.month === m && r.year === y);

    // ── KPI aggregated từ MonthlyStatistic ──
    const newUsers       = monthlyRecords.reduce((s, r) => s + r.newUsers, 0);
    const totalAttempts  = monthlyRecords.reduce((s, r) => s + r.totalAttempts, 0);
    const totalAiQ       = monthlyRecords.reduce((s, r) => s + r.totalAiQuestions, 0);
    const totalRevenue   = monthlyRecords.reduce((s, r) => s + r.revenue, 0);

    const prevNewUsers      = prevMonthlyRecords.reduce((s, r) => s + r.newUsers, 0);
    const prevTotalAttempts = prevMonthlyRecords.reduce((s, r) => s + r.totalAttempts, 0);
    const prevTotalAiQ      = prevMonthlyRecords.reduce((s, r) => s + r.totalAiQuestions, 0);
    const prevRevenue       = prevMonthlyRecords.reduce((s, r) => s + r.revenue, 0);

    // ── Total users từ user.count() ──
    const totalUsers = await prisma.user.count();
    const prevTotalUsers = await prisma.user.count({
      where: {
        createdAt: {
          lt: new Date(
            prevMonthKeys[0]
              ? new Date(prevMonthKeys[0].year, prevMonthKeys[0].month - 1, 1)
              : now
          )
        }
      }
    });

    // ── Chart Data: logic khác nhau theo filter ──
    let attemptsChart: { date: string; count: number }[] = [];
    let aiQuestionsChart: { date: string; count: number }[] = [];
    let revenueChart: { label: string; revenue: number }[] = [];

    const useDaily = filter === 'this-month' || filter === 'last-month';

    if (useDaily) {
      // Xác định phạm vi ngày
      let startDate: Date;
      let endDate: Date;

      if (filter === 'this-month') {
        startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        endDate   = startOfDayUTC(now); // đến hôm nay
      } else {
        // last-month
        const lm = now.getMonth() === 0 ? 12 : now.getMonth();
        const ly = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        startDate = new Date(Date.UTC(ly, lm - 1, 1));
        endDate   = new Date(Date.UTC(ly, lm, 0)); // last day of last month
      }

      // Query DailyStatistic
      const dailyRecords = await prisma.dailyStatistic.findMany({
        where: {
          date: { gte: startDate, lte: endDate }
        },
        orderBy: { date: 'asc' }
      });

      const findDaily = (d: Date) => {
        const key = d.toISOString().split('T')[0];
        return dailyRecords.find(r => r.date.toISOString().split('T')[0] === key);
      };

      // Build array các ngày trong khoảng
      const days: Date[] = [];
      const cursor = new Date(startDate);
      while (cursor <= endDate) {
        days.push(new Date(cursor));
        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }

      attemptsChart = days.map(d => {
        const rec = findDaily(d);
        return { date: `${d.getUTCDate()}/${d.getUTCMonth() + 1}`, count: rec?.totalAttempts ?? 0 };
      });

      aiQuestionsChart = days.map(d => {
        const rec = findDaily(d);
        return { date: `${d.getUTCDate()}/${d.getUTCMonth() + 1}`, count: rec?.totalAiQuestions ?? 0 };
      });

      revenueChart = days.map(d => {
        const rec = findDaily(d);
        return { label: `${d.getUTCDate()}/${d.getUTCMonth() + 1}`, revenue: rec?.revenue ?? 0 };
      });

    } else {
      // 3-months / 6-months / this-year → dùng MonthlyStatistic
      const labels: Record<string, string> = {
        '3-months': 'Tháng',
        '6-months': 'Tháng',
        'this-year': 'Thg'
      };
      const prefix = labels[filter] || 'Tháng';

      attemptsChart = monthKeys.map(k => {
        const rec = findMonthly(k.month, k.year);
        return { date: `${prefix} ${k.month}`, count: rec?.totalAttempts ?? 0 };
      });

      aiQuestionsChart = monthKeys.map(k => {
        const rec = findMonthly(k.month, k.year);
        return { date: `${prefix} ${k.month}`, count: rec?.totalAiQuestions ?? 0 };
      });

      revenueChart = monthKeys.map(k => {
        const rec = findMonthly(k.month, k.year);
        return { label: `${prefix} ${k.month}`, revenue: rec?.revenue ?? 0 };
      });
    }

    // ── Response ──
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
