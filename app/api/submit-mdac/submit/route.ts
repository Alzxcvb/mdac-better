import { NextRequest, NextResponse } from "next/server";
import { type FormData } from "@/lib/types";

export const maxDuration = 120;

interface SubmitResult {
  success: boolean;
  message?: string;
  error?: string;
  captchaRequired?: boolean;
}

/**
 * Proxy to the Playwright service for MDAC form submission.
 * The service handles navigating, filling, solving CAPTCHA, and submitting
 * via a real Chromium browser on Railway.
 */
export async function POST(req: NextRequest) {
  const serviceUrl = process.env.PLAYWRIGHT_SERVICE_URL;
  const secret = process.env.PLAYWRIGHT_SERVICE_SECRET;

  if (!serviceUrl) {
    return NextResponse.json(
      { error: "Playwright service not configured" },
      { status: 500 }
    );
  }

  try {
    const formData: FormData = await req.json();

    const res = await fetch(`${serviceUrl}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
      },
      body: JSON.stringify(formData),
      signal: AbortSignal.timeout(115_000),
    });

    const data: SubmitResult = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        error: message.includes("timeout")
          ? "Submission took too long. Please try again."
          : `Submission failed: ${message}`,
      },
      { status: 500 }
    );
  }
}
