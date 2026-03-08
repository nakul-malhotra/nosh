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

  const handleAdd = useCallback(() => { if (newName.trim()) { addPantryItem(newName.trim(), newCategory); setNewName(""); setShowAdd(false); } }, [newName, newCategory, addPantryItem]);
  const filtered = search ? pantryItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase())) : pantryItems;
  const grouped = filtered.reduce((a, i) => { const c = i.category || "Other"; if (!a[c]) a[c] = []; a[c].push(i); return a; }, {} as Record<string, typeof pantryItems>);

  return (
    <div className="px-5 pt-14 pb-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="font-display text-[36px] font-extrabold text-cream tracking-tight">Pantry</h1>
        <p className="text-cream-muted text-sm mt-1">{pantryItems.length} items in stock</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="flex gap-2 mb-6">
        <div className="flex-1 relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream-faint" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pantry..."
            className="w-full glass-card rounded-2xl pl-10 pr-4 py-3 text-sm text-cream placeholder:text-cream-faint shadow-card focus:outline-none focus:ring-2 focus:ring-honey-400/50" />
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowAdd(true)} data-testid="pantry-add-btn"
          className="w-12 bg-herb-300 text-base font-bold rounded-2xl flex items-center justify-center shadow-glow-herb text-xl">+</motion.button>
      </motion.div>

      {filtered.length > 0 ? (
        <div className="space-y-5 stagger">
          {Object.entries(grouped).sort(([a],[b]) => a.localeCompare(b)).map(([cat, items]) => (
            <motion.div key={cat} layout>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-base">{CATEGORY_EMOJIS[cat] || "📦"}</span>
                <h3 className="text-[10px] font-bold text-cream-faint tracking-[0.2em] uppercase">{cat}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {items.map(item => (
                    <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                      className="group flex items-center gap-1.5 glass-card rounded-full px-4 py-2.5 shadow-card hover:shadow-card-up transition-shadow">
                      <span className="text-[14px] font-medium text-cream">{item.name}</span>
                      <button onClick={() => removePantryItem(item.id)} className="opacity-0 group-hover:opacity-100 w-4 h-4 rounded-full bg-ember-400/15 flex items-center justify-center text-ember-400 transition-opacity ml-0.5">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <div className="w-16 h-16 rounded-3xl bg-honey-400/10 flex items-center justify-center mx-auto mb-4"><span className="text-3xl">🧊</span></div>
          <p className="text-cream font-bold text-[15px]">{search ? "No matches found" : "Your pantry is empty"}</p>
          <p className="text-cream-faint text-xs mt-1">Add items you already have at home</p>
        </motion.div>
      )}

      {pantryItems.length === 0 && !search && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8">
          <p className="text-[10px] font-bold text-cream-faint tracking-[0.2em] uppercase mb-3">Quick add essentials</p>
          <div className="flex flex-wrap gap-2">
            {["Salt", "Pepper", "Olive Oil", "Butter", "Garlic", "Onions", "Rice", "Pasta", "Eggs", "Milk", "Flour", "Sugar"].map(item => (
              <button key={item} onClick={() => addPantryItem(item, "Spices & Seasonings")}
                className="glass-card text-cream-muted rounded-full px-3.5 py-2 text-xs font-semibold shadow-card hover:shadow-card-up hover:text-cream transition-all">+ {item}</button>
            ))}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
            <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="w-full max-w-lg bg-base-100 rounded-t-[32px] p-6 pb-10 border-t border-cream/[0.06]" onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 bg-cream-ghost rounded-full mx-auto mb-6" />
              <h3 className="font-display text-xl font-extrabold text-cream mb-4">Add to pantry</h3>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdd()}
                placeholder="Item name" className="w-full bg-base-200 rounded-2xl px-4 py-3.5 text-cream placeholder:text-cream-faint focus:outline-none focus:ring-2 focus:ring-herb-300/50 mb-4 border border-cream/[0.06]" autoFocus />
              <div className="mb-5">
                <label className="text-[10px] font-bold text-cream-faint tracking-[0.2em] uppercase mb-2.5 block">Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {GROCERY_CATEGORIES.map(cat => <button key={cat} onClick={() => setNewCategory(cat)} className={`chip text-xs ${newCategory === cat ? "bg-herb-300 text-base border-herb-300" : "bg-cream/[0.04] text-cream-muted border-cream/[0.06]"}`}>{CATEGORY_EMOJIS[cat]} {cat}</button>)}
                </div>
              </div>
              <button onClick={handleAdd} disabled={!newName.trim()} data-testid="pantry-submit-btn"
                className="w-full bg-gradient-to-r from-herb-400 to-herb-300 text-base font-bold py-3.5 rounded-2xl disabled:opacity-30 shadow-glow-herb">Add to pantry</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
