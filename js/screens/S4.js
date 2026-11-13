// S4 My Trail: progress across exams (A-WF 06)

(function () {
  var ui = LS.ui, d = LS.data, t = LS.t;

  // ---------- S4 My Trail: progress across exams (A-WF 06) ----------
  LS.action("practice", function () {
    if (LS.state.sheetsDone < d.nextGoal.sheets) LS.state.sheetsDone++;
  });

  LS.screen({
    id: "S4", role: "student", title: "My Trail: progress across exams", source: "A-WF 06",
    render: function (st) {
      var max = 3;
      var bars = d.journey.map(function (j) {
        return '<div class="bar-col"><div class="bar' + (j.next ? " next" : "") + '" style="height:' + (j.next ? 20 : 20 + j.stars / max * 100) + 'px"></div>' +
          "<span>" + j.exam + (j.next ? " (" + t("next!", "als Nächstes!") + ")" : "") + "</span></div>";
      }).join("");
      var skills = d.skills.map(function (s) {
        return '<div class="row between"><span>' + s.name + "</span>" + ui.dots(s.level) + "</div>";
      }).join("");
      var done = st.sheetsDone >= d.nextGoal.sheets;
      return "<h1>" + t("My journey", "Meine Reise") + "</h1>" +
        '<div class="split even">' +
          ui.card("<h2>" + t("Stars per exam", "Sterne pro Prüfung") + '</h2><div class="bars">' + bars + "</div>") +
          ui.card("<h2>" + t("My skills", "Meine Fähigkeiten") + '</h2><div class="stack tight">' + skills + "</div>") +
        "</div>" +
        ui.card("<h2>" + t("Next goal", "Nächstes Ziel") + "</h2><p>" + d.nextGoal.text + "</p>" +
          '<progress max="' + d.nextGoal.sheets + '" value="' + st.sheetsDone + '"></progress> ' +
          '<span class="muted">' + st.sheetsDone + " " + t("of", "von") + " " + d.nextGoal.sheets + " " + t("sheets", "Blättern") + "</span><p>" +
          (done ? ui.chip(t("Badge unlocked", "Abzeichen freigeschaltet") + ": " + d.nextGoal.badge, "ok")
                : ui.btn(t("Start practice", "Üben starten"), { action: "practice", primary: true })) + "</p>", "emph") +
        ui.note("No percentages and no red marks. Skill levels shown as friendly dots.");
    }
  });
})();
