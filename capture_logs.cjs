const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.log(`[BROWSER ERROR] ${error.message}`);
  });
  
  try {
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2', timeout: 10000 });
    await page.waitForTimeout(2000);
  } catch (err) {
    console.error(`[SCRIPT ERROR] ${err.message}`);
  }
  
  await browser.close();
})();
