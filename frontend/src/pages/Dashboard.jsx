import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import DatasetSummary from "../components/DatasetSummary";
import PlotGrid from "../components/PlotGrid";

export default function Dashboard() {
  const { analysisResult } = useData();
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(null);

  // Redirect if no data
  useEffect(() => {
    if (!analysisResult) navigate("/");
  }, [analysisResult, navigate]);

  // Track which card is in view via scroll
  useEffect(() => {
    if (!analysisResult) return;
    const plots = analysisResult.plots;

    const observers = plots.map((p) => {
      const el = document.getElementById(`anchor-${p.plot_id}`);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(p.plot_id); },
        { threshold: 0.5 }
      );
      obs.observe(el);
      return obs;
    });

    return () => observers.forEach((o) => o?.disconnect());
  }, [analysisResult]);

  if (!analysisResult) return null;

  const { summary, plots } = analysisResult;

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar />

      {/* Sidebar */}
      <Sidebar
        summary={summary}
        plots={plots}
        activeId={activeId}
        onSelect={setActiveId}
      />

      {/* Main content — offset by sidebar width (w-64 = 16rem) */}
      <main className="pt-14 ml-64 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* Page header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-accent-light text-xs font-medium uppercase tracking-widest">
                Analysis Complete
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              {summary.filename}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {summary.rows?.toLocaleString()} rows · {summary.columns} columns ·{" "}
              {plots.length} visualizations generated
            </p>
          </div>

          {/* Dataset Summary Cards + Column Table */}
          <DatasetSummary summary={summary} />

          {/* Plot Grid */}
          <PlotGrid plots={plots} />

        </div>
      </main>
    </div>
  );
}