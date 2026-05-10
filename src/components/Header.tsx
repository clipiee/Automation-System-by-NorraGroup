"use client";

import { usePathname } from "next/navigation";
import { Bell, User, Search, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const pageMeta: Record<string, { title: string; description: string }> = {
  "/":             { title: "Overview",          description: "Live analytics · SnipieAI.com"  },
  "/transactions": { title: "Transactions",       description: "Lynk.id payment events"        },
  "/codes":        { title: "Activation Codes",   description: "Supabase code inventory"       },
  "/bugs":         { title: "Bug Reports",        description: "Laporan bug dari pengguna"     },
};

export default function Header() {
  const pathname = usePathname();
  const meta = pageMeta[pathname] ?? { title: "Dashboard", description: "" };
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });

  return (
    <header
      className="h-16 sticky top-0 z-30 flex items-center justify-between px-8"
      style={{
        background: "rgba(250,246,255,0.88)",
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(209,143,235,0.18)",
      }}
    >
      {/* Breadcrumb + title */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-foreground/30 flex items-center gap-1">
          AutoFlow <ChevronRight className="w-3 h-3" />
        </span>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-sm font-semibold text-foreground leading-none">{meta.title}</h2>
          <p className="text-xs mt-0.5 text-foreground/40">{meta.description}</p>
        </motion.div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
          style={{ background: "rgba(209,143,235,0.08)", border: "1px solid rgba(209,143,235,0.2)" }}>
          <Search className="w-3.5 h-3.5 text-foreground/40" />
          <span className="text-foreground/40">Quick search…</span>
          <span className="ml-2 text-foreground/25 border border-foreground/10 rounded px-1 py-0.5 text-[10px]">⌘K</span>
        </div>

        <span className="hidden lg:block text-xs text-foreground/35">{dateStr}</span>

        <div className="h-5 w-px" style={{ background: "rgba(209,143,235,0.25)" }} />

        <button className="relative p-2 rounded-lg transition-colors"
          style={{ ":hover": { background: "rgba(209,143,235,0.1)" } } as any}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(209,143,235,0.1)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <Bell className="w-4 h-4 text-foreground/50" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        </button>

        <button className="flex items-center gap-2 p-1 rounded-lg pr-2.5 transition-colors"
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(209,143,235,0.1)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #d18feb, #a78bfa)" }}>
            A
          </div>
          <span className="text-xs font-medium text-foreground/60 hidden sm:block">Admin</span>
        </button>
      </div>
    </header>
  );
}
