/**
 * Settings page entry point
 */
import { render } from '@wordpress/element';
import App from './App';
import './style.scss';

// Wait for DOM to be ready
document.addEventListener( 'DOMContentLoaded', () => {
	const rootElement = document.getElementById( 'gt-librarian-settings' );

	if ( rootElement ) {
		render( <App />, rootElement );
	}
} );
