const { test, expect } = require('@wordpress/e2e-test-utils-playwright');

test.describe('General Settings', () => {
    test('changes timezone', async ({ admin, page }) => {
        await admin.visitAdminPage('options-general.php');

        // Capture the default timezone
        const defaultTimezone = await page.locator('select#timezone_string').inputValue();

        // Change timezone
        await page.locator('select#timezone_string').selectOption('Africa/Libreville');
        await page.click('#submit');

        // Verify success message
        await expect(page.locator('#setting-error-settings_updated')).toHaveText(
            'Settings saved.Dismiss this notice.'
        );

        // Verify selected timezone persists
        const selectedTimezone = await page.locator('select#timezone_string').inputValue();
        await expect(selectedTimezone).toBe('Africa/Libreville');

       
        // Revert to default timezone (cleanup step)
        await page.locator('select#timezone_string').selectOption(defaultTimezone);
        await page.click('#submit');
    });
});
