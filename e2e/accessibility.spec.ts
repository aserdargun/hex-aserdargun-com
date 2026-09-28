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
 * The `color-contrast` expectations below currently FAIL. That is deliberate:
 * the violations are pre-existing in `src/styles.css`, they are not suppressed
 * or excluded, and correcting them is a colour change to the application's
 * stylesheet rather than part of adding this coverage. See the report for the
 * exact selectors and measured ratios.
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

async function open(page: Page, query: string) {
  await page.goto(`/${query}`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("span.sr-only[role='status']")).not.toHaveText(
    "Loading model",
    { timeout: 30_000 },
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
