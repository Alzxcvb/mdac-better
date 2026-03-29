import { NextRequest, NextResponse } from "next/server";
import { type FormData } from "@/lib/types";
import { mapFormToMdac } from "@/lib/mdac-codes";

export const maxDuration = 10;

const BASE_URL = "https://imigresen-online.imi.gov.my";

interface SubmitRequest {
  session: {
    jsessionid: string;
    sourcePage: string;
    fp: string;
    formAction: string;
  };
  formData: FormData;
}

/**
 * Step 2: Submit the form to the official MDAC system.
 *
 * Flow:
 * 1. Resolve city code from state + city name via AJAX endpoint
 * 2. Attempt CAPTCHA verification (try skip first)
 * 3. POST the form data to /mdac/register
 * 4. Parse response for success/error
 */
export async function POST(req: NextRequest) {
  try {
    const { session, formData }: SubmitRequest = await req.json();

    if (!session?.jsessionid) {
      return NextResponse.json({ error: "No session. Please try again." }, { status: 400 });
    }

    const cookie = `JSESSIONID=${session.jsessionid}`;
    const headers: HeadersInit = {
      Cookie: cookie,
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      Referer: `${BASE_URL}/mdac/main?registerMain`,
      Origin: BASE_URL,
    };

    // ---- Step 1: Resolve city code ----
    let cityCode = "";
    const stateCode = (await import("@/lib/mdac-codes")).STATE_TO_CODE[formData.stateInMalaysia] || "";

    if (stateCode) {
      try {
        const cityRes = await fetch(
          `${BASE_URL}/mdac/register?retrieveRefCity&state=${stateCode}`,
          {
            headers,
            // @ts-expect-error -- Node fetch SSL override
            rejectUnauthorized: false,
          }
        );
        const cityHtml = await cityRes.text();

        // Parse HTML options: <option value="CODE">City Name</option>
        // Try to fuzzy match against our city name
        const cityName = formData.cityInMalaysia.toLowerCase().trim();
        const optionRegex = /<option\s+value="([^"]+)"[^>]*>([^<]+)<\/option>/gi;
        let match;
        let bestMatch = "";
        let bestScore = 0;

        while ((match = optionRegex.exec(cityHtml)) !== null) {
          const code = match[1];
          const name = match[2].toLowerCase().trim();
          if (name === cityName) {
            cityCode = code;
            break;
          }
          // Partial match scoring
          if (name.includes(cityName) || cityName.includes(name)) {
            const score = Math.min(name.length, cityName.length) / Math.max(name.length, cityName.length);
            if (score > bestScore) {
              bestScore = score;
              bestMatch = code;
            }
          }
        }

        if (!cityCode && bestMatch) cityCode = bestMatch;
        if (!cityCode) cityCode = "9999"; // fallback: "Other"
      } catch {
        cityCode = "9999";
      }
    }

    // ---- Step 2: Try CAPTCHA (attempt skip first) ----
    try {
      await fetch(`${BASE_URL}/mdac/captcha`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "x=150",
        // @ts-expect-error
        rejectUnauthorized: false,
      });
    } catch {
      // CAPTCHA verification failed — continue anyway, the form might still accept
    }

    // ---- Step 3: Map form data to official fields ----
    const payload = mapFormToMdac(formData, cityCode);

    // Build the form-urlencoded body
    const formBody = new URLSearchParams();

    // Add all mapped fields
    for (const [key, value] of Object.entries(payload)) {
      formBody.append(key, value);
    }

    // Add CSRF tokens
    formBody.append("_sourcePage", session.sourcePage);
    formBody.append("__fp", session.fp);
    formBody.append("sliderCapture", "true");

    // ---- Step 4: Submit the form ----
    const submitUrl = session.formAction
      ? `${BASE_URL}${session.formAction.startsWith("/") ? "" : "/"}${session.formAction}`
      : `${BASE_URL}/mdac/register;jsessionid=${session.jsessionid}`;

    const submitRes = await fetch(submitUrl, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody.toString(),
      redirect: "follow",
      // @ts-expect-error
      rejectUnauthorized: false,
    });

    const responseHtml = await submitRes.text();
    const responseUrl = submitRes.url;

    // ---- Step 5: Detect success or failure ----

    // Success indicators
    const isSuccess =
      responseHtml.includes("PIN") ||
      responseHtml.includes("successfully") ||
      responseHtml.includes("confirmation") ||
      responseUrl.includes("success") ||
      responseUrl.includes("confirm");

    // Error indicators — look for specific field errors
    const errorMatch = responseHtml.match(/<div[^>]*class="[^"]*error[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    const alertMatch = responseHtml.match(/<div[^>]*class="[^"]*alert-danger[^"]*"[^>]*>([\s\S]*?)<\/div>/i);

    if (isSuccess) {
      return NextResponse.json({
        success: true,
        message: `Submitted! Check ${formData.email} for your PIN code from Malaysia Immigration.`,
      });
    }

    // CAPTCHA failure detection
    if (responseHtml.includes("captcha") || responseHtml.includes("slider") || responseHtml.includes("verify")) {
      return NextResponse.json({
        success: false,
        error: "The MDAC site requires a CAPTCHA that we cannot automate yet. Please submit manually.",
        captchaRequired: true,
        fallbackUrl: "https://imigresen-online.imi.gov.my/mdac/main?registerMain",
      });
    }

    // Extract specific error message if available
    const errorText = (errorMatch?.[1] || alertMatch?.[1] || "")
      .replace(/<[^>]+>/g, "")
      .trim();

    return NextResponse.json({
      success: false,
      error: errorText || "Submission completed but could not confirm success. Check your email — Malaysia may have still sent your PIN.",
      partial: !errorText,
      fallbackUrl: "https://imigresen-online.imi.gov.my/mdac/main?registerMain",
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const isTimeout = message.includes("timeout") || message.includes("Timeout");

    return NextResponse.json(
      {
        success: false,
        error: isTimeout
          ? "The MDAC site took too long to respond. Try again or submit manually."
          : `Submission failed: ${message}`,
        fallbackUrl: "https://imigresen-online.imi.gov.my/mdac/main?registerMain",
      },
      { status: 500 }
    );
  }
}
