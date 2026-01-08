/**
 * Settings page React app
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import {
	Panel,
	PanelBody,
	PanelRow,
	TextControl,
	TextareaControl,
	Button,
	Notice,
	Spinner,
	Card,
	CardBody,
} from '@wordpress/components';

export default function App() {
	const [ settings, setSettings ] = useState( {
		default_bot: '',
		default_avatar: '',
		default_first_message: '',
		default_color: '#0073aa',
		default_ttl: 86400000,
		default_notice: '',
		utm_source: '',
		utm_medium: '',
		utm_campaign: '',
		utm_target_domain: '',
	} );

	const [ loading, setLoading ] = useState( true );
	const [ saving, setSaving ] = useState( false );
	const [ saved, setSaved ] = useState( false );
	const [ error, setError ] = useState( null );

	// Load settings on mount
	useEffect( () => {
		apiFetch( { path: '/gt-librarian/v1/settings' } )
			.then( ( data ) => {
				setSettings( { ...settings, ...data } );
				setLoading( false );
			} )
			.catch( ( err ) => {
				setError( err.message );
				setLoading( false );
			} );
	}, [] );

	// Save settings
	const saveSettings = () => {
		setSaving( true );
		setSaved( false );
		setError( null );

		apiFetch( {
			path: '/gt-librarian/v1/settings',
			method: 'POST',
			data: settings,
		} )
			.then( () => {
				setSaving( false );
				setSaved( true );
				setTimeout( () => setSaved( false ), 3000 );
			} )
			.catch( ( err ) => {
				setSaving( false );
				setError( err.message );
			} );
	};

	// Update a setting value
	const updateSetting = ( key, value ) => {
		setSettings( { ...settings, [ key ]: value } );
	};

	if ( loading ) {
		return (
			<div className="gt-librarian-settings-loading">
				<Spinner />
				<p>{ __( 'Loading settings...', 'gt-librarian' ) }</p>
			</div>
		);
	}

	return (
		<div className="wrap gt-librarian-settings">
			<h1>{ __( 'GT Librarian Settings', 'gt-librarian' ) }</h1>

			{ saved && (
				<Notice status="success" isDismissible={ false }>
					{ __( 'Settings saved successfully!', 'gt-librarian' ) }
				</Notice>
			) }

			{ error && (
				<Notice
					status="error"
					isDismissible={ true }
					onRemove={ () => setError( null ) }
				>
					{ error }
				</Notice>
			) }

			<Card>
				<CardBody>
					<Panel>
						<PanelBody
							title={ __( 'Default Bot Configuration', 'gt-librarian' ) }
							initialOpen={ true }
						>
							<PanelRow>
								<TextControl
									label={ __( 'Default Bot ID', 'gt-librarian' ) }
									value={ settings.default_bot }
									onChange={ ( value ) =>
										updateSetting( 'default_bot', value )
									}
									help={ __(
										'The default Odie bot identifier (e.g., wpcom-chat-loggedout)',
										'gt-librarian'
									) }
									style={ { width: '100%' } }
								/>
							</PanelRow>
							<PanelRow>
								<TextControl
									label={ __( 'Default Avatar URL', 'gt-librarian' ) }
									value={ settings.default_avatar }
									onChange={ ( value ) =>
										updateSetting( 'default_avatar', value )
									}
									help={ __(
										'URL to the default bot avatar image',
										'gt-librarian'
									) }
									style={ { width: '100%' } }
								/>
							</PanelRow>
							<PanelRow>
								<TextareaControl
									label={ __(
										'Default First Message',
										'gt-librarian'
									) }
									value={ settings.default_first_message }
									onChange={ ( value ) =>
										updateSetting( 'default_first_message', value )
									}
									help={ __(
										'The default initial greeting message from the bot',
										'gt-librarian'
									) }
									style={ { width: '100%' } }
								/>
							</PanelRow>
						</PanelBody>

						<PanelBody
							title={ __( 'Default Display Options', 'gt-librarian' ) }
							initialOpen={ false }
						>
							<PanelRow>
								<TextControl
									label={ __(
										'Default Session TTL (milliseconds)',
										'gt-librarian'
									) }
									type="number"
									value={ settings.default_ttl }
									onChange={ ( value ) =>
										updateSetting(
											'default_ttl',
											parseInt( value, 10 )
										)
									}
									help={ __(
										'Time before chat session expires (default: 86400000 = 24 hours)',
										'gt-librarian'
									) }
									style={ { width: '100%' } }
								/>
							</PanelRow>
							<PanelRow>
								<TextareaControl
									label={ __( 'Default Notice Text', 'gt-librarian' ) }
									value={ settings.default_notice }
									onChange={ ( value ) =>
										updateSetting( 'default_notice', value )
									}
									help={ __(
										'Optional default notice text to display in chat',
										'gt-librarian'
									) }
									style={ { width: '100%' } }
								/>
							</PanelRow>
						</PanelBody>

						<PanelBody
							title={ __( 'Default UTM Parameters', 'gt-librarian' ) }
							initialOpen={ false }
						>
							<PanelRow>
								<TextControl
									label={ __( 'UTM Source', 'gt-librarian' ) }
									value={ settings.utm_source }
									onChange={ ( value ) =>
										updateSetting( 'utm_source', value )
									}
									style={ { width: '100%' } }
								/>
							</PanelRow>
							<PanelRow>
								<TextControl
									label={ __( 'UTM Medium', 'gt-librarian' ) }
									value={ settings.utm_medium }
									onChange={ ( value ) =>
										updateSetting( 'utm_medium', value )
									}
									style={ { width: '100%' } }
								/>
							</PanelRow>
							<PanelRow>
								<TextControl
									label={ __( 'UTM Campaign', 'gt-librarian' ) }
									value={ settings.utm_campaign }
									onChange={ ( value ) =>
										updateSetting( 'utm_campaign', value )
									}
									style={ { width: '100%' } }
								/>
							</PanelRow>
							<PanelRow>
								<TextControl
									label={ __( 'UTM Target Domain', 'gt-librarian' ) }
									value={ settings.utm_target_domain }
									onChange={ ( value ) =>
										updateSetting( 'utm_target_domain', value )
									}
									help={ __(
										'Domain to apply UTM parameters to',
										'gt-librarian'
									) }
									style={ { width: '100%' } }
								/>
							</PanelRow>
						</PanelBody>
					</Panel>

					<div className="gt-librarian-settings-actions">
						<Button
							variant="primary"
							onClick={ saveSettings }
							isBusy={ saving }
							disabled={ saving }
						>
							{ saving
								? __( 'Saving...', 'gt-librarian' )
								: __( 'Save Settings', 'gt-librarian' ) }
						</Button>
					</div>
				</CardBody>
			</Card>
		</div>
	);
}
