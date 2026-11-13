// P1 Parent summary (bonus, decision D5). Phone layout.
// Figma frames "P1 - Parent summary", "P1b - ... before publication", "P1c - Message Frau Weber (sheet)".
// Based on Leena's P1 wireframes (P1-1 to P1-4), with the team's demo data.

(function () {
  var ui = LS.ui, d = LS.data, t = LS.t;

  LS.action("parentCompose", function () { LS.state.parentCompose = !LS.state.parentCompose; LS.state.parentSent = false; });
  LS.action("parentQuick", function (text) { LS.state.parentMsg = text; });
  LS.action("parentSend", function () {
    if (!LS.state.parentMsg.trim()) return false;
    LS.state.parentSent = true; LS.state.parentCompose = false; LS.state.parentMsg = "";
  });

  function check() { return '<span class="check" aria-hidden="true">✓</span>'; }

  // Score per checked exam, y-axis 0-100 %. The current exam is a dashed placeholder until it is published.
  function trailChart(points, pending) {
    var W = 340, G = 40, top = 24, plot = 110, H = 150;
    var xs = [1, 3, 5, 7].map(function (i) { return G + (W - G) / 8 * i; });
    var y = function (pct) { return top + (1 - pct / 100) * plot; };
    var s = '<svg class="trail-chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' +
      t("Score per checked exam", "Ergebnis pro geprüfter Prüfung") + '">';
    [100, 50, 0].forEach(function (p) {
      s += '<line class="grid" x1="' + G + '" x2="' + W + '" y1="' + y(p) + '" y2="' + y(p) + '"/>' +
        '<text class="axis" x="0" y="' + (y(p) + 4) + '">' + p + " %</text>";
    });
    var last = pending ? points[2] : points[3];
    var pts = points.map(function (p, i) { return [xs[i], y(i === 3 && pending ? last : p)]; });
    for (var i = 0; i < 3; i++) {
      var dashed = pending && i === 2;
      s += '<line class="' + (dashed ? "line pending" : "line") + '" x1="' + pts[i][0] + '" y1="' + pts[i][1] + '" x2="' + pts[i + 1][0] + '" y2="' + pts[i + 1][1] + '"/>';
    }
    pts.forEach(function (p, i) {
      var pend = pending && i === 3, cur = !pending && i === 3;
      s += '<circle class="pt' + (pend ? " pending" : cur ? " current" : "") + '" cx="' + p[0] + '" cy="' + p[1] + '" r="6"/>';
      s += pend
        ? '<text class="pt-label muted" x="' + W + '" y="' + (p[1] + 22) + '" text-anchor="end">' + t("Being checked", "Wird geprüft") + "</text>"
        : '<text class="pt-label" x="' + Math.min(p[0], W - 16) + '" y="' + (p[1] - 12) + '" text-anchor="middle">' + points[i] + " %</text>";
    });
    return s + "</svg>";
  }

  function examCols(cells) {
    return '<div class="exam-cols">' + cells.map(function (c) { return "<div>" + c + "</div>"; }).join("") + "</div>";
  }

  LS.screen({
    id: "P1", role: "parent", title: "Parent summary", source: "Figma P1, Leena P1-1 to P1-4",
    render: function (st) {
      var pub = st.published;
      var total = LS.total(), pct = LS.pct(total), stars = LS.starsFor(total);
      var past = d.exams.filter(function (e) { return !e.current; });

      // ---------- latest result ----------
      var latest = pub
        ? '<div class="score-row"><span class="score-big">' + total + "/" + d.exam.maxPoints + "</span>" +
            '<div class="stack tight">' + ui.stars(stars) + '<span class="muted small">' + stars + " " + t("of 5 stars", "von 5 Sternen") + " · " + pct + " %</span></div></div>" +
          '<span class="pill">' + check() + " " + t("Checked by", "Geprüft von") + " " + d.teacher.name + "</span>" +
          "<p>" + t(d.parent.summary, "Tim war stark beim Multiplizieren. Er übt gerade, Brüche zu vergleichen. Frau Weber hat ihm ein kurzes Übungspaket gegeben.") + "</p>"
        : '<div class="gate"><span class="gate-icon" aria-hidden="true">◷</span><div><b>' +
            t("Frau Weber is checking Tim's latest exam", "Frau Weber prüft gerade Tims letzte Prüfung") + '</b><p class="muted small">' +
            t("You will get a notification when she publishes the result. Scores are never shown before the teacher has checked them.",
              "Sie bekommen eine Benachrichtigung, sobald sie das Ergebnis freigibt. Noten erscheinen nie, bevor die Lehrkraft sie geprüft hat.") +
          "</p></div></div>";

      var rows = [{ label: d.exam.short, date: d.exam.date, lang: st.examLang, points: pub ? total + "/" + d.exam.maxPoints : null }]
        .concat(past.slice().reverse().map(function (e) { return { label: e.label, date: e.date, lang: e.lang, points: e.points }; }))
        .map(function (r) {
          return '<div class="result-row"><div><b>' + r.label + '</b><br><span class="muted tiny">' + r.date + "</span></div>" +
            '<span class="tag">' + r.lang + "</span>" +
            (r.points ? '<b class="pts">' + r.points + "</b>" : '<span class="pill dashed">' + t("Being checked", "Wird geprüft") + "</span>") + "</div>";
        }).join("");

      var latestCard = ui.card(
        '<div class="card-head"><h2>' + t("Latest result", "Letztes Ergebnis") + '</h2><span class="muted tiny">' + d.exam.short + " · " + d.exam.date + '</span><span class="tag">' + st.examLang + "</span></div>" +
        latest + '<div class="result-list">' + rows + "</div>");

      // ---------- learning trail ----------
      var pcts = past.map(function (e) { return e.pct; }).concat([pct]);
      var mistakes = d.trail[0].mistakes;
      var trailCard = ui.card(
        "<h2>" + t("Tim's Learning Trail", "Tims Lernspur") + "</h2>" +
        (pub ? ui.pill((pct - past[past.length - 1].pct >= 0 ? "+" : "") + (pct - past[past.length - 1].pct) + " " + t("points since", "Punkte seit") + " " + past[past.length - 1].label) : "") +
        '<p class="muted small">' + t("Score per checked exam, across English and German tests", "Ergebnis pro geprüfter Prüfung, über englische und deutsche Tests") + "</p>" +
        trailChart(pcts, !pub) +
        examCols(d.exams.map(function (e) { return '<span class="muted tiny">' + e.date + "<br>" + (e.current ? st.examLang : e.lang) + "</span>"; })) +
        '<h3 class="small">' + t("Comparing fractions: mistakes per exam", "Brüche vergleichen: Fehler pro Prüfung") + "</h3>" +
        examCols(mistakes.map(function (m, i) {
          if (i === 3 && !pub) return '<span class="cell dashed">...</span>';
          return '<span class="cell' + (m ? " hit" : "") + '">' + (m ? m + " " + t("wrong", "falsch") : t("none", "keine")) + "</span>";
        })) +
        '<p class="muted tiny">' + t("Each point is an exam Frau Weber has checked. Changes are shown in percentage points, never as \"mastery\".",
          "Jeder Punkt ist eine Prüfung, die Frau Weber geprüft hat. Veränderungen in Prozentpunkten, nie als \"beherrscht\".") + "</p>");

      // ---------- support focus (confirmed red flag) + practice mission ----------
      var focusCards = "";
      if (pub && st.flag === "confirmed") {
        var closed = LS.flagClosed(), packDone = LS.packDone();
        focusCards = ui.card(
          '<div class="card-head"><h2>' + t("From", "Von") + " " + d.teacher.name + "</h2></div>" +
          ui.pill(closed ? t("Support focus · finished", "Förderschwerpunkt · abgeschlossen") : t("Support focus · confirmed", "Förderschwerpunkt · bestätigt"), { kind: "on" }) +
          "<h3>" + t(d.parent.focusTitle, "Brüche mit verschiedenen Nennern vergleichen") + "</h3>" +
          '<p class="muted tiny">' + t("Confirmed by", "Bestätigt von") + " " + d.teacher.name + " " + t("on", "am") + " " + d.parent.confirmed + " · " + t("seen in 3 checked exams", "in 3 geprüften Prüfungen gesehen") + "</p>" +
          '<div class="soft-box"><p class="small"><b>' + t("What went well:", "Was gut lief:") + "</b> " + t(d.parent.wentWell, "Tim hat alle Malaufgaben richtig.") + "</p>" +
            '<p class="small"><b>' + t("How you can help at home:", "So können Sie zu Hause helfen:") + "</b> " + t(d.parent.helpAtHome, "Zeichnen Sie zwei gleich lange Balken und teilen Sie beide in gleich große Teile. Vergleichen Sie dann die gefärbten Teile.") + "</p></div>" +
          fractionBar("3/4 = 6/8", 6) + fractionBar("5/8", 5) +
          '<p class="muted tiny">' + t("Six equal eighths are more than five, so 3/4 is bigger than 5/8.", "Sechs gleiche Achtel sind mehr als fünf, also ist 3/4 größer als 5/8.") + "</p>",
          "focus-card");

        var steps = [
          { state: "done", title: t("Assigned", "Zugewiesen") + " · " + d.parent.confirmed, sub: t("Tim can open it in his own view", "Tim findet es in seiner eigenen Ansicht") },
          { state: packDone ? "done" : "current", title: packDone ? t("Tim finished the practice", "Tim hat fertig geübt") : t("Tim is practising", "Tim übt") + " · " + st.practice + " " + t("of", "von") + " " + d.pack.size + " " + t("done", "geschafft"), progress: !packDone },
          { state: closed ? "done" : packDone ? "current" : "next", title: closed ? d.teacher.name + " " + t("closed the focus", "hat den Schwerpunkt abgeschlossen") : d.teacher.name + " " + t("checks and closes the focus", "prüft und schließt den Schwerpunkt ab"),
            sub: t("Only the teacher can close a support focus. Practice never changes exam scores.", "Nur die Lehrkraft schließt einen Förderschwerpunkt ab. Üben ändert nie Prüfungsnoten.") }
        ];
        focusCards += ui.card(
          '<div class="card-head"><h2>' + t("Practice mission", "Übungsmission") + "</h2></div>" +
          ui.pill(closed ? t("Finished", "Fertig") : packDone ? t("Waiting for", "Wartet auf") + " " + d.teacher.name : t("In progress", "Läuft")) +
          "<h3>" + d.pack.title + "</h3>" +
          '<p class="muted tiny">' + d.pack.size + " " + t("short questions with fraction bars · assigned by", "kurze Fragen mit Bruchbalken · zugewiesen von") + " " + d.teacher.name + "</p>" +
          '<ol class="mission">' + steps.map(function (s) {
            return '<li class="' + s.state + '"><span class="dot" aria-hidden="true">' + (s.state === "done" ? "✓" : "") + "</span><div><b>" + s.title + "</b>" +
              (s.progress ? "<br>" + ui.progress(st.practice, d.pack.size) : "") +
              (s.sub ? '<br><span class="muted tiny">' + s.sub + "</span>" : "") + "</div></li>";
          }).join("") + "</ol>");
      }

      // ---------- message sheet ----------
      var sheet = st.parentCompose
        ? '<div class="scrim" data-action="parentCompose"></div><div class="sheet" role="dialog" aria-label="' + t("Message", "Nachricht an") + " " + d.teacher.name + '">' +
            '<div class="grabber"></div>' +
            '<div class="card-head"><span class="avatar">' + d.teacher.initials + "</span><div><h2>" + t("Message", "Nachricht an") + " " + d.teacher.name + '</h2><span class="muted tiny">' +
              t("About Tim Becker · goes only to his class teacher", "Zu Tim Becker · geht nur an seine Klassenlehrerin") + "</span></div>" +
              '<button type="button" class="icon-btn" data-action="parentCompose" aria-label="Close">✕</button></div>' +
            '<h3 class="small">' + t("Quick replies", "Schnellantworten") + '</h3><div class="stack tight quick">' +
            d.parent.quickReplies.map(function (q) { return ui.pill(q, { action: "parentQuick", arg: q, on: st.parentMsg === q }); }).join("") + "</div>" +
            '<h3 class="small">' + t("Your message", "Ihre Nachricht") + "</h3>" +
            '<textarea class="field" rows="3" data-bind="parentMsg" placeholder="' + t("Write to", "Schreiben an") + " " + d.teacher.name + ' ...">' + LS.esc(st.parentMsg) + "</textarea>" +
            '<div class="sheet-actions">' + ui.btn(t("Cancel", "Abbrechen"), { action: "parentCompose" }) + ui.btn(t("Send", "Senden"), { action: "parentSend", primary: true }) + "</div>" +
            '<p class="muted tiny">' + t("After sending you see a confirmation. The reply arrives in your notifications.", "Nach dem Senden sehen Sie eine Bestätigung. Die Antwort kommt als Benachrichtigung.") + "</p>" +
          "</div>"
        : "";

      return '<div class="parent-head"><h1>Tim · ' + t("Grade", "Klasse") + " " + d.student.grade + " · " + t("Mathematics", "Mathematik") + "</h1>" +
          '<p class="muted small">' + check() + " " + t("Everything here was checked and published by", "Alles hier wurde geprüft und freigegeben von") + " " + d.teacher.name + "</p></div>" +
        ui.btn(t("Message", "Nachricht an") + " " + d.teacher.name, { action: "parentCompose", primary: true, cls: "block" }) +
        (st.parentSent ? '<div class="banner ok">' + t("Message sent to", "Nachricht gesendet an") + " " + d.teacher.name + ".</div>" : "") +
        latestCard + trailCard + focusCards +
        '<div class="card dashed"><p class="muted tiny">' +
          t("You only see Tim's results after Frau Weber has checked and published them. No AI suggestions, confidence values or other children are shown here.",
            "Sie sehen Tims Ergebnisse erst, wenn Frau Weber sie geprüft und freigegeben hat. Keine KI-Vorschläge, keine Sicherheitswerte, keine anderen Kinder.") + "</p></div>" +
        ui.note("Leena's P1 wireframes: publish gate, support focus in parent wording, help-at-home example, mission stepper, message sheet with quick replies.") +
        sheet;
    }
  });

  function fractionBar(label, filled) {
    var cells = "";
    for (var i = 0; i < 8; i++) cells += '<i class="' + (i < filled ? "on" : "") + '"></i>';
    return '<div class="fraction-bar"><b class="small">' + label + '</b><span class="eighths" aria-label="' + filled + ' of 8">' + cells + "</span></div>";
  }
})();
