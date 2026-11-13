// S2 Upload / scan exam (A-WF 01)

(function () {
  var ui = LS.ui, d = LS.data, t = LS.t;

  // ---------- S2 Upload / scan exam (A-WF 01) ----------
  LS.action("takePhoto", function () { LS.state.upload = "check"; });
  LS.action("retake", function () { LS.state.upload = "ok"; });
  LS.action("send", function () { LS.state.upload = "sent"; LS.state.rescan = false; });

  LS.screen({
    id: "S2", role: "student", title: "Upload / scan exam", source: "A-WF 01",
    render: function (st) {
      var u = st.upload;
      var add = ui.card(
        "<h2>1. " + t("Add your paper", "Füge dein Blatt hinzu") + "</h2>" +
        '<div class="dropzone">' +
          "<p><b>" + t("Drag your paper here", "Zieh dein Blatt hierher") + "</b></p><p class=\"muted\">" + t("or", "oder") + "</p>" +
          ui.btn(t("Take a photo", "Foto machen"), { action: "takePhoto", primary: true }) +
          ui.btn(t("Choose a file", "Datei wählen"), { action: "takePhoto" }) +
        "</div>");

      var checkInner = "<h2>2. " + t("Check the picture", "Prüf das Bild") + "</h2>";
      if (u === "empty") {
        checkInner += '<p class="muted">' + t("Your picture will show up here.", "Hier erscheint dein Bild.") + "</p>";
      } else {
        var warn = u === "check"
          ? '<div class="banner warn">' + t("The picture is a bit dark. Try again near a window!", "Das Bild ist etwas dunkel. Versuch es nochmal am Fenster!") + "</div>"
          : '<div class="banner ok">' + t("Looks good!", "Sieht gut aus!") + "</div>";
        checkInner += '<div class="split even">' + ui.ph(d.exam.file, 140) + '<div class="stack">' + warn +
          (u === "sent" ? "" : '<div class="row">' + ui.btn(t("Retake", "Nochmal"), { action: "retake" }) + ui.btn(t("Rotate / Crop", "Drehen / Zuschneiden"), { action: "retake" }) + "</div>") +
          "</div></div>";
      }
      var send = ui.card(
        "<h2>3. " + t("Send it", "Abschicken") + "</h2>" +
        '<div class="row">' + ui.btn(t("Send to my teacher", "An meine Lehrerin schicken"), { action: "send", primary: true, disabled: u !== "ok" }) +
        '<span class="muted">' + t("Enabled when the picture check passes.", "Geht, sobald das Bild passt.") + "</span></div>" +
        '<div class="status-line">' + t("Status after sending", "Status nach dem Senden") + ": " +
          ui.chip(u === "sent" ? t("Waiting for my teacher", "Wartet auf meine Lehrerin") : "-", u === "sent" ? "ok" : "") + "</div>");

      return "<h1>" + t("Hi", "Hallo") + " " + d.student.first + "!</h1>" +
        '<p class="muted">' + t("Pick your exam and send it to your teacher.", "Wähle deine Prüfung und schick sie deiner Lehrerin.") + "</p>" +
        (st.rescan ? '<div class="banner warn">' + t("Your teacher asked for a new photo of your Fractions Quiz.", "Deine Lehrerin möchte ein neues Foto von deinem Brüche-Quiz.") + "</div>" : "") +
        '<div class="split">' +
          '<div class="stack"><h2>' + t("My assessments", "Meine Prüfungen") + "</h2>" + LS.ui.assessmentList(true) + "</div>" +
          '<div class="stack">' + add + ui.card(checkInner) + send + "</div>" +
        "</div>" +
        ui.note("States: empty / upload failed (retry) / success. The picture check is simulated: the first photo is always too dark.");
    }
  });
})();
