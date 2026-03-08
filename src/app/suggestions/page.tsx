"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/components/AppProvider";

interface Suggestion {
  name: string;
  description: string;
  prepTime: string;
  ingredients: string[];
  reason: string;
}

export default function SuggestionsPage() {
  const { meals, pantryItems } = useApp();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [busyWeek, setBusyWeek] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSuggestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recentMeals: meals.map((m) => m.name), pantryItems: pantryItems.map((p) => p.name), busyWeek }),
      });
      const data = await res.json();
      if (data.suggestions) setSuggestions(data.suggestions);
      else if (data.error) setError(data.error);
    } catch { setError("Could not get suggestions. Check your API key."); }
    setIsLoading(false);
  }, [meals, pantryItems, busyWeek]);

  return (
    <div className="px-5 pt-14 pb-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-[32px] font-extrabold text-ink tracking-tight">Meal Ideas</h1>
        <p className="text-ink-secondary text-sm mt-1">AI-powered suggestions based on what you love</p>
      </motion.div>

      {/* Busy week toggle */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="bg-white rounded-3xl p-5 shadow-card mb-5 border border-black/[0.03]">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-ink text-[15px]">⚡ Busy week mode</p>
            <p className="text-ink-tertiary text-xs mt-0.5">Quick meals under 30 min</p>
          </div>
          <button onClick={() => setBusyWeek(!busyWeek)} className={`w-[52px] h-[30px] rounded-full transition-all relative ${busyWeek ? "bg-gold-400 shadow-glow-gold" : "bg-bg-alt"}`}>
            <motion.div className="w-[22px] h-[22px] bg-white rounded-full absolute top-1 shadow-card" animate={{ left: busyWeek ? 26 : 4 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
          </button>
        </div>
      </motion.div>

      {/* Context */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="flex gap-3 mb-5">
        <div className="flex-1 bg-white rounded-2xl p-4 text-center shadow-card border border-black/[0.03]">
          <p className="text-2xl font-extrabold text-coral-500 font-display">{meals.length}</p>
          <p className="text-[10px] text-ink-tertiary font-bold uppercase tracking-widest mt-1">Past meals</p>
        </div>
        <div className="flex-1 bg-white rounded-2xl p-4 text-center shadow-card border border-black/[0.03]">
          <p className="text-2xl font-extrabold text-mint-500 font-display">{pantryItems.length}</p>
          <p className="text-[10px] text-ink-tertiary font-bold uppercase tracking-widest mt-1">Pantry items</p>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
        whileTap={{ scale: 0.97 }}
        onClick={getSuggestions}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-coral-500 via-coral-400 to-gold-400 text-white font-bold py-4 rounded-2xl mb-6 flex items-center justify-center gap-2 text-sm disabled:opacity-60 shadow-glow-coral"
      >
        {isLoading ? (
          <><motion.div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />Thinking...</>
        ) : (
          <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2a7 7 0 015 11.9V17a2 2 0 01-2 2H9a2 2 0 01-2-2v-3.1A7 7 0 0112 2z" /><line x1="9" y1="21" x2="15" y2="21" /></svg>Get meal suggestions</>
        )}
      </motion.button>

      {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-coral-50 text-coral-600 rounded-2xl p-4 mb-5 text-sm border border-coral-100">{error}</motion.div>}

      <AnimatePresence mode="popLayout">
        {suggestions.map((s, i) => (
          <motion.div key={s.name} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-white rounded-3xl p-5 shadow-card mb-3 border border-black/[0.03]">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-display text-lg font-extrabold text-ink leading-tight">{s.name}</h3>
              <span className="text-xs font-bold text-gold-600 bg-gold-50 px-2.5 py-1 rounded-full flex-shrink-0 ml-2 border border-gold-100">{s.prepTime}</span>
            </div>
            <p className="text-ink-secondary text-sm mb-3">{s.description}</p>
            <div className="bg-mint-50 rounded-xl px-3.5 py-2.5 mb-3 border border-mint-100">
              <p className="text-mint-700 text-xs"><span className="font-bold">Why this? </span>{s.reason}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {s.ingredients.slice(0, 6).map((ing) => (
                <span key={ing} className={`text-xs px-2.5 py-1 rounded-full font-medium ${pantryItems.some((p) => p.name.toLowerCase().includes(ing.toLowerCase())) ? "bg-mint-50 text-mint-600 border border-mint-200" : "bg-bg-alt text-ink-secondary"}`}>{ing}</span>
              ))}
              {s.ingredients.length > 6 && <span className="text-xs text-ink-faint px-2 py-1">+{s.ingredients.length - 6} more</span>}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {suggestions.length === 0 && !isLoading && !error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <div className="w-16 h-16 rounded-3xl bg-gold-50 flex items-center justify-center mx-auto mb-4"><span className="text-3xl">💡</span></div>
          <p className="text-ink font-bold text-[15px]">Ready when you are</p>
          <p className="text-ink-tertiary text-xs mt-1 max-w-[260px] mx-auto">Tap above to get personalized meal ideas based on your history and pantry</p>
        </motion.div>
      )}
    </div>
  );
}
