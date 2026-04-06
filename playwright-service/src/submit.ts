import { chromium, Browser, Page } from "playwright";
import { FormData } from "./types";
import { fillPersonalInfo, fillContactAndTravel, fillAccommodation } from "./fillForm";
import { solveCaptcha } from "./solveCaptcha";

const MDAC_URL = "https://imigresen-online.imi.gov.my/mdac/main?registerMain";

interface SubmitResult {
  success: boolean;
  message?: string;
  error?: string;
  captchaRequired?: boolean;
}

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });
  }
  return browser;
}

export async function submitMdac(formData: FormData): Promise<SubmitResult> {
  const browser = await getBrowser();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log(`Starting MDAC submission for ${formData.fullName}...`);

    // Navigate to form
    console.log("Navigating to MDAC form...");
    await page.goto(MDAC_URL, {
      waitUntil: "networkidle",
      timeout: 45000,
    });

    // Fill form sections
    console.log("Filling personal information...");
    await fillPersonalInfo(page, formData);

    console.log("Filling contact and travel information...");
    await fillContactAndTravel(page, formData);

    console.log("Filling accommodation information...");
    await fillAccommodation(page, formData);

    // Solve CAPTCHA
    console.log("Solving slider CAPTCHA...");
    const captchaSolved = await solveCaptcha(page);

    if (!captchaSolved) {
      return {
        success: false,
        error: "Could not solve the slider CAPTCHA. Please try submitting manually.",
        captchaRequired: true,
      };
    }

    // Submit form
    console.log("Submitting form...");
    await Promise.all([
      page.waitForNavigation({
        waitUntil: "networkidle",
        timeout: 30000,
      }),
      page.click('button[type="submit"], input[type="submit"]'),
    ]);

    // Check success
    const finalUrl = page.url();
    const html = await page.content();

    const isSuccess =
      html.includes("PIN") ||
      html.includes("successfully") ||
      finalUrl.includes("success") ||
      finalUrl.includes("confirm");

    if (isSuccess) {
      return {
        success: true,
        message: `Submitted successfully! Check ${formData.email} for your PIN code from Malaysia Immigration.`,
      };
    }

    // Check for CAPTCHA error
    if (html.includes("captcha") || html.includes("slider") || html.includes("verify")) {
      return {
        success: false,
        error: "The MDAC site requires additional verification. Please try again.",
        captchaRequired: true,
      };
    }

    // Generic error
    return {
      success: false,
      error: "Submission completed but could not confirm success. Check your email.",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    if (message.includes("timeout") || message.includes("Timeout")) {
      return {
        success: false,
        error: "The MDAC site took too long to respond. Please try again.",
      };
    }

    return {
      success: false,
      error: `Submission failed: ${message}`,
    };
  } finally {
    await context.close();
  }
}

// Optional: shutdown browser on process exit
process.on("SIGTERM", async () => {
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});
