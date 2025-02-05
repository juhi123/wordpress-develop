/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

test.describe( 'Assign parent page to child page', () => {

    let parentPage;
    let childPage;
    test.beforeEach( async ( { requestUtils, admin } ) => {

        await requestUtils.activateTheme('twentytwentyfour');

         parentPage = "Parent Page Test";
         childPage = "Child Page Test";

        // Create a Parent Page
        await requestUtils.createPage(
            {
                title: parentPage,
                status: 'publish',
            }

        )

        // Create a Child Page
        await requestUtils.createPage(
            {
                title: childPage,
                status: 'publish',
            }

        )
    

        await admin.visitAdminPage( 'edit.php', 'post_type=page' );
    } );

    test.afterEach( async ( { requestUtils } ) => {
        await requestUtils.deleteAllPages();
    } );

    test( 'assign a parent page to child page', async ( {
        page,
        admin,
        editor,
    } ) => {
        
        
        // Click on the edit link
        await page.hover( `role=link[name="“${childPage}” (Edit)"i]` );
        await page
            .getByRole( 'link', { name: `Edit “${childPage}”` } )
            .first()
            .click();
            await page.waitForLoadState( 'domcontentloaded' );
            // await editor.setPreferences( 'core/edit-post', {
            //     preferences: {
            //         features: {
            //     showBlockPatterns: false,
            //         },},
            // } );
            await page.focus('.components-modal__header');
            await page.keyboard.press('Escape');
            // await page.locator('button.components-button [aria-label="Close"]').click();

      
// assigning child page to parent page
        
        await page.locator( 'button[aria-label="Change parent: None"]' ).click();

        await page.waitForSelector( '#components-form-token-input-combobox-control-1', {
            visible: true,
        } );
      // await page.click( 'role=combobox[name="Parent Page:"i]' );
        await page.fill( '#components-form-token-input-combobox-control-1', parentPage );
        await page.keyboard.press( 'Enter' );
        await page.keyboard.press('Escape');

        await page.focus('.components-modal__header');
        await page.keyboard.press('Escape');

        const saveButton = page.locator('button.editor-post-publish-button__button:has-text("Save")');
        await expect(saveButton).toBeEnabled();
        await saveButton.click();
        await page.focus('.components-modal__header');
        await page.keyboard.press('Escape');
        //expect successful update message
        await expect(
            page.locator( '.components-snackbar__content' )
        ).toHaveText( 'Page updated.View Page' );
    } );
} );
