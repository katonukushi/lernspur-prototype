// Demo data for the prototype.
// Everything here is simulated: no real OCR, no real AI, no real people.
// Content follows the team's Figma skeletons ("LernSpur - M3 Prototype") and the demo story in M3_Base, section 6:
// one student, one concept (comparing fractions, "5/8 is bigger than 3/4"), exams in German and English.
// All names, exams and numbers are invented sample data.

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
    shownNote: "Q1-Q3 of 5 shown",
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
    child: "Great job, Tim!\nYou compared most fractions correctly.\nLet's practise: comparing fractions with different bottom numbers.",
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
    { concept: "Multiplication", mistakes: [0, 0, 0, 0] }
  ],
  flag: {
    title: "Requires additional support in fractions",
    concept: "Comparing fractions",
    why: "The same concept was wrong in 3 of the last 4 exams. Careless slips are not counted.",
    trend: "Score trend in fractions: 80 % → 72 %",
    answers: [
      { exam: "Test 1 · Q4 · Oct 2", read: "5/8 > 3/4", note: "Compared denominators only" },
      { exam: "Test 2 · Q3 · Oct 6", read: "2/3 < 2/5", note: "Compared denominators only" },
      { exam: "Fractions Quiz · Q2 · Oct 9", read: "5/8 > 3/4", note: "Compared denominators only" }
    ]
  },

  // Feedback and practice (T6).
  feedback: {
    well: "You got all the multiplication questions right!",
    next: "Let's practise comparing fractions with different bottom numbers.",
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
    groupLabel: "Group: comparing fractions (3 pupils)"
  },
  pack: {
    title: "Practice pack: comparing fractions",
    items: [
      ["Which is bigger: 1/2 or 1/4?", "Which is bigger: 2/3 or 3/5?"],
      ["Which is bigger: 3/8 or 3/4?", "Which is bigger: 5/6 or 7/12?"],
      ["Put in order: 2/3, 2/6, 2/5", "Put in order: 1/2, 3/4, 1/8"]
    ],
    size: 5
  },

  // Student side (S1-S4).
  message: "\"Nice try on Q2! Look at the bottom number too.\"",
  example: "Example: 3/4 = 6/8, and 6/8 is more than 5/8. So 3/4 is bigger!",
  extraHelp: "Frau Weber will sit with you on Monday and look at fractions together.",
  // German versions of the fixed student texts (S3), used when the pupil switches to DE.
  de: {
    message: "\"Guter Versuch bei Frage 2! Schau auch auf die untere Zahl.\"",
    example: "Beispiel: 3/4 = 6/8, und 6/8 ist mehr als 5/8. Also ist 3/4 größer!",
    extraHelp: "Frau Weber setzt sich am Montag mit dir zusammen und ihr schaut euch Brüche gemeinsam an."
  },
  skillsGot: ["Multiplication", "Word problems", "Reading clocks"],
  skillsGrowing: [{ name: "Adding fractions", done: 4, of: 5 }],
  otherPacks: [{ name: "Times tables", done: true }],

  // Parent side (P1, phone). Layout and wording from Leena's P1 wireframes (13.11.).
  parent: {
    initials: "SB",
    summary: "Tim did well in multiplication. He is practising how to compare fractions. Frau Weber has given him a short practice pack.",
    focusTitle: "Comparing fractions with different bottom numbers",
    confirmed: "Oct 10",
    wentWell: "Tim got all the multiplication questions right.",
    helpAtHome: "Draw two bars of the same length and split both into equal parts. Then compare the coloured parts.",
    quickReplies: ["How can I help with fractions at home?", "Can we arrange a short meeting?", "Thank you for the feedback"]
  },

  // Class Gap Radar (T7, optional feature D4): confirmed papers of class 4B.
  // trend = pupils with this error in Quiz, Test 1, Test 2, Fractions Quiz (same order as exams above).
  classGaps: {
    pupils: 24,
    graded: 22,
    errors: [
      { id: "simplify", concept: "Simplifying fractions", pupils: 11, trend: [2, 4, 7, 11],
        example: "4/8 left as 4/8 instead of 1/2", pack: "Practice pack: simplifying fractions" },
      { id: "compare", concept: "Comparing fractions (different denominators)", pupils: 3, trend: [1, 2, 3, 3],
        example: "5/8 is bigger than 3/4 because 8 > 4", names: ["Tim Becker", "Leon Fischer", "Anna Klein"] },
      { id: "whole", concept: "Fraction of a whole (word problems)", pupils: 2, trend: [3, 2, 2, 2],
        example: "4 of 8 slices written as 8/4", names: ["Mia Schmidt", "Jonas Wolf"] },
      { id: "units", concept: "Reading the question / units", pupils: 1, trend: [1, 0, 2, 1],
        example: "Answer without the unit \"Äpfel\"", names: ["Lena Braun"] }
    ],
    dismissReasons: ["Already planned", "Too few papers", "Other"]
  }
};
