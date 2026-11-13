// S4 My Trail: progress across exams + practice packs (Figma frame "S4 - My Trail")

(function () {
  var ui = LS.ui, d = LS.data, t = LS.t;

  LS.action("practise", function () { if (LS.state.practice < d.pack.size) LS.state.practice++; });

  LS.screen({
    id: "S4", role: "student", title: "My Trail", source: "Figma S4", back: ["Home", "S1"],
    headTitle: function () { return t("My Trail", "Meine Spur"); },
    render: function (st) {
      var exams = d.exams.map(function (e, i) {
        var stars = e.current ? (st.published ? LS.starsFor(LS.total()) : null) : e.stars;
        return (i ? '<span class="trail-line"></span>' : "") +
          '<div class="card inner exam-card"><p class="muted small">' + e.label + " · " + e.date + "</p>" +
          (stars ? '<p class="big-stars">' + ui.stars(stars) + '</p><p class="small">' + stars + " " + t("of 5 stars", "von 5 Sternen") + (e.current ? "" : "") + "</p>"
                 : '<p class="small muted">' + t("Your teacher is checking", "Wird angeschaut") + "</p>") + "</div>";
      }).join("");

      var hasPack = st.published && st.packAttach;
      var done = LS.packDone();
      var growing = [{ name: t("Comparing fractions", "Brüche vergleichen"), done: st.practice, of: d.pack.size }].concat(d.skillsGrowing);

      var packs = d.otherPacks.map(function (p) {
        return '<div class="item-row"><b class="row">' + ui.check(true, p.name) + p.name + "</b><span>" + t("Done", "Fertig") + "</span></div>";
      }).join("") + (hasPack
        ? '<div class="item-row"><div><b class="row">' + ui.check(done) + t("Comparing fractions", "Brüche vergleichen") + '</b><p class="muted small">' + t("From", "Von") + " " + d.teacher.name + "</p></div>" +
            (done ? "<span>" + t("Done", "Fertig") + "</span>"
                  : ui.btn(st.practice > 2 ? t("Next question", "Nächste Frage") + " (" + st.practice + "/" + d.pack.size + ")" : t("Start", "Los"), { action: "practise", primary: true })) + "</div>"
        : '<p class="muted small">' + t("New packs from your teacher show up here.", "Neue Pakete von deiner Lehrerin erscheinen hier.") + "</p>");

      return '<div class="row end">' + ui.pill("Math", { on: true }) + ui.pill("Science") + "</div>" +
        ui.card("<h2>" + t("My exams", "Meine Prüfungen") + '</h2><div class="trail exams">' + exams + "</div>" +
          '<p class="muted small">' + t("Only your own exams. No class ranking.", "Nur deine eigenen Prüfungen. Kein Vergleich mit der Klasse.") + "</p>") +
        '<div class="grid-3">' +
          ui.card("<h2>" + t("Skills I've got", "Das kann ich") + '</h2><div class="stack tight">' + d.skillsGot.map(function (s) { return '<span class="pill big">' + s + "</span>"; }).join("") + "</div>") +
          ui.card("<h2>" + t("Skills I'm growing", "Daran wachse ich") + "</h2>" + growing.map(function (g) {
            return "<p><b>" + g.name + '</b><br><span class="row">' + ui.progress(g.done, g.of) + '<span class="small">' + g.done + "/" + g.of + " " + t("practice", "geübt") + "</span></span></p>";
          }).join("")) +
          ui.card("<h2>" + t("My practice packs", "Meine Übungspakete") + "</h2>" + packs +
            (done && hasPack ? '<div class="banner ok">' + t("Well done! Frau Weber can see that you mastered it.", "Super! Frau Weber sieht, dass du es geschafft hast.") + "</div>" : ""), "emph") +
        "</div>" +
        ui.note("Practising is simulated: each click counts one solved question. 5 of 5 closes the red flag (T5, P1).");
    }
  });
})();
