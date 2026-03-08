"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/components/AppProvider";
import { CATEGORY_EMOJIS, GROCERY_CATEGORIES } from "@/lib/types";

export default function PantryPage() {
  const { pantryItems, addPantryItem, removePantryItem } = useApp();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Other");

  const handleAdd = useCallback(() => {
    if (newName.trim()) {
      addPantryItem(newName.trim(), newCategory);
      setNewName("");
      setShowAdd(false);
    }
  }, [newName, newCategory, addPantryItem]);

  const filtered = search
    ? pantryItems.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase())
      )
    : pantryItems;

  const grouped = filtered.reduce(
    (acc, item) => {
      const cat = item.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {} as Record<string, typeof pantryItems>
  );

  return (
    <div className="px-5 pt-14 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-3xl text-bark-700">Pantry</h1>
        <p className="text-bark-300 text-sm mt-1">
          {pantryItems.length} items in stock
        </p>
      </motion.div>

      {/* Search + Add */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-6"
      >
        <div className="flex-1 relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bark-200"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pantry..."
            className="w-full bg-white rounded-2xl pl-10 pr-4 py-3 text-sm text-bark-700 placeholder:text-bark-200 shadow-soft focus:outline-none focus:ring-2 focus:ring-terra-300"
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAdd(true)}
          data-testid="pantry-add-btn"
          className="w-12 bg-sage-500 text-white font-bold rounded-2xl flex items-center justify-center shadow-soft text-xl"
        >
          +
        </motion.button>
      </motion.div>

      {/* Pantry Items */}
      {filtered.length > 0 ? (
        <div className="space-y-5 stagger-children">
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, items]) => (
              <motion.div key={category} layout>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">
                    {CATEGORY_EMOJIS[category] || "📦"}
                  </span>
                  <h3 className="text-xs font-bold text-bark-400 uppercase tracking-wider">
                    {category}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="group flex items-center gap-1.5 bg-white rounded-full px-3.5 py-2 shadow-soft"
                      >
                        <span className="text-sm font-medium text-bark-600">
                          {item.name}
                        </span>
                        <button
                          onClick={() => removePantryItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 w-4 h-4 rounded-full bg-terra-50 flex items-center justify-center text-terra-400 transition-opacity"
                        >
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          >
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
          <p className="text-5xl mb-3">🧊</p>
          <p className="text-bark-300 font-medium text-sm">
            {search ? "No matches found" : "Your pantry is empty"}
          </p>
          <p className="text-bark-200 text-xs mt-1">
            Add items you already have at home
          </p>
        </motion.div>
      )}

      {/* Quick-add common items */}
      {pantryItems.length === 0 && !search && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <p className="text-xs font-bold text-bark-300 uppercase tracking-wider mb-3">
            Quick add essentials
          </p>
          <div className="flex flex-wrap gap-2">
            {["Salt", "Pepper", "Olive Oil", "Butter", "Garlic", "Onions", "Rice", "Pasta", "Eggs", "Milk", "Flour", "Sugar"].map(
              (item) => (
                <button
                  key={item}
                  onClick={() => addPantryItem(item, "Spices & Seasonings")}
                  className="bg-cream-200 text-bark-500 rounded-full px-3 py-1.5 text-xs font-semibold hover:bg-cream-300 transition-colors"
                >
                  + {item}
                </button>
              )
            )}
          </div>
        </motion.div>
      )}

      {/* Add Modal */}
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
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-bark-100 rounded-full mx-auto mb-5" />
              <h3 className="font-display text-xl text-bark-700 mb-4">
                Add to pantry
              </h3>

              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="Item name"
                className="w-full bg-cream-50 border border-cream-200 rounded-2xl px-4 py-3 text-bark-700 placeholder:text-bark-200 focus:outline-none focus:ring-2 focus:ring-terra-300 mb-4"
                autoFocus
              />

              <div className="mb-5">
                <label className="text-xs font-bold text-bark-400 uppercase tracking-wider mb-2 block">
                  Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {GROCERY_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setNewCategory(cat)}
                      className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${
                        newCategory === cat
                          ? "bg-sage-500 text-white"
                          : "bg-cream-100 text-bark-400"
                      }`}
                    >
                      {CATEGORY_EMOJIS[cat]} {cat}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                data-testid="pantry-submit-btn"
                className="w-full bg-sage-500 text-white font-bold py-3 rounded-2xl disabled:opacity-40"
              >
                Add to pantry
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
