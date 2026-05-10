"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import DataTable from "@/components/DataTable";
import { Key, Plus, RefreshCw, CheckCircle2, Clock, Download } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

interface ActivationCode {
  code: string; status: string; used_by: string | null;
  owner_email: string | null; duration_months: number;
  created_at: string; used_at: string | null;
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "2-digit" });

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.42, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

export default function CodesPage() {
  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  const fetchData = async (p = 0) => {
    setLoading(true);
    const { data } = await supabase
      .from("activation_codes")
      .select("code, status, used_by, owner_email, duration_months, created_at, used_at")
      .order("created_at", { ascending: false })
      .range(p * PAGE_SIZE, (p + 1) * PAGE_SIZE - 1);
    setCodes((data ?? []) as ActivationCode[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(page); }, [page]);

  const unused  = codes.filter(c => c.status === "unused").length;
  const used    = codes.filter(c => c.status === "used").length;

  // Usage trend from codes
  const usageMap: Record<string, number> = {};
  for (const c of codes.filter(c => c.used_at)) {
    const day = c.used_at!.slice(5, 10);
    usageMap[day] = (usageMap[day] ?? 0) + 1;
  }
  const usageTrend = Object.entries(usageMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, used]) => ({ day, used }));

  const inventoryStats = [
    { name: "Available", value: unused, color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)" },
    { name: "Used",      value: used,   color: "#d18feb", bg: "rgba(209,143,235,0.1)", border: "rgba(209,143,235,0.25)" },
  ];

  const columns = [
    {
      header: "Activation Code", accessorKey: "code",
      cell: (r: any) => (
        <code className="text-xs font-mono px-2.5 py-1.5 rounded-lg text-foreground/80 tracking-widest"
          style={{ background: "rgba(209,143,235,0.1)", border: "1px solid rgba(209,143,235,0.22)" }}>
          {r.code}
        </code>
      ),
    },
    {
      header: "Status", accessorKey: "status",
      cell: (r: any) => (
        <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full w-fit ${
          r.status === "unused" ? "bg-success/15 text-success" : "bg-primary/15 text-primary"
        }`}>
          {r.status === "unused" ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
          {r.status === "unused" ? "Available" : "Used"}
        </span>
      ),
    },
    {
      header: "Owner Email", accessorKey: "owner_email",
      cell: (r: any) => <span className="text-xs text-foreground/60">{r.owner_email || "—"}</span>,
    },
    {
      header: "Duration", accessorKey: "duration_months",
      cell: (r: any) => <span className="text-xs text-foreground/60">{r.duration_months} bulan</span>,
    },
    {
      header: "Created", accessorKey: "created_at",
      cell: (r: any) => <span className="text-xs text-foreground/40">{fmtDate(r.created_at)}</span>,
    },
    {
      header: "Used At", accessorKey: "used_at",
      cell: (r: any) => <span className="text-xs text-foreground/40">{r.used_at ? fmtDate(r.used_at) : "—"}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary pills */}
      <motion.div {...fadeUp(0.05)} className="flex flex-wrap gap-3">
        {inventoryStats.map(s => (
          <div key={s.name} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm"
            style={{ background: s.bg, border: `1px solid ${s.border}` }}>
            <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            <span className="text-foreground/60">{s.name}</span>
            <span className="font-bold" style={{ color: s.color }}>{s.value.toLocaleString()}</span>
          </div>
        ))}
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm"
          style={{ background: "rgba(30,16,48,0.05)", border: "1px solid rgba(30,16,48,0.1)" }}>
          <span className="text-foreground/60">Showing</span>
          <span className="font-bold text-foreground">{codes.length} of 5,504 total</span>
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div {...fadeUp(0.1)} className="lg:col-span-2 glass-panel rounded-2xl p-5">
          <h3 className="font-semibold text-foreground mb-1">Code Redemption (this page)</h3>
          <p className="text-xs text-foreground/40 mb-4">Kode yang di-redeem per hari</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={usageTrend} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="codeGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 2" stroke="rgba(209,143,235,0.15)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "rgba(30,16,48,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(30,16,48,0.35)", fontSize: 9 }} axisLine={false} tickLine={false} width={22} />
              <Tooltip cursor={{ stroke: "rgba(209,143,235,0.3)", strokeWidth: 1 }}
                content={({ active, payload, label }) => active && payload?.length ? (
                  <div className="glass-panel px-3 py-2 rounded-xl text-xs">
                    <p className="text-foreground/50 mb-1">{label}</p>
                    <p className="font-bold text-foreground">{payload[0].value} codes redeemed</p>
                  </div>
                ) : null} />
              <Area type="monotone" dataKey="used" stroke="#10b981" strokeWidth={2}
                fill="url(#codeGrad2)" dot={false}
                activeDot={{ r: 4, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div {...fadeUp(0.15)} className="glass-panel rounded-2xl p-5">
          <h3 className="font-semibold text-foreground mb-1">Inventory Breakdown</h3>
          <p className="text-xs text-foreground/40 mb-3">Total: 5,504 codes</p>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={inventoryStats} cx="50%" cy="50%" innerRadius={40} outerRadius={56}
                dataKey="value" paddingAngle={4} strokeWidth={0}>
                {inventoryStats.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {inventoryStats.map(item => (
            <div key={item.name} className="flex items-center justify-between text-xs mt-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                <span className="text-foreground/60">{item.name}</span>
              </div>
              <span className="font-semibold text-foreground/80">{item.value.toLocaleString()}</span>
            </div>
          ))}
          <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ background: "rgba(209,143,235,0.15)" }}>
            <div className="h-full rounded-full" style={{ width: `${Math.round((unused / (unused + used)) * 100)}%`, background: "linear-gradient(90deg, #10b981, #d18feb)" }} />
          </div>
        </motion.div>
      </div>

      {/* Table */}
      <motion.div {...fadeUp(0.25)} className="glass-panel rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3">
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Key className="w-4 h-4 text-success" /> Activation Codes
            </h3>
            <p className="text-xs text-foreground/40 mt-0.5">Live dari Supabase · {PAGE_SIZE} per page · 5,504 total</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {/* Pagination */}
            <button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p-1))}
              className="px-3 py-2 rounded-xl text-xs font-medium text-foreground/60 disabled:opacity-30"
              style={{ background: "rgba(209,143,235,0.07)", border: "1px solid rgba(209,143,235,0.2)" }}>
              ← Prev
            </button>
            <span className="px-3 py-2 rounded-xl text-xs font-medium text-foreground/60"
              style={{ background: "rgba(209,143,235,0.07)", border: "1px solid rgba(209,143,235,0.2)" }}>
              Page {page + 1} / {Math.ceil(5504 / PAGE_SIZE)}
            </span>
            <button onClick={() => setPage(p => p + 1)}
              className="px-3 py-2 rounded-xl text-xs font-medium text-foreground/60"
              style={{ background: "rgba(209,143,235,0.07)", border: "1px solid rgba(209,143,235,0.2)" }}>
              Next →
            </button>
            <button onClick={() => fetchData(page)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-white"
              style={{ background: "linear-gradient(135deg, #d18feb, #a78bfa)" }}>
              <RefreshCw className="w-3 h-3" /> Sync
            </button>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-foreground/40 gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-primary" /> Loading…
          </div>
        ) : (
          <DataTable columns={columns} data={codes} />
        )}
      </motion.div>
    </div>
  );
}
