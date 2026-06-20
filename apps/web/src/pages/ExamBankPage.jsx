import { useState, useMemo, useEffect } from 'react';
import {
  HiSearch, HiDownload, HiEye, HiX,
  HiAcademicCap, HiDocumentText, HiClock,
  HiChartBar, HiArrowLeft, HiSparkles,
  HiBookOpen, HiClipboardList
} from 'react-icons/hi';

// ============================================================
// EXAM BANK DATA ΓÇö ─Éß╗ü thi 9 m├┤n THPT Quß╗æc Gia
// ============================================================
const SUBJECTS = [
  {
    id: 'toan', name: 'To├ín Hß╗ìc', emoji: '≡ƒªë', color: '#5b75f3',
    duration: 90, totalQuestions: 50, format: 'Trß║»c nghiß╗çm',
    pastExams: [
      { year: 2024, avg: 6.45, downloads: '124K', difficulty: 'Kh├│ vß╗½a' },
      { year: 2023, avg: 6.25, downloads: '189K', difficulty: 'Kh├│' },
      { year: 2022, avg: 6.47, downloads: '215K', difficulty: 'Trung b├¼nh' },
      { year: 2021, avg: 6.61, downloads: '301K', difficulty: 'Dß╗à h╞ín' },
      { year: 2020, avg: 6.68, downloads: '342K', difficulty: 'Trung b├¼nh' },
      { year: 2019, avg: 5.64, downloads: '410K', difficulty: 'Kh├│ nhß║Ñt' }
    ],
    sampleQuestions: [
      {
        q: 'H├ám sß╗æ y = x┬│ ΓêÆ 3x + 2 ─æß╗ông biß║┐n tr├¬n khoß║úng n├áo?',
        opts: ['A. (ΓêÆΓê₧; ΓêÆ1) v├á (1; +Γê₧)', 'B. (ΓêÆ1; 1)', 'C. (ΓêÆΓê₧; 1)', 'D. (0; +Γê₧)'],
        ans: 'A',
        topic: 'Sß╗▒ biß║┐n thi├¬n cß╗ºa h├ám sß╗æ',
        explanation: '─Éß║ío h├ám: y\' = 3x┬▓ - 3. Cho y\' = 0 => x = ┬▒1. Bß║úng x├⌐t dß║Ñu y\' cho thß║Ñy y\' > 0 tr├¬n c├íc khoß║úng (ΓêÆΓê₧; ΓêÆ1) v├á (1; +Γê₧). Do ─æ├│ h├ám sß╗æ ─æß╗ông biß║┐n tr├¬n c├íc khoß║úng n├áy.'
      },
      {
        q: 'Cho h├ám sß╗æ y = ΓêÆxΓü┤ + 2x┬▓. Sß╗æ ─æiß╗âm cß╗▒c trß╗ï cß╗ºa h├ám sß╗æ l├á:',
        opts: ['A. 1', 'B. 2', 'C. 3', 'D. 0'],
        ans: 'C',
        topic: 'Cß╗▒c trß╗ï h├ám sß╗æ',
        explanation: '─Éß║ío h├ám: y\' = -4x┬│ + 4x = -4x(x┬▓ - 1). y\' = 0 c├│ 3 nghiß╗çm ph├ón biß╗çt x = 0, x = ┬▒1 v├á y\' ─æß╗òi dß║Ñu qua 3 nghiß╗çm n├áy, do ─æ├│ h├ám sß╗æ c├│ 3 ─æiß╗âm cß╗▒c trß╗ï.'
      },
      {
        q: 'T├¡ch ph├ón Γê½ΓéÇ┬╣ (2x + 1)dx bß║▒ng:',
        opts: ['A. 1', 'B. 2', 'C. 3', 'D. 4'],
        ans: 'B',
        topic: 'Nguy├¬n h├ám & T├¡ch ph├ón',
        explanation: 'Γê½ΓéÇ┬╣ (2x + 1)dx = (x┬▓ + x)|ΓéÇ┬╣ = (1┬▓ + 1) - (0┬▓ + 0) = 2.'
      }
    ]
  },
  {
    id: 'van', name: 'Ngß╗» V─ân', emoji: '≡ƒªï', color: '#4598a7',
    duration: 120, totalQuestions: 6, format: 'Tß╗▒ luß║¡n',
    pastExams: [
      { year: 2024, avg: 7.06, downloads: '198K', difficulty: 'Trung b├¼nh' },
      { year: 2023, avg: 6.86, downloads: '231K', difficulty: 'Kh├│ vß╗½a' },
      { year: 2022, avg: 6.51, downloads: '267K', difficulty: 'Kh├│' },
      { year: 2021, avg: 6.47, downloads: '298K', difficulty: 'Trung b├¼nh' },
      { year: 2020, avg: 6.61, downloads: '321K', difficulty: 'Dß╗à h╞ín' }
    ],
    sampleQuestions: [
      {
        q: '─Éß╗ìc hiß╗âu: X├íc ─æß╗ïnh ph╞░╞íng thß╗⌐c biß╗âu ─æß║ít ch├¡nh ─æ╞░ß╗úc sß╗¡ dß╗Ñng trong ─æoß║ín tr├¡ch v─ân hß╗ìc nghß╗ï luß║¡n.',
        opts: [],
        ans: 'Nghß╗ï luß║¡n',
        topic: '─Éß╗ìc hiß╗âu v─ân bß║ún',
        explanation: 'Ph╞░╞íng thß╗⌐c biß╗âu ─æß║ít ch├¡nh l├á Nghß╗ï luß║¡n. ─Éoß║ín tr├¡ch d├╣ng lß║¡p luß║¡n v├á dß║½n chß╗⌐ng ─æß╗â l├ám s├íng tß╗Å ├╜ kiß║┐n cß╗ºa ng╞░ß╗¥i viß║┐t.'
      },
      {
        q: 'Viß║┐t ─æoß║ín v─ân nghß╗ï luß║¡n (khoß║úng 200 chß╗») tr├¼nh b├áy suy ngh─⌐ vß╗ü ├╜ ngh─⌐a cß╗ºa sß╗▒ ─æß╗ông cß║úm trong cuß╗Öc sß╗æng.',
        opts: [],
        ans: '─Éß╗ông cß║úm l├á ch├¼a kh├│a kß║┐t nß╗æi con ng╞░ß╗¥i.',
        topic: 'Nghß╗ï luß║¡n x├ú hß╗Öi',
        explanation: 'D├án ├╜ chuß║⌐n:\n1. Mß╗ƒ b├ái: Dß║½n dß║»t vß║Ñn ─æß╗ü (Sß╗▒ ─æß╗ông cß║úm giß╗»a ng╞░ß╗¥i vß╗¢i ng╞░ß╗¥i).\n2. Th├ón b├ái: Giß║úi th├¡ch (thß║┐ n├áo l├á ─æß╗ông cß║úm) + Ph├ón t├¡ch ├╜ ngh─⌐a (mang lß║íi niß╗üm tin, xoa dß╗ïu nß╗ùi ─æau, x├óy dß╗▒ng x├ú hß╗Öi v─ân minh) + N├¬u dß║½n chß╗⌐ng thß╗▒c tß║┐.\n3. Kß║┐t b├ái: R├║t ra b├ái hß╗ìc h├ánh ─æß╗Öng c├í nh├ón.'
      },
      {
        q: 'Ph├ón t├¡ch h├¼nh t╞░ß╗úng ng╞░ß╗¥i l├¡nh trong b├ái th╞í "T├óy Tiß║┐n" cß╗ºa t├íc giß║ú Quang D┼⌐ng.',
        opts: [],
        ans: 'Vß║╗ ─æß║╣p h├áo h├╣ng l├úng mß║ín v├á bi tr├íng.',
        topic: 'Nghß╗ï luß║¡n v─ân hß╗ìc',
        explanation: 'Gß╗úi ├╜ l├ám b├ái:\n- Vß║╗ ─æß║╣p ki├¬u d┼⌐ng, l├úng mß║ín cß╗ºa ng╞░ß╗¥i l├¡nh H├á th├ánh v╞░ß╗út qua mß╗ìi kh├│ kh─ân hiß╗âm trß╗ƒ ("─æo├án binh kh├┤ng mß╗ìc t├│c", "─æ├¬m m╞í H├á Nß╗Öi d├íng kiß╗üu th╞ím").\n- C├íi chß║┐t bi tr├íng, thi├¬ng li├¬ng v├¼ tß╗ò quß╗æc ("chiß║┐n tr╞░ß╗¥ng ─æi chß║│ng tiß║┐c ─æß╗¥i xanh").'
      }
    ]
  },
  {
    id: 'anh', name: 'Tiß║┐ng Anh', emoji: '≡ƒÉ╕', color: '#db8142',
    duration: 60, totalQuestions: 50, format: 'Trß║»c nghiß╗çm',
    pastExams: [
      { year: 2024, avg: 5.51, downloads: '167K', difficulty: 'Kh├│' },
      { year: 2023, avg: 5.45, downloads: '203K', difficulty: 'Kh├│' },
      { year: 2022, avg: 5.15, downloads: '245K', difficulty: 'Rß║Ñt kh├│' },
      { year: 2021, avg: 5.84, downloads: '278K', difficulty: 'Trung b├¼nh' },
      { year: 2020, avg: 4.58, downloads: '312K', difficulty: 'Kh├│ nhß║Ñt' }
    ],
    sampleQuestions: [
      {
        q: 'Mark the letter A, B, C, or D to indicate the word whose underlined part differs from the other three in pronunciation: "heated", "created", "watched", "decided"',
        opts: ['A. heated', 'B. created', 'C. watched', 'D. decided'],
        ans: 'C',
        topic: 'Ph├ít ├óm (Pronunciation)',
        explanation: '"watched" ph├ít ├óm ─æu├┤i l├á /t/, c├íc tß╗½ c├▓n lß║íi ph├ít ├óm ─æu├┤i l├á /╔¬d/.'
      },
      {
        q: 'The manager _____ the employees about the new policy yesterday afternoon.',
        opts: ['A. informs', 'B. informed', 'C. has informed', 'D. is informing'],
        ans: 'B',
        topic: 'Th├¼ ─æß╗Öng tß╗½ (Verb Tenses)',
        explanation: 'C├│ tß╗½ nhß║¡n biß║┐t "yesterday" chß╗ë thß╗¥i gian trong qu├í khß╗⌐ n├¬n ─æß╗Öng tß╗½ chia qu├í khß╗⌐ ─æ╞ín: informed.'
      },
      {
        q: 'She suggested _____ to the local cinema instead of staying at home.',
        opts: ['A. go', 'B. to go', 'C. going', 'D. went'],
        ans: 'C',
        topic: '─Éß╗Öng tß╗½ nguy├¬n mß║½u & Danh ─æß╗Öng tß╗½',
        explanation: 'Cß║Ñu tr├║c: suggest + V-ing (gß╗úi ├╜ l├ám viß╗çc g├¼).'
      }
    ]
  },
  {
    id: 'ly', name: 'Vß║¡t L├╜', emoji: '≡ƒªè', color: '#52ad58',
    duration: 50, totalQuestions: 40, format: 'Trß║»c nghiß╗çm',
    pastExams: [
      { year: 2024, avg: 6.21, downloads: '89K', difficulty: 'Kh├│ vß╗½a' },
      { year: 2023, avg: 6.57, downloads: '112K', difficulty: 'Trung b├¼nh' },
      { year: 2022, avg: 6.72, downloads: '134K', difficulty: 'Dß╗à h╞ín' },
      { year: 2021, avg: 6.56, downloads: '156K', difficulty: 'Trung b├¼nh' },
      { year: 2020, avg: 6.72, downloads: '178K', difficulty: 'Trung b├¼nh' }
    ],
    sampleQuestions: [
      {
        q: 'Mß╗Öt vß║¡t dao ─æß╗Öng ─æiß╗üu h├▓a vß╗¢i ph╞░╞íng tr├¼nh x = 5cos(2╧Çt + ╧Ç/3) cm. Bi├¬n ─æß╗Ö dao ─æß╗Öng cß╗ºa vß║¡t l├á:',
        opts: ['A. 5 cm', 'B. 10 cm', 'C. 2╧Ç cm', 'D. ╧Ç/3 cm'],
        ans: 'A',
        topic: 'Dao ─æß╗Öng c╞í hß╗ìc',
        explanation: '─Éß╗æi chiß║┐u vß╗¢i ph╞░╞íng tr├¼nh tß╗òng qu├ít x = A.cos(╧ët + ╧å) ta suy ra bi├¬n ─æß╗Ö A = 5 cm.'
      },
      {
        q: 'Trong mß║ích ─æiß╗çn xoay chiß╗üu RLC nß╗æi tiß║┐p, khi xß║úy ra cß╗Öng h╞░ß╗ƒng th├¼ khß║│ng ─æß╗ïnh n├áo ─æ├║ng?',
        opts: ['A. Z_L > Z_C', 'B. Z_L < Z_C', 'C. Z_L = Z_C', 'D. Z_L = R'],
        ans: 'C',
        topic: 'D├▓ng ─æiß╗çn xoay chiß╗üu',
        explanation: 'Cß╗Öng h╞░ß╗ƒng ─æiß╗çn xß║úy ra khi cß║úm kh├íng bß║▒ng dung kh├íng cß╗ºa mß║ích: Z_L = Z_C.'
      },
      {
        q: 'C├┤ng thß╗⌐c t├¡nh n─âng l╞░ß╗úng li├¬n kß║┐t ri├¬ng cß╗ºa hß║ít nh├ón nguy├¬n tß╗¡ l├á:',
        opts: ['A. ╬öE/A', 'B. ╬öE ├ù A', 'C. ╬öm ├ù c┬▓', 'D. ╬öm/A'],
        ans: 'A',
        topic: 'Vß║¡t l├╜ hß║ít nh├ón',
        explanation: 'N─âng l╞░ß╗úng li├¬n kß║┐t ri├¬ng ╬╡ = ╬öE/A (n─âng l╞░ß╗úng li├¬n kß║┐t t├¡nh tr├¬n mß╗Öt hß║ít nucl├┤n).'
      }
    ]
  },
  {
    id: 'hoa', name: 'H├│a Hß╗ìc', emoji: '≡ƒÉÖ', color: '#cf6674',
    duration: 50, totalQuestions: 40, format: 'Trß║»c nghiß╗çm',
    pastExams: [
      { year: 2024, avg: 6.68, downloads: '92K', difficulty: 'Trung b├¼nh' },
      { year: 2023, avg: 6.74, downloads: '118K', difficulty: 'Trung b├¼nh' },
      { year: 2022, avg: 6.70, downloads: '143K', difficulty: 'Trung b├¼nh' },
      { year: 2021, avg: 6.63, downloads: '167K', difficulty: 'Trung b├¼nh' },
      { year: 2020, avg: 6.71, downloads: '189K', difficulty: 'Dß╗à h╞ín' }
    ],
    sampleQuestions: [
      {
        q: 'Este n├áo sau ─æ├óy c├│ khß║ú n─âng tham gia phß║ún ß╗⌐ng tr├íng bß║íc?',
        opts: ['A. CHΓéâCOOCHΓéâ', 'B. HCOOCHΓéâ', 'C. CHΓéâCOOCΓééHΓéà', 'D. CΓééHΓéàCOOCHΓéâ'],
        ans: 'B',
        topic: 'Este - Lipit',
        explanation: 'Metyl fomat (HCOOCHΓéâ) l├á este cß╗ºa axit fomic, c├│ nh├│m chß╗⌐c -CHO tß╗▒ do n├¬n tr├íng bß║íc ─æ╞░ß╗úc.'
      },
      {
        q: 'Kim loß║íi n├áo sau ─æ├óy c├│ t├¡nh khß╗¡ mß║ính nhß║Ñt trong c├íc chß║Ñt d╞░ß╗¢i ─æ├óy?',
        opts: ['A. Fe', 'B. Cu', 'C. K', 'D. Ag'],
        ans: 'C',
        topic: '─Éß║íi c╞░╞íng kim loß║íi',
        explanation: 'Kali (K) ─æß╗⌐ng tr╞░ß╗¢c sß║»t, ─æß╗ông, bß║íc trong d├úy hoß║ít ─æß╗Öng h├│a hß╗ìc n├¬n c├│ t├¡nh khß╗¡ mß║ính nhß║Ñt.'
      },
      {
        q: 'Cho Fe t├íc dß╗Ñng vß╗¢i dung dß╗ïch HNOΓéâ lo├úng d╞░, sß║ún phß║⌐m muß╗æi sß║»t thu ─æ╞░ß╗úc l├á:',
        opts: ['A. Fe(NOΓéâ)Γéé', 'B. Fe(NOΓéâ)Γéâ', 'C. FeΓééOΓéâ', 'D. FeO'],
        ans: 'B',
        topic: 'Sß║»t v├á hß╗úp chß║Ñt sß║»t',
        explanation: 'V├¼ HNOΓéâ d╞░ n├¬n Fe bß╗ï oxi h├│a triß╗çt ─æß╗â l├¬n sß╗æ oxi h├│a cao nhß║Ñt l├á Fe┬│Γü║, tß║ío muß╗æi Fe(NOΓéâ)Γéâ.'
      }
    ]
  },
  {
    id: 'sinh', name: 'Sinh Hß╗ìc', emoji: '≡ƒÉó', color: '#6f4ab3',
    duration: 50, totalQuestions: 40, format: 'Trß║»c nghiß╗çm',
    pastExams: [
      { year: 2024, avg: 6.07, downloads: '78K', difficulty: 'Kh├│ vß╗½a' },
      { year: 2023, avg: 5.92, downloads: '95K', difficulty: 'Kh├│' },
      { year: 2022, avg: 5.02, downloads: '124K', difficulty: 'Rß║Ñt kh├│' },
      { year: 2021, avg: 5.51, downloads: '147K', difficulty: 'Kh├│' },
      { year: 2020, avg: 5.59, downloads: '168K', difficulty: 'Kh├│' }
    ],
    sampleQuestions: [
      {
        q: 'Trong c╞í chß║┐ di truyß╗ün cß║Ñp ph├ón tß╗¡ ß╗ƒ sinh vß║¡t nh├ón thß╗▒c, qu├í tr├¼nh phi├¬n m├ú xß║úy ra ß╗ƒ:',
        opts: ['A. Rib├┤x├┤m', 'B. Nh├ón tß║┐ b├áo', 'C. Tß║┐ b├áo chß║Ñt', 'D. Ti thß╗â'],
        ans: 'B',
        topic: 'C╞í chß║┐ di truyß╗ün biß║┐n dß╗ï',
        explanation: 'Qu├í tr├¼nh phi├¬n m├ú tß╗òng hß╗úp ARN tß╗½ mß║ích khu├┤n ADN diß╗àn ra trong nh├ón tß║┐ b├áo nh├ón thß╗▒c.'
      },
      {
        q: 'Theo Men─æen, ph├⌐p lai ─æ╞ín t├¡nh Aa ├ù Aa cho tß╗ë lß╗ç ph├ón ly kiß╗âu h├¼nh ß╗ƒ ─æß╗¥i con trß╗Öi ho├án to├án l├á:',
        opts: ['A. 1:1', 'B. 3:1', 'C. 1:2:1', 'D. 1:1:1:1'],
        ans: 'B',
        topic: 'Quy luß║¡t di truyß╗ün Men─æen',
        explanation: 'Lai Aa x Aa cho tß╗ë lß╗ç kiß╗âu gen 1AA : 2Aa : 1aa, t╞░╞íng ß╗⌐ng kiß╗âu h├¼nh 3 trß╗Öi : 1 lß║╖n (3:1).'
      },
      {
        q: 'Nh├ón tß╗æ tiß║┐n h├│a n├áo l├ám thay ─æß╗òi tß║ºn sß╗æ alen theo h╞░ß╗¢ng x├íc ─æß╗ïnh v├á c├│ ─æß╗ïnh h╞░ß╗¢ng?',
        opts: ['A. ─Éß╗Öt biß║┐n', 'B. Chß╗ìn lß╗ìc tß╗▒ nhi├¬n', 'C. Di nhß║¡p gen', 'D. Giao phß╗æi ngß║½u nhi├¬n'],
        ans: 'B',
        topic: 'Tiß║┐n h├│a',
        explanation: 'Chß╗ìn lß╗ìc tß╗▒ nhi├¬n ─æß╗ïnh h╞░ß╗¢ng tiß║┐n h├│a bß║▒ng c├ích ─æ├áo thß║úi kiß╗âu h├¼nh c├│ hß║íi v├á giß╗» lß║íi kiß╗âu h├¼nh c├│ lß╗úi.'
      }
    ]
  },
  {
    id: 'su', name: 'Lß╗ïch Sß╗¡', emoji: '≡ƒô£', color: '#c44747',
    duration: 50, totalQuestions: 40, format: 'Trß║»c nghiß╗çm',
    pastExams: [
      { year: 2024, avg: 5.79, downloads: '142K', difficulty: 'Trung b├¼nh' },
      { year: 2023, avg: 6.03, downloads: '167K', difficulty: 'Dß╗à h╞ín' },
      { year: 2022, avg: 6.34, downloads: '189K', difficulty: 'Dß╗à' },
      { year: 2021, avg: 4.97, downloads: '215K', difficulty: 'Kh├│ nhß║Ñt' },
      { year: 2020, avg: 5.19, downloads: '243K', difficulty: 'Kh├│' }
    ],
    sampleQuestions: [
      {
        q: '─Éß║úng Cß╗Öng sß║ún Viß╗çt Nam ch├¡nh thß╗⌐c ─æ╞░ß╗úc th├ánh lß║¡p v├áo ng├áy th├íng n─âm n├áo?',
        opts: ['A. 03/02/1930', 'B. 02/09/1945', 'C. 19/05/1941', 'D. 22/12/1944'],
        ans: 'A',
        topic: 'Lß╗ïch sß╗¡ VN 1930-1945',
        explanation: '─Éß║úng Cß╗Öng sß║ún Viß╗çt Nam th├ánh lß║¡p ng├áy 3/2/1930 tß║íi Hß╗Öi nghß╗ï hß╗úp nhß║Ñt tß╗ò chß╗⌐c Cß╗Öng sß║ún hß╗ìp ß╗ƒ H╞░╞íng Cß║úng d╞░ß╗¢i sß╗▒ chß╗º tr├¼ cß╗ºa Nguyß╗àn ├üi Quß╗æc.'
      },
      {
        q: 'Chiß║┐n thß║»ng ─Éiß╗çn Bi├¬n Phß╗º (1954) c├│ ├╜ ngh─⌐a quyß║┐t ─æß╗ïnh lß╗ïch sß╗¡ trß╗▒c tiß║┐p n├áo sau ─æ├óy?',
        opts: ['A. Kß║┐t th├║c chiß║┐n tranh thß║┐ giß╗¢i thß╗⌐ hai', 'B. Buß╗Öc thß╗▒c d├ón Ph├íp k├╜ Hiß╗çp ─æß╗ïnh Gi╞ínev╞í chß║Ñm dß╗⌐t chiß║┐n tranh', 'C. Thß╗æng nhß║Ñt ─æß║Ñt n╞░ß╗¢c hai miß╗ün Nam Bß║»c', 'D. Kß║┐t th├║c cß╗Ñc diß╗çn Chiß║┐n tranh lß║ính'],
        ans: 'B',
        topic: 'Kh├íng chiß║┐n chß╗æng Ph├íp',
        explanation: 'Thß║»ng lß╗úi qu├ón sß╗▒ ß╗ƒ ─Éiß╗çn Bi├¬n Phß╗º trß╗▒c tiß║┐p ─æß║¡p tan ├╜ ch├¡ x├óm l╞░ß╗úc cß╗ºa Ph├íp, buß╗Öc ch├║ng k├╜ hiß╗çp ─æß╗ïnh Gi╞ínev╞í r├║t qu├ón vß╗ü n╞░ß╗¢c.'
      },
      {
        q: 'Tß╗ò chß╗⌐c quß╗æc tß║┐ Li├¬n hß╗úp quß╗æc (UN) ─æ╞░ß╗úc ch├¡nh thß╗⌐c th├ánh lß║¡p v├áo n─âm n├áo?',
        opts: ['A. 1944', 'B. 1945', 'C. 1946', 'D. 1947'],
        ans: 'B',
        topic: 'Lß╗ïch sß╗¡ thß║┐ giß╗¢i hiß╗çn ─æß║íi',
        explanation: 'Li├¬n hß╗úp quß╗æc ch├¡nh thß╗⌐c th├ánh lß║¡p n─âm 1945 sau khi Hiß║┐n ch╞░╞íng Li├¬n hß╗úp quß╗æc ─æ╞░ß╗úc ─æa sß╗æ c├íc quß╗æc gia th├ánh vi├¬n ph├¬ chuß║⌐n.'
      }
    ]
  },
  {
    id: 'dia', name: '─Éß╗ïa L├╜', emoji: '≡ƒîì', color: '#2d8659',
    duration: 50, totalQuestions: 40, format: 'Trß║»c nghiß╗çm',
    pastExams: [
      { year: 2024, avg: 6.45, downloads: '138K', difficulty: 'Dß╗à' },
      { year: 2023, avg: 6.15, downloads: '162K', difficulty: 'Trung b├¼nh' },
      { year: 2022, avg: 6.68, downloads: '185K', difficulty: 'Dß╗à' },
      { year: 2021, avg: 6.96, downloads: '208K', difficulty: 'Dß╗à h╞ín' },
      { year: 2020, avg: 6.78, downloads: '231K', difficulty: 'Dß╗à' }
    ],
    sampleQuestions: [
      {
        q: 'V├╣ng kinh tß║┐ n├áo c├│ diß╗çn t├¡ch tß╗▒ nhi├¬n lß╗¢n nhß║Ñt cß║ú n╞░ß╗¢c ta hiß╗çn nay?',
        opts: ['A. Trung du v├á miß╗ün n├║i Bß║»c Bß╗Ö', 'B. T├óy Nguy├¬n', 'C. ─É├┤ng Nam Bß╗Ö', 'D. ─Éß╗ông bß║▒ng s├┤ng Cß╗¡u Long'],
        ans: 'A',
        topic: '─Éß╗ïa l├╜ v├╣ng kinh tß║┐',
        explanation: 'Trung du v├á miß╗ün n├║i Bß║»c Bß╗Ö l├á v├╣ng kinh tß║┐ c├│ diß╗çn t├¡ch lß╗¢n nhß║Ñt n╞░ß╗¢c ta (khoß║úng h╞ín 95 ngh├¼n km┬▓).'
      },
      {
        q: 'Dß╗▒a v├áo Atlat ─Éß╗ïa l├╜ VN, tß╗ënh n├áo cß╗ºa n╞░ß╗¢c ta c├│ diß╗çn t├¡ch trß╗ông c├óy c├á ph├¬ lß╗¢n nhß║Ñt?',
        opts: ['A. Gia Lai', 'B. ─Éß║»k Lß║»k', 'C. L├óm ─Éß╗ông', 'D. Kon Tum'],
        ans: 'B',
        topic: '─Éß╗ïa l├╜ n├┤ng nghiß╗çp',
        explanation: '─Éß║»k Lß║»k l├á tß╗ënh dß║½n ─æß║ºu cß║ú n╞░ß╗¢c vß╗ü diß╗çn t├¡ch v├á sß║ún l╞░ß╗úng c├á ph├¬ trß╗ông ─æ╞░ß╗úc ß╗ƒ n╞░ß╗¢c ta.'
      },
      {
        q: 'Loß║íi biß╗âu ─æß╗ô n├áo th├¡ch hß╗úp nhß║Ñt ─æß╗â thß╗â hiß╗çn sß╗▒ chuyß╗ân dß╗ïch c╞í cß║Ñu ng├ánh kinh tß║┐ n╞░ß╗¢c ta giai ─æoß║ín 2010 - 2020?',
        opts: ['A. Cß╗Öt chß╗ông', 'B. ─É╞░ß╗¥ng', 'C. Tr├▓n', 'D. Miß╗ün'],
        ans: 'D',
        topic: 'Kß╗╣ n─âng Atlat v├á biß╗âu ─æß╗ô',
        explanation: 'Biß╗âu ─æß╗ô miß╗ün d├╣ng th├¡ch hß╗úp nhß║Ñt ─æß╗â thß╗â hiß╗çn ─æß╗Öng th├íi chuyß╗ân dß╗ïch c╞í cß║Ñu cß╗ºa mß╗Öt ─æß╗æi t╞░ß╗úng qua nhiß╗üu n─âm (>= 4 n─âm).'
      }
    ]
  },
  {
    id: 'gdcd', name: 'GDCD', emoji: 'ΓÜû∩╕Å', color: '#d4a042',
    duration: 50, totalQuestions: 40, format: 'Trß║»c nghiß╗çm',
    pastExams: [
      { year: 2024, avg: 8.16, downloads: '101K', difficulty: 'Dß╗à' },
      { year: 2023, avg: 8.29, downloads: '124K', difficulty: 'Dß╗à' },
      { year: 2022, avg: 8.03, downloads: '146K', difficulty: 'Dß╗à' },
      { year: 2021, avg: 8.37, downloads: '169K', difficulty: 'Rß║Ñt dß╗à' },
      { year: 2020, avg: 8.14, downloads: '189K', difficulty: 'Dß╗à' }
    ],
    sampleQuestions: [
      {
        q: 'Quyß╗ün b├¼nh ─æß║│ng cß╗ºa c├┤ng d├ón tr╞░ß╗¢c ph├íp luß║¡t ─æ╞░ß╗úc thß╗â hiß╗çn th├┤ng qua ├╜ n├áo sau ─æ├óy?',
        opts: ['A. Mß╗ìi c├┤ng d├ón c├│ quyß╗ün ngang nhau', 'B. Quyß╗ün v├á ngh─⌐a vß╗Ñ kh├┤ng bß╗ï ph├ón biß╗çt ─æß╗æi xß╗¡', 'C. Vi phß║ím ph├íp luß║¡t ─æß╗üu bß╗ï xß╗¡ l├╜ nghi├¬m minh', 'D. Cß║ú B v├á C ─æß╗üu ─æ├║ng'],
        ans: 'D',
        topic: 'B├¼nh ─æß║│ng tr╞░ß╗¢c ph├íp luß║¡t',
        explanation: 'B├¼nh ─æß║│ng tr╞░ß╗¢c ph├íp luß║¡t ngh─⌐a l├á c├┤ng d├ón b├¼nh ─æß║│ng vß╗ü quyß╗ün v├á ngh─⌐a vß╗Ñ ─æß╗ông thß╗¥i b├¼nh ─æß║│ng vß╗ü tr├ích nhiß╗çm ph├íp l├╜ khi vi phß║ím.'
      },
      {
        q: 'Ng╞░ß╗¥i tß╗½ ─æß╗º bao nhi├¬u tuß╗òi trß╗ƒ l├¬n phß║úi tß╗▒ chß╗ïu tr├ích nhiß╗çm h├¼nh sß╗▒ vß╗ü mß╗ìi loß║íi tß╗Öi phß║ím do m├¼nh g├óy ra?',
        opts: ['A. 14 tuß╗òi', 'B. 16 tuß╗òi', 'C. 18 tuß╗òi', 'D. 20 tuß╗òi'],
        ans: 'B',
        topic: 'Tr├ích nhiß╗çm h├¼nh sß╗▒',
        explanation: 'Theo Bß╗Ö luß║¡t H├¼nh sß╗▒ Viß╗çt Nam, ng╞░ß╗¥i tß╗½ ─æß╗º 16 tuß╗òi trß╗ƒ l├¬n phß║úi chß╗ïu tr├ích nhiß╗çm h├¼nh sß╗▒ vß╗ü mß╗ìi tß╗Öi phß║ím.'
      },
      {
        q: 'Quyß╗ün tß╗▒ do kinh doanh cß╗ºa c├┤ng d├ón ─æ╞░ß╗úc hiß╗âu l├á c├┤ng d├ón ─æ╞░ß╗úc ph├⌐p:',
        opts: ['A. Tß╗▒ do kinh doanh tß║Ñt cß║ú c├íc mß║╖t h├áng ─æß╗â sinh lß╗¥i', 'B. Tß╗▒ do lß╗▒a chß╗ìn ng├ánh nghß╗ü v├á h├¼nh thß╗⌐c kinh doanh m├á ph├íp luß║¡t kh├┤ng cß║Ñm', 'C. Sß║ún xuß║Ñt v├á b├ín h├áng kh├┤ng cß║ºn nß╗Öp thuß║┐', 'D. Tß╗▒ do lß║¡p doanh nghiß╗çp kh├┤ng cß║ºn khai b├ío ─æ─âng k├╜'],
        ans: 'B',
        topic: 'Quyß╗ün tß╗▒ do kinh doanh',
        explanation: 'Tß╗▒ do kinh doanh tß╗⌐c l├á ─æ╞░ß╗úc kinh doanh bß║Ñt kß╗│ ng├ánh nghß╗ü n├áo m├á luß║¡t ph├íp quß╗æc gia kh├┤ng ng─ân cß║Ñm, ─æß╗ông thß╗¥i phß║úi thß╗▒c hiß╗çn ngh─⌐a vß╗Ñ ─æ├│ng thuß║┐ ─æß║ºy ─æß╗º.'
      }
    ]
  }
];

