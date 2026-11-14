// Small building blocks for screens.
// They only output semantic class names; how things look is decided by the theme in css/themes/.

window.LS = window.LS || {};
LS.screens = {};
LS.actions = {};

// Register a screen: { id, role, title, source, nav, header, render(state) -> html, afterRender() }
LS.screen = function (def) { LS.screens[def.id] = def; };

// Register click actions: <button data-action="name" data-arg="x">.
// An action may return a screen ID to navigate there; otherwise the current screen re-renders.
LS.action = function (name, fn) { LS.actions[name] = fn; };

LS.esc = function (s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c];
  });
};
LS.nl2br = function (s) { return LS.esc(s).replace(/\n/g, "<br>"); };

// Pick the English or German string (student view).
LS.t = function (en, de) { return LS.state.lang === "DE" && de ? de : en; };

LS.speak = function (text) {
  try {
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = LS.state.lang === "DE" ? "de-DE" : "en-US";
    speechSynthesis.speak(u);
  } catch (e) { /* no speech in this browser */ }
};

LS.ui = {
  // Button. opts: action, arg, go (screen id), primary, disabled, small, active, cls, title
  btn: function (label, o) {
    o = o || {};
    var cls = "btn" + (o.primary ? " primary" : "") + (o.small ? " small" : "") + (o.active ? " active" : "") + (o.cls ? " " + o.cls : "");
    var a = "";
    if (o.action) a += ' data-action="' + o.action + '"';
    if (o.arg != null) a += ' data-arg="' + LS.esc(o.arg) + '"';
    if (o.go) a += ' data-go="' + o.go + '"';
    if (o.title) a += ' title="' + LS.esc(o.title) + '"';
    if (o.disabled) a += " disabled";
    return '<button type="button" class="' + cls + '"' + a + ">" + label + "</button>";
  },

  // Small rounded toggle or tag. Clickable when opts.action is given.
  pill: function (label, o) {
    o = o || {};
    var cls = "pill" + (o.on ? " on" : "") + (o.kind ? " " + o.kind : "");
    if (!o.action) return '<span class="' + cls + '">' + label + "</span>";
    return '<button type="button" class="' + cls + '" data-action="' + o.action + '"' +
      (o.arg != null ? ' data-arg="' + LS.esc(o.arg) + '"' : "") + (o.disabled ? " disabled" : "") + ">" + label + "</button>";
  },

  card: function (inner, extra) {
    return '<section class="card' + (extra ? " " + extra : "") + '">' + inner + "</section>";
  },

  // Position a pixel box of the scanned exam page as percentages (of the page, or of a crop box).
  scanPct: function (b, ref) {
    var S = LS.data.exam.scanSize, W = ref ? ref[2] : S[0], H = ref ? ref[3] : S[1], x0 = ref ? ref[0] : 0, y0 = ref ? ref[1] : 0;
    return "left:" + ((b[0] - x0) / W * 100).toFixed(2) + "%;top:" + ((b[1] - y0) / H * 100).toFixed(2) + "%;width:" +
      (b[2] / W * 100).toFixed(2) + "%;height:" + (b[3] / H * 100).toFixed(2) + "%";
  },

  // Cropped handwriting of one exam question, cut from the scanned page. checked: the uncertain character is resolved.
  scanCrop: function (q, checked, maxH) {
    var c = q.scan && q.scan.crop, S = LS.data.exam.scanSize, src = LS.data.exam.scanPages[0];
    if (!c) return LS.ui.ph("cropped handwriting of " + q.label, 70);
    maxH = maxH || 150;
    var bg = "background-image:url(" + src + ");background-size:" + (S[0] / c[2] * 100).toFixed(2) + "% auto;" +
      "background-position:" + (c[0] / (S[0] - c[2]) * 100).toFixed(2) + "% " + (c[1] / (S[1] - c[3]) * 100).toFixed(2) + "%;" +
      "aspect-ratio:" + c[2] + "/" + c[3] + ";max-width:" + Math.round(maxH * c[2] / c[3]) + "px";
    return '<div class="scan-crop" role="img" aria-label="Handwriting of ' + q.label + '" style="' + bg + '">' +
      (q.scan.suspect ? '<span class="scan-suspect' + (checked ? " ok" : "") + '" style="' + LS.ui.scanPct(q.scan.suspect, c) + '"></span>' : "") + "</div>";
  },

  // Image placeholder.
  ph: function (label, height, extra) {
    return '<div class="ph' + (extra ? " " + extra : "") + '" style="min-height:' + (height || 120) + 'px"><span>' + label + "</span></div>";
  },

  // Annotation carried over from the design files. Hidden with the "Notes" switch in the demo bar.
  note: function (text) { return '<p class="note">' + text + "</p>"; },

  // Confidence bar: level is high / medium / low.
  conf: function (pct, labelled) {
    var level = pct >= 80 ? "high" : pct >= 60 ? "medium" : "low";
    var word = { high: "High", medium: "Medium", low: "Low - check" }[level];
    return '<span class="conf ' + level + '"><span class="conf-bar"><span style="width:' + pct + '%"></span></span>' +
      "<b>" + pct + " %</b>" + (labelled === false ? "" : " <span>" + word + "</span>") + "</span>";
  },

  progress: function (done, of) {
    return '<span class="progress"><span style="width:' + Math.round(done / of * 100) + '%"></span></span>';
  },

  // Done / not done mark for checklists. Meaning is in the label, not only in the icon.
  check: function (on, label) {
    return '<span class="check-ic' + (on ? " on" : "") + '" role="img" aria-label="' + (on ? "Done" : "Not done") + (label ? ": " + LS.esc(label) : "") + '">' + (on ? "✓" : "") + "</span>";
  },

  stars: function (n, max) {
    var s = "";
    for (var i = 0; i < (max || 5); i++) s += i < n ? "★" : "☆";
    return '<span class="stars" aria-label="' + n + " of " + (max || 5) + ' stars">' + s + "</span>";
  },

  // Process stepper: steps = [label], current = index, done = number of finished steps.
  // Separators as in Figma: ">" on teacher screens, "-" on the child's screens.
  stepper: function (steps, current, done) {
    var def = LS.screens[LS.current()], sep = def && def.role === "student" ? "-" : ">";
    return '<ol class="stepper">' + steps.map(function (s, i) {
      var cls = i === current ? "current" : i < done ? "done" : "";
      return (i ? '<li class="sep" aria-hidden="true">' + sep + "</li>" : "") +
        '<li class="' + cls + '">' + (i + 1) + " " + s + (i < done && i !== current ? " - done" : "") + "</li>";
    }).join("") + "</ol>";
  },

  // Bottom action bar: left and right are html strings.
  actions: function (left, right) {
    return '<div class="action-bar"><div class="row wrap">' + left + '</div><div class="row wrap">' + right + "</div></div>";
  },

  hint: function (text) { return '<span class="hint">' + text + "</span>"; }
};

// Shared header pieces: page title row with back button and stepper (teacher exam pages).
LS.teacherExamHead = function (back, title, stepIndex, stepsDone) {
  var ui = LS.ui;
  return '<div class="page-head">' +
    '<div class="row wrap">' + back + "<h1>" + title + "</h1>" + ui.pill(LS.state.examLang) + "</div>" +
    ui.stepper(["Verify", "Grade", "Feedback", "Release"], stepIndex, stepsDone) +
    "</div>";
};

LS.teacherSteps = function () {
  var st = LS.state;
  return st.published ? 4 : st.committed ? 2 : st.ocrConfirmed ? 1 : 0;
};
