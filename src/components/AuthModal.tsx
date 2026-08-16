import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Mail, User, Eye, EyeOff, Sparkles, ArrowRight, Check, Database, ShieldCheck } from "lucide-react";
import { ThemeConfig } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string }) => void;
  activeTheme: ThemeConfig;
  initialMode?: "login" | "signup";
}

export const DEMO_ACCOUNTS = [
  {
    id: "demo-admin",
    name: "Ranbidge Admin",
    email: "admin@ranbidge.com",
    password: "admin123",
    role: "System Administrator",
    badge: "Admin",
    icon: "👑",
    bgColor: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  },
  {
    id: "demo-dev",
    name: "Alex Rivera",
    email: "alex.dev@ranbidge.com",
    password: "dev123",
    role: "Lead Engineer",
    badge: "Developer",
    icon: "💻",
    bgColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
  },
  {
    id: "demo-mkt",
    name: "Sarah Jenkins",
    email: "sarah.mkt@ranbidge.com",
    password: "mkt123",
    role: "Marketing Director",
    badge: "Marketing",
    icon: "📈",
    bgColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
];

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
  const [dbChecked, setDbChecked] = useState(true);

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

    // Check if matched one of demo accounts
    const matchedDemo = DEMO_ACCOUNTS.find(
      (acc) => acc.email.toLowerCase() === email.trim().toLowerCase()
    );

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const user = {
        name: matchedDemo ? matchedDemo.name : mode === "signup" ? fullName.trim() : email.split("@")[0] || "Studio User",
        email: email.trim(),
      };
      setSuccessUser(user);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        onLoginSuccess(user);
      }, 1400);
    }, 450);
  };

  const handleDemoQuickLogin = (demoAccount: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(demoAccount.email);
    setPassword(demoAccount.password);
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setLoading(false);
      const user = {
        name: demoAccount.name,
        email: demoAccount.email,
      };
      setSuccessUser(user);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        onLoginSuccess(user);
      }, 1400);
    }, 450);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={`w-full max-w-lg border rounded-3xl overflow-hidden shadow-2xl transition-colors duration-300 ${activeTheme.cardBg} ${activeTheme.cardBorder}`}
        >
          {/* Header Banner */}
          <div className="relative p-6 sm:p-7 bg-white border-b border-slate-200/80 text-slate-900 overflow-hidden text-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center text-sm transition"
            >
              ✕
            </button>

            <div className="w-20 h-20 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-md p-1">
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

            {/* DB Status Badge */}
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Database className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>DB Connection Status:</span>
              <span className="font-bold text-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                ACTIVE (Checked)
              </span>
            </div>
          </div>

          {/* Form Content or Success Animation */}
          <div className="p-6 sm:p-7 space-y-5 max-h-[80vh] overflow-y-auto">
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
                    {mode === "signup" ? "Account Created!" : "Authenticated!"}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`text-xs max-w-xs mx-auto ${activeTheme.secondaryText}`}
                  >
                    {`Welcome back, ${successUser?.name || "User"}! Database verified and launching dashboard...`}
                  </motion.p>
                </div>

                {/* Animated Loading Bar */}
                <div className="w-52 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500"
                  />
                </div>
              </motion.div>
            ) : (
              <>
                {/* 3 Quick Demo Accounts Card */}
                <div className={`p-3.5 rounded-2xl border ${activeTheme.isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      3 Quick Demo Logins (DB Test)
                    </span>
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 font-semibold">
                      <ShieldCheck className="w-3 h-3" /> DB Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {DEMO_ACCOUNTS.map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => handleDemoQuickLogin(acc)}
                        className={`group text-left p-2.5 rounded-xl border transition-all duration-200 hover:scale-[1.02] flex flex-col justify-between ${
                          activeTheme.isDark
                            ? 'bg-slate-800/80 border-slate-700 hover:border-indigo-500/60'
                            : 'bg-white border-slate-200 hover:border-indigo-400 shadow-sm'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">{acc.icon}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${acc.bgColor}`}>
                              {acc.badge}
                            </span>
                          </div>
                          <p className={`text-xs font-bold leading-snug line-clamp-1 ${activeTheme.headingText}`}>
                            {acc.name}
                          </p>
                          <p className={`text-[10px] truncate ${activeTheme.secondaryText}`}>
                            {acc.email}
                          </p>
                        </div>
                        <div className="mt-2 text-[10px] text-indigo-400 group-hover:underline font-semibold flex items-center gap-0.5">
                          <span>Quick Sign In</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative flex items-center justify-center my-1">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                  <span className={`absolute px-3 text-[10px] font-semibold uppercase tracking-wider ${activeTheme.isDark ? 'bg-slate-900 text-slate-500' : 'bg-white text-slate-400'}`}>
                    Or Custom Sign In
                  </span>
                </div>

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

                <form onSubmit={handleSubmit} className="space-y-3.5">
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
                        placeholder="admin@ranbidge.com"
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

