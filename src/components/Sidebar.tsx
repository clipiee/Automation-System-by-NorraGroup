"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, ArrowLeftRight, Key, Zap, Activity, Bug, Users, Megaphone, Wallet } from "lucide-react";

const navItems = [
  { name: "Overview",      href: "/",             icon: LayoutDashboard, group: "main" },
  { name: "Transactions",  href: "/transactions",  icon: ArrowLeftRight,  group: "main" },
  { name: "Codes",         href: "/codes",         icon: Key,             group: "main" },
  { name: "Bug Reports",   href: "/bugs",          icon: Bug,             group: "main" },
  { name: "Creators",      href: "/creators",      icon: Users,           group: "affiliate" },
  { name: "Promotions",    href: "/promotions",    icon: Megaphone,       group: "affiliate" },
  { name: "Withdrawals",   href: "/withdrawals",   icon: Wallet,          group: "affiliate" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div
      className="w-64 h-screen border-r flex flex-col sticky top-0 z-40"
      style={{ background: "#ffffff", borderColor: "rgba(96,165,250,0.15)" }}
    >
      {/* Logo */}
      <div className="px-6 pt-8 pb-6" style={{ borderBottom: "1px solid rgba(96,165,250,0.12)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: "linear-gradient(135deg, #60a5fa, #3b82f6)" }}>
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="gradient-text text-lg font-bold leading-none">AutoFlow</h1>
            <p className="text-xs mt-0.5 text-foreground/40">Monitoring</p>
          </div>
        </div>

        {/* Live indicator */}
        <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span className="text-xs font-medium text-success">Webhook Active</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold uppercase tracking-widest px-3 mb-3 text-foreground/30">Main Menu</p>
        {navItems.filter(i => i.group === "main").map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href} className="block relative">
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: "rgba(96,165,250,0.12)",
                    border: "1px solid rgba(96,165,250,0.3)",
                    boxShadow: "0 2px 12px -4px rgba(96,165,250,0.25)",
                  }}
                  initial={false}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <motion.div
                whileHover={{ x: 2 }}
                className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all z-10 ${
                  isActive ? "text-blue-600" : "text-foreground/45 hover:text-foreground/80"
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${
                  isActive ? "bg-blue-100" : "bg-foreground/5"
                }`}>
                  <Icon className={`w-4 h-4 ${isActive ? "text-blue-500" : ""}`} />
                </div>
                <span className="font-medium text-sm">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                )}
              </motion.div>
            </Link>
          );
        })}

        <p className="text-xs font-semibold uppercase tracking-widest px-3 mb-3 mt-6 text-foreground/30">Affiliate</p>
        {navItems.filter(i => i.group === "affiliate").map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href} className="block relative">
              {isActive && (
                <motion.div
                  layoutId="active-pill-affiliate"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: "rgba(96,165,250,0.12)",
                    border: "1px solid rgba(96,165,250,0.3)",
                    boxShadow: "0 2px 12px -4px rgba(96,165,250,0.25)",
                  }}
                  initial={false}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <motion.div
                whileHover={{ x: 2 }}
                className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all z-10 ${
                  isActive ? "text-blue-600" : "text-foreground/45 hover:text-foreground/80"
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${
                  isActive ? "bg-blue-100" : "bg-foreground/5"
                }`}>
                  <Icon className={`w-4 h-4 ${isActive ? "text-blue-500" : ""}`} />
                </div>
                <span className="font-medium text-sm">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 pb-6" style={{ borderTop: "1px solid rgba(96,165,250,0.12)", paddingTop: "1rem" }}>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          style={{ background: "rgba(96,165,250,0.06)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #60a5fa, #3b82f6)" }}>
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium text-foreground/70">System Status</p>
            <p className="text-xs text-success">All systems normal</p>
          </div>
        </div>
      </div>
    </div>
  );
}
