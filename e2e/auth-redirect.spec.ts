import { test, expect } from "@playwright/test";

test("unauthenticated visitor to / is redirected to /login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
});

test("unauthenticated visitor to /onboarding is redirected to /login", async ({ page }) => {
  await page.goto("/onboarding");
  await expect(page).toHaveURL(/\/login$/);
});
