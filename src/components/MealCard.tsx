"use client";
import { motion } from "framer-motion";
import { Meal, MEAL_EMOJIS } from "@/lib/types";

const typeBg: Record<string, string> = {
  breakfast: "bg-peach-50", lunch: "bg-coral-50", dinner: "bg-violet-50", snack: "bg-teal-50",
};

export default function MealCard({ meal, onRemove, index = 0 }: { meal: Meal; onRemove?: (id: string) => void; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -80, transition: { duration: 0.2 } }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 28 }}
      className={`group relative flex items-center gap-4 rounded-3xl px-5 py-4 shadow-soft hover:shadow-soft-lg transition-shadow ${typeBg[meal.meal_type] || "bg-white"}`}
    >
      <div className="w-11 h-11 rounded-2xl bg-white/80 shadow-inner flex items-center justify-center text-xl flex-shrink-0">{MEAL_EMOJIS[meal.meal_type]}</div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-ink text-[15px] truncate">{meal.name}</p>
        <p className="text-ink-muted text-xs capitalize mt-0.5 font-medium">{meal.meal_type}</p>
      </div>
      {onRemove && (
        <button onClick={() => onRemove(meal.id)} className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-full bg-white shadow-soft flex items-center justify-center text-ink-muted hover:text-coral-400 flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      )}
    </motion.div>
  );
}
