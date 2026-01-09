/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	TextareaControl,
	ToggleControl,
	Notice,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

/**
 * Editor styles
 */
import './editor.scss';

/**
 * Edit component for the chat widget block
 */
export default function Edit( { attributes, setAttributes } ) {
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

	const [ defaultSettings, setDefaultSettings ] = useState( null );
	const [ loading, setLoading ] = useState( true );

	const blockProps = useBlockProps( {
		className: 'gt-librarian-chat-widget-block',
	} );

	// Load default settings from the API
	useEffect( () => {
		apiFetch( { path: '/gt-librarian/v1/settings' } )
			.then( ( settings ) => {
				setDefaultSettings( settings );

				// Set defaults if values are empty
				if ( ! bot && settings.default_bot ) {
					setAttributes( { bot: settings.default_bot } );
				}
				if ( ! avatar && settings.default_avatar ) {
					setAttributes( { avatar: settings.default_avatar } );
				}
				if ( ! title && settings.default_title ) {
					setAttributes( { title: settings.default_title } );
				}
				if ( ! subtitle && settings.default_subtitle ) {
					setAttributes( { subtitle: settings.default_subtitle } );
				}
				if ( ! firstMessage && settings.default_first_message ) {
					setAttributes( { firstMessage: settings.default_first_message } );
				}
				if ( ! utmSource && settings.utm_source ) {
					setAttributes( { utmSource: settings.utm_source } );
				}
				if ( ! utmMedium && settings.utm_medium ) {
					setAttributes( { utmMedium: settings.utm_medium } );
				}
				if ( ! utmCampaign && settings.utm_campaign ) {
					setAttributes( { utmCampaign: settings.utm_campaign } );
				}
				if ( ! utmTargetDomain && settings.utm_target_domain ) {
					setAttributes( { utmTargetDomain: settings.utm_target_domain } );
				}

				setLoading( false );
			} )
			.catch( () => {
				setLoading( false );
			} );
	}, [] );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Widget Display', 'gt-librarian' ) }
					initialOpen={ true }
				>
					<TextControl
						label={ __( 'Widget Title', 'gt-librarian' ) }
						value={ title }
						onChange={ ( value ) => setAttributes( { title: value } ) }
						help={ __(
							'Title displayed in the widget header',
							'gt-librarian'
						) }
					/>
					<TextControl
						label={ __( 'Widget Subtitle', 'gt-librarian' ) }
						value={ subtitle }
						onChange={ ( value ) => setAttributes( { subtitle: value } ) }
						help={ __(
							'Subtitle displayed below the title',
							'gt-librarian'
						) }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Bot Configuration', 'gt-librarian' ) }
					initialOpen={ false }
				>
					<TextControl
						label={ __( 'Bot ID', 'gt-librarian' ) }
						value={ bot }
						onChange={ ( value ) => setAttributes( { bot: value } ) }
						help={ __(
							'The Odie bot identifier (e.g., wpcom-chat-loggedout)',
							'gt-librarian'
						) }
					/>
					<TextControl
						label={ __( 'Avatar URL', 'gt-librarian' ) }
						value={ avatar }
						onChange={ ( value ) => setAttributes( { avatar: value } ) }
						help={ __( 'URL to the bot avatar image', 'gt-librarian' ) }
					/>
					<TextareaControl
						label={ __( 'First Message', 'gt-librarian' ) }
						value={ firstMessage }
						onChange={ ( value ) =>
							setAttributes( { firstMessage: value } )
						}
						help={ __(
							'The initial greeting message from the bot',
							'gt-librarian'
						) }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Display Options', 'gt-librarian' ) }
					initialOpen={ false }
				>
					<ToggleControl
						label={ __( 'Clear on Error', 'gt-librarian' ) }
						checked={ clearOnError }
						onChange={ ( value ) =>
							setAttributes( { clearOnError: value } )
						}
						help={ __(
							'Automatically clear chat when an error occurs',
							'gt-librarian'
						) }
					/>
					<TextControl
						label={ __( 'Session TTL (milliseconds)', 'gt-librarian' ) }
						type="number"
						value={ ttl }
						onChange={ ( value ) =>
							setAttributes( { ttl: parseInt( value, 10 ) } )
						}
						help={ __(
							'Time before chat session expires (default: 86400000 = 24 hours)',
							'gt-librarian'
						) }
					/>
					<TextareaControl
						label={ __( 'Notice Text', 'gt-librarian' ) }
						value={ notice }
						onChange={ ( value ) => setAttributes( { notice: value } ) }
						help={ __(
							'Optional notice text to display in chat',
							'gt-librarian'
						) }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'UTM Parameters', 'gt-librarian' ) }
					initialOpen={ false }
				>
					<TextControl
						label={ __( 'UTM Source', 'gt-librarian' ) }
						value={ utmSource }
						onChange={ ( value ) => setAttributes( { utmSource: value } ) }
					/>
					<TextControl
						label={ __( 'UTM Medium', 'gt-librarian' ) }
						value={ utmMedium }
						onChange={ ( value ) => setAttributes( { utmMedium: value } ) }
					/>
					<TextControl
						label={ __( 'UTM Campaign', 'gt-librarian' ) }
						value={ utmCampaign }
						onChange={ ( value ) =>
							setAttributes( { utmCampaign: value } )
						}
					/>
					<TextControl
						label={ __( 'UTM Target Domain', 'gt-librarian' ) }
						value={ utmTargetDomain }
						onChange={ ( value ) =>
							setAttributes( { utmTargetDomain: value } )
						}
						help={ __(
							'Domain to apply UTM parameters to',
							'gt-librarian'
						) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ loading && (
					<Notice status="info" isDismissible={ false }>
						{ __( 'Loading settings...', 'gt-librarian' ) }
					</Notice>
				) }

				{ ! bot && ! loading && (
					<Notice status="warning" isDismissible={ false }>
						{ __(
							'Please configure the Bot ID in the block settings.',
							'gt-librarian'
						) }
					</Notice>
				) }

				{ bot && ! loading && (
					<div className="gt-librarian-preview">
						<div className="gt-librarian-preview-header">
							<strong>
								{ __( 'GT Librarian Chat Widget', 'gt-librarian' ) }
							</strong>
						</div>
						<div className="gt-librarian-preview-body">
							{ title && (
								<p>
									<strong>{ __( 'Title:', 'gt-librarian' ) }</strong> { title }
								</p>
							) }
							{ subtitle && (
								<p>
									<strong>{ __( 'Subtitle:', 'gt-librarian' ) }</strong> { subtitle }
								</p>
							) }
							<p>
								<strong>{ __( 'Bot:', 'gt-librarian' ) }</strong> { bot }
							</p>
							{ firstMessage && (
								<p>
									<strong>
										{ __( 'First Message:', 'gt-librarian' ) }
									</strong>{ ' ' }
									{ firstMessage }
								</p>
							) }
							<p className="gt-librarian-preview-note">
								{ __(
									'This will appear as a floating chat button in the corner of the page.',
									'gt-librarian'
								) }
							</p>
						</div>
					</div>
				) }
			</div>
		</>
	);
}
