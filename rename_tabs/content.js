// On page load, ask the background script for a custom title for this tab
browser.runtime.sendMessage({ action: "getCustomTitle" }).then(response => {
    if (response && response.title) {
      document.title = response.title;
    }
  });
  
  // Listen for messages from the background script to update the title
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "rename" && message.title !== undefined) {
      document.title = message.title;
    }
  });
  