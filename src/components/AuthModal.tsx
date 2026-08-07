import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Mail, User, Eye, EyeOff, Sparkles, ArrowRight, QrCode, Check } from "lucide-react";
import { ThemeConfig } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string }) => void;
  activeTheme: ThemeConfig;
  initialMode?: "login" | "signup";
}

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  activeTheme,
  initialMode = "login",
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successUser, setSuccessUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (mode === "signup" && !fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const user = {
        name: mode === "signup" ? fullName.trim() : email.split("@")[0] || "Studio User",
        email: email.trim(),
      };
      setSuccessUser(user);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        onLoginSuccess(user);
      }, 1600);
    }, 500);
  };

  const handleDemoLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess({
        name: "Demo Account",
        email: "demo@ranbidge.com",
      });
    }, 400);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={`w-full max-w-md border rounded-3xl overflow-hidden shadow-2xl transition-colors duration-300 ${activeTheme.cardBg} ${activeTheme.cardBorder}`}
        >
          {/* Header Banner */}
          <div className="relative p-6 sm:p-8 bg-white border-b border-slate-200/80 text-slate-900 overflow-hidden text-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center text-sm transition"
            >
              ✕
            </button>

            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white border border-slate-200/80 rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-lg p-1">
              <img src="/ranbidge-logo.png" alt="Ranbidge Solutions" className="w-full h-full object-contain" />
            </div>

            <h3 className="text-2xl font-display font-bold tracking-tight text-slate-900">
              {mode === "login" ? "Welcome Back!" : "Create Studio Account"}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto font-medium">
              {mode === "login"
                ? "Sign in to manage your permanent dynamic QR codes & analytics."
                : "Join Ranbidge QR Studio to start generating dynamic trackable links."}
            </p>
          </div>

          {/* Form Content or Success Animation */}
          <div className="p-6 sm:p-8 space-y-6">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 flex flex-col items-center justify-center text-center space-y-5"
              >
                {/* Animated Glowing Success Badge */}
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.25, 1] }}
                    transition={{ duration: 0.5, ease: "backOut" }}
                    className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/30"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, duration: 0.4, type: "spring", stiffness: 200 }}
                    >
                      <Check className="w-10 h-10 text-emerald-500 stroke-[3]" />
                    </motion.div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [-4, 4, -4], opacity: [0.6, 1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-2 -right-2"
                  >
                    <Sparkles className="w-6 h-6 text-amber-400" />
                  </motion.div>
                </div>

                <div className="space-y-2 px-2">
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`text-2xl font-display font-bold ${activeTheme.headingText}`}
                  >
                    {mode === "signup" ? "Account Created!" : "Welcome Back!"}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`text-xs max-w-xs mx-auto ${activeTheme.secondaryText}`}
                  >
                    {mode === "signup"
                      ? `Welcome to Ranbidge QR Studio, ${successUser?.name || "Member"}! Opening dashboard...`
                      : `Authenticated as ${successUser?.name || "Member"}. Launching dashboard...`}
                  </motion.p>
                </div>

                {/* Animated Loading Bar */}
                <div className="w-52 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.4, ease: "easeInOut" }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500"
                  />
                </div>
              </motion.div>
            ) : (
              <>
                {/* Mode Segmented Controls */}
                <div className={`grid grid-cols-2 p-1 rounded-xl border ${activeTheme.isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                  <button
                    type="button"
                    onClick={() => { setMode("login"); setError(null); }}
                    className={`py-2 text-xs font-semibold rounded-lg transition ${
                      mode === "login" ? activeTheme.buttonActive : `${activeTheme.secondaryText} hover:text-slate-200`
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode("signup"); setError(null); }}
                    className={`py-2 text-xs font-semibold rounded-lg transition ${
                      mode === "signup" ? activeTheme.buttonActive : `${activeTheme.secondaryText} hover:text-slate-200`
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl flex items-center gap-2">
                    <span>⚠️ {error}</span>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === "signup" && (
                    <div className="space-y-1.5">
                      <label className={`text-xs font-semibold uppercase tracking-wider ${activeTheme.text}`}>Full Name</label>
                      <div className="relative">
                        <User className={`absolute left-3.5 top-3 w-4 h-4 ${activeTheme.secondaryText}`} />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Jane Doe"
                          className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition border ${activeTheme.inputBg} ${activeTheme.cardBorder} ${activeTheme.headingText}`}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className={`text-xs font-semibold uppercase tracking-wider ${activeTheme.text}`}>Email Address</label>
                    <div className="relative">
                      <Mail className={`absolute left-3.5 top-3 w-4 h-4 ${activeTheme.secondaryText}`} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition border ${activeTheme.inputBg} ${activeTheme.cardBorder} ${activeTheme.headingText}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className={`text-xs font-semibold uppercase tracking-wider ${activeTheme.text}`}>Password</label>
                      {mode === "login" && (
                        <button type="button" className="text-[11px] text-indigo-400 hover:underline">Forgot password?</button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className={`absolute left-3.5 top-3 w-4 h-4 ${activeTheme.secondaryText}`} />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition border ${activeTheme.inputBg} ${activeTheme.cardBorder} ${activeTheme.headingText}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-3.5 top-3 transition-colors ${activeTheme.secondaryText} hover:text-white`}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {mode === "login" ? "Sign In to Studio" : "Create Studio Account"}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
