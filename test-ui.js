const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:3001');

  await page.evaluate(() => {
    localStorage.setItem('user', JSON.stringify({
      id: 'mock-user-id',
      role: 'manager',
      first_name: 'Test',
      last_name: 'User',
      status: 'active'
    }));
  });

  await page.reload();

  await page.waitForTimeout(3000);

  await page.screenshot({ path: '/home/jules/verification/test1.png' });

  await browser.close();
})();
