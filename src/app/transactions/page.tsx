"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import DataTable from "@/components/DataTable";
import { ArrowLeftRight, RefreshCw, Trash2, AlertTriangle, X } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

interface LynkPayment {
  id: string; event: string; customer_name: string; customer_email: string;
  customer_phone: string; grand_total: number; total_price: number;
  convenience_fee: number; discount: number; voucher_code: string | null;
  created_at: string;
}

const formatIDR = (v: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.42, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel px-3 py-2 rounded-xl text-xs shadow-xl">
      <p className="text-foreground/50 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-bold text-foreground">
          {p.name === "revenue" ? formatIDR(p.value) : `${p.value} payments`}
        </p>
      ))}
    </div>
  );
}

export default function TransactionsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [payments, setPayments] = useState<LynkPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<LynkPayment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("lynk_payments")
      .select("*")
      .order("created_at", { ascending: false });
    setPayments((data ?? []) as LynkPayment[]);
    setLoading(false);
  };

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  if (!isMounted) return null;

  const handleDelete = async (id: string) => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from("lynk_payments").delete().eq("id", id);
    setDeleting(false);
    setDeleteTarget(null);
    if (error) {
      alert("Gagal menghapus transaksi: " + error.message);
    } else {
      fetchData();
    }
  };

  // Convert UTC timestamp to local YYYY-MM-DD string
  const getLocalYYYYMMDD = (utcString: string) => {
    const d = new Date(utcString);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Apply date filter
  const filteredPayments = dateFilter
    ? payments.filter((p) => getLocalYYYYMMDD(p.created_at) === dateFilter)
    : payments;

  // Build daily chart data
  const dailyMap: Record<string, { payments: number; revenue: number }> = {};
  for (const p of filteredPayments) {
    const dayStr = getLocalYYYYMMDD(p.created_at);
    const shortDay = dayStr.slice(5); // MM-DD for the chart
    if (!dailyMap[shortDay]) dailyMap[shortDay] = { payments: 0, revenue: 0 };
    dailyMap[shortDay].payments++;
    dailyMap[shortDay].revenue += Number(p.grand_total);
  }
  const dailyData = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, v]) => ({ day, ...v }));

  const withVoucher    = filteredPayments.filter(p => p.voucher_code);
  const withoutVoucher = filteredPayments.filter(p => !p.voucher_code);
  const voucherData = [
    { name: "Full Price", value: withoutVoucher.length, color: "#60a5fa" },
    { name: "With Voucher", value: withVoucher.length, color: "#0f172a" },
  ];

  const totalRevenue     = filteredPayments.reduce((s, p) => s + Number(p.grand_total), 0);
  const discountGiven    = filteredPayments.reduce((s, p) => s + Number(p.discount ?? 0), 0);

  const columns = [
    {
      header: "Customer", accessorKey: "customer_name",
      cell: (r: any) => (
        <div>
          <p className="text-sm font-medium text-foreground/90">{r.customer_name || "—"}</p>
          <p className="text-xs text-foreground/40">{r.customer_email}</p>
          {r.customer_phone && <p className="text-xs text-foreground/30">{r.customer_phone}</p>}
        </div>
      ),
    },
    {
      header: "Grand Total", accessorKey: "grand_total",
      cell: (r: any) => <span className="font-bold text-foreground">{formatIDR(r.grand_total)}</span>,
    },
    {
      header: "Price / Disc", accessorKey: "total_price",
      cell: (r: any) => (
        <div className="text-xs">
          <p className="text-foreground/70">{formatIDR(r.total_price)}</p>
          {r.discount > 0 && <p className="text-destructive">-{formatIDR(r.discount)}</p>}
        </div>
      ),
    },
    {
      header: "Voucher", accessorKey: "voucher_code",
      cell: (r: any) => r.voucher_code
        ? <span className="text-xs font-mono px-2 py-1 rounded-lg text-foreground/80"
            style={{ background: "rgba(209,143,235,0.1)", border: "1px solid rgba(209,143,235,0.22)" }}>
            {r.voucher_code}
          </span>
        : <span className="text-foreground/25 text-xs">—</span>,
    },
    {
      header: "Date", accessorKey: "created_at",
      cell: (r: any) => <span className="text-xs text-foreground/40">{fmtDate(r.created_at)}</span>,
    },
    {
      header: "Action", accessorKey: "id",
      cell: (r: any) => (
        <button 
          onClick={() => setDeleteTarget(r)}
          className="p-1.5 text-destructive/50 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          title="Hapus Transaksi"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setDeleteTarget(null)}
            />
            {/* Modal Card */}
            <motion.div
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10"
              style={{ border: "1px solid rgba(96,165,250,0.2)" }}
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <button
                onClick={() => setDeleteTarget(null)}
                className="absolute top-4 right-4 text-foreground/30 hover:text-foreground/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-3 mb-5">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.08)" }}>
                  <AlertTriangle className="w-4.5 h-4.5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">Hapus Transaksi</h3>
                  <p className="text-xs text-foreground/50 mt-0.5">Tindakan ini tidak dapat dibatalkan.</p>
                </div>
              </div>

              {/* Transaction summary */}
              <div className="rounded-xl p-3 mb-5 space-y-1" style={{ background: "#f8fafc", border: "1px solid rgba(96,165,250,0.12)" }}>
                <p className="text-xs font-medium text-foreground/80">{deleteTarget.customer_name || "Unknown"}</p>
                <p className="text-[11px] text-foreground/40">{deleteTarget.customer_email}</p>
                <p className="text-xs font-bold text-foreground mt-1.5">{formatIDR(deleteTarget.grand_total)}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
                  style={{ background: "#f1f5f9", border: "1px solid rgba(0,0,0,0.06)" }}
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDelete(deleteTarget.id)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
                  style={{ background: "#ef4444" }}
                >
                  {deleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  {deleting ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary pills */}
      <motion.div {...fadeUp(0.05)} className="flex flex-wrap gap-3">
        {[
          { label: "Total Payments",  value: filteredPayments.length,          color: "#60a5fa", bg: "rgba(96,165,250,0.08)",  border: "rgba(96,165,250,0.2)" },
          { label: "Total Revenue",   value: formatIDR(totalRevenue),  color: "#10b981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.2)"  },
          { label: "With Voucher",    value: withVoucher.length,        color: "#0f172a", bg: "rgba(15,23,42,0.05)",   border: "rgba(15,23,42,0.1)"    },
          { label: "Discount Given",  value: formatIDR(discountGiven), color: "#ef4444", bg: "rgba(239,68,68,0.07)",  border: "rgba(239,68,68,0.18)"  },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm"
            style={{ background: s.bg, border: `1px solid ${s.border}` }}>
            <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            <span className="text-foreground/60">{s.label}</span>
            <span className="font-bold" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div {...fadeUp(0.1)} className="lg:col-span-2 glass-panel rounded-2xl p-5">
          <h3 className="font-semibold text-foreground mb-1">Daily Revenue & Payments</h3>
          <p className="text-xs text-foreground/40 mb-4">Semua transaksi Lynk.id berdasarkan hari</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dailyData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="tRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#60a5fa" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#93c5fd" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 2" stroke="rgba(96,165,250,0.12)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "rgba(15,23,42,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(15,23,42,0.35)", fontSize: 9 }} axisLine={false} tickLine={false} width={48} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(96,165,250,0.06)" }} />
              <Bar dataKey="revenue" name="revenue" fill="url(#tRevGrad)" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div {...fadeUp(0.15)} className="glass-panel rounded-2xl p-5">
          <h3 className="font-semibold text-foreground mb-1">Voucher vs Full Price</h3>
          <p className="text-xs text-foreground/40 mb-3">Breakdown penggunaan voucher</p>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={voucherData} cx="50%" cy="50%" innerRadius={36} outerRadius={54} dataKey="value" paddingAngle={4} strokeWidth={0}>
                {voucherData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {voucherData.map(m => (
            <div key={m.name} className="flex items-center justify-between text-xs mt-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                <span className="text-foreground/60">{m.name}</span>
              </div>
              <span className="font-semibold text-foreground/80">{m.value}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Table */}
      <motion.div {...fadeUp(0.2)} className="glass-panel rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3">
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-primary" /> All Transactions
            </h3>
            <p className="text-xs text-foreground/40 mt-0.5">{filteredPayments.length} transaksi · {dateFilter ? `Tanggal ${dateFilter}` : "Semua waktu"}</p>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm text-foreground bg-transparent outline-none transition-colors"
              style={{ border: "1px solid rgba(96,165,250,0.3)" }}
            />
            {dateFilter && (
              <button onClick={() => setDateFilter("")} className="text-xs text-foreground/50 hover:text-foreground">
                Clear
              </button>
            )}
            <button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
              style={{ background: "rgba(96,165,250,0.07)", border: "1px solid rgba(96,165,250,0.2)" }}>
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-foreground/40 gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-primary" /> Loading…
          </div>
        ) : (
          <DataTable columns={columns} data={filteredPayments} />
        )}
      </motion.div>
    </div>
  );
}
