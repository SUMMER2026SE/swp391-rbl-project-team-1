import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function mapOptions(optionsText: { A: string; B: string; C: string; D: string }, correctAns: string) {
  const incorrectVals = [optionsText.B, optionsText.C, optionsText.D];
  let incorrectIdx = 0;
  return ['A', 'B', 'C', 'D'].map(label => {
    if (label === correctAns) {
      return { label, text: optionsText.A };
    } else {
      const val = incorrectVals[incorrectIdx];
      incorrectIdx++;
      return { label, text: val || `Lựa chọn sai ${label}` };
    }
  });
}

function getMathQuestion(qIndex: number, seed: number, correctAns: string) {
  const val1 = (seed % 6) + 2;
  const val2 = (seed % 5) + 3;
  const val3 = (seed % 4) + 1;
  const val4 = (seed % 3) + 2;

  let content = "";
  let optionsText = { A: "", B: "", C: "", D: "" };
  let explanation = "";
  let topic = "Kiến thức chung";

  switch (qIndex) {
    case 1:
      topic = "Số phức";
      content = `Cho số phức $z = ${val1} - ${val2}i$. Phần thực của số phức $z$ bằng:`;
      optionsText = { A: `${val1}`, B: `-${val2}`, C: `${val1}i`, D: `-${val2}i` };
      explanation = `Phần thực của số phức $z = a + bi$ là $a$. Đối với $z = ${val1} - ${val2}i$, phần thực là $${val1}$.`;
      break;
    case 2:
      topic = "Số phức";
      content = `Cho số phức $z = ${val1} + ${val2}i$. Phần ảo của số phức $z$ bằng:`;
      optionsText = { A: `${val2}`, B: `${val1}`, C: `${val1}i`, D: `${val2}i` };
      explanation = `Phần ảo của số phức $z = a + bi$ là $b$. Đối với $z = ${val1} + ${val2}i$, phần ảo là $${val2}$.`;
      break;
    case 3:
      topic = "Hình chiếu và tọa độ Oxyz";
      content = `Trong không gian $Oxyz$, cho điểm $A(${val1}; -${val2}; ${val3})$. Hình chiếu vuông góc của điểm $A$ trên trục $Ox$ có tọa độ là:`;
      optionsText = { A: `(${val1}; 0; 0)`, B: `(0; -${val2}; 0)`, C: `(0; 0; ${val3})`, D: `(0; -${val2}; ${val3})` };
      explanation = `Hình chiếu vuông góc của điểm $A(x; y; z)$ trên trục $Ox$ là $A'(x; 0; 0)$. Ở đây $A(${val1}; -${val2}; ${val3})$ nên hình chiếu trên $Ox$ là $(${val1}; 0; 0)$.`;
      break;
    case 4:
      topic = "Mặt cầu Oxyz";
      content = `Trong không gian $Oxyz$, cho mặt cầu $(S): (x-${val1})^2 + y^2 + (z+${val2})^2 = ${val3 * val3}$. Bán kính của mặt cầu $(S)$ bằng:`;
      optionsText = { A: `${val3}`, B: `${val3 * val3}`, C: `${val1}`, D: `${val2}` };
      explanation = `Phương trình mặt cầu có dạng $(x-a)^2 + (y-b)^2 + (z-c)^2 = R^2$. Từ phương trình $(S)$, ta có $R^2 = ${val3 * val3} \\Rightarrow R = ${val3}$.`;
      break;
    case 5:
      topic = "Đường tiệm cận";
      content = `Tiệm cận đứng của đồ thị hàm số $y = \\frac{${val1}x - 1}{x + ${val2}}$ là đường thẳng:`;
      optionsText = { A: `x = -${val2}`, B: `x = ${val1}`, C: `y = -${val2}`, D: `y = ${val1}` };
      explanation = `Đồ thị hàm số phân thức bậc nhất $y = \\frac{ax+b}{cx+d}$ có tiệm cận đứng là đường thẳng $x = -\\frac{d}{c}$. Ở đây mẫu số $x + ${val2} = 0 \\Rightarrow x = -${val2}$.`;
      break;
    default:
      const mockMathQuestions = [
        {
          topic: "Tập nghiệm bất phương trình",
          content: `Tập nghiệm của bất phương trình $\\log_{2}(x - ${val1}) < 3$ là:`,
          optionsText: { A: `(${val1}; ${val1 + 8})`, B: `(-\\infty; ${val1 + 8})`, C: `[${val1}; ${val1 + 8})`, D: `(${val1}; +\\infty)` },
          explanation: `Điều kiện: $x - ${val1} > 0 \\Rightarrow x > ${val1}$. Bất phương trình $\\log_2 (x - ${val1}) < 3 \\Leftrightarrow x - ${val1} < 8 \\Leftrightarrow x < ${val1 + 8}$. Kết hợp điều kiện ta được $x \\in (${val1}; ${val1 + 8})$.`
        },
        {
          topic: "Tổ hợp và xác suất",
          content: `Có bao nhiêu cách chọn ${val3} học sinh từ một nhóm gồm ${val3 + 8} học sinh?`,
          optionsText: { A: `C_{${val3 + 8}}^{${val3}}`, B: `A_{${val3 + 8}}^{${val3}}`, C: `${val3}!`, D: `P_{${val3 + 8}}` },
          explanation: `Số cách chọn ${val3} học sinh từ một nhóm ${val3 + 8} học sinh (không phân biệt thứ tự) là số tổ hợp chập ${val3} của ${val3 + 8}, ký hiệu là $C_{${val3 + 8}}^{${val3}}$.`
        },
        {
          topic: "Số phức",
          content: `Cho hai số phức $z_1 = ${val1} + i$ và $z_2 = 2 - ${val2}i$. Phần thực của số phức $z_1 + z_2$ bằng:`,
          optionsText: { A: `${val1 + 2}`, B: `${val1 - 2}`, C: `1 - ${val2}`, D: `1 + ${val2}` },
          explanation: `$z_1 + z_2 = (${val1} + 2) + (1 - ${val2})i = ${val1 + 2} + (1 - ${val2})i$. Phần thực bằng ${val1 + 2}.`
        }
      ];
      const selected = mockMathQuestions[(qIndex - 6) % mockMathQuestions.length];
      topic = selected.topic;
      content = selected.content;
      optionsText = selected.optionsText;
      explanation = selected.explanation;
  }

  return {
    content,
    options: mapOptions(optionsText, correctAns),
    correctAnswer: correctAns,
    explanation,
    topic,
    difficulty: qIndex <= 15 ? 'EASY' as const : (qIndex <= 35 ? 'MEDIUM' as const : 'HARD' as const)
  };
}

