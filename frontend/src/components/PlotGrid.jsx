import PlotCard from "./PlotCard";

const PLOT_ICONS = {
  histogram:      "📊",
  bar:            "📶",
  pie:            "🥧",
  scatter:        "⚡",
  box:            "📦",
  violin:         "🎻",
  heatmap:        "🌡️",
  "3d_scatter":   "🔮",
  line:           "📈",
  area:           "🏔️",
  bubble:         "🫧",
  pairplot:       "🔢",
  treemap:        "🗺️",
  missing_heatmap:"❓",
};

export default function PlotGrid({ plots }) {
  if (!plots || plots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0
                     002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002
                     2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0
                     01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-slate-500 font-medium">No plots generated</p>
        <p className="text-slate-700 text-sm mt-1">Try uploading a richer dataset</p>
      </div>
    );
  }

  return (
    <div>
      {/* Plot count header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-white font-semibold text-lg">
          Generated Visualizations
          <span className="ml-2 text-accent-light text-base font-normal">
            ({plots.length})
          </span>
        </h2>
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          {[...new Set(plots.map((p) => p.plot_type))].slice(0, 5).map((t) => (
            <span key={t} className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
              {PLOT_ICONS[t] || "📊"} {t.replace("_", " ")}
            </span>
          ))}
          {[...new Set(plots.map((p) => p.plot_type))].length > 5 && (
            <span className="text-slate-600">
              +{[...new Set(plots.map((p) => p.plot_type))].length - 5} more
            </span>
          )}
        </div>
      </div>

      {/* Responsive 2-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {plots.map((plot) => (
          <div key={plot.plot_id} id={`anchor-${plot.plot_id}`}>
            <PlotCard plot={plot} />
          </div>
        ))}
      </div>
    </div>
  );
}