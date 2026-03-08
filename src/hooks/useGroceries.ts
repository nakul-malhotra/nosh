"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { GroceryItem, CATEGORY_EMOJIS } from "@/lib/types";
import { generateId } from "@/lib/utils";

export function useGroceries(mealPlanId?: string) {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = useCallback(async () => {
    if (!mealPlanId) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from("grocery_items")
        .select("*")
        .eq("meal_plan_id", mealPlanId)
        .order("category", { ascending: true });
      setItems(data || []);
    } catch {
      // Local-only mode
    }
    setLoading(false);
  }, [mealPlanId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const toggleItem = useCallback(async (itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
    try {
      const item = items.find((i) => i.id === itemId);
      if (item) {
        await supabase
          .from("grocery_items")
          .update({ checked: !item.checked })
          .eq("id", itemId);
      }
    } catch {
      // Local-only mode
    }
  }, [items]);

  const addItem = useCallback(
    async (name: string, category: string = "Other") => {
      const newItem: GroceryItem = {
        id: generateId(),
        meal_plan_id: mealPlanId || "",
        name,
        category,
        checked: false,
      };
      setItems((prev) => [...prev, newItem]);
      try {
        await supabase.from("grocery_items").insert(newItem);
      } catch {
        // Local-only mode
      }
    },
    [mealPlanId]
  );

  const removeItem = useCallback(async (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    try {
      await supabase.from("grocery_items").delete().eq("id", itemId);
    } catch {
      // Local-only mode
    }
  }, []);

  const setGroceryItems = useCallback(
    async (newItems: GroceryItem[]) => {
      setItems(newItems);
      try {
        if (mealPlanId) {
          await supabase
            .from("grocery_items")
            .delete()
            .eq("meal_plan_id", mealPlanId);
          if (newItems.length > 0) {
            await supabase.from("grocery_items").insert(newItems);
          }
        }
      } catch {
        // Local-only mode
      }
    },
    [mealPlanId]
  );

  const grouped = items.reduce(
    (acc, item) => {
      const cat = item.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {} as Record<string, GroceryItem[]>
  );

  const checkedCount = items.filter((i) => i.checked).length;

  return {
    items,
    grouped,
    loading,
    checkedCount,
    totalCount: items.length,
    toggleItem,
    addItem,
    removeItem,
    setGroceryItems,
    refresh: fetchItems,
  };
}
