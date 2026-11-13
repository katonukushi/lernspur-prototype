// App shell: routing, headers, demo bar and event handling.
// Routes look like index.html#/S2 (screen ID from M3_Base, section 5).

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
  { n: 9, label: "Student sees", go: "S3", done: function (s) { return s.published && s.seenNews; } }
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
  if (LS.THEMES.indexOf(LS.prefs.theme) < 0) LS.prefs.theme = "wire";
  document.getElementById("theme-css").href = "css/themes/" + LS.prefs.theme + ".css";
  document.body.classList.toggle("notes-off", !LS.prefs.notes);
  document.body.classList.toggle("demo-off", !LS.prefs.demo);
};

LS.current = function () {
  var id = (location.hash.replace(/^#\/?/, "") || LS.DEFAULT_SCREEN).split("?")[0];
  return LS.screens[id] ? id : LS.DEFAULT_SCREEN;
};

LS.go = function (id) {
  if (location.hash === "#/" + id) LS.render(); else location.hash = "#/" + id;
  window.scrollTo(0, 0);
};

// ---------- headers ----------

LS.header = function (def) {
  var d = LS.data, ui = LS.ui, st = LS.state;
  var brand = '<a class="brand" data-go="' + (def.role === "teacher" ? "T1" : def.role === "parent" ? "P1" : "S1") + '" href="#"><span class="logo"></span>' + d.product + "</a>";

  if (def.role === "student") {
    var news = st.published && !st.seenNews ? '<span class="badge-count">1</span>' : "";
    return '<header class="app-header">' + brand +
      '<span class="role">' + LS.t("Student view", "Schüleransicht") + "</span>" +
      '<nav class="head-right">' +
        ui.stars(d.student.stars) +
        '<span class="lang">' +
          ui.btn("DE", { action: "lang", arg: "DE", small: true }) + " | " +
          ui.btn("EN", { action: "lang", arg: "EN", small: true }) +
        "</span>" +
        '<a href="#" data-go="S1" class="navlink">' + LS.t("Home", "Start") + "</a>" +
        '<a href="#" data-go="S4" class="navlink">' + LS.t("Progress", "Fortschritt") + "</a>" +
        '<a href="#" data-go="S1" class="bell" aria-label="Notifications">B' + news + "</a>" +
      "</nav></header>";
  }

  if (def.role === "teacher") {
    var crumbs = ["Teacher view"].concat(def.crumbs || []);
    return '<header class="app-header">' + brand +
      '<span class="crumbs">' + crumbs.join(" &gt; ") + "</span>" +
      '<nav class="head-right"><a href="#" data-go="T1" class="navlink">Inbox</a><span class="who">' + d.teacher.name + "</span></nav></header>";
  }

  return '<header class="app-header">' + brand + '<span class="role">Parent view</span></header>';
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
    '<span class="demo-title">Demo controls</span>' +
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
  document.title = def.title + " - " + LS.data.product;
  if (def.onEnter) def.onEnter(LS.state);
  document.getElementById("app").innerHTML =
    LS.header(def) +
    '<main class="screen screen-' + id + '" data-role="' + def.role + '">' +
      '<p class="id-tag">' + id + " " + def.title + (def.source ? " <span>(" + def.source + ")</span>" : "") + "</p>" +
      def.render(LS.state) +
    "</main>";
  document.getElementById("demo").innerHTML = LS.demoBar(id);
  if (def.afterRender) def.afterRender();
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
    if (typeof next === "string") LS.go(next); else LS.render();
    return;
  }
  if (el.dataset.go) LS.go(el.dataset.go);
});

// Text fields and checkboxes write straight into the state: data-bind="feedback" or "answers.q3".
document.addEventListener("input", function (e) {
  var el = e.target;
  if (!el.dataset || !el.dataset.bind) return;
  var path = el.dataset.bind.split(".");
  var obj = LS.state;
  for (var i = 0; i < path.length - 1; i++) obj = obj[path[i]];
  obj[path[path.length - 1]] = el.type === "checkbox" ? el.checked : el.value;
  LS.save();
  if (el.dataset.rerender !== undefined) LS.render();
});

document.addEventListener("change", function (e) {
  var el = e.target;
  if (el.dataset.demo === "screen") LS.go(el.value);
  if (el.dataset.demo === "theme") { LS.prefs.theme = el.value; LS.savePrefs(); LS.applyPrefs(); }
  if (el.dataset.demo === "notes") { LS.prefs.notes = el.checked; LS.savePrefs(); LS.applyPrefs(); }
});

document.addEventListener("keydown", function (e) {
  if (e.target.matches("input, textarea, select")) return;
  if (e.key === "d" || e.key === "D") { LS.prefs.demo = !LS.prefs.demo; LS.savePrefs(); LS.applyPrefs(); }
});

// Shared actions
LS.action("lang", function (lang) { LS.state.lang = lang; });

window.addEventListener("hashchange", LS.render);
window.addEventListener("DOMContentLoaded", function () { LS.applyPrefs(); LS.render(); });
