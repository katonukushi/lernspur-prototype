// Shared demo state: connects the student, teacher and parent views.
// It is saved in the browser so a reload keeps your place; "Reset demo" starts over.

window.LS = window.LS || {};

LS.STORAGE_KEY = "lernspur-demo-v3";

LS.initialState = function () {
  var d = LS.data, answers = {}, grade = {};
  d.exam.questions.forEach(function (q) {
    answers[q.id] = q.ocr;
    grade[q.id] = { status: q.hidden ? "accepted" : "open", points: q.ai, reason: null };
  });
  return {
    lang: "EN",
    readAloud: true,

    // S2 upload
    examLang: "DE",
    pages: [],              // [{ status: "clear" | "blurry" }]
    upload: "empty",        // empty | sent
    rescan: false,

    // T2 verify
    answers: answers,
    checked: {},            // q2: "accepted" | "corrected" | "flagged"
    currentQ: "q2",
    ocrConfirmed: false,

    // T3 grade
    grade: grade,
    fbVersion: "child",
    fbEditing: false,
    fbText: d.draft.child,
    fbConfirmed: false,
    committed: false,

    // T4 evidence
    mistakeType: "concept",
    note: "",
    flag: "open",           // open | confirmed | wait | dismissed
    dismissReason: null,

    // T6 feedback
    sendTo: "student",
    template: "New feedback",
    well: d.feedback.well,
    next: d.feedback.next,
    packAttach: true,
    packPick: [0, 0, 0],
    ownQuestions: [],
    draftSaved: false,
    published: false,
    preview: false,

    // student
    seenResult: false,
    thanked: false,
    view: "text",
    showPaper: false,
    showHelp: false,
    practice: 2,            // questions done in the comparing-fractions pack
    focusClosed: false,     // only the teacher closes the support focus (T5)
    missionSeen: false,     // the child has left the "Mission done" view (S4, Figma M2)

    // parent
    parentCompose: false,
    parentMsg: "",
    parentSent: false
  };
};

LS.load = function () {
  try {
    var raw = localStorage.getItem(LS.STORAGE_KEY);
    if (raw) return Object.assign(LS.initialState(), JSON.parse(raw));
  } catch (e) { /* storage blocked: start fresh */ }
  return LS.initialState();
};

LS.save = function () {
  try { localStorage.setItem(LS.STORAGE_KEY, JSON.stringify(LS.state)); } catch (e) { /* ignore */ }
};

LS.reset = function () {
  LS.state = LS.initialState();
  LS.save();
};

LS.state = LS.load();

// ---------- derived values used by several screens ----------

LS.q = function (id) { return LS.data.exam.questions.filter(function (q) { return q.id === id; })[0]; };
LS.visibleQs = function () { return LS.data.exam.questions.filter(function (q) { return !q.hidden; }); };
LS.uncertainQs = function () { return LS.data.exam.questions.filter(function (q) { return q.suspect; }); };
LS.checkedCount = function () {
  return LS.uncertainQs().filter(function (q) { return LS.state.checked[q.id]; }).length;
};

LS.aiTotal = function () {
  return LS.data.exam.questions.reduce(function (s, q) { return s + q.ai; }, 0);
};
LS.total = function () {
  var g = LS.state.grade;
  return LS.data.exam.questions.reduce(function (s, q) { return s + g[q.id].points; }, 0);
};
LS.pct = function (points) { return Math.round(points / LS.data.exam.maxPoints * 100); };
// Star mapping (team decision): under 40 % = 1, 40-59 = 2, 60-79 = 3, 80-89 = 4, from 90 = 5.
LS.starsForPct = function (pct) { return pct >= 90 ? 5 : pct >= 80 ? 4 : pct >= 60 ? 3 : pct >= 40 ? 2 : 1; };
LS.starsFor = function (points) { return LS.starsForPct(LS.pct(points)); };
LS.scoreText = function (points) {
  return LS.starsFor(points) + " of 5 stars - " + points + "/" + LS.data.exam.maxPoints + " (" + LS.pct(points) + " %)";
};

LS.allGraded = function () {
  var g = LS.state.grade;
  return LS.visibleQs().every(function (q) { return g[q.id].status !== "open"; });
};

// How the student should see each answer (S3).
LS.answerLabel = function (q) {
  var p = LS.state.grade[q.id].points;
  if (p >= q.max) return "Right";
  if (p === 0) return "Let's practise";
  return "Partly right";
};

LS.photosOk = function () {
  var p = LS.state.pages;
  return p.length >= LS.data.exam.pagesExpected && p.every(function (x) { return x.status === "clear"; });
};

LS.unread = function () {
  var st = LS.state;
  return st.published && !st.seenResult ? (st.packAttach ? 2 : 1) : 0;
};

// The child finished the practice pack (S4).
LS.packDone = function () { return LS.state.practice >= LS.data.pack.size; };
// The teacher closed the support focus after the pack (T5). Only the teacher can do this.
LS.flagClosed = function () { return LS.state.focusClosed && LS.packDone(); };
