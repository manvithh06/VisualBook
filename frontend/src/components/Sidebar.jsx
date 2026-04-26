import { useState } from "react";
import toast from "react-hot-toast";
import { downloadPDFReport } from "../utils/downloadReport";


const PLOT_ICONS = {
  histogram:       "📊",
  bar:             "📶",
  pie:             "🥧",
  scatter:         "⚡",
  box:             "📦",
  violin:          "🎻",
  heatmap:         "🌡️",
  "3d_scatter":    "🔮",
  line:            "📈",
  area:            "🏔️",
  bubble:          "🫧",
  pairplot:        "🔢",
  treemap:         "🗺️",
  missing_heatmap: "❓",
};

export default function Sidebar({ summary, plots, activeId, onSelect }) {
  const [collapsed, setCollapsed] = useState(false);

  const scrollToPlot = (plotId) => {
    const el = document.getElementById(`anchor-${plotId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    onSelect?.(plotId);
  };

 

// Replace handleDownloadAll with:
const handleDownloadAll = async () => {
  toast.loading("Building PDF report…", { id: "pdf" });
  try {
    await downloadPDFReport(plots, summary);
    toast.success("PDF downloaded!", { id: "pdf" });
  } catch (e) {
    toast.error("PDF generation failed", { id: "pdf" });
    console.error(e);
  }
};

  return (
    <aside
      className={`
        fixed top-14 left-0 h-[calc(100vh-3.5rem)] bg-[#111111] border-r border-white/10
        flex flex-col transition-all duration-300 z-30
        ${collapsed ? "w-14" : "w-64"}
      `}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-5 w-6 h-6 rounded-full bg-[#1a1a1a] border border-white/20
                   flex items-center justify-center text-slate-400 hover:text-white
                   hover:border-accent/50 transition-all z-10"
      >
        <svg
          className={`w-3 h-3 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Dataset info */}
      {!collapsed && (
        <div className="px-4 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded bg-accent/20 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-white text-xs font-semibold truncate">{summary.filename}</p>
          </div>
          <div className="flex gap-3 text-xs text-slate-500">
            <span>{summary.rows?.toLocaleString()} rows</span>
            <span>·</span>
            <span>{summary.columns} cols</span>
          </div>
          <div className="mt-2 flex gap-1.5">
            <span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {summary.numeric_count} numeric
            </span>
            <span className="px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-400 border border-green-500/20">
              {summary.categorical_count} cat
            </span>
          </div>
        </div>
      )}

      {/* Plots nav list */}
      <div className="flex-1 overflow-y-auto py-2">
        {collapsed ? (
          // Icon-only mode
          <div className="flex flex-col items-center gap-1 px-1 pt-2">
            {plots.map((p) => (
              <button
                key={p.plot_id}
                onClick={() => scrollToPlot(p.plot_id)}
                title={p.title}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-base
                            transition-all hover:bg-white/10
                            ${activeId === p.plot_id ? "bg-accent/20 text-accent-light" : "text-slate-500"}`}
              >
                {PLOT_ICONS[p.plot_type] || "📊"}
              </button>
            ))}
          </div>
        ) : (
          // Full list mode
          <div className="px-2">
            <p className="text-slate-600 text-[10px] uppercase tracking-widest px-2 mb-2 mt-1">
              {plots.length} Plots
            </p>
            {plots.map((p) => (
              <button
                key={p.plot_id}
                onClick={() => scrollToPlot(p.plot_id)}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left
                  transition-all duration-150 group mb-0.5
                  ${activeId === p.plot_id
                    ? "bg-accent/15 border border-accent/30 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                  }
                `}
              >
                <span className="text-base shrink-0">{PLOT_ICONS[p.plot_type] || "📊"}</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate leading-tight">{p.title}</p>
                  <p className="text-[10px] text-slate-600 group-hover:text-slate-500 mt-0.5">
                    {p.plot_type.replace("_", " ")}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Download all button */}
      {!collapsed && (
        <div className="p-3 border-t border-white/10 shrink-0">
          <button
            onClick={handleDownloadAll}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
                       bg-accent/10 border border-accent/30 text-accent-light text-xs font-medium
                       hover:bg-accent/20 hover:border-accent/50 transition-all duration-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF Report
          </button>
        </div>
      )}
    </aside>
  );
}