// Object to hold custom titles per tab id
let tabCustomTitles = {};

// Create a context menu item that appears on both the page and the tab strip
browser.contextMenus.create({
  id: "rename-tab",
  title: "Rename Tab",
  contexts: ["tab", "page"]
});

// Listen for context menu clicks
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "rename-tab" && tab.id) {
    // Execute a script in the tab to show the prompt dialog in the page context
    browser.tabs.executeScript(tab.id, {
      code: 'window.prompt("Enter new title for this tab (leave empty to reset):")'
    }).then((results) => {
      let newTitle = results[0];

      // If the user cancels the prompt, newTitle will be null; do nothing.
      if (newTitle === null) {
        return;
      }
      
      if (newTitle.trim() !== "") {
        // Save or update the custom title for this tab
        tabCustomTitles[tab.id] = newTitle;
      } else {
        // Remove the custom title if input is empty (reset)
        delete tabCustomTitles[tab.id];
      }
      
      // Update the title immediately in the tab by sending a message to the content script
      browser.tabs.sendMessage(tab.id, { action: "rename", title: newTitle });
    });
  }
});

// When a tab updates (like after navigation), reapply the custom title if one is set
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tabCustomTitles[tabId]) {
    browser.tabs.sendMessage(tabId, { action: "rename", title: tabCustomTitles[tabId] });
  }
});

// Listen for requests from content scripts asking for the current custom title
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getCustomTitle" && sender.tab && sender.tab.id) {
    let title = tabCustomTitles[sender.tab.id];
    sendResponse({ title: title });
  }
});
