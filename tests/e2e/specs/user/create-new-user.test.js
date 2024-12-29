/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

test.describe( 'Create User', () => {
	let username, email;

	test.beforeEach( async ( { admin } ) => {
		// Navigate to the Add New User page
		await admin.visitAdminPage( 'user-new.php' );
	} );

	test.afterEach( async ( { requestUtils } ) => {
		await requestUtils.deleteAllUsers();
	} );

	test( 'creates new user successfully', async ( { page, requestUtils } ) => {
		// Generate random username and email
		username = 'TestUser' + Date.now();
		email = `user${ Date.now() }@domain.tld`;

		// Wait until network is idle
		await page.waitForLoadState( 'networkidle' );

		// Fill in the username and email
		await page.locator( '#user_login' ).fill( username );
		await page.locator( '#email' ).fill( email );

		const passwordText = await page.locator( '#pass1' ).textContent();

		// Click the "Add New User" button
		await page.click( 'role=button[name="Add New User"i]' );

		// Verify success message
		await expect( page.locator( '#message p' ) ).toHaveText(
			'New user created. Edit user'
		);

		await requestUtils.login( username, passwordText );

		// Verify if the expected element is visible
		const isLoggedIn = await page
			.locator( '.wp-heading-inline' )
			.isVisible();
		if ( isLoggedIn ) {
			console.log( 'Login successful with newly created user' );
		} else {
			console.error( 'Login failed' );
		}
	} );
} );
