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
  const [newCat, setNewCat] = useState("Other");

  const handleAdd = useCallback(() => { if (newName.trim()) { addPantryItem(newName.trim(), newCat); setNewName(""); setShowAdd(false); } }, [newName, newCat, addPantryItem]);
  const filtered = search ? pantryItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase())) : pantryItems;
  const grouped = filtered.reduce((a, i) => { const c = i.category || "Other"; if (!a[c]) a[c] = []; a[c].push(i); return a; }, {} as Record<string, typeof pantryItems>);

  return (
    <div className="px-5 pt-12 pb-4 relative overflow-hidden">
      <div className="hero-blob" /><div className="hero-blob-2" />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 mb-5">
        <h1 className="font-display text-[42px] font-black text-ink tracking-tight">Pantry</h1>
        <p className="text-ink-soft text-sm mt-1 font-medium">{pantryItems.length} items in stock</p>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="relative z-10 flex gap-2.5 mb-6">
        <div className="flex-1 relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pantry..."
            className="w-full bg-white rounded-2xl pl-11 pr-4 py-3.5 text-sm text-ink placeholder:text-ink-ghost shadow-soft focus:outline-none focus:ring-2 focus:ring-coral-300 font-medium" />
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowAdd(true)} data-testid="pantry-add-btn"
          className="w-14 bg-teal-400 text-white font-bold rounded-2xl flex items-center justify-center shadow-glow-teal text-2xl">+</motion.button>
      </motion.div>

      {filtered.length > 0 ? (
        <div className="relative z-10 space-y-6 stagger">
          {Object.entries(grouped).sort(([a],[b]) => a.localeCompare(b)).map(([cat, items]) => (
            <motion.div key={cat} layout>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{CATEGORY_EMOJIS[cat] || "📦"}</span>
                <h3 className="text-[11px] font-bold text-ink-muted tracking-[0.2em] uppercase">{cat}</h3>
                <div className="flex-1 h-px bg-ink-ghost/30 ml-2" />
              </div>
              <div className="flex flex-wrap gap-2.5">
                <AnimatePresence>
                  {items.map(item => (
                    <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                      className="group flex items-center gap-2 bg-white rounded-full px-4 py-2.5 shadow-soft hover:shadow-soft-lg transition-shadow">
                      <span className="text-[14px] font-semibold text-ink">{item.name}</span>
                      <button onClick={() => removePantryItem(item.id)} className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-full bg-coral-50 flex items-center justify-center text-coral-400 transition-opacity">
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 text-center py-16">
          <div className="w-20 h-20 rounded-[28px] bg-violet-100 mx-auto mb-4 flex items-center justify-center"><span className="text-4xl">🧊</span></div>
          <p className="text-ink font-bold text-base">{search ? "No matches" : "Your pantry is empty"}</p>
          <p className="text-ink-muted text-sm mt-1">Add items you already have at home</p>
        </motion.div>
      )}

      {pantryItems.length === 0 && !search && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative z-10 mt-8">
          <p className="text-[10px] font-bold text-ink-muted tracking-[0.25em] uppercase mb-3">Quick add essentials</p>
          <div className="flex flex-wrap gap-2.5">
            {["Salt","Pepper","Olive Oil","Butter","Garlic","Onions","Rice","Pasta","Eggs","Milk","Flour","Sugar"].map(i => (
              <button key={i} onClick={() => addPantryItem(i, "Spices & Seasonings")}
                className="bg-white text-ink-soft rounded-full px-4 py-2.5 text-xs font-bold shadow-soft hover:shadow-soft-lg transition-shadow active:scale-95">+ {i}</button>
            ))}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
            <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="w-full max-w-lg bg-white rounded-t-[32px] p-6 pb-10 shadow-soft-xl" onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 bg-ink-ghost rounded-full mx-auto mb-6" />
              <h3 className="font-display text-2xl font-extrabold text-ink mb-4">Add to pantry</h3>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdd()}
                placeholder="Item name" className="w-full bg-parchment rounded-2xl px-5 py-4 text-ink placeholder:text-ink-ghost focus:outline-none focus:ring-2 focus:ring-teal-300 mb-4" autoFocus />
              <div className="mb-5">
                <label className="text-[10px] font-bold text-ink-muted tracking-[0.25em] uppercase mb-2.5 block">Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {GROCERY_CATEGORIES.map(c => <button key={c} onClick={() => setNewCat(c)} className={`chip text-xs ${newCat === c ? "bg-teal-400 text-white shadow-glow-teal" : "bg-parchment-deep text-ink-soft"}`}>{CATEGORY_EMOJIS[c]} {c}</button>)}
                </div>
              </div>
              <button onClick={handleAdd} disabled={!newName.trim()} data-testid="pantry-submit-btn"
                className="w-full bg-teal-400 text-white font-display font-bold py-4 rounded-2xl disabled:opacity-30 shadow-glow-teal text-lg">Add to pantry</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
