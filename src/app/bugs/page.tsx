"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Bug, RefreshCw, ImageIcon, Calendar, AlertTriangle, CheckCircle2 } from "lucide-react";

interface BugReport {
  id: string;
  description: string;
  image_url: string | null;
  created_at: string;
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.42, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

export default function BugReportsPage() {
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BugReport | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bug_reports")
      .select("id, description, image_url, created_at")
      .order("created_at", { ascending: false });
    setReports((data ?? []) as BugReport[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Bug className="w-5 h-5 text-destructive" />
            Bug Reports
          </h2>
          <p className="text-xs text-foreground/40 mt-0.5">
            Laporan bug dari pengguna SnipieAI · {reports.length} laporan
          </p>
        </div>
        <button onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #f43f5e, #f97316)" }}>
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </motion.div>

      {/* Stats bar */}
      <motion.div {...fadeUp(0.05)} className="flex flex-wrap gap-3">
        {[
          { label: "Total Reports",    value: reports.length,                                       color: "#f43f5e", bg: "rgba(244,63,94,0.08)",  border: "rgba(244,63,94,0.2)"  },
          { label: "With Screenshot",  value: reports.filter(r => r.image_url).length,              color: "#d18feb", bg: "rgba(209,143,235,0.08)", border: "rgba(209,143,235,0.2)" },
          { label: "No Screenshot",    value: reports.filter(r => !r.image_url).length,             color: "#f97316", bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.2)"  },
          { label: "This Month",       value: reports.filter(r => r.created_at.startsWith("2026-05")).length, color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)" },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm"
            style={{ background: s.bg, border: `1px solid ${s.border}` }}>
            <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            <span className="text-foreground/60">{s.label}</span>
            <span className="font-bold" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </motion.div>

      {/* Bug Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-foreground/40 gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-destructive" />
          <span className="text-sm">Memuat laporan bug…</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {reports.map((report, i) => (
            <motion.div
              key={report.id}
              {...fadeUp(i * 0.06)}
              onClick={() => setSelected(report)}
              className="glass-panel rounded-2xl overflow-hidden cursor-pointer group"
              whileHover={{ y: -4, boxShadow: "0 8px 32px -8px rgba(244,63,94,0.25)" }}
              transition={{ duration: 0.2 }}
            >
              {/* Screenshot preview */}
              {report.image_url ? (
                <div className="relative h-44 overflow-hidden bg-foreground/5">
                  <img
                    src={report.image_url}
                    alt="Bug screenshot"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] px-2 py-1 rounded-full text-white font-medium"
                      style={{ background: "rgba(209,143,235,0.8)", backdropFilter: "blur(8px)" }}>
                      📷 Screenshot
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-24 flex items-center justify-center"
                  style={{ background: "rgba(244,63,94,0.05)", borderBottom: "1px solid rgba(244,63,94,0.1)" }}>
                  <div className="flex flex-col items-center gap-1 text-foreground/25">
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-xs">No screenshot</span>
                  </div>
                </div>
              )}

              {/* Card content */}
              <div className="p-4">
                <div className="flex items-start gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "rgba(244,63,94,0.1)" }}>
                    <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
                    {report.description}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-foreground/35 mt-3 pt-3"
                  style={{ borderTop: "1px solid rgba(209,143,235,0.12)" }}>
                  <Calendar className="w-3 h-3" />
                  {fmtDate(report.created_at)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(30,16,48,0.6)", backdropFilter: "blur(8px)" }}
          onClick={() => setSelected(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            className="w-full max-w-2xl glass-panel rounded-3xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal image */}
            {selected.image_url && (
              <div className="relative h-72 bg-foreground/5">
                <img
                  src={selected.image_url}
                  alt="Bug screenshot"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Modal content */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(244,63,94,0.1)" }}>
                    <Bug className="w-4 h-4 text-destructive" />
                  </div>
                  <span className="font-semibold text-foreground">Bug Report Detail</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-foreground/40">
                  <Calendar className="w-3.5 h-3.5" />
                  {fmtDate(selected.created_at)}
                </div>
              </div>

              <div className="p-4 rounded-xl text-sm text-foreground/80 leading-relaxed"
                style={{ background: "rgba(244,63,94,0.05)", border: "1px solid rgba(244,63,94,0.12)" }}>
                {selected.description}
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-foreground/40">
                <span className="font-mono">{selected.id}</span>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="mt-5 w-full py-2.5 rounded-xl text-sm font-medium text-foreground/60 transition-colors"
                style={{ background: "rgba(209,143,235,0.1)", border: "1px solid rgba(209,143,235,0.2)" }}>
                Tutup
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
