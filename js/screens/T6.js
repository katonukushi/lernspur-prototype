// T6 Feedback and practice pack (Figma frame "T6 - Send feedback, message, practice mission", LernSpur step 4)

(function () {
  var ui = LS.ui, d = LS.data, fb = d.feedback;

  LS.action("sendTo", function (v) { LS.state.sendTo = v; });
  LS.action("template", function (v) {
    var st = LS.state, t = fb.templates[v];
    st.template = v;
    st.well = t ? t.well : fb.well;
    st.next = t ? t.next : fb.next;
  });
  LS.action("variant", function (v) { LS.state.well = fb.variants[v].well; LS.state.next = fb.variants[v].next; });
  LS.action("packAttach", function () { LS.state.packAttach = !LS.state.packAttach; });
  LS.action("swap", function (i) { var p = LS.state.packPick; p[i] = (p[i] + 1) % d.pack.items[i].length; });
  LS.action("addOwn", function () { LS.state.ownQuestions.push(""); });
  LS.action("saveDraft", function () { LS.state.draftSaved = true; });
  LS.action("preview", function () { LS.state.preview = true; return "S3"; });
  LS.action("publish", function () { LS.state.published = true; LS.state.seenResult = false; LS.state.preview = false; });

  LS.screen({
    id: "T6", role: "teacher", nav: "Exams", title: "Feedback and practice", source: "Figma T6",
    render: function (st) {
      if (!st.committed) {
        return "<h1>Feedback and practice - " + d.student.name + "</h1>" +
          '<div class="banner info">Feedback can be sent once the grade is confirmed. ' + ui.btn("Go to grading (T3)", { go: "T3", small: true }) + "</div>";
      }
      var locked = st.published;
      var head = '<div class="page-head"><div><h1>Feedback and practice - ' + d.student.name + "</h1>" +
        '<p class="muted small">' + d.exam.short + " · grade confirmed: " + LS.scoreText(LS.total()) +
          (st.flag === "confirmed" ? " · weakness confirmed: comparing fractions" : "") + "</p></div>" +
        ui.stepper(["Verify", "Grade", "Feedback", "Release"], st.published ? 3 : 2, LS.teacherSteps()) + "</div>";

      var sendBar = ui.card('<div class="row between wrap"><div class="row wrap"><span class="muted small">Send to:</span>' +
          ui.pill(d.student.name, { action: "sendTo", arg: "student", on: st.sendTo === "student", disabled: locked }) +
          ui.pill(fb.groupLabel, { action: "sendTo", arg: "group", on: st.sendTo === "group", disabled: locked }) + "</div>" +
        '<label class="row"><span class="muted small">Template:</span><select data-change="template"' + (locked ? " disabled" : "") + ">" +
          Object.keys(fb.templates).map(function (t) { return "<option" + (t === st.template ? " selected" : "") + ">" + t + "</option>"; }).join("") +
        "</select></label></div>", "thin");

      var text = ui.card("<h2>Feedback to the student (suggested, edit freely)</h2>" +
        '<p class="label">What went well</p><input class="field" data-bind="well" data-live value="' + LS.esc(st.well) + '"' + (locked ? " readonly" : "") + ">" +
        '<p class="label">Next step</p><input class="field" data-bind="next" data-live value="' + LS.esc(st.next) + '"' + (locked ? " readonly" : "") + ">" +
        '<div class="row between wrap"><span class="muted small">2 sentences - Grade 4 reading level</span><div class="row wrap">' +
          ui.btn("Shorter", { action: "variant", arg: "shorter", disabled: locked }) +
          ui.btn("Simpler words", { action: "variant", arg: "simpler", disabled: locked }) +
          ui.btn("In German", { action: "variant", arg: "german", disabled: locked }) + "</div></div>");

      var items = d.pack.items.map(function (alts, i) {
        return '<div class="item-row"><span>' + alts[st.packPick[i]] + "</span>" + ui.btn("Swap", { action: "swap", arg: i, disabled: locked || !st.packAttach }) + "</div>";
      }).join("") + st.ownQuestions.map(function (q, i) {
        return '<div class="item-row"><input class="field" data-bind="ownQuestions.' + i + '" value="' + LS.esc(q) + '" placeholder="My own question ..."' + (locked ? " readonly" : "") + "></div>";
      }).join("");
      var pack = ui.card('<div class="row between"><h2>' + d.pack.title + "</h2>" +
          ui.pill("Attach: " + (st.packAttach ? "on" : "off"), { action: "packAttach", on: st.packAttach, disabled: locked }) + "</div>" +
        '<div class="' + (st.packAttach ? "" : "dimmed") + '">' + items +
          '<div class="row wrap">' + ui.btn("+ Add my own question", { action: "addOwn", disabled: locked || !st.packAttach }) +
          ui.hint("When Tim masters the pack, the red flag closes.") + "</div></div>");

      var preview = ui.card("<h2>Preview: what " + d.student.first + " will see</h2>" +
        '<div class="card inner soft"><p><b>' + LS.starsFor(LS.total()) + " of 5 stars</b></p>" +
          '<p class="small">What went well: <span data-mirror="well">' + LS.esc(st.well) + "</span></p>" +
          '<p class="small">Next step: <span data-mirror="next">' + LS.esc(st.next) + "</span></p>" +
          '<p class="muted tiny">From ' + d.teacher.name + "</p>" +
          (st.packAttach ? ui.btn("Start practice", { action: "preview", title: "Open the student view as a preview" }) : "") + "</div>" +
        '<p class="small"><b>No AI details or confidence scores are shown to students.</b></p>');

      var bar = ui.actions(
        ui.btn("Back to results", { go: "T3" }) + ui.hint("Publishing sends a notification to " + d.student.first + "."),
        (st.published ? ui.pill("Published - " + d.student.first + " was notified", { on: true }) :
          (st.draftSaved ? ui.hint("Draft saved") : "") +
          ui.btn("Preview as pupil", { action: "preview" }) +
          ui.btn("Save draft", { action: "saveDraft" }) +
          ui.btn("Publish to student", { action: "publish", primary: true })));

      return head + sendBar + '<div class="split wide-left"><div class="stack">' + text + pack + "</div>" + preview + "</div>" + bar;
    }
  });
})();
