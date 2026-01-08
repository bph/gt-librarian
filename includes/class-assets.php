<?php
/**
 * Handle asset enqueueing for the plugin
 */
class GT_Librarian_Assets {

	/**
	 * Constructor
	 */
	public function __construct() {
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_assets' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_frontend_assets' ) );
	}

	/**
	 * Enqueue assets for the block editor
	 */
	public function enqueue_editor_assets() {
		// Widget assets are also needed in the editor for preview
		$this->enqueue_widget_assets();
	}

	/**
	 * Enqueue assets for the frontend
	 */
	public function enqueue_frontend_assets() {
		// Only enqueue if the block is used on the page
		if ( has_block( 'gt-librarian/chat-embed' ) ) {
			$this->enqueue_widget_assets();
		}
	}

	/**
	 * Enqueue the chat widget assets
	 */
	private function enqueue_widget_assets() {
		$widget_js = GT_LIBRARIAN_PLUGIN_URL . 'build/widget/chat-widget.js';
		$widget_js_path = GT_LIBRARIAN_PLUGIN_DIR . 'build/widget/chat-widget.js';

		// Check if built file exists
		if ( file_exists( $widget_js_path ) ) {
			wp_enqueue_script(
				'gt-librarian-widget',
				$widget_js,
				array(),
				filemtime( $widget_js_path ),
				true
			);
		}
	}
}
