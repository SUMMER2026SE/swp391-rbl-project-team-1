import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { toast } from '../utils/toast';
import { HiSparkles, HiPlay, HiClock, HiChevronLeft, HiChevronRight, HiAcademicCap, HiMenu, HiX, HiOutlineLightBulb, HiInformationCircle, HiCheckCircle, HiBookOpen } from 'react-icons/hi';
import useCourseProgress from '../hooks/useCourseProgress';
import { mapDbCourseToMockFormat, resolveUploadUrl } from '../utils/courseMapper';
import { api } from '../api';
import { discussionService } from '../services/discussionService';
import sunLogo from '../assets/sun_logo.png';
import '../styles/courses.css';

// Subcomponents
import VideoPlayer from '../components/courses/learning/VideoPlayer';
import LessonSidebar from '../components/courses/learning/LessonSidebar';
import MaterialsTab from '../components/courses/learning/MaterialsTab';
import DiscussionTab from '../components/courses/learning/DiscussionTab';
import TeacherQATab from '../components/courses/learning/TeacherQATab';
import TranscriptTab from '../components/courses/learning/TranscriptTab';
import ExerciseTab from '../components/courses/learning/ExerciseTab';
import AITutorPanel from '../components/courses/learning/AITutorPanel';
import NotePanel from '../components/courses/learning/NotePanel';
import KeyboardShortcutsOverlay from '../components/courses/learning/KeyboardShortcutsOverlay';
import CompletionModal from '../components/courses/learning/CompletionModal';

const EduPathLogo = ({ onClick }) => (
  <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginRight: '8px' }}>
    <img src={sunLogo} alt="EduPath AI" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
    <span style={{ fontSize: '18px', fontWeight: '800', color: '#6366f1', letterSpacing: '-0.5px', fontFamily: "'Outfit', sans-serif" }}>
      EduPath <em style={{ color: '#4f46e5', fontStyle: 'normal' }}>AI</em>
    </span>
  </div>
);

const FileIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

