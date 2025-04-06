// Object to hold custom titles per tab id.
let tabCustomTitles = {};

// Create context menu item for renaming the tab.
browser.contextMenus.create({
  id: "rename-tab",
  title: "Rename Tab",
  contexts: ["tab", "page"]
});

// Create parent context menu item for changing the icon color.
browser.contextMenus.create({
  id: "change-icon-color",
  title: "Change Color",
  contexts: ["tab", "page"]
});

// Preconfigured list of colors.
const colors = ["red", "blue", "green", "yellow", "purple", "orange"];

// Create submenu items for each color.
colors.forEach(color => {
  browser.contextMenus.create({
    id: "set-icon-color-" + color,
    title: color,
    parentId: "change-icon-color",
    contexts: ["tab", "page"]
  });
});

// Create submenu item to clear icon color.
browser.contextMenus.create({
  id: "clear-icon-color",
  title: "Clear Icon Color",
  parentId: "change-icon-color",
  contexts: ["tab", "page"]
});

// Listen for context menu clicks.
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab || !tab.id) return;
  
  if (info.menuItemId === "rename-tab") {
    // Execute a script in the active tab to prompt for a new title.
    browser.tabs.executeScript(tab.id, {
      code: 'window.prompt("Enter new title for this tab (leave empty to reset):")'
    }).then((results) => {
      let newTitle = results[0];
      if (newTitle === null) return; // User canceled.
      if (newTitle.trim() !== "") {
        tabCustomTitles[tab.id] = newTitle;
      } else {
        delete tabCustomTitles[tab.id];
      }
      // Send message to content script to update the title.
      browser.tabs.sendMessage(tab.id, { action: "rename", title: newTitle });
    });
  }
  else if (info.menuItemId.startsWith("set-icon-color-")) {
    // Extract the color from the menu item id.
    let selectedColor = info.menuItemId.replace("set-icon-color-", "");
    // Send message to content script to update the favicon.
    browser.tabs.sendMessage(tab.id, { action: "setIconColor", color: selectedColor });
  }
  else if (info.menuItemId === "clear-icon-color") {
    // Send message to content script to clear the icon color.
    browser.tabs.sendMessage(tab.id, { action: "clearIconColor" });
  }
});

// Reapply custom title when a tab updates (e.g., navigates or reloads).
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tabCustomTitles[tabId]) {
    browser.tabs.sendMessage(tabId, { action: "rename", title: tabCustomTitles[tabId] });
  }
});

// Allow content scripts to request the current custom title.
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getCustomTitle" && sender.tab && sender.tab.id) {
    let title = tabCustomTitles[sender.tab.id];
    sendResponse({ title: title });
  }
});
