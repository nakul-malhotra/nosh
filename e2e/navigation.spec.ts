import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("renders the Nosh branding and greeting", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Nosh");
    await expect(page.locator("text=Neha")).toBeVisible();
  });

  test("shows today's menu section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Today's Menu")).toBeVisible();
  });

  test("shows the voice input button", async ({ page }) => {
    await page.goto("/");
    // The mic button SVG should be present
    await expect(page.locator("button").filter({ has: page.locator("svg") }).first()).toBeVisible();
  });

  test("shows week info card with day indicators", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=This Week")).toBeVisible();
    // Should show abbreviated day labels
    await expect(page.locator("text=Mon")).toBeVisible();
    await expect(page.locator("text=Sun")).toBeVisible();
  });

  test("opens quick add modal", async ({ page }) => {
    await page.goto("/");
    await page.click("text=+ Add");
    await expect(page.locator("text=Add a meal")).toBeVisible();
    await expect(page.locator("input[placeholder*='Chicken']")).toBeVisible();
  });

  test("can add a meal via quick add", async ({ page }) => {
    await page.goto("/");
    await page.click("text=+ Add");
    await page.fill("input[placeholder*='Chicken']", "Spaghetti Bolognese");
    await page.click("text=Add to plan");
    // Modal should close and meal should not be in today's list unless day matches
  });
});

test.describe("Bottom Navigation", () => {
  test("all navigation tabs are present", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.locator("nav >> text=Home")).toBeVisible();
    await expect(page.locator("nav >> text=Plan")).toBeVisible();
    await expect(page.locator("nav >> text=Shop")).toBeVisible();
    await expect(page.locator("nav >> text=Pantry")).toBeVisible();
    await expect(page.locator("nav >> text=Ideas")).toBeVisible();
  });

  test("navigates to plan page", async ({ page }) => {
    await page.goto("/");
    await page.click("nav >> text=Plan");
    await expect(page).toHaveURL("/plan");
    await expect(page.locator("text=Meal Plan")).toBeVisible();
  });

  test("navigates to groceries page", async ({ page }) => {
    await page.goto("/");
    await page.click("nav >> text=Shop");
    await expect(page).toHaveURL("/groceries");
    await expect(page.locator("h1")).toContainText("Groceries");
  });

  test("navigates to pantry page", async ({ page }) => {
    await page.goto("/");
    await page.click("nav >> text=Pantry");
    await expect(page).toHaveURL("/pantry");
    await expect(page.locator("h1")).toContainText("Pantry");
  });

  test("navigates to suggestions page", async ({ page }) => {
    await page.goto("/");
    await page.click("nav >> text=Ideas");
    await expect(page).toHaveURL("/suggestions");
    await expect(page.locator("h1")).toContainText("Meal Ideas");
  });
});
