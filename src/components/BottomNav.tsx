"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

const tabs = [
  { href: "/", label: "Home", d: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" },
  { href: "/plan", label: "Plan", d: "M3 4h18v18H3z M16 2v4 M8 2v4 M3 10h18" },
  { href: "/groceries", label: "Shop", d: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z M3 6h18 M16 10a4 4 0 01-8 0" },
  { href: "/pantry", label: "Pantry", d: "M2 7h20l-1.5 11.5A2 2 0 0118.52 20H5.48a2 2 0 01-1.98-1.5L2 7z M12 3C8.5 3 6 5 6 7h12c0-2-2.5-4-6-4z" },
  { href: "/suggestions", label: "Ideas", d: "M12 2a7 7 0 015 11.9V17a2 2 0 01-2 2H9a2 2 0 01-2-2v-3.1A7 7 0 0112 2z M9 21h6" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-dark shadow-nav" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="max-w-lg mx-auto flex items-center justify-around px-1 pt-2 pb-1.5">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link key={tab.href} href={tab.href} className="relative flex flex-col items-center gap-1 px-4 py-1.5 min-w-[48px]">
              {active && (
                <motion.div
                  layoutId="nav-glow"
                  className="absolute -inset-1 rounded-2xl bg-honey-400/10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`relative z-10 transition-colors duration-200 ${active ? "text-honey-400" : "text-cream-faint"}`}>
                {tab.d.split(" M").map((seg, i) => <path key={i} d={i === 0 ? seg : "M" + seg} />)}
              </svg>
              <span className={`relative z-10 text-[9px] font-semibold tracking-wider uppercase transition-colors duration-200 ${active ? "text-honey-400" : "text-cream-faint"}`}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