function getEnglishQuestion(qIndex: number, seed: number, correctAns: string) {
  let content = "";
  let optionsText = { A: "", B: "", C: "", D: "" };
  let explanation = "";
  let topic = "Grammar & Vocabulary";

  switch (qIndex) {
    case 1:
      topic = "Pronunciation";
      content = `Choose the word whose underlined part is pronounced differently from that of the others:`;
      optionsText = { A: "played", B: "visited", C: "decided", D: "started" };
      explanation = `'played' ends with the /d/ sound, whereas the other three end with the /id/ sound.`;
      break;
    case 2:
      topic = "Stress";
      content = `Choose the word that differs from the other three in the position of primary stress:`;
      optionsText = { A: "repeat", B: "balance", C: "carbon", D: "standard" };
      explanation = `'repeat' is stressed on the second syllable, while the other three words are stressed on the first syllable.`;
      break;
    case 3:
      topic = "Tag Questions";
      content = `She has been working here for a long time, ______?`;
      optionsText = { A: "hasn't she", B: "has she", C: "doesn't she", D: "isn't she" };
      explanation = `The main sentence is positive and uses the present perfect ('She has...'), so the tag question must be negative present perfect ('hasn't she?').`;
      break;
    default:
      const generalEnglish = [
        {
          topic: "Tenses",
          content: `By the time we arrived at the classroom, the teacher ______ the lesson.`,
          optionsText: { A: "had started", B: "started", C: "has started", D: "was starting" },
          explanation: `We use the past perfect ('had + V3') to express an action that was completed before another past action ('arrived').`
        },
        {
          topic: "Synonyms",
          content: `Choose the word CLOSEST in meaning to the underlined word: "The math exam was very 'challenging'."`,
          optionsText: { A: "difficult", B: "easy", C: "simple", D: "boring" },
          explanation: `'challenging' means demanding or difficult, so 'difficult' is the closest synonym.`
        }
      ];
      const sel = generalEnglish[(qIndex - 4) % generalEnglish.length];
      topic = sel.topic;
      content = sel.content;
      optionsText = sel.optionsText;
      explanation = sel.explanation;
  }

  return {
    content,
    options: mapOptions(optionsText, correctAns),
    correctAnswer: correctAns,
    explanation,
    topic,
    difficulty: qIndex <= 15 ? 'EASY' as const : (qIndex <= 35 ? 'MEDIUM' as const : 'HARD' as const)
  };
}

