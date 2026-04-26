import Navbar from "../components/Navbar";
import UploadZone from "../components/UploadZone";

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: "Smart Type Inference",
    desc: "Auto-detects numeric, categorical, datetime & boolean columns",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
    label: "14 Chart Types",
    desc: "From histograms to 3D scatters — chosen automatically",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    label: "Instant Results",
    desc: "Full correlation matrix, outlier detection & descriptive stats",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col">
      <Navbar />

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-12">
        {/* Badge */}
        <div className="mb-6 px-3 py-1 rounded-full border border-accent/30 bg-accent/10
                        text-accent-light text-xs font-medium tracking-widest uppercase
                        animate-fade-in">
          CSV Analytics Platform
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl font-bold text-center text-white mb-4
                       leading-tight tracking-tight animate-slide-up">
          Drop any CSV.
          <br />
          <span className="bg-gradient-to-r from-accent to-purple-400 bg-clip-text text-transparent">
            Get instant visual intelligence.
          </span>
        </h1>

        <p className="text-slate-400 text-center text-base sm:text-lg mb-10 max-w-md animate-fade-in">
          VisualBook analyzes your dataset, infers column types, detects relationships,
          and generates the best charts — automatically.
        </p>

        {/* Upload Zone */}
        <UploadZone />

        {/* Feature pills */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 animate-fade-in">
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="flex items-start gap-3 px-4 py-3 rounded-xl
                         bg-white/[0.03] border border-white/10 max-w-[220px]"
            >
              <div className="text-accent-light mt-0.5 shrink-0">{f.icon}</div>
              <div>
                <p className="text-white text-sm font-medium">{f.label}</p>
                <p className="text-slate-500 text-xs mt-0.5 leading-snug">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-slate-700 text-xs border-t border-white/5">
        VisualBook · Built with FastAPI + React + Plotly
      </footer>
    </div>
  );
}