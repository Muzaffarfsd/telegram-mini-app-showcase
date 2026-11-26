const assert = require("node:assert/strict"),
  { chromium } = require("playwright");
const site = process.env.PLANNER_TEST_URL || "http://127.0.0.1:41755/",
  key = "web4tg-furniture-planner-v1";
(async () => {
  const b = await chromium.launch({
    args: [
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
    ],
  });
  try {
    for (const size of [2, 8]) {
      let c = await b.newContext({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        locale: "ru-RU",
        serviceWorkers: "block",
      });
      await c.addInitScript(
        ({ key, size }) =>
          localStorage.setItem(
            key,
            JSON.stringify({
              version: 1,
              room: { width: size, depth: size },
              items: [],
            }),
          ),
        { key, size },
      );
      let p = await c.newPage(),
        errors = [];
      p.on("pageerror", (e) => errors.push(e.message));
      await p.goto(new URL("/#/demos/furniture-studio/app", site).href);
      await p
        .getByRole("button", { name: "Открыть планировщик", exact: true })
        .click();
      await p.getByRole("button", { name: /^Своя комната/ }).click();
      await p.locator("[data-testid=furniture-planner]").waitFor();
      await p.waitForFunction(
        () =>
          !Array.from(document.querySelectorAll(".fpl-status")).some((e) =>
            e.textContent.includes("Загружаем"),
          ),
        null,
        { timeout: 45000 },
      );
      await p.waitForTimeout(500);
      const initial = await p.evaluate(
        (k) => JSON.parse(localStorage.getItem(k)),
        key,
      );
      await p.locator(".fpl-openings summary").click();
      await p.getByLabel("Окно: отступ слева, м").fill("0.1");
      await p.getByLabel("Ширина окна, м").fill("0.7");
      await p.getByLabel("Показать проём").check();
      await p.getByLabel("Проём: отступ слева, м").fill("1");
      await p.getByLabel("Ширина проёма, м").fill("0.8");
      await p.getByRole("button", { name: "Применить проёмы" }).click();
      await p.waitForFunction(
        (k) => JSON.parse(localStorage.getItem(k))?.room?.openings?.door,
        key,
      );
      const saved = await p.evaluate(
        (k) => JSON.parse(localStorage.getItem(k)),
        key,
      );
      assert.equal(saved.room.width, size);
      assert.equal(saved.room.depth, size);
      assert.deepEqual(saved.items, initial.items);
      await p
        .locator(".fpl-stage")
        .screenshot({
          path: `../work/premium-room-bake/opening-${size}m-top.png`,
        });
      await p.getByRole("button", { name: "Интерьер", exact: true }).click();
      await p.waitForTimeout(1000);
      await p
        .locator(".fpl-stage")
        .screenshot({
          path: `../work/premium-room-bake/opening-${size}m-room.png`,
        });
      await p.getByLabel("Проём: отступ слева, м").fill("0.05");
      await p.getByRole("button", { name: "Применить проёмы" }).click();
      await p
        .getByRole("alert")
        .filter({ hasText: "Проверьте размеры" })
        .waitFor();
      assert.deepEqual(
        await p.evaluate((k) => JSON.parse(localStorage.getItem(k)), key),
        saved,
      );
      assert.deepEqual(errors, []);
      console.log(
        `PASS ${size} m: openings render and save, corner clearance enforced`,
      );
      await c.close();
    }
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
