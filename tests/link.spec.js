const { test, expect, devices } = require('@playwright/test');
const L = encodeURIComponent('http://127.0.0.1:18798');
test.beforeEach(async ({ context }) => { await context.route(/fonts\.(googleapis|gstatic)/, (r) => r.abort()); });

test('大屏幕配對 → 手機遙控砌磚 → 樓層慶祝 → 斷開', async ({ browser }) => {
  const errors = [];
  const sc = await (await browser.newContext({ viewport: { width: 1366, height: 1024 } })).newPage();
  const ph = await (await browser.newContext({ ...devices['iPhone 13'], browserName: undefined, defaultBrowserType: undefined })).newPage();
  for (const p of [sc, ph]) p.on('pageerror', (e) => errors.push(e.message));
  await sc.goto(`/screen.html?test&link=${L}`);
  await expect(sc.locator('#code span')).toHaveCount(4);
  const code = await sc.evaluate(() => window.__screen.code);

  await ph.goto(`/?test&link=${L}`);
  await ph.fill('#wName', '小明'); await ph.click('#wGo');
  await ph.click('.tab[data-view=settings]'); await ph.click('#linkBtn');
  await ph.locator('#pinIn').type(code === '1111' ? '2222' : '1111');
  await expect(ph.locator('#pinErr')).toContainText('號碼不正確');
  await ph.locator('#pinIn').type(code);
  await expect(ph.locator('#remote')).toBeVisible();
  await expect(ph.locator('#floorCard')).toBeHidden();
  await expect(sc.locator('#liveView')).toBeVisible({ timeout: 5000 });
  await expect(sc.locator('#title')).toHaveText('小明的努力城堡');
  await expect(ph.locator('.rm-st')).toContainText('大屏幕在線', { timeout: 8000 });

  for (let i = 0; i < 3; i++) { await ph.locator('.rm-btn').nth(i).click(); await ph.waitForTimeout(250); }
  await expect(sc.locator('#total')).toHaveText('3', { timeout: 5000 });
  await expect(sc.locator('#brickPop')).toBeVisible();
  await expect(sc.locator('.tg')).toHaveCount(3);

  await ph.evaluate(() => { const E = window.__ec.E; let s = window.__ec.state; for (let i = 0; i < 6; i++) s = E.add(s, 't2'); window.__ec.state = s; });
  await ph.locator('.rm-btn').nth(1).click();
  await expect(sc.locator('#celebrate')).toBeVisible({ timeout: 6000 });
  await expect(sc.locator('#celCard h2')).toHaveText('第 1 層完成！');
  await expect(ph.locator('#modal')).toBeHidden();
  await sc.click('#celebrate');
  await expect(sc.locator('.win.lit')).toHaveCount(1);

  await ph.locator('.rm-btn').first().click(); await ph.click('#tUndo');
  await expect(sc.locator('#total')).toHaveText('10', { timeout: 5000 });

  await ph.reload();
  await expect(ph.locator('#remote')).toBeVisible();
  await ph.click('#chipLink'); await ph.click('#lOff');
  await expect(ph.locator('#remote')).toBeHidden();
  await expect(ph.locator('#floorCard')).toBeVisible();
  await expect(sc.locator('#pairView')).toBeVisible({ timeout: 5000 });
  await expect(sc.locator('#code span')).toHaveCount(4);
  expect(errors).toEqual([]);
});

test('大屏幕重新載入會續用同一配對', async ({ browser }) => {
  const sc = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const ph = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  await sc.goto(`/screen.html?test&link=${L}`);
  await expect(sc.locator('#code span')).toHaveCount(4);
  const code = await sc.evaluate(() => window.__screen.code);
  await ph.goto(`/?test&link=${L}`); await ph.click('#wGo');
  await ph.click('.tab[data-view=settings]'); await ph.click('#linkBtn'); await ph.locator('#pinIn').type(code);
  await ph.locator('.rm-btn').first().click();
  await expect(sc.locator('#total')).toHaveText('1', { timeout: 5000 });
  await sc.reload();
  await expect(sc.locator('#liveView')).toBeVisible({ timeout: 5000 });
  await expect(sc.locator('#total')).toHaveText('1');
});

for (const [name, w, h] of [['iPhone SE', 375, 667], ['iPhone 15 Pro Max', 430, 932]]) {
  test(`遙控按鈕在 ${name} 完整可按、不被主按鈕遮住`, async ({ browser }) => {
    const sc = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
    const ph = await (await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true })).newPage();
    await sc.goto(`/screen.html?test&link=${L}`);
    await expect(sc.locator('#code span')).toHaveCount(4);
    const code = await sc.evaluate(() => window.__screen.code);
    await ph.goto(`/?test&link=${L}`); await ph.click('#wGo');
    await ph.click('.tab[data-view=settings]'); await ph.click('#linkBtn'); await ph.locator('#pinIn').type(code);
    await expect(ph.locator('#remote')).toBeVisible();
    const main = await ph.locator('#mainBtn').boundingBox();
    for (const b of await ph.locator('.rm-btn').all()) {
      const r = await b.boundingBox();
      expect(r.x).toBeGreaterThanOrEqual(0); expect(r.x + r.width).toBeLessThanOrEqual(w);
      expect(r.y + r.height).toBeLessThanOrEqual(main.y + 6);
    }
    const wrap = await ph.locator('#sceneWrap').boundingBox();
    expect(wrap.height).toBeGreaterThan(h * 0.25);
    expect(await ph.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(w);
  });
}
