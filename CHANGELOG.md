# Changelog

All notable changes to GT Librarian will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.2] - 2026-01-09

### Changed
- Renamed blocks for clarity: "GT Librarian Chat" → "GT Librarian - Inline Chat" and "GT Librarian Chat Widget" → "GT Librarian - Floating Chat"
- Updated block descriptions to better explain the difference between inline and floating chat interfaces

### Fixed
- Styled loading indicator (AI thinking indicator) with smaller, more subtle jumping dots and constrained button sizes using deep-chat's auxiliaryStyle API

## [1.2.1] - 2026-01-09

### Fixed
- GitHub Issue #3: Widget window now respects viewport height with max-height constraint and top positioning to prevent title section from extending beyond top of window, including proper spacing for WordPress admin bar when users are logged in
- GitHub Issue #2: Improved vertical spacing consistency between chat list and input box by adjusting input area padding from 16px to 12px and changing alignment from flex-end to center

## [1.2.0] - 2026-01-09

### Added
- **Chat Widget Block** - New Gutenberg block for floating chat button
- Widget can be added to individual pages or block theme template parts for site-wide display
- Widget block includes title and subtitle fields for header customization
- Default title and subtitle settings in WordPress admin settings page
- Settings API now supports default_title and default_subtitle parameters

### Changed
- **BREAKING**: Renamed `src/block/` to `src/embed-block/` for consistent parallel naming
- **BREAKING**: Build output path changed from `build/block/` to `build/embed-block/`
- Updated block registration to use new paths in main plugin file
- Asset loading now checks for both embed and widget blocks

### Migration Guide
If you have existing pages using the Chat Embed block:
1. Update to v1.2.0
2. Blocks should auto-recover (block name unchanged, only asset paths changed)
3. If you see "invalid block" errors in the editor, use "Attempt Block Recovery"
4. Alternatively, remove and re-add the block

The Chat Embed block functionality remains unchanged - this is purely a structural reorganization plus the addition of the new Chat Widget block.

## [1.1.0] - 2026-01-09

### Added
- "Clear" text label next to the refresh icon for better clarity
- Confirmation dialog before clearing chat session to prevent accidental data loss
- Hover effects on clear button with brightness transition
- Accessibility improvements with `aria-label` and `title` attributes on clear button
- Clear button now visible in embed mode (previously hidden)

### Changed
- Increased clear button size in widget mode from 12px to 24px for better discoverability
- Clear button in widget mode now displays as flex layout with icon and text
- Clear button in embed mode now positioned in top-right corner with proper styling
- Improved button styling with background, padding, and shadow for better visibility

### Fixed
- GitHub Issue #1: No easy way to clear chat - clear button now properly visible and accessible in both widget and embed modes

## [1.0.0] - 2026-01-08

### Added
- Initial release of GT Librarian plugin
- AI-powered chat widget for WordPress
- Gutenberg block for embedding chat interface
- Two chat modes: floating widget and inline embed
- Chat session persistence using localStorage
- Automatic chat expiration with configurable TTL (default 24 hours)
- Message history loading and display
- Markdown rendering for AI responses with syntax highlighting
- Source links with UTM parameter tracking
- Feedback system (thumbs up/down) for AI responses
- Customizable avatar, first message, and notice text
- WordPress admin settings page for default configuration
- Mobile-responsive design with animations
- Support for custom CSS variables for theming
- Error handling and retry logic
- Integration with WordPress.com Odie API
