# Rename Tabs

Firefox Extension that lets you rename tabs persistently during your browsing session by right-clicking on either the tab strip or the page itself.  Allows color boarder around favicon.

## Features

- **Right-Click Renaming:** Rename tabs by right-clicking on either the webpage or the tab strip.
- **Per-Tab Persistence:** Custom titles are stored per tab (using the tab’s ID) and persist as you navigate within the same tab.
- **Easy Reset:** Leave the prompt empty to reset the tab title to its default value.

## Permissions
- **tabs:** Required to access browser tab information (such as tab IDs and URLs) so the extension can correctly update and track individual tab titles.

- **activeTab:** Allows the extension to interact with the currently active tab, such as injecting scripts (e.g., the prompt) into the page.

- **contextMenus:** Enables the extension to add custom context menu items (for both the page and the tab strip) to trigger the renaming functionality.

- **storage:** Provides access to local storage so that custom tab titles can be saved and re-applied across navigations within the same tab.

## File Structure
dir

├── manifest.json

├── background.js

└── content.js