const { test, expect } = require('@playwright/test');
test('iPhone 版面：無橫向捲動、各元素不重疊', async ({ page }) => {
      await page.route(/fonts\.(googleapis|gstatic)/, (r) => r.abort());
      await page.goto('/?demo');
      const box = async (s) => page.locator(s).boundingBox();
      const vw = page.viewportSize().width;
      for (const v of ['castle', 'log', 'rooms', 'settings']) {
        if (v !== 'castle') await page.click(`.tab[data-view=${v}]`);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
      await page.click('.tab[data-view=castle]');
      const who = await box('.who'), chip = await box('#chipStreak'), card = await box('#floorCard'), tab = await box('.tabbar'), main = await box('#mainBtn');
      expect(who.x + who.width).toBeLessThanOrEqual(chip.x);
      expect(card.y + card.height).toBeLessThanOrEqual(main.y + 30);
      expect(main.y + main.height).toBeLessThanOrEqual(tab.y + tab.height);
      expect(chip.x + chip.width).toBeLessThanOrEqual(vw);
      await page.click('#mainBtn'); await page.waitForTimeout(700);
      const last = await page.locator('.effort').last().boundingBox();
      expect(last.y + last.height).toBeLessThanOrEqual(page.viewportSize().height);
    });
