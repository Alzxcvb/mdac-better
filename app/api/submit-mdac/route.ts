import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 10; // Vercel Hobby plan max

export async function POST(req: NextRequest) {
  const data = await req.json();

  try {
    // Dynamically import to avoid bundling issues
    const chromium = await import('@sparticuz/chromium');
    const { chromium: playwright } = await import('playwright-core');

    const browser = await playwright.launch({
      args: chromium.default.args,
      executablePath: await chromium.default.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(8000); // Leave 2s buffer

    // Navigate to MDAC
    await page.goto('https://imigresen-online.imi.gov.my/mdac/main', {
      waitUntil: 'domcontentloaded',
      timeout: 5000,
    });

    // Fill form fields as fast as possible
    // These selectors need to be validated against the live site
    // Format dates as DD/MM/YYYY for the MDAC form
    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const [y, m, d] = dateStr.split('-');
      return `${d}/${m}/${y}`;
    };

    // Best-effort field filling — update selectors after testing live
    try { await page.fill('[name="fullName"], [id*="fullName"], [id*="full_name"]', data.fullName); } catch {}
    try { await page.fill('[name="passportNo"], [id*="passport"], input[placeholder*="passport" i]', data.passportNumber); } catch {}
    try { await page.fill('[name="dob"], [id*="dob"], [id*="dateOfBirth"], input[placeholder*="birth" i]', formatDate(data.dateOfBirth)); } catch {}
    try { await page.fill('[name="email"], [id*="email"], input[type="email"]', data.email); } catch {}
    try { await page.fill('[name="mobileNo"], [id*="mobile"], [id*="phone"]', data.phoneNumber); } catch {}
    try { await page.fill('[name="arrivalDate"], [id*="arrival"]', formatDate(data.arrivalDate)); } catch {}

    // Submit
    try {
      await page.click('[type="submit"], button[id*="submit"], button[id*="Submit"]');
      await page.waitForNavigation({ timeout: 3000, waitUntil: 'domcontentloaded' }).catch(() => {});
    } catch {}

    const currentUrl = page.url();
    const pageContent = await page.textContent('body').catch(() => '');

    await browser.close();

    // Check if submission was successful (look for confirmation indicators)
    const isSuccess = pageContent?.includes('PIN') ||
                     pageContent?.includes('confirmation') ||
                     pageContent?.includes('success') ||
                     currentUrl.includes('success');

    if (isSuccess) {
      return NextResponse.json({
        success: true,
        message: 'Submitted! Check your email for your PIN code.',
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Submission completed but could not confirm success. Check your email — Malaysia may have still sent your PIN.',
        partial: true,
      });
    }

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const isTimeout = message.includes('timeout') || message.includes('Timeout');

    return NextResponse.json({
      success: false,
      error: isTimeout
        ? 'The MDAC site took too long to respond. Try submitting directly at imigresen-online.imi.gov.my'
        : `Submission failed: ${message}`,
      fallbackUrl: 'https://imigresen-online.imi.gov.my/mdac/main',
    }, { status: 500 });
  }
}
