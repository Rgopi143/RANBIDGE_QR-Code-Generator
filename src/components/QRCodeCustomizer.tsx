import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, Copy, Check, Palette, ShieldAlert, Image as ImageIcon, Trash2, Sliders, Type, Grid } from "lucide-react";
import { ThemeConfig, QRConfig } from "../types";

interface QRCodeCustomizerProps {
  redirectId: string;
  redirectUrl: string;
  name: string;
  activeTheme: ThemeConfig;
  initialConfig?: QRConfig;
  onSaveConfig: (config: QRConfig) => Promise<void>;
}

export default function QRCodeCustomizer({
  redirectId,
  redirectUrl,
  name,
  activeTheme,
  initialConfig,
  onSaveConfig,
}: QRCodeCustomizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // QR Color & ECC settings
  const [fgColor, setFgColor] = useState(initialConfig?.fgColor || "#0f172a");
  const [bgColor, setBgColor] = useState(initialConfig?.bgColor || "#ffffff");
  const [ecc, setEcc] = useState<"L" | "M" | "Q" | "H">(initialConfig?.ecc || "H");

  // Center Pic/Logo settings
  const [logoType, setLogoType] = useState<"none" | "preset" | "upload" | "text">(
    initialConfig?.logoType || "none"
  );
  const [presetLogo, setPresetLogo] = useState(initialConfig?.presetLogo || "🔗");
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(
    initialConfig?.customLogoUrl || null
  );
  const [logoText, setLogoText] = useState(initialConfig?.logoText || "GO");
  const [logoSize, setLogoSize] = useState<number>(initialConfig?.logoSize || 24); // percentage 15-35
  const [logoShape, setLogoShape] = useState<"circle" | "square" | "rounded">(
    initialConfig?.logoShape || "rounded"
  );
  const [logoPadding, setLogoPadding] = useState<number>(
    initialConfig?.logoPadding !== undefined ? initialConfig.logoPadding : 4
  );
  const [logoBgColor, setLogoBgColor] = useState(initialConfig?.logoBgColor || bgColor);

  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const presetColors = [
    { name: "Slate", fg: "#0f172a", bg: "#ffffff" },
    { name: "Cyberpunk", fg: "#ec4899", bg: "#0f172a" },
    { name: "Forest", fg: "#064e3b", bg: "#f0fdf4" },
    { name: "Oceanic", fg: "#0c4a6e", bg: "#f0f9ff" },
    { name: "Royal", fg: "#312e81", bg: "#faf5ff" },
    { name: "Monochrome", fg: "#000000", bg: "#ffffff" },
  ];

  const presetEmojis = ["🔗", "🌐", "✨", "🛒", "📱", "❤️", "☕", "🎮", "🚀", "💡", "🏷️", "🎟️"];

  // Update logoBgColor if bgColor changes and it matches previous bgColor
  useEffect(() => {
    if (logoBgColor === bgColor) {
      // Keep in sync by default unless customized
    }
  }, [bgColor]);

  useEffect(() => {
    if (!canvasRef.current) return;

    QRCode.toCanvas(
      canvasRef.current,
      redirectUrl,
      {
        width: 300,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: logoType !== "none" ? "H" : ecc, // Force High error correction when logo is present for scan safety
      },
      (error) => {
        if (error) {
          console.error("QR Code rendering error:", error);
          return;
        }

        // Draw center logo
        drawCenterLogo();
      }
    );
  }, [
    redirectUrl,
    fgColor,
    bgColor,
    ecc,
    logoType,
    presetLogo,
    customLogoUrl,
    logoText,
    logoSize,
    logoShape,
    logoPadding,
    logoBgColor,
  ]);

  const drawCenterLogo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (logoType === "none") return;

    const size = canvas.width;
    const logoPx = size * (logoSize / 100);
    const x = (size - logoPx) / 2;
    const y = (size - logoPx) / 2;

    const pad = logoPadding;
    const bgX = x - pad;
    const bgY = y - pad;
    const bgSize = logoPx + pad * 2;

    // Draw background mask
    ctx.fillStyle = logoBgColor;
    ctx.beginPath();
    if (logoShape === "circle") {
      ctx.arc(size / 2, size / 2, bgSize / 2, 0, Math.PI * 2);
    } else if (logoShape === "rounded") {
      const radius = 8;
      if (ctx.roundRect) {
        ctx.roundRect(bgX, bgY, bgSize, bgSize, radius);
      } else {
        ctx.rect(bgX, bgY, bgSize, bgSize);
      }
    } else {
      ctx.rect(bgX, bgY, bgSize, bgSize);
    }
    ctx.fill();

    // Draw Content
    if (logoType === "upload" && customLogoUrl) {
      const img = new Image();
      img.src = customLogoUrl;
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        if (logoShape === "circle") {
          ctx.arc(size / 2, size / 2, logoPx / 2, 0, Math.PI * 2);
          ctx.clip();
        } else if (logoShape === "rounded") {
          const radius = 4;
          if (ctx.roundRect) {
            ctx.roundRect(x, y, logoPx, logoPx, radius);
          } else {
            ctx.rect(x, y, logoPx, logoPx);
          }
          ctx.clip();
        }
        ctx.drawImage(img, x, y, logoPx, logoPx);
        ctx.restore();
      };
    } else if (logoType === "preset") {
      ctx.font = `${logoPx * 0.75}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(presetLogo, size / 2, size / 2 + (logoPx * 0.05));
    } else if (logoType === "text" && logoText) {
      ctx.fillStyle = fgColor;
      ctx.font = `bold ${logoPx * 0.4}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(logoText.substring(0, 4).toUpperCase(), size / 2, size / 2);
    }
  };

  const handleFileChange = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setCustomLogoUrl(e.target.result as string);
        setLogoType("upload");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const saveStyle = async () => {
    setIsSaving(true);
    try {
      const config: QRConfig = {
        fgColor,
        bgColor,
        ecc,
        logoType,
        presetLogo,
        customLogoUrl: customLogoUrl || undefined,
        logoText,
        logoSize,
        logoShape,
        logoPadding,
        logoBgColor,
      };
      await onSaveConfig(config);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(redirectUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  const downloadQR = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-qr.png`;
    link.href = url;
    link.click();
  };

  return (
    <div id="qr-customizer-container" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* LEFT: QR Preview Canvas */}
        <div className="md:col-span-5 flex flex-col items-center space-y-4">
          <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center w-full shadow-inner ${activeTheme.isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="bg-white p-3 rounded-xl shadow-md overflow-hidden flex items-center justify-center border border-slate-200 w-full aspect-square max-w-[260px]">
              <canvas ref={canvasRef} className="max-w-full h-auto aspect-square rounded" />
            </div>
            <p className={`text-[10px] font-mono mt-4 select-all truncate max-w-full px-2 text-center transition-colors duration-300 ${activeTheme.secondaryText}`}>
              {redirectUrl}
            </p>
          </div>

          <button
            onClick={downloadQR}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/15 transition flex items-center justify-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Download QR Code (PNG)
          </button>
        </div>

        {/* RIGHT: Styling Controls */}
        <div className="md:col-span-7 space-y-5 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
          {/* Colors Card */}
          <div className={`p-4 rounded-xl border space-y-4 ${activeTheme.isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-2">
              <Palette className={`w-4 h-4 ${activeTheme.accentText}`} />
              <h4 className={`text-sm font-semibold ${activeTheme.headingText}`}>Color Customization</h4>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-3 gap-1.5">
              {presetColors.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => {
                    setFgColor(p.fg);
                    setBgColor(p.bg);
                    setLogoBgColor(p.bg);
                  }}
                  className={`py-1.5 px-2 rounded-lg transition flex items-center gap-1.5 text-[11px] border text-left ${
                    activeTheme.isDark
                      ? "bg-slate-950/40 border-slate-800 hover:bg-slate-800/50 text-slate-300"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-slate-300/40 block shrink-0"
                    style={{ background: `linear-gradient(135deg, ${p.fg} 50%, ${p.bg} 50%)` }}
                  />
                  <span className="truncate">{p.name}</span>
                </button>
              ))}
            </div>

            {/* Custom pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className={`text-[11px] font-medium ${activeTheme.secondaryText}`}>Foreground</span>
                <div className={`flex items-center gap-2 p-1.5 rounded-lg border ${
                  activeTheme.isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className={`w-full bg-transparent text-xs font-mono border-0 p-0 focus:ring-0 focus:outline-none ${
                      activeTheme.isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className={`text-[11px] font-medium ${activeTheme.secondaryText}`}>Background</span>
                <div className={`flex items-center gap-2 p-1.5 rounded-lg border ${
                  activeTheme.isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => {
                      setBgColor(e.target.value);
                      setLogoBgColor(e.target.value);
                    }}
                    className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => {
                      setBgColor(e.target.value);
                      setLogoBgColor(e.target.value);
                    }}
                    className={`w-full bg-transparent text-xs font-mono border-0 p-0 focus:ring-0 focus:outline-none ${
                      activeTheme.isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Picture / Logo Integration Card */}
          <div className={`p-4 rounded-xl border space-y-4 ${activeTheme.isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className={`w-4 h-4 ${activeTheme.accentText}`} />
                <h4 className={`text-sm font-semibold ${activeTheme.headingText}`}>Center Logo / Picture</h4>
              </div>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${activeTheme.isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                {logoType === "none" ? "None" : "Embedded"}
              </span>
            </div>

            {/* Type tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-slate-950/30">
              {([
                { id: "none", label: "None" },
                { id: "preset", label: "Preset" },
                { id: "upload", label: "Picture" },
                { id: "text", label: "Text" },
              ] as const).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setLogoType(t.id)}
                  className={`py-1 text-[11px] font-medium rounded transition-colors ${
                    logoType === t.id
                      ? "bg-indigo-600 text-white shadow-sm"
                      : activeTheme.isDark
                        ? "text-slate-400 hover:text-slate-200"
                        : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Sub-controls based on logoType */}
            {logoType === "preset" && (
              <div className="space-y-2">
                <span className={`text-[11px] font-medium ${activeTheme.secondaryText}`}>Choose Preset Symbol</span>
                <div className="grid grid-cols-6 gap-2">
                  {presetEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setPresetLogo(emoji)}
                      className={`text-lg p-1.5 rounded-lg border transition ${
                        presetLogo === emoji
                          ? "bg-indigo-600/20 border-indigo-500"
                          : activeTheme.isDark
                            ? "bg-slate-950 border-slate-800 hover:bg-slate-800/40"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {logoType === "upload" && (
              <div className="space-y-2">
                <span className={`text-[11px] font-medium ${activeTheme.secondaryText}`}>Upload Center Picture</span>
                
                {/* Drag and Drop Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    dragActive
                      ? "border-indigo-500 bg-indigo-500/10"
                      : activeTheme.isDark
                        ? "border-slate-800 bg-slate-950/20 hover:border-slate-700 hover:bg-slate-950/40"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  {customLogoUrl ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="bg-white p-1 rounded border border-slate-200">
                        <img src={customLogoUrl} alt="Logo preview" className="w-10 h-10 object-contain rounded" />
                      </div>
                      <div className="text-left">
                        <p className={`text-xs font-semibold ${activeTheme.headingText}`}>Picture Loaded</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCustomLogoUrl(null);
                            setLogoType("none");
                          }}
                          className="text-[10px] text-red-500 hover:text-red-400 font-medium flex items-center gap-1 mt-0.5"
                        >
                          <Trash2 className="w-3 h-3" /> Clear Picture
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <ImageIcon className="w-6 h-6 mx-auto text-slate-400" />
                      <p className={`text-xs font-medium ${activeTheme.headingText}`}>Drag & drop picture here, or <span className="text-indigo-500 hover:underline">browse</span></p>
                      <p className="text-[10px] text-slate-400">Supports PNG, JPG, WebP</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {logoType === "text" && (
              <div className="space-y-1.5">
                <span className={`text-[11px] font-medium ${activeTheme.secondaryText}`}>Overlay Text (Max 4 chars)</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={logoText}
                    onChange={(e) => setLogoText(e.target.value)}
                    className={`flex-1 rounded-lg border text-xs px-3 py-2 ${
                      activeTheme.isDark
                        ? "bg-slate-950 border-slate-800 text-white focus:border-indigo-500"
                        : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
                    }`}
                    placeholder="e.g. GO"
                  />
                  <div className="flex items-center gap-1 border rounded-lg px-2 text-xs font-mono bg-slate-950/20 text-slate-400">
                    <Type className="w-3.5 h-3.5" />
                    <span>TEXT</span>
                  </div>
                </div>
              </div>
            )}

            {/* Sizing & Shapes options - only shown if logo selected */}
            {logoType !== "none" && (
              <div className="space-y-3 pt-2 border-t border-slate-800/40">
                <div className="grid grid-cols-2 gap-3">
                  {/* Sizing Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span className={activeTheme.secondaryText}>Picture Size</span>
                      <span className={`${activeTheme.accentText} font-semibold font-mono`}>{logoSize}%</span>
                    </div>
                    <input
                      type="range"
                      min={15}
                      max={32}
                      value={logoSize}
                      onChange={(e) => setLogoSize(Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  {/* Padding Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span className={activeTheme.secondaryText}>Background Margin</span>
                      <span className={`${activeTheme.accentText} font-semibold font-mono`}>{logoPadding}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={12}
                      value={logoPadding}
                      onChange={(e) => setLogoPadding(Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>

                {/* Mask Shapes */}
                <div className="grid grid-cols-2 gap-3 items-center">
                  <div className="space-y-1">
                    <span className={`text-[11px] font-medium ${activeTheme.secondaryText}`}>Mask Frame Shape</span>
                    <div className="grid grid-cols-3 gap-1 p-0.5 rounded-lg bg-slate-950/30">
                      {(["circle", "rounded", "square"] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setLogoShape(s)}
                          className={`py-1 text-[10px] font-mono capitalize rounded transition ${
                            logoShape === s
                              ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {s === "rounded" ? "round" : s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mask Background Color */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-medium">
                      <span className={activeTheme.secondaryText}>Mask Color</span>
                      <button
                        type="button"
                        onClick={() => setLogoBgColor(bgColor)}
                        className="text-[10px] text-indigo-400 hover:underline"
                      >
                        Reset
                      </button>
                    </div>
                    <div className={`flex items-center gap-1.5 p-1 rounded-lg border ${
                      activeTheme.isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <input
                        type="color"
                        value={logoBgColor}
                        onChange={(e) => setLogoBgColor(e.target.value)}
                        className="w-5 h-5 rounded border-0 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={logoBgColor}
                        onChange={(e) => setLogoBgColor(e.target.value)}
                        className={`w-full bg-transparent text-[10px] font-mono border-0 p-0 focus:ring-0 focus:outline-none ${
                          activeTheme.isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Correction Card */}
          <div className={`p-4 rounded-xl border space-y-3.5 ${activeTheme.isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className={`w-4 h-4 ${activeTheme.accentText}`} />
                <h4 className={`text-sm font-semibold ${activeTheme.headingText}`}>Error Correction & Recovery</h4>
              </div>
              <span className={`text-[10px] font-mono transition-colors duration-300 ${activeTheme.secondaryText}`}>
                {ecc === "H" ? "30% Damage Tolerance" : ecc === "Q" ? "25% Damage Tolerance" : ecc === "M" ? "15% Damage Tolerance" : "7% Damage Tolerance"}
              </span>
            </div>
            
            {logoType !== "none" ? (
              <p className="text-[10px] text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 p-2 rounded-lg leading-relaxed">
                ℹ️ <strong>High (H) Level Auto-Forced</strong>: Standard error-correction has been automatically upgraded to 30% tolerance to guarantee error-free code scanners with the embedded center logo.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-1.5">
                {(["L", "M", "Q", "H"] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setEcc(level)}
                    className={`py-1 px-2 text-xs font-mono rounded border transition ${
                      ecc === level
                        ? "bg-indigo-600/30 border-indigo-500 text-indigo-300 font-semibold"
                        : activeTheme.isDark
                          ? "bg-slate-950/30 border-slate-800 text-slate-400 hover:bg-slate-800/30"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className={`flex flex-col sm:flex-row gap-3 pt-4 border-t transition-colors duration-300 ${activeTheme.cardBorder}`}>
        <button
          onClick={copyToClipboard}
          className={`flex-1 py-2.5 px-4 rounded-xl border transition flex items-center justify-center gap-2 text-sm font-medium ${
            activeTheme.isDark
              ? "bg-slate-900 hover:bg-slate-950 text-slate-200 border-slate-850"
              : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
          }`}
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
          {copied ? "Copied Link!" : "Copy Redirect Link"}
        </button>

        <button
          onClick={saveStyle}
          disabled={isSaving}
          className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold shadow-lg shadow-indigo-600/15 transition flex items-center justify-center gap-2 text-sm"
        >
          {isSaving ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Saving Settings...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Save Layout Style
            </>
          )}
        </button>
      </div>
    </div>
  );
}
