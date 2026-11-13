// T1 Teacher dashboard / inbox (A-WF 07)

(function () {
  var ui = LS.ui, d = LS.data;

  function timRow(st) {
    var status, go;
    if (st.rescan) { status = "Re-scan requested"; go = "T2"; }
    else if (st.published) { status = "Feedback sent"; go = "T4"; }
    else if (st.committed) { status = "Graded, feedback open"; go = "T6"; }
    else if (st.ocrConfirmed) { status = "Ready to grade"; go = "T3"; }
    else { status = "Needs OCR check"; go = "T2"; }
    return '<tr class="lowrow"><td>' + d.student.name + "</td><td>Fractions Quiz</td><td>Oct 9, 14:10</td>" +
      "<td>" + ui.chip("Low (2 words)", "warn") + "</td><td>" + status + "</td><td>" + ui.btn("Open", { go: go, small: true }) + "</td></tr>";
  }

  LS.screen({
    id: "T1", role: "teacher", title: "Teacher dashboard / inbox", source: "A-WF 07",
    crumbs: [],
    render: function (st) {
      var rows = (st.upload === "sent" || st.rescan ? timRow(st) : "") +
        d.inbox.map(function (r) {
          return "<tr><td>" + r.pupil + "</td><td>" + r.assessment + "</td><td>" + r.submitted + "</td><td>" + r.conf +
            "</td><td>" + r.status + '</td><td><span class="muted">demo</span></td></tr>';
        }).join("");
      var waiting = st.upload !== "sent" && !st.rescan
        ? '<div class="banner info">Tim Becker has not sent his Fractions Quiz yet. ' + ui.btn("Go to student upload (S2)", { go: "S2", small: true }) + "</div>"
        : "";
      return "<h1>Inbox - " + d.teacher.className + "</h1>" + waiting +
        '<div class="row wrap filters">' +
          "<select><option>Class: 4B</option></select>" +
          "<select><option>Subject: Math</option></select>" +
          "<select><option>Status: Pending</option></select>" +
          '<span class="muted">Sort: lowest OCR confidence</span>' +
        "</div>" +
        ui.card('<table class="table"><thead><tr><th>Pupil</th><th>Assessment</th><th>Submitted</th><th>OCR confidence</th><th>Status</th><th></th></tr></thead><tbody>' +
          rows + "</tbody></table>") +
        ui.note("Rows with low OCR confidence are highlighted so they can be checked first. In this demo only Tim's paper can be opened.");
    }
  });
})();
