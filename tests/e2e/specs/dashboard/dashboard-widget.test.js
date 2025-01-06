/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

test.describe( 'Dashboard widget management', () => {
	/**
	 * Validates the visibility of widgets based on "Screen Options" checkboxes dynamically.
	 *
	 * @param {object} page - Playwright's page object.
	 * @param {string} screenOptionsContainer - Selector for the container holding checkboxes and labels.
	 * @param {boolean} checkedStatus - Whether the checkbox should be checked
	 */
	async function validateWidgetVisibility(
		page,
		screenOptionsContainer,
		checkedStatus
	) {
		const checkboxes = page.locator(
			`${ screenOptionsContainer } input[type="checkbox"]`
		);
		const count = await checkboxes.count();

		for ( let i = 0; i < count; i++ ) {
			const checkbox = checkboxes.nth( i );
			const label = await checkbox
				.locator( 'xpath=ancestor::label' )
				.textContent(); // Get associated label text
			const isChecked = await checkbox.isChecked();

			const widgetHeadingText = label.trim();
			// Skip if the label is "Welcome"
			if ( label.trim() === 'Welcome' ) {
				continue; // Skip the current iteration and move to the next checkbox
			}
			const widgetHeading = page.locator(
				`h2.hndle.ui-sortable-handle:has-text("${ widgetHeadingText }")`
			);

			if ( checkedStatus ) {
				if ( ! isChecked ) {
					await checkbox.check(); // Click to check
					await expect( widgetHeading ).toBeVisible();
				} else {
					await expect( widgetHeading ).toBeVisible();
				}
			} else {
				if ( isChecked ) {
					await checkbox.uncheck(); // Click to check
					await expect( widgetHeading ).toBeHidden();
				} else {
					await expect( widgetHeading ).toBeHidden();
				}
			}
		}
	}

	async function showScreenOptions( page ) {
		// Ensure all widgets are visible
		const screenOptionsTab = page.locator( '#show-settings-link' );
		await screenOptionsTab.click();
	}


	/**
 * Moves a widget up or down and verifies the movement.
 *
 * @param {Page} page - The Playwright page object.
 * @param {string} direction - The direction to move the widget ("up" or "down").
 */
async function moveWidget(page, direction) {
	// Determine the button text based on the direction
	const buttonText = direction === 'down' ? 'Move down' : 'Move up';
	const widgetSelector = direction === 'down'? 'div#postbox-container-1 #normal-sortables .postbox:first-of-type': 'div#postbox-container-1 #normal-sortables .postbox:nth-of-type(2)'
	// Locate the widget and the move button
	const widget = page.locator(widgetSelector);
	const moveButton = widget.locator(
	  `button:has(span.screen-reader-text:has-text("${buttonText}"))`
	);
  
	// Get the initial position of the widget
	const initialPosition = await widget.evaluate(
	  (node) => node.getBoundingClientRect().top
	);
  
	// Click the move button
	await moveButton.click();
  
	// Wait for the AJAX request to finish
	await page.waitForResponse(
	  (response) =>
		response.url().includes('admin-ajax.php') && response.status() === 200
	);
  
  
	// Get the new position of the widget
	const newPosition = await widget.evaluate(
	  (node) => node.getBoundingClientRect().top
	);
  
	// Verify the widget moved in the expected direction
	if (direction === 'up') {
	  expect(newPosition).toBeGreaterThan(initialPosition);
	} else {
	  expect(newPosition).toBeLessThan(initialPosition);
	}
  }
  
  
  
	test.beforeEach( async ( { admin } ) => {
		// Navigate to the admin dashboard
		await admin.visitAdminPage( '/' );
	} );

	test( 'Should hide/show widgets using Screen Options', async ( {
		page,
	} ) => {
		await showScreenOptions( page );

		// Verify if widget is checked in screen option it should be visible
		await validateWidgetVisibility(
			page,
			'.metabox-prefs-container',
			true
		);
		// Verify if widget is unchecked in screen option it should not be visible
		await validateWidgetVisibility(
			page,
			'.metabox-prefs-container',
			false
		);
	} );

	test( 'Should move widgets using arrows', async ( { page, admin } ) => {
		// Ensure all widgets are visible
		await showScreenOptions( page );
		await validateWidgetVisibility(
			page,
			'.metabox-prefs-container',
			true
		);
		await moveWidget(
			page,
			'up'
		  );
		await moveWidget(
			page,
			'down'
		  );

		 
	} );

	test( 'Should collapse and expand widgets', async ( { page, admin } ) => {
		
		const widget = page.locator(
			'div#postbox-container-1 #normal-sortables .postbox:first-of-type'
		);

		const collapseButton = widget.locator(
			'button.handlediv'
		);
		const content = widget.locator( '.inside' );

		// Collapse the widget
		await collapseButton.click();
		await expect( content ).not.toBeVisible();

		// Expand the widget
		await collapseButton.click();
		await expect( content ).toBeVisible();
	} );
} );
