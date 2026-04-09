import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

/**
 * Proxy to Railway: solve the CAPTCHA by replaying the user's slider
 * position, then submit the form.
 */
export async function POST(req: NextRequest) {
  const serviceUrl = process.env.PLAYWRIGHT_SERVICE_URL;
  const secret = process.env.PLAYWRIGHT_SERVICE_SECRET;

  if (!serviceUrl) {
    return NextResponse.json(
      { success: false, error: "Playwright service not configured" },
      { status: 500 }
    );
  }

  try {
    const { sessionId, sliderX } = await req.json();

    if (!sessionId || sliderX === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing sessionId or sliderX" },
        { status: 400 }
      );
    }

    const res = await fetch(`${serviceUrl}/api/session/solve-captcha`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
      },
      body: JSON.stringify({ sessionId, sliderX }),
      signal: AbortSignal.timeout(55_000),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        error: message.includes("timeout")
          ? "CAPTCHA verification timed out. Please try again."
          : `Solve failed: ${message}`,
      },
      { status: 500 }
    );
  }
}
