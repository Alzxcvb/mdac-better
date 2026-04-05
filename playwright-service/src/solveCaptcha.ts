import { Page } from "playwright";

export async function solveCaptcha(page: Page, maxAttempts: number = 2): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Find slider handle with multiple selector strategies
      const handle = await page.$(
        '.slider-verify-handler, .captcha-slider, [class*="slider"][class*="handler"], [class*="verify"][class*="handle"], [class*="drag"]'
      );

      if (!handle) {
        console.log("No slider CAPTCHA found, assuming not required");
        return true;
      }

      console.log(`Solving CAPTCHA (attempt ${attempt}/${maxAttempts})...`);

      // Get dimensions
      const handleBox = await handle.boundingBox();
      const track = await page.$(
        '.slider-verify, [class*="captcha"], [class*="slider-track"], [class*="verify"][class*="track"]'
      );
      const trackBox = await track?.boundingBox();

      if (!handleBox || !trackBox) {
        console.log("Could not get slider dimensions");
        return false;
      }

      const startX = handleBox.x + handleBox.width / 2;
      const startY = handleBox.y + handleBox.height / 2;
      const dragDistance = trackBox.width - handleBox.width;

      console.log(
        `Dragging slider: ${dragDistance}px, start: (${Math.round(startX)}, ${Math.round(startY)})`
      );

      // Move to handle
      await page.mouse.move(startX, startY);
      await page.mouse.down();

      // Human-like drag with easing and jitter
      const steps = 35;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;

        // Ease-in-out cubic
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        // Add realistic jitter
        const jitterX = (Math.random() - 0.5) * 0.5;
        const jitterY = (Math.random() - 0.5) * 2;

        await page.mouse.move(
          startX + eased * dragDistance + jitterX,
          startY + jitterY,
          { steps: 1 }
        );

        // Variable speed: slower at edges, faster in middle
        const delay = i === 0 || i === steps ? 15 : Math.floor(2 + Math.random() * 6);
        await page.waitForTimeout(delay);
      }

      // Release
      await page.mouse.up();
      console.log("Slider drag complete, waiting for server validation...");

      // Wait for CAPTCHA validation to complete
      await page.waitForTimeout(1500);

      // Check if successful
      const success = await page.evaluate(() => {
        // Check for success indicators
        const track = document.querySelector('[class*="slider"][class*="success"], [class*="verify"][class*="success"]');
        const hidden = document.querySelector('input[name="sliderCapture"]') as HTMLInputElement;
        const noSlider = !document.querySelector('[class*="slider"], [class*="captcha"]');

        return !!track || hidden?.value === "true" || noSlider;
      });

      if (success) {
        console.log("CAPTCHA solved successfully!");
        return true;
      }

      console.log(`CAPTCHA attempt ${attempt} failed, retrying...`);
    } catch (err) {
      console.error(`CAPTCHA solve error on attempt ${attempt}:`, err);
    }
  }

  console.log("CAPTCHA solve failed after all attempts");
  return false;
}
