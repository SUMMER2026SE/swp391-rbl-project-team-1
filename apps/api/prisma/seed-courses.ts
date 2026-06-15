import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed Courses] Seeding 27 Courses (all 9 subjects, free/paid, 3 levels)...');

  // Find or create fallback teachers so the script is self-contained
  let teacherA = await prisma.user.findUnique({ where: { email: 'theanh.math@edupath.vn' } });
  if (!teacherA) {
    const teacherHash = await bcrypt.hash('teacher123', 12);
    teacherA = await prisma.user.create({
      data: {
        email: 'theanh.math@edupath.vn',
        passwordHash: teacherHash,
        fullName: 'Thầy Nguyễn Thế Anh',
        role: 'TEACHER',
        avatarUrl: 'TA',
        teacher: { create: { isApproved: true, bio: 'Giảng viên chuyên ôn Toán THPTQG với 12 năm kinh nghiệm.' } }
      }
    });
  }

  let teacherB = await prisma.user.findUnique({ where: { email: 'huong.physics@edupath.vn' } });
  if (!teacherB) {
    const teacherHash = await bcrypt.hash('teacher123', 12);
    teacherB = await prisma.user.create({
      data: {
        email: 'huong.physics@edupath.vn',
        passwordHash: teacherHash,
        fullName: 'Cô Lê Thu Hương',
        role: 'TEACHER',
        avatarUrl: 'LH',
        teacher: { create: { isApproved: true, bio: 'Tốt nghiệp Đại học Sư Phạm Hà Nội, ôn luyện Vật lý THPTQG.' } }
      }
    });
  }

  const coursesData = [
    // 1. Toán học
    {
      title: 'Toán học Cơ bản lớp 12',
      description: 'Khóa học củng cố toàn bộ kiến thức Toán đại số và hình học lớp 12.',
      subject: 'Toán học',
      level: 'Cơ bản',
      price: 0,
      teacherId: teacherA.id
    },
    {
      title: 'Khảo sát hàm số nâng cao THPTQG',
      description: 'Chuyên đề bứt phá điểm 9+ môn Toán khối A01 và D01.',
      subject: 'Toán học',
      level: 'Nâng cao',
      price: 499000.0,
      teacherId: teacherA.id
    },
    {
      title: 'Luyện thi cấp tốc Toán học THPTQG',
      description: 'Tổng ôn cấp tốc các dạng bài Toán trọng tâm trong 30 ngày.',
      subject: 'Toán học',
      level: 'Cấp tốc',
      price: 299000.0,
      teacherId: teacherB.id
    },
    // 2. Ngữ văn
    {
      title: 'Ngữ văn Cơ bản - Nghị luận Văn học',
      description: 'Phân tích chi tiết các tác phẩm trọng tâm trong chương trình Ngữ văn thi THPTQG.',
      subject: 'Ngữ văn',
      level: 'Cơ bản',
      price: 399000.0,
      teacherId: teacherB.id
    },
    {
      title: 'Bí quyết đạt điểm 9+ Ngữ văn',
      description: 'Rèn luyện tư duy nghị luận xã hội và viết bài văn sâu sắc, độc đáo.',
      subject: 'Ngữ văn',
      level: 'Nâng cao',
      price: 499000.0,
      teacherId: teacherA.id
    },
    {
      title: 'Chinh phục Ngữ văn cấp tốc',
      description: 'Hệ thống hóa toàn bộ kiến thức văn học thi THPTQG chỉ trong 10 buổi.',
      subject: 'Ngữ văn',
      level: 'Cấp tốc',
      price: 0,
      teacherId: teacherB.id
    },
    // 3. Tiếng Anh
    {
      title: 'Tiếng Anh Cơ bản cho người mất gốc',
      description: 'Lấy lại căn bản ngữ pháp, từ vựng và phát âm Tiếng Anh nhanh chóng.',
      subject: 'Tiếng Anh',
      level: 'Cơ bản',
      price: 0,
      teacherId: teacherA.id
    },
    {
      title: 'Tiếng Anh Nâng cao - Chinh phục 9+ THPTQG',
      description: 'Luyện đề thi thử nâng cao, các cấu trúc câu đặc biệt và thành ngữ phức tạp.',
      subject: 'Tiếng Anh',
      level: 'Nâng cao',
      price: 599000.0,
      teacherId: teacherB.id
    },
    {
      title: 'Cú pháp và Từ vựng Tiếng Anh cấp tốc',
      description: 'Tổng ôn các chủ đề ngữ pháp và từ vựng cốt lõi bám sát đề thi thật.',
      subject: 'Tiếng Anh',
      level: 'Cấp tốc',
      price: 299000.0,
      teacherId: teacherA.id
    },
    // 4. Vật lý
    {
      title: 'Dao động cơ học và Sóng cơ cơ bản',
      description: 'Nắm vững lý thuyết và bài tập cơ bản của chuyên đề Dao động cơ học và Sóng cơ.',
      subject: 'Vật lý',
      level: 'Cơ bản',
      price: 349000.0,
      teacherId: teacherB.id
    },
    {
      title: 'Vật lý Nâng cao - Đồ thị và Bài toán Cực trị',
      description: 'Phương pháp giải nhanh các bài toán đồ thị điện xoay chiều và cực trị nâng cao.',
      subject: 'Vật lý',
      level: 'Nâng cao',
      price: 499000.0,
      teacherId: teacherA.id
    },
    {
      title: 'Chuyên đề Dao động cơ học thi đại học',
      description: 'Nắm chắc 7+ điểm phần dao động điều hòa khối A01.',
      subject: 'Vật lý',
      level: 'Cấp tốc',
      price: 0,
      teacherId: teacherB.id
    },
    // 5. Hóa học
    {
      title: 'Hóa học hữu cơ Este - Lipit chuyên sâu',
      description: 'Lộ trình bứt phá điểm tuyệt đối môn Hóa học khối B00.',
      subject: 'Hóa học',
      level: 'Cơ bản',
      price: 599000.0,
      teacherId: teacherA.id
    },
    {
      title: 'Hóa học vô cơ Nâng cao lớp 12',
      description: 'Giải quyết các bài toán đồ thị, bài toán kim loại tác dụng với HNO3 phức tạp.',
      subject: 'Hóa học',
      level: 'Nâng cao',
      price: 0,
      teacherId: teacherB.id
    },
    {
      title: 'Tổng ôn cấp tốc Hóa học lý thuyết THPTQG',
      description: 'Tránh bẫy lý thuyết Hóa học và tổng ôn các dạng câu hỏi ăn điểm dễ.',
      subject: 'Hóa học',
      level: 'Cấp tốc',
      price: 199000.0,
      teacherId: teacherA.id
    },
    // 6. Sinh học
    {
      title: 'Sinh học Cơ bản - Di truyền học quần thể',
      description: 'Hiểu rõ bản chất các định luật di truyền và bài tập di truyền quần thể căn bản.',
      subject: 'Sinh học',
      level: 'Cơ bản',
      price: 0,
      teacherId: teacherB.id
    },
    {
      title: 'Sinh học Nâng cao - Cơ chế di truyền và biến dị',
      description: 'Các dạng bài tập nâng cao về đột biến gen, đột biến nhiễm sắc thể và phả hệ phức tạp.',
      subject: 'Sinh học',
      level: 'Nâng cao',
      price: 450000.0,
      teacherId: teacherA.id
    },
    {
      title: 'Sinh học Cấp tốc - Bí quyết 8+ thi đại học',
      description: 'Tập trung ôn tập các nội dung trọng tâm phần Tiến hóa, Sinh thái và Cơ chế di truyền.',
      subject: 'Sinh học',
      level: 'Cấp tốc',
      price: 249000.0,
      teacherId: teacherB.id
    },
    // 7. Lịch sử
    {
      title: 'Lịch sử Việt Nam từ 1919 đến nay cơ bản',
      description: 'Hệ thống các mốc lịch sử quan trọng của Việt Nam thời kỳ cận hiện đại.',
      subject: 'Lịch sử',
      level: 'Cơ bản',
      price: 199000.0,
      teacherId: teacherA.id
    },
    {
      title: 'Lịch sử thế giới và Việt Nam Nâng cao',
      description: 'Phân tích so sánh các hội nghị quốc tế, chiến lược chiến tranh và liên hệ thực tiễn lịch sử.',
      subject: 'Lịch sử',
      level: 'Nâng cao',
      price: 399000.0,
      teacherId: teacherB.id
    },
    {
      title: 'Tổng ôn Lịch sử cấp tốc bám sát đề minh họa',
      description: 'Ôn tập nhanh lý thuyết lịch sử qua sơ đồ tư duy và luyện đề thi thử bám sát đề minh họa.',
      subject: 'Lịch sử',
      level: 'Cấp tốc',
      price: 0,
      teacherId: teacherA.id
    },
    // 8. Địa lý
    {
      title: 'Địa lý tự nhiên và Dân cư Việt Nam cơ bản',
      description: 'Sử dụng thành thạo Atlat Địa lý Việt Nam và phân tích biểu đồ, số liệu cơ bản.',
      subject: 'Địa lý',
      level: 'Cơ bản',
      price: 0,
      teacherId: teacherB.id
    },
    {
      title: 'Địa lý các ngành kinh tế Nâng cao',
      description: 'Phân tích chuyên sâu cơ cấu kinh tế, sự chuyển dịch các ngành nông-lâm-ngư nghiệp, công nghiệp.',
      subject: 'Địa lý',
      level: 'Nâng cao',
      price: 349000.0,
      teacherId: teacherA.id
    },
    {
      title: 'Địa lý Cấp tốc - Chinh phục điểm số trong 2 tuần',
      description: 'Tóm tắt nhanh lý thuyết Địa lý các vùng kinh tế và thực hành kỹ năng trắc nghiệm.',
      subject: 'Địa lý',
      level: 'Cấp tốc',
      price: 149000.0,
      teacherId: teacherB.id
    },
    // 9. GDCD
    {
      title: 'Giáo dục Công dân Cơ bản lớp 12',
      description: 'Học hiểu các quyền con người, quyền nghĩa vụ công dân và các khái niệm pháp luật cơ bản.',
      subject: 'GDCD',
      level: 'Cơ bản',
      price: 149000.0,
      teacherId: teacherA.id
    },
    {
      title: 'Phân tích tình huống GDCD nâng cao',
      description: 'Phương pháp xử lý nhanh các câu hỏi tình huống pháp luật phức tạp, nhiều nhân vật.',
      subject: 'GDCD',
      level: 'Nâng cao',
      price: 299000.0,
      teacherId: teacherB.id
    },
    {
      title: 'Tổng ôn GDCD cấp tốc - Nhận diện từ khóa ăn điểm',
      description: 'Mẹo làm bài trắc nghiệm GDCD cực nhanh thông qua từ khóa và ghi nhớ cốt lõi.',
      subject: 'GDCD',
      level: 'Cấp tốc',
      price: 0,
      teacherId: teacherA.id
    }
  ];

  // Clean up any existing courses with the exact same titles to make script idempotent
  const titles = coursesData.map((c) => c.title);
  await prisma.course.deleteMany({
    where: {
      title: { in: titles }
    }
  });

  for (let i = 0; i < coursesData.length; i++) {
    const c = coursesData[i];
    await prisma.course.create({
      data: {
        title: c.title,
        description: c.description,
        subject: c.subject,
        level: c.level,
        price: c.price,
        isPublished: true,
        isApproved: true,
        teacherId: c.teacherId,
        lessons: {
          create: [
            { title: 'Bài 1: Giới thiệu và định hướng học tập', order: 1, duration: '12:30' },
            { title: 'Bài 2: Kiến thức nền tảng trọng tâm', order: 2, duration: '20:15' },
            { title: 'Bài 3: Các dạng bài tập minh họa', order: 3, duration: '25:40' },
            { title: 'Bài 4: Luyện đề và sửa lỗi sai thường gặp', order: 4, duration: '30:00' }
          ]
        }
      }
    });
  }

  console.log('[Seed Courses] Seeding 27 courses completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
