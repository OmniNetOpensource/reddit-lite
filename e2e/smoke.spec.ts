import { test, expect } from "@playwright/test";

test("loads home and can navigate to submit", async ({ page }) => {
  await page.goto("/");
  const createPostLink = page.getByRole("link", { name: "Create Post" });
  await expect(createPostLink).toBeVisible();
  await createPostLink.click();
  await expect(page).toHaveURL(/redirectTo=%2Fsubmit/);
});
