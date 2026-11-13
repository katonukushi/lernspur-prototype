// Demo data for the prototype.
// Everything here is simulated: no real OCR, no real AI, no real people.
// Content follows the team's M2 wireframes (A-WF 01-07) and the demo story in M3_Base, section 6.
// Replace or extend freely, e.g. with the sample data from issue #5.

window.LS = window.LS || {};

LS.data = {
  product: "LernSpur",

  student: { id: "tim", name: "Tim Becker", first: "Tim", grade: "4B", stars: 14 },
  teacher: { name: "Frau Weber", className: "Grade 4B" },

  // The exam that runs through the whole demo flow.
  exam: {
    id: "fractions-quiz",
    title: "Math - Fractions Quiz",
    titleDe: "Mathe - Brüche-Quiz",
    file: "Fractions_Quiz.png",
    maxPoints: 25,
    questions: [
      { id: "q1", label: "Q1", ocr: "1/2 + 1/3 = 5/6", lowConf: null, aiPoints: 5, max: 5, reasoning: "Correct result and method." },
      { id: "q2", label: "Q2", ocr: "3/4 > 2/3", lowConf: ">", aiPoints: 5, max: 5, reasoning: "Correct result and method." },
      { id: "q3", label: "Q3", ocr: "1/2 + 1/3 = 2/5", lowConf: "2/5", aiPoints: 0, max: 5, reasoning: "Denominators were added instead of using a common one." },
      { id: "q4", label: "Q4", ocr: "6 x 7 = 42", lowConf: null, aiPoints: 5, max: 5, reasoning: "Correct result." },
      { id: "q5", label: "Q5", ocr: "24 apples, 4 baskets: 24 : 4 = 6", lowConf: null, aiPoints: 3, max: 5, reasoning: "Correct result, the answer sentence is missing." }
    ]
  },

  // Other papers in the teacher inbox (A-WF 07). Only Tim's paper is clickable in this demo.
  inbox: [
    { pupil: "Mia Schmidt", assessment: "Fractions Quiz", submitted: "Oct 9, 13:55", conf: "High", status: "Needs OCR check" },
    { pupil: "Leon Fischer", assessment: "Fractions Quiz", submitted: "Oct 9, 12:30", conf: "Medium", status: "Needs OCR check" },
    { pupil: "Anna Klein", assessment: "Fractions Quiz", submitted: "Oct 8, 17:02", conf: "-", status: "Re-scan requested" }
  ],

  // Diagnostics for Q3 (A-WF 03).
  diagnostics: {
    question: "Q3",
    steps: [
      { label: "Step 1", text: "1/2 + 1/3", error: null },
      { label: "Step 2", text: "= 2/5", error: "Denominators added" },
      { label: "Result", text: "2/5", error: null }
    ],
    acrossTests: [
      { test: "Test 1", date: "Oct 2", count: 1 },
      { test: "Test 2", date: "Oct 6", count: 2 },
      { test: "Test 3", date: "Oct 9", count: 3 }
    ]
  },

  redFlag: {
    concept: "Common denominator when adding fractions",
    occurrence: "3rd occurrence",
    severity: "Medium",
    earlier: "Test 1 (Oct 2), Test 2 (Oct 6)"
  },

  feedbackDraft:
    "Great job with multiplication and word problems, Tim!\n" +
    "Let's practice adding fractions with different denominators.\n" +
    "Tip: find a common denominator first.",

  attachment: "Fractions practice worksheet",

  // Student results (A-WF 04).
  results: {
    didWell: ["Multiplication", "Word problems", "Neat handwriting"],
    practice: "Adding fractions",
    tip: { EN: "Tip: find a common denominator first.", DE: "Tipp: Finde zuerst einen gemeinsamen Nenner." }
  },

  // Student assessments (A-WF 01, 05). Status of the fractions quiz comes from the demo state.
  assessments: [
    { id: "fractions-quiz", title: "Math - Fractions Quiz" },
    { id: "plants", title: "Science - Plants", status: "Waiting for my teacher" },
    { id: "multiplication", title: "Math - Multiplication", status: "Done - 3 stars" },
    { id: "division", title: "Math - Division (new)", status: "Ready to upload" }
  ],

  // Progress across exams (A-WF 06).
  journey: [
    { exam: "Multiplication", stars: 3 },
    { exam: "Plants", stars: 2 },
    { exam: "Fractions", stars: 2 },
    { exam: "Division", stars: 0, next: true }
  ],
  skills: [
    { name: "Multiplication", level: 3 },
    { name: "Word problems", level: 3 },
    { name: "Fractions", level: 1 },
    { name: "Reading clocks", level: 2 }
  ],
  nextGoal: { text: "Practice 2 fraction sheets to unlock the \"Fraction Explorer\" badge.", sheets: 2, badge: "Fraction Explorer" }
};
