/**
 * WordPress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Save component - outputs the chat-embed custom element
 */
export default function save( { attributes } ) {
	const {
		bot,
		avatar,
		firstMessage,
		hideInputArea,
		clearOnError,
		notice,
		ttl,
		utmSource,
		utmMedium,
		utmCampaign,
		utmTargetDomain,
	} = attributes;

	const blockProps = useBlockProps.save( {
		className: 'gt-librarian-chat-embed',
	} );

	// Build the attributes object for the custom element
	const chatEmbedProps = {
		bot: bot || undefined,
		avatar: avatar || undefined,
		'first-message': firstMessage || undefined,
		'hide-input-area': hideInputArea ? 'true' : undefined,
		'clear-on-error': clearOnError ? 'true' : undefined,
		notice: notice || undefined,
		ttl: ttl ? ttl.toString() : undefined,
		'utm-source': utmSource || undefined,
		'utm-medium': utmMedium || undefined,
		'utm-campaign': utmCampaign || undefined,
		'utm-target-domain': utmTargetDomain || undefined,
	};

	// Filter out undefined values
	const filteredProps = Object.fromEntries(
		Object.entries( chatEmbedProps ).filter(
			( [ , value ] ) => value !== undefined
		)
	);

	return (
		<div { ...blockProps }>
			<chat-embed { ...filteredProps } />
		</div>
	);
}
