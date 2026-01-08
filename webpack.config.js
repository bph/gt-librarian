/**
 * WordPress scripts webpack config extension
 * Adds settings page as an additional entry point
 */
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );

module.exports = {
	...defaultConfig,
	entry: {
		...defaultConfig.entry(),
		'settings/index': path.resolve( process.cwd(), 'src/settings', 'index.js' ),
	},
};
