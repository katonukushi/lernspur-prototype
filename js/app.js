// App shell: routing, headers, demo bar and event handling.
// Routes look like index.html#/T2 (screen IDs from M3_Base, section 5).

window.LS = window.LS || {};

LS.THEMES = ["wire"];   // file names in css/themes/. Add the final design theme here when it is ready.
LS.DEFAULT_SCREEN = "S1";

// The 9 workflow steps from the project brief, mapped to screens.
LS.FLOW = [
  { n: 1, label: "Upload", go: "S2", done: function (s) { return s.upload === "sent"; } },
  { n: 2, label: "OCR", go: "T1", done: function (s) { return s.upload === "sent"; } },
  { n: 3, label: "Verify text", go: "T2", done: function (s) { return s.ocrConfirmed; } },
  { n: 4, label: "AI grading", go: "T3", done: function (s) { return s.ocrConfirmed; } },
  { n: 5, label: "Confirm", go: "T3", done: function (s) { return s.committed; } },
  { n: 6, label: "Gaps", go: "T4", done: function (s) { return s.committed; } },
  { n: 7, label: "Red flag", go: "T4", done: function (s) { return s.flag !== "open"; } },
  { n: 8, label: "Feedback", go: "T6", done: function (s) { return s.published; } },
  { n: 9, label: "Student sees", go: "S3", done: function (s) { return s.seenResult; } }
];

LS.prefs = (function () {
  var p = { theme: "wire", notes: true, demo: true };
  try { Object.assign(p, JSON.parse(localStorage.getItem("lernspur-prefs") || "{}")); } catch (e) { /* ignore */ }
  var q = new URLSearchParams(location.search);
  if (q.get("theme")) p.theme = q.get("theme");
  if (q.get("demo") === "off") p.demo = false;
  if (q.get("notes") === "off") p.notes = false;
  return p;
})();

LS.savePrefs = function () {
  try { localStorage.setItem("lernspur-prefs", JSON.stringify(LS.prefs)); } catch (e) { /* ignore */ }
};

LS.applyPrefs = function () {
  if (LS.THEMES.indexOf(LS.prefs.theme) < 0) LS.prefs.theme = LS.THEMES[0];
  document.getElementById("theme-css").href = "css/themes/" + LS.prefs.theme + ".css";
  document.body.classList.toggle("notes-off", !LS.prefs.notes);
  document.body.classList.toggle("demo-off", !LS.prefs.demo);
};

