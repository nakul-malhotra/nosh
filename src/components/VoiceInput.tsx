"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoice } from "@/hooks/useVoice";

export default function VoiceInput({ onTranscriptComplete, isProcessing = false }: { onTranscriptComplete: (t: string) => void; isProcessing?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const { isListening, transcript, interimTranscript, startListening, stopListening, resetTranscript, isSupported, error } = useVoice();
  const handleOpen = useCallback(() => { setIsOpen(true); setTimeout(() => startListening(), 300); }, [startListening]);
  const handleDone = useCallback(() => { stopListening(); const t = transcript + interimTranscript; if (t.trim()) onTranscriptComplete(t.trim()); setIsOpen(false); setTimeout(() => resetTranscript(), 500); }, [stopListening, transcript, interimTranscript, onTranscriptComplete, resetTranscript]);
  const handleCancel = useCallback(() => { stopListening(); setIsOpen(false); setTimeout(() => resetTranscript(), 500); }, [stopListening, resetTranscript]);
  const bars = Array.from({ length: 32 }, (_, i) => i);

  return (
    <>
      {/* ── Full-width gradient CTA — THE signature element ── */}
      <motion.button onClick={handleOpen} disabled={!isSupported || isProcessing}
        className="w-full relative overflow-hidden rounded-[28px] py-5 px-6 bg-brand shadow-glow-lg flex items-center justify-center gap-3 group"
        whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.01 }}>
        {/* Animated shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        {isProcessing ? (
          <motion.div className="w-5 h-5 border-[2.5px] border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
        ) : (
          <div className="w-12 h-12 rounded-full bg-white/25 flex items-center justify-center backdrop-blur-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </div>
        )}
        <div className="text-left relative z-10">
          <p className="text-white font-display font-extrabold text-lg leading-tight">{isProcessing ? "Processing..." : "Speak your meals"}</p>
          <p className="text-white/70 text-xs font-medium mt-0.5">Tap to plan your entire week by voice</p>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" className="ml-auto opacity-60 relative z-10"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
      </motion.button>

      {/* ── Voice overlay ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex flex-col">
            <div className="absolute inset-0 voice-bg" />
            <div className="relative z-10 flex flex-col items-center justify-between h-full px-6 py-14">
              <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-center">
                <h2 className="font-display text-[40px] font-extrabold text-white leading-[1] tracking-tight">Tell me<br/>your meals</h2>
                <p className="text-white/60 text-sm mt-3 max-w-[260px]">&quot;Monday breakfast is oatmeal, lunch is chicken salad...&quot;</p>
              </motion.div>
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center justify-center gap-[2px] h-28">
                {bars.map((i) => (
                  <motion.div key={i} className="w-[2.5px] rounded-full bg-white/40"
                    animate={isListening ? { height: [4, Math.random() * 64 + 8, 4], opacity: [0.2, 0.9, 0.2] } : { height: 4, opacity: 0.15 }}
                    transition={isListening ? { duration: 0.35 + Math.random() * 0.5, repeat: Infinity, repeatType: "reverse", delay: i * 0.025 } : { duration: 0.3 }} />
                ))}
              </motion.div>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="w-full max-w-sm bg-white/15 backdrop-blur-xl rounded-3xl p-5 min-h-[100px] max-h-[200px] overflow-y-auto border border-white/20">
                {transcript || interimTranscript ? (
                  <p className="text-white text-[15px] leading-relaxed font-medium">{transcript}<span className="text-white/40">{interimTranscript}</span></p>
                ) : (
                  <p className="text-white/30 text-sm text-center">{isListening ? "Listening..." : "Tap the mic to start"}</p>
                )}
              </motion.div>
              <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-8">
                <button onClick={handleCancel} className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
                <motion.button onClick={handleDone} className="w-20 h-20 rounded-full bg-white shadow-soft-xl flex items-center justify-center" whileTap={{ scale: 0.9 }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><defs><linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FF6B6B" /><stop offset="100%" stopColor="#FF8E53" /></linearGradient></defs><polyline points="20 6 9 17 4 12" stroke="url(#cg)" /></svg>
                </motion.button>
                <button onClick={() => { resetTranscript(); if (!isListening) startListening(); }} className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" /></svg>
                </button>
              </motion.div>
              {error && <p className="text-white/60 text-xs mt-2">Mic error: {error}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
