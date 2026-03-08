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
  const [showAdd, setShowAdd] = useState(false);
  const [addDay, setAddDay] = useState<DayOfWeek>("monday");
  const [addType, setAddType] = useState<MealType>("dinner");
  const [addName, setAddName] = useState("");

  const handleVoice = useCallback(async (t: string) => {
    setIsProcessing(true);
    try { const r = await fetch("/api/parse-meals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ transcript: t }) }); const d = await r.json(); if (d.meals?.length) addMealsFromParsed(d.meals); } catch {}
    setIsProcessing(false);
  }, [addMealsFromParsed]);

  const handleQuickAdd = useCallback(() => {
    if (addName.trim()) { addMealsFromParsed([{ day: addDay, type: addType, name: addName.trim(), ingredients: [] }]); setAddName(""); setShowAdd(false); }
  }, [addDay, addType, addName, addMealsFromParsed]);

  const todayMeals = meals.filter(m => { const dm: Record<number, DayOfWeek> = { 0:"sunday",1:"monday",2:"tuesday",3:"wednesday",4:"thursday",5:"friday",6:"saturday" }; return m.day_of_week === dm[new Date().getDay()]; });

  return (
    <div className="px-5 pt-12 pb-4 relative overflow-hidden">
      <div className="hero-blob" />
      <div className="hero-blob-2" />

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 mb-8">
        <p className="text-ink-muted text-xs font-bold tracking-[0.25em] uppercase">{getGreeting()}</p>
        <h1 className="font-display text-[56px] font-black leading-[0.9] mt-1 tracking-tight text-brand">nosh</h1>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-5 h-[3px] rounded-full bg-brand" />
          <p className="text-ink-soft text-[13px] font-semibold">Neha &amp; Nakul&apos;s Kitchen</p>
        </div>
      </motion.div>

      {/* ── Week card ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
        className="relative z-10 bg-white rounded-[28px] p-6 shadow-soft-lg mb-6">
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-[10px] font-bold text-ink-muted tracking-[0.25em] uppercase">This Week</p>
            <p className="text-base font-bold text-ink mt-1">{formatWeekRange(currentWeek)}</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-[36px] font-display font-black text-brand leading-none">{meals.length}</p>
              <p className="text-[9px] text-ink-muted font-bold tracking-widest uppercase">meals</p>
            </div>
            <div className="text-right">
              <p className="text-[36px] font-display font-black text-teal-400 leading-none">{groceries.filter(g=>!g.checked).length}</p>
              <p className="text-[9px] text-ink-muted font-bold tracking-widest uppercase">to buy</p>
            </div>
          </div>
        </div>
        <div className="flex gap-[6px]">
          {DAYS.map(day => {
            const count = meals.filter(m => m.day_of_week === day).length;
            const isToday = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1] === day;
            return (
              <div key={day} className={`flex-1 rounded-2xl py-3 text-center transition-all ${isToday ? "bg-brand text-white shadow-glow" : count > 0 ? "bg-teal-50 text-teal-600" : "bg-parchment-deep text-ink-ghost"}`}>
                <p className="text-[8px] font-extrabold uppercase tracking-wider">{DAY_LABELS[day]}</p>
                <p className={`text-sm font-display font-black mt-0.5 ${isToday ? "text-white" : ""}`}>{count || "–"}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Voice CTA ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="relative z-10 mb-8">
        <VoiceInput onTranscriptComplete={handleVoice} isProcessing={isProcessing} />
      </motion.div>

      {/* ── Today's meals ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="relative z-10 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-extrabold text-ink">Today&apos;s Menu</h2>
          <button onClick={() => setShowAdd(true)} className="text-xs font-bold text-white bg-brand px-4 py-2.5 rounded-full shadow-glow hover:shadow-glow-lg transition-shadow active:scale-95">+ Add</button>
        </div>
        {todayMeals.length > 0 ? (
          <div className="space-y-3 stagger">
            <AnimatePresence mode="popLayout">{todayMeals.map((m, i) => <MealCard key={m.id} meal={m} onRemove={removeMeal} index={i} />)}</AnimatePresence>
          </div>
        ) : (
          <div className="bg-white rounded-[28px] p-10 text-center shadow-soft">
            <div className="w-16 h-16 rounded-3xl bg-brand mx-auto mb-4 flex items-center justify-center shadow-glow"><span className="text-2xl">🍽️</span></div>
            <p className="text-ink font-bold text-base">No meals planned yet</p>
            <p className="text-ink-muted text-sm mt-1">Use the voice button above to plan your week</p>
          </div>
        )}
      </motion.div>

      {/* ── Quick Add Sheet ── */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
            <motion.div initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }} transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="w-full max-w-lg bg-white rounded-t-[32px] p-6 pb-10 shadow-soft-xl" onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 bg-ink-ghost rounded-full mx-auto mb-6" />
              <h3 className="font-display text-2xl font-extrabold text-ink mb-6">Add a meal</h3>
              <div className="mb-5">
                <label className="text-[10px] font-bold text-ink-muted tracking-[0.25em] uppercase mb-2.5 block">Day</label>
                <div className="flex gap-1.5 flex-wrap">
                  {DAYS.map(d => <button key={d} onClick={() => setAddDay(d)} className={`chip ${addDay === d ? "bg-brand text-white shadow-glow" : "bg-parchment-deep text-ink-soft"}`}>{DAY_LABELS[d]}</button>)}
                </div>
              </div>
              <div className="mb-5">
                <label className="text-[10px] font-bold text-ink-muted tracking-[0.25em] uppercase mb-2.5 block">Meal</label>
                <div className="flex gap-2">
                  {MEAL_TYPES.map(t => <button key={t} onClick={() => setAddType(t)} className={`chip gap-1.5 ${addType === t ? "bg-teal-400 text-white shadow-glow-teal" : "bg-parchment-deep text-ink-soft"}`}><span>{MEAL_EMOJIS[t]}</span><span className="capitalize">{t}</span></button>)}
                </div>
              </div>
              <div className="mb-6">
                <label className="text-[10px] font-bold text-ink-muted tracking-[0.25em] uppercase mb-2.5 block">What are you making?</label>
                <input type="text" value={addName} onChange={e => setAddName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleQuickAdd()}
                  placeholder="e.g. Chicken tikka masala" className="w-full bg-parchment rounded-2xl px-5 py-4 text-ink placeholder:text-ink-ghost focus:outline-none focus:ring-2 focus:ring-coral-300" autoFocus />
              </div>
              <button onClick={handleQuickAdd} disabled={!addName.trim()} className="w-full bg-brand text-white font-display font-bold py-4 rounded-2xl disabled:opacity-30 shadow-glow-lg active:scale-[0.98] text-lg">Add to plan</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
