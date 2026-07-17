import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("showcase replay", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders the product thesis and explainable Pulse", async ({ page }) => {
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Feel the match. See the reason.",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("meter", {
        name: "BRA momentum Pulse 82 out of 100",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Why this Pulse?" }),
    ).toHaveAttribute("aria-expanded", "true");
    await expect(
      page.getByText("Recent event adds 12.0 points toward Brazil."),
    ).toBeVisible();
  });

  test("saves a free fan call and advances the replay", async ({ page }) => {
    const brazil = page.getByRole("radio", { name: "Brazil" });
    await brazil.click();
    await expect(brazil).toHaveAttribute("aria-checked", "true");
    await expect(page.getByText("Call saved on this device")).toBeVisible();

    const slider = page.getByRole("slider", { name: "Replay position" });
    const before = await slider.inputValue();
    await page.getByRole("button", { name: "Play replay" }).click();
    await expect
      .poll(() => slider.inputValue(), { timeout: 4_000 })
      .not.toBe(before);
  });

  test("has no serious or critical accessibility violations", async ({
    page,
  }) => {
    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? ""),
    );

    expect(blocking).toEqual([]);
  });
});

test("opens the server-only TxLINE connector", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Live", exact: true }).click();

  await expect(
    page.getByRole("heading", { name: "Bring your own live fixture." }),
  ).toBeVisible();
  await expect(page.getByLabel("TxLINE fixture ID")).toBeVisible();
  await expect(page.getByText("Replay-only deployment")).toBeVisible();
});

test("does not create horizontal overflow at mobile width", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"));
  await page.goto("/");

  const widths = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));

  expect(widths.document).toBeLessThanOrEqual(widths.viewport);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Feel the match. See the reason.",
    }),
  ).toBeVisible();
});
