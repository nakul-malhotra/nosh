"use client";

import { motion } from "framer-motion";
import { Meal, MEAL_EMOJIS } from "@/lib/types";

interface MealCardProps {
  meal: Meal;
  onRemove?: (id: string) => void;
  index?: number;
}

export default function MealCard({ meal, onRemove, index = 0 }: MealCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -60, transition: { duration: 0.2 } }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 30 }}
      className="group relative flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-soft"
    >
      <span className="text-xl flex-shrink-0">{MEAL_EMOJIS[meal.meal_type]}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-bark-700 text-sm truncate">{meal.name}</p>
        <p className="text-bark-300 text-xs capitalize">{meal.meal_type}</p>
      </div>
      {onRemove && (
        <button
          onClick={() => onRemove(meal.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-full bg-terra-50 flex items-center justify-center text-terra-400 hover:bg-terra-100 flex-shrink-0"
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
