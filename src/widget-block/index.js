/**
 * Registers the GT Librarian Chat Widget block
 */
import { registerBlockType } from '@wordpress/blocks';
import './style.scss';

/**
 * Internal dependencies
 */
import Edit from './edit';
import save from './save';
import metadata from './block.json';

/**
 * Register the block
 */
registerBlockType( metadata.name, {
	...metadata,
	edit: Edit,
	save,
} );
