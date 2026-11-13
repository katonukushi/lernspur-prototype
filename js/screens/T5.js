// T5 Student profile with the Learning Trail (Figma frame "T5 - Student profile with Learning Trail")

(function () {
  var ui = LS.ui, d = LS.data;

  var FLAG_TEXT = {
    open: "suggested (see Evidence Trail)",
    confirmed: "confirmed",
    wait: "waiting for the next exam",
    dismissed: "dismissed"
  };

  LS.screen({
    id: "T5", role: "teacher", nav: "Students", title: "Learning Trail", source: "Figma T5",
    render: function (st) {
      var flagText = LS.flagClosed() && st.flag === "confirmed" ? "closed - practice pack mastered" : FLAG_TEXT[st.flag];
      var header = '<div class="trail-head"><span class="muted small">Concept</span>' + d.exams.map(function (e) {
        return '<span class="muted tiny">' + e.label + " · " + e.date + " · " + (e.current ? st.examLang : e.lang + " [demo]") + "</span>";
      }).join("") + "</div>";
      var rows = d.trail.map(function (r) {
        return '<div class="trail-grid"><b>' + r.concept + "</b>" + LS.trailRow(r.mistakes, false) + "</div>";
      }).join("");
      return '<div class="page-head"><h1>' + d.student.name + " - Learning Trail</h1>" + ui.btn("Back to evidence", { go: "T4" }) + "</div>" +
        ui.card("<h2>Trail across exams</h2>" + header + rows +
          '<p class="muted small">Filled pills = mistakes in that exam. The line links the same concept across exams. Red flag status: ' + flagText + ".</p>") +
        '<div class="row end">' + ui.btn("Send practice pack", { go: "T6", primary: true, disabled: !st.committed }) + "</div>";
    }
  });
})();
