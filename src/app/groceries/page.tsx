"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/components/AppProvider";
import { CATEGORY_EMOJIS, GroceryItem } from "@/lib/types";
import { generateId } from "@/lib/utils";

export default function GroceriesPage() {
  const { meals, groceries, toggleGrocery, setGroceries, addGrocery, removeGrocery, pantryItems } = useApp();
  const [isGen, setIsGen] = useState(false);
  const [newItem, setNewItem] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const handleGen = useCallback(async () => {
    if (!meals.length) return; setIsGen(true);
    try { const r = await fetch("/api/generate-groceries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ meals: meals.map(m => ({ name: m.name, ingredients: m.ingredients })), pantryItems: pantryItems.map(p => p.name) }) }); const d = await r.json();
      if (d.items) setGroceries(d.items.map((i: any) => ({ id: generateId(), meal_plan_id: "", name: i.name, category: i.category || "Other", quantity: i.quantity, checked: false })));
    } catch {} setIsGen(false);
  }, [meals, pantryItems, setGroceries]);

  const handleAddItem = useCallback(() => { if (newItem.trim()) { addGrocery(newItem.trim()); setNewItem(""); setShowAdd(false); } }, [newItem, addGrocery]);
  const grouped = groceries.reduce((a, i) => { const c = i.category || "Other"; if (!a[c]) a[c] = []; a[c].push(i); return a; }, {} as Record<string, GroceryItem[]>);
  const checked = groceries.filter(g => g.checked).length;
  const pct = groceries.length ? (checked / groceries.length) * 100 : 0;

  return (
    <div className="px-5 pt-12 pb-4 relative overflow-hidden">
      <div className="hero-blob" /><div className="hero-blob-2" />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 mb-5">
        <h1 className="font-display text-[42px] font-black text-ink tracking-tight">Groceries</h1>
        <p className="text-ink-soft text-sm mt-1 font-medium">{groceries.length ? `${checked} of ${groceries.length} items` : "Generate from your meal plan"}</p>
      </motion.div>

      {groceries.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 mb-5">
          <div className="h-3 bg-parchment-deep rounded-full overflow-hidden shadow-inner">
            <motion.div className="h-full bg-brand rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
          </div>
        </motion.div>
      )}

      <div className="relative z-10 flex gap-2.5 mb-6">
        <motion.button whileTap={{ scale: 0.96 }} onClick={handleGen} disabled={!meals.length || isGen}
          className="flex-1 bg-brand text-white font-display font-bold py-4 rounded-2xl disabled:opacity-30 flex items-center justify-center gap-2 shadow-glow-lg text-[15px]">
          {isGen ? <motion.div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} /> : "✨"} {isGen ? "Generating..." : !meals.length ? "Add meals first" : "Generate List"}
        </motion.button>
        <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowAdd(true)} data-testid="grocery-add-btn"
          className="w-14 bg-teal-400 text-white font-bold rounded-2xl flex items-center justify-center shadow-glow-teal text-2xl">+</motion.button>
      </div>

      {groceries.length > 0 ? (
        <div className="relative z-10 space-y-7 stagger">
          {Object.entries(grouped).sort(([a],[b]) => a.localeCompare(b)).map(([cat, items]) => (
            <motion.div key={cat} layout>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-lg">{CATEGORY_EMOJIS[cat] || "📦"}</span>
                <h3 className="text-[11px] font-bold text-ink-muted tracking-[0.2em] uppercase">{cat}</h3>
                <div className="flex-1 h-px bg-ink-ghost/30 ml-2" />
                <span className="text-[11px] text-ink-muted font-bold">{items.filter(i => i.checked).length}/{items.length}</span>
              </div>
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {items.map(item => (
                    <motion.div key={item.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-3.5 bg-white rounded-2xl px-5 py-4 shadow-soft group hover:shadow-soft-lg transition-shadow">
                      <button onClick={() => toggleGrocery(item.id)}
                        className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all flex-shrink-0 ${item.checked ? "bg-brand border-transparent shadow-glow" : "border-ink-ghost hover:border-coral-300"}`}>
                        {item.checked && <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></motion.svg>}
                      </button>
                      <span className={`flex-1 text-[15px] font-semibold transition-all ${item.checked ? "text-ink-ghost line-through" : "text-ink"}`}>
                        {item.name}{item.quantity && <span className="text-ink-muted text-xs ml-1.5 font-normal">({item.quantity})</span>}
                      </span>
                      <button onClick={() => removeGrocery(item.id)} className="opacity-0 group-hover:opacity-100 text-ink-ghost hover:text-coral-400 transition-all">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
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
          <div className="w-20 h-20 rounded-[28px] bg-brand mx-auto mb-4 flex items-center justify-center shadow-glow"><span className="text-4xl">🛒</span></div>
          <p className="text-ink font-bold text-base">Your grocery list is empty</p>
          <p className="text-ink-muted text-sm mt-1">Add meals first, then tap Generate</p>
        </motion.div>
      )}

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
            <motion.div initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }} transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="w-full max-w-lg bg-white rounded-t-[32px] p-6 pb-10 shadow-soft-xl" onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 bg-ink-ghost rounded-full mx-auto mb-6" />
              <h3 className="font-display text-2xl font-extrabold text-ink mb-4">Add grocery item</h3>
              <input type="text" value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddItem()}
                placeholder="e.g. Avocados" className="w-full bg-parchment rounded-2xl px-5 py-4 text-ink placeholder:text-ink-ghost focus:outline-none focus:ring-2 focus:ring-coral-300 mb-4" autoFocus />
              <button onClick={handleAddItem} disabled={!newItem.trim()} data-testid="grocery-submit-btn"
                className="w-full bg-brand text-white font-display font-bold py-4 rounded-2xl disabled:opacity-30 shadow-glow-lg text-lg">Add</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
