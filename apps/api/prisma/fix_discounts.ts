import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapping title -> discount đúng từ seed_courses.ts
const DISCOUNT_MAP: Record<string, number> = {
  'Khảo sát hàm số nâng cao THPTQG':                    30,
  'Hóa học hữu cơ Este - Lipit chuyên sâu':             40,
  'Chuyên đề Dao động cơ học thi đại học':               50,
  'Chinh phục ngữ pháp Tiếng Anh THPTQG':               0,
  'Đột phá Nghị luận xã hội môn Ngữ văn':               0,
  'Lịch sử Việt Nam cận hiện đại cấp tốc':               20,
  'Sinh học tế bào & Di truyền học cốt lõi':             15,
  'Địa lý tự nhiên và kinh tế xã hội dễ hiểu':          0,
  'Chuyên đề Số phức & Tích phân vận dụng cao':          45,
  'Luyện đề thi thử THPTQG Tiếng Anh 2026':             10,
  'Chuyên đề Hình học không gian Oxyz':                  25,
  'Nền tảng Toán 12 cho học sinh mất gốc':               0,
  'Dòng điện xoay chiều từ A đến Z':                     35,
  'Sóng ánh sáng & Sóng lượng tử vũ trụ':               0,
  'Hóa vô cơ lớp 12 chinh phục điểm 8+':                50,
  'Lý thuyết Hóa học cốt lõi chống sai ngu':            0,
  'Hệ sinh thái & Tiến hóa sinh giới':                   15,
  'Chinh phục Nghị luận văn học 12':                     30,
  'Sơ đồ tư duy 10 tác phẩm văn học trọng tâm':         20,
  'Kỹ năng viết lại câu và từ vựng Tiếng Anh nâng cao': 10,
  'Lịch sử Thế giới hiện đại (1945 - 2000)':             0,
  'Cách mạng Việt Nam giai đoạn vàng (1930 - 1975)':    40,
  'Địa lý ngành kinh tế Việt Nam trọng tâm':             15,
  'Khai thác triệt để Atlas Địa lý Việt Nam':            0,
  'Luyện thi Đánh giá năng lực ĐHQG Hà Nội & TP.HCM':  30,
};

async function fixDiscounts() {
  console.log('🔧 Đang update discount cho các khóa học...\n');

  let updated = 0;
  let skipped = 0;

  for (const [title, discount] of Object.entries(DISCOUNT_MAP)) {
    if (discount === 0) { skipped++; continue; } // Đã đúng rồi (default 0)

    const result = await prisma.course.updateMany({
      where: { title },
      data: { discount }
    });

    if (result.count > 0) {
      console.log(`✅ Updated [discount=${discount}%] "${title}"`);
      updated++;
    } else {
      console.log(`⚠️  Không tìm thấy: "${title}"`);
    }
  }

  console.log(`\n🎉 Hoàn tất! Đã update ${updated} khóa học, bỏ qua ${skipped} khóa học (discount=0).`);

  // Xác nhận lại
  const courses = await prisma.course.findMany({
    select: { title: true, discount: true },
    orderBy: { id: 'asc' }
  });

  console.log('\n📋 Kiểm tra lại toàn bộ discount:');
  let allCorrect = true;
  for (const c of courses) {
    const expected = DISCOUNT_MAP[c.title];
    if (expected === undefined) continue;
    const ok = c.discount === expected;
    if (!ok) allCorrect = false;
    console.log(`  ${ok ? '✅' : '❌'} discount=${c.discount}% (expected ${expected}%) | ${c.title}`);
  }
  console.log(allCorrect ? '\n✅ Tất cả discount đều chính xác!' : '\n❌ Vẫn còn lệch, cần kiểm tra lại!');

  await prisma.$disconnect();
}

fixDiscounts().catch(e => {
  console.error('Lỗi:', e);
  prisma.$disconnect();
  process.exit(1);
});
