# GT Librarian

AI-powered chat blocks for WordPress, based on the Happiness Assistant Widget.

## Description

GT Librarian provides two Gutenberg blocks that allow you to add an AI-powered chat assistant (powered by WordPress.com's Odie chatbot API) to your WordPress site:

1. **GT Librarian - Inline Chat**: Embeds chat interface directly in your page content
2. **GT Librarian - Floating Chat**: Adds a floating chat button fixed in the corner of the page

The plugin includes a settings page for configuring default values and supports customization per block instance.

## Features

- **Two Gutenberg Blocks**: Choose between inline or floating chat interfaces
- **Modern Settings Page**: React-based settings interface using WordPress components
- **Public Bot Support**: Works with public Odie bots (no authentication required)
- **Session Management**: Automatic session persistence via localStorage
- **UTM Parameters**: Track chat interactions with UTM parameters
- **Customizable**: Configure bot, avatar, messages, titles, and more
- **Template Support**: Add floating chat to block theme template parts for site-wide display

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
│   ├── widget/          # Chat widget TypeScript source (web component)
│   ├── embed-block/     # Inline Chat block (React)
│   ├── widget-block/    # Floating Chat block (React)
│   └── settings/        # Settings page (React)
├── includes/
│   ├── class-assets.php    # Asset enqueueing
│   └── class-settings.php  # Settings page & REST API
├── build/               # Compiled assets (generated)
│   ├── widget/          # Chat web component (chat-widget.js)
│   ├── embed-block/     # Inline Chat block assets
│   ├── widget-block/    # Floating Chat block assets
│   └── settings/        # Settings page assets
└── gt-librarian.php    # Main plugin file
```

## Usage

### Configuring Default Settings

1. Go to **Settings → GT Librarian** in WordPress admin
2. Configure default values:
   - **Bot ID**: The Odie bot identifier (e.g., `wpcom-chat-loggedout`)
   - **Avatar URL**: Default bot avatar image
   - **Title**: Default title for floating chat widget header
   - **Subtitle**: Default subtitle for floating chat widget header
   - **First Message**: Default greeting message
   - **TTL**: Session timeout in milliseconds (default: 24 hours)
   - **UTM Parameters**: Tracking parameters for links

3. Click "Save Settings"

### Adding Chat Blocks

#### Inline Chat Block

1. Edit a post or page
2. Add a new block and search for "GT Librarian - Inline Chat"
3. Configure block settings in the sidebar:
   - Override any default settings as needed
   - Configure display options (hide input, clear on error, etc.)
4. Publish or update the page

**Use Case**: Best for embedding chat directly in your content, like a support section or FAQ page.

#### Floating Chat Block

1. Edit a post, page, or template part (for site-wide display)
2. Add a new block and search for "GT Librarian - Floating Chat"
3. Configure block settings in the sidebar:
   - Set title and subtitle for the widget header
   - Override any default settings as needed
4. Publish or update

**Use Case**: Best for adding a persistent chat button that stays in the corner. Add to a block theme template part (header/footer) for site-wide display.

### Block Attributes

**Inline Chat Block** supports:
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

**Floating Chat Block** supports all of the above plus:
- `title` (string): Widget header title
- `subtitle` (string): Widget header subtitle

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
