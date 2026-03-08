import { test, expect } from "@playwright/test";

test.describe("Meal Plan Page", () => {
  test("shows the weekly planner with day selector", async ({ page }) => {
    await page.goto("/plan");
    await expect(page.locator("text=Meal Plan")).toBeVisible();
    // Day buttons should be visible
    await expect(page.locator("text=Mon").first()).toBeVisible();
    await expect(page.locator("text=Tue").first()).toBeVisible();
    await expect(page.locator("text=Wed").first()).toBeVisible();
  });

  test("shows meal type sections for selected day", async ({ page }) => {
    await page.goto("/plan");
    // Should show meal type labels
    await expect(page.locator("text=breakfast").first()).toBeVisible();
    await expect(page.locator("text=lunch").first()).toBeVisible();
    await expect(page.locator("text=dinner").first()).toBeVisible();
  });

  test("can switch between days", async ({ page }) => {
    await page.goto("/plan");
    // Click on Wednesday
    const wedButton = page.locator("button").filter({ hasText: "Wed" }).first();
    await wedButton.click();
    await expect(page.locator("h2")).toContainText(/wednesday/i);
  });

  test("shows week navigation arrows", async ({ page }) => {
    await page.goto("/plan");
    // Previous and next week buttons
    await expect(page.locator("text=‹")).toBeVisible();
    await expect(page.locator("text=›")).toBeVisible();
  });

  test("has voice input button", async ({ page }) => {
    await page.goto("/plan");
    await expect(page.locator("text=Speak to add meals")).toBeVisible();
  });
});
