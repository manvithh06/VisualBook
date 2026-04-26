import { useState } from "react";

const TYPE_COLORS = {
  numeric:         "bg-blue-500/20 text-blue-300 border-blue-500/30",
  categorical:     "bg-green-500/20 text-green-300 border-green-500/30",
  datetime:        "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  boolean:         "bg-orange-500/20 text-orange-300 border-orange-500/30",
  high_cardinality:"bg-red-500/20 text-red-300 border-red-500/30",
};

function MetricCard({ label, value, sub, icon }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-[#1a1a1a] border border-white/10
                    hover:border-accent/30 transition-all duration-200">
      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent-light shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-slate-400 text-xs mt-0.5">{label}</p>
        {sub && <p className="text-slate-600 text-xs">{sub}</p>}
      </div>
    </div>
  );
}

export default function DatasetSummary({ summary }) {
  const [expanded, setExpanded] = useState(false);

  const totalMissing = Object.values(summary.missing_summary || {})
    .reduce((acc, v) => acc + v.count, 0);

  const metrics = [
    {
      label: "Total Rows",
      value: summary.rows?.toLocaleString(),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
    },
    {
      label: "Total Columns",
      value: summary.columns,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0
                   012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0
                   012 2m0 0v10m0-10a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2" />
        </svg>
      ),
    },
    {
      label: "Numeric Columns",
      value: summary.numeric_count,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1
                   1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
    },
    {
      label: "Categorical Columns",
      value: summary.categorical_count,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7
                   7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
    {
      label: "Missing Values",
      value: totalMissing.toLocaleString(),
      sub: `${summary.total_missing_pct}% of dataset`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667
                   1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34
                   16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mb-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      {/* Collapsible Column Details */}
      <div className="rounded-xl border border-white/10 bg-[#1a1a1a] overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-5 py-3.5
                     hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 7h16M4 12h16M4 17h7" />
            </svg>
            <span className="text-white font-medium text-sm">Column Details</span>
            <span className="text-slate-500 text-xs">({summary.column_info?.length} columns)</span>
          </div>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expanded && (
          <div className="overflow-x-auto border-t border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.03]">
                  {["Column", "Type", "Unique", "Missing", "Missing %", "Stat"].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-slate-400 font-medium text-xs uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summary.column_info?.map((col, i) => (
                  <tr
                    key={col.name}
                    className={`border-t border-white/5 hover:bg-white/[0.02] transition-colors ${
                      i % 2 === 0 ? "" : "bg-white/[0.01]"
                    }`}
                  >
                    <td className="px-4 py-2.5 text-white font-medium">{col.name}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${TYPE_COLORS[col.type] || "bg-slate-500/20 text-slate-300"}`}>
                        {col.type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-300">{col.unique_count}</td>
                    <td className="px-4 py-2.5 text-slate-300">{col.missing_count}</td>
                    <td className="px-4 py-2.5">
                      <span className={col.missing_pct > 10 ? "text-red-400" : "text-slate-400"}>
                        {col.missing_pct}%
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-400 text-xs">
                      {col.mean !== undefined
                        ? `mean: ${typeof col.mean === "number" ? col.mean.toFixed(2) : col.mean}`
                        : col.top_value
                          ? `top: ${col.top_value}`
                          : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}