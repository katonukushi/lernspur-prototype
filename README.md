# LernSpur Prototype

Clickable prototype of LernSpur, an AI-assisted assessment web app for children in Grades 1 to 5.
Course project for CSEN909 Human Computer Interaction (German University in Cairo), Team Solos, Milestone 3.

Students upload a scanned exam, the teacher verifies the OCR text, confirms or overrides the AI grade, reviews learning gaps and red flags across exams, and sends child-friendly feedback that the student then sees.
The teacher stays in control at every step.

**Live demo:** https://katonukushi.github.io/lernspur-prototype/

## Status

This is a deliberately **low-fidelity** first version: rough boxes, approximate positions, no animations.
It contains every function of the workflow so the team can click through it and iterate.
The visual design is a separate layer (a theme) and will be replaced once the team's design is final.

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

1. **Student, S2:** "Take a photo", then "Retake" (the first photo is always too dark), then "Send to my teacher".
2. **Teacher, T1:** open Tim's paper in the inbox.
3. **Teacher, T2:** check the highlighted low-confidence answers, then "Confirm OCR text".
4. **Teacher, T3:** adjust AI points if needed, then "Commit grade".
5. **Teacher, T4:** review the learning gap across tests, confirm, dismiss or observe the red flag.
6. **Teacher, T6:** edit the feedback, optionally "Preview as pupil", then "Publish feedback".
7. **Student, S1:** a new notification appears, open the result (S3) and the progress page (S4).

"Reset demo" starts over.
"Notes" shows or hides the annotations carried over from the wireframes.
"Hide" or the D key hides the demo bar, for example to record the walkthrough video.

## Screens

| ID | Screen | Source |
|---|---|---|
| S1 | Student home + notifications | wireframe 05 |
| S2 | Upload / scan exam | wireframe 01 |
| S3 | Results with child-friendly feedback | wireframe 04 |
| S4 | My Trail: progress across exams | wireframe 06 |
| T1 | Teacher inbox | wireframe 07 |
| T2 | Verify OCR text | wireframe 02, phase 1 |
| T3 | Confirm or override AI grade | wireframe 02, phase 2 |
| T4 | Learning gaps + red flag | wireframe 03, upper part |
| T5 | Student profile with the Learning Trail | placeholder, design open |
| T6 | Send feedback and practice | wireframe 03, lower part |
| P1 | Parent summary (bonus) | placeholder, design open |

The wireframes are the team's Milestone 2 deliverables.

## Project structure

```
index.html            loads everything, in order
css/base.css          layout only: columns, spacing, rough positions
css/themes/wire.css   the current low-fi look: colors, fonts, borders
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
- **Order or position on a screen:** move blocks inside the screen file. The column helpers are `split` (1:2), `split even` (1:1) and `split wide-left` (3:2) in `css/base.css`.
- **The whole look:** edit `css/themes/wire.css`, or add a new theme:
  1. Copy `css/themes/wire.css` to `css/themes/<name>.css` and change it.
  2. Add `"<name>"` to `LS.THEMES` in `js/app.js`.
  3. Pick it in the demo bar, or open `index.html?theme=<name>`.

Screens only use semantic class names (`card`, `btn primary`, `banner warn`, `chip ok`, `ph`, `note` ...).
A theme decides how these look, so the design can change without touching any screen.

## AI assistance

This prototype was coded with the help of an AI assistant (Claude, Anthropic).
The interaction design comes from the team's wireframes and decisions; the AI translated them into HTML, CSS and JavaScript.
The full chat history is part of the Milestone 3 submission, as required by the course.
