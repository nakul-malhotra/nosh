"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/components/AppProvider";
import { CATEGORY_EMOJIS, GroceryItem } from "@/lib/types";
import { generateId } from "@/lib/utils";

export default function GroceriesPage() {
  const { meals, groceries, toggleGrocery, setGroceries, addGrocery, removeGrocery, pantryItems } =
    useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (meals.length === 0) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-groceries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meals: meals.map((m) => ({ name: m.name, ingredients: m.ingredients })),
          pantryItems: pantryItems.map((p) => p.name),
        }),
      });
      const data = await res.json();
      if (data.items) {
        const newItems: GroceryItem[] = data.items.map(
          (item: { name: string; category: string; quantity?: string }) => ({
            id: generateId(),
            meal_plan_id: "",
            name: item.name,
            category: item.category || "Other",
            quantity: item.quantity,
            checked: false,
          })
        );
        setGroceries(newItems);
      }
    } catch (err) {
      console.error("Failed to generate groceries:", err);
    }
    setIsGenerating(false);
  }, [meals, pantryItems, setGroceries]);

  const handleAddItem = useCallback(() => {
    if (newItemName.trim()) {
      addGrocery(newItemName.trim());
      setNewItemName("");
      setShowAdd(false);
    }
  }, [newItemName, addGrocery]);

  const grouped = groceries.reduce(
    (acc, item) => {
      const cat = item.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {} as Record<string, GroceryItem[]>
  );

  const checkedCount = groceries.filter((g) => g.checked).length;
  const progress = groceries.length > 0 ? (checkedCount / groceries.length) * 100 : 0;

  return (
    <div className="px-5 pt-14 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-3xl text-bark-700">Groceries</h1>
        <p className="text-bark-300 text-sm mt-1">
          {groceries.length > 0
            ? `${checkedCount} of ${groceries.length} items checked`
            : "Generate a list from your meal plan"}
        </p>
      </motion.div>

      {/* Progress bar */}
      {groceries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          className="mb-6 origin-left"
        >
          <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-sage-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mb-6">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleGenerate}
          disabled={meals.length === 0 || isGenerating}
          className="flex-1 bg-terra-500 text-white font-bold py-3 rounded-2xl disabled:opacity-40 flex items-center justify-center gap-2 text-sm"
        >
          {isGenerating ? (
            <motion.div
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
              <path d="M12 8v8" />
              <path d="M8 12h8" />
            </svg>
          )}
          {isGenerating ? "Generating..." : meals.length === 0 ? "Add meals first" : "Generate List"}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowAdd(true)}
          data-testid="grocery-add-btn"
          className="w-12 bg-sage-500 text-white font-bold rounded-2xl flex items-center justify-center"
        >
          +
        </motion.button>
      </div>

      {/* Grocery List by Category */}
      {groceries.length > 0 ? (
        <div className="space-y-6 stagger-children">
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, items]) => (
              <motion.div key={category} layout>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{CATEGORY_EMOJIS[category] || "📦"}</span>
                  <h3 className="text-xs font-bold text-bark-400 uppercase tracking-wider">
                    {category}
                  </h3>
                  <span className="text-[10px] text-bark-200 font-medium">
                    {items.filter((i) => i.checked).length}/{items.length}
                  </span>
                </div>
                <div className="space-y-1">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-soft group"
                      >
                        <button
                          onClick={() => toggleGrocery(item.id)}
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                            item.checked
                              ? "bg-sage-500 border-sage-500"
                              : "border-cream-300 hover:border-sage-300"
                          }`}
                        >
                          {item.checked && (
                            <motion.svg
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </motion.svg>
                          )}
                        </button>
                        <span
                          className={`flex-1 text-sm font-medium transition-all ${
                            item.checked
                              ? "text-bark-200 line-through"
                              : "text-bark-600"
                          }`}
                        >
                          {item.name}
                          {item.quantity && (
                            <span className="text-bark-200 text-xs ml-1">
                              ({item.quantity})
                            </span>
                          )}
                        </span>
                        <button
                          onClick={() => removeGrocery(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-bark-200 hover:text-terra-400 transition-all"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <p className="text-5xl mb-3">🛒</p>
          <p className="text-bark-300 font-medium text-sm">
            Your grocery list is empty
          </p>
          <p className="text-bark-200 text-xs mt-1">
            Add meals to your plan, then generate a grocery list
          </p>
        </motion.div>
      )}

      {/* Add Item Sheet */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              exit={{ y: 200 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-bark-100 rounded-full mx-auto mb-5" />
              <h3 className="font-display text-xl text-bark-700 mb-4">
                Add grocery item
              </h3>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                placeholder="e.g. Avocados"
                className="w-full bg-cream-50 border border-cream-200 rounded-2xl px-4 py-3 text-bark-700 placeholder:text-bark-200 focus:outline-none focus:ring-2 focus:ring-terra-300 mb-4"
                autoFocus
              />
              <button
                onClick={handleAddItem}
                disabled={!newItemName.trim()}
                data-testid="grocery-submit-btn"
                className="w-full bg-terra-500 text-white font-bold py-3 rounded-2xl disabled:opacity-40"
              >
                Add
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
