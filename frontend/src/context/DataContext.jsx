import { createContext, useContext, useState } from "react";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [analysisResult, setAnalysisResult] = useState(null); // { summary, plots }
  const [isLoading, setIsLoading]           = useState(false);
  const [loadingStep, setLoadingStep]       = useState("");
  const [error, setError]                   = useState(null);
  const [filename, setFilename]             = useState("");

  const reset = () => {
    setAnalysisResult(null);
    setError(null);
    setFilename("");
    setLoadingStep("");
  };

  return (
    <DataContext.Provider
      value={{
        analysisResult, setAnalysisResult,
        isLoading, setIsLoading,
        loadingStep, setLoadingStep,
        error, setError,
        filename, setFilename,
        reset,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}