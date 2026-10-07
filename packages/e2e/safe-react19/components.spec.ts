import { expect, test as base } from "@playwright/test";

const test = base.extend<{ audit: void }>({
  audit: [
    async ({ page, context, baseURL }, use, testInfo) => {
      const failures: string[] = [];
      const warnings: string[] = [];
      const origin = new URL(baseURL!).origin;
      page.on("pageerror", (error) =>
        failures.push(`pageerror: ${error.message}`)
      );
      page.on("console", (message) => {
        if (message.type() === "warning") warnings.push(message.text());
        if (
          message.type() === "error" ||
          (message.type() === "warning" &&
            /Accessing element.ref|hydration|findDOMNode|React does not recognize/i.test(
              message.text()
            ))
        )
          failures.push(`${message.type()}: ${message.text()}`);
      });
      page.on("requestfailed", (request) =>
        failures.push(
          `network: ${new URL(request.url()).pathname}: ${request.failure()?.errorText}`
        )
      );
      page.on("response", (response) => {
        if (response.status() >= 400)
          failures.push(
            `HTTP ${response.status()}: ${new URL(response.url()).pathname}`
          );
      });
      await context.route("**/*", async (route) => {
        const request = route.request();
        if (
          new URL(request.url()).origin !== origin ||
          !["GET", "HEAD"].includes(request.method())
        ) {
          failures.push("Forbidden external or mutating request");
          await route.abort();
        } else await route.continue();
      });
      await use();
      // Unmount real components before checking so cleanup errors also fail.
      await page.goto("about:blank");
      await testInfo.attach("console-warnings", {
        body: JSON.stringify(warnings),
        contentType: "application/json",
      });
      expect(
        warnings.filter(
          (warning) =>
            !warning.startsWith(
              "[lottie-react] this animation starts by itself"
            ) &&
            !warning.startsWith(
              "[lottie-react] autoplay was not started because this device asks for reduced motion"
            ) &&
            !warning.includes(
              "Chart.Model.StudyPropertiesOverrider:Study plot does not have property 'visible'"
            )
        ),
        "Unexpected browser warnings"
      ).toEqual([]);
      expect(
        failures,
        "No ignored React, console, HTTP or network failures"
      ).toEqual([]);
    },
    { auto: true },
  ],
});

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("hydrated")).toHaveAttribute(
    "data-ready",
    "true"
  );
  await expect(page.getByRole("heading")).toContainText("React 19.3.0");
});

test("autosize measures real fonts, decimal edits and selection without focus loss", async ({
  page,
}) => {
  const input = page.getByRole("textbox", { name: "Decimal amount" });
  const width = async () =>
    input.evaluate((node) => node.getBoundingClientRect().width);
  const initial = await width();
  await input.fill("123456789.25");
  await expect.poll(width).toBeGreaterThan(initial);
  await input.press("Home");
  await input.press("ArrowRight");
  await input.press("9");
  await expect(input).toHaveValue("1923456789.25");
  await expect(input).toBeFocused();
  expect(
    await input.evaluate((node: HTMLInputElement) => node.selectionStart)
  ).toBe(2);
  for (const [name, value] of Object.entries({
    type: "text",
    inputmode: "decimal",
    autocomplete: "off",
    autocorrect: "off",
    spellcheck: "false",
  }))
    await expect(input).toHaveAttribute(name, value);
  let releaseFont!: () => void;
  const fontGate = new Promise<void>((resolve) => {
    releaseFont = resolve;
  });
  await page.route(
    "**/EuclidCircular.be8f862db48c2976009f.woff2",
    async (route) => {
      await fontGate;
      await route.continue();
    }
  );
  await page.getByRole("button", { name: "Load local font" }).click();
  await input.focus();
  await input.press("Home");
  await input.press("ArrowRight");
  await input.press("ArrowRight");
  releaseFont();
  await expect(page.locator("body")).toHaveAttribute(
    "data-font-loaded",
    "true"
  );
  await expect(input).toBeFocused();
  expect(
    await input.evaluate((node: HTMLInputElement) => node.selectionStart)
  ).toBe(2);
  // Compare against actual browser text measurement in the now-loaded font.
  await expect
    .poll(async () =>
      input.evaluate((node: HTMLInputElement) => {
        const measure = document.createElement("span");
        measure.style.font = getComputedStyle(node).font;
        measure.style.whiteSpace = "pre";
        measure.textContent = node.value;
        document.body.appendChild(measure);
        const delta = Math.abs(
          parseFloat(node.style.width) -
            (Math.ceil(measure.getBoundingClientRect().width) + 2)
        );
        measure.remove();
        return delta;
      })
    )
    .toBeLessThanOrEqual(2);
  await input.fill("0.1");
  await expect.poll(width).toBeLessThan(initial + 30);
  await expect(input).toBeFocused();
});

