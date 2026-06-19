import { prisma } from './prisma.js';

// ────────────────────────────────────────────────────────────
// Daily helpers
// ────────────────────────────────────────────────────────────

/**
 * Chuẩn hóa một Date về 00:00:00.000 UTC (đầu ngày).
 */
export function startOfDayUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/**
 * Lấy hoặc tạo DailyStatistic cho ngày chỉ định.
 * date sẽ được chuẩn hóa về đầu ngày UTC.
 */
export async function getOrCreateDailyStatistic(date: Date) {
  const normalized = startOfDayUTC(date);
  return prisma.dailyStatistic.upsert({
    where: { date: normalized },
    create: { date: normalized },
    update: {}
  });
}

/**
 * Tăng một counter field của DailyStatistic cho ngày chỉ định.
 */
export async function incrementDailyStat(
  field: 'newUsers' | 'totalAttempts' | 'totalAiQuestions',
  date: Date
): Promise<void> {
  const normalized = startOfDayUTC(date);
  await prisma.dailyStatistic.upsert({
    where: { date: normalized },
    create: { date: normalized, [field]: 1 },
    update: { [field]: { increment: 1 } }
  });
}

/**
 * Cộng thêm doanh thu vào DailyStatistic cho ngày chỉ định.
 */
export async function addDailyRevenue(amount: number, date: Date): Promise<void> {
  const normalized = startOfDayUTC(date);
  await prisma.dailyStatistic.upsert({
    where: { date: normalized },
    create: { date: normalized, revenue: amount },
    update: { revenue: { increment: amount } }
  });
}

// ────────────────────────────────────────────────────────────
// Monthly helpers
// ────────────────────────────────────────────────────────────

/**
 * Lấy hoặc tạo mới bản ghi MonthlyStatistic cho tháng/năm chỉ định.
 */
export async function getOrCreateMonthlyStatistic(month: number, year: number) {
  return prisma.monthlyStatistic.upsert({
    where: { month_year: { month, year } },
    create: { month, year },
    update: {}
  });
}

/**
 * Tăng một counter field của MonthlyStatistic tháng hiện tại.
 */
export async function incrementMonthlyStat(
  field: 'newUsers' | 'totalAttempts' | 'totalAiQuestions',
  month: number,
  year: number
): Promise<void> {
  await prisma.monthlyStatistic.upsert({
    where: { month_year: { month, year } },
    create: { month, year, [field]: 1 },
    update: { [field]: { increment: 1 } }
  });
}

/**
 * Cộng thêm doanh thu vào MonthlyStatistic.
 */
export async function addMonthlyRevenue(
  amount: number,
  month: number,
  year: number
): Promise<void> {
  await prisma.monthlyStatistic.upsert({
    where: { month_year: { month, year } },
    create: { month, year, revenue: amount },
    update: { revenue: { increment: amount } }
  });
}

// ────────────────────────────────────────────────────────────
// Combined: cập nhật cả Daily + Monthly cùng lúc
// ────────────────────────────────────────────────────────────

/**
 * Tăng một counter field ở cả DailyStatistic và MonthlyStatistic.
 */
export async function incrementBothStats(
  field: 'newUsers' | 'totalAttempts' | 'totalAiQuestions',
  now: Date = new Date()
): Promise<void> {
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  await Promise.all([
    incrementDailyStat(field, now),
    incrementMonthlyStat(field, month, year)
  ]);
}

/**
 * Cộng doanh thu vào cả DailyStatistic và MonthlyStatistic.
 */
export async function addBothRevenue(amount: number, now: Date = new Date()): Promise<void> {
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  await Promise.all([
    addDailyRevenue(amount, now),
    addMonthlyRevenue(amount, month, year)
  ]);
}