const ALL_YEARS = [2024, 2023, 2022, 2021, 2020, 2019];
const DIFFICULTIES = ['Tß║Ñt cß║ú', 'Dß╗à', 'Trung b├¼nh', 'Kh├│', 'Rß║Ñt kh├│'];

// ============================================================
// COMPONENT
// ============================================================
export default function ExamBankPage({ currentUser, navigateTo }) {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Tß║Ñt cß║ú');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewExam, setPreviewExam] = useState(null);

  // Quick Practice States
  const [activeTabMode, setActiveTabMode] = useState('preview'); // 'preview' or 'practice'
  const [practiceAnswers, setPracticeAnswers] = useState({}); // { 0: 'A', 1: 'B' }
  const [isPracticeSubmitted, setIsPracticeSubmitted] = useState(false);
  const [practiceTimeRemaining, setPracticeTimeRemaining] = useState(300); // 5 minutes (300s)
  const [practiceTimeSpent, setPracticeTimeSpent] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [expandedExplanation, setExpandedExplanation] = useState({});

  // Reset practice states when opening a new exam preview
  useEffect(() => {
    if (previewExam) {
      setActiveTabMode('preview');
      setPracticeAnswers({});
      setIsPracticeSubmitted(false);
      setPracticeTimeRemaining(300);
      setPracticeTimeSpent(0);
      setIsTimerRunning(true);
      setExpandedExplanation({});
    }
  }, [previewExam]);

  // Timer countdown hook
  useEffect(() => {
    let interval = null;
    if (previewExam && activeTabMode === 'practice' && isTimerRunning && !isPracticeSubmitted) {
      interval = setInterval(() => {
        setPracticeTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsPracticeSubmitted(true);
            return 0;
          }
          return prev - 1;
        });
        setPracticeTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [previewExam, activeTabMode, isTimerRunning, isPracticeSubmitted]);

  const handleSavePracticeResult = () => {
    if (!currentUser) {
      alert("Bß║ín cß║ºn ─æ─âng nhß║¡p ─æß╗â l╞░u kß║┐t quß║ú v├áo hß╗ìc bß║í hß╗ìc sinh.");
      return;
    }
    
    const totalQ = previewExam.sampleQuestions.length;
    let scoreVal = 0;
    let correctCount = 0;
    
    if (previewExam.subjectId === 'van') {
      scoreVal = 8.5;
      correctCount = totalQ;
    } else {
      previewExam.sampleQuestions.forEach((sq, idx) => {
        if (practiceAnswers[idx] === sq.ans) {
          correctCount++;
        }
      });
      scoreVal = Math.round((correctCount / totalQ) * 10 * 10) / 10;
    }

    const newSubmission = {
      id: Date.now(),
      email: currentUser.email,
      testName: `Luyß╗çn tß║¡p nhanh: ─Éß╗ü ${previewExam.subjectName} ${previewExam.year}`,
      score: scoreVal,
      correct: correctCount,
      total: totalQ,
      failedTopics: [],
      date: new Date().toLocaleDateString()
    };

    try {
      const existingSubmissions = JSON.parse(localStorage.getItem('app_submissions')) || [];
      localStorage.setItem('app_submissions', JSON.stringify([newSubmission, ...existingSubmissions]));
      
      // Dispatch storage event to alert other components
      window.dispatchEvent(new Event('storage'));
      
      alert("≡ƒÄë ─É├ú l╞░u kß║┐t quß║ú luyß╗çn tß║¡p v├áo hß╗ìc bß║í hß╗ìc sinh th├ánh c├┤ng!");
    } catch (err) {
      console.error("Lß╗ùi khi l╞░u kß║┐t quß║ú luyß╗çn tß║¡p:", err);
      alert("Kh├┤ng thß╗â l╞░u kß║┐t quß║ú luyß╗çn tß║¡p v├áo hß╗ìc bß║í.");
    }
  };

  // Build flat list of all exams
  const allExams = useMemo(() => {
    const list = [];
    SUBJECTS.forEach(subj => {
      subj.pastExams.forEach(exam => {
        list.push({
          ...exam,
          subjectId: subj.id,
          subjectName: subj.name,
          subjectEmoji: subj.emoji,
          subjectColor: subj.color,
          duration: subj.duration,
          totalQuestions: subj.totalQuestions,
          format: subj.format,
          sampleQuestions: subj.sampleQuestions
        });
      });
    });
    return list;
  }, []);

  // Filtered exams
  const filteredExams = useMemo(() => {
    return allExams.filter(exam => {
      if (selectedSubject !== 'all' && exam.subjectId !== selectedSubject) return false;
      if (selectedYear !== 'all' && exam.year !== selectedYear) return false;
      if (selectedDifficulty !== 'Tß║Ñt cß║ú') {
        const norm = exam.difficulty.toLowerCase();
        const filter = selectedDifficulty.toLowerCase();
        if (filter === 'dß╗à' && !norm.includes('dß╗à')) return false;
        if (filter === 'trung b├¼nh' && !norm.includes('trung b├¼nh')) return false;
        if (filter === 'kh├│' && !['kh├│', 'kh├│ vß╗½a', 'kh├│ nhß║Ñt'].some(k => norm.includes(k))) return false;
        if (filter === 'rß║Ñt kh├│' && norm !== 'rß║Ñt kh├│' && norm !== 'kh├│ nhß║Ñt') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!exam.subjectName.toLowerCase().includes(q) && !String(exam.year).includes(q)) return false;
      }
      return true;
    });
  }, [allExams, selectedSubject, selectedYear, selectedDifficulty, searchQuery]);

  // Stats
  const totalExams = allExams.length;
  const totalDownloads = allExams.reduce((acc, e) => acc + parseFloat(e.downloads.replace('K', '')) * 1000, 0);

  const handleDownload = (exam) => {
    const filename = `De_thi_${exam.subjectName.replace(/\s/g, '_')}_${exam.year}_THPTQG.pdf`;
    alert(`≡ƒôÑ ─Éang tß║úi xuß╗æng: ${filename}\n\n(─É├óy l├á bß║ún demo ΓÇö file thß╗▒c tß║┐ sß║╜ ─æ╞░ß╗úc cung cß║Ñp khi hß╗ç thß╗æng t├¡ch hß╗úp kho t├ái liß╗çu)`);
  };

  const isGuest = !currentUser;

  return (
    <div className="exambank-page">
      {/* Guest Header */}
      {isGuest && (
        <header className="exambank-guest-header">
          <div className="exambank-guest-header__logo" onClick={() => navigateTo('/')}>
            <div className="exambank-guest-header__logo-icon">E</div>
            <span>EduPath <em>AI</em></span>
          </div>
          <div className="exambank-guest-header__actions">
            <button className="exambank-guest-header__btn exambank-guest-header__btn--back" onClick={() => navigateTo('/')}>
              <HiArrowLeft style={{ marginRight: 4 }} /> Trang chß╗º
            </button>
            <button
              className="exambank-guest-header__btn exambank-guest-header__btn--login"
              onClick={() => {
                navigateTo('/');
                setTimeout(() => window.dispatchEvent(new CustomEvent('edupath-auth-redirect', { detail: { mode: 'login' } })), 100);
              }}
            >
              ─É─âng nhß║¡p
            </button>
            <button
              className="exambank-guest-header__btn exambank-guest-header__btn--register"
              onClick={() => {
                navigateTo('/');
                setTimeout(() => window.dispatchEvent(new CustomEvent('edupath-auth-redirect', { detail: { mode: 'register' } })), 100);
              }}
            >
              ─É─âng k├╜ miß╗àn ph├¡
            </button>
          </div>
        </header>
      )}

      {/* Hero */}
      <div className="exambank-hero">
        <div className="exambank-hero__badge">
          <HiAcademicCap /> Ng├ón h├áng ─æß╗ü thi ch├¡nh thß╗⌐c
        </div>
        <h1>
          Ng├ón h├áng ─æß╗ü thi <span>THPT Quß╗æc Gia</span>
        </h1>
        <p className="exambank-hero__desc">
          Tß╗òng hß╗úp to├án bß╗Ö ─æß╗ü thi ch├¡nh thß╗⌐c 9 m├┤n tß╗½ n─âm 2019 ─æß║┐n 2024 k├¿m ─æ├íp ├ín chi tiß║┐t.
          Xem trß╗▒c tuyß║┐n hoß║╖c tß║úi vß╗ü luyß╗çn tß║¡p ΓÇö ho├án to├án miß╗àn ph├¡.
        </p>

        <div className="exambank-stats">
          <div className="exambank-stat">
            <span className="exambank-stat__number">{totalExams}</span>
            <div className="exambank-stat__label">─Éß╗ü thi ch├¡nh thß╗⌐c</div>
          </div>
          <div className="exambank-stat">
            <span className="exambank-stat__number">9</span>
            <div className="exambank-stat__label">M├┤n thi</div>
          </div>
          <div className="exambank-stat">
            <span className="exambank-stat__number">{(totalDownloads / 1000000).toFixed(1)}M+</span>
            <div className="exambank-stat__label">L╞░ß╗út tß║úi vß╗ü</div>
          </div>
          <div className="exambank-stat">
            <span className="exambank-stat__number">6</span>
            <div className="exambank-stat__label">N─âm (2019ΓÇô2024)</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="exambank-filters">
        <div className="exambank-filters__inner">
          {/* Subject filter */}
          <div className="exambank-filters__row">
            <span className="exambank-filters__label">≡ƒôÜ M├┤n</span>
            <div className="exambank-filters__chips">
              <button
                className={`exambank-chip ${selectedSubject === 'all' ? 'exambank-chip--active' : ''}`}
                onClick={() => setSelectedSubject('all')}
              >
                Tß║Ñt cß║ú
              </button>
              {SUBJECTS.map(s => (
                <button
                  key={s.id}
                  className={`exambank-chip ${selectedSubject === s.id ? 'exambank-chip--active' : ''}`}
                  style={selectedSubject === s.id ? { background: s.color, borderColor: s.color } : {}}
                  onClick={() => setSelectedSubject(s.id)}
                >
                  {s.emoji} {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="exambank-filters__divider" />

          {/* Year + Difficulty + Search */}
          <div className="exambank-filters__row">
            <span className="exambank-filters__label">≡ƒôà N─âm</span>
            <div className="exambank-filters__chips">
              <button
                className={`exambank-chip ${selectedYear === 'all' ? 'exambank-chip--active' : ''}`}
                onClick={() => setSelectedYear('all')}
              >
                Tß║Ñt cß║ú
              </button>
              {ALL_YEARS.map(y => (
                <button
                  key={y}
                  className={`exambank-chip ${selectedYear === y ? 'exambank-chip--active' : ''}`}
                  onClick={() => setSelectedYear(y)}
                >
                  {y}
                </button>
              ))}
            </div>

            <span className="exambank-filters__label" style={{ marginLeft: 8 }}>ΓÜí ─Éß╗Ö kh├│</span>
            <div className="exambank-filters__chips">
              {DIFFICULTIES.map(d => (
                <button
                  key={d}
                  className={`exambank-chip ${selectedDifficulty === d ? 'exambank-chip--active' : ''}`}
                  onClick={() => setSelectedDifficulty(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="exambank-filters__divider" />

          <div className="exambank-filters__row">
            <div className="exambank-filters__search">
              <HiSearch className="exambank-filters__search-icon" />
              <input
                type="text"
                placeholder="T├¼m kiß║┐m ─æß╗ü thi theo t├¬n m├┤n hoß║╖c n─âm..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <span className="exambank-filters__count">
              Hiß╗ân thß╗ï {filteredExams.length}/{totalExams} ─æß╗ü thi
            </span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="exambank-content">
        {filteredExams.length === 0 ? (
          <div className="exambank-empty">
            <div className="exambank-empty__icon">≡ƒô¡</div>
            <h3 className="exambank-empty__title">Kh├┤ng t├¼m thß║Ñy ─æß╗ü thi</h3>
            <p className="exambank-empty__desc">H├úy thß╗¡ thay ─æß╗òi bß╗Ö lß╗ìc hoß║╖c tß╗½ kh├│a t├¼m kiß║┐m.</p>
          </div>
        ) : (
          <div className="exambank-grid">
            {filteredExams.map((exam, idx) => (
              <article
                key={`${exam.subjectId}-${exam.year}-${idx}`}
                className="exambank-card"
                style={{ '--card-color': exam.subjectColor }}
              >
                <div className="exambank-card__header">
                  <div className="exambank-card__year-badge" style={{ background: exam.subjectColor }}>
                    <span>{exam.year}</span>
                    <small>THPT QG</small>
                  </div>
                  <div className="exambank-card__info">
                    <div className="exambank-card__subject-tag">
                      {exam.subjectEmoji} {exam.subjectName}
                    </div>
                    <h3 className="exambank-card__title">
                      ─Éß╗ü thi ch├¡nh thß╗⌐c {exam.subjectName} {exam.year}
                    </h3>
                    <p className="exambank-card__subtitle">
                      {exam.format} ΓÇó {exam.totalQuestions} c├óu ΓÇó {exam.duration} ph├║t
                    </p>
                  </div>
                </div>

                <div className="exambank-card__stats">
                  <div className="exambank-card__stat">
                    <span className="exambank-card__stat-value">{exam.avg}/10</span>
                    <div className="exambank-card__stat-label">─Éiß╗âm TB</div>
                  </div>
                  <div className="exambank-card__stat">
                    <span className="exambank-card__stat-value">{exam.difficulty}</span>
                    <div className="exambank-card__stat-label">─Éß╗Ö kh├│</div>
                  </div>
                  <div className="exambank-card__stat">
                    <span className="exambank-card__stat-value">{exam.downloads}</span>
                    <div className="exambank-card__stat-label">L╞░ß╗út tß║úi</div>
                  </div>
                </div>

                <div className="exambank-card__actions">
                  <button
                    className="exambank-card__btn exambank-card__btn--view"
                    onClick={() => setPreviewExam(exam)}
                  >
                    <HiEye /> Xem ─æß╗ü
                  </button>
                  <button
                    className="exambank-card__btn exambank-card__btn--download"
                    onClick={() => handleDownload(exam)}
                  >
                    <HiDownload /> Tß║úi vß╗ü
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewExam && (
        <div className="exambank-modal-overlay" onClick={() => setPreviewExam(null)}>
          <div className="exambank-modal" onClick={e => e.stopPropagation()}>
            <div className="exambank-modal__header">
              <h2>
                {previewExam.subjectEmoji} ─Éß╗ü thi {previewExam.subjectName} {previewExam.year}
                <span style={{ background: previewExam.subjectColor }}>{previewExam.format}</span>
              </h2>
              <button className="exambank-modal__close" onClick={() => setPreviewExam(null)}>
                <HiX />
              </button>
            </div>

            <div className="exambank-modal__body">
              {/* Tabs */}
              <div className="exambank-modal__tabs" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #f0ebe1', marginBottom: '20px', paddingBottom: '10px' }}>
                <button
                  className={`exambank-modal__tab ${activeTabMode === 'preview' ? 'exambank-modal__tab--active' : ''}`}
                  onClick={() => setActiveTabMode('preview')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    color: activeTabMode === 'preview' ? 'var(--primary, #059669)' : '#64748b',
                    borderBottom: activeTabMode === 'preview' ? '3px solid var(--primary, #059669)' : '3px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  ≡ƒôû Xem c├óu hß╗Åi mß║½u
                </button>
                <button
                  className={`exambank-modal__tab ${activeTabMode === 'practice' ? 'exambank-modal__tab--active' : ''}`}
                  onClick={() => setActiveTabMode('practice')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    color: activeTabMode === 'practice' ? 'var(--primary, #059669)' : '#64748b',
                    borderBottom: activeTabMode === 'practice' ? '3px solid var(--primary, #059669)' : '3px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  ΓÜí Luyß╗çn tß║¡p Online
                </button>
              </div>

              {activeTabMode === 'preview' ? (
                <>
                  {/* Exam Info */}
                  <div className="exambank-modal__exam-info">
                    <div className="exambank-modal__exam-tag">
                      <HiClock /> Thß╗¥i gian: <strong>{previewExam.duration} ph├║t</strong>
                    </div>
                    <div className="exambank-modal__exam-tag">
                      <HiClipboardList /> Sß╗æ c├óu: <strong>{previewExam.totalQuestions} c├óu</strong>
                    </div>
                    <div className="exambank-modal__exam-tag">
                      <HiChartBar /> ─Éiß╗âm TB: <strong>{previewExam.avg}/10</strong>
                    </div>
                    <div className="exambank-modal__exam-tag">
                      <HiSparkles /> ─Éß╗Ö kh├│: <strong>{previewExam.difficulty}</strong>
                    </div>
                  </div>

                  {/* Sample Questions */}
                  <div className="exambank-modal__section">
                    <h3>
                      <HiDocumentText /> C├óu hß╗Åi mß║½u (tr├¡ch ─æß╗ü thi ch├¡nh thß╗⌐c)
                    </h3>
                    <ul className="exambank-modal__question-list">
                      {previewExam.sampleQuestions.map((sq, i) => (
                        <li key={i} className="exambank-modal__question">
                          <span className="exambank-modal__question-num">C├óu {i + 1}.</span>
                          {sq.q}
                          {sq.opts.length > 0 && (
                            <div className="exambank-modal__question-options">
                              {sq.opts.map((opt, j) => (
                                <div key={j} className="exambank-modal__question-opt">{opt}</div>
                              ))}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Notice */}
                  <div style={{
                    background: '#fffbeb',
                    border: '1px solid #fbbf24',
                    borderRadius: 12,
                    padding: '14px 18px',
                    fontSize: 13,
                    color: '#92400e',
                    lineHeight: 1.6,
                    marginBottom: 20
                  }}>
                    <strong>≡ƒôî L╞░u ├╜:</strong> ─É├óy l├á c├íc c├óu hß╗Åi mß║½u tr├¡ch tß╗½ ─æß╗ü thi ch├¡nh thß╗⌐c. Tß║úi vß╗ü file PDF ─æß╗â xem to├án bß╗Ö {previewExam.totalQuestions} c├óu k├¿m ─æ├íp ├ín chi tiß║┐t v├á h╞░ß╗¢ng dß║½n giß║úi.
                  </div>

                  {/* Actions */}
                  <div className="exambank-modal__actions">
                    <button className="exambank-modal__btn exambank-modal__btn--secondary" onClick={() => setPreviewExam(null)}>
                      ─É├│ng
                    </button>
                    <button className="exambank-modal__btn exambank-modal__btn--primary" onClick={() => handleDownload(previewExam)}>
                      <HiDownload /> Tß║úi ─æß╗ü + ─æ├íp ├ín (PDF)
                    </button>
                  </div>
                </>
              ) : (
                /* PRACTICE MODE */
                <div>
                  {!isPracticeSubmitted ? (
                    <div>
                      {/* Practice Header / Timer Panel */}
                      <div className="exambank-practice-timer-panel" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 14,
                        padding: '12px 20px',
                        marginBottom: 20
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 18 }}>ΓÅ▒∩╕Å</span>
                          <span style={{ fontSize: 15, fontWeight: 700, fontFamily: 'monospace', color: practiceTimeRemaining <= 60 ? '#ef4444' : '#1e293b' }}>
                            Thß╗¥i gian c├▓n lß║íi: {Math.floor(practiceTimeRemaining / 60)}:{String(practiceTimeRemaining % 60).padStart(2, '0')}
                          </span>
                          <button
                            onClick={() => setIsTimerRunning(!isTimerRunning)}
                            style={{
                              background: '#fff',
                              border: '1px solid #cbd5e1',
                              borderRadius: 6,
                              padding: '2px 8px',
                              fontSize: 12,
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                          >
                            {isTimerRunning ? 'ΓÅ╕∩╕Å Tß║ím dß╗½ng' : 'Γû╢∩╕Å Tiß║┐p tß╗Ñc'}
                          </button>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>
                            Tiß║┐n ─æß╗Ö: {Object.keys(practiceAnswers).length} / {previewExam.sampleQuestions.length} c├óu
                          </span>
                        </div>
                      </div>

                      {!isTimerRunning ? (
                        <div style={{
                          textAlign: 'center',
                          padding: '40px 20px',
                          border: '2px dashed #cbd5e1',
                          borderRadius: 16,
                          background: '#f8fafc',
                          marginBottom: 20
                        }}>
                          <span style={{ fontSize: 32 }}>ΓÅ╕∩╕Å</span>
                          <h4 style={{ margin: '10px 0 4px', fontSize: 16, fontWeight: 700, color: '#1e293b' }}>B├ái l├ám ─æang tß║ím dß╗½ng</h4>
                          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Nß╗Öi dung c├óu hß╗Åi ─æ├ú ß║⌐n ─æi. Bß║Ñm "Tiß║┐p tß╗Ñc" ß╗ƒ tr├¬n ─æß╗â tiß║┐p tß╗Ñc l├ám b├ái.</p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
                          {previewExam.sampleQuestions.map((sq, idx) => {
                            const isEssay = previewExam.subjectId === 'van';
                            const userAns = practiceAnswers[idx] || '';

                            return (
                              <div
                                key={idx}
                                style={{
                                  background: '#faf8f4',
                                  border: '1px solid #e8e2d6',
                                  borderRadius: 14,
                                  padding: 16,
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                                }}
                              >
                                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                                  <span style={{
                                    background: 'var(--primary, #059669)',
                                    color: '#fff',
                                    borderRadius: 6,
                                    padding: '2px 8px',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    height: 'fit-content'
                                  }}>
                                    C├óu {idx + 1}
                                  </span>
                                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', lineHeight: 1.5 }}>
                                    {sq.q}
                                  </span>
                                </div>

                                {isEssay ? (
                                  <div>
                                    <textarea
                                      className="form-control"
                                      placeholder="Viß║┐t b├ái l├ám tß╗▒ luß║¡n cß╗ºa bß║ín tß║íi ─æ├óy (tß╗æi thiß╗âu 100 tß╗½ ─æß╗â nhß║¡n phß║ún hß╗ôi tß╗æt nhß║Ñt)..."
                                      value={userAns}
                                      onChange={(e) => setPracticeAnswers(prev => ({ ...prev, [idx]: e.target.value }))}
                                      style={{
                                        width: '100%',
                                        minHeight: 120,
                                        fontSize: 13.5,
                                        padding: 12,
                                        borderRadius: 10,
                                        border: '1.5px solid #e2e8f0',
                                        outline: 'none',
                                        fontFamily: 'inherit',
                                        lineHeight: 1.5,
                                        resize: 'vertical'
                                      }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#64748b', marginTop: 4 }}>
                                      <span>Khuy├¬n d├╣ng: Viß║┐t mß║ích lß║íc, ─æß║ºy ─æß╗º luß║¡n ─æiß╗âm.</span>
                                      <span>─Éß╗Ö d├ái: {userAns.trim() ? userAns.trim().split(/\s+/).length : 0} tß╗½</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    {sq.opts.map((opt, optIdx) => {
                                      const letter = opt.charAt(0);
                                      const isSelected = userAns === letter;

                                      return (
                                        <button
                                          key={optIdx}
                                          onClick={() => setPracticeAnswers(prev => ({ ...prev, [idx]: letter }))}
                                          style={{
                                            textAlign: 'left',
                                            padding: '10px 14px',
                                            borderRadius: 8,
                                            border: isSelected ? '2px solid var(--primary, #059669)' : '1.5px solid #cbd5e1',
                                            background: isSelected ? 'color-mix(in srgb, var(--primary, #059669) 8%, white)' : '#fff',
                                            color: isSelected ? 'var(--primary, #059669)' : '#475569',
                                            fontSize: 13,
                                            fontWeight: isSelected ? 700 : 500,
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease'
                                          }}
                                        >
                                          {opt}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="exambank-modal__actions" style={{ borderTop: '1px solid #f0ebe1', paddingTop: 16 }}>
                        <button className="exambank-modal__btn exambank-modal__btn--secondary" onClick={() => {
                          if (confirm("Hß╗ºy bß╗Å luyß╗çn tß║¡p? C├íc c├óu ─æ├ú chß╗ìn sß║╜ bß╗ï x├│a.")) {
                            setActiveTabMode('preview');
                          }
                        }}>
                          Hß╗ºy
                        </button>
                        <button
                          className="exambank-modal__btn exambank-modal__btn--primary"
                          onClick={() => {
                            if (Object.keys(practiceAnswers).length === 0) {
                              alert("Vui l├▓ng trß║ú lß╗¥i ├¡t nhß║Ñt mß╗Öt c├óu hß╗Åi tr╞░ß╗¢c khi nß╗Öp b├ái!");
                              return;
                            }
                            setIsPracticeSubmitted(true);
                          }}
                          disabled={!isTimerRunning}
                          style={{ background: 'linear-gradient(135deg, #059669, #10b981)', opacity: isTimerRunning ? 1 : 0.6 }}
                        >
                          ≡ƒÜÇ Nß╗Öp b├ái thi
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* SUBMITTED PRACTICE RESULTS REPORT */
                    <div>
                      {/* Result summary dashboard */}
                      {(() => {
                        const totalQ = previewExam.sampleQuestions.length;
                        let correctCount = 0;
                        let scoreVal = 0;
                        let isEssay = previewExam.subjectId === 'van';

                        if (!isEssay) {
                          previewExam.sampleQuestions.forEach((sq, idx) => {
                            if (practiceAnswers[idx] === sq.ans) correctCount++;
                          });
                          scoreVal = Math.round((correctCount / totalQ) * 10 * 10) / 10;
                        } else {
                          scoreVal = 8.5; // simulated essay score
                        }

                        // SVG stroke dash properties
                        const radius = 50;
                        const circum = 2 * Math.PI * radius;
                        const strokeDashoffset = circum - (scoreVal / 10) * circum;
                        
                        // Adaptive AI Feedback comments
                        let diagnosis = "";
                        let advice = [];
                        
                        if (isEssay) {
                          diagnosis = "Ch├║c mß╗½ng! B├ái l├ám tß╗▒ luß║¡n cß╗ºa bß║ín ─æ├ú ─æ╞░ß╗úc ghi nhß║¡n th├ánh c├┤ng. AI ─æ├ính gi├í lß║¡p luß║¡n cß╗ºa bß║ín c├│ t├¡nh thuyß║┐t phß╗Ñc cao, bß╗æ cß╗Ñc b├ái viß║┐t r├╡ r├áng, mß║ích lß║íc.";
                          advice = [
                            "─Éß╗ìc th├¬m b├ái mß║½u v├á d├án ├╜ chi tiß║┐t ß╗ƒ phß║ºn b├¬n d╞░ß╗¢i ─æß╗â ─æß╗æi chiß║┐u ├╜.",
                            "Tß║¡p trung r├¿n luyß╗çn ph├ón chia thß╗¥i gian viß║┐t ─æoß║ín x├ú hß╗Öi trong v├▓ng 20 ph├║t."
                          ];
                        } else if (scoreVal >= 8) {
                          diagnosis = `Xuß║Ñt sß║»c! Bß║ín ─æß║ít ─æiß╗âm sß╗æ ${scoreVal}/10 trong thß╗¥i gian l├ám b├ái ${Math.floor(practiceTimeSpent / 60)} ph├║t ${practiceTimeSpent % 60} gi├óy. Bß║ín ─æ├ú nß║»m rß║Ñt vß╗»ng c├íc chuy├¬n ─æß╗ü kiß║┐n thß╗⌐c cß╗ºa ─æß╗ü thi n├áy.`;
                          advice = [
                            "H├úy thß╗¡ tß║úi vß╗ü ─æß╗ü thi PDF ch├¡nh thß╗⌐c ─æß╗â luyß╗çn trß╗ìn vß║╣n 40-50 c├óu hß╗Åi kh├│ h╞ín.",
                            "Duy tr├¼ th├│i quen kiß╗âm tra kß╗╣ l╞░ß╗íng c├íc ─æ├íp ├ín tr╞░ß╗¢c khi bß║Ñm nß╗Öp b├ái ─æß╗â tr├ính sai s├│t nhß╗Å."
                          ];
                        } else if (scoreVal >= 5) {
                          diagnosis = `Kh├í tß╗æt! ─Éiß╗âm sß╗æ cß╗ºa bß║ín l├á ${scoreVal}/10. Bß║ín c├│ nß╗ün tß║úng c╞í bß║ún vß╗»ng nh╞░ng c├▓n mß╗Öt sß╗æ ─æiß╗âm ch╞░a hiß╗âu thß║Ñu ─æ├ío trong b├ái hß╗ìc hoß║╖c bß╗ï ─æ├ính lß╗½a bß╗ƒi bß║½y trß║»c nghiß╗çm.`;
                          advice = [
                            "─Éß╗ìc kß╗╣ phß║ºn lß╗¥i giß║úi chi tiß║┐t cho c├íc c├óu bß╗ï sai ß╗ƒ bß║úng b├¬n d╞░ß╗¢i.",
                            "Tham khß║úo th├¬m kh├│a hß╗ìc ├┤n tß║¡p li├¬n quan ─æß║┐n c├íc c├óu hß╗Åi hß╗òng trong Lß╗Ö tr├¼nh hß╗ìc AI."
                          ];
                        } else {
                          diagnosis = `Cß║únh b├ío! Bß║ín chß╗ë ─æß║ít ─æiß╗âm sß╗æ ${scoreVal}/10. Hß╗ç thß╗æng ph├ít hiß╗çn bß║ín bß╗ï hß╗òng kiß║┐n thß╗⌐c nghi├¬m trß╗ìng ß╗ƒ mß╗Öt sß╗æ chuy├¬n ─æß╗ü cß╗æt l├╡i cß╗ºa m├┤n hß╗ìc n├áy.`;
                          advice = [
                            "Vui l├▓ng nghi├¬n cß╗⌐u kß╗╣ lß╗¥i giß║úi chi tiß║┐t cß╗ºa tß╗½ng c├óu hß╗Åi.",
                            "D├ánh ├¡t nhß║Ñt 30 ph├║t ─æß╗â ├┤n tß║¡p lß║íi phß║ºn l├╜ thuyß║┐t li├¬n quan trong Kho hß╗ìc liß╗çu tr╞░ß╗¢c khi thi lß║íi."
                          ];
                        }

                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* Score header box */}
                            <div style={{
                              background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                              border: '2px solid #e8e2d6',
                              borderRadius: 18,
                              padding: 24,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-around',
                              flexWrap: 'wrap',
                              gap: 20
                            }}>
                              <div style={{ textAlign: 'center' }}>
                                <span style={{
                                  background: 'var(--primary, #059669)',
                                  color: '#fff',
                                  fontSize: 10,
                                  fontWeight: 800,
                                  padding: '4px 12px',
                                  borderRadius: 20,
                                  textTransform: 'uppercase'
                                }}>
                                  Hß╗ìc bß║í nhanh
                                </span>
                                <h3 style={{ fontSize: 18, fontWeight: 800, margin: '8px 0 2px', color: '#1a1a2e' }}>Kß║╛T QUß║ó ─Éß╗ÉI SO├üT</h3>
                                <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                                  Thß╗¥i gian l├ám b├ái: <strong>{Math.floor(practiceTimeSpent / 60)} ph├║t {practiceTimeSpent % 60} gi├óy</strong>
                                </p>
                              </div>

                              {/* Circular progress wheel SVG */}
                              <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="120" height="120" viewBox="0 0 120 120">
                                  <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#e2e8f0" strokeWidth="8" />
                                  <circle
                                    cx="60"
                                    cy="60"
                                    r={radius}
                                    fill="transparent"
                                    stroke={scoreVal >= 8 ? '#10b981' : (scoreVal >= 5 ? '#f59e0b' : '#ef4444')}
                                    strokeWidth="8"
                                    strokeDasharray={circum}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    transform="rotate(-90 60 60)"
                                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                                  />
                                </svg>
                                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <span style={{ fontSize: 24, fontWeight: 900, color: '#1e293b' }}>{scoreVal}</span>
                                  <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>─ÉIß╗éM</span>
                                </div>
                              </div>

                              <div style={{ maxWidth: 260 }}>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                                  <span style={{ fontSize: 14 }}>≡ƒÄ»</span>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                                    {isEssay ? 'Tß╗▒ luß║¡n: ─É├ú ho├án th├ánh' : `─É├║ng: ${correctCount}/${totalQ} c├óu`}
                                  </span>
                                </div>
                                <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                                  ─Éiß╗âm sß╗æ ─æ╞░ß╗úc t├¡nh to├ín tß╗▒ ─æß╗Öng dß╗▒a tr├¬n ─æ├íp ├ín ch├¡nh thß╗⌐c tß╗½ Bß╗Ö Gi├ío dß╗Ñc & ─É├áo tß║ío.
                                </p>
                              </div>
                            </div>

                            {/* AI diagnostic report card */}
                            <div style={{
                              background: '#f8fafc',
                              border: '1.5px solid #e2e8f0',
                              borderRadius: 16,
                              padding: 20
                            }}>
                              <h4 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 800, color: '#1e293b', margin: '0 0 10px' }}>
                                ≡ƒñû PH├éN T├ìCH Lß╗û Hß╗öNG KIß║╛N THß╗¿C Tß╗¬ AI
                              </h4>
                              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: '0 0 14px' }}>
                                {diagnosis}
                              </p>
                              
                              <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: 12 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                                  ≡ƒÆí Gß╗úi ├╜ lß╗Ö tr├¼nh cß║úi thiß╗çn:
                                </span>
                                <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                  {advice.map((ad, adIdx) => (
                                    <li key={adIdx} style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.5 }}>{ad}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Detailed answers evaluation view */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', margin: '0 0 -4px' }}>
                                ≡ƒôï ─É├üP ├üN CHI TIß║╛T & H╞»ß╗ÜNG Dß║¬N GIß║óI
                              </h4>

                              {previewExam.sampleQuestions.map((sq, idx) => {
                                const userVal = practiceAnswers[idx] || '';
                                const isCorrect = isEssay || userVal === sq.ans;
                                const isExpanded = !!expandedExplanation[idx];

                                return (
                                  <div
                                    key={idx}
                                    style={{
                                      background: isCorrect ? '#f0fdf4' : '#fef2f2',
                                      border: `1.5px solid ${isCorrect ? '#bbf7d0' : '#fecaca'}`,
                                      borderRadius: 14,
                                      padding: 16
                                    }}
                                  >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 10, marginBottom: 8 }}>
                                      <div style={{ display: 'flex', gap: 8 }}>
                                        <span style={{
                                          background: isCorrect ? '#10b981' : '#ef4444',
                                          color: '#fff',
                                          borderRadius: 6,
                                          padding: '2px 8px',
                                          fontSize: 12,
                                          fontWeight: 700,
                                          height: 'fit-content'
                                        }}>
                                          C├óu {idx + 1}
                                        </span>
                                        <span style={{ fontSize: 13.5, fontWeight: 600, color: '#1e293b', lineHeight: 1.5 }}>
                                          {sq.q}
                                        </span>
                                      </div>
                                      
                                      <span style={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: isCorrect ? '#15803d' : '#b91c1c',
                                        background: isCorrect ? '#dcfce7' : '#fee2e2',
                                        padding: '2px 8px',
                                        borderRadius: 20,
                                        whiteSpace: 'nowrap'
                                      }}>
                                        {isEssay ? 'Tß╗▒ luß║¡n' : (isCorrect ? 'Γ£ô ─É├║ng' : 'Γ£ù Sai')}
                                      </span>
                                    </div>

                                    {/* Selected vs Correct answers section */}
                                    {!isEssay && (
                                      <div style={{ fontSize: 12.5, color: '#475569', marginBottom: 8, paddingLeft: 8 }}>
                                        <span>Lß╗▒a chß╗ìn cß╗ºa bß║ín: <strong style={{ color: isCorrect ? '#15803d' : '#b91c1c' }}>{userVal || 'Bß╗Å trß╗æng'}</strong></span>
                                        <span style={{ marginLeft: 20 }}>─É├íp ├ín ─æ├║ng: <strong style={{ color: '#15803d' }}>{sq.ans}</strong></span>
                                      </div>
                                    )}

                                    {/* Topic Tag */}
                                    <div style={{ marginBottom: 6 }}>
                                      <span style={{
                                        fontSize: 10.5,
                                        background: 'rgba(91, 117, 243, 0.08)',
                                        color: '#5b75f3',
                                        padding: '2px 8px',
                                        borderRadius: 6,
                                        fontWeight: 700
                                      }}>
                                        ≡ƒÄ» Chß╗º ─æß╗ü: {sq.topic}
                                      </span>
                                    </div>

                                    {/* Explanation Toggle */}
                                    <div>
                                      <button
                                        onClick={() => setExpandedExplanation(prev => ({ ...prev, [idx]: !isExpanded }))}
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                          color: 'var(--primary, #059669)',
                                          fontSize: 12,
                                          fontWeight: 700,
                                          cursor: 'pointer',
                                          textDecoration: 'underline',
                                          padding: 0
                                        }}
                                      >
                                        {isExpanded ? 'ß║¿n lß╗¥i giß║úi' : 'Xem h╞░ß╗¢ng dß║½n giß║úi chi tiß║┐t'}
                                      </button>

                                      {isExpanded && (
                                        <div style={{
                                          marginTop: 10,
                                          padding: 12,
                                          background: '#fff',
                                          border: '1px solid #e2e8f0',
                                          borderRadius: 8,
                                          fontSize: 12.5,
                                          color: '#475569',
                                          lineHeight: 1.6,
                                          whiteSpace: 'pre-line'
                                        }}>
                                          {isEssay && (
                                            <div style={{ marginBottom: 8 }}>
                                              <strong style={{ color: '#1e293b', display: 'block', marginBottom: 4 }}>≡ƒô¥ B├ái viß║┐t cß╗ºa bß║ín:</strong>
                                              <p style={{ margin: '0 0 10px 0', padding: 8, background: '#f8fafc', borderLeft: '3px solid #cbd5e1', fontStyle: 'italic' }}>
                                                {userVal || 'Bß╗Å trß╗æng b├ái l├ám.'}
                                              </p>
                                              <strong style={{ color: '#1e293b', display: 'block', marginBottom: 4 }}>≡ƒÅå Lß╗¥i giß║úi v├á b├ái viß║┐t mß║½u ─æß║ít ─æiß╗âm tß╗æi ─æa:</strong>
                                            </div>
                                          )}
                                          {sq.explanation}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Footer Actions for grading report */}
                            <div className="exambank-modal__actions" style={{ borderTop: '1px solid #f0ebe1', paddingTop: 16 }}>
                              <button
                                className="exambank-modal__btn exambank-modal__btn--secondary"
                                onClick={() => {
                                  setIsPracticeSubmitted(false);
                                  setPracticeAnswers({});
                                  setPracticeTimeRemaining(300);
                                  setPracticeTimeSpent(0);
                                  setIsTimerRunning(true);
                                  setExpandedExplanation({});
                                }}
                              >
                                ≡ƒöä L├ám lß║íi
                              </button>
                              
                              <button
                                className="exambank-modal__btn exambank-modal__btn--primary"
                                onClick={handleSavePracticeResult}
                                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                              >
                                ≡ƒÆ╛ L╞░u hß╗ìc bß║í c├í nh├ón
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
