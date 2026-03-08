"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoice } from "@/hooks/useVoice";

export default function VoiceInput({ onTranscriptComplete, isProcessing = false }: { onTranscriptComplete: (t: string) => void; isProcessing?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const { isListening, transcript, interimTranscript, startListening, stopListening, resetTranscript, isSupported, error } = useVoice();

  const handleOpen = useCallback(() => { setIsOpen(true); setTimeout(() => startListening(), 300); }, [startListening]);
  const handleDone = useCallback(() => {
    stopListening();
    const t = transcript + interimTranscript;
    if (t.trim()) onTranscriptComplete(t.trim());
    setIsOpen(false);
    setTimeout(() => resetTranscript(), 500);
  }, [stopListening, transcript, interimTranscript, onTranscriptComplete, resetTranscript]);
  const handleCancel = useCallback(() => { stopListening(); setIsOpen(false); setTimeout(() => resetTranscript(), 500); }, [stopListening, resetTranscript]);

  const bars = Array.from({ length: 32 }, (_, i) => i);

  return (
    <>
      <motion.button onClick={handleOpen} disabled={!isSupported || isProcessing} className="relative group" whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.04 }}>
        {/* Animated conic gradient ring */}
        <div className="absolute inset-[-4px] rounded-full gradient-ring" />
        {/* Glow pulses */}
        <div className="absolute inset-0 rounded-full bg-honey-400/15 animate-glow-pulse scale-[1.5]" />
        <div className="absolute inset-0 rounded-full bg-ember-400/10 animate-glow-pulse scale-[2]" style={{ animationDelay: "1s" }} />
        {/* Main button */}
        <div className="relative w-[76px] h-[76px] rounded-full bg-gradient-to-br from-honey-300 via-honey-400 to-ember-400 shadow-glow-honey-lg flex items-center justify-center">
          {isProcessing ? (
            <motion.div className="w-6 h-6 border-[2.5px] border-base border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
          ) : (
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0C0A08" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex flex-col">
            <div className="absolute inset-0 voice-mesh" />
            <div className="absolute inset-0 bg-base/40 backdrop-blur-md" />
            <div className="relative z-10 flex flex-col items-center justify-between h-full px-6 py-14">
              <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-center">
                <h2 className="font-display text-[36px] font-extrabold text-honey-gradient leading-tight">Tell me your meals</h2>
                <p className="text-cream-muted text-sm mt-3 max-w-[280px]">&quot;Monday breakfast is oatmeal, lunch is chicken salad...&quot;</p>
              </motion.div>
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, type: "spring" }} className="flex items-center justify-center gap-[2px] h-28">
                {bars.map((i) => (
                  <motion.div key={i} className="w-[2px] rounded-full bg-honey-400/40"
                    animate={isListening ? { height: [4, Math.random() * 60 + 8, 4], opacity: [0.2, 0.8, 0.2] } : { height: 4, opacity: 0.15 }}
                    transition={isListening ? { duration: 0.35 + Math.random() * 0.5, repeat: Infinity, repeatType: "reverse", delay: i * 0.025 } : { duration: 0.3 }} />
                ))}
              </motion.div>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="w-full max-w-sm glass-card rounded-3xl p-5 min-h-[100px] max-h-[200px] overflow-y-auto">
                {transcript || interimTranscript ? (
                  <p className="text-cream text-[15px] leading-relaxed">{transcript}<span className="text-cream-faint">{interimTranscript}</span></p>
                ) : (
                  <p className="text-cream-faint text-sm text-center">{isListening ? "Listening..." : "Tap the mic to start"}</p>
                )}
              </motion.div>
              <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-8">
                <button onClick={handleCancel} className="w-14 h-14 rounded-full glass-card flex items-center justify-center text-cream-muted hover:text-cream transition-colors">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
                <motion.button onClick={handleDone} className="w-20 h-20 rounded-full bg-gradient-to-br from-honey-300 to-honey-400 shadow-glow-honey-lg flex items-center justify-center" whileTap={{ scale: 0.9 }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0C0A08" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </motion.button>
                <button onClick={() => { resetTranscript(); if (!isListening) startListening(); }} className="w-14 h-14 rounded-full glass-card flex items-center justify-center text-cream-muted hover:text-cream transition-colors">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" /></svg>
                </button>
              </motion.div>
              {error && <p className="text-ember-300 text-xs mt-2">Mic error: {error}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
