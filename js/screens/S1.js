// S1 Student home + notifications (Figma frame "S1 - Student home + notifications")

(function () {
  var ui = LS.ui, d = LS.data, t = LS.t;

  // Tile icons (same drawings as the Figma frame S1): camera, star, pencil, trail.
  var svg = function (body) {
    return '<svg width="56" height="56" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' + body + "</svg>";
  };
  var ICONS = {
    upload: svg('<rect x="6" y="14" width="36" height="26" rx="4"/><circle cx="24" cy="27" r="7"/><path d="M17 14l3-5h8l3 5"/>'),
    results: svg('<path d="M24 6l5.3 11 12 1.6-8.8 8.3 2.2 11.9L24 33l-10.7 5.8 2.2-11.9L6.7 18.6l12-1.6z"/>'),
    practice: svg('<path d="M12 36l3-10L32 9l7 7-17 17z"/><path d="M28 13l7 7"/><path d="M12 36l10-3"/>'),
    progress: svg('<circle cx="10" cy="37" r="4"/><circle cx="24" cy="22" r="4"/><circle cx="38" cy="10" r="4"/><path d="M13 34l8-9"/><path d="M27 19l8-6"/>')
  };

  LS.screen({
    id: "S1", role: "student", title: "Student home", source: "Figma S1",
    headTitle: function () { return t("Home", "Start"); },
    render: function (st) {
      var newResult = st.published && !st.seenResult;
      var sub = st.published
        ? (newResult ? t("You have new results to look at.", "Du hast neue Ergebnisse.") : t("Your teacher has checked your Fractions Quiz.", "Deine Lehrerin hat dein Brüche-Quiz angeschaut."))
        : st.upload === "sent" ? t("Frau Weber is checking your Fractions Quiz.", "Frau Weber schaut sich dein Brüche-Quiz an.")
        : st.rescan ? t("Your teacher asked for new photos.", "Deine Lehrerin möchte neue Fotos.")
        : t("Take photos of your Fractions Quiz.", "Mach Fotos von deinem Brüche-Quiz.");

      var tile = function (icon, title, text, go, extra, badge) {
        return '<a href="#" class="card tile' + (extra || "") + '" data-go="' + go + '"><span class="tile-icon" aria-hidden="true">' + ICONS[icon] + "</span>" +
          "<h2>" + title + "</h2>" + (badge || '<p class="muted small">' + text + "</p>") + "</a>";
      };
      var tiles = '<div class="grid-4">' +
        tile("upload", t("Upload exam", "Prüfung hochladen"), t("Take photos of your paper", "Fotografiere dein Blatt"), "S2", st.upload === "sent" ? "" : " emph") +
        tile("results", t("My results", "Meine Ergebnisse"), st.published ? t("Fractions Quiz", "Brüche-Quiz") : t("Not ready yet", "Noch nicht fertig"), "S3", newResult ? " emph" : "",
          newResult ? ui.pill(t("1 new", "1 neu"), { kind: "dark" })
            : !st.published && st.upload === "sent" ? ui.pill(t("Waiting for my teacher", "Wartet auf meine Lehrerin"), { on: true }) : null) +
        tile("practice", t("Practice", "Üben"), st.published && st.packAttach ? t("1 pack from ", "1 Paket von ") + d.teacher.name : t("Nothing yet", "Noch nichts"), "S4") +
        tile("progress", t("My progress", "Mein Fortschritt"), t("See how you grow", "So wächst du"), "S4") +
        "</div>";

      var msgs = st.published
        ? '<div class="msg"><div><b>' + t("New feedback on your Fractions Quiz", "Neues Feedback zu deinem Brüche-Quiz") + '</b><p class="muted small">"' + LS.esc(st.well) + '"</p></div>' +
            '<div class="row">' + ui.btn(t("Read aloud", "Vorlesen"), { action: "say", arg: st.well + " " + st.next }) + ui.btn(t("Open", "Öffnen"), { go: "S3", primary: true }) + "</div></div>" +
          (st.packAttach
            ? '<div class="msg"><div><b>' + t("Practice for you: comparing fractions", "Übung für dich: Brüche vergleichen") + '</b><p class="muted small">' + t("About 10 minutes", "Etwa 10 Minuten") + "</p></div>" +
                '<div class="row">' + ui.btn(t("Read aloud", "Vorlesen"), { action: "say", arg: "Practice for you: comparing fractions" }) + ui.btn(t("Start", "Los"), { go: "S4" }) + "</div></div>"
            : "")
        : '<p class="muted">' + t("No messages yet. Your teacher will write to you here.", "Noch keine Nachrichten. Deine Lehrerin schreibt dir hier.") + "</p>";

      return "<h1>" + t("Hi", "Hallo") + " " + d.student.first + '!</h1><p class="muted">' + sub + "</p>" + tiles +
        ui.card("<h2>" + t("Messages from my teacher", "Nachrichten von meiner Lehrerin") + "</h2>" + msgs);
    }
  });
})();
