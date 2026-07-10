import React, { useState, useEffect } from "react";
import { RedirectLink, ThemeConfig } from "./types";
import { motion, AnimatePresence } from "motion/react";
import {
  QrCode,
  Link2,
  Plus,
  Eye,
  Trash2,
  Copy,
  Check,
  Edit2,
  AlertCircle,
  ExternalLink,
  Pause,
  Play,
  HelpCircle,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Loader2,
  Sliders,
  Download,
  FileSpreadsheet,
  Palette,
  Sun,
  Moon,
} from "lucide-react";
import QRCodeCustomizer from "./components/QRCodeCustomizer";
import AnalyticsView from "./components/AnalyticsView";
import QRPreview from "./components/QRPreview";

export const THEME_PRESETS: Record<string, ThemeConfig> = {
  black: {
    id: "black",
    name: "Black",
    isDark: true,
    background: "bg-black text-white",
    text: "text-slate-300",
    headingText: "text-white",
    cardBg: "bg-slate-950/80 border border-slate-800",
    cardBorder: "border-slate-800",
    accentText: "text-white",
    accentBg: "bg-white/10",
    accentBorder: "border-white/20",
    buttonActive: "bg-white text-black",
    buttonHover: "bg-slate-900 hover:bg-slate-800 text-white border border-slate-800",
    inputBg: "bg-slate-950 border-slate-800 text-white focus:ring-white/20",
    secondaryText: "text-slate-400",
    accentGradient: "from-white to-slate-300",
    statCardBg: "bg-slate-900/70 border-slate-800",
    statCardText: "text-slate-200",
  },
  white: {
    id: "white",
    name: "White",
    isDark: false,
    background: "bg-white text-slate-900",
    text: "text-slate-600",
    headingText: "text-slate-900",
    cardBg: "bg-white border border-slate-200 shadow-sm",
    cardBorder: "border-slate-200",
    accentText: "text-slate-900",
    accentBg: "bg-slate-100",
    accentBorder: "border-slate-200",
    buttonActive: "bg-slate-900 text-white",
    buttonHover: "bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200",
    inputBg: "bg-slate-50 border-slate-200 text-slate-900 focus:ring-slate-300",
    secondaryText: "text-slate-500",
    accentGradient: "from-slate-900 to-slate-700",
    statCardBg: "bg-white border border-slate-200",
    statCardText: "text-slate-800",
  },
};

