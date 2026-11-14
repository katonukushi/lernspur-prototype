// T7 Class Gap Radar (optional feature, decision D4; from Fady's M1 U3 and M2 W6)
// Groups the confirmed mistakes of the whole class by concept. Above the threshold it suggests a class-level action
// ("Reteach to whole class") instead of many individual red flags. Below it, the error stays an individual red flag (T4).

(function () {
  var ui = LS.ui, d = LS.data, g = d.classGaps;

  function pct(e) { return Math.round(e.pupils / g.graded * 100); }
  function sel(st) { return g.errors.filter(function (e) { return e.id === st.radarSel; })[0] || g.errors[0]; }
  function kind(e, st) {
    if (pct(e) >= st.radarThreshold) return { label: "Class-wide", pill: "dark" };
    if (e.pupils > 1) return { label: "Small group", pill: "" };
    return { label: "One pupil", pill: "" };
  }

  LS.action("radarSel", function (id) { LS.state.radarSel = id; });
  LS.action("radarThreshold", function (dir) {
    var st = LS.state;
    st.radarThreshold = Math.max(20, Math.min(80, st.radarThreshold + (dir === "+" ? 10 : -10)));
  });
  LS.action("radarDecide", function (v) { var st = LS.state; st.radarDecision[st.radarSel] = v; if (v !== "dismissed") delete st.radarReason[st.radarSel]; });
  LS.action("radarReason", function (r) { var st = LS.state; st.radarDecision[st.radarSel] = "dismissed"; st.radarReason[st.radarSel] = r; });
  LS.action("radarReopen", function () { var st = LS.state; delete st.radarDecision[st.radarSel]; delete st.radarReason[st.radarSel]; });
  LS.action("radarGroup", function () { LS.state.sendTo = "group"; return "T6"; });

  LS.screen({
    id: "T7", role: "teacher", nav: "Class", title: "Class Gap Radar", source: "optional feature D4",
    render: function (st) {
      var cur = sel(st), curPct = pct(cur), above = curPct >= st.radarThreshold;
      var decided = st.radarDecision[cur.id];

      var head = '<div class="page-head"><div><h1>Class Gap Radar - ' + d.student.className + " - Math</h1>" +
        '<p class="muted">Recurring errors of the whole class, from confirmed grades only.</p></div>' +
        '<div class="row wrap">' + ui.pill("Exam: Fractions Quiz v") + ui.pill("AI suggestion") + "</div></div>";

      var rows = g.errors.map(function (e) {
        var k = kind(e, st), p = pct(e), on = e.id === cur.id;
        return '<button type="button" class="answer-row' + (on ? " on" : "") + '" aria-pressed="' + on + '" data-action="radarSel" data-arg="' + e.id + '">' +
          '<b style="flex:1 1 220px">' + e.concept + "</b>" + ui.progress(p, 100) +
          '<span class="small" style="min-width:110px">' + e.pupils + " " + (e.pupils === 1 ? "pupil" : "pupils") + " (" + p + " %)</span>" +
          ui.pill(k.label, { kind: k.pill }) + "</button>";
      }).join("");

      var list = ui.card('<div class="row between wrap"><h2>Recurring errors in ' + d.student.className + " (" + g.graded + " of " + g.pupils + " papers confirmed)</h2></div>" + rows +
        '<div class="row wrap"><span class="small">Reteach threshold: <b>' + st.radarThreshold + " %</b> of the class</span>" +
          ui.btn("-", { action: "radarThreshold", arg: "-", small: true, disabled: st.radarThreshold <= 20 }) +
          ui.btn("+", { action: "radarThreshold", arg: "+", small: true, disabled: st.radarThreshold >= 80 }) +
          ui.hint("Errors at or above the threshold count as class-wide.") + "</div>");

      var trend = ui.card("<h2>Across exams: " + cur.concept + "</h2>" +
        '<div class="trail">' + d.exams.map(function (e, i) {
          var n = cur.trend[i], p = Math.round(n / g.graded * 100);
          return (i ? '<span class="trail-line"></span>' : "") +
            '<span class="trail-cell">' + ui.pill(p + " % (" + n + ")", { kind: p >= st.radarThreshold ? "dark" : "" }) +
            '<span class="muted tiny">' + e.label + " · " + e.date + "</span></span>";
        }).join("") + "</div>" +
        '<p class="small">' + (cur.trend[3] > cur.trend[0] ? "More pupils make this error in each exam." : "This error is not growing.") + " Typical answer: " + cur.example + "</p>");

      var RESULT = {
        accepted: "Added to your lesson plan: a 10-minute reteach on " + cur.concept.toLowerCase() + ". No individual red flags are created for this error.",
        assigned: (cur.pack || "Practice pack") + " sent to " + cur.pupils + " pupils. Their results will update this radar.",
        dismissed: "Suggestion dismissed" + (st.radarReason[cur.id] ? " (" + st.radarReason[cur.id] + ")" : "") + ". LernSpur checks again after the next exam."
      };

      var action;
      if (above && decided) {
        action = '<div class="banner ' + (decided === "dismissed" ? "info" : "ok") + '">' + RESULT[decided] + "</div>" +
          ui.btn("Change decision", { action: "radarReopen" });
      } else if (above) {
        action = "<h2>Suggestion: reteach to the whole class</h2>" +
          '<p class="small"><b>' + curPct + " %</b> of " + d.student.className + " made the same error (threshold " + st.radarThreshold + " %). " +
          "That points to the lesson, not to single pupils, so LernSpur suggests one class action instead of " + cur.pupils + " separate red flags.</p>" +
          '<div class="stack tight">' +
            ui.btn("Accept - add to lesson plan", { action: "radarDecide", arg: "accepted", primary: true, cls: "block" }) +
            ui.btn("Send practice pack to " + cur.pupils + " pupils", { action: "radarDecide", arg: "assigned", cls: "block" }) +
            '<div class="card inner">' + ui.btn("Dismiss", { action: "radarDecide", arg: "dismissed" }) +
              '<div class="row wrap"><span class="muted small">Reason:</span>' + g.dismissReasons.map(function (r) {
                return ui.pill(r, { action: "radarReason", arg: r });
              }).join("") + "</div></div></div>" +
          '<p class="muted tiny">Nothing is sent to pupils until you choose.</p>';
      } else {
        var isTim = cur.id === "compare";
        action = "<h2>Below the threshold: handled per pupil</h2>" +
          '<p class="small">Only <b>' + cur.pupils + " " + (cur.pupils === 1 ? "pupil" : "pupils") + " (" + curPct + " %)</b> made this error, so it is not a class problem. " +
          "It stays an individual red flag with evidence across exams.</p>" +
          '<div class="row wrap">' + cur.names.map(function (n) { return ui.pill(n); }).join("") + "</div>" +
          '<div class="stack tight">' +
            (isTim ? ui.btn("Open Evidence Trail (" + d.student.name + ")", { go: "T4", primary: true, cls: "block" }) : "") +
            (isTim ? ui.btn("Send practice to this group (" + cur.pupils + ")", { action: "radarGroup", cls: "block", disabled: !st.committed }) : "") +
            (isTim && !st.committed ? ui.hint("Confirm " + d.student.first + "'s grade first (T3).") : "") +
          "</div>";
      }

      var side = '<div class="stack">' +
        ui.card(action, "emph") +
        ui.card("<h3>Why was this suggested?</h3><p class=\"small\">LernSpur groups the confirmed mistakes of all pupils by concept. " +
          "When at least " + st.radarThreshold + " % of the class make the same mistake, it suggests a class action instead of individual red flags. You decide.</p>", "soft") +
        "</div>";

      return head + '<div class="split wide-left"><div class="stack">' + list + trend + "</div>" + side + "</div>" +
        ui.note("Optional feature (D4). Pupils and parents never see this page or any comparison with the class.");
    }
  });
})();
