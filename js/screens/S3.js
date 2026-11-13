// S3 Results with child-friendly feedback (Figma frame "S3 - Results with child-friendly feedback", LernSpur step 3)

(function () {
  var ui = LS.ui, d = LS.data, t = LS.t;

  LS.action("view", function (v) { LS.state.view = v; });
  LS.action("paper", function () { LS.state.showPaper = !LS.state.showPaper; });
  LS.action("help", function () { LS.state.showHelp = !LS.state.showHelp; });
  LS.action("thanks", function () { LS.state.thanked = true; });
  LS.action("endPreview", function () { LS.state.preview = false; return "T6"; });

  var SYMBOL = { "Right": "✓", "Partly right": "½", "Let's practise": "→" };
  var DE = { "Right": "Richtig", "Partly right": "Teilweise richtig", "Let's practise": "Üben wir" };

  LS.screen({
    id: "S3", role: "student", title: "Results", source: "Figma S3", back: ["Home", "S1"],
    headTitle: function () { return d.exam.title; },
    onEnter: function (st) { if (st.published && !st.preview) st.seenResult = true; },
    render: function (st) {
      if (!st.published && !st.preview) {
        return ui.card("<h1>" + t("Not ready yet", "Noch nicht fertig") + '</h1><p class="muted">' +
          t("Your teacher is still checking your paper. You will get a message when your result is ready.",
            "Deine Lehrerin schaut dein Blatt noch an. Du bekommst eine Nachricht, wenn dein Ergebnis fertig ist.") + "</p>" +
          ui.btn(t("Back home", "Zurück zum Start"), { go: "S1" })) +
          ui.note("The grade is only visible after the teacher confirmed it and published the feedback (T3, T6).");
      }
      var stars = LS.starsFor(LS.total());
      var spoken = st.well + " " + st.next;
      var pic = st.view === "picture";

      var preview = st.preview ? '<div class="banner info">Preview as pupil - not sent yet. ' + ui.btn("Back to feedback (T6)", { action: "endPreview", small: true }) + "</div>" : "";

      var left = ui.card('<div class="center stack tight">' + '<p class="big-stars">' + ui.stars(stars) + "</p>" +
        "<p><b>" + stars + " " + t("of 5 stars", "von 5 Sternen") + "</b></p><p class=\"lead\">" + t("Good work", "Gut gemacht") + ", " + d.student.first + "!</p>" +
        '<button type="button" class="play" data-action="say" data-arg="' + LS.esc(spoken) + '">' + t("Play", "Abspielen") + "</button>" +
        "<p><b>" + t("Listen to my feedback", "Mein Feedback anhören") + '</b></p><p class="muted small">' + t("Checked by", "Angeschaut von") + " " + d.teacher.name + "</p>" +
        '<div class="row">' + ui.pill(t("Picture view", "Bilder"), { action: "view", arg: "picture", on: pic }) + ui.pill(t("Text view", "Text"), { action: "view", arg: "text", on: !pic }) + "</div></div>", "tall");

      var well = ui.card("<h2>" + t("What I did well", "Das kann ich schon") + "</h2><p>" + LS.esc(st.well) + "</p>");
      var msg = ui.card("<h2>" + t("Message from", "Nachricht von") + " " + d.teacher.name + "</h2><p>" + d.message + "</p>" +
        '<div class="row wrap">' + ui.btn(t("Read aloud", "Vorlesen"), { action: "say", arg: d.message }) +
        (st.thanked ? ui.pill(t("Sent: Thank you!", "Gesendet: Danke!"), { on: true }) : ui.btn(t("Thank you", "Danke"), { action: "thanks", disabled: st.preview })) + "</div>");
      var practise = ui.card("<h2>" + t("Let's practise next", "Das üben wir als Nächstes") + "</h2><p>" + LS.esc(st.next) + "</p>" +
        '<div class="soft-box">' + d.example + "</div>" +
        (st.showHelp ? '<div class="banner info">' + d.extraHelp + "</div>" : "") +
        '<div class="row between wrap">' + ui.pill(t("Extra help from your teacher", "Extra-Hilfe von deiner Lehrerin"), { action: "help", on: st.showHelp }) +
          (st.packAttach ? ui.btn(t("Start practice", "Üben starten"), { go: "S4", primary: true, disabled: st.preview }) : "") + "</div>", "emph");
      var answers = ui.card('<div class="row between"><h2>' + t("My answers", "Meine Antworten") + "</h2>" + ui.btn(t("See my paper", "Mein Blatt ansehen"), { action: "paper" }) + "</div>" +
        '<div class="grid-3">' + LS.visibleQs().map(function (q, i) {
          var l = LS.answerLabel(q);
          return '<div class="card inner"><p class="muted small">' + t("Question", "Frage") + " " + (i + 1) + "</p>" +
            (pic ? '<p class="symbol">' + SYMBOL[l] + "</p>" : "") + "<b>" + t(l, DE[l]) + "</b></div>";
        }).join("") + "</div>" +
        (st.showPaper ? ui.ph(t("My paper with friendly teacher notes", "Mein Blatt mit Notizen"), 160) : ""));

      return preview + '<div class="split">' + left +
        '<div class="stack"><div class="split even">' + well + msg + "</div>" + practise + answers + "</div></div>" +
        ui.note("No percentages, no red marks, no AI confidence values for the student.");
    }
  });
})();
