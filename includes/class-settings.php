<?php
/**
 * Handle plugin settings page and REST API
 */
class GT_Librarian_Settings {

	/**
	 * Constructor
	 */
	public function __construct() {
		add_action( 'admin_menu', array( $this, 'add_settings_page' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_settings_assets' ) );
		add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
	}

	/**
	 * Add settings page to WordPress admin
	 */
	public function add_settings_page() {
		add_options_page(
			__( 'GT Librarian Settings', 'gt-librarian' ),
			__( 'GT Librarian', 'gt-librarian' ),
			'manage_options',
			'gt-librarian',
			array( $this, 'render_settings_page' )
		);
	}

	/**
	 * Render the settings page
	 */
	public function render_settings_page() {
		echo '<div id="gt-librarian-settings"></div>';
	}

	/**
	 * Enqueue assets for the settings page
	 */
	public function enqueue_settings_assets( $hook ) {
		// Only load on our settings page
		if ( 'settings_page_gt-librarian' !== $hook ) {
			return;
		}

		$asset_file = GT_LIBRARIAN_PLUGIN_DIR . 'build/settings/index.asset.php';

		if ( file_exists( $asset_file ) ) {
			$asset = include $asset_file;

			wp_enqueue_script(
				'gt-librarian-settings',
				GT_LIBRARIAN_PLUGIN_URL . 'build/settings/index.js',
				$asset['dependencies'],
				$asset['version'],
				true
			);

			wp_enqueue_style(
				'gt-librarian-settings',
				GT_LIBRARIAN_PLUGIN_URL . 'build/settings/style-index.css',
				array( 'wp-components' ),
				$asset['version']
			);

			// Pass initial settings to JavaScript
			wp_localize_script(
				'gt-librarian-settings',
				'gtLibrarianSettings',
				array(
					'apiUrl' => rest_url( 'gt-librarian/v1' ),
					'nonce'  => wp_create_nonce( 'wp_rest' ),
				)
			);
		}
	}

	/**
	 * Register REST API routes
	 */
	public function register_rest_routes() {
		// GET settings
		register_rest_route(
			'gt-librarian/v1',
			'/settings',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_settings' ),
				'permission_callback' => array( $this, 'check_permissions' ),
			)
		);

		// POST settings
		register_rest_route(
			'gt-librarian/v1',
			'/settings',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'save_settings' ),
				'permission_callback' => array( $this, 'check_permissions' ),
				'args'                => $this->get_settings_schema(),
			)
		);
	}

	/**
	 * Check if user has permission to manage settings
	 */
	public function check_permissions() {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Get settings from database
	 */
	public function get_settings( $request ) {
		$settings = get_option( 'gt_librarian_settings', array() );

		return rest_ensure_response( $settings );
	}

	/**
	 * Save settings to database
	 */
	public function save_settings( $request ) {
		$settings = array(
			'default_bot'           => sanitize_text_field( $request->get_param( 'default_bot' ) ),
			'default_avatar'        => esc_url_raw( $request->get_param( 'default_avatar' ) ),
			'default_title'         => sanitize_text_field( $request->get_param( 'default_title' ) ),
			'default_subtitle'      => sanitize_text_field( $request->get_param( 'default_subtitle' ) ),
			'default_first_message' => sanitize_textarea_field( $request->get_param( 'default_first_message' ) ),
			'default_color'         => sanitize_hex_color( $request->get_param( 'default_color' ) ),
			'default_ttl'           => absint( $request->get_param( 'default_ttl' ) ),
			'default_notice'        => sanitize_textarea_field( $request->get_param( 'default_notice' ) ),
			'utm_source'            => sanitize_text_field( $request->get_param( 'utm_source' ) ),
			'utm_medium'            => sanitize_text_field( $request->get_param( 'utm_medium' ) ),
			'utm_campaign'          => sanitize_text_field( $request->get_param( 'utm_campaign' ) ),
			'utm_target_domain'     => sanitize_text_field( $request->get_param( 'utm_target_domain' ) ),
		);

		update_option( 'gt_librarian_settings', $settings );

		return rest_ensure_response(
			array(
				'success' => true,
				'message' => __( 'Settings saved successfully', 'gt-librarian' ),
			)
		);
	}

	/**
	 * Get settings schema for REST API validation
	 */
	private function get_settings_schema() {
		return array(
			'default_bot'           => array(
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
			),
			'default_avatar'        => array(
				'type'              => 'string',
				'sanitize_callback' => 'esc_url_raw',
			),
			'default_title'         => array(
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
			),
			'default_subtitle'      => array(
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
			),
			'default_first_message' => array(
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_textarea_field',
			),
			'default_color'         => array(
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_hex_color',
			),
			'default_ttl'           => array(
				'type'              => 'integer',
				'sanitize_callback' => 'absint',
			),
			'default_notice'        => array(
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_textarea_field',
			),
			'utm_source'            => array(
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
			),
			'utm_medium'            => array(
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
			),
			'utm_campaign'          => array(
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
			),
			'utm_target_domain'     => array(
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
			),
		);
	}
}
