# GT Librarian

AI-powered chat embed block for WordPress, based on the Happiness Assistant Widget.

## Description

GT Librarian provides a Gutenberg block that allows you to embed an AI-powered chat assistant (powered by WordPress.com's Odie chatbot API) into your WordPress site. The plugin includes a settings page for configuring default values and supports customization per block instance.

## Features

- **Gutenberg Block**: Add chat embeds via the block editor
- **Modern Settings Page**: React-based settings interface using WordPress components
- **Public Bot Support**: Works with public Odie bots (no authentication required)
- **Session Management**: Automatic session persistence via localStorage
- **UTM Parameters**: Track chat interactions with UTM parameters
- **Customizable**: Configure bot, avatar, messages, and more

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- WordPress 6.0 or higher
- PHP 7.4 or higher

### Setup

1. Clone or copy the plugin to your WordPress plugins directory:
   ```bash
   cp -r gt-librarian /path/to/wordpress/wp-content/plugins/
   ```

2. Navigate to the plugin directory:
   ```bash
   cd /path/to/wordpress/wp-content/plugins/gt-librarian
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Build the plugin:
   ```bash
   npm run build
   ```

5. Activate the plugin in WordPress admin:
   - Go to Plugins → Installed Plugins
   - Find "GT Librarian" and click "Activate"

## Development

### Build Commands

```bash
# Build everything (widget + block + settings)
npm run build

# Build only the widget (TypeScript to JavaScript)
npm run build:widget

# Build only WordPress assets (block + settings)
npm run build:wp

# Start development mode for WordPress assets (with hot reload)
npm start

# Watch widget files for changes
npm run dev:widget

# Run both in parallel
npm run dev
```

### Project Structure

```
gt-librarian/
├── src/
│   ├── widget/          # Chat widget TypeScript source
│   ├── block/           # Gutenberg block (React)
│   └── settings/        # Settings page (React)
├── includes/
│   ├── class-assets.php    # Asset enqueueing
│   └── class-settings.php  # Settings page & REST API
├── build/               # Compiled assets (generated)
└── gt-librarian.php    # Main plugin file
```

## Usage

### Configuring Default Settings

1. Go to **Settings → GT Librarian** in WordPress admin
2. Configure default values:
   - **Bot ID**: The Odie bot identifier (e.g., `wpcom-chat-loggedout`)
   - **Avatar URL**: Default bot avatar image
   - **First Message**: Default greeting message
   - **TTL**: Session timeout in milliseconds (default: 24 hours)
   - **UTM Parameters**: Tracking parameters for links

3. Click "Save Settings"

### Adding a Chat Embed Block

1. Edit a post or page
2. Add a new block and search for "GT Librarian Chat"
3. Configure block settings in the sidebar:
   - Override any default settings as needed
   - Configure display options (hide input, clear on error, etc.)
4. Publish or update the page

### Block Attributes

The block supports these attributes:

- `bot` (string): Bot identifier
- `avatar` (string): Avatar image URL
- `firstMessage` (string): Initial greeting
- `hideInputArea` (boolean): Hide the input field
- `clearOnError` (boolean): Clear chat on errors
- `notice` (string): Notice text to display
- `ttl` (number): Session timeout in milliseconds
- `utmSource` (string): UTM source parameter
- `utmMedium` (string): UTM medium parameter
- `utmCampaign` (string): UTM campaign parameter
- `utmTargetDomain` (string): Domain to apply UTM params

## Technical Details

### Chat Widget

The chat widget is built with:
- TypeScript
- Web Components (Custom Elements)
- deep-chat library for UI
- WordPress.com Odie API

### Block Editor

The block uses:
- React
- WordPress block editor components
- WordPress components library
- SCSS for styling

### Session Management

- Chat sessions are stored in browser localStorage
- Sessions persist across page loads
- Sessions expire based on TTL setting
- No server-side storage required for public bots

## Support

For issues, questions, or contributions, please refer to the project repository.

## License

GPL-2.0-or-later