function getPhysicsQuestion(qIndex: number, seed: number, correctAns: string) {
  const val1 = (seed % 5) + 2;
  const val2 = (seed % 3) + 1;

  let content = "";
  let optionsText = { A: "", B: "", C: "", D: "" };
  let explanation = "";
  let topic = "Vật lý đại cương";

  switch (qIndex) {
    case 1:
      topic = "Dao động cơ";
      content = `Một con lắc lò xo có độ cứng $k = ${val1 * 50}\\text{ N/m}$, gắn vật nặng khối lượng $m = 0.5\\text{ kg}$. Tần số góc dao động riêng của con lắc bằng:`;
      optionsText = { A: `${Math.round(Math.sqrt(val1 * 50 / 0.5))}\\text{ rad/s}`, B: `10\\text{ rad/s}`, C: `20\\text{ rad/s}`, D: `5\\text{ rad/s}` };
      explanation = `Tần số góc của con lắc lò xo được tính bằng công thức: $\\omega = \\sqrt{\\frac{k}{m}} = \\sqrt{\\frac{${val1 * 50}}{0.5}} = \\sqrt{${val1 * 100}} = ${Math.round(Math.sqrt(val1 * 50 / 0.5))}\\text{ rad/s}$.`;
      break;
    default:
      const generalPhysics = [
        {
          topic: "Sóng ánh sáng",
          content: `Trong thí nghiệm Y-âng về giao thoa ánh sáng, khoảng cách giữa hai khe là $a = 1\\text{ mm}$, khoảng cách từ hai khe đến màn là $D = 2\\text{ m}$. Ánh sáng đơn sắc có bước sóng $\\lambda = 0.5\\text{ }\\mu\\text{m}$. Khoảng vân giao thoa trên màn bằng:`,
          optionsText: { A: `1.0\\text{ mm}`, B: `0.5\\text{ mm}`, C: `2.0\\text{ mm}`, D: `1.5\\text{ mm}` },
          explanation: `Khoảng vân $i = \\frac{\\lambda D}{a} = \\frac{0.5 \\cdot 10^{-6} \\cdot 2}{1 \\cdot 10^{-3}} = 1.0 \\cdot 10^{-3}\\text{ m} = 1.0\\text{ mm}$.`
        }
      ];
      const sel = generalPhysics[(qIndex - 2) % generalPhysics.length];
      topic = sel.topic;
      content = sel.content;
      optionsText = sel.optionsText;
      explanation = sel.explanation;
  }

  return {
    content,
    options: mapOptions(optionsText, correctAns),
    correctAnswer: correctAns,
    explanation,
    topic,
    difficulty: qIndex <= 15 ? 'EASY' as const : (qIndex <= 30 ? 'MEDIUM' as const : 'HARD' as const)
  };
}

