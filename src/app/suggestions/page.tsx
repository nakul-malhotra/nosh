"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/components/AppProvider";

interface Suggestion { name: string; description: string; prepTime: string; ingredients: string[]; reason: string; }

export default function SuggestionsPage() {
  const { meals, pantryItems } = useApp();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [busyWeek, setBusyWeek] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSuggestions = useCallback(async () => {
    setIsLoading(true); setError(null);
    try { const res = await fetch("/api/suggest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recentMeals: meals.map(m => m.name), pantryItems: pantryItems.map(p => p.name), busyWeek }) }); const data = await res.json();
      if (data.suggestions) setSuggestions(data.suggestions); else if (data.error) setError(data.error);
    } catch { setError("Could not get suggestions. Check your API key."); }
    setIsLoading(false);
  }, [meals, pantryItems, busyWeek]);

  return (
    <div className="px-5 pt-14 pb-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-[36px] font-extrabold text-cream tracking-tight">Meal Ideas</h1>
        <p className="text-cream-muted text-sm mt-1">AI-powered suggestions based on what you love</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="glass-card rounded-3xl p-5 shadow-card mb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-cream text-[15px]">⚡ Busy week mode</p>
            <p className="text-cream-faint text-xs mt-0.5">Quick meals under 30 min</p>
          </div>
          <button onClick={() => setBusyWeek(!busyWeek)} className={`w-[52px] h-[30px] rounded-full transition-all relative ${busyWeek ? "bg-honey-400 shadow-glow-honey" : "bg-cream/[0.08]"}`}>
            <motion.div className={`w-[22px] h-[22px] rounded-full absolute top-1 shadow-card ${busyWeek ? "bg-base" : "bg-cream-muted"}`} animate={{ left: busyWeek ? 26 : 4 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
          </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-3 mb-5">
        <div className="flex-1 glass-card rounded-2xl p-4 text-center shadow-card">
          <p className="text-2xl font-extrabold text-honey-400 font-display">{meals.length}</p>
          <p className="text-[9px] text-cream-faint font-bold tracking-[0.2em] uppercase mt-1">Past meals</p>
        </div>
        <div className="flex-1 glass-card rounded-2xl p-4 text-center shadow-card">
          <p className="text-2xl font-extrabold text-herb-300 font-display">{pantryItems.length}</p>
          <p className="text-[9px] text-cream-faint font-bold tracking-[0.2em] uppercase mt-1">Pantry items</p>
        </div>
      </motion.div>

      <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
        whileTap={{ scale: 0.97 }} onClick={getSuggestions} disabled={isLoading}
        className="w-full bg-gradient-to-r from-honey-400 via-ember-400 to-honey-300 text-base font-bold py-4 rounded-2xl mb-6 flex items-center justify-center gap-2 text-sm disabled:opacity-50 shadow-glow-honey-lg">
        {isLoading ? <><motion.div className="w-4 h-4 border-2 border-base border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />Thinking...</> :
          <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2a7 7 0 015 11.9V17a2 2 0 01-2 2H9a2 2 0 01-2-2v-3.1A7 7 0 0112 2z" /><line x1="9" y1="21" x2="15" y2="21" /></svg>Get meal suggestions</>}
      </motion.button>

      {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-ember-400/10 border border-ember-400/20 text-ember-300 rounded-2xl p-4 mb-5 text-sm">{error}</motion.div>}

      <AnimatePresence mode="popLayout">
        {suggestions.map((s, i) => (
          <motion.div key={s.name} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="glass-card rounded-3xl p-5 shadow-card mb-3">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-display text-lg font-extrabold text-cream leading-tight">{s.name}</h3>
              <span className="text-xs font-bold text-honey-400 bg-honey-400/10 border border-honey-400/20 px-2.5 py-1 rounded-full flex-shrink-0 ml-2">{s.prepTime}</span>
            </div>
            <p className="text-cream-muted text-sm mb-3">{s.description}</p>
            <div className="bg-herb-300/8 border border-herb-300/15 rounded-xl px-3.5 py-2.5 mb-3">
              <p className="text-herb-300 text-xs"><span className="font-bold">Why this? </span>{s.reason}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {s.ingredients.slice(0, 6).map(ing => (
                <span key={ing} className={`text-xs px-2.5 py-1 rounded-full font-medium ${pantryItems.some(p => p.name.toLowerCase().includes(ing.toLowerCase())) ? "bg-herb-300/10 text-herb-300 border border-herb-300/20" : "bg-cream/[0.04] text-cream-muted border border-cream/[0.06]"}`}>{ing}</span>
              ))}
              {s.ingredients.length > 6 && <span className="text-xs text-cream-ghost px-2 py-1">+{s.ingredients.length - 6} more</span>}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {suggestions.length === 0 && !isLoading && !error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <div className="w-16 h-16 rounded-3xl bg-honey-400/10 flex items-center justify-center mx-auto mb-4"><span className="text-3xl">💡</span></div>
          <p className="text-cream font-bold text-[15px]">Ready when you are</p>
          <p className="text-cream-faint text-xs mt-1 max-w-[260px] mx-auto">Tap above to get personalized meal ideas based on your history and pantry</p>
        </motion.div>
      )}
    </div>
  );
}
