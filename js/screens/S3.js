// S3 Results with child-friendly feedback (A-WF 04)

(function () {
  var ui = LS.ui, d = LS.data, t = LS.t;

  // ---------- S3 Results with child-friendly feedback (A-WF 04) ----------
  LS.action("hear", function () {
    var text = d.results.tip[LS.state.hintLang] + " " + LS.state.feedback;
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = LS.state.hintLang === "DE" ? "de-DE" : "en-US";
      speechSynthesis.speak(u);
    } catch (e) { /* no speech in this browser */ }
    return false;
  });
  LS.action("hintLang", function (l) { LS.state.hintLang = l; });
  LS.action("paper", function () { LS.state.showPaper = !LS.state.showPaper; });

  LS.screen({
    id: "S3", role: "student", title: "Results with child-friendly feedback", source: "A-WF 04",
    onEnter: function (st) { if (st.published) st.seenNews = true; },
    render: function (st) {
      if (!st.published && !st.preview) {
        return "<h1>" + d.exam.title + "</h1>" + ui.card('<p class="muted">' +
          t("Your teacher is still looking at your paper. You will get a message when your result is ready.",
            "Deine Lehrerin schaut sich dein Blatt noch an. Du bekommst eine Nachricht, wenn dein Ergebnis da ist.") + "</p>") +
          ui.note("The result is only visible after the teacher has confirmed the grade and published the feedback (T3, T6).");
      }
      var preview = st.preview ? '<div class="banner info">Preview as pupil. Not sent yet. ' + ui.btn("Back to feedback", { action: "endPreview", small: true }) + "</div>" : "";
      var well = d.results.didWell.map(function (w) { return ui.chip(w, "ok"); }).join(" ");
      var note = LS.esc(st.feedback).replace(/\n/g, "<br>");
      return preview + "<h1>" + t("Great effort", "Toll gemacht") + ", " + d.student.first + "!</h1>" +
        '<p class="muted">' + t(d.exam.title, d.exam.titleDe) + "</p>" +
        '<div class="split even">' +
          '<div class="stack">' +
            ui.card("<h2>" + t("What I did well", "Das kann ich schon") + "</h2>" + '<div class="row wrap">' + well + "</div>") +
            ui.card("<h2>" + t("Let's practice", "Das üben wir") + "</h2><p><b>" + d.results.practice + "</b></p>" +
              "<p>" + d.results.tip[st.hintLang] + "</p>" +
              '<div class="row wrap">' + ui.btn(t("Hear the tip", "Tipp anhören"), { action: "hear" }) +
              '<span class="muted">' + t("Show hint", "Hinweis") + ":</span>" +
              ui.btn("DE", { action: "hintLang", arg: "DE", small: true }) + ui.btn("EN", { action: "hintLang", arg: "EN", small: true }) + "</div>", "emph") +
          "</div>" +
          '<div class="stack">' +
            ui.card("<h2>" + t("Note from", "Nachricht von") + " " + d.teacher.name + "</h2><p>" + note + "</p>" +
              (st.attach ? "<p>" + ui.chip(d.attachment) + "</p>" : "")) +
            '<div class="row">' + ui.btn(t("See my paper", "Mein Blatt ansehen"), { action: "paper" }) +
              ui.btn(t("Start practice", "Üben starten"), { go: "S4", primary: true }) + "</div>" +
            (st.showPaper ? ui.ph(d.exam.file + " with teacher notes", 160) : "") +
          "</div>" +
        "</div>" +
        ui.note("No percentages. Teacher notes on the paper use friendly colors, no red marks. Progress bar to next badge shown on S4.");
    }
  });
})();
