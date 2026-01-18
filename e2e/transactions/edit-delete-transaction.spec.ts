import { test, expect } from "@playwright/test";

test.describe("US-2 & US-3: Edycja i usuwanie transakcji", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/transactions");
  });

  test("should edit transaction", async ({ page }) => {
    // First create a transaction
    await page.fill('input[label="Kwota"]', "100.50");
    await page.click('button:has-text("Typ")');
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.click('button:has-text("Dodaj transakcję")');
    await expect(
      page.locator("text=Transakcja została dodana pomyślnie!")
    ).toBeVisible({ timeout: 5000 });

    // Click edit button
    const editButton = page
      .locator("text=100,50 zł")
      .locator("..")
      .locator('button:has-text("Edytuj")');
    await editButton.click();

    // Update amount
    const amountInput = page.locator('input[label="Kwota"]');
    await amountInput.clear();
    await amountInput.fill("200.00");

    // Submit
    await page.click('button:has-text("Zapisz")');

    // Wait for success message
    await expect(
      page.locator("text=Transakcja została zaktualizowana!")
    ).toBeVisible({ timeout: 5000 });

    // Verify updated amount appears
    await expect(page.locator("text=200,00 zł")).toBeVisible();
  });

  test("should delete transaction with confirmation", async ({ page }) => {
    // First create a transaction
    await page.fill('input[label="Kwota"]', "50.00");
    await page.click('button:has-text("Typ")');
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.click('button:has-text("Dodaj transakcję")');
    await expect(
      page.locator("text=Transakcja została dodana pomyślnie!")
    ).toBeVisible({ timeout: 5000 });

    // Click delete button
    const deleteButton = page
      .locator("text=50,00 zł")
      .locator("..")
      .locator('button:has-text("Usuń")');
    await deleteButton.click();

    // Confirm deletion
    await expect(
      page.locator("text=Czy na pewno chcesz usunąć tę transakcję?")
    ).toBeVisible();

    await page.click('button:has-text("Usuń")');

    // Verify transaction is removed
    await expect(page.locator("text=50,00 zł")).not.toBeVisible({
      timeout: 5000,
    });
  });

  test("should cancel transaction deletion", async ({ page }) => {
    // First create a transaction
    await page.fill('input[label="Kwota"]', "75.00");
    await page.click('button:has-text("Typ")');
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.click('button:has-text("Dodaj transakcję")');
    await expect(
      page.locator("text=Transakcja została dodana pomyślnie!")
    ).toBeVisible({ timeout: 5000 });

    // Click delete button
    const deleteButton = page
      .locator("text=75,00 zł")
      .locator("..")
      .locator('button:has-text("Usuń")');
    await deleteButton.click();

    // Cancel deletion
    await expect(
      page.locator("text=Czy na pewno chcesz usunąć tę transakcję?")
    ).toBeVisible();

    await page.click('button:has-text("Anuluj")');

    // Verify transaction is still visible
    await expect(page.locator("text=75,00 zł")).toBeVisible();
  });

  test("should show validation error when editing with invalid amount", async ({
    page,
  }) => {
    // First create a transaction
    await page.fill('input[label="Kwota"]', "100.00");
    await page.click('button:has-text("Typ")');
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.click('button:has-text("Dodaj transakcję")');
    await expect(
      page.locator("text=Transakcja została dodana pomyślnie!")
    ).toBeVisible({ timeout: 5000 });

    // Click edit button
    const editButton = page
      .locator("text=100,00 zł")
      .locator("..")
      .locator('button:has-text("Edytuj")');
    await editButton.click();

    // Update with invalid amount
    const amountInput = page.locator('input[label="Kwota"]');
    await amountInput.clear();
    await amountInput.fill("0");

    // Submit
    await page.click('button:has-text("Zapisz")');

    // Verify error message
    await expect(
      page.locator("text=Kwota musi być większa od 0")
    ).toBeVisible();
  });
});

