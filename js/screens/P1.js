// P1 Parent summary (bonus, decision D5)
// Base: L-M2 W14 (Leena), ideas from F W9. Issue #32.
// Until the content arrives: a labelled placeholder that lists what the screen has to show.

(function () {
  var ui = LS.ui, d = LS.data;

  LS.screen({
    id: "P1", role: "parent", title: "Parent summary", source: "L-M2 W14, pending",
    render: function (st) {
      return "<h1>" + d.student.first + "'s progress</h1>" +
        '<div class="banner info">Placeholder. Content and layout come from L-M2 W14 (issue #32).</div>' +
        '<div class="split even">' +
          ui.todo("Must show (project brief, optional parent view)", [
            "The child's grades",
            "Progress across exams",
            "Red flags, explained for parents"
          ]) +
          ui.card("<h2>Current demo data</h2>" +
            "<p>Latest result: " + (st.published ? d.exam.title + ", " + LS.total() + " / " + d.exam.maxPoints : "not published yet") + "</p>" +
            "<p>Red flag: " + (st.flag === "confirmed" ? d.redFlag.concept : "none confirmed") + "</p>") +
        "</div>";
    }
  });
})();
