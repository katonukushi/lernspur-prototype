// T4 Learning gaps + red flag with evidence across exams (A-WF 03, LernSpur step 2)
// A-WF 03 shows diagnostics, red flag and feedback on one page.
// T4 is the upper part, T6 (see T6.js) the feedback part of the same page.

(function () {
  var ui = LS.ui, d = LS.data;

  LS.action("flag", function (v) { LS.state.flag = v; });

  var FLAG_RESULT = {
    confirmed: "Confirmed: saved to Tim's profile, exercises suggested.",
    dismissed: "Dismissed as a slip. Nothing saved.",
    observe: "Under observation: re-check after the next test."
  };

  LS.diagnosticsPage = function (st) {
    var f = d.redFlag, dg = d.diagnostics;
    var notReady = !st.committed
      ? '<div class="banner info">The grade is not committed yet. ' + ui.btn("Back to grading (T3)", { go: "T3", small: true }) + "</div>" : "";

    var steps = dg.steps.map(function (s) {
      return '<div class="step-row' + (s.error ? " hot" : "") + '"><span><b>' + s.label + ":</b> " + s.text + "</span>" +
        (s.error ? "<b>" + s.error + "</b>" : "") + "</div>";
    }).join("");
    var bars = dg.acrossTests.map(function (a) {
      return '<div class="bar-col"><div class="bar hot" style="height:' + (20 + a.count * 30) + 'px"></div><span>' + a.test + "</span></div>";
    }).join("");

    var heat = ui.card("<h2>Step-level heatmap - " + dg.question + '</h2><div class="stack tight">' + steps + "</div>" +
      "<h3>Same error across tests</h3>" + '<div class="bars">' + bars + "</div>");

    var decided = st.flag !== "open";
    var flag = ui.card(
      '<p class="label">Red flag</p><h2>' + f.concept + "</h2>" +
      '<p class="muted">' + f.occurrence + " | Suggested severity: " + f.severity + "</p>" +
      '<p>Earlier: <a href="#" data-go="T5">' + f.earlier + "</a></p>" +
      (decided
        ? '<div class="banner ok">' + FLAG_RESULT[st.flag] + "</div>" + ui.btn("Change decision", { action: "flag", arg: "open", small: true })
        : '<div class="stack tight">' + ui.btn("Confirm", { action: "flag", arg: "confirmed", primary: true }) +
            ui.btn("Dismiss as slip", { action: "flag", arg: "dismissed" }) + ui.btn("Observe", { action: "flag", arg: "observe" }) + "</div>") +
      ui.note("Confirm = save to profile + suggest exercises. Observe = re-check after next test."), "emph flag");

    return notReady +
      "<h1>" + d.student.name + " - Math Test</h1>" +
      '<p class="muted">Total: ' + LS.total() + " / " + d.exam.maxPoints + " points (for teachers only)</p>" +
      '<div class="split wide-left">' + heat + flag + "</div>" +
      LS.feedbackSection(st);
  };

  LS.screen({
    id: "T4", role: "teacher", title: "Learning gaps + red flag", source: "A-WF 03",
    crumbs: ["Grade 4B", "Math Test", "Tim Becker"],
    render: function (st) { return LS.diagnosticsPage(st); }
  });
})();
