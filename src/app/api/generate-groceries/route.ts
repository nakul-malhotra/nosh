import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { meals, pantryItems = [] } = await req.json();

    if (!meals || meals.length === 0) {
      return NextResponse.json({ error: "No meals provided" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Fallback: generate basic grocery list from meal ingredients
      return NextResponse.json({ items: generateLocally(meals, pantryItems) });
    }

    const mealList = meals
      .map((m: { name: string; ingredients?: string[] }) =>
        `${m.name}${m.ingredients?.length ? ` (known ingredients: ${m.ingredients.join(", ")})` : ""}`
      )
      .join("\n");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You generate grocery lists from meal plans. Given a list of meals, output all ingredients needed.

IMPORTANT: The user already has these items in their pantry, so EXCLUDE them: ${pantryItems.join(", ") || "none"}

Return JSON array of objects with:
- name: ingredient name
- category: one of "Produce", "Protein", "Dairy", "Grains & Bread", "Canned & Jarred", "Frozen", "Spices & Seasonings", "Oils & Condiments", "Snacks", "Beverages", "Other"
- quantity: approximate quantity needed (e.g. "2 lbs", "1 bunch", "200g")

Combine duplicates and aggregate quantities. Respond ONLY with valid JSON array, no markdown.`,
          },
          { role: "user", content: `Meals this week:\n${mealList}` },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    try {
      const items = JSON.parse(content.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
      return NextResponse.json({ items });
    } catch {
      return NextResponse.json({ items: generateLocally(meals, pantryItems) });
    }
  } catch (error) {
    console.error("Generate groceries error:", error);
    return NextResponse.json({ error: "Failed to generate" }, { status: 500 });
  }
}

function generateLocally(
  meals: Array<{ name: string; ingredients?: string[] }>,
  pantryItems: string[]
) {
  const allIngredients = new Set<string>();
  const pantryLower = pantryItems.map((p) => p.toLowerCase());

  for (const meal of meals) {
    if (meal.ingredients) {
      for (const ing of meal.ingredients) {
        if (!pantryLower.some((p) => ing.toLowerCase().includes(p))) {
          allIngredients.add(ing);
        }
      }
    }
  }

  return Array.from(allIngredients).map((name) => ({
    name,
    category: "Other",
    quantity: "",
  }));
}