test("real modal delayed Escape close/focus return and drawer transition/trap", async ({
  page,
}) => {
  const opener = page.getByRole("button", { name: "Open modal", exact: true });
  await opener.click();
  const dialog = page.getByRole("dialog", { includeHidden: true });
  await expect(dialog).toBeVisible();
  await expect(dialog).toBeFocused();
  await page.keyboard.press("Escape");
  // React Modal retains the portal for the real 150ms close transition.
  await expect(
    page.locator(".ReactModal__Overlay--before-close")
  ).toBeAttached();
  await expect(page.getByTestId("closed")).toHaveText("1");
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
  const drawerOpener = page.getByRole("button", {
    name: "Open drawer",
    exact: true,
  });
  await drawerOpener.click();
  await expect(page.getByTestId("drawer-settled")).toHaveText("true");
  const first = page.getByRole("button", { name: "Drawer first" });
  const last = page.getByRole("button", { name: "Close drawer" });
  await expect(first).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(last).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(first).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(first).toBeFocused();
  await expect(page.getByTestId("drawer")).toBeVisible();
  await last.click();
  await expect(page.getByTestId("drawer")).toHaveCount(0);
  await expect(drawerOpener).toBeFocused();
});

test("Tippy singleton ref/content cleanup and Stepper navigation/store subscription", async ({
  page,
}) => {
  // Focus triggers work for both desktop and touch viewports.
  await page.getByRole("button", { name: "First tip target" }).focus();
  await expect(page.getByRole("tooltip")).toHaveText("First tip");
  await page.getByRole("button", { name: "Second tip target" }).focus();
  await expect(page.getByRole("tooltip")).toHaveText("Second tip");
  await page.getByRole("button", { name: "Remove second target" }).click();
  await expect(
    page.getByRole("button", { name: "Second tip target" })
  ).toHaveCount(0);
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await page.getByRole("button", { name: "First tip target" }).hover();
  await expect(page.getByRole("tooltip")).toHaveText("First tip");
  await expect(page.getByText("First slide", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Previous step" })
  ).toBeDisabled();
  await page.getByRole("button", { name: "Next step" }).click();
  await expect(page.getByText("Second slide", { exact: true })).toBeVisible();
  await expect(page.getByText("First slide", { exact: true })).toBeHidden();
  await expect(page.getByRole("button", { name: "Next step" })).toBeDisabled();
  await page.getByRole("button", { name: "Step 1", exact: true }).click();
  await expect(page.getByText("First slide", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Update Zustand store" }).click();
  await expect(page.getByTestId("store")).toHaveText("10");
});

test("real Visx dimensions, Spring update, bounded tooltip and depth drag", async ({
  page,
}, testInfo) => {
  const history = page.getByTestId("history");
  const svg = history.locator("svg[aria-label='XYChart']");
  const path = history.locator(".visx-area");
  await expect(path).toHaveAttribute("d", /^M/);
  const width = (await history.boundingBox())!.width;
  await expect
    .poll(async () => Number(await svg.getAttribute("width")))
    .toBeCloseTo(width, 0);
  const originalViewport = page.viewportSize()!;
  await page.setViewportSize({
    ...originalViewport,
    width: originalViewport.width - 40,
  });
  await expect
    .poll(async () => Number(await svg.getAttribute("width")))
    .toBeLessThan(width);
  await page.setViewportSize(originalViewport);
  await expect
    .poll(async () => Number(await svg.getAttribute("width")))
    .toBeCloseTo(width, 0);
  const before = await path.getAttribute("d");
  await page.getByRole("button", { name: "Update chart" }).click();
  await expect.poll(() => path.getAttribute("d")).not.toBe(before);
  await history.scrollIntoViewIfNeeded();
  const box = (await svg.boundingBox())!;
  await svg
    .locator("rect[fill='transparent']")
    .last()
    .hover({ position: { x: box.width - 60, y: 100 } });
  const tooltip = page
    .locator(".visx-tooltip:not(.visx-crosshair):not(.visx-tooltip-glyph)")
    .filter({ hasText: "$" });
  await expect(page.locator("body")).toHaveAttribute("data-chart-hover", "6");
  // Move once more after first-event bounds measurement, then near the right edge.
  await svg
    .locator("rect[fill='transparent']")
    .last()
    .hover({ position: { x: 100, y: 60 } });
  await expect(tooltip).toBeVisible();
  await svg
    .locator("rect[fill='transparent']")
    .last()
    .hover({ position: { x: box.width - 60, y: 60 } });
  await expect(tooltip).toBeVisible();
  const tip = (await tooltip.boundingBox())!;
  expect(tip.x + tip.width).toBeLessThanOrEqual(page.viewportSize()!.width + 2);
  const depth = page.getByTestId("depth");
  await expect(depth.locator(".visx-bar")).toHaveCount(2);
  const handle = depth.locator("circle[r='10']").first();
  await handle.scrollIntoViewIfNeeded();
  const drag = (await handle.boundingBox())!;
  const x = drag.x + drag.width / 2 - 5;
  const y = drag.y + drag.height / 2;
  if (testInfo.project.name === "mobile-reduced") {
    await page.evaluate(() =>
      document.addEventListener(
        "touchcancel",
        () => {
          document.body.dataset.touchCancel = "true";
        },
        { once: true }
      )
    );
    const touch = await page.context().newCDPSession(page);
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    });
    await expect(handle).toHaveAttribute("cursor", "grabbing");
    // Cross Chromium's emulated-touch movement threshold with an 80px gesture.
    for (let i = 1; i <= 5; i++) {
      await touch.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x, y: y - i * 16 }],
      });
      await page.evaluate(
        () =>
          new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      );
    }
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await touch.detach();
    await expect(page.locator("body")).not.toHaveAttribute(
      "data-touch-cancel",
      "true"
    );
  } else {
    await page.mouse.move(x, y);
    await page.mouse.down();
    await expect(handle).toHaveAttribute("cursor", "grabbing");
    await page.mouse.move(x, y - 24, { steps: 5 });
    await page.mouse.up();
  }
  await expect
    .poll(async () =>
      Number(await page.getByTestId("drag-submitted").textContent())
    )
    .toBeGreaterThan(2);
});

