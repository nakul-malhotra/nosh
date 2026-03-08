"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/components/AppProvider";
import VoiceInput from "@/components/VoiceInput";
import MealCard from "@/components/MealCard";
import {
  DAYS,
  DAY_LABELS,
  MEAL_TYPES,
  MEAL_EMOJIS,
  DayOfWeek,
  MealType,
} from "@/lib/types";
import { getGreeting, formatWeekRange } from "@/lib/utils";

export default function HomePage() {
  const { meals, addMealsFromParsed, removeMeal, currentWeek, groceries } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addDay, setAddDay] = useState<DayOfWeek>("monday");
  const [addType, setAddType] = useState<MealType>("dinner");
  const [addName, setAddName] = useState("");

  const handleVoiceComplete = useCallback(
    async (transcript: string) => {
      setIsProcessing(true);
      try {
        const res = await fetch("/api/parse-meals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript }),
        });
        const data = await res.json();
        if (data.meals && data.meals.length > 0) {
          addMealsFromParsed(data.meals);
        }
      } catch (err) {
        console.error("Failed to parse meals:", err);
      }
      setIsProcessing(false);
    },
    [addMealsFromParsed]
  );

  const handleQuickAdd = useCallback(() => {
    if (addName.trim()) {
      addMealsFromParsed([{ day: addDay, type: addType, name: addName.trim(), ingredients: [] }]);
      setAddName("");
      setShowAddModal(false);
    }
  }, [addDay, addType, addName, addMealsFromParsed]);

  const todayMeals = meals.filter((m) => {
    const dayIndex = new Date().getDay();
    const dayMap: Record<number, DayOfWeek> = {
      0: "sunday", 1: "monday", 2: "tuesday", 3: "wednesday",
      4: "thursday", 5: "friday", 6: "saturday",
    };
    return m.day_of_week === dayMap[dayIndex];
  });

  const totalMeals = meals.length;
  const uncheckedGroceries = groceries.filter((g) => !g.checked).length;

  return (
    <div className="px-5 pt-14 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-ink-tertiary text-[13px] font-semibold tracking-widest uppercase">
          {getGreeting()}
        </p>
        <h1 className="font-display text-[40px] font-extrabold text-ink leading-[1.1] mt-1 tracking-tight">
          Nosh
        </h1>
        <p className="text-coral-500 text-sm font-semibold mt-0.5">
          Neha &amp; Nakul&apos;s Kitchen ✦
        </p>
      </motion.div>

      {/* Week Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="bg-white rounded-3xl p-5 shadow-card mb-5 border border-black/[0.03]"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] font-bold text-ink-tertiary uppercase tracking-widest">
              This Week
            </p>
            <p className="text-[15px] font-bold text-ink mt-1">
              {formatWeekRange(currentWeek)}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-[28px] font-extrabold text-coral-500 font-display leading-none">{totalMeals}</p>
              <p className="text-[10px] text-ink-tertiary font-semibold mt-1">meals</p>
            </div>
            <div className="text-center">
              <p className="text-[28px] font-extrabold text-mint-500 font-display leading-none">{uncheckedGroceries}</p>
              <p className="text-[10px] text-ink-tertiary font-semibold mt-1">to buy</p>
            </div>
          </div>
        </div>

        {/* Day dots */}
        <div className="flex gap-1.5">
          {DAYS.map((day) => {
            const count = meals.filter((m) => m.day_of_week === day).length;
            const isToday = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1] === day;
            return (
              <div
                key={day}
                className={`flex-1 rounded-2xl py-2.5 text-center transition-all ${
                  isToday
                    ? "bg-gradient-to-b from-coral-400 to-coral-500 text-white shadow-glow-coral"
                    : count > 0
                    ? "bg-mint-50 text-mint-700"
                    : "bg-bg-alt text-ink-faint"
                }`}
              >
                <p className="text-[9px] font-bold uppercase tracking-wider">
                  {DAY_LABELS[day]}
                </p>
                <p className={`text-sm font-extrabold mt-0.5 font-display ${isToday ? "text-white" : ""}`}>
                  {count > 0 ? count : "–"}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Today's Meals */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl font-extrabold text-ink">Today&apos;s Menu</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs font-bold text-coral-500 bg-coral-50 px-3.5 py-2 rounded-full hover:bg-coral-100 transition-colors active:scale-95"
          >
            + Add
          </button>
        </div>

        {todayMeals.length > 0 ? (
          <div className="space-y-2 stagger">
            <AnimatePresence mode="popLayout">
              {todayMeals.map((meal, i) => (
                <MealCard key={meal.id} meal={meal} onRemove={removeMeal} index={i} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 text-center shadow-card border border-black/[0.03]">
            <div className="w-14 h-14 rounded-2xl bg-coral-50 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🍽️</span>
            </div>
            <p className="text-ink font-bold text-[15px]">No meals planned yet</p>
            <p className="text-ink-tertiary text-xs mt-1">
              Tap the mic below to plan your week
            </p>
          </div>
        )}
      </motion.div>

      {/* Voice CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex flex-col items-center gap-3 py-4"
      >
        <VoiceInput onTranscriptComplete={handleVoiceComplete} isProcessing={isProcessing} />
        <p className="text-ink-tertiary text-xs font-medium">
          {isProcessing ? "Processing your meals..." : "Tap to speak your meal plan"}
        </p>
      </motion.div>

      {/* Quick Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ y: 400 }}
              animate={{ y: 0 }}
              exit={{ y: 400 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full max-w-lg bg-white rounded-t-[32px] p-6 pb-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-ink-faint rounded-full mx-auto mb-6" />
              <h3 className="font-display text-2xl font-extrabold text-ink mb-6">
                Add a meal
              </h3>

              <div className="mb-5">
                <label className="text-[11px] font-bold text-ink-tertiary uppercase tracking-widest mb-2.5 block">Day</label>
                <div className="flex gap-1.5 flex-wrap">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      onClick={() => setAddDay(day)}
                      className={`chip transition-all ${addDay === day ? "bg-coral-500 text-white shadow-glow-coral" : "bg-bg-alt text-ink-secondary"}`}
                    >
                      {DAY_LABELS[day]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="text-[11px] font-bold text-ink-tertiary uppercase tracking-widest mb-2.5 block">Meal</label>
                <div className="flex gap-2">
                  {MEAL_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setAddType(type)}
                      className={`chip gap-1.5 transition-all ${addType === type ? "bg-mint-500 text-white shadow-glow-mint" : "bg-bg-alt text-ink-secondary"}`}
                    >
                      <span>{MEAL_EMOJIS[type]}</span>
                      <span className="capitalize">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="text-[11px] font-bold text-ink-tertiary uppercase tracking-widest mb-2.5 block">What are you making?</label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
                  placeholder="e.g. Chicken tikka masala"
                  className="w-full bg-bg rounded-2xl px-4 py-3.5 text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-coral-300 font-body border border-black/[0.04]"
                  autoFocus
                />
              </div>

              <button
                onClick={handleQuickAdd}
                disabled={!addName.trim()}
                className="w-full bg-gradient-to-r from-coral-500 to-coral-400 text-white font-bold py-4 rounded-2xl disabled:opacity-40 transition-all active:scale-[0.98] shadow-glow-coral"
              >
                Add to plan
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
