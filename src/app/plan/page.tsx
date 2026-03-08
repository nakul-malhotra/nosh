"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/components/AppProvider";
import MealCard from "@/components/MealCard";
import VoiceInput from "@/components/VoiceInput";
import { DAYS, DAY_LABELS, MEAL_TYPES, MEAL_EMOJIS, DayOfWeek } from "@/lib/types";
import { formatWeekRange, getWeekOffset } from "@/lib/utils";

export default function PlanPage() {
  const { meals, currentWeek, setCurrentWeek, removeMeal, addMealsFromParsed } = useApp();
  const [sel, setSel] = useState<DayOfWeek>(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const [isProcessing, setIsProcessing] = useState(false);
  const handleVoice = useCallback(async (t: string) => {
    setIsProcessing(true);
    try { const r = await fetch("/api/parse-meals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ transcript: t }) }); const d = await r.json(); if (d.meals?.length) addMealsFromParsed(d.meals); } catch {}
    setIsProcessing(false);
  }, [addMealsFromParsed]);
  const dayMeals = meals.filter(m => m.day_of_week === sel);

  return (
    <div className="px-5 pt-12 pb-4 relative overflow-hidden">
      <div className="hero-blob" /><div className="hero-blob-2" />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 mb-6">
        <h1 className="font-display text-[42px] font-black text-ink tracking-tight">Meal Plan</h1>
        <div className="flex items-center gap-3 mt-3">
          <button onClick={() => setCurrentWeek(getWeekOffset(currentWeek, -1))} className="w-10 h-10 rounded-2xl bg-white shadow-soft flex items-center justify-center text-ink-soft hover:text-ink text-lg transition-colors">‹</button>
          <p className="text-sm font-bold text-ink flex-1 text-center">{formatWeekRange(currentWeek)}</p>
          <button onClick={() => setCurrentWeek(getWeekOffset(currentWeek, 1))} className="w-10 h-10 rounded-2xl bg-white shadow-soft flex items-center justify-center text-ink-soft hover:text-ink text-lg transition-colors">›</button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.06 }} className="relative z-10 flex gap-2 mb-6 overflow-x-auto pb-2 -mx-5 px-5">
        {DAYS.map(day => {
          const count = meals.filter(m => m.day_of_week === day).length;
          const active = sel === day;
          const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1] === day;
          return (
            <motion.button key={day} onClick={() => setSel(day)} whileTap={{ scale: 0.93 }}
              className={`flex-shrink-0 w-[54px] rounded-[22px] py-3.5 text-center transition-all ${active ? "bg-brand text-white shadow-glow" : "bg-white text-ink-soft shadow-soft"}`}>
              <p className={`text-[8px] font-extrabold uppercase tracking-wider ${active ? "text-white/80" : ""}`}>{DAY_LABELS[day]}</p>
              <p className={`text-lg font-display font-black mt-0.5 ${active ? "text-white" : "text-ink"}`}>{count || "–"}</p>
              {today && !active && <div className="w-1.5 h-1.5 rounded-full bg-brand mx-auto mt-1" />}
            </motion.button>
          );
        })}
      </motion.div>

      <motion.div key={sel} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 300, damping: 28 }} className="relative z-10">
        <h2 className="font-display text-2xl font-extrabold text-ink mb-5 capitalize">{sel}</h2>
        {MEAL_TYPES.map(type => {
          const tm = dayMeals.filter(m => m.meal_type === type);
          return (
            <div key={type} className="mb-5">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-base">{MEAL_EMOJIS[type]}</span>
                <p className="text-[10px] font-bold text-ink-muted tracking-[0.25em] uppercase capitalize">{type}</p>
              </div>
              {tm.length > 0 ? (
                <div className="space-y-2.5"><AnimatePresence mode="popLayout">{tm.map((m, i) => <MealCard key={m.id} meal={m} onRemove={removeMeal} index={i} />)}</AnimatePresence></div>
              ) : (
                <div className="bg-parchment-deep rounded-2xl py-3.5 px-4 border-2 border-dashed border-ink-ghost/40"><p className="text-ink-ghost text-xs text-center font-medium">No {type} planned</p></div>
              )}
            </div>
          );
        })}
      </motion.div>
      <div className="relative z-10 mt-4"><VoiceInput onTranscriptComplete={handleVoice} isProcessing={isProcessing} /></div>
    </div>
  );
}
