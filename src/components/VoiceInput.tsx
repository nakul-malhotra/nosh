"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  }, [
    stopListening,
    transcript,
    interimTranscript,
    onTranscriptComplete,
    resetTranscript,
  ]);

  const handleCancel = useCallback(() => {
    stopListening();
    setIsOpen(false);
    setTimeout(() => resetTranscript(), 500);
  }, [stopListening, resetTranscript]);

  // Waveform bars for visual feedback
  const bars = Array.from({ length: 24 }, (_, i) => i);

  return (
    <>
      {/* Floating Voice Button */}
      <motion.button
        onClick={handleOpen}
        disabled={!isSupported || isProcessing}
        className="relative w-16 h-16 rounded-full bg-terra-500 text-white shadow-warm-lg flex items-center justify-center"
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
      >
        {isProcessing ? (
          <motion.div
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <>
            <div className="absolute inset-0 rounded-full bg-terra-400 animate-breathe opacity-40" />
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="relative z-10"
            >
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
              <path d="M19 10v2a7 7 0 01-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </>
        )}
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
            {/* Gradient mesh background */}
            <div className="absolute inset-0 gradient-mesh opacity-95" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-between h-full px-6 py-12">
              {/* Header */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <h2 className="font-display text-3xl text-white mb-2">
                  Tell me your meals
                </h2>
                <p className="text-white/70 text-sm font-body">
                  Speak naturally — &quot;Monday breakfast is oatmeal, lunch is a
                  chicken salad...&quot;
                </p>
              </motion.div>

              {/* Waveform visualization */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="flex items-center justify-center gap-[3px] h-24"
              >
                {bars.map((i) => (
                  <motion.div
                    key={i}
                    className="w-[3px] rounded-full bg-white/60"
                    animate={
                      isListening
                        ? {
                            height: [8, Math.random() * 48 + 12, 8],
                            opacity: [0.4, 0.9, 0.4],
                          }
                        : { height: 8, opacity: 0.3 }
                    }
                    transition={
                      isListening
                        ? {
                            duration: 0.5 + Math.random() * 0.5,
                            repeat: Infinity,
                            repeatType: "reverse",
                            delay: i * 0.04,
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
                className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-3xl p-5 min-h-[120px] max-h-[240px] overflow-y-auto"
              >
                {transcript || interimTranscript ? (
                  <p className="text-white text-base leading-relaxed font-body">
                    {transcript}
                    <span className="text-white/50">{interimTranscript}</span>
                  </p>
                ) : (
                  <p className="text-white/40 text-base text-center font-body italic">
                    {isListening
                      ? "Listening..."
                      : "Tap the mic to start speaking"}
                  </p>
                )}
              </motion.div>

              {/* Action buttons */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-6"
              >
                <button
                  onClick={handleCancel}
                  className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>

                <motion.button
                  onClick={handleDone}
                  className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg"
                  whileTap={{ scale: 0.9 }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C75B39" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </motion.button>

                <button
                  onClick={() => {
                    resetTranscript();
                    if (!isListening) startListening();
                  }}
                  className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M1 4v6h6" />
                    <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                  </svg>
                </button>
              </motion.div>

              {error && (
                <p className="text-red-200 text-xs mt-2">
                  Microphone error: {error}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
