// T5 Student profile with the Learning Trail (Figma frames "T5 - Student profile with Learning Trail" and "M2 - T5 - Support focus closed")

(function () {
  var ui = LS.ui, d = LS.data;

  var FLAG_TEXT = {
    open: "suggested (see Evidence Trail)",
    confirmed: "confirmed",
    wait: "waiting for the next exam",
    dismissed: "dismissed"
  };

  // Only the teacher closes a support focus, and can reopen it (undo).
  LS.action("closeFocus", function () { if (LS.packDone()) LS.state.focusClosed = true; });
  LS.action("reopenFocus", function () { LS.state.focusClosed = false; });

  function focusCard(st) {
    var closed = LS.flagClosed(), packDone = LS.packDone();
    var steps = [
      ["Oct 10", "You confirmed the red flag", true],
      ["Oct 10", "Practice pack sent (" + d.pack.size + " questions)", st.published && st.packAttach],
      [packDone ? "Oct 13" : "now", packDone ? "Tim finished the pack: " + d.pack.size + " of " + d.pack.size : "Tim is practising: " + st.practice + " of " + d.pack.size, packDone],
      [closed ? "Oct 14" : "next", closed ? "You closed the support focus" : "You close the support focus", closed]
    ];
    var timeline = '<div class="grid-4 focus-steps">' + steps.map(function (s) {
      return '<div class="soft-box' + (s[2] ? "" : " dimmed") + '"><span class="muted tiny">' + s[0] + "</span><br><b>" + s[1] + "</b></div>";
    }).join("") + "</div>";
    var note = closed
      ? "Tim and his parents now see \"Finished\". The concept stays on the trail, so the next fractions exam shows whether it holds."
      : packDone ? "Tim has finished the practice pack. Check his answers, then close the support focus."
      : "The support focus stays open until Tim finishes the pack and you close it.";
    return ui.card('<div class="row wrap"><h2>Support focus: comparing fractions</h2>' + ui.pill(closed ? "Closed" : "Open", { on: true }) + "</div>" +
      timeline + '<p class="muted small">' + note + "</p>", "focus-card");
  }

  LS.screen({
    id: "T5", role: "teacher", nav: "Students", title: "Learning Trail", source: "Figma T5, M2",
    render: function (st) {
      var closed = LS.flagClosed(), packDone = LS.packDone();
      var showFocus = st.flag === "confirmed" && st.committed;
      var header = '<div class="trail-head"><span class="muted small">Concept</span>' + d.exams.map(function (e) {
        return '<span class="muted tiny">' + e.label + " · " + e.date + " · " + (e.current ? st.examLang : e.lang) + "</span>";
      }).join("") + "</div>";
      var rows = d.trail.map(function (r) {
        return '<div class="trail-grid"><b>' + r.concept + "</b>" + LS.trailRow(r.mistakes, false) + "</div>";
      }).join("");
      var actions = closed
        ? ui.btn("Reopen focus", { action: "reopenFocus" }) + ui.btn("Back to dashboard", { go: "T1", primary: true })
        : showFocus && packDone
          ? ui.btn("Close support focus", { action: "closeFocus", primary: true })
          : ui.btn("Send practice pack", { go: "T6", primary: true, disabled: !st.committed });
      return '<div class="page-head"><h1>' + d.student.name + " - Learning Trail</h1>" + ui.btn("Back to evidence", { go: "T4" }) + "</div>" +
        ui.card("<h2>Trail across exams</h2>" + header + rows +
          '<p class="muted small">Filled pills = mistakes in that exam. The line links the same concept across exams.' +
          (showFocus ? "" : " Red flag status: " + FLAG_TEXT[st.flag] + ".") + "</p>") +
        (showFocus ? focusCard(st) : "") +
        '<div class="row end">' + actions + "</div>";
    }
  });
})();
