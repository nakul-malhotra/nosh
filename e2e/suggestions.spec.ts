import { test, expect } from "@playwright/test";

test.describe("Suggestions Page", () => {
  test("shows the suggestions page", async ({ page }) => {
    await page.goto("/suggestions");
    await expect(page.locator("h1")).toContainText("Meal Ideas");
    await expect(page.locator("text=AI-powered suggestions")).toBeVisible();
  });

  test("shows busy week toggle", async ({ page }) => {
    await page.goto("/suggestions");
    await expect(page.locator("text=Busy week mode")).toBeVisible();
  });

  test("shows context info cards", async ({ page }) => {
    await page.goto("/suggestions");
    await expect(page.locator("text=Past meals")).toBeVisible();
    await expect(page.locator("text=Pantry items")).toBeVisible();
  });

  test("shows get suggestions button", async ({ page }) => {
    await page.goto("/suggestions");
    await expect(page.locator("text=Get meal suggestions")).toBeVisible();
  });

  test("can toggle busy week mode", async ({ page }) => {
    await page.goto("/suggestions");
    const toggle = page.locator("button.rounded-full").filter({ has: page.locator("div.bg-white") }).first();
    await toggle.click();
    // Toggle should change state (visual feedback)
  });

  test("fetches suggestions when button is clicked", async ({ page }) => {
    await page.goto("/suggestions");
    await page.click("text=Get meal suggestions");
    // Should show loading state or results
    await page.waitForTimeout(2000);
    // Either shows suggestions or ready state
    const hasSuggestions = await page.locator(".rounded-3xl").count();
    expect(hasSuggestions).toBeGreaterThan(0);
  });
});

test.describe("API Routes", () => {
  test("parse-meals API returns structured data", async ({ request }) => {
    const response = await request.post("/api/parse-meals", {
      data: {
        transcript: "Monday dinner is chicken tikka masala. Tuesday lunch is a salad.",
      },
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("meals");
    expect(Array.isArray(data.meals)).toBe(true);
  });

  test("parse-meals handles empty transcript", async ({ request }) => {
    const response = await request.post("/api/parse-meals", {
      data: { transcript: "" },
    });
    expect(response.status()).toBe(400);
  });

  test("generate-groceries handles empty meals", async ({ request }) => {
    const response = await request.post("/api/generate-groceries", {
      data: { meals: [] },
    });
    expect(response.status()).toBe(400);
  });

  test("suggest API returns suggestions", async ({ request }) => {
    const response = await request.post("/api/suggest", {
      data: {
        recentMeals: ["pasta", "tacos"],
        pantryItems: ["rice", "garlic"],
        busyWeek: false,
      },
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("suggestions");
    expect(Array.isArray(data.suggestions)).toBe(true);
    expect(data.suggestions.length).toBeGreaterThan(0);
  });
});
