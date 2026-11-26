"use strict";
const { chromium, webkit } = require("playwright");
const assert = require("node:assert/strict");
const site = process.env.PROJECT_STORY_TEST_URL || "http://127.0.0.1:41755/";
(async () => {
  for (const e of [chromium, webkit]) {
    const browser = await e.launch();
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: "block" });
    await context.addInitScript(() => {
      localStorage.setItem("app-language", "ru");
      window.open = (url) => {
        window.lastShare = url;
        return null;
      };
    });
    const page = await context.newPage();
    let errors = [];
    page.on("pageerror", (x) => errors.push(x.message));
    await page.goto(new URL("#/constructor?project=muraka-fashion", site).href);
    await page.getByTestId("order-page").waitFor();
    await page.getByTestId("order-project-reference").waitFor();
    assert.equal(await page.getByTestId("template-ecommerce-basic-clothes").getAttribute("aria-pressed"), "true");
    await page.getByTestId("order-reference-continue").tap();
    await page.getByTestId("order-continue").tap();
    await page.evaluate(() => {
      if (window.Telegram?.WebApp) window.Telegram.WebApp.openTelegramLink = (url) => window.lastShare = url;
    });
    await page.getByTestId("order-continue").tap();
    await page.waitForFunction(() => !!window.lastShare);
    assert(decodeURIComponent(await page.evaluate(() => window.lastShare)).includes("\u041E\u0440\u0438\u0435\u043D\u0442\u0438\u0440: \u041C\u0430\u0433\u0430\u0437\u0438\u043D \u043E\u0434\u0435\u0436\u0434\u044B"));
    await page.waitForFunction(() => JSON.parse(localStorage.getItem("web4tg:order-draft:v1") || "null")?.draft?.referenceProject === "muraka-fashion");
    await page.reload();
    await page.getByTestId("order-draft-dialog").getByRole("button", { name: "\u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C" }).click();
    await page.getByTestId("order-project-reference").waitFor();
    assert.equal(await page.getByTestId("order-reference-dialog").count(), 0);
    await page.evaluate(() => location.hash = "/");
    await page.getByTestId("home-page").waitFor();
    await page.evaluate(() => location.hash = "/constructor?project=flower-store");
    await page.getByTestId("order-reference-dialog").waitFor();
    await page.getByTestId("order-reference-dialog").getByRole("button", { name: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C" }).tap();
    assert((await page.getByTestId("order-project-reference").innerText()).includes("\u0446\u0432\u0435\u0442\u043E\u0432"));
    assert.equal(await page.getByTestId("order-page").getAttribute("data-order-step"), "3");
    assert.deepEqual(errors, []);
    await context.close();
    const c2 = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: "block" });
    await c2.addInitScript(() => {
      localStorage.setItem("app-language", "ru");
      localStorage.setItem("web4tg:order-draft:v1", JSON.stringify({ version: 1, savedAt: Date.now(), draft: { step: 2, templateId: "ecommerce-basic", storeCategory: "tech", extras: ["search"], projectName: "\u041C\u043E\u0439 \u0437\u0430\u043A\u0430\u0437", planId: null, annual: false } }));
    });
    const p2 = await c2.newPage();
    await p2.goto(new URL("#/constructor?project=takt-coffee", site).href);
    await p2.getByTestId("order-draft-dialog").getByRole("button", { name: "\u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C" }).click();
    await p2.getByTestId("order-reference-dialog").waitFor();
    await p2.getByTestId("order-reference-dialog").getByRole("button", { name: "\u041E\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u043A\u0430\u043A \u0435\u0441\u0442\u044C" }).click();
    assert.equal(await p2.getByTestId("order-page").getAttribute("data-order-step"), "2");
    assert((await p2.locator(".order-selected-app").innerText()).includes("\u0441\u043C\u0430\u0440\u0442\u0444\u043E\u043D"));
    assert.equal(await p2.getByTestId("recommended-feature-search").getAttribute("aria-pressed"), "true");
    await c2.close();
    const c3 = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: "block" });
    const p3 = await c3.newPage();
    await p3.goto(new URL("#/constructor?project=furniture-studio", site).href);
    await p3.getByTestId("order-project-reference").waitFor();
    assert.equal(await p3.getByTestId("order-reference-continue").count(), 0);
    assert.equal(await p3.getByTestId("order-page").getAttribute("data-order-step"), "1");
    await c3.close();
    await browser.close();
    console.log("PASS", e.name(), "project link, message, cached order, saved draft and unmatched reference");
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
