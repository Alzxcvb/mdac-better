import { NextResponse } from "next/server";

export const maxDuration = 10;

const MDAC_URL = "https://imigresen-online.imi.gov.my/mdac/main?registerMain";

/**
 * Step 1: Initialize a session with the official MDAC server.
 * - GETs the form page
 * - Extracts JSESSIONID cookie + anti-CSRF tokens (_sourcePage, __fp)
 * - Returns session info for subsequent steps
 */
export async function POST() {
  try {
    // Fetch the official form page (SSL cert has issues, so we disable verification)
    const res = await fetch(MDAC_URL, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      // @ts-expect-error -- Node.js fetch supports this for self-signed certs
      rejectUnauthorized: false,
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `MDAC server returned ${res.status}` },
        { status: 502 }
      );
    }

    // Extract JSESSIONID from Set-Cookie header
    const cookies = res.headers.getSetCookie?.() || [];
    let jsessionid = "";
    for (const cookie of cookies) {
      const match = cookie.match(/JSESSIONID=([^;]+)/);
      if (match) {
        jsessionid = match[1];
        break;
      }
    }

    // Also try from the raw set-cookie header
    if (!jsessionid) {
      const rawCookie = res.headers.get("set-cookie") || "";
      const match = rawCookie.match(/JSESSIONID=([^;]+)/);
      if (match) jsessionid = match[1];
    }

    const html = await res.text();

    // Extract anti-CSRF tokens from hidden fields
    const sourcePageMatch = html.match(/name="_sourcePage"\s+value="([^"]+)"/);
    const fpMatch = html.match(/name="__fp"\s+value="([^"]+)"/);

    const sourcePage = sourcePageMatch?.[1] || "";
    const fp = fpMatch?.[1] || "";

    // Extract the form action URL (contains jsessionid in path)
    const actionMatch = html.match(/action="([^"]*register[^"]*)"/);
    const formAction = actionMatch?.[1] || "";

    // Extract the jsessionid from the form action if we didn't get it from cookies
    if (!jsessionid && formAction) {
      const actionSessionMatch = formAction.match(/jsessionid=([^"&?]+)/);
      if (actionSessionMatch) jsessionid = actionSessionMatch[1];
    }

    if (!jsessionid) {
      return NextResponse.json(
        { error: "Could not establish session with MDAC server. The site may be down." },
        { status: 502 }
      );
    }

    // Check if the page has the expected form fields as a sanity check
    const hasForm = html.includes('name="name"') || html.includes('id="name"');

    return NextResponse.json({
      success: true,
      session: {
        jsessionid,
        sourcePage,
        fp,
        formAction,
      },
      hasForm,
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";

    // Check for common issues
    if (message.includes("CERT") || message.includes("certificate") || message.includes("SSL")) {
      return NextResponse.json(
        { error: "SSL certificate error connecting to MDAC server. This is a known issue with the Malaysian government site." },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: `Failed to connect to MDAC server: ${message}` },
      { status: 500 }
    );
  }
}
