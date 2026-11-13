// S1 Student home + notifications (A-WF 05)

(function () {
  var ui = LS.ui, d = LS.data, t = LS.t;

  // ---------- S1 Student home + notifications (A-WF 05) ----------
  LS.screen({
    id: "S1", role: "student", title: "Student home + notifications", source: "A-WF 05",
    render: function (st) {
      var news = st.published
        ? ui.card(
            '<p class="label">' + t("New from", "Neu von") + " " + d.teacher.name + "</p>" +
            "<p>" + t("Your Fractions Quiz result is ready!", "Dein Ergebnis im Brüche-Quiz ist da!") + "</p>" +
            ui.btn(t("Open my result", "Mein Ergebnis öffnen"), { go: "S3", primary: true }), "emph news")
        : ui.card('<p class="muted">' + t("No news yet. Your teacher is looking at your paper!", "Noch nichts Neues. Deine Lehrerin schaut sich dein Blatt an!") + "</p>", "news");
      return '<h1>' + t("Hi", "Hallo") + " " + d.student.first + "!</h1>" +
        '<div class="split">' +
          '<div class="stack">' + news +
            "<h2>" + t("My assessments", "Meine Prüfungen") + "</h2>" + LS.ui.assessmentList(false) +
          "</div>" +
          '<div class="stack">' + ui.card(
            "<h2>" + t("My progress", "Mein Fortschritt") + "</h2>" +
            "<p>" + ui.stars(d.student.stars) + " | " + t("Next badge", "Nächstes Abzeichen") + ": " + d.nextGoal.badge + "</p>" +
            ui.btn(t("See my journey", "Meine Reise ansehen"), { go: "S4" })) +
          "</div>" +
        "</div>" +
        ui.note('Empty state: "No news yet. Your teacher is looking at your paper!" The news card appears once the teacher publishes feedback (T6).');
    }
  });
})();
