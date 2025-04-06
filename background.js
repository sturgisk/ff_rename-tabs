// Object to hold custom titles per tab id
let tabCustomTitles = {};

// Create context menu items for renaming and changing icon color.
browser.contextMenus.create({
  id: "rename-tab",
  title: "Rename Tab",
  contexts: ["tab", "page"]
});

browser.contextMenus.create({
  id: "change-icon-color",
  title: "Change Icon Color",
  contexts: ["tab", "page"]
});

// Preconfigured colors.
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

// Listen for context menu clicks.
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab || !tab.id) return;
  
  if (info.menuItemId === "rename-tab") {
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
      browser.tabs.sendMessage(tab.id, { action: "rename", title: newTitle });
    });
  }
  else if (info.menuItemId.startsWith("set-icon-color-")) {
    let selectedColor = info.menuItemId.replace("set-icon-color-", "");
    browser.tabs.sendMessage(tab.id, { action: "setIconColor", color: selectedColor });
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
