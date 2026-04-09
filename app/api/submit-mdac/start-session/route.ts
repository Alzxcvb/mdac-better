import { NextRequest, NextResponse } from "next/server";
import { type FormData } from "@/lib/types";
import { mapFormToMdac } from "@/lib/mdac-codes";

export const maxDuration = 120;

/**
 * Proxy to Railway: start a Playwright session, fill the MDAC form,
 * and return the CAPTCHA screenshot for the user to solve.
 *
 * Accepts the frontend's FormData, maps it to official MDAC field names
 * via mapFormToMdac(), then forwards to the passthrough backend.
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
    const formData: FormData = await req.json();

    // Map frontend FormData → official MDAC field names/codes.
    // City code is unknown at this point (resolved by AJAX on the real form),
    // so we pass "" and let the backend match by sCity display name.
    const mapped = mapFormToMdac(formData, "");

    const res = await fetch(`${serviceUrl}/api/session/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
      },
      body: JSON.stringify(mapped),
      signal: AbortSignal.timeout(115_000),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        error: message.includes("timeout")
          ? "Form filling took too long. Please try again."
          : `Session start failed: ${message}`,
      },
      { status: 500 }
    );
  }
}
