import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: "No transcript provided" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Fallback: simple rule-based parsing when no API key
      return NextResponse.json({ meals: parseTranscriptLocally(transcript) });
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
            content: `You parse meal plan transcripts into structured data. Extract meals mentioned for each day and meal type.

Return JSON array of objects with:
- day: lowercase day of week (monday, tuesday, etc.)
- type: meal type (breakfast, lunch, dinner, snack)
- name: meal name
- ingredients: array of likely ingredients

If a day isn't mentioned, skip it. If meal type isn't specified, infer from context (morning=breakfast, etc).
Respond ONLY with valid JSON array, no markdown.`,
          },
          { role: "user", content: transcript },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    try {
      const meals = JSON.parse(content.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
      return NextResponse.json({ meals });
    } catch {
      return NextResponse.json({ meals: parseTranscriptLocally(transcript) });
    }
  } catch (error) {
    console.error("Parse meals error:", error);
    return NextResponse.json({ error: "Failed to parse meals" }, { status: 500 });
  }
}

function parseTranscriptLocally(transcript: string) {
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const mealTypes = ["breakfast", "lunch", "dinner", "snack"];
  const meals: Array<{ day: string; type: string; name: string; ingredients: string[] }> = [];

  const lower = transcript.toLowerCase();
  let currentDay = "monday";
  let currentType = "dinner";

  const sentences = lower.split(/[.,;]+/).map((s) => s.trim()).filter(Boolean);

  for (const sentence of sentences) {
    for (const day of days) {
      if (sentence.includes(day)) currentDay = day;
    }
    for (const type of mealTypes) {
      if (sentence.includes(type)) currentType = type;
    }

    // Extract meal name: look for patterns like "is X" or "we'll have X" or "making X"
    const patterns = [
      /(?:is|have|having|making|cook|eating|eat|we'll make|gonna make|going to make)\s+(.+)/,
      /(?:for (?:breakfast|lunch|dinner|snack))\s*(?:is|we'll have|we're having)?\s*(.+)/,
    ];

    for (const pattern of patterns) {
      const match = sentence.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim().replace(/^(a |an |some )/, "");
        if (name.length > 2 && name.length < 100) {
          meals.push({ day: currentDay, type: currentType, name, ingredients: [] });
          break;
        }
      }
    }
  }

  return meals;
}
