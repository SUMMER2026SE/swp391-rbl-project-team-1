const SUBJECT_THUMBNAILS = {
  'Toán học': '/course_thumb_math.png',
  'Toán': '/course_thumb_math.png',
  'Vật lý': '/course_thumb_physics.png',
  'Vật lí': '/course_thumb_physics.png',
  'Lý': '/course_thumb_physics.png',
  'Tiếng Anh': '/course_thumb_english.png',
  'Anh': '/course_thumb_english.png',
  'Hóa học': '/course_thumb_chemistry.png',
  'Hóa': '/course_thumb_chemistry.png',
  'Ngữ văn': '/course_thumb_literature.png',
  'Văn': '/course_thumb_literature.png',
  'Sinh học': '/course_thumb_chemistry.png',
  'Sinh': '/course_thumb_chemistry.png',
  'Lịch sử': '/course_thumb_literature.png',
  'Sử': '/course_thumb_literature.png',
  'Địa lý': '/course_thumb_physics.png',
  'Địa': '/course_thumb_physics.png',
  'GDCD': '/course_thumb_literature.png',
};

export function mapDatabaseCourseToMockFormat(dbCourse) {
  if (!dbCourse) return null;

  // Map subjectGroup to block (e.g. A01 -> Khối A01)
  let block = 'Khối A01';
  if (dbCourse.subjectGroup) {
    block = dbCourse.subjectGroup.startsWith('Khối')
      ? dbCourse.subjectGroup
      : `Khối ${dbCourse.subjectGroup}`;
  }

  // Parse price
  const isFree = dbCourse.price === 0;
  const priceOriginal = isFree ? 0 : (dbCourse.price ? dbCourse.price * 2 : 990000);
  const priceSale = isFree ? 0 : (dbCourse.price !== undefined && dbCourse.price !== null ? dbCourse.price : 499000);
  const discountPercent = isFree ? 0 : 50;

  // Group lessons into curriculum chapters
  const curriculum = [
    {
      title: "Chương 1: Nội dung khóa học",
      lessons: dbCourse.lessons
        ? dbCourse.lessons.map(l => ({
            id: String(l.id),
            title: l.title,
            type: l.videoUrl ? 'video' : 'document',
            durationMin: l.duration ? parseInt(l.duration, 10) || 20 : 20,
            duration: l.duration || '20:00',
            isPreview: l.order === 1,
            videoUrl: l.videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'
          }))
        : []
    }
  ];

  // Map reviews
  const reviews = dbCourse.reviews
    ? dbCourse.reviews.map(r => ({
        author: r.student?.user?.fullName || 'Học viên ẩn danh',
        rate: r.rating || 5,
        text: r.comment || '',
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'
      }))
    : [];

  // Count lessons
  const lessonCount = dbCourse.lessons?.length || 5;

  return {
    id: String(dbCourse.id),
    title: dbCourse.title,
    subject: dbCourse.subject,
    block,
    thumbnail: dbCourse.thumbnailUrl || SUBJECT_THUMBNAILS[dbCourse.subject] || '/course_thumb_math.png',
    badge: priceSale === 0 ? 'MIỄN PHÍ' : 'BÁN CHẠY',
    description: dbCourse.description,
    rating: 4.8, // default fallback
    reviewCount: reviews.length || 120,
    lessonCount,
    durationHours: Math.round(lessonCount * 0.3) || 12,
    studentCount: dbCourse.enrollments?.length || 1540,
    instructor: {
      name: dbCourse.teacher?.user?.fullName || 'Giảng viên EduPath',
      title: dbCourse.teacher?.bio || 'Thạc sĩ chuyên gia luyện thi THPTQG',
      avatar: dbCourse.teacher?.user?.fullName
        ? dbCourse.teacher.user.fullName.split(' ').pop().slice(0, 2).toUpperCase()
        : 'GV'
    },
    priceOriginal,
    priceSale,
    discountPercent,
    level: dbCourse.level || 'Cơ bản',
    curriculum,
    reviews
  };
}
