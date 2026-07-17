/**
 * Capture real product screenshots for the homepage/pilot walkthrough.
 * Run: node scripts/capture-walkthrough.mjs
 */
import { chromium } from "playwright";
import { createHash } from "crypto";
import { mkdirSync, readFileSync } from "fs";

const OUT = "public/product-proof/walkthrough";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 860 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

async function shot(file) {
  await page.screenshot({ path: `${OUT}/${file}`, type: "png" });
  const hash = createHash("md5")
    .update(readFileSync(`${OUT}/${file}`))
    .digest("hex");
  console.log("Wrote", file, hash.slice(0, 8));
}

async function acknowledgeDisclaimer() {
  await page.goto("https://smartprobono.org/disclaimer?demo=1", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForTimeout(1000);
  const boxes = page.locator('input[type="checkbox"]');
  const count = await boxes.count();
  for (let i = 0; i < count; i += 1) {
    await boxes.nth(i).check({ force: true });
  }
  const btn = page.getByRole("button", {
    name: /I acknowledge — continue to intake/i,
  });
  await btn.waitFor({ state: "visible", timeout: 10000 });
  await page.waitForFunction(() => {
    const button = Array.from(document.querySelectorAll("button")).find((b) =>
      /acknowledge/i.test(b.textContent || ""),
    );
    return button && !button.disabled;
  });
  await btn.click();
  await page.waitForURL(/\/start/, { timeout: 20000 });
  await page.waitForTimeout(1200);
}

await acknowledgeDisclaimer();

// 1. Guided intake
await page
  .getByText("What did you create?", { exact: false })
  .first()
  .waitFor({ timeout: 20000 });
await page.evaluate(() => window.scrollTo(0, 140));
await page.waitForTimeout(400);
await shot("01-guided-intake.png");

// 2. Organize story — optional details expanded
const optional = page.getByRole("button", { name: /optional details/i }).first();
if (await optional.count()) {
  await optional.click();
  await page.waitForTimeout(500);
}
await page.evaluate(() => window.scrollBy(0, 280));
await page.waitForTimeout(400);
await shot("02-organize-story.png");

// Advance a couple steps for richer organization if continue works
for (let i = 0; i < 2; i += 1) {
  const cont = page.getByRole("button", { name: /^Continue$/i }).first();
  if ((await cont.count()) && (await cont.isEnabled().catch(() => false))) {
    await cont.click();
    await page.waitForTimeout(900);
  }
}
if (
  await page
    .getByText(/Timeline|Materials|Search prep|disclosures/i)
    .first()
    .count()
) {
  await page.evaluate(() => window.scrollTo(0, 160));
  await page.waitForTimeout(400);
  await shot("02-organize-story.png");
}

// Sample packet
await page.goto("https://smartprobono.org/sample", {
  waitUntil: "domcontentloaded",
  timeout: 60000,
});
await page.waitForTimeout(1600);

// 4. Packet overview near top
await page.evaluate(() => window.scrollTo(0, 220));
await page.waitForTimeout(400);
await shot("04-readiness-packet.png");

// 3. Missing information / readiness review deeper in page
const gap = page
  .locator(
    "text=/Readiness score|How to improve|Packet review|Missing|checklist/i",
  )
  .first();
if (await gap.count()) {
  await gap.scrollIntoViewIfNeeded();
  await page.waitForTimeout(450);
  await page.evaluate(() => window.scrollBy(0, -40));
} else {
  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(400);
}
await shot("03-missing-information.png");

// 5. Professional handoff / export
const handoff = page
  .locator("text=/Handoff packet|Download PDF|Export for Attorney/i")
  .first();
if (await handoff.count()) {
  await handoff.scrollIntoViewIfNeeded();
  await page.waitForTimeout(450);
  await page.evaluate(() => window.scrollBy(0, -40));
} else {
  await page.goto("https://smartprobono.org/for-professionals", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, 200));
}
await shot("05-professional-review.png");

await browser.close();
console.log("Done");
