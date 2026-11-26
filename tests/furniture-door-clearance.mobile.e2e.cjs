const assert = require("node:assert/strict"),
  { chromium } = require("playwright");
(async () => {
  let b = await chromium.launch({
    args: [
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
    ],
  });
  let c = await b.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    locale: "ru-RU",
    serviceWorkers: "block",
  });
  await c.addInitScript(() =>
    localStorage.setItem(
      "web4tg-furniture-planner-v1",
      JSON.stringify({
        version: 1,
        room: {
          width: 4.8,
          depth: 4,
          openings: { window: null, door: { start: 2, width: 0.8 } },
        },
        items: [
          {
            id: "sofa-test",
            productId: "rivet-revolve-sofa",
            x: 0,
            z: -1.1,
            rotation: 0,
          },
        ],
      }),
    ),
  );
  let p = await c.newPage(),
    errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto(
    new URL(
      "/#/demos/furniture-studio/app",
      process.env.PLANNER_TEST_URL || "http://127.0.0.1:41755/",
    ).href,
  );
  await p
    .getByRole("button", { name: "Открыть планировщик", exact: true })
    .click();
  await p.locator("[data-testid=furniture-planner]").waitFor();
  await p.locator(".fpl-openings summary").click();
  await p.getByText("Мебель находится у проёма.", { exact: false }).waitFor();
  assert.deepEqual(errors, []);
  console.log("PASS approximate doorway approach warning");
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
