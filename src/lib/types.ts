export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export const DAYS: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const MEAL_TYPES: MealType[] = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

export const MEAL_EMOJIS: Record<MealType, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
  snack: "🍿",
};

export interface MealPlan {
  id: string;
  week_start: string;
  created_at: string;
}

export interface Meal {
  id: string;
  meal_plan_id: string;
  day_of_week: DayOfWeek;
  meal_type: MealType;
  name: string;
  recipe_notes?: string;
  ingredients: string[];
}

export interface GroceryItem {
  id: string;
  meal_plan_id: string;
  name: string;
  category: string;
  quantity?: string;
  unit?: string;
  checked: boolean;
}

export interface PantryItem {
  id: string;
  name: string;
  category: string;
  added_at: string;
}

export interface MealHistory {
  id: string;
  meal_name: string;
  ingredients: string[];
  rating: number;
  cooked_at: string;
}

export const GROCERY_CATEGORIES = [
  "Produce",
  "Protein",
  "Dairy",
  "Grains & Bread",
  "Canned & Jarred",
  "Frozen",
  "Spices & Seasonings",
  "Oils & Condiments",
  "Snacks",
  "Beverages",
  "Other",
] as const;

export const CATEGORY_EMOJIS: Record<string, string> = {
  Produce: "🥬",
  Protein: "🥩",
  Dairy: "🧀",
  "Grains & Bread": "🍞",
  "Canned & Jarred": "🥫",
  Frozen: "🧊",
  "Spices & Seasonings": "🌿",
  "Oils & Condiments": "🫒",
  Snacks: "🍿",
  Beverages: "🥤",
  Other: "📦",
};
