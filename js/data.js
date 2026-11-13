// Demo data for the prototype.
// Everything here is simulated: no real OCR, no real AI, no real people.
// Content follows the team's Figma skeletons ("LernSpur - M3 Prototype") and the demo story in M3_Base, section 6:
// one student, one concept (comparing fractions, "5/8 is bigger than 3/4"), exams in German and English.
// Values marked [demo] in Figma are invented sample data.

window.LS = window.LS || {};

LS.data = {
  product: "LernSpur",

  student: { name: "Tim Becker", first: "Tim", grade: 4, className: "4B" },
  teacher: { name: "Frau Weber", initials: "FW" },

  // The exam that runs through the whole demo flow.
  exam: {
    id: "fractions-quiz",
    title: "Math - Fractions Quiz",
    short: "Fractions Quiz",
    date: "Oct 9",
    uploaded: "Oct 9, 14:10",
    pagesExpected: 2,
    maxPoints: 25,
    shownNote: "Q1-Q3 of 5 shown [demo]",
    questions: [
      { id: "q1", label: "Q1", ocr: "3/4 ist größer als 2/3", ocrConf: 96, max: 5, ai: 5, aiSure: 94,
        why: "Correct comparison." },
      { id: "q2", label: "Q2", ocr: "S/8 ist größer als 3/4", ocrConf: 41, suspect: "S", suggestions: ["5", "3", "8"],
        steps: [{ text: "Schritt 1: 8 ist größer als 4", sure: true }, { text: "Schritt 2: also ist S/8 größer", sure: false }],
        max: 5, ai: 0, aiSure: 71, why: "Compared denominators only." },
      { id: "q3", label: "Q3", ocr: "1/2 = 2/9", ocrConf: 38, suspect: "9", suggestions: ["4", "6"],
        steps: [{ text: "Schritt 1: 1 · 2 = 2", sure: true }, { text: "Schritt 2: 2 · 2 = 9", sure: false }],
        max: 5, ai: 2, aiSure: 48, why: "Missing explanation step." },
      // Not shown on the screens ("Q1-Q3 of 5 shown"), but part of the total.
      { id: "q4", label: "Q4", ocr: "6 · 7 = 42", ocrConf: 97, max: 5, ai: 5, aiSure: 97, why: "Correct.", hidden: true },
      { id: "q5", label: "Q5", ocr: "24 : 4 = 6 Äpfel", ocrConf: 95, max: 5, ai: 5, aiSure: 92, why: "Correct.", hidden: true }
    ]
  },

  overrideReasons: ["Alternative method", "OCR error", "Partial credit", "Other"],
  dismissReasons: ["One-off", "Bad day", "OCR error", "Other"],

  // Other papers in the exams queue (T1). Only Tim's paper is part of the demo flow.
  queue: [
    { student: "Leon Fischer", exam: "Math - Fractions Quiz", lang: "EN", uploaded: "Oct 9, 12:30", status: "Needs OCR check", uncertain: 1, kind: "ocr" },
    { student: "Mia Schmidt", exam: "Math - Fractions Quiz", lang: "EN", uploaded: "Oct 9, 13:55", status: "AI graded - confirm", uncertain: 0, kind: "grade" },
    { student: "Anna Klein", exam: "Math - Fractions Quiz", lang: "DE", uploaded: "Oct 8, 17:02", status: "Re-scan requested", uncertain: "-", kind: "other" }
  ],

  // Feedback draft on T3, in three versions.
  draft: {
    teacher: "{score}. Strong in multiplication and word problems. Recurring error: compares the denominators only (3 exams).",
    child: "Great job, Tim!\nYou compared most fractions correctly. [demo]\nLet's practise: comparing fractions with different bottom numbers.",
    parent: "Tim did well in multiplication. He is practising how to compare fractions."
  },

  // Evidence Trail (T4) and Learning Trail (T5).
  exams: [
    { id: "quiz", label: "Quiz", date: "Sep 26", lang: "EN", stars: 4, score: "16/20 (80 %)", points: "16/20", pct: 80 },
    { id: "t1", label: "Test 1", date: "Oct 2", lang: "DE", stars: 2, score: "10/20 (50 %)", points: "10/20", pct: 50 },
    { id: "t2", label: "Test 2", date: "Oct 6", lang: "EN", stars: 2, score: "11/20 (55 %)", points: "11/20", pct: 55 },
    { id: "fq", label: "Fractions Quiz", date: "Oct 9", lang: "DE", current: true }
  ],
  trail: [
    { concept: "Comparing fractions", mistakes: [0, 2, 1, 2] },
    { concept: "Multiplication [demo]", mistakes: [0, 0, 0, 0] }
  ],
  flag: {
    title: "Requires additional support in fractions",
    concept: "Comparing fractions",
    why: "The same concept was wrong in 3 of the last 4 exams. Careless slips are not counted. [demo rule]",
    trend: "Score trend in fractions: 80 % → 72 % [demo]",
    answers: [
      { exam: "Test 1 · Q4 · Oct 2", read: "5/8 > 3/4 [demo]", note: "Compared denominators only" },
      { exam: "Test 2 · Q3 · Oct 6", read: "2/3 < 2/5 [demo]", note: "Compared denominators only" },
      { exam: "Fractions Quiz · Q2 · Oct 9", read: "5/8 > 3/4", note: "Compared denominators only" }
    ]
  },

  // Feedback and practice (T6).
  feedback: {
    well: "You got all the multiplication questions right!",
    next: "Let's practise comparing fractions with different denominators.",
    variants: {
      shorter: { well: "All multiplication questions right!", next: "Practise comparing fractions." },
      simpler: { well: "You got every times question right!", next: "Let's practise finding the bigger fraction." },
      german: { well: "Du hast alle Malaufgaben richtig!", next: "Lass uns üben, Brüche mit verschiedenen Nennern zu vergleichen." }
    },
    templates: {
      "New feedback": null,
      "Practice reminder": { well: "Great start on your practice pack!", next: "Please finish the last questions this week." },
      "Praise": { well: "Super work on this quiz, Tim!", next: "Keep going like this." }
    },
    groupLabel: "Group: comparing fractions (3 pupils) [demo]"
  },
  pack: {
    title: "Practice pack: comparing fractions",
    items: [
      ["Which is bigger: 1/2 or 1/4? [demo]", "Which is bigger: 2/3 or 3/5? [demo]"],
      ["Which is bigger: 3/8 or 3/4? [demo]", "Which is bigger: 5/6 or 7/12? [demo]"],
      ["Put in order: 2/3, 2/6, 2/5 [demo]", "Put in order: 1/2, 3/4, 1/8 [demo]"]
    ],
    size: 5
  },

  // Student side (S1-S4).
  message: "\"Nice try on Q2! Look at the bottom number too.\" [demo]",
  example: "Example: 3/4 = 6/8, and 6/8 is more than 5/8. So 3/4 is bigger! [demo]",
  extraHelp: "Frau Weber will sit with you on Monday and look at fractions together. [demo]",
  skillsGot: ["Multiplication", "Word problems", "Reading clocks [demo]"],
  skillsGrowing: [{ name: "Adding fractions [demo]", done: 4, of: 5 }],
  otherPacks: [{ name: "Times tables [demo]", done: true }],

  // Parent side (P1, phone). Layout and wording from Leena's P1 wireframes (13.11.).
  parent: {
    initials: "SB",
    summary: "Tim did well in multiplication. He is practising how to compare fractions. Frau Weber has given him a short practice pack.",
    focusTitle: "Comparing fractions with different bottom numbers",
    confirmed: "Oct 10",
    wentWell: "Tim got all the multiplication questions right.",
    helpAtHome: "Draw two bars of the same length and split both into equal parts. Then compare the coloured parts.",
    quickReplies: ["How can I help with fractions at home?", "Can we arrange a short meeting?", "Thank you for the feedback"]
  }
};
