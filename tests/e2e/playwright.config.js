const config = require( '@wordpress/e2e-test-utils-playwright/config/playwright-e2e.config' );

const playwrightE2EConfig = {
	...config
	// setupFilesAfterEnv: [
	// 	'<rootDir>/config/bootstrap.js',
	// ],
};

module.exports = playwrightE2EConfig;