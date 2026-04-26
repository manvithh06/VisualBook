import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useData } from "../context/DataContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const LOADING_STEPS = [
  "Reading CSV...",
  "Analyzing columns...",
  "Computing correlations...",
  "Building plots...",
  "Almost done...",
];

const MAX_SIZE_MB = 50;

export default function UploadZone() {
  const navigate  = useNavigate();
  const inputRef  = useRef(null);
  const intervalRef = useRef(null);

  const {
    setAnalysisResult,
    setIsLoading,
    isLoading,
    setLoadingStep,
    loadingStep,
    setFilename,
  } = useData();

  const [dragOver, setDragOver]     = useState(false);
  const [selected, setSelected]     = useState(null); // { name, size }
  const [stepIndex, setStepIndex]   = useState(0);
  const [progress, setProgress]     = useState(0);

  // ── File validation ────────────────────────────────────────
  const validateFile = (file) => {
    if (!file.name.endsWith(".csv")) {
      toast.error("Only .csv files are accepted.");
      return false;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File too large. Max size is ${MAX_SIZE_MB}MB.`);
      return false;
    }
    return true;
  };

  const handleFileSelect = useCallback((file) => {
    if (!file || !validateFile(file)) return;
    setSelected({ name: file.name, size: (file.size / 1024).toFixed(1) });
  }, []);

  // ── Drag events ────────────────────────────────────────────
  const onDragOver  = (e) => { e.preventDefault(); setDragOver(true);  };
  const onDragLeave = ()  => setDragOver(false);
  const onDrop      = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };
  const onInputChange = (e) => handleFileSelect(e.target.files[0]);

  // ── Upload & analyze ───────────────────────────────────────
  const handleAnalyze = async () => {
    if (!selected) return;
    const file = inputRef.current.files[0];
    if (!file) { toast.error("Please select a file first."); return; }

    setIsLoading(true);
    setStepIndex(0);
    setProgress(0);

    // Animate loading steps
    let idx = 0;
    setLoadingStep(LOADING_STEPS[0]);
    intervalRef.current = setInterval(() => {
      idx = Math.min(idx + 1, LOADING_STEPS.length - 1);
      setStepIndex(idx);
      setLoadingStep(LOADING_STEPS[idx]);
      setProgress(Math.min((idx / (LOADING_STEPS.length - 1)) * 85, 85));
    }, 900);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await axios.post(`${API_URL}/api/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearInterval(intervalRef.current);
      setProgress(100);
      setLoadingStep("Done!");
      setFilename(file.name);
      setAnalysisResult(data);

      setTimeout(() => {
        setIsLoading(false);
        navigate("/dashboard");
      }, 500);

    } catch (err) {
      clearInterval(intervalRef.current);
      setIsLoading(false);
      setProgress(0);
      const msg = err.response?.data?.detail || "Server error. Is the backend running?";
      toast.error(msg);
    }
  };

  // ── Render ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-md animate-fade-in">
        {/* Step label */}
        <p className="text-accent-light font-medium text-lg tracking-wide">
          {loadingStep}
        </p>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent to-purple-400 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step dots */}
        <div className="flex gap-2">
          {LOADING_STEPS.map((s, i) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i <= stepIndex ? "bg-accent scale-125" : "bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* Skeleton cards */}
        <div className="w-full grid grid-cols-2 gap-3 mt-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-lg animate-slide-up">
      {/* Drop Zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          w-full rounded-2xl border-2 border-dashed cursor-pointer
          flex flex-col items-center justify-center gap-4 py-12 px-8
          transition-all duration-300 group
          ${dragOver
            ? "border-accent bg-accent/10 scale-[1.02]"
            : selected
              ? "border-accent/60 bg-accent/5"
              : "border-white/20 bg-white/[0.02] hover:border-accent/40 hover:bg-white/[0.04]"
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={onInputChange}
        />

        {/* Icon */}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
                         ${selected ? "bg-accent/20" : "bg-white/5 group-hover:bg-accent/10"}`}>
          {selected ? (
            <svg className="w-8 h-8 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-slate-400 group-hover:text-accent-light transition-colors"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0
                       0l-3 3m3-3v12" />
            </svg>
          )}
        </div>

        {/* Text */}
        {selected ? (
          <div className="text-center">
            <p className="text-white font-semibold text-lg">{selected.name}</p>
            <p className="text-slate-400 text-sm mt-1">{selected.size} KB · Ready to analyze</p>
            <p className="text-accent-light text-xs mt-2">Click to change file</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-white font-medium text-base">
              Drop your CSV file here
            </p>
            <p className="text-slate-400 text-sm mt-1">or click to browse</p>
            <p className="text-slate-600 text-xs mt-3">Max 50MB · .csv only</p>
          </div>
        )}
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={!selected}
        className={`
          w-full py-3.5 rounded-xl font-semibold text-base tracking-wide
          flex items-center justify-center gap-2 transition-all duration-300
          ${selected
            ? "bg-gradient-to-r from-accent to-purple-500 text-white hover:opacity-90 hover:scale-[1.02] shadow-lg shadow-accent/25"
            : "bg-white/5 text-slate-600 cursor-not-allowed"
          }
        `}
      >
        Analyze Dataset
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>
    </div>
  );
}