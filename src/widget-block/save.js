/**
 * WordPress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Save component - outputs the chat-widget custom element
 */
export default function save( { attributes } ) {
	const {
		bot,
		avatar,
		title,
		subtitle,
		firstMessage,
		clearOnError,
		notice,
		ttl,
		utmSource,
		utmMedium,
		utmCampaign,
		utmTargetDomain,
	} = attributes;

	const blockProps = useBlockProps.save( {
		className: 'gt-librarian-chat-widget',
	} );

	// Build the attributes object for the custom element
	const chatWidgetProps = {
		bot: bot || undefined,
		avatar: avatar || undefined,
		title: title || undefined,
		subtitle: subtitle || undefined,
		'first-message': firstMessage || undefined,
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
		Object.entries( chatWidgetProps ).filter(
			( [ , value ] ) => value !== undefined
		)
	);

	return (
		<div { ...blockProps }>
			<chat-widget { ...filteredProps } />
		</div>
	);
}
