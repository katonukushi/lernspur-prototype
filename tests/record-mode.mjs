// E2E test and dry run of the recording mode (index.html?mode=record) at 1920 x 1080.
// It clicks through the walkthrough run sheet like the presenter would (real mouse clicks, title cards,
// N key at the role hand-overs), then checks the safety keys N and R from every screen.
//
// Run (no install in the repo needed):
//   npm i --prefix /tmp/lernspur-e2e puppeteer-core@23
//   PUPPETEER_DIR=/tmp/lernspur-e2e/node_modules/puppeteer-core node tests/record-mode.mjs
// Browser: set CHROME_PATH, otherwise Chrome, Vivaldi or Edge from /Applications is used.
// Optional: SHOTS=/some/dir saves one screenshot per beat.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(process.env.PUPPETEER_DIR || "puppeteer-core");
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SHOTS = process.env.SHOTS || "";
const BROWSERS = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Vivaldi.app/Contents/MacOS/Vivaldi",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/chromium", "/usr/bin/google-chrome"
].filter(Boolean);

// KLM operator times (Lecture 3): M + P + B per click, plus H between mouse and keyboard.
const KLM = { M: 1.35, P: 1.1, B: 0.2, K: 0.28, H: 0.4 };
const CLICK = KLM.M + KLM.P + KLM.B;
const KEY = KLM.M + KLM.H + KLM.K;

