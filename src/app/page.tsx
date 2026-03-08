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
        <p className="text-bark-300 text-sm font-medium tracking-wide uppercase">
          {getGreeting()}
        </p>
        <h1 className="font-display text-4xl text-bark-700 mt-1 italic">
          Nosh
        </h1>
        <p className="font-hand text-lg text-terra-500 -mt-1">
          Neha &amp; Nakul&apos;s Kitchen
        </p>
      </motion.div>

      {/* Week Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl p-5 shadow-soft mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-bark-300 uppercase tracking-wider">
              This Week
            </p>
            <p className="text-sm font-bold text-bark-600 mt-0.5">
              {formatWeekRange(currentWeek)}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-terra-500">{totalMeals}</p>
              <p className="text-[10px] text-bark-300 font-medium">meals</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-sage-500">{uncheckedGroceries}</p>
              <p className="text-[10px] text-bark-300 font-medium">to buy</p>
            </div>
          </div>
        </div>

        {/* Quick day preview */}
        <div className="flex gap-1.5">
          {DAYS.map((day) => {
            const count = meals.filter((m) => m.day_of_week === day).length;
            const isToday =
              DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1] === day;
            return (
              <div
                key={day}
                className={`flex-1 rounded-xl py-2 text-center transition-all ${
                  isToday
                    ? "bg-terra-500 text-white shadow-warm"
                    : count > 0
                    ? "bg-sage-50 text-sage-700"
                    : "bg-cream-100 text-bark-200"
                }`}
              >
                <p className="text-[10px] font-bold uppercase">
                  {DAY_LABELS[day]}
                </p>
                <p className="text-xs font-semibold mt-0.5">
                  {count > 0 ? count : "–"}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Today's Meals */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl text-bark-700">Today&apos;s Menu</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs font-bold text-terra-500 bg-terra-50 px-3 py-1.5 rounded-full hover:bg-terra-100 transition-colors"
          >
            + Add
          </button>
        </div>

        {todayMeals.length > 0 ? (
          <div className="space-y-2 stagger-children">
            <AnimatePresence mode="popLayout">
              {todayMeals.map((meal, i) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onRemove={removeMeal}
                  index={i}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white/60 rounded-2xl p-8 text-center">
            <p className="text-4xl mb-2">🍽️</p>
            <p className="text-bark-300 text-sm">No meals planned for today</p>
            <p className="text-bark-200 text-xs mt-1">
              Tap the mic to plan your week
            </p>
          </div>
        )}
      </motion.div>

      {/* Voice CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col items-center gap-3 py-6"
      >
        <VoiceInput
          onTranscriptComplete={handleVoiceComplete}
          isProcessing={isProcessing}
        />
        <p className="text-bark-300 text-xs font-medium">
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
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-bark-100 rounded-full mx-auto mb-5" />
              <h3 className="font-display text-2xl text-bark-700 mb-5">
                Add a meal
              </h3>

              {/* Day selector */}
              <div className="mb-4">
                <label className="text-xs font-bold text-bark-400 uppercase tracking-wider mb-2 block">
                  Day
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      onClick={() => setAddDay(day)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        addDay === day
                          ? "bg-terra-500 text-white"
                          : "bg-cream-100 text-bark-400"
                      }`}
                    >
                      {DAY_LABELS[day]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Meal type selector */}
              <div className="mb-4">
                <label className="text-xs font-bold text-bark-400 uppercase tracking-wider mb-2 block">
                  Meal
                </label>
                <div className="flex gap-2">
                  {MEAL_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setAddType(type)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        addType === type
                          ? "bg-sage-500 text-white"
                          : "bg-cream-100 text-bark-400"
                      }`}
                    >
                      <span>{MEAL_EMOJIS[type]}</span>
                      <span className="capitalize">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name input */}
              <div className="mb-5">
                <label className="text-xs font-bold text-bark-400 uppercase tracking-wider mb-2 block">
                  What are you making?
                </label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
                  placeholder="e.g. Chicken tikka masala"
                  className="w-full bg-cream-50 border border-cream-200 rounded-2xl px-4 py-3 text-bark-700 placeholder:text-bark-200 focus:outline-none focus:ring-2 focus:ring-terra-300 font-body"
                  autoFocus
                />
              </div>

              <button
                onClick={handleQuickAdd}
                disabled={!addName.trim()}
                className="w-full bg-terra-500 text-white font-bold py-3.5 rounded-2xl disabled:opacity-40 transition-all active:scale-[0.98]"
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
