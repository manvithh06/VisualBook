import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { useData } from "../context/DataContext";
import toast from "react-hot-toast";

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { reset, analysisResult } = useData();
  const { user }  = useAuth();
  const isDashboard = location.pathname === "/dashboard";

  const handleNew = () => { reset(); navigate("/"); };

  const handleLogout = async () => {
    await signOut(auth);
    reset();
    toast.success("Signed out");
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6
                    border-b border-white/10 bg-[#0f0f0f]/80 backdrop-blur-md">
      {/* Logo */}
      <button
        onClick={handleNew}
        className="flex items-center gap-2 group"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-purple-400
                        flex items-center justify-center text-white font-bold text-sm">
          V
        </div>
        <span className="font-semibold text-white tracking-tight">
          Visual<span className="text-accent-light">Book</span>
        </span>
      </button>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {isDashboard && analysisResult && (
          <button
            onClick={handleNew}
            className="flex items-center gap-2 text-sm px-4 py-1.5 rounded-lg
                       border border-white/10 text-slate-300 hover:text-white
                       hover:border-accent/50 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Dataset
          </button>
        )}

        {/* User avatar + logout */}
        {user && (
  <div className="flex items-center gap-2">
    {user.photoURL ? (
      <img
        src={user.photoURL}
        referrerPolicy="no-referrer"
        onError={(e) => {
          e.target.style.display = "none";
          e.target.nextSibling.style.display = "flex";
        }}
        className="w-7 h-7 rounded-full border border-white/20"
      />
    ) : null}
    <div
      style={{ display: user.photoURL ? "none" : "flex" }}
      className="w-7 h-7 rounded-full bg-accent/30 items-center justify-center
                 text-accent-light text-xs font-bold border border-accent/30"
    >
      {user.email?.[0]?.toUpperCase() || "U"}
    </div>
    <button
      onClick={handleLogout}
      title="Sign out"
      className="text-slate-500 hover:text-red-400 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0
                 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    </button>
  </div>
)}
      </div>
    </nav>
  );
}