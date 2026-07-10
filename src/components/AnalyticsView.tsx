import { useState, useEffect } from "react";
import { RedirectLinkDetailed, Scan, ThemeConfig } from "../types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  Smartphone,
  Globe,
  Link,
  Loader2,
  TrendingUp,
  Clock,
  ArrowLeft,
  RefreshCw,
  Eye,
  Settings,
  Grid,
} from "lucide-react";

interface AnalyticsViewProps {
  redirectId: string;
  onBack: () => void;
  activeTheme: ThemeConfig;
}

export default function AnalyticsView({ redirectId, onBack, activeTheme }: AnalyticsViewProps) {
  const [data, setData] = useState<RedirectLinkDetailed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<7 | 30>(7);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/redirects/${redirectId}`);
      if (!res.ok) {
        throw new Error("Could not retrieve detailed scan logs.");
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "An error occurred fetching analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [redirectId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className={`w-10 h-10 animate-spin ${activeTheme.accentText}`} />
        <p className={`text-sm font-medium transition-colors duration-300 ${activeTheme.secondaryText}`}>Analyzing scan databases...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto">
        <p className="text-rose-400 font-medium">{error || "Analytics not available."}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const scans = data.scans || [];

  // --- Calculations for Analytics ---

  // 1. Scans in last 24h
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const scans24h = scans.filter((s) => new Date(s.timestamp).getTime() > oneDayAgo).length;

  // 2. Timeline Chart Data
  const getTimelineData = () => {
    const timelineDays = timeframe;
    const today = new Date();
    const resultMap: Record<string, { label: string; scans: number }> = {};
    const dateList: string[] = [];

    // Initialize map with empty counts for the last N days (safeguard against empty dates)
    for (let i = timelineDays - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const dateKey = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      resultMap[dateKey] = { label, scans: 0 };
      dateList.push(dateKey);
    }

    // Populate actual scan counts
    scans.forEach((scan) => {
      const scanDateKey = scan.timestamp.split("T")[0];
      if (resultMap[scanDateKey]) {
        resultMap[scanDateKey].scans += 1;
      }
    });

    return dateList.map((key) => ({
      date: resultMap[key].label,
      "Scan Count": resultMap[key].scans,
    }));
  };

  const timelineChartData = getTimelineData();

  // Helper for computing breakdown percentages
  const getBreakdown = (key: keyof Pick<Scan, "device" | "browser" | "os" | "referrer">) => {
    const counts: Record<string, number> = {};
    scans.forEach((s) => {
      const val = s[key] || "Other / Unknown";
      counts[val] = (counts[val] || 0) + 1;
    });

    const total = scans.length || 1;
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  };

  const devicesBreakdown = getBreakdown("device");
  const browsersBreakdown = getBreakdown("browser");
  const osBreakdown = getBreakdown("os");
  const referrersBreakdown = getBreakdown("referrer");

  // Format date readable
  const formatReadableDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div id="analytics-view-root" className="space-y-8 animate-fade-in">
      {/* Upper Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className={`p-2 rounded-xl transition shrink-0 border ${
              activeTheme.isDark
                ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                : "bg-white hover:bg-slate-50 text-slate-750 border-slate-200"
            }`}
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${data.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              <h1 className={`text-2xl font-display font-bold tracking-tight transition-colors duration-300 ${activeTheme.headingText}`}>{data.name}</h1>
            </div>
            <p className={`text-sm mt-0.5 transition-colors duration-300 ${activeTheme.secondaryText}`}>
              Target Link: <a href={data.destinationUrl} target="_blank" rel="noopener noreferrer" className={`hover:underline inline-flex items-center gap-1 font-mono text-xs ${activeTheme.accentText}`}>{data.destinationUrl}</a>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={fetchAnalytics}
            className={`p-2.5 border rounded-xl transition ${
              activeTheme.isDark
                ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                : "bg-white hover:bg-slate-50 text-slate-750 border-slate-200"
            }`}
            title="Refresh Analytics Logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className={`border rounded-xl p-1 flex gap-1 ${activeTheme.isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
            <button
              onClick={() => setTimeframe(7)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition ${timeframe === 7 ? activeTheme.buttonActive : `${activeTheme.secondaryText} hover:text-slate-200`}`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeframe(30)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition ${timeframe === 30 ? activeTheme.buttonActive : `${activeTheme.secondaryText} hover:text-slate-200`}`}
            >
              30 Days
            </button>
          </div>
        </div>
      </div>

      {/* Analytics High Level Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className={`p-5 rounded-2xl flex items-center gap-4 border transition-all duration-300 ${activeTheme.cardBg} ${activeTheme.cardBorder}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${activeTheme.isDark ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border border-indigo-100 text-indigo-600'}`}>
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <p className={`text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${activeTheme.secondaryText}`}>Total Scans</p>
            <h3 className={`text-2xl font-bold font-mono mt-0.5 transition-colors duration-300 ${activeTheme.headingText}`}>{data.scanCount}</h3>
          </div>
        </div>

        <div className={`p-5 rounded-2xl flex items-center gap-4 border transition-all duration-300 ${activeTheme.cardBg} ${activeTheme.cardBorder}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${activeTheme.isDark ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border border-emerald-100 text-emerald-600'}`}>
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className={`text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${activeTheme.secondaryText}`}>Scans (Last 24h)</p>
            <h3 className={`text-2xl font-bold font-mono mt-0.5 transition-colors duration-300 ${activeTheme.headingText}`}>{scans24h}</h3>
          </div>
        </div>

        <div className={`p-5 rounded-2xl flex items-center gap-4 border transition-all duration-300 ${activeTheme.cardBg} ${activeTheme.cardBorder}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${activeTheme.isDark ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' : 'bg-amber-50 border border-amber-100 text-emerald-600'}`}>
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className={`text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${activeTheme.secondaryText}`}>Created</p>
            <h3 className={`text-sm font-semibold mt-1.5 transition-colors duration-300 ${activeTheme.headingText}`}>{new Date(data.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</h3>
          </div>
        </div>
      </div>

      {/* Main Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Chart Panel */}
        <div className={`lg:col-span-2 p-5 border rounded-2xl shadow-xl flex flex-col justify-between transition-all duration-300 ${activeTheme.cardBg} ${activeTheme.cardBorder}`}>
          <div className="mb-4">
            <h3 className={`text-md font-display font-medium flex items-center gap-2 transition-colors duration-300 ${activeTheme.headingText}`}>
              <Clock className={`w-5 h-5 ${activeTheme.accentText}`} />
              Scans Over Time
            </h3>
            <p className={`text-xs transition-colors duration-300 ${activeTheme.secondaryText}`}>Chronological distribution of scans for the current period</p>
          </div>

          <div className="h-64 w-full">
            {scans.length === 0 ? (
              <div className={`h-full flex flex-col items-center justify-center ${activeTheme.secondaryText}`}>
                <Clock className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No scans logged yet. Share your QR to start tracking!</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={activeTheme.isDark ? "#6366f1" : "#4f46e5"} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={activeTheme.isDark ? "#6366f1" : "#4f46e5"} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={activeTheme.isDark ? "#334155" : "#cbd5e1"} opacity={0.3} />
                  <XAxis dataKey="date" stroke={activeTheme.isDark ? "#94a3b8" : "#475569"} fontSize={11} tickLine={false} />
                  <YAxis stroke={activeTheme.isDark ? "#94a3b8" : "#475569"} fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: activeTheme.isDark ? "#1e293b" : "#ffffff",
                      border: activeTheme.isDark ? "1px solid #475569" : "1px solid #cbd5e1",
                      borderRadius: "0.75rem",
                      color: activeTheme.isDark ? "#f1f5f9" : "#0f172a",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Scan Count"
                    stroke={activeTheme.isDark ? "#6366f1" : "#4f46e5"}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorScans)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Device breakdown Panel */}
        <div className={`p-5 border rounded-2xl shadow-xl space-y-6 flex flex-col justify-between transition-all duration-300 ${activeTheme.cardBg} ${activeTheme.cardBorder}`}>
          <div>
            <h3 className={`text-md font-display font-medium flex items-center gap-2 transition-colors duration-300 ${activeTheme.headingText}`}>
              <Smartphone className={`w-5 h-5 ${activeTheme.accentText}`} />
              Device Distribution
            </h3>
            <p className={`text-xs transition-colors duration-300 ${activeTheme.secondaryText}`}>Hardware scanned with</p>
          </div>

          <div className="space-y-4 my-auto">
            {scans.length === 0 ? (
              <div className={`text-center py-6 ${activeTheme.secondaryText}`}>
                <p className="text-sm">No hardware logs</p>
              </div>
            ) : (
              devicesBreakdown.map((item) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className={`flex items-center gap-1.5 transition-colors duration-300 ${activeTheme.statCardText || activeTheme.text}`}>
                      <Smartphone className="w-3.5 h-3.5 opacity-70" />
                      {item.name}
                    </span>
                    <span className={`transition-colors duration-300 ${activeTheme.secondaryText}`}>
                      {item.count} scans <span className={`font-mono font-semibold ${activeTheme.accentText}`}>({item.percentage}%)</span>
                    </span>
                  </div>
                  <div className={`h-2.5 w-full rounded-full overflow-hidden ${activeTheme.isDark ? 'bg-slate-950' : 'bg-slate-200'}`}>
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={`text-[10px] text-center border-t pt-3 transition-colors duration-300 ${activeTheme.isDark ? 'border-slate-800/60 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
            Mobile triggers account for the majority of scanner telemetry.
          </div>
        </div>
      </div>

      {/* Browsers, OS & Referrers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Browsers */}
        <div className={`p-5 border rounded-2xl shadow-xl space-y-4 transition-all duration-300 ${activeTheme.cardBg} ${activeTheme.cardBorder}`}>
          <h4 className={`text-sm font-display font-semibold flex items-center gap-2 transition-colors duration-300 ${activeTheme.headingText}`}>
            <Globe className="w-4 h-4 text-emerald-400" />
            Top Browsers
          </h4>
          <div className="space-y-3.5">
            {scans.length === 0 ? (
              <p className={`text-xs ${activeTheme.secondaryText}`}>No browser logs</p>
            ) : (
              browsersBreakdown.slice(0, 5).map((b) => (
                <div key={b.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={`font-medium transition-colors duration-300 ${activeTheme.isDark ? 'text-slate-300' : 'text-slate-750'}`}>{b.name}</span>
                    <span className={`font-mono transition-colors duration-300 ${activeTheme.secondaryText}`}>{b.percentage}%</span>
                  </div>
                  <div className={`h-1.5 w-full rounded-full overflow-hidden ${activeTheme.isDark ? 'bg-slate-950' : 'bg-slate-200'}`}>
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${b.percentage}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Operating Systems */}
        <div className={`p-5 border rounded-2xl shadow-xl space-y-4 transition-all duration-300 ${activeTheme.cardBg} ${activeTheme.cardBorder}`}>
          <h4 className={`text-sm font-display font-semibold flex items-center gap-2 transition-colors duration-300 ${activeTheme.headingText}`}>
            <Settings className="w-4 h-4 text-purple-400" />
            Operating Systems
          </h4>
          <div className="space-y-3.5">
            {scans.length === 0 ? (
              <p className={`text-xs ${activeTheme.secondaryText}`}>No OS logs</p>
            ) : (
              osBreakdown.slice(0, 5).map((o) => (
                <div key={o.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={`font-medium transition-colors duration-300 ${activeTheme.isDark ? 'text-slate-300' : 'text-slate-750'}`}>{o.name}</span>
                    <span className={`font-mono transition-colors duration-300 ${activeTheme.secondaryText}`}>{o.percentage}%</span>
                  </div>
                  <div className={`h-1.5 w-full rounded-full overflow-hidden ${activeTheme.isDark ? 'bg-slate-950' : 'bg-slate-200'}`}>
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${o.percentage}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Referrers */}
        <div className={`p-5 border rounded-2xl shadow-xl space-y-4 transition-all duration-300 ${activeTheme.cardBg} ${activeTheme.cardBorder}`}>
          <h4 className={`text-sm font-display font-semibold flex items-center gap-2 transition-colors duration-300 ${activeTheme.headingText}`}>
            <Link className="w-4 h-4 text-amber-400" />
            Traffic Sources (Referrers)
          </h4>
          <div className="space-y-3.5">
            {scans.length === 0 ? (
              <p className={`text-xs ${activeTheme.secondaryText}`}>No referrer logs</p>
            ) : (
              referrersBreakdown.slice(0, 5).map((r) => (
                <div key={r.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={`font-medium truncate max-w-[200px] transition-colors duration-300 ${activeTheme.isDark ? 'text-slate-300' : 'text-slate-750'}`} title={r.name}>{r.name}</span>
                    <span className={`font-mono shrink-0 transition-colors duration-300 ${activeTheme.secondaryText}`}>{r.count}</span>
                  </div>
                  <div className={`h-1.5 w-full rounded-full overflow-hidden ${activeTheme.isDark ? 'bg-slate-950' : 'bg-slate-200'}`}>
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${r.percentage}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Raw Logs Table */}
      <div className={`border rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${activeTheme.cardBg} ${activeTheme.cardBorder}`}>
        <div className={`px-5 py-4 border-b transition-colors duration-300 ${activeTheme.cardBorder}`}>
          <h3 className={`text-md font-display font-semibold flex items-center gap-2 transition-colors duration-300 ${activeTheme.headingText}`}>
            <Grid className={`w-5 h-5 ${activeTheme.secondaryText}`} />
            Recent Scan Events Log
          </h3>
          <p className={`text-xs mt-0.5 transition-colors duration-300 ${activeTheme.secondaryText}`}>Showing last 15 scans chronologically</p>
        </div>

        {scans.length === 0 ? (
          <div className={`py-12 text-center ${activeTheme.secondaryText}`}>
            <p className="text-sm">No scanned events recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className={`text-[11px] uppercase font-semibold tracking-wider border-b transition-colors duration-300 ${activeTheme.isDark ? 'bg-slate-950/40 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                  <th className="py-3 px-5">Time Scanned</th>
                  <th className="py-3 px-5">Hardware</th>
                  <th className="py-3 px-5">Browser</th>
                  <th className="py-3 px-5">OS</th>
                  <th className="py-3 px-5">Referrer</th>
                </tr>
              </thead>
              <tbody className={`divide-y transition-colors duration-300 ${activeTheme.isDark ? 'divide-slate-800/40' : 'divide-slate-200'}`}>
                {scans
                  .slice()
                  .reverse()
                  .slice(0, 15)
                  .map((scan) => (
                    <tr key={scan.id} className={`transition duration-150 hover:bg-slate-500/5 ${activeTheme.text}`}>
                      <td className="py-3 px-5 font-mono text-xs">{formatReadableDate(scan.timestamp)}</td>
                      <td className={`py-3 px-5 font-medium ${activeTheme.headingText}`}>{scan.device}</td>
                      <td className={`py-3 px-5 font-medium ${activeTheme.headingText}`}>{scan.browser}</td>
                      <td className={`py-3 px-5 font-medium ${activeTheme.headingText}`}>{scan.os}</td>
                      <td className="py-3 px-5 truncate max-w-[200px]" title={scan.referrer}>
                        {scan.referrer}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
