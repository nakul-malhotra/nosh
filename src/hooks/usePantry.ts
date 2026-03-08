"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { PantryItem } from "@/lib/types";
import { generateId } from "@/lib/utils";

export function usePantry() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("pantry_items")
        .select("*")
        .order("name", { ascending: true });
      setItems(data || []);
    } catch {
      // Local-only mode
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = useCallback(async (name: string, category: string = "Other") => {
    const newItem: PantryItem = {
      id: generateId(),
      name,
      category,
      added_at: new Date().toISOString(),
    };
    setItems((prev) => [...prev, newItem].sort((a, b) => a.name.localeCompare(b.name)));
    try {
      await supabase.from("pantry_items").insert(newItem);
    } catch {
      // Local-only mode
    }
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    try {
      await supabase.from("pantry_items").delete().eq("id", itemId);
    } catch {
      // Local-only mode
    }
  }, []);

  const hasItem = useCallback(
    (name: string) =>
      items.some((i) => i.name.toLowerCase() === name.toLowerCase()),
    [items]
  );

  const grouped = items.reduce(
    (acc, item) => {
      const cat = item.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {} as Record<string, PantryItem[]>
  );

  return {
    items,
    grouped,
    loading,
    addItem,
    removeItem,
    hasItem,
    refresh: fetchItems,
  };
}
