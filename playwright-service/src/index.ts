import express from "express";
import { FormData } from "./types";
import { submitMdac } from "./submit";

const app = express();
app.use(express.json({ limit: "1mb" }));

// Auth middleware
app.use("/submit", (req, res, next) => {
  const secret = process.env.PLAYWRIGHT_SERVICE_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

app.post("/submit", async (req, res) => {
  const formData = req.body as FormData;

  try {
    console.log(`Received submission request for ${formData.fullName}`);
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
