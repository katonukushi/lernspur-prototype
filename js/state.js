// Shared demo state: connects the student and teacher views.
// It is saved in the browser so a reload keeps your place; "Reset demo" starts over.

window.LS = window.LS || {};

LS.STORAGE_KEY = "lernspur-demo-v1";

LS.initialState = function () {
  var answers = {};
  var points = {};
  LS.data.exam.questions.forEach(function (q) {
    answers[q.id] = q.ocr;
    points[q.id] = q.aiPoints;
  });
  return {
    lang: "EN",
    upload: "empty",        // empty | check | ok | sent
    rescan: false,          // teacher asked for a new photo
    ocrConfirmed: false,
    answers: answers,       // OCR text, editable by the teacher
    points: points,         // AI points, adjustable by the teacher
    committed: false,       // grade confirmed by the teacher
    flag: "open",           // open | confirmed | dismissed | observe
    feedback: LS.data.feedbackDraft,
    attach: true,
    published: false,       // feedback sent to the student
    seenNews: false,
    showPaper: false,
    preview: false,         // teacher previews S3 before publishing
    sheetsDone: 1,
    hintLang: "EN"
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

// Derived values used by several screens.
LS.total = function () {
  var s = 0;
  LS.data.exam.questions.forEach(function (q) { s += LS.state.points[q.id]; });
  return s;
};

LS.examStatus = function () {
  var st = LS.state;
  if (st.published) return "Result ready";
  if (st.rescan) return "Please send a new photo";
  if (st.upload === "sent") return "Waiting for my teacher";
  return "Ready to upload";
};
