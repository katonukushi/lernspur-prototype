// T6 Send feedback, message, practice mission (A-WF 03, lower part; LernSpur step 4)
// Rendered as part of the T4 page. The T6 route opens the same page and scrolls to the feedback.

(function () {
  var ui = LS.ui, d = LS.data;

  LS.action("preview", function () { LS.state.preview = true; return "S3"; });
  LS.action("endPreview", function () { LS.state.preview = false; return "T6"; });
  LS.action("publish", function () { LS.state.published = true; LS.state.seenNews = false; });

  LS.feedbackSection = function (st) {
    return '<section id="feedback">' + ui.card(
      "<h2>Feedback for " + d.student.first + "</h2>" +
      '<textarea class="field" rows="4" data-bind="feedback"' + (st.published ? " readonly" : "") + ">" + LS.esc(st.feedback) + "</textarea>" +
      '<p class="muted small">AI draft - editable</p>' +
      '<div class="row wrap">' +
        '<label class="check"><input type="checkbox" data-bind="attach" data-rerender' + (st.attach ? " checked" : "") + (st.published ? " disabled" : "") + "> Attach: " + d.attachment + "</label>" +
        ui.btn("Preview as pupil", { action: "preview" }) +
        (st.published
          ? ui.chip("Published. " + d.student.first + " was notified.", "ok")
          : ui.btn("Publish feedback", { action: "publish", primary: true, disabled: !st.committed })) +
      "</div>" +
      ui.note("Publishing sends a notification to Tim. Publishing is possible once the grade is committed (T3).")) + "</section>";
  };

  LS.screen({
    id: "T6", role: "teacher", title: "Send feedback and practice", source: "A-WF 03",
    crumbs: ["Grade 4B", "Math Test", "Tim Becker"],
    render: function (st) { return LS.diagnosticsPage(st); },
    afterRender: function () {
      var el = document.getElementById("feedback");
      if (el) el.scrollIntoView({ block: "start" });
    }
  });
})();