function getChemistryQuestion(qIndex: number, seed: number, correctAns: string) {
  let content = "";
  let optionsText = { A: "", B: "", C: "", D: "" };
  let explanation = "";
  let topic = "Hóa học đại cương";

  switch (qIndex) {
    case 1:
      topic = "Este - Lipit";
      content = `Este nào sau đây phản ứng với dung dịch NaOH sinh ra ancol etylic ($C_2H_5OH$)?`;
      optionsText = { A: "CH_3COOC_2H_5", B: "HCOOCH_3", C: "CH_3COOCH_3", D: "C_2H_5COOCH_3" };
      explanation = `CH_3COOC_2H_5 (etyl axetat) bị thủy phân trong NaOH tạo muối CH_3COONa và ancol etylic C_2H_5OH.`;
      break;
    default:
      const generalChem = [
        {
          topic: "Đại cương kim loại",
          content: `Khi cho lá sắt vào dung dịch muối nào sau đây, có hiện tượng lá sắt tan dần và kim loại mới bám vào lá sắt?`,
          optionsText: { A: "CuSO_4", B: "MgSO_4", C: "NaCl", D: "ZnSO_4" },
          explanation: `Fe có tính khử mạnh hơn Cu nên đẩy được Cu ra khỏi muối: Fe + CuSO_4 -> FeSO_4 + Cu bám vào lá sắt.`
        }
      ];
      const sel = generalChem[(qIndex - 2) % generalChem.length];
      topic = sel.topic;
      content = sel.content;
      optionsText = sel.optionsText;
      explanation = sel.explanation;
  }

  return {
    content,
    options: mapOptions(optionsText, correctAns),
    correctAnswer: correctAns,
    explanation,
    topic,
    difficulty: qIndex <= 15 ? 'EASY' as const : (qIndex <= 30 ? 'MEDIUM' as const : 'HARD' as const)
  };
}

function getBiologyQuestion(qIndex: number, seed: number, correctAns: string) {
  let content = "";
  let optionsText = { A: "", B: "", C: "", D: "" };
  let explanation = "";
  let topic = "Sinh học đại cương";

  switch (qIndex) {
    case 1:
      topic = "Mã di truyền";
      content = `Bộ ba nào sau đây quy định mã mở đầu dịch mã trên phân tử mARN?`;
      optionsText = { A: "5'-AUG-3'", B: "5'-UAG-3'", C: "5'-UAA-3'", D: "5'-UGA-3'" };
      explanation = `Bộ ba 5'-AUG-3' mã hóa cho axit amin Mêtiônin ở sinh vật nhân chuẩn và là mã mở đầu dịch mã.`;
      break;
    default:
      const generalBio = [
        {
          topic: "Đột biến gen",
          content: `Đột biến điểm là dạng đột biến liên quan đến:`,
          optionsText: { A: "Một cặp nuclêôtit", B: "Hai cặp nuclêôtit", C: "Nhiều cặp nuclêôtit", D: "Toàn bộ gen" },
          explanation: `Đột biến điểm theo định nghĩa là đột biến gen chỉ liên quan đến một cặp nuclêôtit duy nhất.`
        }
      ];
      const sel = generalBio[(qIndex - 2) % generalBio.length];
      topic = sel.topic;
      content = sel.content;
      optionsText = sel.optionsText;
      explanation = sel.explanation;
  }

  return {
    content,
    options: mapOptions(optionsText, correctAns),
    correctAnswer: correctAns,
    explanation,
    topic,
    difficulty: qIndex <= 15 ? 'EASY' as const : (qIndex <= 30 ? 'MEDIUM' as const : 'HARD' as const)
  };
}

function getAptitudeQuestion(qIndex: number, seed: number, correctAns: string, subject: string) {
  let content = `[Đề thi ${subject}] Câu hỏi tư duy logic số ${qIndex}?`;
  let optionsText = { A: "Mệnh đề (1) và (3) mâu thuẫn nhau", B: "Cả ba mệnh đề có thể cùng đúng", C: "A luôn đúng", D: "B luôn đúng" };
  let explanation = `Giải thích chi tiết cho câu hỏi tư duy logic số ${qIndex} môn ${subject}. Đáp án đúng là ${correctAns}.`;
  let topic = "Tư duy logic";

  return {
    content,
    options: mapOptions(optionsText, correctAns),
    correctAnswer: correctAns,
    explanation,
    topic,
    difficulty: qIndex <= 15 ? 'EASY' as const : (qIndex <= 30 ? 'MEDIUM' as const : 'HARD' as const)
  };
}

