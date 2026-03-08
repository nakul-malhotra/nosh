import { test, expect } from "@playwright/test";

test.describe("Groceries Page", () => {
  test("shows empty state when no groceries", async ({ page }) => {
    await page.goto("/groceries");
    await expect(page.locator("h1")).toContainText("Groceries");
    await expect(page.locator("text=Your grocery list is empty")).toBeVisible();
  });

  test("shows generate button", async ({ page }) => {
    await page.goto("/groceries");
    await expect(page.locator("text=Add meals first")).toBeVisible();
  });

  test("can open add grocery item sheet", async ({ page }) => {
    await page.goto("/groceries");
    // Click the + button
    const addBtn = page.locator("button").filter({ hasText: "+" }).first();
    await addBtn.click();
    await expect(page.locator("text=Add grocery item")).toBeVisible();
  });

  test("can add a grocery item manually", async ({ page }) => {
    await page.goto("/groceries");
    await page.locator("[data-testid='grocery-add-btn']").click();
    await expect(page.locator("text=Add grocery item")).toBeVisible();
    await page.fill("input[placeholder*='Avocados']", "Tomatoes");
    await page.locator("[data-testid='grocery-submit-btn']").click();
    await expect(page.locator("text=Tomatoes")).toBeVisible();
  });

  test("can check off a grocery item", async ({ page }) => {
    await page.goto("/groceries");
    await page.locator("[data-testid='grocery-add-btn']").click();
    await page.fill("input[placeholder*='Avocados']", "Bananas");
    await page.locator("[data-testid='grocery-submit-btn']").click();
    await page.waitForTimeout(500);
    // Check it off
    await page.locator("button.border-2").first().click();
    await expect(page.locator("text=1 of 1")).toBeVisible();
  });
});
