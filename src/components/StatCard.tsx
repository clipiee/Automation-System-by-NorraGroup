"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { SparklineChart } from "./SparklineChart";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  delay?: number;
  color?: "primary" | "accent" | "pink" | "orange" | "success" | "danger";
  sparkData?: number[];
}

const colorMap = {
  primary: {
    bg: "rgba(96,165,250,0.08)",
    border: "rgba(96,165,250,0.22)",
    icon: "#3b82f6",
    iconBg: "rgba(96,165,250,0.12)",
    glow: "0 6px 28px -6px rgba(96,165,250,0.35)",
    stroke: "#60a5fa",
  },
  accent: {
    bg: "rgba(147,197,253,0.09)",
    border: "rgba(147,197,253,0.25)",
    icon: "#60a5fa",
    iconBg: "rgba(147,197,253,0.14)",
    glow: "0 6px 28px -6px rgba(147,197,253,0.35)",
    stroke: "#93c5fd",
  },
  pink: {
    bg: "rgba(15,23,42,0.04)",
    border: "rgba(15,23,42,0.12)",
    icon: "#0f172a",
    iconBg: "rgba(15,23,42,0.08)",
    glow: "0 6px 28px -6px rgba(15,23,42,0.15)",
    stroke: "#334155",
  },
  orange: {
    bg: "rgba(249,115,22,0.07)",
    border: "rgba(249,115,22,0.18)",
    icon: "#f97316",
    iconBg: "rgba(249,115,22,0.11)",
    glow: "0 6px 28px -6px rgba(249,115,22,0.28)",
    stroke: "#f97316",
  },
  success: {
    bg: "rgba(16,185,129,0.07)",
    border: "rgba(16,185,129,0.18)",
    icon: "#10b981",
    iconBg: "rgba(16,185,129,0.11)",
    glow: "0 6px 28px -6px rgba(16,185,129,0.28)",
    stroke: "#10b981",
  },
  danger: {
    bg: "rgba(239,68,68,0.07)",
    border: "rgba(239,68,68,0.18)",
    icon: "#ef4444",
    iconBg: "rgba(239,68,68,0.11)",
    glow: "0 6px 28px -6px rgba(239,68,68,0.28)",
    stroke: "#ef4444",
  },
};

export default function StatCard({
  title, value, subtitle, icon: Icon,
  trend, trendUp, delay = 0, color = "primary", sparkData,
}: StatCardProps) {
  const c = colorMap[color] || colorMap["primary"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      whileHover={{ y: -5, boxShadow: c.glow, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-2xl p-5 group cursor-default"
      style={{ background: `linear-gradient(145deg, ${c.bg}, rgba(255,255,255,0.95))`, border: `1px solid ${c.border}` }}
    >
      {/* Corner orb */}
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"
        style={{ background: c.icon }} />

      {/* Top row */}
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl shadow-sm" style={{ background: c.iconBg }}>
          <Icon className="w-5 h-5" style={{ color: c.icon }} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            trendUp ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
          }`}>
            {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>

      {/* Values */}
      <div className="relative z-10">
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        <p className="text-xs mt-1 font-medium text-foreground/50">{title}</p>
        {subtitle && <p className="text-xs mt-0.5 text-foreground/35">{subtitle}</p>}
      </div>

      {/* Sparkline */}
      {sparkData && sparkData.length > 0 && (
        <div className="mt-3 -mx-1 h-10 relative z-10">
          <SparklineChart data={sparkData} color={c.stroke} />
        </div>
      )}
    </motion.div>
  );
}