function generateQuestionFallback(subject: string, title: string, qIndex: number, correctAnswer: string) {
  const seed = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + qIndex;
  
  if (subject.includes('Toán')) {
    return getMathQuestion(qIndex, seed, correctAnswer);
  } else if (subject.includes('Anh') || subject.includes('English') || subject.includes('Tiếng Anh')) {
    return getEnglishQuestion(qIndex, seed, correctAnswer);
  } else if (subject.includes('Lý') || subject.includes('Physics') || subject.includes('Vật')) {
    return getPhysicsQuestion(qIndex, seed, correctAnswer);
  } else if (subject.includes('Hóa') || subject.includes('Chemistry')) {
    return getChemistryQuestion(qIndex, seed, correctAnswer);
  } else if (subject.includes('Sinh') || subject.includes('Biology')) {
    return getBiologyQuestion(qIndex, seed, correctAnswer);
  } else {
    return getAptitudeQuestion(qIndex, seed, correctAnswer, subject);
  }
}

async function main() {
  console.log('[Excel Importer] Starting import of Excel exams from excel_exams.json...');
  
  const jsonPath = path.resolve(__dirname, 'excel_exams.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`[Excel Importer] Error: ${jsonPath} does not exist.`);
    return;
  }
  
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const excelExams = JSON.parse(rawData);
  
  // Find admin user or fallback
  let adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });
  if (!adminUser) {
    adminUser = await prisma.user.findFirst();
  }
  const creatorId = adminUser ? adminUser.id : 1;
  
  const answersList = ['A', 'B', 'C', 'D'];
  
  for (const item of excelExams) {
    // Check if exam already exists by title
    const existing = await prisma.exam.findFirst({
      where: { title: item.title }
    });
    
    if (existing) {
      console.log(`[Excel Importer] Exam "${item.title}" already exists. Skipping.`);
      continue;
    }
    
    console.log(`[Excel Importer] Creating exam: "${item.title}"`);
    
    // Create the exam record
    const exam = await prisma.exam.create({
      data: {
        title: item.title,
        subject: item.subject,
        subjectGroup: item.subjectGroup,
        duration: item.duration,
        isPublic: true,
        createdBy: creatorId,
        year: item.year,
        source: item.source,
        totalQuestions: item.totalQuestions,
        difficulty: 'MEDIUM',
        status: 'published'
      }
    });
    
    // Generate the questions
    const createdQuestions = [];
    for (let q = 1; q <= item.totalQuestions; q++) {
      const correctAns = answersList[(q + item.title.length) % 4];
      const fallbackQ = generateQuestionFallback(item.subject, item.title, q, correctAns);
      
      const question = await prisma.question.create({
        data: {
          content: fallbackQ.content,
          options: fallbackQ.options,
          correctAnswer: fallbackQ.correctAnswer,
          explanation: fallbackQ.explanation,
          subject: item.subject,
          topic: fallbackQ.topic,
          difficulty: fallbackQ.difficulty,
          createdBy: creatorId
        }
      });
      
      createdQuestions.push({ questionId: question.id, order: q });
    }
    
    // Link questions to exam
    for (const link of createdQuestions) {
      await prisma.examQuestion.create({
        data: {
          examId: exam.id,
          questionId: link.questionId,
          order: link.order
        }
      });
    }
    
    console.log(`[Excel Importer] Completed seeding "${item.title}" with ${item.totalQuestions} questions.`);
  }
  
  console.log('[Excel Importer] Done importing all Excel exams!');
}

main()
  .catch((e) => {
    console.error('[Excel Importer Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
