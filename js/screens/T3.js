// T3 Confirm or override AI grade + feedback (A-WF 02, phase "2 Grading")
// Same page as T2 (see T2.js), with the point buttons and "Commit grade" unlocked.

(function () {
  LS.screen({
    id: "T3", role: "teacher", title: "Confirm or override AI grade", source: "A-WF 02",
    crumbs: ["Grade 4B", "Math Test", "Tim Becker"],
    render: function (st) { return LS.verifyPage(st, "grading"); }
  });
})();
