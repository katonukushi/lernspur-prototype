// T2 Verify OCR text (A-WF 02, LernSpur step 1)
// T2 and T3 are the two phases of the same screen in A-WF 02: "1 OCR check > 2 Grading".
// The shared page lives here, T3.js registers the grading phase.

(function () {
  var ui = LS.ui, d = LS.data;
  var zoom = 1;

  LS.action("zoom", function (dir) { zoom = dir === "fit" ? 1 : Math.max(0.6, Math.min(1.8, zoom + (dir === "+" ? 0.2 : -0.2))); });
  LS.action("confirmOcr", function () { LS.state.ocrConfirmed = true; return "T3"; });
  LS.action("rescan", function () { LS.state.rescan = true; LS.state.upload = "empty"; LS.state.ocrConfirmed = false; return "T1"; });
  LS.action("pts", function (arg) {
    var p = arg.split(":"), q = d.exam.questions.filter(function (x) { return x.id === p[0]; })[0];
    var v = LS.state.points[q.id] + (p[1] === "+" ? 1 : -1);
    LS.state.points[q.id] = Math.max(0, Math.min(q.max, v));
  });
  LS.action("commit", function () { LS.state.committed = true; return "T4"; });

  LS.verifyPage = function (st, phase) {
    var grading = phase === "grading";
    var unsure = d.exam.questions.filter(function (q) { return q.lowConf; });

    var notReady = st.upload !== "sent"
      ? '<div class="banner info">No paper from Tim yet. ' + ui.btn("Go to student upload (S2)", { go: "S2", small: true }) + "</div>" : "";

    var stepper = '<div class="stepper"><span class="' + (grading ? "" : "current") + '">1 OCR check</span> &gt; <span class="' + (grading ? "current" : "") + '">2 Grading</span></div>';

    var scan = ui.card(
      '<div class="row between"><h2>Original scan</h2><span class="row">' +
        ui.btn("-", { action: "zoom", arg: "-", small: true }) + ui.btn("+", { action: "zoom", arg: "+", small: true }) + ui.btn("Fit", { action: "zoom", arg: "fit", small: true }) +
      "</span></div>" +
      '<div class="scan">' + ui.ph("scanned exam paper", Math.round(420 * zoom)) +
        (st.ocrConfirmed ? "" : '<span class="scan-mark">low confidence</span>') + "</div>");

    var banner = st.ocrConfirmed
      ? '<div class="banner ok">OCR text confirmed. AI grading is unlocked.</div>'
      : '<div class="banner warn"><b>' + unsure.length + " words with low confidence</b><br>Check the highlighted answers before grading.</div>";

    var qs = d.exam.questions.map(function (q) {
      var low = q.lowConf && !st.ocrConfirmed;
      return ui.card(
        '<div class="q-head"><b>' + q.label + "</b>" +
          '<input class="field' + (low ? " lowconf" : "") + '" data-bind="answers.' + q.id + '" value="' + LS.esc(st.answers[q.id]) + '"' + (st.ocrConfirmed ? " readonly" : "") + ">" +
        "</div>" +
        (low ? '<p class="muted small">Unsure: "' + LS.esc(q.lowConf) + '"</p>' : "") +
        '<div class="row"><span class="muted">AI points</span><b>' + st.points[q.id] + " / " + q.max + "</b>" +
          ui.btn("-", { action: "pts", arg: q.id + ":-", small: true, disabled: !st.ocrConfirmed || st.committed }) +
          ui.btn("+", { action: "pts", arg: q.id + ":+", small: true, disabled: !st.ocrConfirmed || st.committed }) +
        "</div>" +
        '<p><span class="muted">Reasoning:</span> ' + q.reasoning + "</p>", "q");
    }).join("");

    var actions = '<div class="row wrap">' +
      ui.btn("Request re-scan", { action: "rescan", disabled: st.ocrConfirmed }) +
      ui.btn("Confirm OCR text", { action: "confirmOcr", primary: !st.ocrConfirmed, disabled: st.ocrConfirmed }) +
      ui.btn(st.committed ? "Grade committed" : "Commit grade", { action: "commit", primary: st.ocrConfirmed && !st.committed, disabled: !st.ocrConfirmed || st.committed }) +
      "</div>" +
      (grading ? '<p><b>Total: ' + LS.total() + " / " + d.exam.maxPoints + "</b></p>" : "");

    return notReady + stepper +
      '<div class="split wide-left">' + scan + '<div class="stack">' + banner + qs + actions + "</div></div>" +
      ui.note("Commit grade is locked until the OCR text is confirmed. Changes are logged (audit trail).");
  };

  LS.screen({
    id: "T2", role: "teacher", title: "Verify OCR text", source: "A-WF 02",
    crumbs: ["Grade 4B", "Math Test", "Tim Becker"],
    render: function (st) { return LS.verifyPage(st, "ocr"); }
  });
})();
