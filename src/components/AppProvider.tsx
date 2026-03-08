"use client";

import { useState, createContext, useContext, ReactNode, useCallback } from "react";
import { Meal, MealPlan, GroceryItem, PantryItem, DayOfWeek, MealType } from "@/lib/types";
import { getMondayOfWeek, generateId } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface AppState {
  currentWeek: string;
  setCurrentWeek: (week: string) => void;
  mealPlan: MealPlan | null;
  meals: Meal[];
  groceries: GroceryItem[];
  pantryItems: PantryItem[];
  isLoading: boolean;
  addMeal: (day: DayOfWeek, type: MealType, name: string, ingredients?: string[]) => void;
  removeMeal: (id: string) => void;
  addMealsFromParsed: (parsed: Array<{ day: DayOfWeek; type: MealType; name: string; ingredients: string[] }>) => void;
  clearMeals: () => void;
  toggleGrocery: (id: string) => void;
  setGroceries: (items: GroceryItem[]) => void;
  addGrocery: (name: string, category?: string) => void;
  removeGrocery: (id: string) => void;
  addPantryItem: (name: string, category?: string) => void;
  removePantryItem: (id: string) => void;
  pantryHas: (name: string) => boolean;
}

const AppContext = createContext<AppState | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentWeek, setCurrentWeek] = useState(getMondayOfWeek());
  const [mealPlan] = useState<MealPlan>({
    id: generateId(),
    week_start: currentWeek,
    created_at: new Date().toISOString(),
  });
  const [meals, setMeals] = useState<Meal[]>([]);
  const [groceries, setGroceriesState] = useState<GroceryItem[]>([]);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [isLoading] = useState(false);

  const addMeal = useCallback(
    (day: DayOfWeek, type: MealType, name: string, ingredients: string[] = []) => {
      const newMeal: Meal = {
        id: generateId(),
        meal_plan_id: mealPlan.id,
        day_of_week: day,
        meal_type: type,
        name,
        ingredients,
      };
      setMeals((prev) => [...prev, newMeal]);
      supabase.from("meals").insert(newMeal).then(() => {});
    },
    [mealPlan.id]
  );

  const removeMeal = useCallback((id: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== id));
    supabase.from("meals").delete().eq("id", id).then(() => {});
  }, []);

  const addMealsFromParsed = useCallback(
    (parsed: Array<{ day: DayOfWeek; type: MealType; name: string; ingredients: string[] }>) => {
      const newMeals = parsed.map((m) => ({
        id: generateId(),
        meal_plan_id: mealPlan.id,
        day_of_week: m.day,
        meal_type: m.type,
        name: m.name,
        ingredients: m.ingredients,
      }));
      setMeals((prev) => [...prev, ...newMeals]);
      supabase.from("meals").insert(newMeals).then(() => {});
    },
    [mealPlan.id]
  );

  const clearMeals = useCallback(() => {
    setMeals([]);
  }, []);

  const toggleGrocery = useCallback((id: string) => {
    setGroceriesState((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  }, []);

  const setGroceries = useCallback((items: GroceryItem[]) => {
    setGroceriesState(items);
  }, []);

  const addGrocery = useCallback(
    (name: string, category: string = "Other") => {
      setGroceriesState((prev) => [
        ...prev,
        { id: generateId(), meal_plan_id: mealPlan.id, name, category, checked: false },
      ]);
    },
    [mealPlan.id]
  );

  const removeGrocery = useCallback((id: string) => {
    setGroceriesState((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const addPantryItem = useCallback((name: string, category: string = "Other") => {
    setPantryItems((prev) =>
      [...prev, { id: generateId(), name, category, added_at: new Date().toISOString() }].sort(
        (a, b) => a.name.localeCompare(b.name)
      )
    );
  }, []);

  const removePantryItem = useCallback((id: string) => {
    setPantryItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const pantryHas = useCallback(
    (name: string) => pantryItems.some((i) => i.name.toLowerCase().includes(name.toLowerCase())),
    [pantryItems]
  );

  return (
    <AppContext.Provider
      value={{
        currentWeek,
        setCurrentWeek,
        mealPlan,
        meals,
        groceries,
        pantryItems,
        isLoading,
        addMeal,
        removeMeal,
        addMealsFromParsed,
        clearMeals,
        toggleGrocery,
        setGroceries,
        addGrocery,
        removeGrocery,
        addPantryItem,
        removePantryItem,
        pantryHas,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
