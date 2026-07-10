import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

interface Scan {
  id: string;
  timestamp: string;
  userAgent: string;
  browser: string;
  device: string;
  os: string;
  referrer: string;
}

interface RedirectLink {
  id: string; // the shortId / slug
  name: string;
  destinationUrl: string;
  createdAt: string;
  updatedAt: string;
  status: "active" | "paused";
  scanCount: number;
  scans: Scan[];
  tags?: string[];
  qrConfig?: any;
}

interface DatabaseSchema {
  redirects: RedirectLink[];
}

const DB_PATH = path.join(process.cwd(), "data", "db.json");

// Ensure db directory and file exist
function ensureDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ redirects: [] }, null, 2), "utf-8");
  }
}

function readDb(): DatabaseSchema {
  ensureDb();
  try {
    const data = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading DB:", err);
    return { redirects: [] };
  }
}

function writeDb(data: DatabaseSchema) {
  ensureDb();
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing DB:", err);
  }
}

// Generate an alphanumeric random short ID
function generateShortId(length = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Simple browser, device, and OS detection helper
function parseUserAgent(ua: string) {
  let browser = "Other";
  let device = "Desktop";
  let os = "Other";

  const lowerUa = ua.toLowerCase();

  // Parse device
  if (lowerUa.includes("mobi") || lowerUa.includes("phone") || lowerUa.includes("iphone")) {
    device = "Mobile";
  } else if (lowerUa.includes("ipad") || lowerUa.includes("tablet") || (lowerUa.includes("android") && !lowerUa.includes("mobi"))) {
    device = "Tablet";
  } else {
    device = "Desktop";
  }

  // Parse browser
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

  // Parse OS
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
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json());

  // Ensure database is initialized
  readDb();

  // --- Dynamic Redirection Endpoint (The scan entrypoint) ---
  app.get("/r/:shortId", (req, res) => {
    const { shortId } = req.params;
    const currentDb = readDb();
    const linkIndex = currentDb.redirects.findIndex((r) => r.id.toLowerCase() === shortId.toLowerCase());

    if (linkIndex === -1) {
      // Elegant 404 custom style for missing dynamic codes
      res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Link Not Found | Dynamic QR Code</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center font-sans p-6">
          <div class="max-w-md w-full text-center space-y-6 bg-slate-800/50 p-8 rounded-2xl border border-slate-700/50 shadow-2xl backdrop-blur-md">
            <div class="w-20 h-20 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto text-4xl font-bold animate-pulse">!</div>
            <div class="space-y-2">
              <h1 class="text-3xl font-extrabold tracking-tight text-white">QR Code Expired or Invalid</h1>
              <p class="text-slate-400">The destination or permanent redirect link <code class="bg-slate-950 px-2 py-1 rounded text-sm text-amber-400 font-mono">/r/${shortId}</code> was not found on our server.</p>
            </div>
            <div class="pt-4 border-t border-slate-700/50">
              <p class="text-xs text-slate-500">Powered by Permanent Dynamic QR Codes</p>
            </div>
          </div>
        </body>
        </html>
      `);
      return;
    }

    const link = currentDb.redirects[linkIndex];

    if (link.status === "paused") {
      // Elegant customized landing page for paused links
      res.status(403).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Link Temporarily Suspended | ${link.name}</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center font-sans p-6">
          <div class="max-w-md w-full text-center space-y-6 bg-slate-800/50 p-8 rounded-2xl border border-slate-700/50 shadow-2xl backdrop-blur-md">
            <div class="w-20 h-20 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto text-4xl">⏸</div>
            <div class="space-y-2">
              <h1 class="text-2xl font-bold text-white">${link.name}</h1>
              <p class="text-slate-300 font-medium text-lg">This redirect is currently paused</p>
              <p class="text-slate-400 text-sm">The creator has temporarily suspended the target destination. Please check back later or scan again.</p>
            </div>
            <div class="pt-4 border-t border-slate-700/50">
              <p class="text-xs text-slate-500">Powered by Permanent Dynamic QR Codes</p>
            </div>
          </div>
        </body>
        </html>
      `);
      return;
    }

    // Capture Scan Analytics
    const userAgent = req.headers["user-agent"] || "";
    const referrer = req.headers["referer"] || req.headers["referrer"] || "Direct / QR Scanner";
    const { browser, device, os } = parseUserAgent(userAgent);

    const newScan: Scan = {
      id: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userAgent,
      browser,
      device,
      os,
      referrer: String(referrer),
    };

    link.scanCount += 1;
    link.scans.push(newScan);
    link.updatedAt = new Date().toISOString();

    currentDb.redirects[linkIndex] = link;
    writeDb(currentDb);

    // Perform permanent (or temporary for tracking purposes) redirect
    res.redirect(302, link.destinationUrl);
  });

  // --- API Routes ---

  // Get active configurations & high level stats
  app.get("/api/redirects", (req, res) => {
    const currentDb = readDb();
    // Return summary data without the massive raw scans list to optimize network payload
    const summaryRedirects = currentDb.redirects.map((link) => {
      // Find scans in the last 24 hours
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const scansInLast24h = link.scans.filter(s => new Date(s.timestamp).getTime() > oneDayAgo).length;

      return {
        id: link.id,
        name: link.name,
        destinationUrl: link.destinationUrl,
        createdAt: link.createdAt,
        updatedAt: link.updatedAt,
        status: link.status,
        scanCount: link.scanCount,
        scansInLast24h,
        tags: link.tags || [],
        qrConfig: link.qrConfig,
      };
    });
    res.json(summaryRedirects);
  });

  // Get detailed scan analytics for a specific link
  app.get("/api/redirects/:id", (req, res) => {
    const { id } = req.params;
    const currentDb = readDb();
    const link = currentDb.redirects.find((r) => r.id.toLowerCase() === id.toLowerCase());

    if (!link) {
      res.status(404).json({ error: "Redirect link not found" });
      return;
    }

    res.json(link);
  });

  // Create new QR Code / Redirect Link
  app.post("/api/redirects", (req, res) => {
    const { id, name, destinationUrl, tags } = req.body;

    if (!name || !destinationUrl) {
      res.status(400).json({ error: "Name and Destination URL are required." });
      return;
    }

    // Simple URL validation
    try {
      new URL(destinationUrl);
    } catch (e) {
      res.status(400).json({ error: "Invalid Destination URL. Must include protocol (e.g. https://)." });
      return;
    }

    const currentDb = readDb();
    
    // Determine the unique key / slug
    let finalId = id ? id.trim().toLowerCase() : "";
    if (finalId) {
      // Validate slug characters
      const slugRegex = /^[a-zA-Z0-9\-_]+$/;
      if (!slugRegex.test(finalId)) {
        res.status(400).json({ error: "Custom URL alias can only contain alphanumeric characters, hyphens, and underscores." });
        return;
      }
      // Check for collisions
      const exists = currentDb.redirects.some((r) => r.id.toLowerCase() === finalId);
      if (exists) {
        res.status(400).json({ error: "This custom URL alias is already in use. Please select a different one." });
        return;
      }
    } else {
      // Loop to ensure uniqueness of generated id
      let unique = false;
      while (!unique) {
        finalId = generateShortId();
        const exists = currentDb.redirects.some((r) => r.id === finalId);
        if (!exists) unique = true;
      }
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
      tags: Array.isArray(tags) ? tags : [],
    };

    currentDb.redirects.push(newLink);
    writeDb(currentDb);

    res.status(201).json(newLink);
  });

  // Edit/Update a link
  app.put("/api/redirects/:id", (req, res) => {
    const { id } = req.params;
    const { name, destinationUrl, status, tags, qrConfig } = req.body;

    const currentDb = readDb();
    const index = currentDb.redirects.findIndex((r) => r.id.toLowerCase() === id.toLowerCase());

    if (index === -1) {
      res.status(404).json({ error: "Redirect link not found" });
      return;
    }

    const link = currentDb.redirects[index];

    if (name) link.name = name.trim();
    if (destinationUrl) {
      try {
        new URL(destinationUrl);
        link.destinationUrl = destinationUrl.trim();
      } catch (e) {
        res.status(400).json({ error: "Invalid Destination URL. Must include protocol (e.g. https://)." });
        return;
      }
    }
    if (status && (status === "active" || status === "paused")) {
      link.status = status;
    }
    if (tags !== undefined) {
      link.tags = Array.isArray(tags) ? tags : [];
    }
    if (qrConfig !== undefined) {
      link.qrConfig = qrConfig;
    }

    link.updatedAt = new Date().toISOString();
    currentDb.redirects[index] = link;
    writeDb(currentDb);

    res.json(link);
  });

  // Delete a link
  app.delete("/api/redirects/:id", (req, res) => {
    const { id } = req.params;
    const currentDb = readDb();
    const filteredRedirects = currentDb.redirects.filter((r) => r.id.toLowerCase() !== id.toLowerCase());

    if (filteredRedirects.length === currentDb.redirects.length) {
      res.status(404).json({ error: "Redirect link not found" });
      return;
    }

    currentDb.redirects = filteredRedirects;
    writeDb(currentDb);

    res.json({ success: true, message: "Redirect link deleted successfully" });
  });

  // --- Vite Middleware & Asset Serving Setup ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
