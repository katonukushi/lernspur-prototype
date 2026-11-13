// T3 Confirm or override AI grade + feedback (Figma frame "T3 - Confirm or override AI grade + feedback")

(function () {
  var ui = LS.ui, d = LS.data;

  LS.action("gAccept", function (id) { var g = LS.state.grade[id]; g.status = "accepted"; g.points = LS.q(id).ai; g.reason = null; });
  LS.action("gOverride", function (id) { LS.state.grade[id].status = "overridden"; });
  LS.action("gUndo", function (id) { var g = LS.state.grade[id]; g.status = "open"; g.points = LS.q(id).ai; g.reason = null; });
  LS.action("gPts", function (arg) {
    var p = arg.split(":"), q = LS.q(p[0]), g = LS.state.grade[q.id];
    g.points = Math.max(0, Math.min(q.max, g.points + (p[1] === "+" ? 1 : -1)));
  });
  LS.action("gReason", function (arg) { var p = arg.split(":"); LS.state.grade[p[0]].reason = p[1]; });
  LS.action("fbVersion", function (v) {
    var st = LS.state;
    st.fbVersion = v; st.fbEditing = false;
    st.fbText = d.draft[v].replace("{score}", LS.scoreText(LS.total()));
  });
  LS.action("fbEdit", function () { LS.state.fbEditing = !LS.state.fbEditing; });
  LS.action("fbConfirm", function () { LS.state.fbConfirmed = true; LS.state.fbEditing = false; });
  LS.action("commit", function () { LS.state.committed = true; return "T4"; });

  function questionCard(q, st) {
    var g = st.grade[q.id];
    var locked = st.committed;
    var head = '<div class="row between wrap"><span><b>' + q.label + "</b> " + LS.esc(st.answers[q.id]) + "</span>";
    if (g.status === "overridden") {
      head += '<div class="row"><span class="muted small">AI ' + q.ai + "/" + q.max + "</span><b>Teacher: " + g.points + "/" + q.max + "</b>" +
        ui.btn("-", { action: "gPts", arg: q.id + ":-", small: true, disabled: locked }) + ui.btn("+", { action: "gPts", arg: q.id + ":+", small: true, disabled: locked }) +
        ui.btn("Undo", { action: "gUndo", arg: q.id, disabled: locked }) + "</div>";
    } else {
      head += '<div class="row"><span class="muted small">AI points</span><b>' + q.ai + "/" + q.max + "</b>" +
        ui.btn(g.status === "accepted" ? "Accepted" : "Accept", { action: "gAccept", arg: q.id, primary: g.status !== "accepted", disabled: locked || g.status === "accepted" }) +
        ui.btn("Override", { action: "gOverride", arg: q.id, disabled: locked }) +
        (g.status === "accepted" && !locked ? ui.btn("Undo", { action: "gUndo", arg: q.id, small: true }) : "") + "</div>";
    }
    head += "</div>";
    var why = '<div class="row between wrap"><span class="small">Why: ' + q.why + '</span>' +
      '<span class="row small"><span class="muted">AI sure?</span>' + ui.conf(q.aiSure) + "</span></div>";
    var reason = g.status === "overridden"
      ? '<div class="row wrap"><span class="muted small">Reason:</span>' + d.overrideReasons.map(function (r) {
          return ui.pill(r, { action: "gReason", arg: q.id + ":" + r, on: g.reason === r, disabled: locked });
        }).join("") + "</div>"
      : "";
    return '<div class="card inner q' + (g.status === "overridden" ? " emph" : "") + '">' + head + why + reason + "</div>";
  }

  LS.screen({
    id: "T3", role: "teacher", nav: "Exams", title: "Confirm or override AI grade", source: "Figma T3",
    render: function (st) {
      var head = LS.teacherExamHead(ui.btn("Back to queue", { go: "T1" }), d.student.name + " - " + d.exam.title, 1, LS.teacherSteps());
      if (!st.ocrConfirmed) {
        return head + '<div class="banner info">AI grading starts after the OCR text is approved. ' + ui.btn("Back to text check (T2)", { go: "T2", small: true }) + "</div>";
      }
      var ai = LS.aiTotal(), now = LS.total();
      var summary = ui.card('<div class="row between wrap"><b>AI suggestions - not visible to the student until you publish.</b>' +
        '<div class="right"><b>AI-suggested grade: ' + LS.scoreText(ai) + "</b>" +
        (now !== ai ? '<br><span class="muted small">Teacher-adjusted: ' + LS.scoreText(now) + "</span>" : "") + "</div></div>", "thin");

      var qs = ui.card("<h2>AI grade per question (" + d.exam.shownNote + ")</h2>" + LS.visibleQs().map(function (q) { return questionCard(q, st); }).join(""));

      var versions = ["teacher", "child", "parent"].map(function (v) {
        return ui.pill(v.charAt(0).toUpperCase() + v.slice(1) + " version", { action: "fbVersion", arg: v, on: st.fbVersion === v });
      }).join("");
      var draftBody = st.fbEditing
        ? '<textarea class="field" rows="6" data-bind="fbText">' + LS.esc(st.fbText) + "</textarea>"
        : '<div class="draft">' + (st.fbVersion === "child" ? "<b>" + LS.starsFor(now) + " of 5 stars</b><br>" : "") + LS.nl2br(st.fbText) + "</div>";
      var fb = ui.card("<h2>Feedback draft</h2>" + '<div class="row wrap">' + versions + "</div>" +
        '<div class="card inner">' + draftBody +
          ui.btn("Preview read-aloud", { action: "say", arg: st.fbText }) + "</div>" +
        '<div class="row wrap">' + ui.btn(st.fbEditing ? "Done editing" : "Edit text", { action: "fbEdit", disabled: st.committed }) +
          (st.fbConfirmed ? ui.pill("Feedback confirmed", { on: true }) : ui.btn("Confirm feedback", { action: "fbConfirm", primary: true })) + "</div>");

      var ready = LS.allGraded();
      var bar = ui.actions(
        ui.btn("Back to text check", { go: "T2" }) + ui.hint("Every change is saved in the change log (who, what, when)."),
        st.committed ? ui.btn("Grade confirmed - go to evidence", { go: "T4", primary: true })
          : (ready ? "" : ui.hint("Accept or override every question first.")) +
            ui.btn("Confirm grade - next: evidence", { action: "commit", primary: true, disabled: !ready }));

      return head + summary + '<div class="split wide-left">' + qs + fb + "</div>" + bar;
    }
  });
})();