test("real Lottie hover restarts/sizing, including reduced-motion environment", async ({
  page,
}, testInfo) => {
  const lottie = page.getByTestId("lottie");
  await expect(lottie.locator("svg")).toBeVisible();
  await lottie.scrollIntoViewIfNeeded();
  const box = (await lottie.boundingBox())!;
  expect(box.width).toBe(300);
  expect(box.height).toBe(150);
  await page.mouse.move(box.x + 100, box.y + 80);
  if (testInfo.project.name === "mobile-reduced") {
    await expect(lottie.locator("svg")).toBeVisible();
    await expect(page.getByTestId("lottie-frame")).toHaveAttribute(
      "data-frame",
      "0"
    );
    return;
  }
  await expect
    .poll(async () =>
      Number(await page.getByTestId("lottie-frame").getAttribute("data-frame"))
    )
    .toBeGreaterThan(2);
  await page.mouse.move(0, 0);
  // v3 recreates autoplay=false at frame zero; no implicit reduced-motion policy is claimed.
  await expect
    .poll(async () =>
      Number(await page.getByTestId("lottie-frame").getAttribute("data-frame"))
    )
    .toBeLessThan(2);
  await page.mouse.move(box.x + 100, box.y + 80);
  await expect
    .poll(async () =>
      Number(await page.getByTestId("lottie-frame").getAttribute("data-frame"))
    )
    .toBeGreaterThan(2);
});

test("untouched TradingView v27 iframe initializes with offline bars and cleans up", async ({
  page,
}) => {
  const toggle = page.getByRole("button", { name: "Toggle vendor chart" });
  await expect(toggle).toBeEnabled();
  expect(await page.evaluate("TradingView.version()")).toMatch(/^CL v27\./);
  await toggle.click();
  const iframe = page.getByTestId("vendor").locator("iframe");
  await expect(iframe).toBeVisible();
  await expect(page.locator("body")).toHaveAttribute("data-feed-bars", /[1-9]/);
  await expect(page.locator("body")).toHaveAttribute(
    "data-feed-subscribed",
    "true"
  );
  await expect(
    page.frameLocator("[data-testid='vendor'] iframe").locator("canvas").first()
  ).toBeVisible();
  await toggle.click();
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(page.locator("body")).toHaveAttribute(
    "data-feed-unsubscribed",
    "true"
  );
  await toggle.click();
  await expect(iframe).toBeVisible();
  await expect(
    page.frameLocator("[data-testid='vendor'] iframe").locator("canvas").first()
  ).toBeVisible();
  await toggle.click();
  await expect(page.locator("iframe")).toHaveCount(0);
});
