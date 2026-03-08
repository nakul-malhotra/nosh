"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoice } from "@/hooks/useVoice";

interface VoiceInputProps {
  onTranscriptComplete: (transcript: string) => void;
  isProcessing?: boolean;
}

export default function VoiceInput({
  onTranscriptComplete,
  isProcessing = false,
}: VoiceInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error,
  } = useVoice();

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setTimeout(() => startListening(), 300);
  }, [startListening]);

  const handleDone = useCallback(() => {
    stopListening();
    const fullTranscript = transcript + interimTranscript;
    if (fullTranscript.trim()) {
      onTranscriptComplete(fullTranscript.trim());
    }
    setIsOpen(false);
    setTimeout(() => resetTranscript(), 500);
  }, [stopListening, transcript, interimTranscript, onTranscriptComplete, resetTranscript]);

  const handleCancel = useCallback(() => {
    stopListening();
    setIsOpen(false);
    setTimeout(() => resetTranscript(), 500);
  }, [stopListening, resetTranscript]);

  const bars = Array.from({ length: 28 }, (_, i) => i);

  return (
    <>
      {/* Floating Voice Button — the HERO element */}
      <motion.button
        onClick={handleOpen}
        disabled={!isSupported || isProcessing}
        className="relative group"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.04 }}
      >
        {/* Outer glow rings */}
        <div className="absolute inset-0 rounded-full bg-coral-400/20 animate-pulse-soft scale-[1.4]" />
        <div className="absolute inset-0 rounded-full bg-coral-300/10 animate-pulse-soft scale-[1.8]" style={{ animationDelay: "0.5s" }} />

        {/* Main button */}
        <div className="relative w-[72px] h-[72px] rounded-full bg-gradient-to-br from-coral-400 via-coral-500 to-coral-600 shadow-glow-coral flex items-center justify-center">
          {isProcessing ? (
            <motion.div
              className="w-6 h-6 border-[2.5px] border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            />
          ) : (
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="relative z-10 drop-shadow-sm"
            >
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
              <path d="M19 10v2a7 7 0 01-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </div>
      </motion.button>

      {/* Full-screen Voice Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex flex-col"
          >
            {/* Background */}
            <div className="absolute inset-0 voice-mesh" />
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-between h-full px-6 py-14">
              {/* Header */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <h2 className="font-display text-[32px] font-extrabold text-white leading-tight">
                  Tell me your meals
                </h2>
                <p className="text-white/60 text-sm mt-2 font-body max-w-[280px]">
                  &quot;Monday breakfast is oatmeal, lunch is chicken salad...&quot;
                </p>
              </motion.div>

              {/* Waveform */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="flex items-center justify-center gap-[2.5px] h-28"
              >
                {bars.map((i) => (
                  <motion.div
                    key={i}
                    className="w-[2.5px] rounded-full bg-white/50"
                    animate={
                      isListening
                        ? {
                            height: [6, Math.random() * 56 + 10, 6],
                            opacity: [0.3, 0.85, 0.3],
                          }
                        : { height: 6, opacity: 0.2 }
                    }
                    transition={
                      isListening
                        ? {
                            duration: 0.4 + Math.random() * 0.6,
                            repeat: Infinity,
                            repeatType: "reverse",
                            delay: i * 0.03,
                          }
                        : { duration: 0.3 }
                    }
                  />
                ))}
              </motion.div>

              {/* Transcript */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="w-full max-w-sm glass rounded-3xl p-5 min-h-[100px] max-h-[200px] overflow-y-auto border border-white/20"
              >
                {transcript || interimTranscript ? (
                  <p className="text-ink text-[15px] leading-relaxed font-body">
                    {transcript}
                    <span className="text-ink-tertiary">{interimTranscript}</span>
                  </p>
                ) : (
                  <p className="text-ink-tertiary text-sm text-center font-body">
                    {isListening ? "Listening..." : "Tap the mic to start"}
                  </p>
                )}
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-8"
              >
                <button
                  onClick={handleCancel}
                  className="w-14 h-14 rounded-full glass border border-white/20 flex items-center justify-center text-ink"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>

                <motion.button
                  onClick={handleDone}
                  className="w-20 h-20 rounded-full bg-white shadow-float flex items-center justify-center"
                  whileTap={{ scale: 0.9 }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F0573A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </motion.button>

                <button
                  onClick={() => { resetTranscript(); if (!isListening) startListening(); }}
                  className="w-14 h-14 rounded-full glass border border-white/20 flex items-center justify-center text-ink"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M1 4v6h6" />
                    <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                  </svg>
                </button>
              </motion.div>

              {error && (
                <p className="text-red-200 text-xs mt-2">Mic error: {error}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
