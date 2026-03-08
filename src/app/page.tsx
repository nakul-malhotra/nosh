"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/components/AppProvider";
import VoiceInput from "@/components/VoiceInput";
import MealCard from "@/components/MealCard";
import { DAYS, DAY_LABELS, MEAL_TYPES, MEAL_EMOJIS, DayOfWeek, MealType } from "@/lib/types";
import { getGreeting, formatWeekRange } from "@/lib/utils";

export default function HomePage() {
  const { meals, addMealsFromParsed, removeMeal, currentWeek, groceries } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addDay, setAddDay] = useState<DayOfWeek>("monday");
  const [addType, setAddType] = useState<MealType>("dinner");
  const [addName, setAddName] = useState("");

  const handleVoiceComplete = useCallback(async (transcript: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/parse-meals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ transcript }) });
      const data = await res.json();
      if (data.meals?.length > 0) addMealsFromParsed(data.meals);
    } catch (e) { console.error(e); }
    setIsProcessing(false);
  }, [addMealsFromParsed]);

  const handleQuickAdd = useCallback(() => {
    if (addName.trim()) { addMealsFromParsed([{ day: addDay, type: addType, name: addName.trim(), ingredients: [] }]); setAddName(""); setShowAddModal(false); }
  }, [addDay, addType, addName, addMealsFromParsed]);

  const todayMeals = meals.filter((m) => {
    const dm: Record<number, DayOfWeek> = { 0: "sunday", 1: "monday", 2: "tuesday", 3: "wednesday", 4: "thursday", 5: "friday", 6: "saturday" };
    return m.day_of_week === dm[new Date().getDay()];
  });

  return (
    <div className="px-5 pt-14 pb-4">
      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <p className="text-cream-faint text-[11px] font-bold tracking-[0.2em] uppercase">{getGreeting()}</p>
        <h1 className="font-display text-[52px] font-extrabold leading-[0.95] mt-2 tracking-tight text-honey-gradient">
          Nosh
        </h1>
        <p className="text-cream-muted text-[13px] font-medium mt-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-honey-400 inline-block" />
          Neha &amp; Nakul&apos;s Kitchen
        </p>
      </motion.div>

      {/* ── Week card ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
        className="glass-card rounded-3xl p-5 mb-6 shadow-card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] font-bold text-cream-faint tracking-[0.2em] uppercase">This Week</p>
            <p className="text-[15px] font-bold text-cream mt-1">{formatWeekRange(currentWeek)}</p>
          </div>
          <div className="flex gap-5">
            <div className="text-center">
              <p className="text-[32px] font-extrabold font-display text-honey-400 leading-none">{meals.length}</p>
              <p className="text-[9px] text-cream-faint font-bold tracking-widest uppercase mt-1">meals</p>
            </div>
            <div className="text-center">
              <p className="text-[32px] font-extrabold font-display text-herb-300 leading-none">{groceries.filter(g => !g.checked).length}</p>
              <p className="text-[9px] text-cream-faint font-bold tracking-widest uppercase mt-1">to buy</p>
            </div>
          </div>
        </div>
        <div className="flex gap-1.5">
          {DAYS.map((day) => {
            const count = meals.filter((m) => m.day_of_week === day).length;
            const isToday = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1] === day;
            return (
              <div key={day} className={`flex-1 rounded-2xl py-2.5 text-center transition-all ${
                isToday ? "bg-gradient-to-b from-honey-400 to-ember-400 shadow-glow-honey" :
                count > 0 ? "bg-herb-300/10 border border-herb-300/15" : "bg-cream/[0.03]"}`}>
                <p className={`text-[9px] font-bold uppercase tracking-wider ${isToday ? "text-base" : "text-cream-faint"}`}>{DAY_LABELS[day]}</p>
                <p className={`text-sm font-extrabold mt-0.5 font-display ${isToday ? "text-base" : count > 0 ? "text-herb-300" : "text-cream-faint"}`}>{count || "–"}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Today ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-extrabold text-cream">Today&apos;s Menu</h2>
          <button onClick={() => setShowAddModal(true)} className="text-xs font-bold text-honey-400 bg-honey-400/10 border border-honey-400/20 px-3.5 py-2 rounded-full hover:bg-honey-400/20 transition-colors active:scale-95">+ Add</button>
        </div>
        {todayMeals.length > 0 ? (
          <div className="space-y-2 stagger">
            <AnimatePresence mode="popLayout">{todayMeals.map((meal, i) => <MealCard key={meal.id} meal={meal} onRemove={removeMeal} index={i} />)}</AnimatePresence>
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-8 text-center shadow-card">
            <div className="w-14 h-14 rounded-2xl bg-honey-400/10 flex items-center justify-center mx-auto mb-3"><span className="text-2xl">🍽️</span></div>
            <p className="text-cream font-bold text-[15px]">No meals planned yet</p>
            <p className="text-cream-faint text-xs mt-1">Tap the mic below to plan your week</p>
          </div>
        )}
      </motion.div>

      {/* ── Voice CTA ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col items-center gap-4 py-4">
        <VoiceInput onTranscriptComplete={handleVoiceComplete} isProcessing={isProcessing} />
        <p className="text-cream-faint text-xs font-medium">{isProcessing ? "Processing your meals..." : "Tap to speak your meal plan"}</p>
      </motion.div>

      {/* ── Quick Add Modal ── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
            <motion.div initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full max-w-lg bg-base-100 rounded-t-[32px] p-6 pb-10 border-t border-cream/[0.06]" onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 bg-cream-ghost rounded-full mx-auto mb-6" />
              <h3 className="font-display text-2xl font-extrabold text-cream mb-6">Add a meal</h3>
              <div className="mb-5">
                <label className="text-[10px] font-bold text-cream-faint tracking-[0.2em] uppercase mb-2.5 block">Day</label>
                <div className="flex gap-1.5 flex-wrap">
                  {DAYS.map(d => <button key={d} onClick={() => setAddDay(d)} className={`chip ${addDay === d ? "bg-honey-400 text-base border-honey-400" : "bg-cream/[0.04] text-cream-muted border-cream/[0.06]"}`}>{DAY_LABELS[d]}</button>)}
                </div>
              </div>
              <div className="mb-5">
                <label className="text-[10px] font-bold text-cream-faint tracking-[0.2em] uppercase mb-2.5 block">Meal</label>
                <div className="flex gap-2">
                  {MEAL_TYPES.map(t => <button key={t} onClick={() => setAddType(t)} className={`chip gap-1.5 ${addType === t ? "bg-herb-300 text-base border-herb-300" : "bg-cream/[0.04] text-cream-muted border-cream/[0.06]"}`}><span>{MEAL_EMOJIS[t]}</span><span className="capitalize">{t}</span></button>)}
                </div>
              </div>
              <div className="mb-6">
                <label className="text-[10px] font-bold text-cream-faint tracking-[0.2em] uppercase mb-2.5 block">What are you making?</label>
                <input type="text" value={addName} onChange={e => setAddName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleQuickAdd()}
                  placeholder="e.g. Chicken tikka masala" className="w-full bg-base-200 rounded-2xl px-4 py-3.5 text-cream placeholder:text-cream-faint focus:outline-none focus:ring-2 focus:ring-honey-400/50 border border-cream/[0.06]" autoFocus />
              </div>
              <button onClick={handleQuickAdd} disabled={!addName.trim()} className="w-full bg-gradient-to-r from-honey-400 to-ember-400 text-base font-bold py-4 rounded-2xl disabled:opacity-30 active:scale-[0.98] shadow-glow-honey transition-all">Add to plan</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
