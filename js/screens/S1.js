// S1 Student home + notifications (Figma frame "S1 - Student home + notifications")

(function () {
  var ui = LS.ui, d = LS.data, t = LS.t;

  LS.screen({
    id: "S1", role: "student", title: "Student home", source: "Figma S1",
    headTitle: function () { return t("Home", "Start"); },
    render: function (st) {
      var newResult = st.published && !st.seenResult;
      var sub = st.published
        ? (newResult ? t("You have new results to look at.", "Du hast neue Ergebnisse.") : t("Your teacher has checked your Fractions Quiz.", "Deine Lehrerin hat dein Brüche-Quiz angeschaut."))
        : st.upload === "sent" ? t("Your teacher is looking at your paper.", "Deine Lehrerin schaut sich dein Blatt an.")
        : st.rescan ? t("Your teacher asked for new photos.", "Deine Lehrerin möchte neue Fotos.")
        : t("Take photos of your Fractions Quiz.", "Mach Fotos von deinem Brüche-Quiz.");

      var tile = function (title, text, go, extra, badge) {
        return '<a href="#" class="card tile' + (extra || "") + '" data-go="' + go + '">' + ui.ph(t("picture", "Bild"), 90) +
          "<h2>" + title + "</h2>" + (badge || '<p class="muted small">' + text + "</p>") + "</a>";
      };
      var tiles = '<div class="grid-4">' +
        tile(t("Upload exam", "Prüfung hochladen"), t("Take photos of your paper", "Fotografiere dein Blatt"), "S2", st.upload === "sent" ? "" : " emph") +
        tile(t("My results", "Meine Ergebnisse"), st.published ? t("Fractions Quiz", "Brüche-Quiz") : t("Not ready yet", "Noch nicht fertig"), "S3", newResult ? " emph" : "",
          newResult ? ui.pill(t("1 new", "1 neu"), { kind: "dark" }) : null) +
        tile(t("Practice", "Üben"), st.published && st.packAttach ? t("1 pack from ", "1 Paket von ") + d.teacher.name : t("Nothing yet", "Noch nichts"), "S4") +
        tile(t("My progress", "Mein Fortschritt"), t("See how you grow", "So wächst du"), "S4") +
        "</div>";

      var msgs = st.published
        ? '<div class="msg"><div><b>' + t("New feedback on your Fractions Quiz", "Neues Feedback zu deinem Brüche-Quiz") + '</b><p class="muted small">"' + LS.esc(st.well) + '"</p></div>' +
            '<div class="row">' + ui.btn(t("Read aloud", "Vorlesen"), { action: "say", arg: st.well + " " + st.next }) + ui.btn(t("Open", "Öffnen"), { go: "S3", primary: true }) + "</div></div>" +
          (st.packAttach
            ? '<div class="msg"><div><b>' + t("Practice for you: comparing fractions", "Übung für dich: Brüche vergleichen") + '</b><p class="muted small">' + t("About 10 minutes [demo]", "Etwa 10 Minuten [demo]") + "</p></div>" +
                '<div class="row">' + ui.btn(t("Read aloud", "Vorlesen"), { action: "say", arg: "Practice for you: comparing fractions" }) + ui.btn(t("Start", "Los"), { go: "S4" }) + "</div></div>"
            : "")
        : '<p class="muted">' + t("No messages yet. Your teacher will write to you here.", "Noch keine Nachrichten. Deine Lehrerin schreibt dir hier.") + "</p>";

      return "<h1>" + t("Hi", "Hallo") + " " + d.student.first + '!</h1><p class="muted">' + sub + "</p>" + tiles +
        ui.card("<h2>" + t("Messages from my teacher", "Nachrichten von meiner Lehrerin") + "</h2>" + msgs);
    }
  });
})();