// ---------- static server ----------
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png" };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  const file = p.endsWith("/") ? path.join(p, "index.html") : p;
  if (!file.startsWith(ROOT) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const BASE = process.env.BASE_URL || `http://localhost:${server.address().port}/`;

const browser = await puppeteer.launch({
  executablePath: BROWSERS.find((b) => fs.existsSync(b)),
  headless: true,
  args: ["--window-size=1920,1080", "--hide-scrollbars"],
  defaultViewport: { width: 1920, height: 1080 }
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(m.text()); });

let failures = 0, counts = { click: 0, key: 0 }, shotN = 0;
const ok = (cond, msg) => { if (!cond) { failures++; console.log("  FAIL " + msg); } else console.log("  ok   " + msg); };
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const screen = () => page.evaluate(() => document.body.dataset.screen);
const cardText = () => page.evaluate(() => { const c = document.querySelector(".rec-card"); return c ? c.innerText.replace(/\s+/g, " ").trim() : null; });

async function shot(name) {
  if (!SHOTS) return;
  fs.mkdirSync(SHOTS, { recursive: true });
  await page.screenshot({ captureBeyondViewport: false, path: path.join(SHOTS, String(++shotN).padStart(2, "0") + "-" + name + ".png") });
}

// Real mouse click in the middle of the element, so the click ripple and the hit test are tested too.
async function click(sel, label) {
  const el = await page.waitForSelector(sel, { visible: true, timeout: 3000 }).catch(() => null);
  if (!el) { ok(false, "click target missing: " + (label || sel) + " on " + (await screen())); return false; }
  const disabled = await el.evaluate((e) => e.disabled || e.getAttribute("aria-disabled") === "true");
  if (disabled) { ok(false, "click target disabled: " + (label || sel) + " on " + (await screen())); return false; }
  await el.scrollIntoView();
  const box = await el.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  counts.click++;
  await pause(120);
  return true;
}
async function clickText(text, label) {
  const handle = await page.evaluateHandle((t) => [...document.querySelectorAll("#app button, #app a")]
    .find((e) => e.textContent.trim().startsWith(t) && e.offsetParent !== null) || null, text);
  const el = handle.asElement();
  if (!el) { ok(false, "button missing: \"" + text + "\" on " + (await screen())); return false; }
  await el.evaluate((e) => e.setAttribute("data-e2e", "1"));
  const r = await click('[data-e2e="1"]', label || text);
  await page.evaluate(() => document.querySelectorAll("[data-e2e]").forEach((e) => e.removeAttribute("data-e2e")));
  return r;
}
async function key(k) { await page.keyboard.press(k); counts.key++; await pause(150); }
async function expectCard(word) {
  const t = await cardText();
  ok(t && t.startsWith(word), "title card \"" + (t || "none") + "\"");
  await shot("card-" + word.toLowerCase());
  await click(".rec-card", "title card");
  ok(!(await cardText()), "title card closed by click");
}

const segments = [];
let seg = null;
function segment(name, target) {
  if (seg) segments.push(seg);
  seg = { name, target, start: { ...counts } };
  console.log("\n" + name);
}
function endSegments() {
  segments.push(seg);
  return segments.map((s, i) => {
    const end = i + 1 < segments.length ? segments[i + 1].start : counts;
    const clicks = end.click - s.start.click, keys = end.key - s.start.key;
    return { ...s, clicks, keys, klm: clicks * CLICK + keys * KEY };
  });
}

// ---------- the run sheet ----------
await page.goto(BASE + "index.html?mode=record");
await page.waitForSelector("#app .shell");

segment("1 Student uploads (S2)", 25);
ok((await screen()) === "S2", "starts at S2");
ok(await page.evaluate(() => getComputedStyle(document.querySelector(".demo-bar")).display === "none"), "demo bar hidden");
ok(await page.evaluate(() => [...document.querySelectorAll(".note, .id-tag, .device-caption")].every((e) => e.offsetParent === null)), "notes, ID tags and device caption hidden");
ok(await page.evaluate(() => !!document.querySelector(".device-tablet")), "student view in the tablet frame");
await expectCard("Student");
await click('[data-action="photo"]', "Take photo 1");
await click('[data-action="photo"]', "Take photo 2 (blurry)");
ok(await page.evaluate(() => document.querySelectorAll(".rec-ripple").length > 0), "click ripple visible");
await click('[data-action="retakePage"]', "Retake blurry page");
await shot("S2-ready");
await click('[data-action="send"]', "Send to my teacher");
await shot("S2-sent");

segment("2 OCR queue and teacher verifies (T1, T2)", 35);
await key("n");
ok((await screen()) === "T1", "N hands over to T1");
await expectCard("Teacher");
ok(await page.evaluate(() => !document.querySelector(".device")), "teacher view uses the full window");
await shot("T1");
await click('#app [data-go="T2"].primary, #app .primary[data-go="T2"]', "Verify (Tim)");
await click('[data-action="ocrSuggest"][data-arg="5"]', "Q2 pick 5");
await click('[data-action="ocrAccept"]', "Q2 Accept");
await shot("T2-q3");
await click('[data-action="ocrCorrect"]', "Q3 Correct");
await click('[data-action="ocrSuggest"][data-arg="4"]', "Q3 pick 4");
// Fork 1 behaviour: Correct, pick a value, Accept. Older behaviour: second Correct click saves.
if (await page.$('[data-action="ocrAccept"]:not([disabled])')) await click('[data-action="ocrAccept"]', "Q3 Accept");
else await click('[data-action="ocrCorrect"]', "Q3 Save correction");
await shot("T2-done");
await click('[data-action="approveText"]', "Approve text and start AI grading");
ok((await screen()) === "T3", "T2 hands over to T3");

segment("3 AI grading and teacher confirms (T3)", 30);
await shot("T3");
await click('[data-action="gAccept"][data-arg="q1"]', "Q1 Accept");
await click('[data-action="gAccept"][data-arg="q2"]', "Q2 Accept");
await click('[data-action="gOverride"][data-arg="q3"]', "Q3 Override");
await click('[data-action="gPts"][data-arg="q3:+"]', "Q3 +1");
await click('[data-action="gReason"][data-arg="q3:Partial credit"]', "Q3 reason Partial credit");
await click('[data-action="fbConfirm"]', "Confirm feedback");
await shot("T3-done");
await click('[data-action="commit"]', "Confirm grade");
ok((await screen()) === "T4", "T3 hands over to T4");

segment("4 Learning gap and red flag (T4)", 25);
await shot("T4");
await click('[data-action="flagDecide"][data-arg="confirmed"]', "Confirm red flag");
await shot("T4-confirmed");

segment("4b Optional: class view of the same gap (T7)", 15);
await clickText("Compare with class");
ok((await screen()) === "T7", "Class Gap Radar open");
await shot("T7");
await click('[data-action="radarSel"][data-arg="compare"]', "Comparing fractions row");
await shot("T7-compare");
await clickText("Open Evidence Trail", "Back to Tim's evidence");
ok((await screen()) === "T4", "T7 back to T4");

segment("5 Unique feature: Learning Trail (T5)", 25);
await clickText("Open Learning Trail");
ok((await screen()) === "T5", "Learning Trail open");
await shot("T5");

segment("6 Personalised feedback and publish (T6)", 15);
await clickText("Send practice pack");
ok((await screen()) === "T6", "T6 open");
await click('[data-action="publish"]', "Publish to student");
await shot("T6-published");

segment("7 Student sees results (S1, S3, S4)", 30);
await key("n");
ok((await screen()) === "S1", "N hands over to S1");
await expectCard("Student");
await shot("S1");
await clickText("Open", "Open new feedback");
ok((await screen()) === "S3", "S3 results");
await shot("S3");
await clickText("Start practice");
ok((await screen()) === "S4", "S4 practice");
for (let i = 0; i < 3; i++) await click('[data-action="practise"]', "practice question");
await shot("S4-mission");

segment("8 Parent view (P1, bonus)", 20);
await key("n");
ok((await screen()) === "P1", "N hands over to P1");
await expectCard("Parent");
ok(await page.evaluate(() => !!document.querySelector(".device-phone")), "parent view in the phone frame");
await shot("P1");
await click('[data-action="parentCompose"]', "Message teacher");
await click('[data-action="parentQuick"]', "Quick reply");
await click('[data-action="parentSend"]', "Send");
ok(await page.evaluate(() => document.body.innerText.includes("Message sent")), "\"Message sent\" shown");
await shot("P1-sent");

segment("9 Closing (P1 stays on screen)", 5);
const table = endSegments();

// ---------- safety keys ----------
console.log("\nSafety keys");
await key("r");
ok((await screen()) === "S2", "R resets to S2");
ok(await page.evaluate(() => LS.state.upload === "empty" && LS.state.published === false), "R gives a clean state");
ok((await cardText() || "").startsWith("Student"), "R shows the student title card");
await key(" ");
ok(!(await cardText()), "Space closes the title card");
const path9 = ["S2", "T1", "T2", "T3", "T4", "T5", "T6", "S1", "S3", "S4", "P1"];
for (let i = 1; i < path9.length; i++) {
  await key("ArrowRight");
  if (await cardText()) await key("Enter");
  ok((await screen()) === path9[i], "N/Right arrow reaches " + path9[i]);
}
ok(await page.evaluate(() => LS.state.published && LS.state.committed && LS.state.flag === "confirmed"), "N path leaves a consistent state");
await key("d");
ok(await page.evaluate(() => getComputedStyle(document.querySelector(".demo-bar")).display !== "none"), "D still shows the demo bar (app.js)");
await key("d");
await page.goto(BASE + "index.html");
await page.waitForSelector("#app .shell");
ok(await page.evaluate(() => !document.querySelector(".rec-card") && !document.documentElement.classList.contains("record")), "normal mode has no record UI");
ok(await page.evaluate(() => getComputedStyle(document.querySelector(".demo-bar")).display !== "none"), "normal mode keeps the demo bar (prefs not touched)");

ok(errors.length === 0, "no console errors" + (errors.length ? ": " + errors.join(" | ") : ""));

// ---------- dry run table ----------
console.log("\nDry run (target seconds vs. KLM minimum for the clicks alone)");
let total = 0;
for (const s of table) {
  total += s.target;
  console.log(`  ${s.name.padEnd(48)} target ${String(s.target).padStart(3)} s  clicks ${String(s.clicks).padStart(2)}  keys ${s.keys}  KLM ${s.klm.toFixed(1).padStart(5)} s`);
}
console.log(`  total target ${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")} (without 4b: ${Math.floor((total - 15) / 60)}:${String((total - 15) % 60).padStart(2, "0")})`);

await browser.close();
server.close();
console.log(failures ? `\n${failures} check(s) failed` : "\nAll checks passed");
process.exit(failures ? 1 : 0);
