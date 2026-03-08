import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { recentMeals = [], pantryItems = [], busyWeek = false } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        suggestions: getDefaultSuggestions(busyWeek),
      });
    }

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
            content: `You are a meal suggestion AI for a couple (Neha & Knuckles). Suggest 5 meal ideas based on their history and pantry.

${busyWeek ? "IMPORTANT: This is a BUSY WEEK. Only suggest meals that take under 30 minutes, with minimal prep and cleanup. Prioritize one-pot meals, stir-fries, wraps, and simple dishes." : ""}

Their recent meals: ${recentMeals.join(", ") || "none yet"}
Their pantry has: ${pantryItems.join(", ") || "basic staples"}

Consider:
- Variety from recent meals (don't repeat too much)
- Use pantry items when possible
- Mix of cuisines
- Practical for two people

Return JSON array of 5 objects with:
- name: meal name
- description: 1-sentence description
- prepTime: estimated prep time (e.g. "20 min", "45 min")
- ingredients: array of main ingredients
- reason: why you're suggesting this (1 sentence, personal/helpful)

Respond ONLY with valid JSON array, no markdown.`,
          },
          { role: "user", content: "Give me meal suggestions for this week" },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    try {
      const suggestions = JSON.parse(
        content.replace(/```json?\n?/g, "").replace(/```/g, "").trim()
      );
      return NextResponse.json({ suggestions });
    } catch {
      return NextResponse.json({ suggestions: getDefaultSuggestions(busyWeek) });
    }
  } catch (error) {
    console.error("Suggest error:", error);
    return NextResponse.json({ error: "Failed to get suggestions" }, { status: 500 });
  }
}

function getDefaultSuggestions(busyWeek: boolean) {
  if (busyWeek) {
    return [
      {
        name: "15-Minute Garlic Shrimp Pasta",
        description: "Quick sautéed shrimp with garlic butter over angel hair pasta.",
        prepTime: "15 min",
        ingredients: ["shrimp", "pasta", "garlic", "butter", "parsley", "lemon"],
        reason: "Super fast and only one pan needed — perfect for busy nights.",
      },
      {
        name: "Sheet Pan Chicken Fajitas",
        description: "Seasoned chicken and peppers roasted together, served in tortillas.",
        prepTime: "25 min",
        ingredients: ["chicken breast", "bell peppers", "onion", "tortillas", "lime", "spices"],
        reason: "Minimal prep — just chop, season, and let the oven do the work.",
      },
      {
        name: "Quick Veggie Stir Fry",
        description: "Crispy vegetables in soy-ginger sauce over rice.",
        prepTime: "15 min",
        ingredients: ["mixed vegetables", "soy sauce", "ginger", "garlic", "rice"],
        reason: "Uses whatever veggies you have and comes together in minutes.",
      },
      {
        name: "Caprese Grilled Cheese",
        description: "Elevated grilled cheese with fresh mozzarella, tomato, and basil.",
        prepTime: "10 min",
        ingredients: ["bread", "mozzarella", "tomato", "basil", "butter"],
        reason: "Comfort food that's ready in 10 minutes flat.",
      },
      {
        name: "Black Bean Quesadillas",
        description: "Crispy quesadillas stuffed with black beans, cheese, and corn.",
        prepTime: "12 min",
        ingredients: ["tortillas", "black beans", "cheddar", "corn", "salsa"],
        reason: "A crowd-pleaser that uses mostly pantry staples.",
      },
    ];
  }

  return [
    {
      name: "Butter Chicken with Naan",
      description: "Creamy tomato-based curry with tender chicken, served with warm naan.",
      prepTime: "45 min",
      ingredients: ["chicken thighs", "tomato sauce", "cream", "butter", "naan", "garam masala", "ginger"],
      reason: "A comforting classic that's great for meal prep too.",
    },
    {
      name: "Mediterranean Grain Bowl",
      description: "Quinoa bowl with roasted veggies, feta, hummus, and tahini dressing.",
      prepTime: "35 min",
      ingredients: ["quinoa", "chickpeas", "cucumber", "feta", "hummus", "cherry tomatoes"],
      reason: "Light, nutritious, and endlessly customizable with what you have.",
    },
    {
      name: "Korean Bibimbap",
      description: "Rice bowl topped with sautéed vegetables, a fried egg, and gochujang.",
      prepTime: "40 min",
      ingredients: ["rice", "spinach", "carrots", "zucchini", "egg", "gochujang", "sesame oil"],
      reason: "Beautiful, balanced, and a fun dish to assemble together.",
    },
    {
      name: "Homemade Margherita Pizza",
      description: "Simple pizza with fresh mozzarella, basil, and San Marzano tomatoes.",
      prepTime: "50 min",
      ingredients: ["pizza dough", "mozzarella", "basil", "San Marzano tomatoes", "olive oil"],
      reason: "A fun weekend activity for two — and the leftovers are great.",
    },
    {
      name: "Thai Green Curry",
      description: "Coconut milk curry with vegetables and Thai basil over jasmine rice.",
      prepTime: "30 min",
      ingredients: ["coconut milk", "green curry paste", "tofu or chicken", "bell pepper", "bamboo shoots", "jasmine rice"],
      reason: "Aromatic, warming, and easy to adjust to your spice preference.",
    },
  ];
}
