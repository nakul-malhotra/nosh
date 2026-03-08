"use client";

import { motion } from "framer-motion";
import { Meal, MEAL_EMOJIS } from "@/lib/types";

interface MealCardProps {
  meal: Meal;
  onRemove?: (id: string) => void;
  index?: number;
}

const typeColors: Record<string, string> = {
  breakfast: "bg-gold-50 border-gold-200",
  lunch: "bg-coral-50 border-coral-200",
  dinner: "bg-plum-50 border-plum-200",
  snack: "bg-mint-50 border-mint-200",
};

export default function MealCard({ meal, onRemove, index = 0 }: MealCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -60, transition: { duration: 0.2 } }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 30 }}
      className={`group relative flex items-center gap-3.5 rounded-2xl px-4 py-3.5 border transition-shadow hover:shadow-card-hover ${typeColors[meal.meal_type] || "bg-white border-transparent"}`}
    >
      <span className="text-xl flex-shrink-0">{MEAL_EMOJIS[meal.meal_type]}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-ink text-[15px] truncate">{meal.name}</p>
        <p className="text-ink-tertiary text-xs capitalize mt-0.5">{meal.meal_type}</p>
      </div>
      {onRemove && (
        <button
          onClick={() => onRemove(meal.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-full bg-white/80 flex items-center justify-center text-ink-tertiary hover:text-coral-500 flex-shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </motion.div>
  );
}
