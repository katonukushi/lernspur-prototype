// Recording mode for the walkthrough video (not part of the product).
// Open index.html?mode=record. It starts from a clean demo at S2, hides the demo bar and the notes,
// keeps the device frames from app.js, and shows a short title card whenever the role changes.
//
// Keys (chosen so they do not collide with D = demo bar and F = device frames from app.js):
//   N or Right arrow  next step of the walkthrough (fallback if a click goes wrong)
//   R                 reset to the start (S2, clean state, student title card)
//   C                 click ripple on or off
//   Space / Enter     close a title card (a click on the card works too)

(function () {
  if (new URLSearchParams(location.search).get("mode") !== "record") return;

  var d = LS.data;
  var ripple = new URLSearchParams(location.search).get("ripple") !== "off";
  var lastRole = null;
  var card = null;

  // Record mode never changes the saved preferences of the normal demo.
  LS.prefs.demo = false;
  LS.prefs.notes = false;
  LS.prefs.frames = true;
  LS.savePrefs = function () {};

  // ---------- title cards between roles ----------

  var CARDS = {
    student: { role: "Student", who: d.student.first + " · Grade " + d.student.grade, device: "tablet" },
    teacher: { role: "Teacher", who: d.teacher.name, device: "desktop" },
    parent: { role: "Parent", who: d.student.first + "'s parent", device: "phone" }
  };

  function showCard(role) {
    hideCard();
    var c = CARDS[role];
    if (!c) return;
    card = document.createElement("div");
    card.className = "rec-card";
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-label", c.role + " view");
    card.innerHTML = '<div class="rec-card-inner">' +
      '<p class="rec-role">' + c.role + "</p>" +
      (c.who ? '<p class="rec-who">' + LS.esc(c.who) + "</p>" : "") +
      '<p class="rec-device">' + c.device + "</p></div>";
    card.addEventListener("click", function (e) { e.stopPropagation(); hideCard(); });
    document.body.appendChild(card);
  }

  function hideCard() {
    if (card) card.remove();
    card = null;
  }

  function checkRole() {
    var role = document.body.dataset.role;
    if (role && role !== lastRole) { lastRole = role; showCard(role); }
  }
  // app.js renders through LS.render() and through its own hashchange listener (registered before this one).
  var baseRender = LS.render;
  LS.render = function () { baseRender(); checkRole(); };
  window.addEventListener("hashchange", checkRole);

  // ---------- scripted walkthrough (N key) ----------
  // Each step finishes the current screen the way the presenter would, then goes on.
  // This is only a safety net: in the take, the presenter clicks through the real UI.

  function finishOcr(st) {
    LS.uncertainQs().forEach(function (q) {
      if (st.checked[q.id]) return;
      st.answers[q.id] = st.answers[q.id].replace(q.suspect, q.suggestions[0]);
      st.checked[q.id] = "corrected";
    });
    st.ocrConfirmed = true;
  }

  function finishGrading(st) {
    LS.visibleQs().forEach(function (q) {
      var g = st.grade[q.id];
      if (g.status !== "open") return;
      if (q.id === "q3") { g.status = "overridden"; g.points = Math.min(q.max, q.ai + 1); g.reason = "Partial credit"; }
      else { g.status = "accepted"; g.points = q.ai; g.reason = null; }
    });
    st.fbConfirmed = true;
    st.committed = true;
  }

  var NEXT = {
    S2: function (st) { st.pages = [{ status: "clear" }, { status: "clear" }]; st.upload = "sent"; st.rescan = false; return "T1"; },
    T1: function () { return "T2"; },
    T2: function (st) { finishOcr(st); return "T3"; },
    T3: function (st) { if (!st.ocrConfirmed) finishOcr(st); finishGrading(st); return "T4"; },
    T4: function (st) { if (st.flag === "open") st.flag = "confirmed"; return "T5"; },
    T7: function () { return "T5"; },
    T5: function () { return "T6"; },
    T6: function (st) { st.published = true; st.seenResult = false; st.preview = false; return "S1"; },
    S1: function () { return "S3"; },
    S3: function () { return "S4"; },
    S4: function (st) { st.practice = Math.max(st.practice, d.pack.size); st.missionSeen = true; return "P1"; },
    P1: function () { return null; }
  };

  function next() {
    var id = LS.current(), step = NEXT[id];
    var to = step ? step(LS.state) : "S2";
    if (!to) return;
    LS.save();
    LS.go(to);
  }

  function reset() {
    LS.reset();
    lastRole = null;
    LS.go("S2");
  }

  // ---------- click ripple ----------

  document.addEventListener("pointerdown", function (e) {
    if (!ripple) return;
    var r = document.createElement("span");
    r.className = "rec-ripple";
    r.style.left = e.clientX + "px";
    r.style.top = e.clientY + "px";
    document.body.appendChild(r);
    setTimeout(function () { r.remove(); }, 650);
  }, true);

  // ---------- keys ----------
  // Capture phase, so a key meant for the title card does not reach the page behind it.

  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.matches && e.target.matches("input, textarea, select")) return;
    var k = e.key;
    if (card && (k === " " || k === "Enter" || k === "n" || k === "N" || k === "ArrowRight")) {
      e.preventDefault(); e.stopPropagation(); hideCard(); return;
    }
    if (k === "n" || k === "N" || k === "ArrowRight") { e.preventDefault(); next(); }
    else if (k === "r" || k === "R") { e.preventDefault(); reset(); }
    else if (k === "c" || k === "C") { ripple = !ripple; }
  }, true);

  // ---------- start: clean state at S2 ----------

  document.documentElement.classList.add("record");
  LS.reset();
  history.replaceState(null, "", location.pathname + location.search + "#/S2");
  window.addEventListener("DOMContentLoaded", function () { document.body.classList.add("record"); });

  LS.record = { next: next, reset: reset, hideCard: hideCard, cardShown: function () { return !!card; } };
})();
