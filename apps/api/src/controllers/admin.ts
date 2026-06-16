import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

// Get Admin Dashboard Stats dynamically from Supabase
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newUsersThisWeek = await prisma.user.count({
      where: { createdAt: { gte: oneWeekAgo } }
    });

    const totalLeads = await prisma.lead.count();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const attemptsToday = await prisma.testAttempt.count({
      where: { startedAt: { gte: startOfDay } }
    });

    const conversionRate = totalLeads > 0 ? Math.round((totalUsers / totalLeads) * 100) : 100;

    // Group test attempts over the last 7 calendar days
    const last7Days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const count = await prisma.testAttempt.count({
        where: {
          startedAt: {
            gte: dayStart,
            lte: dayEnd
          }
        }
      });

      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      last7Days.push({
        date: `${day}-${month}`,
        count
      });
    }

    // Feature Usage Stats (Interaction rates)
    const mockExamsInteractions = await prisma.testAttempt.count();
    const chatbotInteractions = await prisma.chatMessage.count();
    const mindmapInteractions = await prisma.mindmap.count();
    const forumPostsInteractions = await prisma.forumPost.count();
    const forumCommentsInteractions = await prisma.forumComment.count();
    const documentCommentsInteractions = await prisma.documentComment.count();

    const featureUsage = {
      mockExams: mockExamsInteractions,
      chatbot: chatbotInteractions,
      mindmaps: mindmapInteractions,
      forum: forumPostsInteractions + forumCommentsInteractions,
      documents: documentCommentsInteractions
    };

    // Calculate actual subject performance stats
    const allAttempts = await prisma.testAttempt.findMany({
      include: {
        exam: true
      }
    });

    const subjectCounts: Record<string, number> = {};
    const subjectScoresSum: Record<string, number> = {};

    allAttempts.forEach(attempt => {
      const subject = attempt.exam?.subject || 'Khác';
      subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
      
      const scoreVal = attempt.score ?? 0;
      subjectScoresSum[subject] = (subjectScoresSum[subject] || 0) + scoreVal;
    });

    const subjectStats = Object.keys(subjectCounts).map(subject => {
      const count = subjectCounts[subject];
      const avg = count > 0 ? parseFloat((subjectScoresSum[subject] / count).toFixed(1)) : 0;
      return {
        subject,
        count,
        averageScore: avg
      };
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        newUsersThisWeek,
        totalLeads,
        attemptsToday,
        conversionRate,
        last7Days,
        featureUsage,
        subjectStats
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Users Manager Endpoints
export const getAdminUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { id: 'desc' }
    });

    const formatted = users.map(u => ({
      id: u.id,
      name: u.fullName,
      email: u.email,
      role: u.role.toLowerCase(),
      isBanned: !u.isActive,
      registeredDate: u.createdAt.toISOString().split('T')[0]
    }));

    res.json({ success: true, data: formatted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const toggleUserBan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User không tồn tại' });
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: { isActive: !user.isActive }
    });

    res.json({ success: true, data: { id: updated.id, isBanned: !updated.isActive } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Leads Manager Endpoints
export const getAdminLeads = async (req: Request, res: Response) => {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { id: 'desc' }
    });

    const formatted = leads.map(l => ({
      id: l.id,
      name: l.name,
      phone: l.phone,
      email: l.email,
      target: l.target,
      registeredDate: l.registeredDate.toISOString().split('T')[0],
      status: l.status
    }));

    res.json({ success: true, data: formatted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createAdminLead = async (req: Request, res: Response) => {
  try {
    const { name, phone, email, target } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Thiếu thông tin name hoặc email' });
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        phone: phone || 'Chưa cung cấp',
        email,
        target: target || 'Tư vấn lộ trình thích ứng',
        status: 'Chờ tư vấn'
      }
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

    const lead = await prisma.lead.update({
      where: { id: Number(id) },
      data: { status }
    });

    res.json({ success: true, data: lead });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Feature Flags Toggles
export const getFeatureFlags = async (req: Request, res: Response) => {
  try {
    let flags = await prisma.featureFlag.findMany();
    
    const defaultFlags = [
      { id: 'mockExams', name: 'Thi thử THPTQG' },
      { id: 'chatbot', name: 'Trợ lý ảo AI Coach' },
      { id: 'flashcards', name: 'Flashcards Tài liệu' },
      { id: 'mindmaps', name: 'Sơ đồ tư duy AI' },
      { id: 'forum', name: 'Diễn đàn Thảo luận' },
      { id: 'documents', name: 'Tài liệu ôn tập' }
    ];

    let updated = false;
    for (const df of defaultFlags) {
      const existing = flags.find(f => f.id === df.id);
      if (!existing) {
        const flag = await prisma.featureFlag.create({
          data: {
            id: df.id,
            name: df.name,
            isEnabled: true
          }
        });
        flags.push(flag);
        updated = true;
      }
    }

    if (updated) {
      // Re-fetch all flags to ensure database order/cleanliness
      flags = await prisma.featureFlag.findMany();
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

    const flag = await prisma.featureFlag.update({
      where: { id },
      data: { isEnabled: Boolean(isEnabled) }
    });

    res.json({ success: true, data: flag });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
