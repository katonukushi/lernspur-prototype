// T2 Verify OCR text (Figma frame "T2 - Verify OCR text", LernSpur step 1: confidence OCR)
// The teacher goes through the uncertain answers one by one; AI grading starts only after every one is checked.

(function () {
  var ui = LS.ui, d = LS.data;
  var zoom = 1;

  function nextUnchecked(from) {
    var list = LS.uncertainQs(), st = LS.state;
    var start = list.findIndex(function (q) { return q.id === from; });
    for (var i = 1; i <= list.length; i++) {
      var q = list[(start + i) % list.length];
      if (!st.checked[q.id]) return q.id;
    }
    return from;
  }

  function mark(how) {
    var st = LS.state;
    st.checked[st.currentQ] = how;
    st.currentQ = nextUnchecked(st.currentQ);
  }

  LS.action("ocrAccept", function () { mark("accepted"); });
  // "Correct" opens the edit field; the second click saves the correction.
  LS.action("ocrCorrect", function () {
    var st = LS.state;
    if (st.ocrEdit !== st.currentQ) { st.ocrEdit = st.currentQ; return; }
    st.ocrEdit = null; mark("corrected");
  });
  LS.action("ocrFlag", function () { mark("flagged"); });
  LS.action("ocrSuggest", function (ch) {
    var st = LS.state, q = LS.q(st.currentQ);
    st.answers[q.id] = st.answers[q.id].replace(q.suspect, ch);
  });
  LS.action("ocrGo", function (id) { LS.state.currentQ = id; });
  LS.action("ocrStep", function (dir) {
    var list = LS.uncertainQs(), st = LS.state;
    var i = list.findIndex(function (q) { return q.id === st.currentQ; });
    st.currentQ = list[(i + (dir === "next" ? 1 : list.length - 1)) % list.length].id;
  });
  LS.action("zoom", function (dir) { zoom = Math.max(0.6, Math.min(1.8, zoom + (dir === "+" ? 0.2 : -0.2))); });
  LS.action("rescan", function () {
    var st = LS.state;
    st.rescan = true; st.upload = "empty"; st.pages = []; st.checked = {};
    return "T1";
  });
  LS.action("approveText", function () { LS.state.ocrConfirmed = true; return "T3"; });

  // The OCR text with the uncertain character marked.
  function readText(q, text) {
    if (!q.suspect || text.indexOf(q.suspect) < 0) return LS.esc(text);
    var i = text.indexOf(q.suspect);
    return LS.esc(text.slice(0, i)) + '<mark class="suspect">' + LS.esc(q.suspect) + "</mark>" + LS.esc(text.slice(i + q.suspect.length));
  }

  LS.screen({
    id: "T2", role: "teacher", nav: "Exams", title: "Verify OCR text", source: "Figma T2",
    render: function (st) {
      var unc = LS.uncertainQs();
      var q = LS.q(st.currentQ);
      var n = LS.checkedCount();
      var done = st.ocrConfirmed;

      if (st.upload !== "sent") {
        return LS.teacherExamHead(ui.btn("Back to queue", { go: "T1" }), d.student.name + " - " + d.exam.title, 0, 0) +
          '<div class="banner info">No paper to check. ' + (st.rescan ? "A re-scan was requested. " : d.student.name + " has not uploaded yet. ") +
          ui.btn("Go to student upload (S2)", { go: "S2", small: true }) + "</div>";
      }

      var head = LS.teacherExamHead(ui.btn("Back to queue", { go: "T1" }), d.student.name + " - " + d.exam.title, 0, LS.teacherSteps()) +
        '<div class="row wrap between sub-head"><div class="row"><b>Uncertain answers checked: ' + n + " of " + unc.length + "</b>" +
          ui.progress(n, unc.length) + "</div>" +
          '<div class="row">' + ui.pill("By student", { on: true }) + ui.pill("By question") + "</div></div>";

      var scan = ui.card(
        '<div class="row between"><h2>Scanned page 1 of 2</h2><div class="row">' +
          ui.btn("-", { action: "zoom", arg: "-", small: true }) + ui.btn("+", { action: "zoom", arg: "+", small: true }) + "</div></div>" +
        ui.ph('Scanned exam paper (placeholder)<br><span class="region">' + q.label + " - linked region</span>", Math.round(300 * zoom)));

      var others = d.exam.questions.filter(function (x) { return !x.hidden && x.id !== q.id; });
      var otherList = ui.card("<h2>Other answers (" + others.length + ")</h2>" + others.map(function (x) {
        var low = x.suspect && !st.checked[x.id];
        var body = "<b>" + x.label + "</b> <span>" + LS.esc(st.answers[x.id]) + "</span>" + ui.conf(x.ocrConf) +
          (st.checked[x.id] ? ui.pill("Checked") : "");
        return x.suspect
          ? '<button type="button" class="answer-row' + (low ? " low" : "") + '" data-action="ocrGo" data-arg="' + x.id + '">' + body + "</button>"
          : '<div class="answer-row">' + body + "</div>";
      }).join(""));

      var status = st.checked[q.id];
      var focus = ui.card(
        '<div class="row between"><h2>' + q.label + " - " + (status ? "Checked (" + status + ")" : "Uncertain") +
          ' <span class="muted small">' + (unc.indexOf(q) + 1) + " of " + unc.length + " uncertain</span></h2>" + ui.conf(q.ocrConf) + "</div>" +
        '<p class="label">Handwriting (cropped)</p>' + ui.ph("cropped handwriting of " + q.label, 70) +
        '<p class="label">What the system read (edit if wrong)</p>' +
        '<div class="read-view">' + readText(q, st.answers[q.id]) + "</div>" +
        (st.ocrEdit === q.id && !done ? '<input class="field" data-bind="answers.' + q.id + '" value="' + LS.esc(st.answers[q.id]) + '" aria-label="Edit the read text">' : "") +
        '<div class="row wrap"><span class="label">Did you mean:</span>' +
          q.suggestions.map(function (s) { return ui.pill(s, { action: "ocrSuggest", arg: s, disabled: done }); }).join("") + "</div>" +
        '<p class="label">Working steps read</p>' +
        q.steps.map(function (s) {
          return '<div class="step-row' + (s.sure ? "" : " low") + '"><span>' + s.text + "</span>" + ui.pill(s.sure ? "Sure" : "Unsure - check", { kind: s.sure ? "" : "low" }) + "</div>";
        }).join("") +
        '<div class="row wrap">' +
          ui.btn(status === "accepted" ? "Accepted" : "Accept", { action: "ocrAccept", primary: status !== "accepted", disabled: done || status === "accepted" }) +
          ui.btn(st.ocrEdit === q.id ? "Save correction" : "Correct", { action: "ocrCorrect", disabled: done, title: "Edit the read text, then save" }) +
          ui.btn("Can't read - flag", { action: "ocrFlag", disabled: done, title: "Mark this answer by hand" }) +
        "</div>", "emph focus");

      var allChecked = n === unc.length;
      var bar = ui.actions(
        ui.btn("Previous uncertain", { action: "ocrStep", arg: "prev" }) +
        ui.btn("Next uncertain", { action: "ocrStep", arg: "next" }) +
        ui.btn("Request re-scan", { action: "rescan", disabled: done }) +
        ui.hint(done ? "Text approved. AI grading is done." : allChecked ? "All uncertain answers checked." : "Check all uncertain answers to continue."),
        done ? ui.btn("Go to grading", { go: "T3", primary: true })
             : ui.btn("Approve text and start AI grading", { action: "approveText", primary: true, disabled: !allChecked }));

      return head + '<div class="split even">' + '<div class="stack">' + scan + otherList + "</div>" + focus + "</div>" + bar +
        ui.note("Grading is locked until the OCR text is approved. Changes are logged.");
    }
  });
})();
