<?php
/**
 * Plugin Name:       GT Librarian
 * Description:       AI-powered chat embed block for WordPress
 * Version:           1.1.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            Your Name
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       gt-librarian
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define plugin constants
define( 'GT_LIBRARIAN_VERSION', '1.1.0' );
define( 'GT_LIBRARIAN_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'GT_LIBRARIAN_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * Load plugin classes
 */
require_once GT_LIBRARIAN_PLUGIN_DIR . 'includes/class-assets.php';
require_once GT_LIBRARIAN_PLUGIN_DIR . 'includes/class-settings.php';

/**
 * Initialize the plugin
 */
function gt_librarian_init() {
	// Initialize assets handler
	new GT_Librarian_Assets();

	// Initialize settings page
	new GT_Librarian_Settings();

	// Register the chat embed block
	register_block_type( GT_LIBRARIAN_PLUGIN_DIR . 'build/block' );
}
add_action( 'init', 'gt_librarian_init' );

/**
 * Activation hook
 */
function gt_librarian_activate() {
	// Set default options on activation
	$default_options = array(
		'default_bot' => 'wpcom-chat-loggedout',
		'default_avatar' => 'https://widgets.wp.com/help-center/images/wapuu-squared-avatar-cf83bdae49791ddafab4.svg',
		'default_first_message' => 'Hello! How can I help you today?',
		'default_ttl' => 86400000, // 24 hours in milliseconds
	);

	add_option( 'gt_librarian_settings', $default_options );
}
register_activation_hook( __FILE__, 'gt_librarian_activate' );

/**
 * Deactivation hook
 */
function gt_librarian_deactivate() {
	// Cleanup if needed
}
register_deactivation_hook( __FILE__, 'gt_librarian_deactivate' );
