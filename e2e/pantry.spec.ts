import { test, expect } from "@playwright/test";

test.describe("Pantry Page", () => {
  test("shows empty pantry state", async ({ page }) => {
    await page.goto("/pantry");
    await expect(page.locator("h1")).toContainText("Pantry");
    await expect(page.locator("text=Your pantry is empty")).toBeVisible();
  });

  test("shows quick add essentials when pantry is empty", async ({ page }) => {
    await page.goto("/pantry");
    await expect(page.locator("text=Quick add essentials")).toBeVisible();
    await expect(page.locator("text=Salt").first()).toBeVisible();
  });

  test("can quick-add a pantry essential", async ({ page }) => {
    await page.goto("/pantry");
    await page.click("button:has-text('+ Salt')");
    // Salt should appear as a pantry item
    await expect(page.locator("text=Salt").first()).toBeVisible();
    await expect(page.locator("text=1 items in stock")).toBeVisible();
  });

  test("can open add pantry item sheet", async ({ page }) => {
    await page.goto("/pantry");
    await page.locator("[data-testid='pantry-add-btn']").click();
    await expect(page.locator("input[placeholder='Item name']")).toBeVisible();
  });

  test("can add a custom pantry item", async ({ page }) => {
    await page.goto("/pantry");
    await page.locator("[data-testid='pantry-add-btn']").click();
    await page.fill("input[placeholder='Item name']", "Coconut Milk");
    await page.locator("[data-testid='pantry-submit-btn']").click();
    await expect(page.locator("text=Coconut Milk")).toBeVisible();
  });

  test("search filters pantry items", async ({ page }) => {
    await page.goto("/pantry");
    // Add items via the add form
    await page.locator("[data-testid='pantry-add-btn']").click();
    await page.fill("input[placeholder='Item name']", "Salt");
    await page.locator("[data-testid='pantry-submit-btn']").click();
    await page.waitForTimeout(500);
    await page.locator("[data-testid='pantry-add-btn']").click();
    await page.fill("input[placeholder='Item name']", "Pepper");
    await page.locator("[data-testid='pantry-submit-btn']").click();
    await page.waitForTimeout(500);
    // Search for salt
    await page.fill("input[placeholder='Search pantry...']", "Salt");
    await page.waitForTimeout(300);
    await expect(page.locator("span:has-text('Salt')").first()).toBeVisible();
  });
});
