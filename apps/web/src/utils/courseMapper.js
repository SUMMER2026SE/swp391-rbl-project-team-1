export function mapDbCourseToMockFormat(c) {
  if (!c) return null;

  // Calculate rating
  const ratingVal = c.reviews && c.reviews.length > 0 
    ? Number((c.reviews.reduce((acc, r) => acc + r.rating, 0) / c.reviews.length).toFixed(1))
    : 4.8;

  // Student count (fallback if 0, to make dashboard look populated for demo)
  const studentCountVal = c.enrollments && c.enrollments.length > 0 
    ? c.enrollments.length 
    : (Number(c.id) * 350 + 120);

  // Badge assignment
  const badgeVal = c.price === 0 
    ? 'MIỄN PHÍ' 
    : (c.id % 3 === 0 ? 'BÁN CHẠY' : (c.id % 2 === 0 ? 'HOT' : 'ĐỀ XUẤT'));

  // Calculate duration
  let totalMinutes = 0;
  if (c.lessons && c.lessons.length > 0) {
    c.lessons.forEach(l => {
      if (l.duration) {
        const parts = l.duration.split(':');
        if (parts.length >= 1) {
          const m = parseInt(parts[0], 10);
          if (!isNaN(m)) totalMinutes += m;
        }
      }
    });
  }
  const durationHoursVal = totalMinutes > 0 ? Math.ceil(totalMinutes / 60) : 12;

  // Curriculum mapping (grouping flat list of lessons into sections/chapters)
  const curriculumVal = [];
  if (c.lessons && c.lessons.length > 0) {
    const sortedLessons = [...c.lessons].sort((a, b) => a.order - b.order);
    
    if (sortedLessons.length > 4) {
      const mid = Math.ceil(sortedLessons.length / 2);
      curriculumVal.push({
        title: "Phần 1: Kiến thức nền tảng",
        lessons: sortedLessons.slice(0, mid).map(l => ({
          id: l.id.toString(),
          title: l.title,
          type: l.videoUrl ? 'video' : 'document',
          durationMin: parseInt(l.duration?.split(':')[0], 10) || 15,
          isPreview: l.order === 1,
          videoUrl: l.videoUrl
        }))
      });
      curriculumVal.push({
        title: "Phần 2: Chuyên đề nâng cao",
        lessons: sortedLessons.slice(mid).map(l => ({
          id: l.id.toString(),
          title: l.title,
          type: l.videoUrl ? 'video' : 'document',
          durationMin: parseInt(l.duration?.split(':')[0], 10) || 15,
          isPreview: false,
          videoUrl: l.videoUrl
        }))
      });
    } else {
      curriculumVal.push({
        title: "Danh sách bài giảng chuyên sâu",
        lessons: sortedLessons.map(l => ({
          id: l.id.toString(),
          title: l.title,
          type: l.videoUrl ? 'video' : 'document',
          durationMin: parseInt(l.duration?.split(':')[0], 10) || 15,
          isPreview: l.order === 1,
          videoUrl: l.videoUrl
        }))
      });
    }
  } else {
    curriculumVal.push({
      title: "Danh sách bài học",
      lessons: [
        { id: `${c.id}01`, title: "Bài 1: Khái niệm và phương pháp mở đầu", type: "video", durationMin: 15, isPreview: true },
        { id: `${c.id}02`, title: "Bài 2: Các dạng bài tập trắc nghiệm cơ bản", type: "video", durationMin: 20, isPreview: false }
      ]
    });
  }

  // Determine level
  let levelVal = c.level || "Cơ bản";
  if (c.title.toLowerCase().includes('nâng cao') || c.title.toLowerCase().includes('chuyên sâu')) {
    levelVal = "Nâng cao";
  } else if (c.title.toLowerCase().includes('cấp tốc')) {
    levelVal = "Cấp tốc";
  }

  return {
    id: c.id.toString(),
    title: c.title,
    subject: c.subject === 'Toán học' ? 'Toán' : c.subject,
    block: c.subjectGroup ? `Khối ${c.subjectGroup}` : "Tổng hợp",
    thumbnail: c.thumbnailUrl,
    badge: badgeVal,
    description: c.description,
    rating: ratingVal,
    reviewCount: c.reviews ? c.reviews.length : (Number(c.id) * 87 + 45),
    lessonCount: c.lessons ? c.lessons.length : 5,
    durationHours: durationHoursVal,
    studentCount: studentCountVal,
    instructor: {
      name: c.teacher?.user?.fullName || "Giảng viên EduPath",
      title: c.teacher?.bio || "Thạc sĩ, Cố vấn học thuật EduPath",
      avatar: c.teacher?.user?.avatarUrl || "GV"
    },
    priceOriginal: c.price,
    priceSale: c.price * (1 - (c.discount || 0) / 100),
    discountPercent: c.discount || 0,
    level: levelVal,
    curriculum: curriculumVal
  };
}
