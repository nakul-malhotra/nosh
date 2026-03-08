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
        body: JSON.stringify({
          recentMeals: meals.map((m) => m.name),
          pantryItems: pantryItems.map((p) => p.name),
          busyWeek,
        }),
      });
      const data = await res.json();
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      } else if (data.error) {
        setError(data.error);
      }
    } catch {
      setError("Could not get suggestions. Make sure your API key is configured.");
    }
    setIsLoading(false);
  }, [meals, pantryItems, busyWeek]);

  return (
    <div className="px-5 pt-14 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-3xl text-bark-700">Meal Ideas</h1>
        <p className="text-bark-300 text-sm mt-1">
          AI-powered suggestions based on what you love
        </p>
      </motion.div>

      {/* Busy week toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-4 shadow-soft mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-bark-600 text-sm">⚡ Busy week mode</p>
            <p className="text-bark-300 text-xs mt-0.5">
              Quick meals under 30 min, minimal prep
            </p>
          </div>
          <button
            onClick={() => setBusyWeek(!busyWeek)}
            className={`w-12 h-7 rounded-full transition-all relative ${
              busyWeek ? "bg-saffron-400" : "bg-cream-200"
            }`}
          >
            <motion.div
              className="w-5 h-5 bg-white rounded-full absolute top-1 shadow"
              animate={{ left: busyWeek ? 26 : 4 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </motion.div>

      {/* Context info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-3 mb-6"
      >
        <div className="flex-1 bg-terra-50 rounded-2xl p-3 text-center">
          <p className="text-xl font-bold text-terra-500">{meals.length}</p>
          <p className="text-[10px] text-terra-400 font-semibold uppercase">Past meals</p>
        </div>
        <div className="flex-1 bg-sage-50 rounded-2xl p-3 text-center">
          <p className="text-xl font-bold text-sage-500">{pantryItems.length}</p>
          <p className="text-[10px] text-sage-400 font-semibold uppercase">Pantry items</p>
        </div>
      </motion.div>

      {/* Generate button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        whileTap={{ scale: 0.97 }}
        onClick={getSuggestions}
        disabled={isLoading}
        className="w-full bg-terra-500 text-white font-bold py-4 rounded-2xl mb-6 flex items-center justify-center gap-2 text-sm disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <motion.div
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            Thinking...
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2a7 7 0 015 11.9V17a2 2 0 01-2 2H9a2 2 0 01-2-2v-3.1A7 7 0 0112 2z" />
              <line x1="9" y1="21" x2="15" y2="21" />
            </svg>
            Get meal suggestions
          </>
        )}
      </motion.button>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-terra-50 text-terra-600 rounded-2xl p-4 mb-6 text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Suggestions */}
      <AnimatePresence mode="popLayout">
        {suggestions.map((suggestion, i) => (
          <motion.div
            key={suggestion.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-3xl p-5 shadow-soft mb-4"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-display text-lg text-bark-700">
                {suggestion.name}
              </h3>
              <span className="text-xs font-bold text-saffron-500 bg-saffron-50 px-2 py-1 rounded-full flex-shrink-0 ml-2">
                {suggestion.prepTime}
              </span>
            </div>
            <p className="text-bark-400 text-sm mb-3">{suggestion.description}</p>

            {/* Why this suggestion */}
            <div className="bg-sage-50 rounded-xl px-3 py-2 mb-3">
              <p className="text-sage-600 text-xs">
                <span className="font-bold">Why this? </span>
                {suggestion.reason}
              </p>
            </div>

            {/* Ingredients preview */}
            <div className="flex flex-wrap gap-1.5">
              {suggestion.ingredients.slice(0, 6).map((ing) => (
                <span
                  key={ing}
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    pantryItems.some((p) =>
                      p.name.toLowerCase().includes(ing.toLowerCase())
                    )
                      ? "bg-sage-100 text-sage-600"
                      : "bg-cream-200 text-bark-400"
                  }`}
                >
                  {ing}
                </span>
              ))}
              {suggestion.ingredients.length > 6 && (
                <span className="text-xs text-bark-200 px-2 py-1">
                  +{suggestion.ingredients.length - 6} more
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {suggestions.length === 0 && !isLoading && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-5xl mb-3">💡</p>
          <p className="text-bark-300 font-medium text-sm">
            Ready when you are
          </p>
          <p className="text-bark-200 text-xs mt-1 max-w-[250px] mx-auto">
            Tap above to get personalized meal ideas based on your history and pantry
          </p>
        </motion.div>
      )}
    </div>
  );
}
