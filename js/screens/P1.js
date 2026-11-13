// P1 Parent summary (bonus, decision D5; Figma frame "P1 - Parent summary", based on L-M2 W14)

(function () {
  var ui = LS.ui, d = LS.data, t = LS.t;

  LS.action("parentCompose", function () { LS.state.parentCompose = !LS.state.parentCompose; });
  LS.action("parentSend", function () { LS.state.parentSent = true; LS.state.parentCompose = false; });

  LS.screen({
    id: "P1", role: "parent", title: "Parent summary", source: "Figma P1",
    render: function (st) {
      var current = st.published
        ? "<b>" + LS.scoreText(LS.total()) + "</b>"
        : ui.pill(t("Being checked", "Wird geprüft"));
      var results = d.parentResults.map(function (r) {
        return '<div class="item-row"><span>' + r.label + "</span>" + ui.pill(t("Being checked", "Wird geprüft")) + "</div>";
      }).join("") +
        '<div class="item-row"><span>' + d.exam.short + " · " + d.exam.date + "</span>" + current + "</div>" +
        d.exams.filter(function (e) { return e.id === "t2" || e.id === "t1"; }).reverse().map(function (e) {
          return '<div class="item-row"><span>' + e.label + " · " + e.date + "</span><b>" + e.stars + " " + t("of 5 stars", "von 5 Sternen") + " - " + e.score + " [demo]</b></div>";
        }).join("");

      var heights = d.exams.map(function (e) {
        var stars = e.current ? (st.published ? LS.starsFor(LS.total()) : 0) : e.stars;
        return '<div class="bar-col"><div class="bar" style="height:' + (stars * 22 + 4) + 'px"></div><span class="muted tiny">' + (e.current ? "Fr. Quiz" : e.label) + "</span></div>";
      }).join("");

      var showFlag = st.flag === "confirmed" && st.published;
      var teacher = showFlag
        ? "<h3>" + (LS.flagClosed() ? t("Tim mastered: comparing fractions", "Tim kann jetzt: Brüche vergleichen") : t("Tim is practising: comparing fractions", "Tim übt: Brüche vergleichen")) + "</h3>" +
          '<p class="muted small">' + t("Confirmed by", "Bestätigt von") + " " + d.teacher.name + " " + t("on Oct 10 [demo]", "am 10. Okt. [demo]") + "</p>" +
          ui.progress(st.practice, d.pack.size) + '<p class="small">' + t("Practice pack", "Übungspaket") + ": " + st.practice + " " + t("of", "von") + " " + d.pack.size + " " + t("questions done", "Fragen geschafft") + "</p>"
        : '<p class="muted">' + t("No concerns right now.", "Im Moment keine Auffälligkeiten.") + "</p>";

      var compose = st.parentCompose
        ? ui.card('<textarea class="field" rows="3" data-bind="parentMsg" placeholder="' + t("Write to", "Schreiben an") + " " + d.teacher.name + ' ...">' + LS.esc(st.parentMsg) + "</textarea>" +
            '<div class="row end">' + ui.btn(t("Cancel", "Abbrechen"), { action: "parentCompose" }) + ui.btn(t("Send", "Senden"), { action: "parentSend", primary: true }) + "</div>")
        : st.parentSent ? '<div class="banner ok">' + t("Message sent to", "Nachricht gesendet an") + " " + d.teacher.name + ".</div>" : "";

      return '<div class="page-head"><div><h1>' + d.student.name + " · Grade " + d.student.grade + " · " + t("Mathematics", "Mathematik") + "</h1>" +
        '<p class="muted">' + t("Everything here has been checked by the teacher.", "Alles hier wurde von der Lehrerin geprüft.") + "</p></div>" +
        ui.btn(t("Message", "Nachricht an") + " " + d.teacher.name, { action: "parentCompose" }) + "</div>" + compose +
        '<div class="split wide-left"><div class="stack">' +
          ui.card("<h2>" + t("Latest results", "Neueste Ergebnisse") + "</h2>" + results) +
          ui.card("<h2>" + t("Progress this term", "Fortschritt in diesem Halbjahr") + '</h2><div class="bars">' + heights + "</div>" +
            '<div class="row wrap"><span class="muted small">' + t("Improved:", "Besser geworden:") + "</span>" + d.improved.map(function (s) { return ui.pill(s); }).join("") + "</div>") +
        "</div>" + ui.card("<h2>" + t("From the teacher", "Von der Lehrerin") + "</h2>" + teacher, "emph tall") + "</div>" +
        ui.note("Only results and flags the teacher has confirmed and released are shown here.");
    }
  });
})();
