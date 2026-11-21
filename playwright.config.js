const { devices } = require('@playwright/test');
const phones = ['iPhone SE', 'iPhone 13', 'iPhone 15 Pro Max'];
module.exports = {
  testDir: './tests', timeout: 60000, workers: 2, reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4192', headless: true },
  projects: [
    { name: 'chromium', testMatch: 'app.spec.js', use: { browserName: 'chromium' } },
    ...phones.map((p) => ({ name: p, testMatch: 'iphone.spec.js', use: { ...devices[p] } })),
  ],
  webServer: { command: 'python3 -m http.server 4192 --bind 127.0.0.1', url: 'http://127.0.0.1:4192', reuseExistingServer: true },
};
