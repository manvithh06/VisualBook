import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Login() {
  const navigate          = useNavigate();
  const [isSignup, setIsSignup]   = useState(false);
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [showPass, setShowPass]   = useState(false);

  // ── Save user to MongoDB via backend ────────────────────────
  const saveUserToDB = async (user) => {
    try {
      await axios.post(`${API_URL}/api/users/login`, {
        uid:          user.uid,
        email:        user.email        || "",
        display_name: user.displayName  || "",
        photo_url:    user.photoURL     || "",
        provider:     user.providerData[0]?.providerId || "email",
      });
    } catch (e) {
      console.warn("Could not save user to DB:", e.message);
    }
  };

  // ── Google Sign In ───────────────────────────────────────────
  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await saveUserToDB(result.user);
      toast.success(`Welcome, ${result.user.displayName || "User"}!`);
      navigate("/");
    } catch (e) {
      toast.error(e.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Email Auth ───────────────────────────────────────────────
  const handleEmailAuth = async () => {
    if (!email || !password) { toast.error("Please fill in all fields"); return; }
    if (password.length < 6)  { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      let result;
      if (isSignup) {
        result = await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Account created! Welcome to VisualBook 🎉");
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
        toast.success("Welcome back!");
      }
      await saveUserToDB(result.user);
      navigate("/");
    } catch (e) {
      const msg = e.code === "auth/user-not-found"    ? "No account found with this email."
                : e.code === "auth/wrong-password"    ? "Incorrect password."
                : e.code === "auth/email-already-in-use" ? "Email already registered. Sign in instead."
                : e.code === "auth/invalid-email"     ? "Invalid email address."
                : e.message;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96
                        bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-slide-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-purple-400
                          flex items-center justify-center text-white font-bold text-2xl
                          mx-auto mb-4 shadow-lg shadow-accent/30">
            V
          </div>
          <h1 className="text-white text-3xl font-bold tracking-tight">
            Visual<span className="text-accent-light">Book</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            {isSignup ? "Create your account to get started" : "Sign in to start analyzing your data"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-8 shadow-2xl">

          {/* Google Button */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl
                       border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20
                       text-white font-medium transition-all duration-200 disabled:opacity-50"
          >
            {/* Google SVG icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-slate-500 text-xs uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Email + Password fields */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10
                           text-white placeholder-slate-600 text-sm outline-none
                           focus:border-accent/60 focus:bg-white/[0.07] transition-all"
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10
                             text-white placeholder-slate-600 text-sm outline-none pr-12
                             focus:border-accent/60 focus:bg-white/[0.07] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPass
                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478
                                 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3
                                 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532
                                 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0
                                 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943
                                 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                  }
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleEmailAuth}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-accent to-purple-500
                         text-white font-semibold hover:opacity-90 active:scale-[0.98]
                         transition-all duration-200 disabled:opacity-50 mt-2
                         shadow-lg shadow-accent/20"
            >
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Please wait...
                  </span>
                : isSignup ? "Create Account" : "Sign In"
              }
            </button>
          </div>

          {/* Toggle signup/signin */}
          <p className="text-center text-slate-500 text-sm mt-6">
            {isSignup ? "Already have an account? " : "Don't have an account? "}
            <button
              onClick={() => { setIsSignup(!isSignup); setEmail(""); setPassword(""); }}
              className="text-accent-light hover:text-white transition-colors font-medium"
            >
              {isSignup ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-700 text-xs mt-6">
          VisualBook · Your data never leaves your machine
        </p>
      </div>
    </div>
  );
}