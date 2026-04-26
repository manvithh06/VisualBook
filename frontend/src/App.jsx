import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { DataProvider } from "./context/DataContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home      from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login     from "./pages/Login";

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a1a1a",
              color: "#e2e8f0",
              border: "1px solid rgba(255,255,255,0.1)",
              fontFamily: "Inter, sans-serif",
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#1a1a1a" },
            },
            success: {
              iconTheme: { primary: "#7c3aed", secondary: "#1a1a1a" },
            },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route path="/" element={
            <ProtectedRoute><Home /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}