import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility contract for the HEX explorer.
 *
 * The README claims a WebGL fallback, reduced-motion support and
 * keyboard-accessible alternatives. These specs assert those claims against the
 * rendered application. HEX is an educational learning object: its motion is
 * kinematic teaching motion and nothing here asserts a measurement, a dynamics
 * simulation or hardware performance.
 *
 * The `color-contrast` expectations below cover pre-existing violations in
 * `src/styles.css`. They are neither suppressed nor excluded: the accent and
 * secondary text colours were darkened in the application stylesheet until
 * every measured pair cleared WCAG AA, and the full A/AA scan is asserted for
 * every mode, both locales and both viewports.
 */

const modes = [
  "explore",
  "structure",
  "joints",
  "actuation",
  "sensors",
  "power",
  "compute",
  "perception",
  "control",
  "behavior",
] as const;
const locales = ["en", "tr"] as const;
const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

// The CI runner has no GPU and falls back to software rendering, so decoding the
// humanoid GLB takes far longer than on a local machine. The 30s default was not
// enough headroom and made this suite fail on timing alone. The assertion itself
// is unchanged: the model must actually finish loading.
const MODEL_LOAD_TIMEOUT = 120_000;

async function open(page: Page, query: string) {
  await page.goto(`/${query}`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("span.sr-only[role='status']")).not.toHaveText(
    "Loading model",
    { timeout: MODEL_LOAD_TIMEOUT },
  );
}

async function wcagViolations(page: Page) {
  const scan = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
  return scan.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.map((node) => node.target.join(" ")),
  }));
}

