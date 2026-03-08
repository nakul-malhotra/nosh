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

  const go = useCallback(async () => {
    setIsLoading(true); setError(null);
    try { const r = await fetch("/api/suggest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recentMeals: meals.map(m => m.name), pantryItems: pantryItems.map(p => p.name), busyWeek }) }); const d = await r.json();
      if (d.suggestions) setSuggestions(d.suggestions); else if (d.error) setError(d.error);
    } catch { setError("Could not get suggestions."); }
    setIsLoading(false);
  }, [meals, pantryItems, busyWeek]);

  return (
    <div className="px-5 pt-12 pb-4 relative overflow-hidden">
      <div className="hero-blob" /><div className="hero-blob-2" />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 mb-6">
        <h1 className="font-display text-[42px] font-black text-ink tracking-tight">Meal Ideas</h1>
        <p className="text-ink-soft text-sm mt-1 font-medium">AI-powered suggestions based on what you love</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="relative z-10 bg-white rounded-[28px] p-5 shadow-soft-lg mb-5">
        <div className="flex items-center justify-between">
          <div><p className="font-display font-bold text-ink text-base">⚡ Busy week</p><p className="text-ink-muted text-xs mt-0.5 font-medium">Under 30 min, minimal prep</p></div>
          <button onClick={() => setBusyWeek(!busyWeek)} className={`w-[54px] h-[32px] rounded-full transition-all relative ${busyWeek ? "bg-brand shadow-glow" : "bg-parchment-deep"}`}>
            <motion.div className="w-6 h-6 bg-white rounded-full absolute top-[3px] shadow-soft" animate={{ left: busyWeek ? 25 : 3 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
          </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative z-10 grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white rounded-3xl p-5 text-center shadow-soft">
          <p className="text-3xl font-display font-black text-brand">{meals.length}</p>
          <p className="text-[10px] text-ink-muted font-bold tracking-widest uppercase mt-1">Past meals</p>
        </div>
        <div className="bg-white rounded-3xl p-5 text-center shadow-soft">
          <p className="text-3xl font-display font-black text-teal-400">{pantryItems.length}</p>
          <p className="text-[10px] text-ink-muted font-bold tracking-widest uppercase mt-1">In pantry</p>
        </div>
      </motion.div>

      <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
        whileTap={{ scale: 0.97 }} onClick={go} disabled={isLoading}
        className="relative z-10 w-full bg-brand-vivid text-white font-display font-bold py-5 rounded-[22px] mb-6 flex items-center justify-center gap-2.5 text-[17px] disabled:opacity-50 shadow-glow-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" style={{ backgroundSize: "200% 100%" }} />
        <span className="relative z-10">{isLoading ? "Thinking..." : "✨ Get meal suggestions"}</span>
      </motion.button>

      {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 bg-coral-50 text-coral-500 rounded-2xl p-4 mb-5 text-sm font-medium">{error}</motion.div>}

      <div className="relative z-10">
        <AnimatePresence mode="popLayout">
          {suggestions.map((s, i) => (
            <motion.div key={s.name} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-white rounded-[28px] p-6 shadow-soft-lg mb-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display text-lg font-extrabold text-ink leading-tight flex-1">{s.name}</h3>
                <span className="text-xs font-bold text-peach-500 bg-peach-50 px-3 py-1.5 rounded-full flex-shrink-0 ml-3">{s.prepTime}</span>
              </div>
              <p className="text-ink-soft text-sm mb-3 leading-relaxed">{s.description}</p>
              <div className="bg-teal-50 rounded-2xl px-4 py-3 mb-3">
                <p className="text-teal-600 text-xs font-medium"><span className="font-bold">Why this? </span>{s.reason}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {s.ingredients.slice(0, 6).map(ing => (
                  <span key={ing} className={`text-xs px-3 py-1.5 rounded-full font-semibold ${pantryItems.some(p => p.name.toLowerCase().includes(ing.toLowerCase())) ? "bg-teal-50 text-teal-600" : "bg-parchment-deep text-ink-soft"}`}>{ing}</span>
                ))}
                {s.ingredients.length > 6 && <span className="text-xs text-ink-ghost px-2 py-1.5">+{s.ingredients.length - 6}</span>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!suggestions.length && !isLoading && !error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 text-center py-12">
          <div className="w-20 h-20 rounded-[28px] bg-violet-100 mx-auto mb-4 flex items-center justify-center"><span className="text-4xl">💡</span></div>
          <p className="text-ink font-bold text-base">Ready when you are</p>
          <p className="text-ink-muted text-sm mt-1 max-w-[260px] mx-auto">Personalized ideas based on your history and pantry</p>
        </motion.div>
      )}
    </div>
  );
}
