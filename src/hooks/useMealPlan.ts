"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { MealPlan, Meal, DayOfWeek, MealType } from "@/lib/types";
import { getMondayOfWeek, generateId } from "@/lib/utils";

export function useMealPlan(weekStart?: string) {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(
    weekStart || getMondayOfWeek()
  );

  const fetchOrCreatePlan = useCallback(async () => {
    setLoading(true);
    try {
      // Try to fetch existing plan
      const { data: existingPlan } = await supabase
        .from("meal_plans")
        .select("*")
        .eq("week_start", currentWeek)
        .single();

      if (existingPlan) {
        setMealPlan(existingPlan);
        const { data: existingMeals } = await supabase
          .from("meals")
          .select("*")
          .eq("meal_plan_id", existingPlan.id);
        setMeals(existingMeals || []);
      } else {
        // Create new plan
        const newPlan = {
          id: generateId(),
          week_start: currentWeek,
          created_at: new Date().toISOString(),
        };
        const { data } = await supabase
          .from("meal_plans")
          .insert(newPlan)
          .select()
          .single();
        setMealPlan(data || newPlan);
        setMeals([]);
      }
    } catch {
      // Fallback to local state if Supabase is not configured
      const localPlan = {
        id: generateId(),
        week_start: currentWeek,
        created_at: new Date().toISOString(),
      };
      setMealPlan(localPlan);
    }
    setLoading(false);
  }, [currentWeek]);

  useEffect(() => {
    fetchOrCreatePlan();
  }, [fetchOrCreatePlan]);

  const addMeal = useCallback(
    async (day: DayOfWeek, type: MealType, name: string, ingredients: string[] = []) => {
      if (!mealPlan) return;
      const newMeal: Meal = {
        id: generateId(),
        meal_plan_id: mealPlan.id,
        day_of_week: day,
        meal_type: type,
        name,
        ingredients,
      };
      setMeals((prev) => [...prev, newMeal]);
      try {
        await supabase.from("meals").insert(newMeal);
      } catch {
        // Local-only mode
      }
      return newMeal;
    },
    [mealPlan]
  );

  const removeMeal = useCallback(async (mealId: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== mealId));
    try {
      await supabase.from("meals").delete().eq("id", mealId);
    } catch {
      // Local-only mode
    }
  }, []);

  const addMealsFromParsed = useCallback(
    async (
      parsedMeals: Array<{
        day: DayOfWeek;
        type: MealType;
        name: string;
        ingredients: string[];
      }>
    ) => {
      if (!mealPlan) return;
      const newMeals = parsedMeals.map((m) => ({
        id: generateId(),
        meal_plan_id: mealPlan.id,
        day_of_week: m.day,
        meal_type: m.type,
        name: m.name,
        ingredients: m.ingredients,
      }));
      setMeals((prev) => [...prev, ...newMeals]);
      try {
        await supabase.from("meals").insert(newMeals);
      } catch {
        // Local-only mode
      }
    },
    [mealPlan]
  );

  const getMealsForDay = useCallback(
    (day: DayOfWeek) => meals.filter((m) => m.day_of_week === day),
    [meals]
  );

  return {
    mealPlan,
    meals,
    loading,
    currentWeek,
    setCurrentWeek,
    addMeal,
    removeMeal,
    addMealsFromParsed,
    getMealsForDay,
    refresh: fetchOrCreatePlan,
  };
}
