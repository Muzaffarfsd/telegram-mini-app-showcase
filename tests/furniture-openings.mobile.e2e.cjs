const assert = require("node:assert/strict"),
  { chromium } = require("playwright");
const site = process.env.PLANNER_TEST_URL || "http://127.0.0.1:41755/";
const key = "web4tg-furniture-planner-v1";
(async () => {
  let b = await chromium.launch({
    args: [
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
    ],
  });
  try {
    for (const width of [320, 390]) {
      let c = await b.newContext({
          viewport: { width, height: 844 },
          isMobile: true,
          hasTouch: true,
          locale: "ru-RU",
          serviceWorkers: "block",
        }),
        p = await c.newPage(),
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
      await p.locator(".fpl-openings summary").click();
      const initial = await p.evaluate(
        (k) => JSON.parse(localStorage.getItem(k)),
        key,
      );
      await p.getByLabel("Показать проём").check();
      await p.getByRole("button", { name: "Применить проёмы" }).click();
      await p.waitForFunction(
        (k) => JSON.parse(localStorage.getItem(k))?.room?.openings?.door,
        key,
      );
      let saved = await p.evaluate(
        (k) => JSON.parse(localStorage.getItem(k)),
        key,
      );
      assert.deepEqual(saved.items, initial.items);
      assert.equal(saved.room.openings.door.width, 0.8);
      await p
        .locator(".fpl-stage")
        .screenshot({
          path: `../work/premium-room-bake/opening-top-${width}.png`,
        });
      await p.getByRole("button", { name: "Интерьер", exact: true }).click();
      await p.waitForTimeout(1000);
      await p
        .locator(".fpl-stage")
        .screenshot({
          path: `../work/premium-room-bake/opening-room-${width}.png`,
        });
      await p.getByRole("button", { name: "Вид сверху", exact: true }).click();
      await p.getByRole("button", { name: "Отменить действие" }).click();
      await p.waitForFunction(
        (k) => !JSON.parse(localStorage.getItem(k)).room.openings,
        key,
      );
      assert.deepEqual(
        (await p.evaluate((k) => JSON.parse(localStorage.getItem(k)), key))
          .items,
        initial.items,
      );
      await p.getByRole("button", { name: "Повторить действие" }).click();
      await p.waitForFunction(
        (k) => JSON.parse(localStorage.getItem(k)).room.openings?.door,
        key,
      );
      await p.getByLabel("Проём: отступ слева, м").fill("1.5");
      await p.getByRole("button", { name: "Применить проёмы" }).click();
      await p
        .getByRole("alert")
        .filter({ hasText: "Проверьте размеры" })
        .waitFor();
      assert.deepEqual(
        await p.evaluate((k) => JSON.parse(localStorage.getItem(k)), key),
        saved,
      );
      await p.getByLabel("Ширина, м").fill("2");
      await p.getByRole("button", { name: "Применить", exact: true }).click();
      await p
        .getByText(
          "Проёмы не помещаются на стене. Сначала измените их размеры или положение.",
        )
        .waitFor();
      assert.deepEqual(
        await p.evaluate((k) => JSON.parse(localStorage.getItem(k)), key),
        saved,
      );
      await p.getByRole("button", { name: "Закрыть планировщик" }).click();
      await p.reload();
      await p.locator("[data-testid=furniture-store]").waitFor();
      await p
        .getByRole("button", { name: "Открыть планировщик", exact: true })
        .click();
      await p.getByRole("button", { name: /^Своя комната/ }).click();
      await p.locator("[data-testid=furniture-planner]").waitFor();
      assert.deepEqual(
        (await p.evaluate((k) => JSON.parse(localStorage.getItem(k)), key)).room
          .openings,
        saved.room.openings,
      );
      assert.deepEqual(errors, []);
      console.log(
        `PASS openings ${width}: save, restore, undo, redo, overlap and shrink validation, items unchanged`,
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
