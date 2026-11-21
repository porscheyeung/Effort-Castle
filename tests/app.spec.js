const { test, expect, devices } = require('@playwright/test');
test.beforeEach(async ({ page }) => { await page.route(/fonts\.(googleapis|gstatic)/, (r) => r.abort()); });

test('首次使用 → 砌滿一層 → 房間解鎖 → 收回 → 重新載入保留', async ({ page }) => {
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/?test');
  await expect(page.locator('#wGo')).toBeVisible();
  await page.fill('#wName', '小明'); await page.click('#wGoal button[data-g="5"]'); await page.click('#wGo');
  await expect(page.locator('#titleText')).toHaveText('小明的努力城堡');
  for (let i = 0; i < 9; i++) { await page.click('#mainBtn'); await page.locator('.effort').nth(i % 6).click(); await page.waitForTimeout(450); }
  await expect(page.locator('.fc-total b')).toHaveText('9');
  await page.click('#mainBtn'); await page.locator('.effort').first().click();
  await expect(page.locator('#modalCard h3')).toHaveText('第 1 層完成！', { timeout: 4000 });
  await page.click('#mOk');
  await expect(page.locator('.win.lit')).toHaveCount(1);
  await page.click('.tab[data-view=rooms]');
  await expect(page.locator('.room:not(.locked)')).toHaveCount(1);
  await page.click('.tab[data-view=log]');
  await expect(page.locator('.tile b').first()).toContainText('10');
  await page.click('#undoBtn'); await page.click('#cYes');
  await expect(page.locator('.tile b').first()).toContainText('9');
  await page.reload();
  await expect(page.locator('#wGo')).toHaveCount(0);
  await expect(page.locator('.fc-total b')).toHaveText('9');
  expect(errors).toEqual([]);
});

test('目標完成慶祝、按錯了即時收回', async ({ page }) => {
  await page.goto('/?test');
  await page.click('#wGo');
  await page.evaluate(() => { const E = window.__ec.E; let s = { ...E.fresh(), setup: true, goal: 5 }; for (let i = 0; i < 49; i++) s = E.add(s, 't1', Date.now() - 1e5 + i); window.__ec.state = s; });
  await page.click('#mainBtn'); await page.locator('.effort').nth(2).click();
  await expect(page.locator('#modalCard h3')).toHaveText('努力城堡建成了！', { timeout: 4000 });
  await page.click('#mOk');
  await expect(page.locator('.crown')).toHaveCount(1);
  await page.click('#mainBtn'); await page.locator('.effort').first().click();
  await page.click('#tUndo');
  await expect(page.locator('.fc-total b')).toHaveText('50');
});

test('修改努力項目、隱藏、重新開始要輸入確認', async ({ page }) => {
  await page.goto('/?test');
  await page.click('#wGo');
  await page.click('.tab[data-view=settings]');
  await page.click('#addType'); await page.fill('#tName', '閱讀'); await page.click('#tSave');
  await expect(page.locator('.type-row')).toHaveCount(7);
  await page.locator('.type-row').first().click(); await page.click('#tHide');
  await page.click('#mainBtn');
  await expect(page.locator('.effort')).toHaveCount(6);
  await expect(page.locator('.effort b').last()).toHaveText('閱讀');
  await page.locator('.effort').last().click(); await page.waitForTimeout(400);
  await page.click('.tab[data-view=settings]'); await page.click('#resetBtn');
  await expect(page.locator('#cYes')).toBeDisabled();
  await page.fill('#cIn', '重新開始'); await page.click('#cYes');
  await expect(page.locator('#wGo')).toBeVisible();
});

test('示範模式不寫入存檔', async ({ page }) => {
  await page.goto('/?demo');
  await expect(page.locator('#demoBar')).toBeVisible();
  await page.click('#mainBtn'); await page.locator('.effort').first().click();
  expect(await page.evaluate(() => localStorage.getItem('effort-castle-v1'))).toBeNull();
});