function getSubjectTranscript(title, courseTitle) {
  const fullTitle = (title + ' ' + courseTitle).toLowerCase();
  
  if (fullTitle.includes('vật lý') || fullTitle.includes('vật lí') || fullTitle.includes(' lý') || fullTitle.includes(' lí')) {
    return [
      { timeSeconds: 0, text: "Chào mừng các em học sinh đến với khóa học: Lấy gốc Vật lý trong 10 ngày.", text_en: "Welcome students to the course: Mastering Physics in 10 Days." },
      { timeSeconds: 15, text: `Hôm nay chúng ta sẽ bước vào: "${title || 'Bài học mới'}"`, text_en: `Today we will begin: "${title || 'New Lesson'}"` },
      { timeSeconds: 28, text: "Các em hãy chuẩn bị kết nối, nhắn tin vào nhóm Zalo và mình bắt đầu buổi học nhé.", text_en: "Please connect, message in the Zalo group and let's get started with our lesson." },
      { timeSeconds: 45, text: "Hãy nhớ ghi chép đầy đủ các định luật, công thức quan trọng vào sổ tay để tự ôn tập.", text_en: "Remember to take full notes of laws and important formulas in your notebook for self-study." },
      { timeSeconds: 65, text: "Và toàn bộ nội dung kiến thức lý thuyết trọng tâm này, mình sẽ học trong buổi ngày hôm nay.", text_en: "And all of this core theoretical knowledge, we will study in today's session." },
      { timeSeconds: 90, text: "Đầu tiên, chúng ta sẽ khảo sát chu kỳ và tần số của dao động điều hòa cơ bản.", text_en: "First, we will examine the period and frequency of basic harmonic oscillation." },
      { timeSeconds: 115, text: "Công thức tính tần số góc omega bằng căn bậc hai của k chia m đối với con lắc lò xo.", text_en: "The formula for angular frequency omega is the square root of k over m for a spring pendulum." },
      { timeSeconds: 140, text: "Hãy lưu ý các đại lượng như li độ x, biên độ A và pha ban đầu phi.", text_en: "Please note the quantities such as displacement x, amplitude A and initial phase phi." },
      { timeSeconds: 165, text: "Đề thi trắc nghiệm THPT Quốc gia thường ra các câu nhận biết về pha dao động.", text_en: "National High School Exam multiple choice questions often ask about the phase of oscillation." },
      { timeSeconds: 190, text: "Bước sang phần tiếp theo, chúng ta cùng phân tích đồ thị dao động hình sin.", text_en: "Moving on to the next part, let's analyze the sinusoidal oscillation graph together." },
      { timeSeconds: 215, text: "Các điểm cực đại và cực tiểu trên đồ thị tương ứng với vị trí biên dương và biên âm.", text_en: "Maximum and minimum points on the graph correspond to positive and negative amplitudes." },
      { timeSeconds: 240, text: "Tiếp theo là công thức tính vận tốc cực đại v max bằng omega nhân với biên độ A.", text_en: "Next is the formula to calculate maximum velocity v max equal to omega times amplitude A." },
      { timeSeconds: 270, text: "Gia tốc a lệch pha pi so với li độ x và có độ lớn cực đại tại vị trí biên.", text_en: "Acceleration a is pi out of phase with displacement x and has maximum magnitude at boundaries." },
      { timeSeconds: 300, text: "Các em cần chú ý đơn vị đo của các đại lượng: mét, radian trên giây và giây.", text_en: "You need to pay attention to the units of quantities: meters, radians per second, and seconds." },
      { timeSeconds: 330, text: "Bây giờ chúng ta sẽ chuyển sang một số ví dụ minh họa thực tế để áp dụng công thức.", text_en: "Now we will move on to some practical illustrative examples to apply the formulas." },
      { timeSeconds: 360, text: "Ví dụ một: Một con lắc lò xo dao động với biên độ bốn cm và tần số hai Hz.", text_en: "Example one: A spring pendulum oscillates with amplitude of 4 cm and frequency of 2 Hz." },
      { timeSeconds: 390, text: "Hãy tính chu kỳ dao động và tốc độ cực đại của vật nhỏ trong quá trình dao động.", text_en: "Calculate the oscillation period and maximum speed of the small object during oscillation." },
      { timeSeconds: 420, text: "Chu kỳ T bằng một chia f, tức là một phần hai bằng không phẩy năm giây.", text_en: "The period T is 1 over f, which is one half, equal to 0.5 seconds." },
      { timeSeconds: 450, text: "Tốc độ cực đại v max bằng omega nhân A, bằng hai pi nhân f nhân A, tức là mười sáu pi.", text_en: "Maximum speed v max equals omega times A, which is 2 pi times f times A, or 16 pi." },
      { timeSeconds: 480, text: "Các bài tập ở mức độ thông hiểu này chỉ cần áp dụng trực tiếp công thức là ra đáp án.", text_en: "These comprehensive level exercises only require direct application of formulas to get results." },
      { timeSeconds: 510, text: "Hãy chú ý không để bị nhầm lẫn giữa đơn vị cm và mét khi tính toán năng lượng.", text_en: "Be careful not to confuse cm and meter units when calculating energy." },
      { timeSeconds: 540, text: "Tiếp theo, chúng ta sẽ bàn về phương pháp loại trừ đáp án nhiễu trong đề thi tốt nghiệp.", text_en: "Next, we will discuss methods to eliminate distractor options in final exam papers." },
      { timeSeconds: 570, text: "Các đáp án sai thường có dấu âm hoặc sai lệch về hệ số pi.", text_en: "Incorrect answers often have negative signs or errors in the pi coefficient." },
      { timeSeconds: 600, text: "Bài học hôm nay đến đây là kết thúc, các em hãy tải file bài tập tự luyện bên dưới nhé.", text_en: "Today's lesson ends here, please download the self-practice file below." },
      { timeSeconds: 630, text: "Chúc các em học tốt và hẹn gặp lại các em trong bài học tiếp theo.", text_en: "Wish you all good study results and see you in the next lesson." }
    ];
  }
  
  if (fullTitle.includes('toán') || fullTitle.includes('toan')) {
    return [
      { timeSeconds: 0, text: "Chào mừng các em học sinh đến với khóa học: Chinh phục điểm 9+ môn Toán.", text_en: "Welcome students to the course: Conquering 9+ score in Mathematics." },
      { timeSeconds: 15, text: `Hôm nay chúng ta sẽ bắt đầu: "${title || 'Bài học mới'}"`, text_en: `Today we will start: "${title || 'New Lesson'}"` },
      { timeSeconds: 30, text: "Các em hãy ghi chép cẩn thận phương pháp vẽ bảng biến thiên và các điểm cực trị.", text_en: "Please take careful notes of how to draw the variation table and find extreme points." },
      { timeSeconds: 50, text: "Chú ý điều kiện xác định của hàm số phân thức và hàm số chứa căn.", text_en: "Pay attention to the domain conditions of fractional functions and radical functions." },
      { timeSeconds: 75, text: "Bây giờ chúng ta sẽ cùng áp dụng định lý Fermat về điều kiện cần của cực trị.", text_en: "Now we will apply Fermat's theorem on the necessary conditions for local extrema." },
      { timeSeconds: 100, text: "Đạo hàm f phẩy x triệt tiêu hoặc không xác định tại các điểm nghi ngờ.", text_en: "The derivative f prime x vanishes or is undefined at suspected points." },
      { timeSeconds: 130, text: "Tiếp theo, ta lập bảng biến thiên để xét dấu đạo hàm và kết luận điểm cực đại, cực tiểu.", text_en: "Next, we construct the sign chart of the derivative to conclude local maximum and minimum." },
      { timeSeconds: 160, text: "Đối với hàm đa thức bậc ba, đồ thị luôn có tâm đối xứng nằm ở điểm uốn.", text_en: "For cubic polynomial functions, the graph always has a point of inflection as symmetry center." },
      { timeSeconds: 190, text: "Hãy lưu ý kỹ công thức tính nhanh khoảng cách giữa hai điểm cực trị của đồ thị hàm số.", text_en: "Please note the shortcut formula to compute the distance between two extreme points." },
      { timeSeconds: 220, text: "Bây giờ chúng ta sẽ giải quyết câu hỏi tích phân bằng phương pháp đổi biến số.", text_en: "Now we will solve the integration question using the substitution method." },
      { timeSeconds: 250, text: "Đặt t bằng biểu thức chứa căn hoặc nằm trong dấu ngoặc đơn của hàm số.", text_en: "Set t equal to the radical expression or expression inside parentheses." },
      { timeSeconds: 280, text: "Nhớ thực hiện bước đổi cận tích phân, nếu không kết quả tính toán sẽ bị sai.", text_en: "Remember to change the integration limits, otherwise the result will be incorrect." },
      { timeSeconds: 310, text: "Đạo hàm dt tương ứng với biểu thức ngoài dấu tích phân ban đầu.", text_en: "The derivative dt corresponds to the expression outside the original integral." },
      { timeSeconds: 340, text: "Phương pháp Casio có thể giúp chúng ta kiểm tra nhanh đáp án trắc nghiệm.", text_en: "The Casio calculator method can help us quickly double check multiple-choice answers." },
      { timeSeconds: 370, text: "Gán giá trị tích phân cho biến A trong máy tính và so sánh với các lựa chọn.", text_en: "Assign the integral value to variable A in calculator and compare with options." },
      { timeSeconds: 400, text: "Tiếp theo là phần hình học tọa độ không gian Oxyz cực kỳ quan trọng.", text_en: "Next is the extremely important space coordinate geometry Oxyz section." },
      { timeSeconds: 430, text: "Cách viết phương trình mặt phẳng đi qua một điểm và vuông góc với một đường thẳng.", text_en: "How to write the equation of a plane passing through a point and perpendicular to a line." },
      { timeSeconds: 460, text: "Vectơ chỉ phương của đường thẳng chính là vectơ pháp tuyến của mặt phẳng cần tìm.", text_en: "The direction vector of the line is the normal vector of the target plane." },
      { timeSeconds: 490, text: "Hãy chú ý hệ số tự do D khi viết phương trình tổng quát của mặt phẳng.", text_en: "Please pay attention to the constant D when writing the general plane equation." },
      { timeSeconds: 520, text: "Chúng ta cùng giải quyết một số câu hỏi vận dụng cao về cực trị hình học Oxyz.", text_en: "Let's solve some high-application questions about Oxyz geometric extrema." },
      { timeSeconds: 550, text: "Áp dụng bất đẳng thức tam giác hoặc hình chiếu vuông góc để tìm giá trị nhỏ nhất.", text_en: "Apply triangle inequalities or orthogonal projections to find the minimum value." },
      { timeSeconds: 580, text: "Chúc các em ôn tập thật tốt và làm chủ các chuyên đề toán thi đại học.", text_en: "Wish you all good review and master the university exam math topics." }
    ];
  }
  
  if (fullTitle.includes('lịch sử') || fullTitle.includes('lich su') || fullTitle.includes(' sử') || fullTitle.includes(' su')) {
    return [
      { timeSeconds: 0, text: "Chào mừng các em học sinh đến với khóa học: Ôn thi THPT Quốc gia môn Lịch sử.", text_en: "Welcome students to the course: National Exam Prep for History." },
      { timeSeconds: 15, text: `Hôm nay chúng ta sẽ bắt đầu ôn tập chuyên đề: "${title || 'Bài học mới'}"`, text_en: `Today we will review the topic: "${title || 'New Lesson'}"` },
      { timeSeconds: 30, text: "Các em hãy nắm chắc dòng thời gian và các sự kiện lịch sử cốt lõi trong sách giáo khoa.", text_en: "Please master the timeline and core historical events in your textbook." },
      { timeSeconds: 50, text: "Lưu ý bối cảnh quốc tế sau Chiến tranh thế giới thứ hai và sự hình thành trật tự hai cực Ialta.", text_en: "Note the post-WWII international context and the formation of Yalta bipolar order." },
      { timeSeconds: 75, text: "Hội nghị Ialta diễn ra từ ngày mùng 4 đến ngày 11 tháng 2 năm 1945.", text_en: "The Yalta Conference took place from February 4 to 11, 1945." },
      { timeSeconds: 100, text: "Ba cường quốc Liên Xô, Mỹ, Anh đã thông qua nhiều quyết định quan trọng về phân chia khu vực ảnh hưởng.", text_en: "The three powers USSR, USA, UK passed key decisions on dividing spheres of influence." },
      { timeSeconds: 130, text: "Sự thành lập Tổ chức Liên Hợp Quốc nhằm duy trì hòa bình và an ninh thế giới.", text_en: "The establishment of the United Nations to maintain world peace and security." },
      { timeSeconds: 160, text: "Năm nguyên tắc hoạt động cơ bản của Liên Hợp Quốc là nền tảng cho quan hệ quốc tế.", text_en: "The five basic principles of UN are the foundation for international relations." },
      { timeSeconds: 190, text: "Chiến tranh lạnh kéo dài từ năm 1947 đến năm 1989 đã chi phối sâu sắc quan hệ thế giới.", text_en: "The Cold War spanning 1947-1989 deeply dominated global relations." },
      { timeSeconds: 220, text: "Sự đối đầu căng thẳng giữa hai khối quân sự NATO do Mỹ đứng đầu và Tổ chức Hiệp ước Vác-sa-va.", text_en: "Tense confrontation between NATO led by USA and the Warsaw Pact organization." },
      { timeSeconds: 250, text: "Chuyển sang lịch sử Việt Nam giai đoạn từ năm 1919 đến năm 1930.", text_en: "Moving on to Vietnam History during the period from 1919 to 1930." },
      { timeSeconds: 280, text: "Cuộc khai thác thuộc địa lần thứ hai của thực dân Pháp đã làm biến đổi sâu sắc cơ cấu xã hội.", text_en: "The second colonial exploitation by French colonizers deeply changed social structure." },
      { timeSeconds: 310, text: "Giai cấp công nhân Việt Nam lớn mạnh nhanh chóng và vươn lên giành quyền lãnh đạo cách mạng.", text_en: "Vietnamese working class grew rapidly and rose to lead the revolution." },
      { timeSeconds: 340, text: "Hoạt động tìm đường cứu nước của Nguyễn Ái Quốc từ năm 1911 đến năm 1920.", text_en: "Nguyen Ai Quoc's journey to find path for national salvation from 1911 to 1920." },
      { timeSeconds: 370, text: "Người đã tìm ra con đường cứu nước đúng đắn cho dân tộc: con đường cách mạng vô sản.", text_en: "He found the correct path of salvation for the nation: proletarian revolution." },
      { timeSeconds: 400, text: "Sự thành lập Đảng Cộng sản Việt Nam vào đầu năm 1930 là bước ngoặt vĩ đại.", text_en: "The establishment of Communist Party of Vietnam in early 1930 was a great turning point." },
      { timeSeconds: 430, text: "Hội nghị thành lập Đảng diễn ra tại Hương Cảng dưới sự chủ trì của Nguyễn Ái Quốc.", text_en: "The Party unification conference took place in Hong Kong presided by Nguyen Ai Quoc." },
      { timeSeconds: 460, text: "Cương lĩnh chính trị đầu tiên do Nguyễn Ái Quốc soạn thảo là một cương lĩnh giải phóng dân tộc đúng đắn.", text_en: "The first Political Platform by Nguyen Ai Quoc was a correct national liberation platform." },
      { timeSeconds: 490, text: "Tiếp theo, ta nghiên cứu phong trào cách mạng 1930-1931 với đỉnh cao Xô viết Nghệ - Tĩnh.", text_en: "Next, we study the 1930-1931 revolutionary movement peaking with Nghe-Tinh Soviets." },
      { timeSeconds: 520, text: "Đây là cuộc tổng diễn tập đầu tiên chuẩn bị cho Cách mạng tháng Tám năm 1945.", text_en: "This was the first general rehearsal preparing for the August Revolution in 1945." },
      { timeSeconds: 550, text: "Hãy lưu ý so sánh Luận cương chính trị tháng 10 năm 1930 với Cương lĩnh tháng 2.", text_en: "Please compare the October 1930 Political Thesis with the February Platform." },
      { timeSeconds: 580, text: "Bài ôn tập hôm nay kết thúc, các em nhớ làm bài trắc nghiệm luyện tập nhé.", text_en: "Today's review ends, remember to do the practice multiple-choice test." }
    ];
  }
  
  if (fullTitle.includes('tiếng anh') || fullTitle.includes('tieng anh') || fullTitle.includes(' anh') || fullTitle.includes('english')) {
    return [
      { timeSeconds: 0, text: "Welcome students to our English prep class for the High School graduation exam.", text_en: "Welcome students to our English prep class for the High School graduation exam." },
      { timeSeconds: 15, text: `Today we are going to study the topic: "${title || 'New Lesson'}"`, text_en: `Today we are going to study the topic: "${title || 'New Lesson'}"` },
      { timeSeconds: 30, text: "Please pay close attention to grammar structures and vocabulary keywords.", text_en: "Please pay close attention to grammar structures and vocabulary keywords." },
      { timeSeconds: 50, text: "First, let us review the twelve English verb tenses, starting with Present Perfect.", text_en: "First, let us review the twelve English verb tenses, starting with Present Perfect." },
      { timeSeconds: 75, text: "Remember the formula: subject plus have or has plus past participle verb.", text_en: "Remember the formula: subject plus have or has plus past participle verb." },
      { timeSeconds: 100, text: "This tense describes actions that started in the past and continue to the present.", text_en: "This tense describes actions that started in the past and continue to the present." },
      { timeSeconds: 130, text: "Common signal words include: since, for, already, yet, ever, and never.", text_en: "Common signal words include: since, for, already, yet, ever, and never." },
      { timeSeconds: 160, text: "Next, we will focus on relative clauses and relative pronouns.", text_en: "Next, we will focus on relative clauses and relative pronouns." },
      { timeSeconds: 190, text: "Use 'who' for people as subjects, and 'whom' for people as objects.", text_en: "Use 'who' for people as subjects, and 'whom' for people as objects." },
      { timeSeconds: 220, text: "Use 'which' for things, and 'that' can replace both in defining clauses.", text_en: "Use 'which' for things, and 'that' can replace both in defining clauses." },
      { timeSeconds: 250, text: "Be careful with non-defining relative clauses: you must use commas and cannot use 'that'.", text_en: "Be careful with non-defining relative clauses: you must use commas and cannot use 'that'." },
      { timeSeconds: 280, text: "Now let's practice active and passive voice transformations.", text_en: "Now let's practice active and passive voice transformations." },
      { timeSeconds: 310, text: "Move the object of the active sentence to become the subject of the passive sentence.", text_en: "Move the object of the active sentence to become the subject of the passive sentence." },
      { timeSeconds: 340, text: "Add the verb 'to be' conjugated in the same tense, followed by past participle.", text_en: "Add the verb 'to be' conjugated in the same tense, followed by past participle." },
      { timeSeconds: 370, text: "Let us examine some common multiple-choice questions from official exam papers.", text_en: "Let us examine some common multiple-choice questions from official exam papers." },
      { timeSeconds: 400, text: "Look at the sentence completion questions on vocabulary and collocations.", text_en: "Look at the sentence completion questions on vocabulary and collocations." },
      { timeSeconds: 430, text: "You need to memorize phrasal verbs like 'take off', 'look after', 'put out'.", text_en: "You need to memorize phrasal verbs like 'take off', 'look after', 'put out'." },
      { timeSeconds: 460, text: "Finally, the reading comprehension section requires skimming and scanning skills.", text_en: "Finally, the reading comprehension section requires skimming and scanning skills." },
      { timeSeconds: 490, text: "Read the questions first, highlight key terms, then search for them in the text.", text_en: "Read the questions first, highlight key terms, then search for them in the text." },
      { timeSeconds: 520, text: "Practice daily to build speed and accuracy for your final exam.", text_en: "Practice daily to build speed and accuracy for your final exam." },
      { timeSeconds: 550, text: "Thank you for joining, please download the vocabulary list below.", text_en: "Thank you for joining, please download the vocabulary list below." },
      { timeSeconds: 580, text: "Good luck with your study and see you in our next video lesson.", text_en: "Good luck with your study and see you in our next video lesson." }
    ];
  }

  // General Fallback
  return [
    { timeSeconds: 0, text: `Chào mừng các em học sinh đến với bài giảng: "${title}" ngày hôm nay.`, text_en: `Welcome students to today's lecture: "${title}".` },
    { timeSeconds: 15, text: "Chúng ta sẽ đi vào phân tích sâu và làm quen với các khái niệm cốt lõi của chuyên đề này.", text_en: "We will go into deep analysis and get familiar with the core concepts of this topic." },
    { timeSeconds: 30, text: "Các em hãy nhắn vào nhóm học tập để nhận tài liệu rồi chúng ta cùng bắt đầu bài học nhé.", text_en: "Please message in the study group to get documents, then let's start the lesson." },
    { timeSeconds: 45, text: "Hãy ghi chép đầy đủ công thức và ví dụ minh họa đặc biệt này vào sổ tay để tự ôn tập.", text_en: "Take complete notes of formulas and this special example in your notebook for self-review." },
    { timeSeconds: 70, text: "Nội dung bài học tiếp theo sẽ đi sâu vào thực hành giải các dạng bài tập thực chiến.", text_en: "The next lesson content will go deep into practicing combat-ready exercises." },
    { timeSeconds: 100, text: "Chúc các em tập trung học tốt và hẹn gặp lại các em trong các video sau.", text_en: "Wish you a focused study session and see you in the following videos." }
  ];
}

