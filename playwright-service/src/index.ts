import express from "express";
import { chromium } from "playwright";
import { FormData } from "./types";
import { submitMdac } from "./submit";

const app = express();
app.use(express.json({ limit: "1mb" }));

// Simple in-memory rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // max requests per window
const RATE_WINDOW = 60_000; // 1 minute

function rateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return next();
  }

  if (record.count >= RATE_LIMIT) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  record.count++;
  return next();
}

app.use("/submit", rateLimit);

// Auth middleware
app.use("/submit", (req, res, next) => {
  const secret = process.env.PLAYWRIGHT_SERVICE_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "Server misconfigured: PLAYWRIGHT_SERVICE_SECRET is required" });
  }
  if (req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// Debug: navigate to MDAC and return a screenshot + page title
// Shows exactly what Playwright sees so we can diagnose connectivity/form issues
app.get("/debug", async (req, res) => {
  const secret = process.env.PLAYWRIGHT_SERVICE_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "Server misconfigured: PLAYWRIGHT_SERVICE_SECRET is required" });
  }
  if (req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const MDAC_URL = "https://imigresen-online.imi.gov.my/mdac/main?registerMain";
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage();
    let navError = "";
    let finalUrl = "";
    let title = "";
    let screenshot = "";
    let bodySnippet = "";

    try {
      await page.goto(MDAC_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
      finalUrl = page.url();
      title = await page.title();
      bodySnippet = (await page.content()).slice(0, 2000);
      const buf = await page.screenshot({ type: "png" });
      screenshot = buf.toString("base64");
    } catch (e) {
      navError = e instanceof Error ? e.message : String(e);
      try {
        const buf = await page.screenshot({ type: "png" });
        screenshot = buf.toString("base64");
      } catch {}
    }

    res.json({ finalUrl, title, navError, bodySnippet, screenshot });
  } finally {
    await browser.close();
  }
});

app.post("/submit", async (req, res) => {
  const formData = req.body as FormData;

  try {
    console.log("Received submission request");
    const result = await submitMdac(formData);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Submission error:", message);
    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

const port = process.env.PORT || 3001;
const server = app.listen(port, () => {
  console.log(`MDAC Playwright service running on port ${port}`);
});

server.setTimeout(120_000);
