import { test, expect } from "@playwright/test";

test.describe("US-5: Zarządzanie kategoriami", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/categories");
  });

  test("should create category with valid name", async ({ page }) => {
    // Fill form
    await page.fill('input[label="Nazwa"]', "Test Category");

    // Submit form
    await page.click('button:has-text("Dodaj Kategorię")');

    // Wait for success message
    await expect(
      page.locator("text=Kategoria została dodana pomyślnie!")
    ).toBeVisible({ timeout: 5000 });

    // Verify category appears in list
    await expect(page.locator("text=Test Category")).toBeVisible();
  });

  test("should show error for empty category name", async ({ page }) => {
    await page.click('button:has-text("Dodaj Kategorię")');

    await expect(
      page.locator("text=Nazwa kategorii jest wymagana")
    ).toBeVisible();
  });

  test("should show error for name longer than 100 characters", async ({
    page,
  }) => {
    const longName = "a".repeat(101);
    await page.fill('input[label="Nazwa"]', longName);
    await page.click('button:has-text("Dodaj Kategorię")');

    await expect(
      page.locator("text=Nazwa nie może przekraczać 100 znaków")
    ).toBeVisible();
  });

  test("should edit category", async ({ page }) => {
    // First create a category
    await page.fill('input[label="Nazwa"]', "Original Name");
    await page.click('button:has-text("Dodaj Kategorię")');
    await expect(
      page.locator("text=Kategoria została dodana pomyślnie!")
    ).toBeVisible({ timeout: 5000 });

    // Click edit button
    const editButton = page
      .locator("text=Original Name")
      .locator("..")
      .locator('button:has-text("Edytuj")');
    await editButton.click();

    // Update name
    const nameInput = page.locator('input[label="Nazwa"]');
    await nameInput.clear();
    await nameInput.fill("Updated Name");

    // Submit
    await page.click('button:has-text("Zapisz")');

    // Wait for success message
    await expect(
      page.locator("text=Kategoria została zaktualizowana!")
    ).toBeVisible({ timeout: 5000 });

    // Verify updated name appears
    await expect(page.locator("text=Updated Name")).toBeVisible();
  });

  test("should delete category with confirmation", async ({ page }) => {
    // First create a category
    await page.fill('input[label="Nazwa"]', "To Delete");
    await page.click('button:has-text("Dodaj Kategorię")');
    await expect(
      page.locator("text=Kategoria została dodana pomyślnie!")
    ).toBeVisible({ timeout: 5000 });

    // Click delete button
    const deleteButton = page
      .locator("text=To Delete")
      .locator("..")
      .locator('button:has-text("Usuń")');
    await deleteButton.click();

    // Confirm deletion
    await expect(
      page.locator("text=Czy na pewno chcesz usunąć tę kategorię?")
    ).toBeVisible();

    await page.click('button:has-text("Usuń")');

    // Verify category is removed
    await expect(page.locator("text=To Delete")).not.toBeVisible({
      timeout: 5000,
    });
  });

  test("should cancel category deletion", async ({ page }) => {
    // First create a category
    await page.fill('input[label="Nazwa"]', "To Keep");
    await page.click('button:has-text("Dodaj Kategorię")');
    await expect(
      page.locator("text=Kategoria została dodana pomyślnie!")
    ).toBeVisible({ timeout: 5000 });

    // Click delete button
    const deleteButton = page
      .locator("text=To Keep")
      .locator("..")
      .locator('button:has-text("Usuń")');
    await deleteButton.click();

    // Cancel deletion
    await expect(
      page.locator("text=Czy na pewno chcesz usunąć tę kategorię?")
    ).toBeVisible();

    await page.click('button:has-text("Anuluj")');

    // Verify category is still visible
    await expect(page.locator("text=To Keep")).toBeVisible();
  });
});