LS.current = function () {
  var id = location.hash.replace(/^#\/?/, "") || LS.DEFAULT_SCREEN;
  return LS.screens[id] ? id : LS.DEFAULT_SCREEN;
};

LS.go = function (id) {
  if (location.hash === "#/" + id) LS.render(); else location.hash = "#/" + id;
};

// ---------- shells ----------

LS.langToggle = function () {
  return '<span class="seg">' +
    '<button type="button" data-action="lang" data-arg="EN" class="' + (LS.state.lang === "EN" ? "on" : "") + '">EN</button>' +
    '<button type="button" data-action="lang" data-arg="DE" class="' + (LS.state.lang === "DE" ? "on" : "") + '">DE</button></span>';
};

LS.teacherShell = function (def, body) {
  var d = LS.data, st = LS.state;
  var alerts = (st.upload === "sent" && !st.ocrConfirmed ? 1 : 0) + (st.ocrConfirmed && !st.committed ? 1 : 0) +
    (st.committed && st.flag === "open" ? 1 : 0) + 2;
  var nav = [["Dashboard", "T1"], ["Exams", "T2"], ["Students", "T5"], ["Messages", null]].map(function (n) {
    var on = def.nav === n[0];
    return n[1]
      ? '<a href="#" data-go="' + n[1] + '" class="' + (on ? "on" : "") + '">' + n[0] + "</a>"
      : '<span class="off" title="Not part of this prototype">' + n[0] + "</span>";
  }).join("");
  return '<div class="shell teacher">' +
    '<header class="topbar">' +
      '<a href="#" class="brand" data-go="T1"><span class="logo"></span>' + d.product + "</a>" +
      '<span class="pill">Class: ' + d.student.className + " v</span>" +
      '<span class="spacer"></span>' + LS.langToggle() +
      '<a href="#" class="btn small" data-go="T1">Alerts (' + alerts + ")</a>" +
      '<span class="avatar">' + d.teacher.initials + "</span><span>" + d.teacher.name + "</span>" +
    "</header>" +
    '<nav class="sidenav">' + nav + "</nav>" +
    '<main class="content">' + body + "</main></div>";
};

LS.studentShell = function (def, body) {
  var n = LS.unread();
  var back = def.back ? LS.ui.btn(def.back[0], { go: def.back[1] }) : "";
  return '<div class="shell student">' +
    '<header class="topbar">' +
      '<div class="row">' + back + '<a href="#" class="brand" data-go="S1"><span class="logo"></span>' + LS.data.product + "</a></div>" +
      '<span class="page-title">' + (def.headTitle ? def.headTitle() : def.title) + "</span>" +
      '<div class="row">' + LS.langToggle() +
        LS.ui.btn(LS.t("Read aloud", "Vorlesen") + ": " + (LS.state.readAloud ? "ON" : "OFF"), { action: "readAloud" }) +
        '<a href="#" class="btn" data-go="S1">' + LS.t("Bell", "Glocke") + " (" + n + ")</a></div>" +
    "</header>" +
    '<main class="content">' + body + "</main></div>";
};

LS.parentShell = function (def, body) {
  return '<div class="shell parent">' +
    '<header class="topbar">' +
      '<div class="row"><a href="#" class="brand" data-go="P1"><span class="logo"></span>' + LS.data.product + '</a><span class="muted">Parent</span>' +
        '<span class="btn active">Summary</span><span class="btn off" title="Not part of this prototype">Messages</span></div>' +
      '<div class="row"><span class="btn">Child: ' + LS.data.student.name + " v</span>" + LS.langToggle() + "</div>" +
    "</header>" +
    '<main class="content">' + body + "</main></div>";
};

// ---------- demo bar (not part of the product) ----------

LS.demoBar = function (id) {
  var st = LS.state;
  var steps = LS.FLOW.map(function (f) {
    var cls = "step" + (f.done(st) ? " done" : "") + (f.go === id ? " here" : "");
    return '<button type="button" class="' + cls + '" data-go="' + f.go + '">' + f.n + " " + f.label + "</button>";
  }).join("");
  var screens = Object.keys(LS.screens).map(function (k) {
    return '<option value="' + k + '"' + (k === id ? " selected" : "") + ">" + k + " - " + LS.screens[k].title + "</option>";
  }).join("");
  var themes = LS.THEMES.map(function (t) {
    return '<option value="' + t + '"' + (t === LS.prefs.theme ? " selected" : "") + ">" + t + "</option>";
  }).join("");
  return '<div class="demo-bar" role="region" aria-label="Demo controls">' +
    '<span class="demo-title">Demo</span>' +
    '<span class="demo-roles">' +
      '<button type="button" data-go="S1">Student</button>' +
      '<button type="button" data-go="T1">Teacher</button>' +
      '<button type="button" data-go="P1">Parent</button>' +
    "</span>" +
    '<span class="demo-steps">' + steps + "</span>" +
    '<span class="demo-tools">' +
      '<select data-demo="screen" aria-label="Jump to screen">' + screens + "</select>" +
      '<select data-demo="theme" aria-label="Theme">' + themes + "</select>" +
      '<label><input type="checkbox" data-demo="notes"' + (LS.prefs.notes ? " checked" : "") + "> Notes</label>" +
      '<button type="button" data-demo="reset">Reset demo</button>' +
      '<button type="button" data-demo="hide" title="Show again with the D key">Hide</button>' +
    "</span></div>";
};

// ---------- render ----------

LS.render = function () {
  var id = LS.current();
  var def = LS.screens[id];
  var prevId = document.body.dataset.screen;
  var scrollY = window.scrollY;
  document.title = def.title + " - " + LS.data.product;
  if (def.onEnter) def.onEnter(LS.state);
  var body = '<p class="id-tag">' + id + " " + def.title + (def.source ? " <span>(" + def.source + ")</span>" : "") + "</p>" + def.render(LS.state);
  var shell = def.role === "teacher" ? LS.teacherShell : def.role === "parent" ? LS.parentShell : LS.studentShell;
  document.body.dataset.screen = id;
  document.body.dataset.role = def.role;
  document.getElementById("app").innerHTML = shell(def, body);
  document.getElementById("demo").innerHTML = LS.demoBar(id);
  // Same screen re-rendered after a click: keep the scroll position. New screen: start at the top.
  window.scrollTo(0, prevId === id ? scrollY : 0);
  if (def.afterRender) def.afterRender(prevId !== id);
  LS.save();
};

// ---------- events ----------

document.addEventListener("click", function (e) {
  var el = e.target.closest("[data-go], [data-action], [data-demo]");
  if (!el || el.disabled) return;
  if (el.matches("select, input")) return;
  if (el.dataset.demo === "reset") { LS.reset(); LS.go(LS.DEFAULT_SCREEN); return; }
  if (el.dataset.demo === "hide") { LS.prefs.demo = false; LS.savePrefs(); LS.applyPrefs(); return; }
  if (el.dataset.demo) return;
  e.preventDefault();
  if (el.dataset.action) {
    var fn = LS.actions[el.dataset.action];
    if (!fn) { console.warn("Unknown action", el.dataset.action); return; }
    var next = fn(el.dataset.arg, el);
    if (next === false) return;
    if (typeof next === "string") LS.go(next); else LS.render();
    return;
  }
  if (el.dataset.go) LS.go(el.dataset.go);
});

// Text fields and checkboxes write straight into the state: data-bind="note" or "answers.q2".
document.addEventListener("input", function (e) {
  var el = e.target;
  if (!el.dataset || !el.dataset.bind) return;
  var path = el.dataset.bind.split(".");
  var obj = LS.state;
  for (var i = 0; i < path.length - 1; i++) obj = obj[path[i]];
  obj[path[path.length - 1]] = el.type === "checkbox" ? el.checked : el.value;
  LS.save();
  if ("live" in el.dataset) {
    // Update live previews without re-rendering the field the user is typing in.
    document.querySelectorAll('[data-mirror="' + el.dataset.bind + '"]').forEach(function (m) { m.textContent = el.value; });
  }
});

document.addEventListener("change", function (e) {
  var el = e.target;
  if (el.dataset.demo === "screen") LS.go(el.value);
  if (el.dataset.demo === "theme") { LS.prefs.theme = el.value; LS.savePrefs(); LS.applyPrefs(); }
  if (el.dataset.demo === "notes") { LS.prefs.notes = el.checked; LS.savePrefs(); LS.applyPrefs(); }
  if (el.dataset.change) {
    var fn = LS.actions[el.dataset.change];
    var next = fn && fn(el.value, el);
    if (typeof next === "string") LS.go(next); else LS.render();
  }
});

document.addEventListener("keydown", function (e) {
  if (e.target.matches("input, textarea, select")) return;
  if (e.key === "d" || e.key === "D") { LS.prefs.demo = !LS.prefs.demo; LS.savePrefs(); LS.applyPrefs(); }
});

// Shared actions
LS.action("lang", function (lang) { LS.state.lang = lang; });
LS.action("readAloud", function () { LS.state.readAloud = !LS.state.readAloud; });
LS.action("say", function (text) { LS.speak(text); return false; });

window.addEventListener("hashchange", LS.render);
window.addEventListener("DOMContentLoaded", function () { LS.applyPrefs(); LS.render(); });
