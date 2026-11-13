// T4 Evidence Trail: learning gap + red flag with evidence across exams
// (Figma frame "T4 - Learning gaps + red flag with evidence across exams", LernSpur step 2)

(function () {
  var ui = LS.ui, d = LS.data;

  LS.action("mistakeType", function (v) { LS.state.mistakeType = v; });
  LS.action("flagDecide", function (v) { LS.state.flag = v; if (v !== "dismissed") LS.state.dismissReason = null; });
  LS.action("dismissReason", function (r) { LS.state.dismissReason = r; LS.state.flag = "dismissed"; });
  LS.action("flagReopen", function () { LS.state.flag = "open"; LS.state.dismissReason = null; });

  var RESULT = {
    confirmed: "Flag confirmed. Saved to Tim's profile; it is shown to the parent once you release feedback.",
    wait: "Waiting. LernSpur checks again after the next exam. Nothing is saved yet.",
    dismissed: "Flag dismissed. Nothing is added to the record."
  };

  // A row of mistake pills linked by lines, one per exam (also used on T5).
  LS.trailRow = function (counts, withLabels) {
    return '<div class="trail">' + d.exams.map(function (e, i) {
      var n = counts[i];
      return (i ? '<span class="trail-line"></span>' : "") +
        '<span class="trail-cell">' + ui.pill(n + (n === 1 ? " mistake" : " mistakes"), { kind: n ? "dark" : "" }) +
        (withLabels ? '<span class="muted tiny">' + e.label + " · " + e.date + " · " + (e.current ? LS.state.examLang : e.lang) + (e.current ? "" : " [demo]") + "</span>" : "") +
        "</span>";
    }).join("") + "</div>";
  };

  LS.screen({
    id: "T4", role: "teacher", nav: "Students", title: "Evidence Trail: gaps and red flag", source: "Figma T4",
    render: function (st) {
      if (!st.committed) {
        return "<h1>Evidence Trail - " + d.student.name + "</h1>" +
          '<div class="banner info">Learning gaps are detected after the grade is confirmed. ' + ui.btn("Go to grading (T3)", { go: "T3", small: true }) + "</div>";
      }
      var f = d.flag;
      var head = '<div class="page-head"><div><h1>Evidence Trail - ' + d.student.name + " - Fractions</h1>" +
        '<p class="muted">Suggested red flag: ' + f.title.toLowerCase() + "</p></div>" +
        '<div class="row">' + ui.pill("AI suggestion") + ui.btn("Open Learning Trail", { go: "T5" }) + "</div></div>";

      var across = ui.card('<div class="row between wrap"><h2>Across exams</h2><div class="row"><span class="muted small">' + f.concept + ":</span>" +
          ui.pill("Concept gap", { action: "mistakeType", arg: "concept", on: st.mistakeType === "concept" }) +
          ui.pill("Careless slip", { action: "mistakeType", arg: "slip", on: st.mistakeType === "slip" }) + "</div></div>" +
        LS.trailRow(d.trail[0].mistakes, true) + '<p class="small">' + f.trend + "</p>");

      var answers = ui.card("<h2>The answers behind this flag (" + f.answers.length + ")</h2>" +
        '<div class="grid-3">' + f.answers.map(function (a) {
          return '<div class="card inner"><p class="small"><b>' + a.exam + "</b></p>" + ui.ph("cropped answer", 60) +
            '<p class="small"><b>Read as: ' + a.read + '</b></p><p class="muted small">' + a.note + "</p></div>";
        }).join("") + "</div>");

      var decision;
      if (st.flag === "open") {
        decision = '<div class="stack tight">' +
          ui.btn("Confirm flag", { action: "flagDecide", arg: "confirmed", primary: true, cls: "block" }) +
          ui.btn("Wait and check again after the next exam", { action: "flagDecide", arg: "wait", cls: "block" }) +
          '<div class="card inner">' + ui.btn("Dismiss", { action: "flagDecide", arg: "dismissed" }) +
            '<div class="row wrap"><span class="muted small">Reason:</span>' + d.dismissReasons.map(function (r) {
              return ui.pill(r, { action: "dismissReason", arg: r });
            }).join("") + "</div></div>" +
          '<p class="muted tiny">Nothing is added to the student\'s record or shown to the parent until you confirm.</p></div>';
      } else {
        decision = '<div class="banner ' + (st.flag === "confirmed" ? "ok" : "info") + '">' + RESULT[st.flag] +
          (st.dismissReason ? " Reason: " + st.dismissReason + "." : "") + "</div>" +
          '<div class="row wrap">' + ui.btn("Change decision", { action: "flagReopen" }) +
          ui.btn("Next: feedback and practice", { go: "T6", primary: true }) + "</div>";
      }

      var side = '<div class="stack">' +
        ui.card("<h3>Why was this suggested?</h3><p class=\"small\">" + f.why + "</p>", "soft") +
        ui.card("<h3>My note (only teachers see this)</h3>" +
          '<textarea class="field" rows="2" data-bind="note" placeholder="e.g. participation, behaviour, absence ...">' + LS.esc(st.note) + "</textarea>") +
        ui.card("<h2>My decision</h2>" + decision, "emph") + "</div>";

      return head + '<div class="split wide-left"><div class="stack">' + across + answers + "</div>" + side + "</div>";
    }
  });
})();
