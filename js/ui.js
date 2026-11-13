// Small building blocks for screens.
// They only output semantic class names; how things look is decided by the theme in css/themes/.

window.LS = window.LS || {};
LS.screens = {};
LS.actions = {};

// Register a screen: { id, role, title, source, render(state) -> html string }
LS.screen = function (def) { LS.screens[def.id] = def; };

// Register click actions: <button data-action="name" data-arg="x">.
LS.action = function (name, fn) { LS.actions[name] = fn; };

LS.esc = function (s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c];
  });
};

// Pick the English or German string for the student view.
LS.t = function (en, de) { return LS.state.lang === "DE" && de ? de : en; };

LS.ui = {
  // Button. opts: action, arg, go (screen id), primary, disabled, small
  btn: function (label, opts) {
    opts = opts || {};
    var cls = "btn" + (opts.primary ? " primary" : "") + (opts.small ? " small" : "");
    var attrs = "";
    if (opts.action) attrs += ' data-action="' + opts.action + '"';
    if (opts.arg != null) attrs += ' data-arg="' + LS.esc(opts.arg) + '"';
    if (opts.go) attrs += ' data-go="' + opts.go + '"';
    if (opts.disabled) attrs += " disabled";
    return '<button type="button" class="' + cls + '"' + attrs + ">" + label + "</button>";
  },

  card: function (inner, extra) {
    return '<section class="card' + (extra ? " " + extra : "") + '">' + inner + "</section>";
  },

  // Image placeholder: a crossed box with a label.
  ph: function (label, height) {
    return '<div class="ph" style="min-height:' + (height || 120) + 'px"><span>' + LS.esc(label) + "</span></div>";
  },

  // Annotation carried over from the wireframes. Hidden with the "Notes" switch in the demo bar.
  note: function (text) { return '<p class="note">' + text + "</p>"; },

  chip: function (text, kind) { return '<span class="chip' + (kind ? " " + kind : "") + '">' + text + "</span>"; },

  stars: function (n) { return '<span class="stars" aria-label="' + n + ' stars">' + n + " stars</span>"; },

  dots: function (level, max) {
    var s = "";
    for (var i = 0; i < (max || 3); i++) s += '<span class="dot' + (i < level ? " on" : "") + '"></span>';
    return '<span class="dots" aria-label="level ' + level + '">' + s + "</span>";
  },

  // Student assessment list, used on S1 and S2.
  assessmentList: function (selectable) {
    var d = LS.data, t = LS.t, ui = LS.ui;
    return d.assessments.map(function (a) {
      var isExam = a.id === d.exam.id;
      var status = isExam ? LS.examStatus() : a.status;
      var target = !isExam ? null : status === "Result ready" ? "S3" : status === "Waiting for my teacher" ? null : "S2";
      var open = target ? ui.btn(t("Open", "Öffnen"), { go: target, small: true }) : "";
      return '<div class="card item' + (selectable && isExam ? " emph" : "") + '">' +
        '<div><p class="item-title">' + a.title + '</p><p class="muted">' + status + "</p></div>" + open + "</div>";
    }).join("");
  },

  // Placeholder block for screens that have no wireframe yet.
  todo: function (title, items) {
    return '<div class="todo"><p class="todo-title">' + title + "</p><ul>" +
      items.map(function (i) { return "<li>" + i + "</li>"; }).join("") + "</ul></div>";
  }
};
