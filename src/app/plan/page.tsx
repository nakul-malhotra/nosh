"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/components/AppProvider";
import MealCard from "@/components/MealCard";
import VoiceInput from "@/components/VoiceInput";
import { DAYS, DAY_LABELS, MEAL_TYPES, MEAL_EMOJIS, DayOfWeek, MealType } from "@/lib/types";
import { formatWeekRange, getWeekOffset } from "@/lib/utils";

export default function PlanPage() {
  const { meals, currentWeek, setCurrentWeek, removeMeal, addMealsFromParsed } = useApp();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(
    DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]
  );
  const [isProcessing, setIsProcessing] = useState(false);

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
        if (data.meals?.length > 0) addMealsFromParsed(data.meals);
      } catch (err) {
        console.error("Failed to parse:", err);
      }
      setIsProcessing(false);
    },
    [addMealsFromParsed]
  );

  const dayMeals = meals.filter((m) => m.day_of_week === selectedDay);

  return (
    <div className="px-5 pt-14 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-3xl text-bark-700">Meal Plan</h1>
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => setCurrentWeek(getWeekOffset(currentWeek, -1))}
            className="w-8 h-8 rounded-full bg-cream-200 flex items-center justify-center text-bark-400 hover:bg-cream-300 transition-colors"
          >
            ‹
          </button>
          <p className="text-sm font-bold text-bark-500 flex-1 text-center">
            {formatWeekRange(currentWeek)}
          </p>
          <button
            onClick={() => setCurrentWeek(getWeekOffset(currentWeek, 1))}
            className="w-8 h-8 rounded-full bg-cream-200 flex items-center justify-center text-bark-400 hover:bg-cream-300 transition-colors"
          >
            ›
          </button>
        </div>
      </motion.div>

      {/* Day Selector — horizontal scroll */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide"
      >
        {DAYS.map((day) => {
          const count = meals.filter((m) => m.day_of_week === day).length;
          const isSelected = selectedDay === day;
          const isToday =
            DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1] === day;
          return (
            <motion.button
              key={day}
              onClick={() => setSelectedDay(day)}
              whileTap={{ scale: 0.95 }}
              className={`flex-shrink-0 w-14 rounded-2xl py-3 text-center transition-all relative ${
                isSelected
                  ? "bg-terra-500 text-white shadow-warm"
                  : "bg-white text-bark-400 shadow-soft"
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wide">
                {DAY_LABELS[day]}
              </p>
              <p className={`text-lg font-bold mt-0.5 ${isSelected ? "text-white" : "text-bark-600"}`}>
                {count || "–"}
              </p>
              {isToday && !isSelected && (
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-terra-400" />
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Selected Day Meals */}
      <motion.div
        key={selectedDay}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <h2 className="font-display text-xl text-bark-700 mb-4 capitalize">
          {selectedDay}
        </h2>

        {MEAL_TYPES.map((type) => {
          const typeMeals = dayMeals.filter((m) => m.meal_type === type);
          return (
            <div key={type} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{MEAL_EMOJIS[type]}</span>
                <p className="text-xs font-bold text-bark-300 uppercase tracking-wider capitalize">
                  {type}
                </p>
              </div>
              {typeMeals.length > 0 ? (
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {typeMeals.map((meal, i) => (
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
                <div className="bg-white/40 rounded-xl py-3 px-4 border border-dashed border-cream-300">
                  <p className="text-bark-200 text-xs text-center">
                    No {type} planned
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* Voice CTA */}
      <div className="flex flex-col items-center gap-2 pt-4 pb-2">
        <VoiceInput
          onTranscriptComplete={handleVoiceComplete}
          isProcessing={isProcessing}
        />
        <p className="text-bark-300 text-xs">
          {isProcessing ? "Parsing your meals..." : "Speak to add meals"}
        </p>
      </div>
    </div>
  );
}
