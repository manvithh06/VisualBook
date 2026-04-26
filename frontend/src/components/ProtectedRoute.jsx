import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent
                          rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}