export default function LearningPage({ 
  courseId, 
  lessonId, 
  currentUser, 
  onSelectLesson, 
  onBackToCourse,
  navigateTo
}) {
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [dynamicTranscript, setDynamicTranscript] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [activeTab, setActiveTab] = useState('transcript'); // transcript = Tóm tắt video, exercise = Flashcard ôn tập
  const [loading, setLoading] = useState(true);
  const [aiQuery, setAiQuery] = useState(null);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);

  // Local Flashcard States
  const [lessonFlashcards, setLessonFlashcards] = useState([]);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [showManualAdd, setShowManualAdd] = useState(false);

  // Layout panels toggles and resizing
  const [sidebarOpen, setSidebarOpen] = useState(false); // Left list is collapsed/removed
  const [rightPanelTab, setRightPanelTab] = useState('curriculum'); // curriculum (Nội dung bài học), ai (Trợ lý học tập)
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [rightPanelWidth, setRightPanelWidth] = useState(380);
  const isResizingRef = useRef(false);

  // Video time tracker (synchronized with Player to drive seekable transcripts & discussions)
  const [videoTime, setVideoTime] = useState(0);
  const videoRef = useRef(null);

  // Modal displays
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [completionOpen, setCompletionOpen] = useState(false);
  const [languageMode, setLanguageMode] = useState('VI');

  // 1. Fetch Course details from API
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await api.getCourseById(courseId);
        if (data) {
          const found = mapDbCourseToMockFormat(data);
          setCourse(found);
        } else {
          setCourse(null);
        }
      } catch (err) {
        console.error('Failed to fetch course in LearningPage:', err);
        setCourse(null);
      }
    };
    fetchCourse();
  }, [courseId]);

  // Flattened list of lessons for linear navigation
  const allLessons = useMemo(() => {
    if (!course || !course.curriculum || !Array.isArray(course.curriculum)) return [];
    return course.curriculum.flatMap(chapter => chapter?.lessons || []) || [];
  }, [course]);

  // Determine active current lesson
  useEffect(() => {
    if (allLessons.length === 0) return;
    const activeId = lessonId ? lessonId.toString() : (allLessons[0]?.id ? allLessons[0].id.toString() : '');
    const active = allLessons.find(l => l && l.id && l.id.toString() === activeId) || allLessons[0];
    if (active) {
      setCurrentLesson(active);
    }
  }, [lessonId, allLessons]);

  // Load lesson flashcards from localStorage
  useEffect(() => {
    if (currentLesson) {
      const stored = localStorage.getItem(`edupath_lesson_flashcards_${currentLesson.id}`);
      if (stored) {
        try {
          setLessonFlashcards(JSON.parse(stored));
        } catch (e) {
          console.error(e);
          setLessonFlashcards([]);
        }
      } else {
        setLessonFlashcards([]);
      }
      setCurrentCardIdx(0);
      setIsFlipped(false);
      setShowManualAdd(false);
    }
  }, [currentLesson]);

  // Load dynamic transcript from API
  useEffect(() => {
    if (!currentLesson?.id) return;
    
    if (currentLesson.content) {
      try {
        const parsed = JSON.parse(currentLesson.content);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].timeSeconds !== undefined) {
          setDynamicTranscript(parsed);
          return;
        }
      } catch (e) {
        // Not JSON
      }
    }

    const loadDynamicTranscript = async () => {
      try {
        const response = await api.getLessonTranscript(currentLesson.id);
        if (response && response.success && response.data) {
          setDynamicTranscript(response.data);
        } else {
          setDynamicTranscript(null);
        }
      } catch (err) {
        console.warn('Failed to load dynamic transcript:', err);
        setDynamicTranscript(null);
      }
    };
    loadDynamicTranscript();
  }, [currentLesson?.id]);

  const totalLessonsCount = allLessons.length;

  // 2. Load Progress Hook
  const { completedLessons, toggleCompleted, progressPercent } = useCourseProgress(
    courseId,
    currentUser,
    totalLessonsCount
  );

  // Check enrollment — Admin always has full access to all courses
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'ADMIN';
  const isOwned = useMemo(() => {
    if (!courseId) return false;
    if (isAdmin) return true; // Admin can access all courses regardless of enrollment
    return !!(currentUser?.unlockedCourses?.includes(Number(courseId)) || currentUser?.unlockedCourses?.includes(courseId.toString()));
  }, [currentUser, courseId, isAdmin]);

  const isDemoMode = window.location.search.includes('demo=true');
  const isLocked = false; // Always unlocked for seamless student learning and teacher testing

  // Load materials & discussions for current lesson
  useEffect(() => {
    if (!currentLesson) return;
    setLoading(true);

    const backendDocs = currentLesson.documents || [];
    const derivedMaterials = backendDocs.map(doc => ({
      id: String(doc.id),
      title: doc.title,
      file_type: doc.fileType || 'PDF',
      file_url: resolveUploadUrl(doc.fileUrl)
    }));

    const lessonContent = currentLesson.content || '';
    const isFileUrl = lessonContent.startsWith('http') || lessonContent.startsWith('/uploads') || lessonContent.includes('/uploads/');
    if (isFileUrl) {
      const fileName = lessonContent.split('/').pop() || 'Tài liệu đính kèm';
      const fileExt = fileName.split('.').pop()?.toUpperCase() || 'PDF';
      if (!derivedMaterials.some(m => m.file_url === lessonContent)) {
        derivedMaterials.push({
          id: `lesson-content-${currentLesson.id}`,
          title: `Tài liệu đính kèm bài học`,
          file_type: fileExt,
          file_url: resolveUploadUrl(lessonContent)
        });
      }
    }
    setMaterials(derivedMaterials);

    const loadDiscussions = async () => {
      try {
        const discData = await discussionService.getDiscussionsByLessonId(Number(currentLesson.id));
        setDiscussions(discData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDiscussions();
  }, [currentLesson]);

  // Add Comment/Discussion
  const handleAddComment = async (text) => {
    if (!currentLesson || !currentUser) return;
    try {
      const newComment = await discussionService.createDiscussion(
        Number(currentLesson.id),
        currentUser.id,
        currentUser.fullName || currentUser.name || 'Học sinh',
        currentUser.avatar || 'U',
        text
      );
      setDiscussions(prev => [...prev, newComment]);
      toast('Đăng câu hỏi thành công!', 'success');
    } catch (err) {
      console.error(err);
      toast('Lỗi đăng câu hỏi.', 'error');
    }
  };

  // Navigations (Linear next / prev)
  const currentIdx = allLessons.findIndex(l => currentLesson && l.id.toString() === currentLesson.id.toString());
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < allLessons.length - 1;
  const nextLessonName = hasNext ? allLessons[currentIdx + 1].title : null;

  const handlePrevLesson = useCallback(() => {
    if (hasPrev) {
      onSelectLesson(courseId, allLessons[currentIdx - 1].id);
    }
  }, [hasPrev, currentIdx, allLessons, courseId, onSelectLesson]);

  const handleNextLesson = useCallback(() => {
    if (hasNext) {
      onSelectLesson(courseId, allLessons[currentIdx + 1].id);
    }
  }, [hasNext, currentIdx, allLessons, courseId, onSelectLesson]);

  const handleVideoEnded = () => {
    // Automatically mark lesson as completed
    const numericLessonId = Number(currentLesson.id);
    if (!completedLessons.includes(numericLessonId)) {
      toggleCompleted(numericLessonId);
    }

    if (hasNext) {
      // Handled by Custom VideoPlayer UpNext countdown triggers
    } else {
      // Last lesson concludes: Trigger celebration modal
      setCompletionOpen(true);
    }
  };

  // Draggable right sidebar handler
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizingRef.current) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 300 && newWidth <= 600) {
        setRightPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isResizingRef.current) {
        isResizingRef.current = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Listen for materials download events
  useEffect(() => {
    const handleDownload = () => {
      toast('Bắt đầu tải bộ tài liệu ôn tập của bài học!', 'success');
    };
    window.addEventListener('edupath-download-materials', handleDownload);
    return () => window.removeEventListener('edupath-download-materials', handleDownload);
  }, []);

  // Sync seek to video player
  const handleSeek = (secs) => {
    const videoEl = videoRef.current;
    if (videoEl) {
      videoEl.currentTime = secs;
      videoEl.play().catch(() => {});
    }
  };

  // Ask AI explanation based on transcript segment click
  const handleAskAIFromTranscript = (sentence) => {
    setAiQuery({
      text: `Giải thích chi tiết câu giảng này trong bài giảng giúp em: "${sentence}"`,
      timestamp: Date.now()
    });
    setRightPanelOpen(true);
    setRightPanelTab('ai');
    toast('Đã gửi mốc câu hỏi sang Gia sư AI!', 'success');
  };

  // Generate AI Flashcards from current lesson content
  const handleGenerateLessonFlashcards = async () => {
    if (!currentLesson) return;
    setIsGeneratingFlashcards(true);
    toast('Trợ lý AI bắt đầu phân tích và tạo bộ thẻ ghi nhớ...', 'info');

    try {
      const contentPrompt = `Hãy tạo 5 flashcards kiến thức cốt lõi cho bài học sau:
Tiêu đề: "${currentLesson.title}"
Nội dung bài học: "${currentLesson.content || 'Khái niệm và cách giải quyết bài toán nhanh trong thi THPT Quốc Gia.'}"`;
      
      const result = await api.generateFlashcards(contentPrompt);

      if (!Array.isArray(result) || result.length === 0) {
        throw new Error('Hệ thống AI không trả về bộ thẻ hợp lệ.');
      }

      // Format flashcards list
      const formatted = result.map((c, index) => ({
        front: c.front,
        back: c.back,
        partOfSpeech: index % 2 === 0 ? "Khái niệm" : "Định nghĩa",
        hashtag: `# ${currentLesson.title.substring(0, 10)}`
      }));

      setLessonFlashcards(formatted);
      localStorage.setItem(`edupath_lesson_flashcards_${currentLesson.id}`, JSON.stringify(formatted));
      setCurrentCardIdx(0);
      setIsFlipped(false);
      toast(`Đã tạo thành công bộ gồm ${formatted.length} thẻ học ôn tập từ AI!`, 'success');

    } catch (err) {
      console.error(err);
      toast(err.message || 'Lỗi khi tạo flashcard từ AI!', 'error');
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const handleAddManualFlashcard = (e) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const newCard = {
      front: newFront.trim(),
      back: newBack.trim(),
      partOfSpeech: lessonFlashcards.length % 2 === 0 ? "Khái niệm" : "Định nghĩa",
      hashtag: `# ${currentLesson.title.substring(0, 10)}`
    };

    const updated = [...lessonFlashcards, newCard];
    setLessonFlashcards(updated);
    localStorage.setItem(`edupath_lesson_flashcards_${currentLesson.id}`, JSON.stringify(updated));
    setNewFront('');
    setNewBack('');
    setShowManualAdd(false);
    toast('Đã thêm thẻ ghi nhớ mới thành công!', 'success');
  };

  const handleClearFlashcards = () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa toàn bộ bộ thẻ học này?')) return;
    setLessonFlashcards([]);
    localStorage.removeItem(`edupath_lesson_flashcards_${currentLesson.id}`);
    setCurrentCardIdx(0);
    setIsFlipped(false);
    toast('Đã xóa bộ thẻ học.', 'info');
  };


  // Dynamic transcripts and quizzes for complete demonstration
  const currentTranscript = useMemo(() => {
    if (dynamicTranscript && dynamicTranscript.length > 0) {
      return dynamicTranscript;
    }
    if (currentLesson?.transcript && currentLesson.transcript.length > 0) {
      return currentLesson.transcript;
    }
    
    // Parse JSON if stored in content
    if (currentLesson?.content) {
      try {
        const parsed = JSON.parse(currentLesson.content);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].timeSeconds !== undefined) {
          return parsed;
        }
      } catch (e) {
        // Not JSON
      }
    }
    
    const title = currentLesson?.title || 'Bài học mới';
    const courseTitle = course?.title || '';
    return getSubjectTranscript(title, courseTitle);
  }, [currentLesson, course, dynamicTranscript]);

  const mockQuizzes = [
    {
      question: `Bài tập củng cố: Khẳng định nào sau đây là ĐÚNG về chuyên đề "${currentLesson?.title}"?`,
      options: ["Nên học thuộc lòng công thức giải.", "Cần hiểu bản chất kết hợp mẹo giải nhanh.", "Bấm máy tính Casio luôn giải được mọi bài.", "Đề thi không bao giờ ra phần này."],
      correctOptionIndex: 1,
      explanation: "Chuyên đề ôn thi tốt nghiệp THPT yêu cầu học sinh vừa nắm vững bản chất kiến thức để tránh bẫy lý thuyết, vừa linh hoạt áp dụng phương pháp bấm Casio hoặc loại trừ để tối ưu thời gian."
    }
  ];

  if (!course || !currentLesson) {
    return (
      <div className="cp-page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--stone-text-secondary)' }}>
          <div style={{ fontSize: '32px', animation: 'spin 2s linear infinite' }}>⏳</div>
          <div style={{ fontSize: '14px', marginTop: '12px', fontWeight: 'bold' }}>Đang tải phòng học trực tuyến...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="learning-workspace-container">
      {/* CHẾ ĐỘ XEM THỬ (ADMIN PREVIEW) */}
      {isAdmin && (
        <div
          style={{
            background: 'linear-gradient(135deg, #6c5ce7 0%, #4c3d99 100%)',
            color: '#ffffff',
            padding: '14px 24px',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '4px 4px 0px #000000',
            border: '2px solid #000000',
            flexWrap: 'wrap',
            gap: '12px',
            margin: '16px'
          }}
          className="animate-in"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🔐</span>
            <div>
              <span style={{ fontSize: '13px', fontWeight: '900', display: 'block', textAlign: 'left' }}>
                CHẾ ĐỘ XEM THỬ (ADMIN PREVIEW)
              </span>
              <span style={{ fontSize: '11.5px', opacity: 0.85, display: 'block', textAlign: 'left' }}>
                Bạn đang xem nội dung khóa học với tư cách Quản trị viên. Mọi hoạt động xem bài sẽ không được ghi vào hệ thống.
              </span>
            </div>
          </div>
          <button
            onClick={() => onBackToCourse('/admin')}
            style={{
              backgroundColor: '#ffffff',
              color: '#4c3d99',
              border: '2px solid #000000',
              padding: '7px 16px',
              borderRadius: '8px',
              fontWeight: '900',
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: '2px 2px 0px #000000'
            }}
          >
            ← Về Admin Dashboard
          </button>
        </div>
      )}

      {/* HEADER BANNER FOR DEMO */}
      {isDemoMode && !isAdmin && (
        <div className="demo-header-strip animate-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="demo-icon">✨</span>
            <span>Bạn đang trải nghiệm học thử (DEMO). Đăng ký ngay để sở hữu toàn bộ bộ đề thi VIP và Adaptive AI!</span>
          </div>
          <button 
            type="button" 
            onClick={() => onBackToCourse(`/courses/${courseId}`)}
            className="btn-demo-enroll"
          >
            Đăng ký học ngay
          </button>
        </div>
      )}

      {/* TOP CONTROL NAVIGATION ROW */}
      <div className="learning-header-bar" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        height: '64px',
        boxSizing: 'border-box'
      }}>
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <EduPathLogo onClick={() => navigateTo ? navigateTo('/') : window.location.href = '/'} />
          <h2 className="current-lesson-title" style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
            {course.title}
          </h2>
        </div>

        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            type="button" 
            onClick={() => toast('Cảm ơn bạn đã đánh giá khóa học!', 'success')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              fontSize: '13px', 
              fontWeight: '700', 
              color: '#475569',
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            <span style={{ fontSize: '15px' }}>☆</span> <span style={{ textDecoration: 'underline' }}>Leave a rating</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '13px', color: '#475569', fontFamily: "'Outfit', sans-serif" }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '2px solid #0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#FFE259'
            }}>
              🏆
            </div>
            <span>{Math.round(progressPercent)}%</span>
          </div>

          <button 
            type="button" 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast('Đã sao chép liên kết khóa học vào bộ nhớ tạm!', 'success');
            }}
            style={{
              background: '#3f51b5',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(63, 81, 181, 0.2)'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '2px' }}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
            Share
          </button>
        </div>
      </div>

      {/* TWO COLUMN GRID LAYOUT */}
      <div className="learning-layout-grid">
        
        {/* CENTER COLUMN: VIDEO & INTERACTIVE TABS */}
        <div className="center-workspace-wrapper" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden', padding: '24px', gap: '24px' }}>
          {/* Main Video Screen Container */}
          <div className="main-video-screen">
            {isLocked ? (
              <div className="video-locked-overlay animate-in">
                <HiAcademicCap className="locked-icon" />
                <h3>Bài học VIP đã bị khóa</h3>
                <p>Bài học này nằm trong giáo trình trả phí. Vui lòng hoàn tất học phí để mở khóa bài học này nhé.</p>
                <button 
                  type="button" 
                  onClick={() => onBackToCourse(`/courses/${courseId}`)}
                  className="btn-locked-purchase"
                >
                  Đăng ký khóa học ngay
                </button>
              </div>
            ) : (
              <VideoPlayer
                ref={videoRef}
                videoUrl={currentLesson.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"}
                title={currentLesson.title}
                lessonId={currentLesson.id}
                nextLessonName={nextLessonName}
                onEnded={handleVideoEnded}
                onTimeUpdate={(t) => setVideoTime(t)}
                transcript={currentTranscript}
                languageMode={languageMode}
                chapters={[
                  { title: "Phần 1: Giới thiệu chuyên đề", timeSeconds: 0 },
                  { title: "Phần 2: Phương pháp giải nhanh", timeSeconds: 28 }
                ]}
              />
            )}

            {/* Video navigation controller footer */}
            <div className="video-nav-row">
              <button 
                type="button" 
                onClick={handlePrevLesson} 
                disabled={!hasPrev} 
                className="btn-nav-arrow"
              >
                <HiChevronLeft /> Bài trước
              </button>
              
              <button 
                type="button" 
                onClick={() => toggleCompleted(Number(currentLesson.id))}
                className={`btn-toggle-complete ${completedLessons.includes(Number(currentLesson.id)) ? 'completed' : ''}`}
              >
                <HiCheckCircle />
                {completedLessons.includes(Number(currentLesson.id)) ? 'Đã học xong' : 'Đánh dấu hoàn thành'}
              </button>

              <button 
                type="button" 
                onClick={handleNextLesson} 
                disabled={!hasNext} 
                className="btn-nav-arrow"
              >
                Bài sau <HiChevronRight />
              </button>
            </div>
          </div>

          {/* Bottom Tabs Panel for Engagement: Tóm tắt video & Flashcard ôn tập */}
          <div className="interactive-tabs-container" style={{
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            overflow: 'hidden',
            flexShrink: 0
          }}>
            <div className="interactive-tabs-header" style={{
              display: 'flex',
              background: '#f8fafc',
              borderBottom: '1.5px solid #e2e8f0',
              padding: '12px 16px',
              gap: '12px'
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('transcript')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: activeTab === 'transcript' ? '#3f51b5' : '#f1f5f9',
                  color: activeTab === 'transcript' ? '#ffffff' : '#475569',
                  transition: 'all 0.2s'
                }}
              >
                📝 Ghi chú bài học
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('exercise')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: activeTab === 'exercise' ? '#3f51b5' : '#f1f5f9',
                  color: activeTab === 'exercise' ? '#ffffff' : '#475569',
                  transition: 'all 0.2s'
                }}
              >
                🗂️ Flashcard ôn tập
              </button>
            </div>

            <div className="interactive-tabs-content" style={{ padding: '24px' }}>
              {activeTab === 'transcript' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <NotePanel 
                    lesson={currentLesson} 
                    videoTime={videoTime} 
                    onSeek={handleSeek} 
                  />
                </div>
              )}

              {activeTab === 'exercise' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {lessonFlashcards.length > 0 ? (
                    <div style={{
                      background: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '24px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px'
                    }} className="flashcard-deck-container animate-in">
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>
                          🗂️ Bộ thẻ ôn tập: {currentLesson.title}
                        </h4>
                        <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 'bold' }}>
                          Độ dài: {lessonFlashcards.length} thẻ
                        </span>
                      </div>

                      {/* Flip card box with real 3D effect & physical stacked paper look */}
                      <div className="flashcard-3d-wrapper-outer" style={{ position: 'relative', width: '100%', padding: '0 8px 8px 8px', boxSizing: 'border-box', margin: '12px 0 24px 0' }}>
                        {/* Stacked background paper layers */}
                        <div style={{ position: 'absolute', top: '8px', left: '16px', right: '16px', bottom: '-4px', background: '#cbd5e1', borderRadius: '16px', border: '1.5px solid #cbd5e1', zIndex: 1, opacity: 0.8 }}></div>
                        <div style={{ position: 'absolute', top: '4px', left: '12px', right: '12px', bottom: '0px', background: '#f1f5f9', borderRadius: '16px', border: '1.5px solid #cbd5e1', zIndex: 2, opacity: 0.9 }}></div>
                        
                        {/* Binder Rings decoration */}
                        <div className="flashcard-binder-rings" style={{ position: 'absolute', top: '-14px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '80px', zIndex: 10, pointerEvents: 'none' }}>
                          <div className="flashcard-binder-ring" style={{ width: '14px', height: '32px', borderRadius: '7px', background: 'linear-gradient(90deg, #94a3b8, #cbd5e1 50%, #64748b)', boxShadow: '0 3px 6px rgba(0,0,0,0.16)' }}></div>
                          <div className="flashcard-binder-ring" style={{ width: '14px', height: '32px', borderRadius: '7px', background: 'linear-gradient(90deg, #94a3b8, #cbd5e1 50%, #64748b)', boxShadow: '0 3px 6px rgba(0,0,0,0.16)' }}></div>
                        </div>

                        <div className={`flashcard-3d-wrapper ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)} style={{ zIndex: 3, position: 'relative', margin: 0 }}>
                          <div className="flashcard-3d-card">
                            {/* Front Side */}
                            <div className="flashcard-3d-side flashcard-3d-front">
                              {/* Binder Holes */}
                              <div className="flashcard-binder-holes" style={{ position: 'absolute', top: '12px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '80px', zIndex: 4 }}>
                                <div className="flashcard-binder-hole" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#cbd5e1', border: '1px solid #94a3b8', boxShadow: 'inset 0 1.5px 3px rgba(0,0,0,0.15)' }}></div>
                                <div className="flashcard-binder-hole" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#cbd5e1', border: '1px solid #94a3b8', boxShadow: 'inset 0 1.5px 3px rgba(0,0,0,0.15)' }}></div>
                              </div>

                              <div className="flashcard-badge-row" style={{ position: 'absolute', top: '32px', display: 'flex', gap: '8px', justifyContent: 'center', width: 'auto', left: '50%', transform: 'translateX(-50%)', zIndex: 5 }}>
                                <span className="flashcard-badge" style={{ position: 'static', background: '#f59e0b', color: '#ffffff', borderColor: '#d97706', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', padding: '4px 12px', borderRadius: '99px', border: '1px solid #d97706', whiteSpace: 'nowrap' }}>KHÁI NIỆM</span>
                                {lessonFlashcards[currentCardIdx]?.partOfSpeech && lessonFlashcards[currentCardIdx]?.partOfSpeech !== 'Khái niệm' && lessonFlashcards[currentCardIdx]?.partOfSpeech !== 'Định nghĩa' && (
                                  <span className="flashcard-badge" style={{ position: 'static', background: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', padding: '4px 12px', borderRadius: '99px', border: '1px solid #bae6fd', whiteSpace: 'nowrap' }}>
                                    {lessonFlashcards[currentCardIdx].partOfSpeech}
                                  </span>
                                )}
                              </div>
                              <p className="flashcard-content">{lessonFlashcards[currentCardIdx]?.front}</p>
                              <span className="flashcard-hint">🔄 Nhấp để lật thẻ</span>
                            </div>
                            {/* Back Side */}
                            <div className="flashcard-3d-side flashcard-3d-back">
                              {/* Binder Holes */}
                              <div className="flashcard-binder-holes" style={{ position: 'absolute', top: '12px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '80px', zIndex: 4 }}>
                                <div className="flashcard-binder-hole" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#334155', border: '1px solid #1e293b', boxShadow: 'inset 0 1.5px 3px rgba(0,0,0,0.3)' }}></div>
                                <div className="flashcard-binder-hole" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#334155', border: '1px solid #1e293b', boxShadow: 'inset 0 1.5px 3px rgba(0,0,0,0.3)' }}></div>
                              </div>

                              <div className="flashcard-badge-row" style={{ position: 'absolute', top: '32px', display: 'flex', gap: '8px', justifyContent: 'center', width: 'auto', left: '50%', transform: 'translateX(-50%)', zIndex: 5 }}>
                                <span className="flashcard-badge flashcard-badge--back" style={{ position: 'static', background: '#ffffff', color: '#0ea5e9', borderColor: '#ffffff', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', padding: '4px 12px', borderRadius: '99px', border: '1px solid #ffffff', whiteSpace: 'nowrap' }}>ĐỊNH NGHĨA</span>
                                {lessonFlashcards[currentCardIdx]?.partOfSpeech && lessonFlashcards[currentCardIdx]?.partOfSpeech !== 'Khái niệm' && lessonFlashcards[currentCardIdx]?.partOfSpeech !== 'Định nghĩa' && (
                                  <span className="flashcard-badge flashcard-badge--back" style={{ position: 'static', background: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', padding: '4px 12px', borderRadius: '99px', border: '1px solid rgba(255, 255, 255, 0.3)', whiteSpace: 'nowrap' }}>
                                    {lessonFlashcards[currentCardIdx].partOfSpeech}
                                  </span>
                                )}
                              </div>
                              <p className="flashcard-content flashcard-content--back">{lessonFlashcards[currentCardIdx]?.back}</p>
                              <span className="flashcard-hint flashcard-hint--back">🔄 Nhấp để lật thẻ</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card deck controls */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => {
                            if (currentCardIdx > 0) {
                              setCurrentCardIdx(prev => prev - 1);
                              setIsFlipped(false);
                            }
                          }}
                          disabled={currentCardIdx === 0}
                          style={{
                            background: currentCardIdx === 0 ? '#f1f5f9' : '#ffffff',
                            color: currentCardIdx === 0 ? '#94a3b8' : '#1e293b',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            fontSize: '13px',
                            fontWeight: '700',
                            cursor: currentCardIdx === 0 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          ◀ Trước
                        </button>

                        <span style={{ fontSize: '13.5px', fontWeight: 'bold', color: '#334155' }}>
                          Thẻ {currentCardIdx + 1} / {lessonFlashcards.length}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            if (currentCardIdx < lessonFlashcards.length - 1) {
                              setCurrentCardIdx(prev => prev + 1);
                              setIsFlipped(false);
                            }
                          }}
                          disabled={currentCardIdx === lessonFlashcards.length - 1}
                          style={{
                            background: currentCardIdx === lessonFlashcards.length - 1 ? '#f1f5f9' : '#ffffff',
                            color: currentCardIdx === lessonFlashcards.length - 1 ? '#94a3b8' : '#1e293b',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            fontSize: '13px',
                            fontWeight: '700',
                            cursor: currentCardIdx === lessonFlashcards.length - 1 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Sau ▶
                        </button>
                      </div>

                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setShowManualAdd(!showManualAdd)}
                          style={{
                            background: '#ecfdf5',
                            color: '#059669',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 14px',
                            fontSize: '12.5px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          ➕ Tự thêm thẻ
                        </button>

                        <button
                          type="button"
                          onClick={handleClearFlashcards}
                          style={{
                            background: '#fff1f2',
                            color: '#e11d48',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 14px',
                            fontSize: '12.5px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️ Xóa bộ thẻ
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Manual Flashcard Creator Card */
                    <div className="ai-flashcard-box animate-in" style={{ padding: '32px 24px', textAlign: 'center' }}>
                      <div className="icon-container" style={{ background: '#ecfdf5', color: '#059669', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: '24px' }}>
                        <HiBookOpen />
                      </div>
                      <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>Tạo Bộ Thẻ Ôn Tập Cá Nhân</h4>
                      <p style={{ fontSize: '13.5px', color: '#64748b', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                        Tự tạo bộ thẻ ghi nhớ flashcards cho bài học <strong>"{currentLesson.title}"</strong> để hỗ trợ ôn tập định nghĩa, từ vựng và các công thức quan trọng.
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setShowManualAdd(!showManualAdd)}
                          style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '12px 28px',
                            fontSize: '13.5px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)',
                            transition: 'all 0.2s ease-in-out'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #059669, #047857)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(5, 150, 105, 0.25)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.15)';
                            e.currentTarget.style.transform = 'none';
                          }}
                        >
                          ➕ Tự thêm thẻ thủ công
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Manual add form */}
                  {showManualAdd && (
                    <div style={{
                      background: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '24px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }} className="animate-in">
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                        ➕ Thêm thẻ ghi nhớ thủ công
                      </h4>
                      <form onSubmit={handleAddManualFlashcard} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                          <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>Mặt trước (Khái niệm / Từ khóa / Công thức)</label>
                          <input
                            type="text"
                            placeholder="Ví dụ: RNA, Công thức Newton, Flo (F)..."
                            value={newFront}
                            onChange={(e) => setNewFront(e.target.value)}
                            required
                            style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              border: '1.5px solid #e2e8f0',
                              fontSize: '13.5px',
                              outline: 'none',
                              transition: 'border-color 0.2s'
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                          <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>Mặt sau (Định nghĩa / Giải thích ngắn gọn)</label>
                          <textarea
                            placeholder="Nhập định nghĩa hoặc công thức giải..."
                            value={newBack}
                            onChange={(e) => setNewBack(e.target.value)}
                            required
                            rows={3}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              border: '1.5px solid #e2e8f0',
                              fontSize: '13.5px',
                              outline: 'none',
                              resize: 'vertical',
                              transition: 'border-color 0.2s'
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                          <button
                            type="button"
                            onClick={() => setShowManualAdd(false)}
                            style={{
                              background: '#f1f5f9',
                              color: '#475569',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 16px',
                              fontSize: '13px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            Hủy bỏ
                          </button>
                          <button
                            type="submit"
                            style={{
                              background: '#4f46e5',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 20px',
                              fontSize: '13px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              boxShadow: '0 4px 6px rgba(79, 70, 229, 0.15)'
                            }}
                          >
                            Lưu thẻ
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Exercises tab */}
                  {currentLesson?.quizzes && currentLesson.quizzes.length > 0 && (
                    <ExerciseTab 
                      exercises={currentLesson.quizzes} 
                      onCompleteExercise={(score) => {
                        toast(`Hoàn thành bài luyện tập với tỷ lệ ${score}%!`, 'success');
                      }} 
                    />
                  )}
                  {/* Materials/documents tab */}
                  {materials && materials.length > 0 && (
                    <MaterialsTab materials={materials} />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Comment/Discussion section (directly below tabs) */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            textAlign: 'left',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <span style={{ fontSize: '18px' }}>💬</span>
              <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: '#0f172a' }}>Bình luận</h3>
            </div>
            <DiscussionTab
              discussions={discussions}
              currentUser={currentUser}
              onAddComment={handleAddComment}
              videoTime={videoTime}
              onSeek={handleSeek}
            />
          </div>
        </div>

        {/* RIGHT SIDEBAR COLUMN PANEL */}
        {rightPanelOpen ? (
          <div 
            className="right-sidebar-panel" 
            style={{ 
              width: `${rightPanelWidth}px`, 
              minWidth: `${rightPanelWidth}px`,
              flexShrink: 0,
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%',
              borderLeft: '1.5px solid #e2e8f0',
              background: '#ffffff',
              position: 'relative'
            }}
          >
            {/* Panel resizer handle bar */}
            <div 
              onMouseDown={handleMouseDown} 
              className="panel-resizer-bar" 
            />

            <div className="right-panel-inner" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Tab headers at the top: Nội dung bài học & Trợ lý học tập */}
              <div className="panel-toggle-tabs" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 16px',
                borderBottom: '1px solid #e2e8f0',
                background: '#ffffff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setRightPanelTab('curriculum')}
                    style={{
                      background: 'none',
                      border: 'none',
                      borderBottom: rightPanelTab === 'curriculum' ? '2.5px solid #2563eb' : '2.5px solid transparent',
                      padding: '8px 0',
                      fontSize: '13px',
                      fontWeight: '800',
                      color: rightPanelTab === 'curriculum' ? '#2563eb' : '#475569',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    Nội dung bài học
                  </button>
                  <button
                    type="button"
                    onClick={() => setRightPanelTab('ai')}
                    style={{
                      border: '1.5px solid transparent',
                      background: 'linear-gradient(#fff, #fff) padding-box, linear-gradient(135deg, #f093fb 0%, #f5576c 100%) border-box',
                      borderRadius: '20px',
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: '800',
                      color: rightPanelTab === 'ai' ? '#4f46e5' : '#475569',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>✨</span>
                    <span>Trợ lý học tập</span>
                  </button>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button 
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    title="Đổi giao diện"
                    onClick={() => toast('Đã thay đổi chế độ xem!', 'info')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => setRightPanelOpen(false)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '18px' }}
                    title="Đóng bảng thông tin"
                  >
                    <HiX />
                  </button>
                </div>
              </div>

              {/* Tab contents (curriculum list or AI Tutor panel) */}
              <div className="panel-tab-content" style={{ flex: 1, overflowY: 'auto' }}>
                {rightPanelTab === 'curriculum' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ flex: 1 }}>
                      <LessonSidebar
                        curriculum={course.curriculum}
                        currentLessonId={currentLesson.id}
                        onSelectLesson={(lesson) => onSelectLesson(courseId, lesson.id)}
                        completedLessons={completedLessons}
                        isOwned={isOwned}
                        courseTitle={course.title}
                      />
                    </div>
                    {/* Locked Certificate footer */}
                    <div style={{
                      padding: '16px 20px',
                      borderTop: '1px solid #e2e8f0',
                      background: '#faf8f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: '#475569' }}>
                        <span>🎓</span>
                        <span>Chứng chỉ hoàn thành khóa học</span>
                      </div>
                      <span style={{ fontSize: '16px' }}>🔒</span>
                    </div>
                  </div>
                ) : (
                  <AITutorPanel lesson={currentLesson} initialQuery={aiQuery} />
                )}
              </div>
            </div>
          </div>
        ) : (
          <button 
            type="button" 
            onClick={() => setRightPanelOpen(true)} 
            className="btn-toggle-right-panel-floating"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              zIndex: 20,
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#3f51b5'
            }}
            title="Mở bảng nội dung & AI"
          >
            <HiAcademicCap />
          </button>
        )}
      </div>

      {/* FLOATING COPYRIGHT WATERMARK BADGE */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(10px)',
        border: '1.5px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '40px',
        padding: '6px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: '#ffffff',
        fontFamily: "'Outfit', sans-serif",
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        pointerEvents: 'none',
        userSelect: 'none'
      }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {currentUser?.avatarUrl ? (
            <img src={currentUser.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ color: '#0f172a', fontSize: '11px', fontWeight: '900' }}>
              {currentUser?.fullName?.substring(0, 2).toUpperCase() || 'US'}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '11px', textAlign: 'left', lineHeight: '1.2' }}>
          <span style={{ fontWeight: '700', opacity: 0.9 }}>Username: {currentUser?.fullName || 'tranvanthuan'}</span>
          <span style={{ opacity: 0.6 }}>{currentUser?.email || 'tranvanthuan2005tt@gmail.com'}</span>
        </div>
      </div>

      {/* OVERLAY MODALS */}
      <KeyboardShortcutsOverlay 
        isOpen={shortcutsOpen} 
        onClose={() => setShortcutsOpen(false)} 
      />

      <CompletionModal
        isOpen={completionOpen}
        onClose={() => setCompletionOpen(false)}
        courseTitle={course.title}
        stats={{
          totalLessons: totalLessonsCount,
          totalQuizzes: allLessons.length > 2 ? 3 : 1,
          averageScore: 90
        }}
        onRequestCertificate={() => {
          return new Promise(resolve => setTimeout(resolve, 1500));
        }}
        onSubmitCourseReview={(review) => {
          return new Promise(resolve => setTimeout(resolve, 1200));
        }}
      />
    </div>
  );
}
