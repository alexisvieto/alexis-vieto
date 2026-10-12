// Renderiza toma4.html fotograma a fotograma (30 fps, 8 s) con el Chrome instalado.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
const here = path.resolve(process.env.HERO_DIR);
const out = path.join(here, 'frames4'); fs.mkdirSync(out, { recursive: true });
const FPS = 30, DUR = 10, N = FPS * DUR;
const chrome = process.argv[2];
const url = process.argv[3] || 'http://127.0.0.1:4180/toma4.html';
const only = process.argv[4] ? process.argv[4].split(',').map(Number) : null; // vista previa: lista de segundos
const browser = await puppeteer.launch({
  executablePath: chrome, headless: 'new',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', '--window-size=1920,1080'],
  defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
});
const page = await browser.newPage();
page.on('pageerror', e => console.error('pageerror:', e.message));
page.on('console', m => { if (m.type() === 'error') console.error('console:', m.text()); });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 90000 });
await page.waitForFunction('window.READY === true', { timeout: 60000 });
const gl = await page.evaluate(() => { const c = document.getElementById('c'); const g = c.getContext('webgl2') || c.getContext('webgl'); return g ? g.getParameter(g.RENDERER) : 'no-gl'; });
console.log('renderer:', gl);
const t0 = Date.now();
if (only) {
  for (const s of only) { await page.evaluate(t => window.seek(t), s); await page.screenshot({ path: path.join(here, `preview-${s}.png`), type: 'png' }); }
} else {
  for (let i = 0; i < N; i++) {
    const t = i / FPS;
    await page.evaluate(t => window.seek(t), t);
    await page.screenshot({ path: path.join(out, `f${String(i).padStart(4, '0')}.png`), type: 'png' });
    if (i % 30 === 0) console.log(`frame ${i}/${N} · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
}
await browser.close();
console.log('done', ((Date.now() - t0) / 1000).toFixed(0), 's');
