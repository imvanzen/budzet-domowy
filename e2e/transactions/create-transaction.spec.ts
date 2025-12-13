import { test, expect } from "@playwright/test";

test.describe("US-1: Dodawanie transakcji", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/transactions");
  });

  test("should create and display transaction with valid data", async ({
    page,
  }) => {
    // Fill form
    await page.fill('input[label="Kwota"]', "100.50");
    await page.click('button:has-text("Typ")');
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    // Submit form
    await page.click('button:has-text("Dodaj transakcję")');

    // Wait for success message
    await expect(
      page.locator("text=Transakcja została dodana pomyślnie!")
    ).toBeVisible({ timeout: 5000 });

    // Verify transaction appears in list
    await expect(page.locator("text=100,50 zł")).toBeVisible();
  });

  test("should show error for amount <= 0", async ({ page }) => {
    await page.fill('input[label="Kwota"]', "0");
    await page.click('button:has-text("Typ")');
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.click('button:has-text("Dodaj transakcję")');

    await expect(
      page.locator("text=Kwota musi być większa od 0")
    ).toBeVisible();
  });

  test("should show error for future date", async ({ page }) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const futureDateString = futureDate.toISOString().split("T")[0];

    await page.fill('input[label="Kwota"]', "100");
    await page.fill('input[label="Data"]', futureDateString);
    await page.click('button:has-text("Typ")');
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.click('button:has-text("Dodaj transakcję")');

    await expect(
      page.locator("text=Data nie może być z przyszłości")
    ).toBeVisible();
  });

  test("should create transaction without category", async ({ page }) => {
    await page.fill('input[label="Kwota"]', "50.00");
    await page.click('button:has-text("Typ")');
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.click('button:has-text("Dodaj transakcję")');

    await expect(
      page.locator("text=Transakcja została dodana pomyślnie!")
    ).toBeVisible({ timeout: 5000 });

    // Verify transaction appears in list
    await expect(page.locator("text=50,00 zł")).toBeVisible();
  });
});


