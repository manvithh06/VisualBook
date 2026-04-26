import { useState, useEffect, useRef } from "react";
import Plot from "react-plotly.js";
import toast from "react-hot-toast";

const PLOT_TYPE_COLORS = {
  histogram:      "bg-blue-500/20 text-blue-300 border-blue-500/30",
  bar:            "bg-green-500/20 text-green-300 border-green-500/30",
  pie:            "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  scatter:        "bg-purple-500/20 text-purple-300 border-purple-500/30",
  box:            "bg-orange-500/20 text-orange-300 border-orange-500/30",
  violin:         "bg-pink-500/20 text-pink-300 border-pink-500/30",
  heatmap:        "bg-red-500/20 text-red-300 border-red-500/30",
  "3d_scatter":   "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  line:           "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  area:           "bg-teal-500/20 text-teal-300 border-teal-500/30",
  bubble:         "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30",
  pairplot:       "bg-rose-500/20 text-rose-300 border-rose-500/30",
  treemap:        "bg-amber-500/20 text-amber-300 border-amber-500/30",
  missing_heatmap:"bg-slate-500/20 text-slate-300 border-slate-500/30",
};

// ── Fullscreen Modal ──────────────────────────────────────────────────────────
function FullscreenModal({ plot, onClose }) {
  const parsed = JSON.parse(plot.plotly_json);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl bg-[#1a1a1a] rounded-2xl border border-white/10
                   overflow-hidden shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium border mb-1
                              ${PLOT_TYPE_COLORS[plot.plot_type] || "bg-slate-500/20 text-slate-300 border-slate-500/30"}`}>
              {plot.plot_type.replace(/_/g, " ")}
            </span>
            <h3 className="text-white font-semibold">{plot.title}</h3>
            <p className="text-slate-400 text-xs mt-0.5 max-w-2xl">{plot.description}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ml-4
                       text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Chart */}
        <div className="p-4 bg-[#111111]">
          <Plot
            data={parsed.data}
            layout={{
              ...parsed.layout,
              autosize: true,
              height: Math.min(window.innerHeight * 0.68, 580),
              paper_bgcolor: "#111111",
              plot_bgcolor:  "#111111",
              font: { color: "#cbd5e1", family: "Inter, sans-serif" },
            }}
            config={{ responsive: true, displayModeBar: true, displaylogo: false }}
            style={{ width: "100%" }}
            useResizeHandler
          />
        </div>
        <div className="px-6 py-2 border-t border-white/5 flex justify-end">
          <span className="text-slate-700 text-xs">Press ESC or click outside to close</span>
        </div>
      </div>
    </div>
  );
}

// ── Icon Button ───────────────────────────────────────────────────────────────
function IconBtn({ onClick, title, active, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150
                  ${active ? "bg-accent/20 text-accent-light" : "text-slate-500 hover:text-white hover:bg-white/10"}`}
    >
      {children}
    </button>
  );
}

// ── PlotCard ──────────────────────────────────────────────────────────────────
export default function PlotCard({ plot }) {
  const [fullscreen, setFullscreen] = useState(false);
  const [visible, setVisible]       = useState(false);
  const [copied, setCopied]         = useState(false);
  const cardRef = useRef(null);

  // Scroll-triggered entrance
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    if (cardRef.current) obs.observe(cardRef.current);
    return () => obs.disconnect();
  }, []);

  const parsed    = JSON.parse(plot.plotly_json);
  const typeColor = PLOT_TYPE_COLORS[plot.plot_type] || "bg-slate-500/20 text-slate-300 border-slate-500/30";

 const handleDownload = () => {
  try {
    const wrap = document.getElementById(`plotwrap-${plot.plot_id}`);
    const svgEl = wrap?.querySelector("svg.main-svg");
    if (!svgEl) { toast.error("Chart not ready"); return; }

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    const canvas = document.createElement("canvas");
    const scale = 2; // retina quality
    canvas.width  = svgEl.clientWidth  * scale;
    canvas.height = svgEl.clientHeight * scale;
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      const a = document.createElement("a");
      a.download = `${plot.plot_id}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
      toast.success("Downloaded!");
    };

    img.onerror = () => {
      // fallback: download as SVG
      const a = document.createElement("a");
      a.download = `${plot.plot_id}.svg`;
      a.href = url;
      a.click();
      toast.success("Downloaded as SVG!");
    };

    img.src = url;
  } catch (e) {
    toast.error("Download failed");
  }
};

  const handleCopyEmbed = () => {
    const snippet =
      `<div id="${plot.plot_id}"></div>\n` +
      `<script src="https://cdn.plot.ly/plotly-latest.min.js"><\/script>\n` +
      `<script>Plotly.newPlot('${plot.plot_id}', ${plot.plotly_json})<\/script>`;
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      toast.success("Embed code copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <div
        ref={cardRef}
        className="flex flex-col rounded-2xl border border-white/10 bg-[#1a1a1a] overflow-hidden
                   hover:border-accent/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/5"
        style={{
          opacity:    visible ? 1 : 0,
          transform:  visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.5s ease, transform 0.5s ease, border-color 0.2s, box-shadow 0.2s",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-2 gap-3">
          <div className="flex-1 min-w-0">
            <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium border mb-1.5 ${typeColor}`}>
              {plot.plot_type.replace(/_/g, " ")}
            </span>
            <h3 className="text-white font-semibold text-sm leading-snug">{plot.title}</h3>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed line-clamp-2">{plot.description}</p>
          </div>

          <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
            {/* Download */}
            <IconBtn onClick={handleDownload} title="Download PNG">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
            </IconBtn>

            {/* Copy embed */}
            <IconBtn onClick={handleCopyEmbed} title="Copy embed code" active={copied}>
              {copied
                ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>
                : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 4h8a2 2 0
                             012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2v-6a2 2 0 012-2z"/>
                  </svg>
              }
            </IconBtn>

            {/* Fullscreen */}
            <IconBtn onClick={() => setFullscreen(true)} title="Expand fullscreen">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11
                         5l-5-5m5 5v-4m0 4h-4"/>
              </svg>
            </IconBtn>
          </div>
        </div>

        <div className="mx-5 border-t border-white/5" />

        {/* Chart */}
        <div id={`plotwrap-${plot.plot_id}`} className="px-2 pb-3 pt-1 flex-1">
          <Plot
            data={parsed.data}
            layout={{
              ...parsed.layout,
              autosize: true,
              height: 300,
              margin: { l: 40, r: 20, t: 30, b: 40 },
              paper_bgcolor: "transparent",
              plot_bgcolor:  "transparent",
              font: { color: "#94a3b8", family: "Inter, sans-serif", size: 11 },
            }}
            config={{ responsive: true, displayModeBar: false, displaylogo: false }}
            style={{ width: "100%" }}
            useResizeHandler
          />
        </div>
      </div>

      {fullscreen && <FullscreenModal plot={plot} onClose={() => setFullscreen(false)} />}
    </>
  );
}