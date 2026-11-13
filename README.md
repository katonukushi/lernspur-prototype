# LernSpur Prototype

Clickable prototype of LernSpur, an AI-assisted assessment web app for children in Grades 1 to 5.
Course project for CSEN909 Human Computer Interaction (German University in Cairo), Team Solos, Milestone 3.

Students upload a scanned exam, the teacher verifies the OCR text, confirms or overrides the AI grade, reviews learning gaps and red flags across exams, and sends child-friendly feedback that the student then sees.
The teacher stays in control at every step.

**Live demo:** https://katonukushi.github.io/lernspur-prototype/

## Status

This is a deliberately **low-fidelity** first version: rough boxes, approximate positions, no animations.
It contains every function of the workflow so the team can click through it and iterate.
The visual design is a separate layer (a theme). The default theme `lernspur` uses the colors and type of the Figma design (page "00 Foundations"); `wire` is the earlier grayscale low-fi look.

OCR, AI grades and feedback are simulated with hard-coded demo data, as allowed by the project brief.

## Run it locally

No build step and no dependencies.

1. Download or clone this repository.
2. Open `index.html` in a browser (double-click works).

Alternative with a local server:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## How to test the workflow

The dark bar at the bottom contains demo controls, they are not part of the product.
Click the numbered steps from left to right, or follow the flow inside the app:

1. **Student, S2:** take two photos (the second one is always blurry), retake it, then "Send to my teacher".
2. **Teacher, T1:** press "Verify" in Tim's row of the exams queue.
3. **Teacher, T2:** check both uncertain answers (accept, pick a "Did you mean" suggestion, or "Correct" to edit and save), then "Approve text and start AI grading".
4. **Teacher, T3:** accept Q1 and Q2, override Q3 with +1 point and the reason "Partial credit" (AI 17/25, teacher 18/25), confirm the feedback draft, then "Confirm grade".
5. **Teacher, T4:** review the evidence across exams and confirm, wait on or dismiss the red flag.
6. **Teacher, T5:** see the Learning Trail, then "Send practice pack".
7. **Teacher, T6:** edit the feedback, adjust the practice pack, optionally "Preview as pupil", then "Publish to student".
8. **Student, S1 / S3 / S4:** while the teacher checks, "My results" says "Waiting for my teacher"; after publishing the bell shows the new messages; open the result, then finish the practice pack.
9. **Teacher, T5:** after Tim finishes the pack, "Close support focus" (only the teacher can close it; "Reopen focus" undoes it).
10. **Parent, P1 (phone layout):** before the teacher publishes, sees only "Being checked"; afterwards the checked grade, the Learning Trail, the confirmed support focus with a help-at-home example, the practice mission, and a message sheet with quick replies.

"Reset demo" starts over.
"Notes" shows or hides the screen IDs and annotations.
"Hide" or the D key hides the demo bar, for example to record the walkthrough video.

## Screens

| ID | Screen | Source |
|---|---|---|
| S1 | Student home + notifications | Figma S1 |
| S2 | Upload exam (multi-page, photo check, exam language) | Figma S2 |
| S3 | Results with child-friendly feedback | Figma S3 |
| S4 | My Trail: progress across exams + practice packs | Figma S4 |
| T1 | Teacher dashboard + exams queue | Figma T1 |
| T2 | Verify OCR text (confidence OCR) | Figma T2 |
| T3 | Confirm or override AI grade + feedback draft | Figma T3 |
| T4 | Evidence Trail: learning gap + red flag across exams | Figma T4 |
| T5 | Learning Trail of one student | Figma T5 |
| T6 | Feedback and practice pack | Figma T6 |
| P1 | Parent summary (bonus, phone) | Figma P1, P1b, P1c (based on Leena's P1 wireframes) |

The screens follow the team's Figma skeletons ("LernSpur - M3 Prototype"), which build on our Milestone 2 wireframes.

## Project structure

```
index.html            loads everything, in order
css/base.css          layout only: columns, spacing, rough positions
css/themes/lernspur.css  the designed look (Figma tokens), default
css/themes/wire.css   the earlier low-fi look (grayscale): colors, fonts, borders
css/demo.css          the demo bar (not part of the product)
js/data.js            all demo content (exam, OCR text, feedback, progress)
js/state.js           shared demo state that links the student and teacher views
js/ui.js              small building blocks: button, card, placeholder, note
js/app.js             routing (index.html#/T2), headers, demo bar, events
js/screens/*.js       one file per screen ID
```

## How to change things

- **Text or demo content:** edit `js/data.js`.
- **One screen:** edit `js/screens/<ID>.js`. Each screen is a function that returns HTML.
- **Behaviour between screens:** the shared demo state is in `js/state.js`; buttons call named actions defined next to their screen.
- **Order or position on a screen:** move blocks inside the screen file. The column helpers are `split` (1:2), `split even` (1:1) and `split wide-left` (3:2) in `css/base.css`.
- **The whole look:** edit `css/themes/lernspur.css`, or add a new theme:
  1. Copy `css/themes/wire.css` to `css/themes/<name>.css` and change it.
  2. Add `"<name>"` to `LS.THEMES` in `js/app.js`.
  3. Pick it in the demo bar, or open `index.html?theme=<name>`.

Screens only use semantic class names (`card`, `btn primary`, `pill on`, `banner ok`, `conf low`, `ph`, `note` ...).
A theme decides how these look, so the design can change without touching any screen.

## AI assistance

This prototype was coded with the help of an AI assistant (Claude, Anthropic).
The interaction design comes from the team's wireframes, Figma skeletons and decisions; the AI translated them into HTML, CSS and JavaScript.
The full chat history is part of the Milestone 3 submission, as required by the course.
