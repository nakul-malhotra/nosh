"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/components/AppProvider";
import { CATEGORY_EMOJIS, GroceryItem } from "@/lib/types";
import { generateId } from "@/lib/utils";

export default function GroceriesPage() {
  const { meals, groceries, toggleGrocery, setGroceries, addGrocery, removeGrocery, pantryItems } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (meals.length === 0) return;
    setIsGenerating(true);
    try { const res = await fetch("/api/generate-groceries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ meals: meals.map(m => ({ name: m.name, ingredients: m.ingredients })), pantryItems: pantryItems.map(p => p.name) }) }); const data = await res.json();
      if (data.items) { setGroceries(data.items.map((item: any) => ({ id: generateId(), meal_plan_id: "", name: item.name, category: item.category || "Other", quantity: item.quantity, checked: false }))); }
    } catch (e) { console.error(e); }
    setIsGenerating(false);
  }, [meals, pantryItems, setGroceries]);

  const handleAddItem = useCallback(() => { if (newItemName.trim()) { addGrocery(newItemName.trim()); setNewItemName(""); setShowAdd(false); } }, [newItemName, addGrocery]);

  const grouped = groceries.reduce((a, i) => { const c = i.category || "Other"; if (!a[c]) a[c] = []; a[c].push(i); return a; }, {} as Record<string, GroceryItem[]>);
  const checkedCount = groceries.filter(g => g.checked).length;
  const progress = groceries.length > 0 ? (checkedCount / groceries.length) * 100 : 0;

  return (
    <div className="px-5 pt-14 pb-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="font-display text-[36px] font-extrabold text-cream tracking-tight">Groceries</h1>
        <p className="text-cream-muted text-sm mt-1">{groceries.length > 0 ? `${checkedCount} of ${groceries.length} items checked` : "Generate a list from your meals"}</p>
      </motion.div>

      {groceries.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-5">
          <div className="h-2 bg-cream/[0.06] rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-herb-400 to-herb-300 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
          </div>
        </motion.div>
      )}

      <div className="flex gap-2 mb-6">
        <motion.button whileTap={{ scale: 0.96 }} onClick={handleGenerate} disabled={meals.length === 0 || isGenerating}
          className="flex-1 bg-gradient-to-r from-honey-400 to-ember-400 text-base font-bold py-3.5 rounded-2xl disabled:opacity-30 flex items-center justify-center gap-2 text-sm shadow-glow-honey">
          {isGenerating ? <motion.div className="w-4 h-4 border-2 border-base border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} /> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>}
          {isGenerating ? "Generating..." : meals.length === 0 ? "Add meals first" : "Generate List"}
        </motion.button>
        <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowAdd(true)} data-testid="grocery-add-btn"
          className="w-14 bg-herb-300 text-base font-bold rounded-2xl flex items-center justify-center shadow-glow-herb text-xl">+</motion.button>
      </div>

      {groceries.length > 0 ? (
        <div className="space-y-6 stagger">
          {Object.entries(grouped).sort(([a],[b]) => a.localeCompare(b)).map(([cat, items]) => (
            <motion.div key={cat} layout>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-base">{CATEGORY_EMOJIS[cat] || "📦"}</span>
                <h3 className="text-[10px] font-bold text-cream-faint tracking-[0.2em] uppercase">{cat}</h3>
                <span className="text-[10px] text-cream-ghost font-semibold ml-auto">{items.filter(i => i.checked).length}/{items.length}</span>
              </div>
              <div className="space-y-1.5">
                <AnimatePresence mode="popLayout">
                  {items.map(item => (
                    <motion.div key={item.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-3 glass-card rounded-2xl px-4 py-3.5 shadow-card group">
                      <button onClick={() => toggleGrocery(item.id)}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${item.checked ? "bg-herb-300 border-herb-300 shadow-glow-herb" : "border-cream-faint hover:border-herb-300/60"}`}>
                        {item.checked && <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0C0A08" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></motion.svg>}
                      </button>
                      <span className={`flex-1 text-[15px] font-medium transition-all ${item.checked ? "text-cream-faint line-through" : "text-cream"}`}>
                        {item.name}{item.quantity && <span className="text-cream-faint text-xs ml-1.5">({item.quantity})</span>}
                      </span>
                      <button onClick={() => removeGrocery(item.id)} className="opacity-0 group-hover:opacity-100 text-cream-ghost hover:text-ember-400 transition-all">
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <div className="w-16 h-16 rounded-3xl bg-herb-300/10 flex items-center justify-center mx-auto mb-4"><span className="text-3xl">🛒</span></div>
          <p className="text-cream font-bold text-[15px]">Your grocery list is empty</p>
          <p className="text-cream-faint text-xs mt-1">Add meals to your plan, then generate a grocery list</p>
        </motion.div>
      )}

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
            <motion.div initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }} transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="w-full max-w-lg bg-base-100 rounded-t-[32px] p-6 pb-10 border-t border-cream/[0.06]" onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 bg-cream-ghost rounded-full mx-auto mb-6" />
              <h3 className="font-display text-xl font-extrabold text-cream mb-4">Add grocery item</h3>
              <input type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddItem()}
                placeholder="e.g. Avocados" className="w-full bg-base-200 rounded-2xl px-4 py-3.5 text-cream placeholder:text-cream-faint focus:outline-none focus:ring-2 focus:ring-honey-400/50 mb-4 border border-cream/[0.06]" autoFocus />
              <button onClick={handleAddItem} disabled={!newItemName.trim()} data-testid="grocery-submit-btn"
                className="w-full bg-gradient-to-r from-honey-400 to-ember-400 text-base font-bold py-3.5 rounded-2xl disabled:opacity-30 shadow-glow-honey">Add</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