export default function App() {
  const [theme, setTheme] = useState<"black" | "white">(() => {
    const savedTheme = localStorage.getItem("qr-studio-theme");
    return savedTheme === "black" || savedTheme === "white" ? savedTheme : "white";
  });
  const [showThemePicker, setShowThemePicker] = useState(false);

  useEffect(() => {
    localStorage.setItem("qr-studio-theme", theme);
  }, [theme]);

  const activeTheme = THEME_PRESETS[theme] || THEME_PRESETS.white;

  const [redirects, setRedirects] = useState<RedirectLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [redirectError, setRedirectError] = useState<{ type: "404" | "403"; id: string } | null>(null);

  // Creation form states
  const [name, setName] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [createLogoData, setCreateLogoData] = useState<string | null>(null);
  const [showLogoPrompt, setShowLogoPrompt] = useState(false);
  const [customSlug, setCustomSlug] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter states
  const [selectedTagFilter, setSelectedTagFilter] = useState("all");

  // Dialog/Modal states
  const [activeTab, setActiveTab] = useState<"dashboard" | "create">("dashboard");
  const [selectedAnalyticsId, setSelectedAnalyticsId] = useState<string | null>(null);
  const [customizingLink, setCustomizingLink] = useState<{ id: string; name: string; destinationUrl?: string } | null>(null);
  const [editingLink, setEditingLink] = useState<RedirectLink | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editName, setEditName] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editLogoData, setEditLogoData] = useState<string | null>(null);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      if (customizingLink) {
        setCustomizingLink(null);
        return;
      }

      if (editingLink) {
        setEditingLink(null);
        return;
      }

      if (showLogoPrompt) {
        setShowLogoPrompt(false);
        return;
      }

      if (showThemePicker) {
        setShowThemePicker(false);
      }
    };

    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [customizingLink, editingLink, showLogoPrompt, showThemePicker]);

  const handleAddTag = () => {
    const clean = tagInput.trim();
    if (!clean) return;
    if (!tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput("");
  };

  const handleToggleTag = (preset: string) => {
    if (tags.includes(preset)) {
      setTags(tags.filter((t) => t !== preset));
    } else {
      setTags([...tags, preset]);
    }
  };

  const handleRemoveTag = (tg: string) => {
    setTags(tags.filter((t) => t !== tg));
  };

  const handleAddEditTag = () => {
    const clean = editTagInput.trim();
    if (!clean) return;
    if (!editTags.includes(clean)) {
      setEditTags([...editTags, clean]);
    }
    setEditTagInput("");
  };

  const handleToggleEditTag = (preset: string) => {
    if (editTags.includes(preset)) {
      setEditTags(editTags.filter((t) => t !== preset));
    } else {
      setEditTags([...editTags, preset]);
    }
  };

  const handleRemoveEditTag = (tg: string) => {
    setEditTags(editTags.filter((t) => t !== tg));
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const generateShortId = (length = 6): string => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const parseClientUserAgent = (ua: string) => {
    let browser = "Other";
    let device = "Desktop";
    let os = "Other";

    const lowerUa = ua.toLowerCase();

    if (lowerUa.includes("mobi") || lowerUa.includes("phone") || lowerUa.includes("iphone")) {
      device = "Mobile";
    } else if (lowerUa.includes("ipad") || lowerUa.includes("tablet") || (lowerUa.includes("android") && !lowerUa.includes("mobi"))) {
      device = "Tablet";
    } else {
      device = "Desktop";
    }

    if (lowerUa.includes("firefox")) {
      browser = "Firefox";
    } else if (lowerUa.includes("edg/")) {
      browser = "Edge";
    } else if (lowerUa.includes("chrome") || lowerUa.includes("chromium")) {
      browser = "Chrome";
    } else if (lowerUa.includes("safari") && !lowerUa.includes("chrome")) {
      browser = "Safari";
    } else if (lowerUa.includes("opr/") || lowerUa.includes("opera")) {
      browser = "Opera";
    }

    if (lowerUa.includes("windows")) {
      os = "Windows";
    } else if (lowerUa.includes("macintosh") || lowerUa.includes("mac os")) {
      os = "macOS";
    } else if (lowerUa.includes("iphone") || lowerUa.includes("ipad")) {
      os = "iOS";
    } else if (lowerUa.includes("android")) {
      os = "Android";
    } else if (lowerUa.includes("linux")) {
      os = "Linux";
    }

    return { browser, device, os };
  };

  const fetchRedirects = async () => {
    setLoading(true);
    try {
      let staticLinks: RedirectLink[] = [];
      try {
        const res = await fetch("/data/db.json");
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.redirects)) {
            staticLinks = data.redirects;
          } else if (Array.isArray(data)) {
            staticLinks = data;
          }
        }
      } catch (e) {
        console.warn("Could not load /data/db.json, using local state only.", e);
      }

      let localLinks: RedirectLink[] = [];
      try {
        const saved = localStorage.getItem("qr-redirects");
        if (saved) {
          localLinks = JSON.parse(saved);
        }
      } catch (e) {
        console.error("Error reading localStorage redirects:", e);
      }

      let deletedLinks: string[] = [];
      try {
        const savedDeleted = localStorage.getItem("qr-deleted-redirects");
        if (savedDeleted) {
          deletedLinks = JSON.parse(savedDeleted);
        }
      } catch (e) {
        console.error("Error reading deleted redirects:", e);
      }

      const mergedMap = new Map<string, RedirectLink>();
      staticLinks.forEach(link => {
        if (!deletedLinks.includes(link.id.toLowerCase())) {
          mergedMap.set(link.id.toLowerCase(), link);
        }
      });
      localLinks.forEach(link => {
        if (!deletedLinks.includes(link.id.toLowerCase())) {
          mergedMap.set(link.id.toLowerCase(), link);
        }
      });

      const merged = Array.from(mergedMap.values());
      setRedirects(merged);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedirects();
  }, []);

  const checkRedirect = async () => {
    const path = window.location.pathname;
    const match = path.match(/^\/r\/([a-zA-Z0-9\-_]+)$/);
    if (match) {
      const shortId = match[1].toLowerCase();
      setRedirecting(true);

      try {
        let staticLinks: RedirectLink[] = [];
        try {
          const res = await fetch("/data/db.json");
          if (res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.redirects)) {
              staticLinks = data.redirects;
            } else if (Array.isArray(data)) {
              staticLinks = data;
            }
          }
        } catch (e) {
          console.warn("Could not fetch db.json", e);
        }

        let localLinks: RedirectLink[] = [];
        try {
          const saved = localStorage.getItem("qr-redirects");
          if (saved) {
            localLinks = JSON.parse(saved);
          }
        } catch (e) {
          console.error("Error loading local links", e);
        }

        let deletedLinks: string[] = [];
        try {
          const savedDeleted = localStorage.getItem("qr-deleted-redirects");
          if (savedDeleted) {
            deletedLinks = JSON.parse(savedDeleted);
          }
        } catch (e) {
          console.error("Error loading deleted links", e);
        }

        if (deletedLinks.includes(shortId)) {
          setRedirectError({ type: "404", id: match[1] });
          setRedirecting(false);
          return;
        }

        let foundLink = localLinks.find(l => l.id.toLowerCase() === shortId);
        if (!foundLink) {
          foundLink = staticLinks.find(l => l.id.toLowerCase() === shortId);
        }

        if (foundLink) {
          if (foundLink.status === "paused") {
            setRedirectError({ type: "403", id: foundLink.name });
            setRedirecting(false);
            return;
          }

          // Record client-side scan analytics locally
          try {
            const userAgent = navigator.userAgent;
            const referrer = document.referrer || "Direct / QR Scanner";
            const { browser, device, os } = parseClientUserAgent(userAgent);
            const newScan = {
              id: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: new Date().toISOString(),
              userAgent,
              browser,
              device,
              os,
              referrer,
            };

            const saved = localStorage.getItem("qr-redirects");
            let currentLocal: RedirectLink[] = saved ? JSON.parse(saved) : [];
            const idx = currentLocal.findIndex(l => l.id.toLowerCase() === shortId);
            if (idx !== -1) {
              currentLocal[idx].scanCount += 1;
              currentLocal[idx].scans.push(newScan);
              currentLocal[idx].updatedAt = new Date().toISOString();
            } else {
              const cloned = { 
                ...foundLink, 
                scanCount: foundLink.scanCount + 1, 
                scans: [...(foundLink.scans || []), newScan],
                updatedAt: new Date().toISOString() 
              };
              currentLocal.push(cloned);
            }
            localStorage.setItem("qr-redirects", JSON.stringify(currentLocal));
          } catch (e) {
            console.error("Failed to record analytics scan", e);
          }

          window.location.replace(foundLink.destinationUrl);
        } else {
          setRedirectError({ type: "404", id: match[1] });
          setRedirecting(false);
        }
      } catch (err) {
        console.error("Error handling redirect", err);
        setRedirectError({ type: "404", id: match[1] });
        setRedirecting(false);
      }
    }
  };

  useEffect(() => {
    checkRedirect();
  }, []);

  const handleExportDB = () => {
    const dbData = {
      redirects: redirects.map(link => {
        const { scansInLast24h, ...linkData } = link as any;
        return linkData;
      })
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dbData, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", "db.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Database (db.json) exported! Copy this to public/data/db.json and commit/push to deploy changes.");
  };

  const submitCreate = async () => {
    setIsSubmitting(true);
    try {
      let finalId = customSlug ? customSlug.trim().toLowerCase() : "";
      if (finalId) {
        const slugRegex = /^[a-zA-Z0-9\-_]+$/;
        if (!slugRegex.test(finalId)) {
          throw new Error("Custom URL alias can only contain alphanumeric characters, hyphens, and underscores.");
        }
        const exists = redirects.some((r) => r.id.toLowerCase() === finalId);
        if (exists) {
          throw new Error("This custom URL alias is already in use. Please select a different one.");
        }
      } else {
        let unique = false;
        while (!unique) {
          finalId = generateShortId();
          const exists = redirects.some((r) => r.id.toLowerCase() === finalId.toLowerCase());
          if (!exists) unique = true;
        }
      }

      try {
        new URL(destinationUrl);
      } catch (e) {
        throw new Error("Invalid Destination URL. Must include protocol (e.g. https://).");
      }

      const now = new Date().toISOString();
      const newLink: RedirectLink = {
        id: finalId,
        name: name.trim(),
        destinationUrl: destinationUrl.trim(),
        createdAt: now,
        updatedAt: now,
        status: "active",
        scanCount: 0,
        scans: [],
        tags: tags,
        qrConfig: createLogoData
          ? { logoType: "upload", customLogoUrl: createLogoData, logoSize: 24, logoShape: "rounded", logoPadding: 4 }
          : undefined,
      };

      const saved = localStorage.getItem("qr-redirects");
      const localLinks: RedirectLink[] = saved ? JSON.parse(saved) : [];
      localLinks.push(newLink);
      localStorage.setItem("qr-redirects", JSON.stringify(localLinks));

      showToast(`Dynamic QR Code "${newLink.name}" generated successfully!`);
      setName("");
      setDestinationUrl("");
      setCreateLogoData(null);
      setCustomSlug("");
      setTags([]);
      setTagInput("");
      setActiveTab("dashboard");
      fetchRedirects();
    } catch (err: any) {
      showToast(err.message || "Error generating QR code.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !destinationUrl.trim()) {
      showToast("Please provide both a label and a destination URL.", "error");
      return;
    }

    if (!createLogoData && !showLogoPrompt) {
      setShowLogoPrompt(true);
      return;
    }

    submitCreate();
  };

  const handleStatusToggle = async (link: RedirectLink) => {
    const nextStatus = link.status === "active" ? "paused" : "active";
    try {
      const saved = localStorage.getItem("qr-redirects");
      let localLinks: RedirectLink[] = saved ? JSON.parse(saved) : [];
      
      const existsIndex = localLinks.findIndex(r => r.id.toLowerCase() === link.id.toLowerCase());
      if (existsIndex !== -1) {
        localLinks[existsIndex].status = nextStatus;
        localLinks[existsIndex].updatedAt = new Date().toISOString();
      } else {
        const cloned = { ...link, status: nextStatus, updatedAt: new Date().toISOString() };
        localLinks.push(cloned);
      }
      
      localStorage.setItem("qr-redirects", JSON.stringify(localLinks));

      setRedirects((prev) =>
        prev.map((r) => (r.id === link.id ? { ...r, status: nextStatus } : r))
      );
      showToast(`QR Code "${link.name}" is now ${nextStatus}!`);
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;

    try {
      try {
        new URL(editUrl);
      } catch (e) {
        throw new Error("Invalid Destination URL. Must include protocol (e.g. https://).");
      }

      const saved = localStorage.getItem("qr-redirects");
      let localLinks: RedirectLink[] = saved ? JSON.parse(saved) : [];
      const index = localLinks.findIndex((r) => r.id.toLowerCase() === editingLink.id.toLowerCase());

      const updatedFields = {
        name: editName.trim(),
        destinationUrl: editUrl.trim(),
        tags: editTags,
        qrConfig: editLogoData ? { logoType: "upload", customLogoUrl: editLogoData, logoSize: 24, logoShape: "rounded", logoPadding: 4 } : undefined,
        updatedAt: new Date().toISOString(),
      };

      if (index !== -1) {
        localLinks[index] = { ...localLinks[index], ...updatedFields };
      } else {
        localLinks.push({ ...editingLink, ...updatedFields });
      }

      localStorage.setItem("qr-redirects", JSON.stringify(localLinks));

      showToast("Redirect configuration updated successfully!");
      setEditingLink(null);
      fetchRedirects();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleSaveQRConfig = async (config: any) => {
    if (!customizingLink) return;

    try {
      const saved = localStorage.getItem("qr-redirects");
      let localLinks: RedirectLink[] = saved ? JSON.parse(saved) : [];
      const index = localLinks.findIndex((r) => r.id.toLowerCase() === customizingLink.id.toLowerCase());

      const target = redirects.find(r => r.id.toLowerCase() === customizingLink.id.toLowerCase());
      if (!target) throw new Error("Redirect link not found");

      const updatedFields = {
        qrConfig: config,
        updatedAt: new Date().toISOString(),
      };

      if (index !== -1) {
        localLinks[index] = { ...localLinks[index], ...updatedFields };
      } else {
        localLinks.push({ ...target, ...updatedFields });
      }

      localStorage.setItem("qr-redirects", JSON.stringify(localLinks));

      showToast(`QR Code "${customizingLink.name}" styling and picture saved successfully!`);
      setCustomizingLink(null);
      fetchRedirects();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Are you sure you want to delete the QR Code "${label}"? This will permanently delete all associated scan analytics and break existing printed links.`)) {
      return;
    }

    try {
      const saved = localStorage.getItem("qr-redirects");
      let localLinks: RedirectLink[] = saved ? JSON.parse(saved) : [];
      localLinks = localLinks.filter((r) => r.id.toLowerCase() !== id.toLowerCase());
      
      const deletedSaved = localStorage.getItem("qr-deleted-redirects");
      const deletedIds: string[] = deletedSaved ? JSON.parse(deletedSaved) : [];
      if (!deletedIds.includes(id.toLowerCase())) {
        deletedIds.push(id.toLowerCase());
      }
      localStorage.setItem("qr-deleted-redirects", JSON.stringify(deletedIds));
      localStorage.setItem("qr-redirects", JSON.stringify(localLinks));

      showToast(`Dynamic QR Code "${label}" deleted.`);
      fetchRedirects();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  

  const handleExportCSV = () => {
    if (redirects.length === 0) {
      showToast("No active QR codes to export.", "error");
      return;
    }

    // Header matching what they requested: active QR codes and their destination URLs
    const headers = ["ID", "Name", "Destination Target URL", "Status", "Total Scans", "Tags", "Created At"];
    const rows = redirects.map((link) => {
      const tagsStr = (link.tags || []).join(", ");
      return [
        link.id,
        `"${link.name.replace(/"/g, '""')}"`,
        `"${link.destinationUrl.replace(/"/g, '""')}"`,
        link.status,
        link.scanCount,
        `"${tagsStr.replace(/"/g, '""')}"`,
        link.createdAt,
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `dynamic_qr_codes_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Successfully exported QR code list to CSV!");
  };

  // Summary Metrics
  const totalScans = redirects.reduce((sum, r) => sum + r.scanCount, 0);
  const activeCount = redirects.filter((r) => r.status === "active").length;
  const totalInLast24h = redirects.reduce((sum, r) => sum + (r.scansInLast24h || 0), 0);

  const allUniqueTags = Array.from(
    new Set(redirects.flatMap((link) => link.tags || []))
  );

  const filteredRedirects = redirects.filter((link) => {
    if (selectedTagFilter === "all") return true;
    return link.tags && link.tags.includes(selectedTagFilter);
  });

  if (redirecting) {
    return (
      <div className="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center font-sans p-6">
        <div className="max-w-md w-full text-center space-y-6 bg-slate-800/50 p-8 rounded-2xl border border-slate-700/50 shadow-2xl backdrop-blur-md">
          <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mx-auto" />
          <h1 className="text-2xl font-bold">Redirecting you...</h1>
          <p className="text-slate-400">Please wait while we route you to the destination.</p>
        </div>
      </div>
    );
  }

  if (redirectError) {
    if (redirectError.type === "404") {
      return (
        <div className="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center font-sans p-6">
          <div className="max-w-md w-full text-center space-y-6 bg-slate-800/50 p-8 rounded-2xl border border-slate-700/50 shadow-2xl backdrop-blur-md">
            <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto text-4xl font-bold animate-pulse">!</div>
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-white">QR Code Expired or Invalid</h1>
              <p className="text-slate-400">The destination or permanent redirect link <code className="bg-slate-950 px-2 py-1 rounded text-sm text-amber-400 font-mono">/r/{redirectError.id}</code> was not found on our server.</p>
            </div>
            <div className="pt-4 border-t border-slate-700/50">
              <p className="text-xs text-slate-500">Powered by Permanent Dynamic QR Codes</p>
            </div>
          </div>
        </div>
      );
    } else if (redirectError.type === "403") {
      return (
        <div className="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center font-sans p-6">
          <div className="max-w-md w-full text-center space-y-6 bg-slate-800/50 p-8 rounded-2xl border border-slate-700/50 shadow-2xl backdrop-blur-md">
            <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto text-4xl font-bold">⏸</div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">{redirectError.id}</h1>
              <p className="text-slate-300 font-medium text-lg">This redirect is currently paused</p>
              <p className="text-slate-400 text-sm">The creator has temporarily suspended the target destination. Please check back later or scan again.</p>
            </div>
            <div className="pt-4 border-t border-slate-700/50">
              <p className="text-xs text-slate-500">Powered by Permanent Dynamic QR Codes</p>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className={`min-h-screen font-sans pb-16 transition-colors duration-300 ${activeTheme.background} ${activeTheme.text}`}>
      {/* Visual Floating Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md max-w-sm text-sm`}
            style={{
              backgroundColor: toast.type === "success" ? "rgba(6, 78, 59, 0.9)" : "rgba(153, 27, 27, 0.9)",
              borderColor: toast.type === "success" ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)",
            }}
          >
            {toast.type === "success" ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="font-medium text-white">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Core View Router */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {selectedAnalyticsId ? (
          // Deep-dive Analytics Screen
          <AnalyticsView
            redirectId={selectedAnalyticsId}
            onBack={() => {
              setSelectedAnalyticsId(null);
              fetchRedirects();
            }}
            activeTheme={activeTheme}
          />
        ) : (
          <div className="space-y-8">
            {/* Elegant Display Header */}
            <header className={`flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-6 transition-colors duration-300 ${activeTheme.cardBorder}`}>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${activeTheme.accentGradient} flex items-center justify-center text-white shadow-lg shadow-indigo-500/15`}>
                    <QrCode className="w-6 h-6 animate-pulse" />
                  </div>
                  <h1 className={`text-3xl font-display font-bold tracking-tight transition-colors duration-300 ${activeTheme.headingText}`}>
                    Dynamic <span className={`text-transparent bg-clip-text bg-gradient-to-r transition-all duration-300 ${activeTheme.accentGradient}`}>QR Studio</span>
                  </h1>
                </div>
                <p className={`text-sm transition-colors duration-300 ${activeTheme.secondaryText} max-w-xl`}>
                  Generate permanent QR codes with changeable destination links. Update your target URL instantly without reprint.
                </p>
              </div>

              {/* Header Actions */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Dynamic Theme Picker */}
                <div className="relative">
                  <button
                    onClick={() => setShowThemePicker(!showThemePicker)}
                    className={`p-3 rounded-xl flex items-center justify-center border transition shadow-sm ${
                      activeTheme.isDark 
                        ? "bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/60" 
                        : "bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                    title="Choose application theme"
                  >
                    <Palette className={`w-4 h-4 ${activeTheme.accentText}`} />
                  </button>

                  <AnimatePresence>
                    {showThemePicker && (
                      <>
                        {/* Overlay to dismiss */}
                        <div className="fixed inset-0 z-10" onClick={() => setShowThemePicker(false)} />
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className={`absolute right-0 mt-2 w-56 rounded-2xl border p-2 shadow-2xl z-20 backdrop-blur-md ${
                            activeTheme.isDark 
                              ? "bg-slate-950/95 border-slate-800 text-slate-200" 
                              : "bg-white border-slate-200 text-slate-800"
                          }`}
                        >
                          <div className="px-3 py-2 border-b border-slate-800/10 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Choose Vibe
                          </div>
                          <div className="space-y-1 mt-1.5">
                            {Object.values(THEME_PRESETS).map((p) => {
                              const isSelected = theme === p.id;
                              return (
                                <button
                                  key={p.id}
                                  onClick={() => {
                                    setTheme(p.id as any);
                                    setShowThemePicker(false);
                                    showToast(`Theme switched to ${p.name}!`);
                                  }}
                                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                                    isSelected 
                                      ? activeTheme.isDark ? "bg-slate-900 text-white font-semibold" : "bg-indigo-50 text-indigo-700 font-semibold"
                                      : activeTheme.isDark ? "hover:bg-slate-900/50 text-slate-400 hover:text-slate-200" : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    {/* Small round color indicators */}
                                    <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${p.accentGradient} border border-white/10 shrink-0 shadow-sm`} />
                                    <span>{p.name}</span>
                                  </div>
                                  {isSelected && (
                                    <Check className={`w-3.5 h-3.5 ${activeTheme.accentText}`} />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={fetchRedirects}
                  disabled={loading}
                  className={`p-2.5 border rounded-xl transition disabled:opacity-50 ${
                    activeTheme.isDark
                      ? "bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/60"
                      : "bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                  title="Reload dashboard database"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleExportDB}
                  className={`p-2.5 border rounded-xl transition flex items-center gap-1.5 ${
                    activeTheme.isDark
                      ? "bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/60"
                      : "bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                  title="Export Database (db.json) for static build hosting"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden md:inline text-xs font-semibold">Export DB</span>
                </button>
                <div className={`flex border rounded-xl p-1 shrink-0 transition-colors ${activeTheme.isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-200/50 border-slate-300/60'}`}>
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                      activeTab === "dashboard" ? activeTheme.buttonActive : `${activeTheme.secondaryText} hover:text-slate-200`
                    }`}
                  >
                    My QR Codes
                  </button>
                  <button
                    onClick={() => setActiveTab("create")}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                      activeTab === "create" ? activeTheme.buttonActive : `${activeTheme.secondaryText} hover:text-slate-200`
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New QR Code
                  </button>
                </div>
              </div>
            </header>

            {/* Quick Summary Cards (Only shown on Dashboard view) */}
            {activeTab === "dashboard" && (
              <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className={`${activeTheme.cardBg} border ${activeTheme.cardBorder} p-5 rounded-2xl flex items-center justify-between transition-all duration-300`}>
                  <div>
                    <p className={`text-xs font-medium uppercase tracking-wider ${activeTheme.secondaryText}`}>Total Active QR Codes</p>
                    <h3 className={`text-3xl font-bold font-mono mt-1 ${activeTheme.headingText}`}>{activeCount} <span className="text-xs font-sans text-slate-500">/ {redirects.length} total</span></h3>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg font-mono transition-colors duration-300 ${activeTheme.isDark ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border border-indigo-200 text-indigo-600'}`}>
                    {redirects.length}
                  </div>
                </div>

                <div className={`${activeTheme.cardBg} border ${activeTheme.cardBorder} p-5 rounded-2xl flex items-center justify-between transition-all duration-300`}>
                  <div>
                    <p className={`text-xs font-medium uppercase tracking-wider ${activeTheme.secondaryText}`}>Total Scans Recieved</p>
                    <h3 className={`text-3xl font-bold font-mono mt-1 ${activeTheme.headingText}`}>{totalScans}</h3>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-colors duration-300 ${activeTheme.isDark ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border border-emerald-200 text-emerald-600'}`}>
                    <Eye className="w-6 h-6" />
                  </div>
                </div>

                <div className={`${activeTheme.cardBg} border ${activeTheme.cardBorder} p-5 rounded-2xl flex items-center justify-between transition-all duration-300`}>
                  <div>
                    <p className={`text-xs font-medium uppercase tracking-wider ${activeTheme.secondaryText}`}>Activity (Last 24h)</p>
                    <h3 className={`text-3xl font-bold font-mono mt-1 ${activeTheme.headingText}`}>{totalInLast24h} <span className="text-xs font-sans text-slate-500">scans</span></h3>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-colors duration-300 ${activeTheme.isDark ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400' : 'bg-purple-50 border border-purple-200 text-purple-600'}`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>
              </section>
            )}

            {/* Main Tabs Display */}
             <main>
              {activeTab === "create" ? (
                // --- CREATE QR CODE SCREEN ---
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Explanatory Help Sidebar */}
                  <div className={`border rounded-2xl p-6 space-y-6 transition-all duration-300 ${activeTheme.cardBg} ${activeTheme.cardBorder}`}>
                    <div className="space-y-2">
                      <h3 className={`text-lg font-display font-bold flex items-center gap-2 transition-colors duration-300 ${activeTheme.headingText}`}>
                        <HelpCircle className={`w-5 h-5 ${activeTheme.accentText}`} />
                        How Dynamic QR Works
                      </h3>
                      <p className={`text-sm transition-colors duration-300 ${activeTheme.secondaryText}`}>
                        Unlike static QRs that bake links directly into pixel structures, a Dynamic QR points to a permanent short link.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs shrink-0 font-bold transition-all duration-300 ${
                          activeTheme.isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}>1</div>
                        <div>
                          <h4 className={`text-xs font-bold uppercase transition-colors duration-300 ${activeTheme.headingText}`}>Create Shortcut</h4>
                          <p className={`text-xs mt-0.5 transition-colors duration-300 ${activeTheme.secondaryText}`}>We link a random or custom slug like <code className={`${activeTheme.accentText} font-mono`}>/r/my-link</code> to your destination.</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs shrink-0 font-bold transition-all duration-300 ${
                          activeTheme.isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}>2</div>
                        <div>
                          <h4 className={`text-xs font-bold uppercase transition-colors duration-300 ${activeTheme.headingText}`}>Print Forever</h4>
                          <p className={`text-xs mt-0.5 transition-colors duration-300 ${activeTheme.secondaryText}`}>Download your styled QR image. Print it on stickers, menus, brochures, or packaging.</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs shrink-0 font-bold transition-all duration-300 ${
                          activeTheme.isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}>3</div>
                        <div>
                          <h4 className={`text-xs font-bold uppercase transition-colors duration-300 ${activeTheme.headingText}`}>Redirect Anytime</h4>
                          <p className={`text-xs mt-0.5 transition-colors duration-300 ${activeTheme.secondaryText}`}>Change the target destination URL in this panel. Existing codes will route scanners to the new page instantly.</p>
                        </div>
                      </div>
                    </div>

                    <div className={`border-t pt-4 text-xs transition-colors duration-300 ${activeTheme.cardBorder} ${activeTheme.secondaryText}`}>
                      The printed code remains completely unchanged, saving printing costs and time.
                    </div>
                  </div>

                  {/* Creation Form Block */}
                  <div className={`lg:col-span-2 border rounded-2xl p-6 sm:p-8 shadow-xl transition-all duration-300 ${activeTheme.cardBg} ${activeTheme.cardBorder}`}>
                    <h2 className={`text-xl font-display font-bold mb-6 transition-colors duration-300 ${activeTheme.headingText}`}>Configure New Dynamic QR Code</h2>
                    
                    <form onSubmit={handleCreate} className="space-y-6">
                      <div className="space-y-1.5">
                        <label className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${activeTheme.text}`}>QR Code Label / Name</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g., Summer Restaurant Menu, Business Card Link"
                          className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/45 transition placeholder-slate-500 border ${activeTheme.inputBg} ${activeTheme.cardBorder} ${activeTheme.headingText}`}
                        />
                        <p className={`text-xs transition-colors duration-300 ${activeTheme.secondaryText}`}>Used strictly for management and reporting in your dashboard.</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${activeTheme.text}`}>Destination target URL</label>
                        <div className="relative">
                          <Link2 className={`absolute left-4 top-3.5 w-4 h-4 transition-colors duration-300 ${activeTheme.secondaryText}`} />
                          <input
                            type="url"
                            required
                            value={destinationUrl}
                            onChange={(e) => setDestinationUrl(e.target.value)}
                            placeholder="https://example.com/your-target-file.pdf"
                            className={`w-full rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/45 transition placeholder-slate-500 font-mono border ${activeTheme.inputBg} ${activeTheme.cardBorder} ${activeTheme.headingText}`}
                          />
                        </div>
                        <p className={`text-xs transition-colors duration-300 ${activeTheme.secondaryText}`}>Where scanners will instantly land. You can replace this target URL at any time later.</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${activeTheme.text}`}>Optional center Logo (PNG/JPG)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => setCreateLogoData(ev.target?.result as string);
                            reader.readAsDataURL(f);
                          }}
                          className={`w-full rounded-xl px-4 py-2 text-sm transition border ${activeTheme.inputBg} ${activeTheme.cardBorder}`}
                        />
                        {createLogoData && (
                          <img src={createLogoData} alt="logo preview" className="w-24 h-24 object-contain rounded-md mt-2" />
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${activeTheme.text}`}>Custom Redirect URL Alias (Optional)</label>
                          <span className={`text-[10px] font-semibold font-mono transition-colors duration-300 ${activeTheme.accentText}`}>Custom Slug</span>
                        </div>
                        <div className={`flex rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/45 transition border ${
                          activeTheme.isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-slate-100 border-slate-200'
                        }`}>
                          <span className={`px-3.5 py-3 text-xs font-mono select-none flex items-center border-r shrink-0 ${
                            activeTheme.isDark ? 'bg-slate-800 text-slate-400 border-slate-700/60' : 'bg-slate-200/60 text-slate-500 border-slate-300/60'
                          }`}>
                            {window.location.origin}/r/
                          </span>
                          <input
                            type="text"
                            value={customSlug}
                            onChange={(e) => setCustomSlug(e.target.value)}
                            placeholder="summer-promo"
                            className={`w-full bg-transparent px-4 py-3 text-sm focus:outline-none font-mono ${activeTheme.isDark ? 'text-slate-200 placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}`}
                          />
                        </div>
                        <p className={`text-xs transition-colors duration-300 ${activeTheme.secondaryText}`}>Leave blank to generate a short, secure random link (e.g. <code className={`px-1 py-0.5 rounded ${activeTheme.accentBg} ${activeTheme.accentText}`}>gY7f2A</code>).</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${activeTheme.text}`}>Categorization Tags</label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddTag();
                                }
                              }}
                              placeholder="Type a tag (e.g. Marketing, Menu) and click Add or press Enter"
                              className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/45 transition placeholder-slate-500 border ${activeTheme.inputBg} ${activeTheme.cardBorder} ${activeTheme.headingText}`}
                            />
                            <button
                              type="button"
                              onClick={handleAddTag}
                              className={`px-4 border rounded-xl text-xs font-semibold transition shrink-0 ${
                                activeTheme.isDark
                                  ? "bg-slate-850 hover:bg-slate-700/80 text-slate-200 border-slate-700"
                                  : "bg-white hover:bg-slate-50 text-slate-750 border-slate-200"
                              }`}
                            >
                              Add
                            </button>
                          </div>
                          
                          {/* Quick Select Presets */}
                          <div className={`flex flex-wrap items-center gap-1.5 text-xs transition-colors duration-300 ${activeTheme.secondaryText}`}>
                            <span className="text-[11px]">Popular:</span>
                            {["Marketing", "Events", "Menu", "Promo", "Feedback"].map((preset) => {
                              const isAdded = tags.includes(preset);
                              return (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => handleToggleTag(preset)}
                                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition border ${
                                    isAdded
                                      ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/50"
                                      : activeTheme.isDark
                                        ? "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850 hover:text-slate-300"
                                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800"
                                  }`}
                                >
                                  {isAdded ? "✓ " : "+ "}
                                  {preset}
                                </button>
                              );
                            })}
                          </div>

                          {/* Current Tags List */}
                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1.5">
                              {tags.map((tg) => (
                                <span
                                  key={tg}
                                  className={`inline-flex items-center gap-1.5 border px-2.5 py-1 rounded-full text-xs font-semibold transition-colors duration-300 ${activeTheme.accentBg} ${activeTheme.accentText} ${activeTheme.accentBorder}`}
                                >
                                  {tg}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tg)}
                                    className={`rounded-full w-3.5 h-3.5 inline-flex items-center justify-center text-[10px] transition-colors font-bold ${
                                      activeTheme.isDark ? 'hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-200' : 'hover:bg-indigo-100 text-indigo-600 hover:text-indigo-800'
                                    }`}
                                  >
                                    ✕
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className={`flex items-center justify-end gap-3 pt-4 border-t transition-colors duration-300 ${activeTheme.cardBorder}`}>
                        <button
                          type="button"
                          onClick={() => setActiveTab("dashboard")}
                          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition border ${
                            activeTheme.isDark
                              ? "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700"
                              : "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border-slate-200"
                          }`}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-600/20 transition flex items-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Generating Databases...
                            </>
                          ) : (
                            <>
                              <QrCode className="w-4 h-4" />
                              Generate Dynamic QR
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                // --- MY QR CODES DASHBOARD ---
                <div className="space-y-6">
                  {loading && redirects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                      <p className="text-slate-400 text-sm font-medium">Scanning dynamic routing tables...</p>
                    </div>
                  ) : error ? (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto">
                      <p className="text-rose-400 font-medium">Error loading active dynamic routes: {error}</p>
                      <button
                        onClick={fetchRedirects}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : redirects.length === 0 ? (
                    // Onboarding Empty State Card
                    <div className="bg-slate-800/10 border border-slate-700/50 rounded-2xl p-10 sm:p-16 text-center max-w-2xl mx-auto space-y-6 shadow-xl">
                      <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto text-3xl">
                        <QrCode className="w-8 h-8" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-display font-bold text-white tracking-tight">Generate Your First Dynamic QR</h3>
                        <p className="text-sm text-slate-400 max-w-md mx-auto">
                          There are currently no dynamic codes in your workspace. Build one to print a permanent code that can route scanners to updated links.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab("create")}
                        className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition inline-flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Create Dynamic Link
                      </button>
                    </div>
                  ) : (
                    // Core Active List
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 px-2">
                        <div className="space-y-0.5">
                          <h3 className={`text-sm font-semibold uppercase tracking-wider transition-colors duration-300 ${activeTheme.secondaryText}`}>Dynamic Codes</h3>
                          <p className={`text-xs font-mono transition-colors duration-300 ${activeTheme.secondaryText}`}>
                            Showing {filteredRedirects.length} of {redirects.length} active links
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Tag Filter Dropdown */}
                          <div className={`flex items-center gap-1.5 border rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-300 ${
                            activeTheme.isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                          }`}>
                            <span className={`font-medium ${activeTheme.secondaryText}`}>Tag:</span>
                            <select
                              value={selectedTagFilter}
                              onChange={(e) => setSelectedTagFilter(e.target.value)}
                              className="bg-transparent outline-none cursor-pointer focus:text-indigo-500 font-semibold"
                            >
                              <option value="all" className={activeTheme.isDark ? "bg-slate-950 text-slate-200" : "bg-white text-slate-800"}>All Tags</option>
                              {allUniqueTags.map((tag) => (
                                <option key={tag} value={tag} className={activeTheme.isDark ? "bg-slate-950 text-slate-200" : "bg-white text-slate-800"}>
                                  {tag}
                                </option>
                              ))}
                            </select>
                          </div>

                          <button
                            onClick={handleExportCSV}
                            className={`px-3.5 py-2 border rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-sm ${
                              activeTheme.isDark
                                ? "bg-slate-800 hover:bg-slate-700/80 border-slate-700/50 text-slate-200 hover:text-white"
                                : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900"
                            }`}
                          >
                            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                            Export CSV List
                          </button>
                        </div>
                      </div>

                      {filteredRedirects.length === 0 ? (
                        <div className={`border rounded-2xl py-12 text-center text-sm transition-all duration-300 ${activeTheme.cardBg} ${activeTheme.cardBorder}`}>
                          No dynamic codes found with the tag &quot;{selectedTagFilter}&quot;.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {filteredRedirects.map((link) => (
                          <div
                            key={link.id}
                            className={`border rounded-2xl p-5 shadow-lg flex flex-col justify-between gap-5 transition duration-150 ${activeTheme.cardBg} ${activeTheme.cardBorder} ${
                              link.status === "paused" ? "opacity-75" : ""
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch">
                              <div className="flex-1 min-w-0 space-y-3 w-full flex flex-col justify-between">
                                <div className="space-y-3">
                                  {/* Header & Status Indicator */}
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                      <h4 className={`font-display font-bold text-md tracking-tight leading-tight transition-colors duration-300 ${activeTheme.headingText}`}>
                                        {link.name}
                                      </h4>
                                      <p className={`text-[11px] font-medium transition-colors duration-300 ${activeTheme.secondaryText}`}>
                                        Generated {new Date(link.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                                      </p>
                                      {link.tags && link.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                          {link.tags.map((tag) => (
                                            <span
                                              key={tag}
                                              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide border transition-colors duration-300 ${activeTheme.accentBg} ${activeTheme.accentText} ${activeTheme.accentBorder}`}
                                            >
                                              {tag}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    <button
                                      onClick={() => handleStatusToggle(link)}
                                      className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-full border transition flex items-center gap-1 shrink-0 ${
                                        link.status === "active"
                                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                      }`}
                                      title={link.status === "active" ? "Pause redirect" : "Resume redirect"}
                                    >
                                      {link.status === "active" ? (
                                        <>
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                          Live
                                        </>
                                      ) : (
                                        <>
                                          <Pause className="w-2.5 h-2.5" />
                                          Paused
                                        </>
                                      )}
                                    </button>
                                  </div>

                                  {/* Target details and links */}
                                  <div className={`space-y-2 pt-2 border-t transition-colors duration-300 ${activeTheme.cardBorder}`}>
                                    <div className="space-y-1">
                                      <span className={`text-[10px] uppercase tracking-wider font-semibold transition-colors duration-300 ${activeTheme.secondaryText}`}>Printed QR</span>
                                      <div className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-300 ${
                                        activeTheme.isDark 
                                          ? 'bg-slate-950/40 border-slate-800/60 text-slate-300' 
                                          : 'bg-slate-100/50 border-slate-200/50 text-slate-700'
                                      }`}>
                                        <span className="font-mono text-xs truncate max-w-[140px] sm:max-w-[180px] md:max-w-[150px] lg:max-w-[220px]" title={link.destinationUrl}>
                                          Encodes destination URL
                                        </span>
                                        <span className={`text-xs ${activeTheme.secondaryText}`}>Preview below</span>
                                      </div>
                                    </div>

                                    <div className="space-y-1">
                                      <span className={`text-[10px] uppercase tracking-wider font-semibold transition-colors duration-300 ${activeTheme.secondaryText}`}>Instant target Destination</span>
                                      <div className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-300 ${
                                        activeTheme.isDark 
                                          ? 'bg-slate-950/40 border-slate-800/60 text-slate-300' 
                                          : 'bg-slate-100/50 border-slate-200/50 text-slate-700'
                                      }`}>
                                        <span className="font-mono text-xs truncate max-w-[140px] sm:max-w-[180px] md:max-w-[150px] lg:max-w-[220px]" title={link.destinationUrl}>
                                          {link.destinationUrl}
                                        </span>
                                        <button
                                          onClick={() => {
                                            setEditingLink(link);
                                            setEditUrl(link.destinationUrl);
                                            setEditName(link.name);
                                            setEditTags(link.tags || []);
                                            setEditTagInput("");
                                          }}
                                          className={`p-1 rounded transition-colors ${
                                            activeTheme.isDark ? 'hover:bg-slate-800 text-indigo-400 hover:text-indigo-300' : 'hover:bg-slate-200 text-indigo-600 hover:text-indigo-700'
                                          }`}
                                          title="Instantly Change target URL"
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Right side: Dynamic QR Code Preview */}
                              <div className="flex flex-col items-center justify-center self-center sm:self-stretch shrink-0 w-full sm:w-28 gap-2 border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0 sm:pl-4 transition-colors duration-300" style={{ borderColor: activeTheme.isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)' }}>
                                <button
                                  onClick={() => {
                                    setCustomizingLink({ id: link.id, name: link.name, destinationUrl: link.destinationUrl });
                                  }}
                                  className="group relative bg-white p-1 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-500/50 transition-all duration-300 cursor-pointer overflow-hidden flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28"
                                  title="Click to style and download this QR Code"
                                >
                                  <QRPreview
                                    canvasId={`qr-canvas-${link.id}`}
                                    url={link.destinationUrl}
                                    className="w-full h-full object-contain"
                                    config={link.qrConfig}
                                  />
                                  {/* hover overlay removed per request */}
                                </button>
                              </div>
                            </div>

                            {/* Cards Action panel */}
                            <div className={`flex items-center justify-between pt-3 border-t transition-colors duration-300 ${activeTheme.cardBorder}`}>
                              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <span className={`font-mono font-bold px-2 py-0.5 rounded-md border transition-colors duration-300 ${activeTheme.accentBg} ${activeTheme.accentText} ${activeTheme.accentBorder}`}>
                                  {link.scanCount}
                                </span>
                                <span className={`font-medium transition-colors duration-300 ${activeTheme.secondaryText}`}>total scans</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setCustomizingLink({ id: link.id, name: link.name, destinationUrl: link.destinationUrl })}
                                  className={`p-2 rounded-xl border transition flex items-center justify-center ${
                                    activeTheme.isDark
                                      ? "bg-slate-900 hover:bg-slate-950 text-slate-300 hover:text-indigo-400 border-slate-700/30"
                                      : "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 border-slate-200"
                                  }`}
                                  title="Style QR Code"
                                >
                                  <Sliders className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => {
                                    const canvas = document.getElementById(`qr-canvas-${link.id}`) as HTMLCanvasElement | null;
                                    if (!canvas) return;
                                    const url = canvas.toDataURL("image/png");
                                    const a = document.createElement("a");
                                    a.href = url;
                                    a.download = `${link.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-qr.png`;
                                    a.click();
                                  }}
                                  className={`p-2 rounded-xl border transition flex items-center justify-center ${
                                    activeTheme.isDark
                                      ? "bg-slate-900 hover:bg-slate-950 text-slate-300 hover:text-indigo-400 border-slate-700/30"
                                      : "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 border-slate-200"
                                  }`}
                                  title="Download QR image"
                                >
                                  <Download className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => setSelectedAnalyticsId(link.id)}
                                  className={`py-2 px-3.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
                                    activeTheme.isDark
                                      ? "bg-slate-900 hover:bg-slate-950 text-slate-300 hover:text-indigo-400 border-slate-700/30"
                                      : "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 border-slate-200"
                                  }`}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  Analytics
                                </button>

                                <button
                                  onClick={() => handleDelete(link.id, link.name)}
                                  className={`p-2 rounded-xl border transition flex items-center justify-center ${
                                    activeTheme.isDark
                                      ? "bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border-slate-700/30"
                                      : "bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border-slate-200"
                                  }`}
                                  title="Delete Permanent Link"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        )}
      </div>

      {/* MODAL 1: Interactive QR Code Styling Customizer */}
      <AnimatePresence>
        {customizingLink && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl transition-all duration-300 ${activeTheme.cardBg} ${activeTheme.cardBorder}`}
            >
              <div className={`px-6 py-4 border-b flex justify-between items-center transition-colors duration-300 ${activeTheme.isDark ? 'bg-slate-950 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                <div>
                  <h3 className={`font-display font-bold text-lg transition-colors duration-300 ${activeTheme.headingText}`}>QR Studio Generator</h3>
                  <p className={`text-xs transition-colors duration-300 ${activeTheme.secondaryText}`}>Styling parameters for &quot;{customizingLink.name}&quot;</p>
                </div>
                <button
                  onClick={() => setCustomizingLink(null)}
                  className={`p-1 rounded-lg transition ${activeTheme.isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                <QRCodeCustomizer
                  redirectId={customizingLink.id}
                  redirectUrl={customizingLink.destinationUrl || (redirects.find((r) => r.id === customizingLink.id)?.destinationUrl ?? "")}
                  name={customizingLink.name}
                  activeTheme={activeTheme}
                  initialConfig={redirects.find((r) => r.id === customizingLink.id)?.qrConfig}
                  onSaveConfig={handleSaveQRConfig}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

        {/* Modal: Logo Prompt during Create */}
        <AnimatePresence>
          {showLogoPrompt && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`w-full max-w-md p-6 rounded-2xl ${activeTheme.cardBg} ${activeTheme.cardBorder}`}>
                <h3 className={`font-display font-bold text-lg mb-2 ${activeTheme.headingText}`}>Add a center logo?</h3>
                <p className={`text-sm mb-4 ${activeTheme.secondaryText}`}>You can upload a small PNG/JPG to render at the center of the QR code. This improves branding but must be legible.</p>

                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => setCreateLogoData(ev.target?.result as string);
                      reader.readAsDataURL(f);
                    }}
                    className={`w-full rounded-xl px-4 py-2 text-sm transition border ${activeTheme.inputBg} ${activeTheme.cardBorder}`}
                  />
                  {createLogoData && <img src={createLogoData} alt="logo preview" className="w-28 h-28 object-contain rounded-md" />}

                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => { setShowLogoPrompt(false); submitCreate(); }} className={`px-4 py-2 rounded-xl ${activeTheme.buttonActive}`}>Create (no logo)</button>
                    <button onClick={() => { setShowLogoPrompt(false); submitCreate(); }} className={`px-4 py-2 rounded-xl border ${activeTheme.buttonHover}`}>Skip</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      {/* MODAL 2: Instant Destination Modifier */}
      <AnimatePresence>
        {editingLink && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl transition-all duration-300 ${activeTheme.cardBg} ${activeTheme.cardBorder}`}
            >
              <div className={`px-6 py-4 border-b flex justify-between items-center transition-colors duration-300 ${activeTheme.isDark ? 'bg-slate-950 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                <h3 className={`font-display font-bold text-md transition-colors duration-300 ${activeTheme.headingText}`}>Edit Target Destination</h3>
                <button
                  onClick={() => setEditingLink(null)}
                  className={`p-1 rounded-lg transition ${activeTheme.isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${activeTheme.text}`}>QR Code Display Label</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition border ${activeTheme.inputBg} ${activeTheme.cardBorder} ${activeTheme.headingText}`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${activeTheme.text}`}>New Target Destination URL</label>
                  <input
                    type="url"
                    required
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className={`w-full rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition border ${activeTheme.inputBg} ${activeTheme.cardBorder} ${activeTheme.headingText}`}
                  />
                  <p className={`text-[11px] mt-1 transition-colors duration-300 ${activeTheme.secondaryText}`}>
                    Once saved, scans of this printed QR code will immediately redirect to the new URL destination without any latency!
                  </p>
                </div>

                <div className="space-y-1">
                  <label className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${activeTheme.text}`}>Optional center Logo (PNG/JPG)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => setEditLogoData(ev.target?.result as string);
                      reader.readAsDataURL(f);
                    }}
                    className={`w-full rounded-xl px-4 py-2 text-sm transition border ${activeTheme.inputBg} ${activeTheme.cardBorder}`}
                  />
                  {editLogoData && (
                    <img src={editLogoData} alt="logo preview" className="w-24 h-24 object-contain rounded-md mt-2" />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${activeTheme.text}`}>Edit Categorization Tags</label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editTagInput}
                        onChange={(e) => setEditTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddEditTag();
                          }
                        }}
                        placeholder="Add tag and click Add or press Enter"
                        className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition border placeholder-slate-500 ${activeTheme.inputBg} ${activeTheme.cardBorder} ${activeTheme.headingText}`}
                      />
                      <button
                        type="button"
                        onClick={handleAddEditTag}
                        className={`px-4 border rounded-xl text-xs font-semibold transition shrink-0 ${
                          activeTheme.isDark
                            ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                            : "bg-white hover:bg-slate-50 text-slate-750 border-slate-200"
                        }`}
                      >
                        Add
                      </button>
                    </div>

                    {/* Quick presets for edit */}
                    <div className={`flex flex-wrap items-center gap-1.5 text-xs transition-colors duration-300 ${activeTheme.secondaryText}`}>
                      <span className="text-[11px]">Popular:</span>
                      {["Marketing", "Events", "Menu", "Promo", "Feedback"].map((preset) => {
                        const isAdded = editTags.includes(preset);
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleToggleEditTag(preset)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition border ${
                              isAdded
                                ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/50"
                                : activeTheme.isDark
                                  ? "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-300"
                                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-850"
                            }`}
                          >
                            {isAdded ? "✓ " : "+ "}
                            {preset}
                          </button>
                        );
                      })}
                    </div>

                    {/* Current Edit Tags List */}
                    {editTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {editTags.map((tg) => (
                          <span
                            key={tg}
                            className={`inline-flex items-center gap-1 border px-2.5 py-1 rounded-full text-xs font-semibold animate-fadeIn transition-colors duration-300 ${activeTheme.accentBg} ${activeTheme.accentText} ${activeTheme.accentBorder}`}
                          >
                            {tg}
                            <button
                              type="button"
                              onClick={() => handleRemoveEditTag(tg)}
                              className={`rounded-full w-3.5 h-3.5 inline-flex items-center justify-center text-[10px] transition-colors font-bold ${
                                activeTheme.isDark ? 'hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-200' : 'hover:bg-indigo-100 text-indigo-600 hover:text-indigo-800'
                              }`}
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className={`flex items-center justify-end gap-2 pt-4 border-t transition-colors duration-300 ${activeTheme.cardBorder}`}>
                  <button
                    type="button"
                    onClick={() => setEditingLink(null)}
                    className={`px-4 py-2 border rounded-xl text-xs font-semibold transition ${
                      activeTheme.isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-850"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
                  >
                    Save Target Destination
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className={`mt-8 border-t pt-4 pb-4 transition-colors duration-300 ${activeTheme.cardBorder}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-slate-400 text-center">
          <p className="text-[11px] text-slate-500 mx-auto inline-block leading-relaxed">
            © {new Date().getFullYear()} Ranbidge Solutions Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
