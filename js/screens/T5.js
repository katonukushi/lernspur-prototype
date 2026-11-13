// T5 Student profile with the Learning Trail
// No wireframe yet (promised in M1 section 4.2). The team decides the design, see issue #16.
// Until then: a labelled placeholder that lists what the screen has to show.

(function () {
  var ui = LS.ui, d = LS.data;

  var FLAG_LABEL = { open: "open", confirmed: "confirmed", dismissed: "dismissed as slip", observe: "under observation" };

  LS.screen({
    id: "T5", role: "teacher", title: "Student profile with the Learning Trail", source: "no wireframe yet",
    crumbs: ["Grade 4B", "Tim Becker"],
    render: function (st) {
      return "<h1>" + d.student.name + " - Profile</h1>" +
        '<div class="banner info">Placeholder. No wireframe yet, the team decides the layout (issue #16).</div>' +
        '<div class="split even">' +
          ui.todo("Must show (from M3_Base)", [
            "Learning Trail across exams (M1 section 4.1)",
            "Red flags with evidence from several exams (L-M2 W11)",
            "Practice missions and whether they closed a flag (M1 4.1, step 4)",
            "Messages and notes to the student"
          ]) +
          ui.card("<h2>Current demo data</h2>" +
            "<p>Red flag: " + d.redFlag.concept + " (" + FLAG_LABEL[st.flag] + ")</p>" +
            "<p>Practice sheets done: " + st.sheetsDone + " of " + d.nextGoal.sheets + "</p>" +
            "<p>Fractions Quiz: " + (st.committed ? LS.total() + " / " + d.exam.maxPoints : "not graded yet") + "</p>" +
            ui.btn("Back to diagnostics (T4)", { go: "T4" })) +
        "</div>" +
        ui.ph("Learning Trail (layout to be decided)", 160);
    }
  });
})();
