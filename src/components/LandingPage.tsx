import React, { useState } from "react";
import { motion } from "motion/react";
import {
  QrCode,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Sliders,
  Zap,
  Globe,
  Smartphone,
  Repeat,
  Download,
  CheckCircle2,
  Lock,
  Play,
  CreditCard,
  Phone,
} from "lucide-react";
import { ThemeConfig } from "../types";
import QRPreview from "./QRPreview";

interface LandingPageProps {
  onOpenDashboard: () => void;
  onOpenAuth: (mode?: "login" | "signup") => void;
  activeTheme: ThemeConfig;
}

export default function LandingPage({
  onOpenDashboard,
  onOpenAuth,
  activeTheme,
}: LandingPageProps) {
  const [demoType, setDemoType] = useState<"url" | "payment">("url");
  const [demoUrl, setDemoUrl] = useState("https://ranbidge-solutions-private-limited.onrender.com/");
  const [demoPhone, setDemoPhone] = useState("9876543210");
  const [demoPayee, setDemoPayee] = useState("RANBIDGE Solutions");
  const [demoAmount, setDemoAmount] = useState("100");

  const features = [
    {
      icon: <Repeat className="w-6 h-6 text-indigo-400" />,
      title: "Permanent Dynamic Links",
      description: "Print your QR code once on stickers, menus, brochures, or packaging. Update the destination URL target anytime without reprinting.",
      color: "from-indigo-500/20 to-purple-500/10",
      border: "border-indigo-500/30",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
      title: "Real-time Telemetry & Analytics",
      description: "Monitor scan volumes, device hardware (Mobile vs Desktop), browser engines, operating systems, and traffic referrers in real time.",
      color: "from-emerald-500/20 to-teal-500/10",
      border: "border-emerald-500/30",
    },
    {
      icon: <Sliders className="w-6 h-6 text-purple-400" />,
      title: "Studio Custom Styling & Logos",
      description: "Upload center PNG/JPG branding logos, pick custom palette themes, frame shapes (circle/square/round), and adjust error recovery tolerance.",
      color: "from-purple-500/20 to-pink-500/10",
      border: "border-purple-500/30",
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      title: "Instant Routing & Zero Latency",
      description: "High-speed URL redirection infrastructure routes scanners to your target destination instantly with zero delays.",
      color: "from-amber-500/20 to-orange-500/10",
      border: "border-amber-500/30",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Generate Short Alias",
      description: "Link a custom or random shortcut like /r/menu to your destination link.",
    },
    {
      number: "02",
      title: "Print Anywhere",
      description: "Download styled high-res PNG QRs for menus, business cards, or product labels.",
    },
    {
      number: "03",
      title: "Redirect Target Anytime",
      description: "Swap destination target URLs in your dashboard without touching printed codes.",
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 py-6 sm:py-10">
      {/* --- HERO SECTION --- */}
      <section className="relative text-center space-y-8 max-w-4xl mx-auto px-4">
        {/* Animated Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold tracking-wide shadow-inner"
        >
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Next-Gen Permanent Dynamic QR Code Studio</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className={`text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-display font-extrabold tracking-tight leading-[1.1] ${activeTheme.headingText}`}
        >
          Print QRs Once. <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Change Destination Anytime.
          </span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className={`text-base sm:text-xl ${activeTheme.secondaryText} max-w-2xl mx-auto leading-relaxed`}
        >
          Generate permanent dynamic QR codes with live analytics, custom center logos, and instant target URL redirection by Ranbidge Solutions.
        </motion.p>

        {/* Hero CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
        >
          <button
            onClick={() => onOpenAuth("login")}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
          >
            <span>Launch QR Studio</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onOpenAuth("login")}
            className={`w-full sm:w-auto px-7 py-4 rounded-2xl border font-semibold text-base transition flex items-center justify-center gap-2 ${
              activeTheme.isDark
                ? "bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-200"
                : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800"
            }`}
          >
            <Lock className="w-4 h-4 text-indigo-400" />
            <span>Create Free Account</span>
          </button>
        </motion.div>

        {/* Trust highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className={`pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-medium ${activeTheme.secondaryText}`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>100% Permanent QR Codes</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Real-time Scan Telemetry</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Custom Center Branding</span>
          </div>
        </motion.div>
      </section>

      {/* --- INTERACTIVE LIVE DEMO PREVIEW WIDGET --- */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto px-4"
      >
        <div className={`border rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden transition-colors ${activeTheme.cardBg} ${activeTheme.cardBorder}`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center space-y-2 mb-8">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-semibold">Interactive Sandbox</span>
            <h2 className={`text-2xl sm:text-3xl font-display font-bold ${activeTheme.headingText}`}>
              Try Live QR Generation Right Now
            </h2>
            <p className={`text-xs sm:text-sm ${activeTheme.secondaryText}`}>Select target purpose below and enter a Website URL or Payment Mobile Number to test instant live rendering.</p>
          </div>

          {/* Type Selector Pills */}
          <div className="flex justify-center mb-6">
            <div className={`inline-flex gap-1 p-1 rounded-2xl border ${activeTheme.isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
              <button
                type="button"
                onClick={() => setDemoType("url")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  demoType === "url" ? "bg-indigo-600 text-white shadow-md" : `${activeTheme.secondaryText} hover:text-white`
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Web URL</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoType("payment")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  demoType === "payment" ? "bg-indigo-600 text-white shadow-md" : `${activeTheme.secondaryText} hover:text-white`
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Payment QR (Mobile Number / UPI)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-4">
              {demoType === "url" ? (
                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold uppercase tracking-wider ${activeTheme.text}`}>Target Destination URL</label>
                  <div className="relative">
                    <Globe className={`absolute left-4 top-3.5 w-4 h-4 ${activeTheme.secondaryText}`} />
                    <input
                      type="url"
                      value={demoUrl}
                      onChange={(e) => setDemoUrl(e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className={`w-full rounded-2xl pl-11 pr-4 py-3 text-sm font-mono border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition ${activeTheme.inputBg} ${activeTheme.cardBorder} ${activeTheme.headingText}`}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-4 rounded-2xl border bg-indigo-500/5 border-indigo-500/20">
                  <div className="space-y-1">
                    <label className={`text-xs font-semibold uppercase tracking-wider ${activeTheme.text}`}>Mobile Phone Number or UPI ID</label>
                    <div className="relative">
                      <Phone className={`absolute left-4 top-3.5 w-4 h-4 ${activeTheme.secondaryText}`} />
                      <input
                        type="text"
                        value={demoPhone}
                        onChange={(e) => setDemoPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className={`w-full rounded-xl pl-11 pr-4 py-2.5 text-sm font-mono border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition ${activeTheme.inputBg} ${activeTheme.cardBorder} ${activeTheme.headingText}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className={`text-[10px] font-semibold uppercase ${activeTheme.text}`}>Payee Name</label>
                      <input
                        type="text"
                        value={demoPayee}
                        onChange={(e) => setDemoPayee(e.target.value)}
                        placeholder="Store Name"
                        className={`w-full rounded-lg px-3 py-1.5 text-xs border focus:outline-none ${activeTheme.inputBg} ${activeTheme.cardBorder} ${activeTheme.headingText}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={`text-[10px] font-semibold uppercase ${activeTheme.text}`}>Amount (₹)</label>
                      <input
                        type="number"
                        value={demoAmount}
                        onChange={(e) => setDemoAmount(e.target.value)}
                        placeholder="100"
                        className={`w-full rounded-lg px-3 py-1.5 text-xs border focus:outline-none ${activeTheme.inputBg} ${activeTheme.cardBorder} ${activeTheme.headingText}`}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2 text-xs text-slate-400">
                <p className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dynamic QRs route scanner smartphones to your short link first, letting you change target destination anytime.</span>
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => onOpenAuth("login")}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-indigo-600/20 transition flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  Customize & Download in Studio
                </button>
              </div>
            </div>

            {/* Live QR Preview Box */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl border bg-white/5 border-slate-800">
              <div className="bg-white p-3 rounded-2xl shadow-xl border border-slate-200 aspect-square w-48 h-48 flex items-center justify-center">
                <QRPreview
                  canvasId="landing-demo-canvas"
                  url={
                    demoType === "url"
                      ? demoUrl || "https://ranbidge-solutions-private-limited.onrender.com/"
                      : `upi://pay?pa=${encodeURIComponent(demoPhone.includes("@") ? demoPhone : demoPhone + "@upi")}&pn=${encodeURIComponent(demoPayee)}&am=${encodeURIComponent(demoAmount)}&cu=INR`
                  }
                  className="w-full h-full object-contain"
                />
              </div>
              <span className={`text-[11px] font-mono mt-3 truncate max-w-full px-2 ${activeTheme.secondaryText}`}>
                {demoType === "url"
                  ? demoUrl || "https://ranbidge-solutions-private-limited.onrender.com/"
                  : `upi://pay?pa=${demoPhone.includes("@") ? demoPhone : demoPhone + "@upi"}&pn=${demoPayee}&am=${demoAmount}`}
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* --- FEATURES GRID --- */}
      <section className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className={`text-3xl sm:text-4xl font-display font-bold ${activeTheme.headingText}`}>
            Built for Modern Business & Branding
          </h2>
          <p className={`text-sm ${activeTheme.secondaryText}`}>
            Everything you need to deploy dynamic trackable QR codes across menus, print ads, packaging, and digital media.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden transition-all hover:-translate-y-1 ${activeTheme.cardBg} ${activeTheme.cardBorder}`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feat.color} rounded-full blur-2xl pointer-events-none`} />
              
              <div className="space-y-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${feat.border} bg-slate-900/60`}>
                  {feat.icon}
                </div>
                <h3 className={`text-xl font-display font-bold ${activeTheme.headingText}`}>{feat.title}</h3>
                <p className={`text-sm leading-relaxed ${activeTheme.secondaryText}`}>{feat.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- HOW IT WORKS WORKFLOW --- */}
      <section className="max-w-5xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-semibold">Simple 3-Step Process</span>
          <h2 className={`text-3xl sm:text-4xl font-display font-bold ${activeTheme.headingText}`}>
            How Permanent Dynamic QR Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className={`p-6 sm:p-8 rounded-3xl border relative transition-all ${activeTheme.cardBg} ${activeTheme.cardBorder}`}
            >
              <span className="text-4xl font-display font-extrabold text-indigo-500/30 block mb-4 font-mono">
                {step.number}
              </span>
              <h4 className={`text-lg font-display font-bold mb-2 ${activeTheme.headingText}`}>{step.title}</h4>
              <p className={`text-xs sm:text-sm ${activeTheme.secondaryText} leading-relaxed`}>{step.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- CALL TO ACTION BANNER --- */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto px-4"
      >
        <div className="relative rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden text-center shadow-2xl">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight">
              Ready to Upgrade Your Printed QR Codes?
            </h2>
            <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed">
              Start creating permanent trackable QR codes in seconds. Update targets anytime without reprinting.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onOpenAuth("login")}
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl text-base shadow-xl transition transform hover:-translate-y-0.5"
              >
                Launch QR Studio Dashboard
              </button>
              <button
                onClick={() => onOpenAuth("login")}
                className="w-full sm:w-auto px-7 py-4 bg-black/20 hover:bg-black/30 text-white font-semibold rounded-2xl text-base border border-white/20 transition"
              >
                Sign In / Register
              </button>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
