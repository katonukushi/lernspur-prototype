// S2 Upload / scan exam (Figma frame "S2 - Upload / scan exam")
// Photo quality is simulated: the second photo is always blurry, a retake fixes it.

(function () {
  var ui = LS.ui, d = LS.data, t = LS.t;
  var selected = 0;

  LS.action("examLang", function (v) { LS.state.examLang = v; });
  LS.action("photo", function () {
    var p = LS.state.pages;
    p.push({ status: p.length === 1 ? "blurry" : "clear" });
    selected = p.length - 1;
  });
  LS.action("retake", function () {
    var p = LS.state.pages;
    var i = p[selected] && p[selected].status === "blurry" ? selected : p.findIndex(function (x) { return x.status === "blurry"; });
    if (i >= 0) { p[i].status = "clear"; selected = i; }
  });
  LS.action("retakePage", function (i) { LS.state.pages[+i].status = "clear"; selected = +i; });
  LS.action("deletePage", function (i) { LS.state.pages.splice(+i, 1); selected = Math.max(0, LS.state.pages.length - 1); });
  LS.action("selectPage", function (i) { selected = +i; });
  LS.action("send", function () { LS.state.upload = "sent"; LS.state.rescan = false; });

  LS.screen({
    id: "S2", role: "student", title: "Upload exam", source: "Figma S2", back: ["Back", "S1"],
    headTitle: function () { return t("Upload exam", "Prüfung hochladen"); },
    render: function (st) {
      var pages = st.pages, sent = st.upload === "sent", ok = LS.photosOk();
      var step = sent ? 3 : ok ? 2 : 1;
      var stepper = ui.stepper([t("Choose exam", "Prüfung wählen"), t("Take photos", "Fotos machen"), t("Check", "Prüfen"), t("Send", "Senden")], step, step);

      var info = ui.card("<h2>" + d.exam.title + " · " + d.exam.date + " · " + d.exam.pagesExpected + " " + t("pages expected", "Seiten erwartet") + " [demo]</h2>" +
        '<div class="row wrap"><span class="muted">' + t("My exam is in:", "Meine Prüfung ist auf:") + "</span>" +
          ui.pill((st.examLang === "EN" ? "(o)" : "( )") + " English", { action: "examLang", arg: "EN", on: st.examLang === "EN", disabled: sent }) +
          ui.pill((st.examLang === "DE" ? "(o)" : "( )") + " Deutsch", { action: "examLang", arg: "DE", on: st.examLang === "DE", disabled: sent }) + "</div>");

      var camera = ui.card('<div class="camera">' + '<div class="frame">' + t("Put your page inside the frame", "Leg dein Blatt in den Rahmen") + "</div></div>" +
        '<div class="row between">' + ui.btn(t("Choose a file", "Datei wählen"), { action: "photo", disabled: sent || pages.length >= 4 }) +
          ui.btn(t("Take photo", "Foto machen"), { action: "photo", primary: true, disabled: sent || pages.length >= 4 }) +
          ui.btn(t("Retake", "Nochmal"), { action: "retake", disabled: sent || !pages.some(function (p) { return p.status === "blurry"; }) }) + "</div>");

      var last = pages[selected];
      var check = !last
        ? '<p class="muted small">' + t("Take a photo of page 1.", "Mach ein Foto von Seite 1.") + "</p>"
        : last.status === "clear"
          ? '<p class="row"><span class="dots"><i class="on"></i><i class="on"></i><i class="on"></i></span><b>' + t("Clear - great!", "Scharf - super!") + "</b></p>"
          : '<p class="row"><span class="dots"><i class="on"></i><i></i><i></i></span><b>' + t("Too blurry - hold still", "Zu unscharf - halt still") + "</b></p>";

      var thumbs = pages.map(function (p, i) {
        return '<div class="thumb-col"><button type="button" class="thumb' + (i === selected ? " on" : "") + '" data-action="selectPage" data-arg="' + i + '">' + t("Page", "Seite") + " " + (i + 1) + "</button>" +
          "<b>" + (p.status === "clear" ? t("Clear", "Scharf") : t("Blurry", "Unscharf")) + "</b>" +
          (p.status === "clear" ? ui.btn(t("Delete", "Löschen"), { action: "deletePage", arg: i, disabled: sent })
                                : ui.btn(t("Retake", "Nochmal"), { action: "retakePage", arg: i, disabled: sent })) + "</div>";
      }).join("") + (sent ? "" : '<button type="button" class="thumb add" data-action="photo">+ ' + t("Add", "Neu") + "</button>");

      var side = '<div class="stack">' +
        ui.card("<h2>" + t("Photo check", "Foto-Check") + "</h2>" + check) +
        ui.card("<h2>" + t("My pages", "Meine Seiten") + " (" + pages.length + " " + t("of", "von") + " " + d.exam.pagesExpected + ")</h2>" +
          '<div class="thumbs">' + thumbs + '</div><p class="muted small">' + t("Drag a page to change the order.", "Zieh eine Seite, um die Reihenfolge zu ändern.") + "</p>") +
        ui.card(sent
          ? '<div class="banner ok">' + t("Sent! Waiting for my teacher.", "Gesendet! Wartet auf meine Lehrerin.") + "</div>" + ui.btn(t("Back home", "Zurück zum Start"), { go: "S1" })
          : ui.btn(t("Send to my teacher", "An meine Lehrerin senden"), { action: "send", primary: true, disabled: !ok, cls: "block" }) +
            '<p class="muted small">' + t("Works when all pages are clear.", "Geht, wenn alle Seiten scharf sind.") + "</p>" +
            "<p class=\"small\">" + t("After sending: \"Waiting for my teacher\"", "Danach: \"Wartet auf meine Lehrerin\"") + "</p>") +
        "</div>";

      return '<div class="center">' + stepper + "</div>" +
        (st.rescan ? '<div class="banner warn">' + t("Your teacher asked for new photos of your Fractions Quiz.", "Deine Lehrerin möchte neue Fotos von deinem Brüche-Quiz.") + "</div>" : "") +
        '<div class="split wide-left"><div class="stack">' + info + camera + "</div>" + side + "</div>" +
        ui.note("Simulated: the second photo always comes out blurry, so the retake can be shown.");
    }
  });
})();