test.describe("automated accessibility", () => {
  for (const locale of locales) {
    test(`every mode has a named 3D surface and zero WCAG A/AA violations: ${locale}`, async ({
      page,
    }) => {
      for (const mode of modes) {
        await open(page, `?mode=${mode}&lang=${locale}`);
        await expect(page.locator("html")).toHaveAttribute("lang", locale);
        // The three.js canvas carries no text; it needs an accessible name.
        await expect(page.locator("canvas")).toHaveAttribute("aria-label", /.+/, {
          timeout: 30_000,
        });
        expect(
          await wcagViolations(page),
          `mode ${mode} / ${locale}`,
        ).toEqual([]);
      }
    });
  }

  test("the guided learning path has zero WCAG A/AA violations in both locales", async ({
    page,
  }) => {
    for (const locale of locales) {
      await open(page, `?lesson=humanoid-systems&lang=${locale}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      // The header states the chapter count three ways: in the "HEX / N
      // CHAPTERS" label, in the opening sentence, and in the number of chapters
      // actually listed. They are rendered next to each other, so a hand-written
      // count in any one of them is a page that contradicts itself.
      const guide = page.locator(".learning-path");
      const label = await guide.locator(".section-label").innerText();
      const declared = label.match(/(\d+)/)?.[1];
      expect(declared, `no count in "${label}"`).toBeTruthy();
      await expect(guide.locator(".learning-header p").nth(1)).toContainText(
        `${declared} `,
      );
      await expect(guide.locator("ol li")).toHaveCount(Number(declared));

      expect(await wcagViolations(page), `guide / ${locale}`).toEqual([]);
    }
  });
});

test("the documented WebGL fallback keeps lessons and component lists usable", async ({
  page,
}) => {
  await open(page, "?lang=en");
  // Losing the context is the fallback path HEX implements and announces.
  await page.evaluate(() => {
    document
      .querySelector("canvas")!
      .dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
  });
  const fallback = page.locator(".scene-fallback");
  await expect(fallback).toBeVisible({ timeout: 30_000 });
  await expect(fallback).toContainText("3D view is unavailable");
  await expect(fallback.getByRole("button", { name: "Retry 3D" })).toBeEnabled();
  await expect(fallback.getByRole("button", { name: "Reload page" })).toBeEnabled();
  await expect(fallback.locator("img")).toHaveAttribute("alt", /.+/);
  await expect(page.locator("span.sr-only[role='status']")).toContainText(
    "3D unavailable; lessons remain accessible",
  );
  // The keyboard-accessible alternative to 3D remains available.
  const modeNav = page.getByRole("navigation", { name: "System modes" });
  await modeNav.getByRole("button", { name: /Joints/ }).click();
  await expect(modeNav.getByRole("button", { name: /Joints/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const browser = page.locator(".component-browser");
  await browser.locator("summary").click();
  await expect(
    browser.getByRole("combobox", { name: "Model component" }),
  ).toBeVisible();
  await browser
    .getByRole("combobox", { name: "Model component" })
    .selectOption({ index: 1 });
  await expect(browser.getByRole("status")).toContainText("components in this view");
  expect(await wcagViolations(page)).toEqual([]);
});

test("a WebGL context that cannot be created reaches the same fallback", async ({
  page,
}) => {
  // Context *creation* is the one failure an error boundary cannot see, because
  // react-three-fiber builds the renderer in its own mount effect. Fail every
  // WebGL context before the app boots so the real path is exercised.
  await page.addInitScript(() => {
    const create = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (id, ...rest) {
      if (typeof id === "string" && id.includes("webgl")) return null;
      return create.call(this, id, ...rest);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await open(page, "?lang=en");
  const fallback = page.locator(".scene-fallback");
  await expect(fallback).toBeVisible({ timeout: 30_000 });
  await expect(fallback).toContainText("3D view is unavailable");
  await expect(fallback.getByRole("button", { name: "Retry 3D" })).toBeEnabled();
  await expect(fallback.getByRole("button", { name: "Reload page" })).toBeEnabled();
  await expect(fallback.locator("img")).toHaveAttribute("alt", /.+/);
  await expect(page.locator("span.sr-only[role='status']")).toContainText(
    "3D unavailable; lessons remain accessible",
  );
  // Retrying cannot invent a context, and the fallback must survive the retry.
  await fallback.getByRole("button", { name: "Retry 3D" }).click();
  await expect(fallback).toBeVisible({ timeout: 30_000 });
  await expect(page.locator("span.sr-only[role='status']")).toContainText(
    "3D unavailable; lessons remain accessible",
  );
  // The keyboard-accessible alternative to 3D remains available.
  const modeNav = page.getByRole("navigation", { name: "System modes" });
  await modeNav.getByRole("button", { name: /Joints/ }).click();
  await expect(modeNav.getByRole("button", { name: /Joints/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const browser = page.locator(".component-browser");
  await browser.locator("summary").click();
  await expect(
    browser.getByRole("combobox", { name: "Model component" }),
  ).toBeVisible();
  await browser
    .getByRole("combobox", { name: "Model component" })
    .selectOption({ index: 1 });
  await expect(browser.getByRole("status")).toContainText("components in this view");
  expect(await wcagViolations(page)).toEqual([]);
});

test("reduced motion disables playback and reports the manual-control state", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "?mode=joints&lang=en");
  await expect(page.locator(".viewport-hint")).toContainText("Reduced motion");
  const play = page.getByRole("button", { name: "Play joint motion", exact: true });
  await expect(play).toBeDisabled();
  // Manual angle control stays available under reduced motion.
  const angle = page.getByRole("slider", { name: "Illustrative joint angle" });
  await expect(angle).toBeEnabled();
  await angle.focus();
  const before = await angle.inputValue();
  await page.keyboard.press("ArrowRight");
  await expect(angle).not.toHaveValue(before);
});

test("primary navigation, modes and chapter controls work with the keyboard alone", async ({
  page,
}) => {
  await open(page, "?lang=en");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#lesson$/);

  const main = page.getByRole("navigation", { name: "Main navigation" });
  await main.getByRole("button", { name: "Learning path" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".learning-path")).toBeVisible();

  const chapters = page.locator(".learning-path li button");
  await chapters.first().focus();
  await expect(chapters.first()).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 2 })).toBeVisible();
});

test("mode switching and camera controls are operable by keyboard", async ({ page }) => {
  await open(page, "?lang=en");
  const modes = page.getByRole("navigation", { name: "System modes" });
  const explore = modes.getByRole("button", { name: /Explore/ });
  await expect(explore).toHaveAttribute("aria-pressed", "true");
  const sensors = modes.getByRole("button", { name: /Sensors/ });
  await sensors.focus();
  await page.keyboard.press("Enter");
  await expect(sensors).toHaveAttribute("aria-pressed", "true");
  await expect(explore).toHaveAttribute("aria-pressed", "false");
  const side = page.getByRole("button", { name: "Side", exact: true });
  await side.focus();
  await page.keyboard.press("Enter");
  await expect(side).toHaveAttribute("aria-pressed", "true");
});
