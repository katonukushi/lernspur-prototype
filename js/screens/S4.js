// S4 My Trail: progress across exams + practice packs
// (Figma frames "S4 - My Trail", "M2 - S4 - Mission done" and "S4b - My Trail - after the practice mission")

(function () {
  var ui = LS.ui, d = LS.data, t = LS.t;

  LS.action("practise", function () { if (LS.state.practice < d.pack.size) LS.state.practice++; });
  LS.action("missionSeen", function () { LS.state.missionSeen = true; });

  function packRow(name, done, sub, action) {
    return '<div class="item-row"><div><b class="row">' + ui.check(done, name) + name + "</b>" +
      (sub ? '<p class="muted small">' + sub + "</p>" : "") + "</div>" +
      (done ? "<span><b>" + t("Done", "Fertig") + "</b></span>" : action) + "</div>";
  }

  // Figma "M2 - S4 - Mission done": shown once, right after the last practice question.
  function missionDone() {
    var name = t("Comparing fractions", "Brüche vergleichen");
    var closed = LS.flagClosed();
    return ui.card('<div class="center stack tight"><h1>' + t("Mission done!", "Mission geschafft!") + "</h1>" +
        '<p class="lead">' + t("You finished:", "Du hast geschafft:") + " " + name + "</p>" +
        '<p class="muted lead">' + t("Great work", "Super gemacht") + ", " + d.student.first + "!</p></div>", "emph") +
      '<div class="grid-3">' +
        ui.card("<h2>" + t("My practice packs", "Meine Übungspakete") + "</h2>" +
          d.otherPacks.map(function (p) { return packRow(p.name, true); }).join("") + packRow(name, true)) +
        ui.card("<h2>" + t("My Trail", "Meine Spur") + "</h2><p><b>" + name + '</b><br><span class="row">' +
          ui.progress(d.pack.size, d.pack.size) + '<span class="small">' + d.pack.size + "/" + d.pack.size + " " + t("practice", "geübt") + "</span></span></p>" +
          ui.pill(t("Now in: Skills I've got", "Jetzt bei: Das kann ich"), { on: true })) +
        ui.card("<h2>" + t("Extra help from your teacher", "Extra-Hilfe von deiner Lehrerin") + "</h2>" +
          '<p class="big-word">' + (closed ? t("Finished!", "Fertig!") : t("Pack finished!", "Paket fertig!")) + "</p>" +
          '<p class="muted small">' + (closed ? t("Frau Weber has looked at your answers.", "Frau Weber hat deine Antworten angeschaut.")
                                              : t("Frau Weber will look at your answers.", "Frau Weber schaut sich deine Antworten an.")) + "</p>", "emph") +
      "</div>" +
      '<div class="row end">' + ui.btn(t("Back to My Trail", "Zurück zu meiner Spur"), { action: "missionSeen", primary: true }) + "</div>";
  }

  LS.screen({
    id: "S4", role: "student", title: "My Trail", source: "Figma S4, M2, S4b", back: ["Home", "S1"],
    headTitle: function () { return t("My Trail", "Meine Spur"); },
    render: function (st) {
      var hasPack = st.published && st.packAttach;
      var done = LS.packDone();
      if (hasPack && done && !st.missionSeen) return missionDone();

      var exams = d.exams.map(function (e, i) {
        var stars = e.current ? (st.published ? LS.starsFor(LS.total()) : null) : e.stars;
        return (i ? '<span class="trail-line"></span>' : "") +
          '<div class="card inner exam-card"><p class="muted small">' + e.label + " · " + e.date + "</p>" +
          (stars ? '<p class="big-stars">' + ui.stars(stars) + '</p><p class="small">' + stars + " " + t("of 5 stars", "von 5 Sternen") + "</p>"
                 : '<p class="small muted">' + t("Your teacher is checking", "Wird angeschaut") + "</p>") + "</div>";
      }).join("");

      var name = t("Comparing fractions", "Brüche vergleichen");
      var mastered = hasPack && done;
      var got = d.skillsGot.concat(mastered ? [name] : []);
      var growing = (mastered ? [] : [{ name: name, done: st.practice, of: d.pack.size }]).concat(d.skillsGrowing);

      var packs = d.otherPacks.map(function (p) { return packRow(p.name, true); }).join("") + (hasPack
        ? packRow(name, done, done ? "" : t("From", "Von") + " " + d.teacher.name,
            ui.btn(st.practice > 2 ? t("Next question", "Nächste Frage") + " (" + st.practice + "/" + d.pack.size + ")" : t("Start", "Los"), { action: "practise", primary: true }))
        : '<p class="muted small">' + t("New packs from your teacher show up here.", "Neue Pakete von deiner Lehrerin erscheinen hier.") + "</p>");

      return '<div class="row end">' + ui.pill("Math", { on: true }) + ui.pill("Science") + "</div>" +
        ui.card("<h2>" + t("My exams", "Meine Prüfungen") + '</h2><div class="trail exams">' + exams + "</div>" +
          '<p class="muted small">' + t("Only your own exams. No class ranking.", "Nur deine eigenen Prüfungen. Kein Vergleich mit der Klasse.") + "</p>") +
        '<div class="grid-3">' +
          ui.card("<h2>" + t("Skills I've got", "Das kann ich") + '</h2><div class="stack tight">' + got.map(function (s) { return '<span class="pill big">' + s + "</span>"; }).join("") + "</div>") +
          ui.card("<h2>" + t("Skills I'm growing", "Daran wachse ich") + "</h2>" + growing.map(function (g) {
            return "<p><b>" + g.name + '</b><br><span class="row">' + ui.progress(g.done, g.of) + '<span class="small">' + g.done + "/" + g.of + " " + t("practice", "geübt") + "</span></span></p>";
          }).join("")) +
          ui.card("<h2>" + t("My practice packs", "Meine Übungspakete") + "</h2>" + packs, "emph") +
        "</div>" +
        ui.note("Practising is simulated: each click counts one solved question. After 5 of 5 the teacher can close the support focus (T5).");
    }
  });
})();
