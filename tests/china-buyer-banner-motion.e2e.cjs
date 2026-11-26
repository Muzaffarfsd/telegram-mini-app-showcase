const { assert, run, open, btn } = require('./buyer-test-helpers.cjs');

run(
  'each painted frame has the active banner title, description and artwork',
  async (browser, { width, ru }) => {
    const { page, context, errors } = await open(browser, {
      width,
      ru,
      reducedMotion: 'no-preference',
    });
    try {
      const banner = page.locator('.yb-journey');
      const art = banner.locator('.yb-journey-art');
      await page.evaluate(() => document.fonts.ready);

      const observer = await banner.evaluateHandle((region) => {
        const tabs = [...region.querySelectorAll('.yb-chapter-tabs button')];
        const panels = [...region.querySelectorAll('.yb-copy-panel')];
        const images = [...region.querySelectorAll('.yb-journey-art img')];
        const seen = new Set();
        let failure;
        let raf;
        const painted = (node) => {
          const style = getComputedStyle(node);
          return (
            style.visibility === 'visible' &&
            Number(style.opacity) > 0 &&
            node.getClientRects().length > 0
          );
        };
        function observe() {
          const active = tabs.findIndex(
            (tab) => tab.getAttribute('aria-pressed') === 'true',
          );
          seen.add(active);
          const titles = panels.map((panel) =>
            painted(panel.firstElementChild),
          );
          const descriptions = panels.map((panel) =>
            painted(panel.querySelector('p')),
          );
          const pictures = images.map(painted);
          const expected = tabs.map((_, i) => i === active);
          if (
            !failure &&
            [titles, descriptions, pictures].some((row) =>
              row.some((value, i) => value !== expected[i]),
            )
          ) {
            failure = { active, titles, descriptions, pictures };
          }
          raf = requestAnimationFrame(observe);
        }
        observe();
        return {
          finish() {
            cancelAnimationFrame(raf);
            return { failure, seen: [...seen].sort() };
          },
        };
      });

      const next = btn(banner, ru ? 'Следующий этап' : 'Next step');
      if (width < 700) await next.tap();
      else await next.click();
      await art.focus();
      await art.press('ArrowRight');
      const box = await art.boundingBox();
      const x = box.x + box.width * 0.35;
      const y = box.y + box.height * 0.5;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + 75, y, { steps: 4 });
      await page.mouse.up();
      await banner.evaluate(async (region) => {
        const tabs = region.querySelectorAll('.yb-chapter-tabs button');
        const frame = () => new Promise((done) => requestAnimationFrame(done));
        for (const index of [0, 2, 1, 2, 0]) {
          tabs[index].click();
          await frame();
          await frame();
        }
        for (let i = 0; i < 12; i++) await frame();
      });
      const result = await observer.evaluate((state) => state.finish());
      await observer.dispose();
      assert.deepEqual(result.seen, [0, 1, 2]);
      assert.equal(
        result.failure,
        undefined,
        'Mixed slide content in a rendered frame: ' +
          JSON.stringify(result.failure),
      );
      assert.deepEqual(errors, []);
    } finally {
      await context.close();
    }
  },
  [
    { width: 320, ru: true },
    { width: 390, ru: false },
    { width: 430, ru: true },
    { width: 950, ru: false },
  ],
);
