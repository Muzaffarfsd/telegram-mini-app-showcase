const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const url = new URL(
    "/#/demos/furniture-studio/app",
    process.env.FURNITURE_TEST_URL || "http://127.0.0.1:41755/",
  ).href,
  key = "web4tg-fixed-interior-v1";
async function open(page) {
  await page.goto(url);
  await page
    .getByRole("button", { name: "Открыть планировщик", exact: true })
    .click();
  await page.locator("[data-testid=fixed-interior]").waitFor();
}
async function run() {
  const b = await chromium.launch({
    args: [
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
    ],
  });
  try {
    // Asset failure and recovery.
    {
      const c = await b.newContext({
          viewport: { width: 390, height: 844 },
          isMobile: true,
          hasTouch: true,
          locale: "ru-RU",
          serviceWorkers: "block",
        }),
        p = await c.newPage();
      let block = true;
      await p.route("**/furniture/interiors/fixed-living-room.glb", (r) =>
        block ? r.abort("failed") : r.continue(),
      );
      await open(p);
      await p
        .getByText("3D-комната недоступна. Расстановка сохранена.")
        .waitFor({ timeout: 30000 });
      console.log("ROOM FAILURE shows fallback");
      block = false;
      await p
        .locator(".fint-status")
        .getByRole("button", { name: "Повторить", exact: true })
        .click();
      await p
        .locator(".fint-block")
        .waitFor({ state: "hidden", timeout: 90000 });
      assert.equal(
        await p
          .getByText("3D-комната недоступна. Расстановка сохранена.")
          .count(),
        0,
      );
      console.log("ROOM RETRY OK");
      await c.close();
    }
    // Bad local storage is preserved until user acts.
    {
      const c = await b.newContext({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        locale: "ru-RU",
        serviceWorkers: "block",
      });
      await c.addInitScript((k) => localStorage.setItem(k, "{broken"), key);
      const p = await c.newPage();
      await open(p);
      await p
        .locator(".fint-block")
        .waitFor({ state: "hidden", timeout: 90000 });
      await p.locator(".fint-storage").waitFor();
      await p.waitForTimeout(500);
      assert.equal(
        await p.evaluate((k) => localStorage.getItem(k), key),
        "{broken",
      );
      console.log("CORRUPT STORAGE preserved on open");
      await p.getByRole("button", { name: "Вид сверху" }).click();
      const canvas = p.locator(".fint-stage canvas"),
        box = await canvas.boundingBox(),
        cdp = await c.newCDPSession(p);
      const x = Math.round(box.x + box.width * 0.334),
        y = Math.round(box.y + box.height * 0.12);
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x, y }],
      });
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
      await p.waitForTimeout(500);
      assert.equal(
        await p.evaluate((k) => localStorage.getItem(k), key),
        "{broken",
      );
      console.log("CORRUPT STORAGE after touch preserved");
      await c.close();
    }
    // On entering with a new product, the caller's saved table is valid but a
    // nominal sofa placement is too close once the real GLB is measured.
    {
      const c = await b.newContext({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        locale: "ru-RU",
        serviceWorkers: "block",
      });
      await c.addInitScript(
        (k) =>
          localStorage.setItem(
            k,
            JSON.stringify({
              version: 1,
              items: [
                {
                  id: "existing-table",
                  productId: "hallowood-waverly-table",
                  x: -0.65,
                  z: -0.83,
                  rotation: 0,
                },
              ],
              selected: "existing-table",
            }),
          ),
        key,
      );
      const p = await c.newPage();
      await open(p);
      await p
        .locator(".fint-block")
        .waitFor({ state: "hidden", timeout: 90000 });
      await p.waitForTimeout(1200);
      const state = await p.evaluate(
          (k) => JSON.parse(localStorage.getItem(k)),
          key,
        ),
        table = state.items.find((i) => i.id === "existing-table"),
        sofa = state.items.find((i) => i.productId === "rivet-revolve-sofa");
      assert.deepEqual(table, {
        id: "existing-table",
        productId: "hallowood-waverly-table",
        x: -0.65,
        z: -0.83,
        rotation: 0,
      });
      assert.ok(sofa, "the selected sofa should be added when room is available");
      assert.ok(
        sofa.x !== -0.65 || sofa.z !== -1.85,
        "must not use nominal placement that overlaps real GLB",
      );
      console.log(
        "AUTO-ADD actual bounds",
        JSON.stringify(state),
        "warning",
        await p.locator(".fint-message").allTextContents(),
      );
      await c.close();
    }
    // A product selected in its card must survive the transition into the room.
    {
      const c = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: "ru-RU", serviceWorkers: "block" });
      const p = await c.newPage();
      await p.goto(url);
      await p.getByRole("button", { name: "В каталог", exact: true }).first().click();
      await p.locator(".fs-card").filter({ hasText: "Frankie" }).locator(".fs-card-open").click();
      await p.getByRole("button", { name: /Посмотреть в комнате/ }).click();
      await p.locator('[data-testid="fixed-interior"]').waitFor();
      await p.locator(".fint-block").waitFor({ state: "hidden", timeout: 90000 });
      await p.waitForFunction(k => {
        const state = JSON.parse(localStorage.getItem(k) || "null");
        return state?.items?.some(item => item.productId === "mercer41-frankie-gray");
      }, key, { timeout: 30000 });
      const state = await p.evaluate(k => JSON.parse(localStorage.getItem(k)), key);
      assert.equal(state.items.find(item => item.id === state.selected)?.productId, "mercer41-frankie-gray");
      console.log("PASS product card handoff preserves selected Frankie");
      await c.close();
    }
  } finally {
    await b.close();
  }
}
run().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
