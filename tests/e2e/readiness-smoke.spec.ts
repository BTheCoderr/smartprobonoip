import { expect, test } from "@playwright/test";

// These tests run on localhost with no Supabase or AI credentials.
// Synthetic HydroSeal is the existing first-party demo fixture, never a real inventor.

test("Learn → explicit consent → demo intake → generated packet → professional export", async ({ page }) => {
  // Ensure a CI browser cannot contact an external service with demo text.
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.protocol === "http:" || url.protocol === "https:") {
      if (url.hostname !== "127.0.0.1" || url.port !== "3210") {
        return route.abort();
      }
    }
    return route.continue();
  });

  await page.goto("/learn");
  const start = page.getByRole("link", { name: "Start patent readiness", exact: true });
  await expect(start).toBeVisible();
  await start.click();
  await expect(page).toHaveURL(/\/disclaimer(?:\?|$)/);

  // Start the documented demo explicitly; do not create a real customer record.
  await page.goto("/disclaimer?demo=1");
  await expect(page.getByRole("heading", { name: "Before you begin: please read this" })).toBeVisible();
  const proceed = page.getByRole("button", {
    name: "I acknowledge — continue to intake",
  });
  await expect(proceed).toBeDisabled();
  const consent = page.locator('input[type="checkbox"]');
  await expect(consent).toHaveCount(2);
  await consent.nth(0).check();
  await expect(proceed).toBeDisabled();
  await consent.nth(1).check();
  await expect(proceed).toBeEnabled();
  await proceed.click();

  await expect(page).toHaveURL(/\/start\?demo=1/);
  await expect(page.getByText("Demo mode:", { exact: false })).toBeVisible();
  await expect(page.getByText("What did you create?", { exact: false }).first()).toBeVisible();

  // Five existing wizard steps; the fiction-only demo pre-fills required fields.
  for (let step = 0; step < 4; step += 1) {
    const next = page.getByRole("button", { name: /^Continue/ });
    await expect(next).toBeEnabled();
    await next.click();
  }
  const generate = page.getByRole("button", { name: "Generate demo packet" });
  await expect(generate).toBeEnabled();

  const apiResult = page.waitForResponse((response) =>
    response.url().endsWith("/api/generate") &&
    response.request().method() === "POST",
  );
  await generate.click();
  const response = await apiResult;
  expect(response.ok(), "local rule-based packet generation should succeed").toBe(true);

  await expect(page).toHaveURL(/\/profile\/[^/?#]+/, { timeout: 30_000 });
  await expect(page.getByText(/HydroSeal/i).first()).toBeVisible();
  await expect(page.getByText("Handoff packet")).toBeVisible();

  // Check that handoff UI can be opened, without emailing or sharing anything.
  await page.getByRole("button", { name: "Export professional JSON" }).first().click();
  await expect(page.getByRole("dialog", { name: "Export for Attorney" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Download export" })).toBeVisible();
});

test("A fresh browser cannot enter the intake without consent", async ({ page }) => {
  await page.goto("/start");
  await expect(page.getByRole("heading", { name: "Please review the disclaimer first" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Read & acknowledge the disclaimer" })).toBeVisible();
});

test("Public sample packet is clearly fictional and exposes professional handoff", async ({ page }) => {
  await page.goto("/sample");
  await expect(page.getByText(/Fictional HydroSeal example/i)).toBeVisible();
  await expect(page.getByText("Fictional demo · HydroSeal portable filter bottle")).toBeVisible();
  await page.getByRole("button", { name: "Export professional JSON" }).first().click();
  await expect(page.getByRole("dialog", { name: "Export for Attorney" })).toBeVisible();
});
