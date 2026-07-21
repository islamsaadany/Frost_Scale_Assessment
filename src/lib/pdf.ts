// Render a URL to a PDF using headless Chromium.
//  - On Vercel/Lambda: @sparticuz/chromium provides the serverless binary.
//  - Locally: point puppeteer-core at a local Chrome/Chromium.
//
// We render the actual report page so the Arabic (RTL) output is identical
// to what the respondent sees on screen — react-pdf can't shape Arabic.

import type { Browser } from "puppeteer-core";

async function launchBrowser(): Promise<Browser> {
  const puppeteer = (await import("puppeteer-core")).default;
  const isServerless = Boolean(
    process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION,
  );

  if (isServerless) {
    const chromium = (await import("@sparticuz/chromium")).default;
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  const executablePath =
    process.env.LOCAL_CHROME_PATH ||
    "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
  return puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

export async function renderUrlToPdf(url: string): Promise<Buffer> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 900, height: 1400, deviceScaleFactor: 2 });
    await page.goto(url, { waitUntil: "networkidle0", timeout: 45_000 });
    // Keep the on-screen look (colors/layout), not the print stylesheet.
    await page.emulateMediaType("screen");
    // Ensure the Arabic webfont has loaded before snapshotting.
    await page.evaluate(async () => {
      if (document.fonts?.ready) await document.fonts.ready;
    });
    const pdf = await page.pdf({
      printBackground: true,
      format: "a4",
      margin: { top: "18px", bottom: "18px", left: "14px", right: "14px" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
