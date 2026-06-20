export function getSubjectGroupForSubject(subject: string): string {
  if (!subject) return 'Khác';
  
  const normalized = subject.trim().toLowerCase();
  
  if (normalized === 'toán học' || normalized === 'toán') {
    return 'A00, A01, B00, D01';
  } else if (normalized === 'vật lý' || normalized === 'vật lí' || normalized === 'lý') {
    return 'A00, A01';
  } else if (normalized === 'hóa học' || normalized === 'hóa') {
    return 'A00, B00';
  } else if (normalized === 'sinh học' || normalized === 'sinh') {
    return 'B00';
  } else if (normalized === 'ngữ văn' || normalized === 'văn') {
    return 'C00, D01';
  } else if (normalized === 'tiếng anh' || normalized === 'anh') {
    return 'A01, D01';
  } else if (normalized === 'lịch sử' || normalized === 'sử') {
    return 'C00';
  } else if (normalized === 'địa lý' || normalized === 'địa') {
    return 'C00';
  }
  
  return 'Khác';
}

export function getSubjectsForSubjectGroup(group: string): string[] {
  if (!group) return [];
  
  const normalized = group.trim().toUpperCase();
  
  switch (normalized) {
    case 'A00':
      return ['Toán học', 'Toán', 'Vật lý', 'Vật lí', 'Lý', 'Hóa học', 'Hóa'];
    case 'A01':
      return ['Toán học', 'Toán', 'Vật lý', 'Vật lí', 'Lý', 'Tiếng Anh', 'Anh'];
    case 'B00':
      return ['Toán học', 'Toán', 'Hóa học', 'Hóa', 'Sinh học', 'Sinh'];
    case 'C00':
      return ['Ngữ văn', 'Văn', 'Lịch sử', 'Sử', 'Địa lý', 'Địa'];
    case 'D01':
      return ['Toán học', 'Toán', 'Ngữ văn', 'Văn', 'Tiếng Anh', 'Anh'];
    default:
      return [];
  }
}
