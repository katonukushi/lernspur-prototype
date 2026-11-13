// T1 Teacher dashboard / exams queue (Figma frame "T1 - Teacher dashboard / inbox")

(function () {
  var ui = LS.ui, d = LS.data;

  // Where Tim's paper stands, and where its button leads.
  function timState(st) {
    if (st.rescan) return { status: "Re-scan requested", action: "Open", go: "T2" };
    if (st.published) return { status: "Released", action: "Open", go: "T6" };
    if (st.committed) return { status: "Graded - feedback", action: "Feedback", go: "T6" };
    if (st.ocrConfirmed) return { status: "AI graded - confirm", action: "Review", go: "T3" };
    return { status: "Needs OCR check", action: "Verify", go: "T2" };
  }

  LS.screen({
    id: "T1", role: "teacher", nav: "Dashboard", title: "Teacher dashboard", source: "Figma T1",
    render: function (st) {
      var hasTim = st.upload === "sent" || st.rescan;
      var tim = hasTim ? timState(st) : null;
      var uncertainLeft = LS.uncertainQs().length - LS.checkedCount();

      var needOcr = 1 + (tim && tim.go === "T2" && !st.rescan ? 1 : 0);
      var toConfirm = 1 + (tim && tim.go === "T3" ? 1 : 0);
      var flags = st.committed && st.flag === "open" ? 1 : 0;

      var stat = function (n, label, btn, go) {
        return ui.card('<p class="stat">' + n + "</p>" +
          '<div class="row between"><span>' + label + "</span>" + ui.btn(btn, { go: go, disabled: !go }) + "</div>", "stat-card");
      };

      var timRow = hasTim
        ? '<tr class="hl"><td>' + d.student.name + "</td><td>" + d.exam.title + "</td><td>" + st.examLang + "</td><td>" + d.exam.uploaded + "</td>" +
          "<td>" + ui.pill(tim.status) + "</td><td><b>" + (st.ocrConfirmed ? 0 : uncertainLeft) + "</b></td>" +
          "<td>" + ui.btn(tim.action, { go: tim.go, primary: true }) + "</td></tr>"
        : "";
      var rows = timRow + d.queue.map(function (r) {
        return "<tr><td>" + r.student + "</td><td>" + r.exam + "</td><td>" + r.lang + "</td><td>" + r.uploaded + "</td>" +
          "<td>" + ui.pill(r.status) + "</td><td>" + r.uncertain + "</td>" +
          "<td>" + ui.btn(r.kind === "ocr" ? "Verify" : r.kind === "grade" ? "Review" : "Open", { disabled: true, title: "Sample row [demo]" }) + "</td></tr>";
      }).join("");

      var weak = st.committed
        ? '<div class="card inner"><p><b>' + d.student.name + '</b></p><p class="muted small">Comparing fractions - same error in 3 exams</p>' +
            ui.btn("Evidence", { go: "T4" }) + "</div>"
        : '<p class="muted small">Nothing suggested yet. Suggestions appear after grades are confirmed.</p>';

      return "<h1>Good afternoon, " + d.teacher.name + "</h1>" +
        (hasTim ? "" : '<div class="banner info">' + d.student.name + " has not uploaded the Fractions Quiz yet. " +
          ui.btn("Go to student upload (S2)", { go: "S2", small: true }) + "</div>") +
        '<div class="grid-3">' +
          stat(needOcr + " [demo]", "Need OCR check", "Start", hasTim && tim.go === "T2" ? "T2" : null) +
          stat(toConfirm + " [demo]", "Grades to confirm", "Review", hasTim && tim.go === "T3" ? "T3" : null) +
          stat(flags, "Red flags to review", "Review", flags ? "T4" : null) +
        "</div>" +
        '<div class="split wide-left">' +
          ui.card('<h2>Exams queue</h2><div class="row wrap filters">' +
              ui.pill("Class: 4B v") + ui.pill("Subject: Math v") + ui.pill("Status: Pending v") + ui.pill("Sort: most uncertain OCR items v", { on: true }) +
            "</div>" +
            '<div class="table-wrap"><table class="table"><thead><tr><th>Student</th><th>Exam</th><th>Lang</th><th>Uploaded</th><th>Status</th><th>Uncertain OCR items</th><th></th></tr></thead>' +
            "<tbody>" + rows + "</tbody></table></div>" +
            '<p class="muted small">Rows other than ' + d.student.name + " are sample data [demo].</p>") +
          ui.card("<h2>Recurring weaknesses (suggested)</h2>" + weak) +
        "</div>";
    }
  });
})();
