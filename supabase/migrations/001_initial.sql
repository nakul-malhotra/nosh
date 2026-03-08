-- Nosh: Meal Planner Database Schema

-- Meal plans (one per week)
CREATE TABLE IF NOT EXISTS meal_plans (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  week_start DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(week_start)
);

-- Individual meals
CREATE TABLE IF NOT EXISTS meals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  meal_plan_id TEXT REFERENCES meal_plans(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('monday','tuesday','wednesday','thursday','friday','saturday','sunday')),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  name TEXT NOT NULL,
  recipe_notes TEXT,
  ingredients JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Grocery items
CREATE TABLE IF NOT EXISTS grocery_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  meal_plan_id TEXT REFERENCES meal_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Other',
  quantity TEXT,
  unit TEXT,
  checked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pantry items
CREATE TABLE IF NOT EXISTS pantry_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Other',
  added_at TIMESTAMPTZ DEFAULT now()
);

-- Meal history for AI learning
CREATE TABLE IF NOT EXISTS meal_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  meal_name TEXT NOT NULL,
  ingredients JSONB DEFAULT '[]'::jsonb,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  cooked_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_meals_plan ON meals(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_meals_day ON meals(day_of_week);
CREATE INDEX IF NOT EXISTS idx_grocery_plan ON grocery_items(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_grocery_checked ON grocery_items(checked);
CREATE INDEX IF NOT EXISTS idx_pantry_name ON pantry_items(name);
CREATE INDEX IF NOT EXISTS idx_meal_history_date ON meal_history(cooked_at);

-- Disable RLS for simplicity (single-user app)
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_history ENABLE ROW LEVEL SECURITY;

-- Allow all operations with anon key (personal app)
CREATE POLICY "Allow all on meal_plans" ON meal_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on meals" ON meals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on grocery_items" ON grocery_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on pantry_items" ON pantry_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on meal_history" ON meal_history FOR ALL USING (true) WITH CHECK (true);
