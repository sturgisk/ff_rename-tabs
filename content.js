// Global variable to store the original favicon URL.
let originalFaviconUrl = null;

// Initialize and store the original favicon URL.
function initOriginalFavicon() {
  let favicon = document.querySelector('link[rel="icon"]') ||
                document.querySelector('link[rel="shortcut icon"]');
  if (favicon) {
    originalFaviconUrl = favicon.href;
  }
}
initOriginalFavicon();

// Function to update the favicon by drawing a thick colored square border around it.
// Always uses the original favicon as the base so that previous colors are removed.
function updateFaviconWithColor(color) {
  // Locate the current favicon element.
  let favicon = document.querySelector('link[rel="icon"]') ||
                document.querySelector('link[rel="shortcut icon"]');
  
  // If no favicon exists, create one.
  if (!favicon) {
    favicon = document.createElement("link");
    favicon.rel = "icon";
    document.head.appendChild(favicon);
    favicon.href = "";
  }
  
  // Use the stored original favicon URL (if available) as the base image.
  const baseFaviconUrl = originalFaviconUrl || favicon.href;
  
  // Create an image to load the base favicon.
  const img = new Image();
  img.crossOrigin = "anonymous"; // Attempt to avoid CORS issues.
  img.src = baseFaviconUrl || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAAI0lEQVRIie3OsQkAIAwDsP//V7pksr2CEnB4vZAZGdWKBkYExZpoAgwAAAABJRU5ErkJggg=="; // Fallback blank icon.

  img.onload = function() {
    // Calculate border thickness: at least 4px or 10% of image width.
    const borderThickness = Math.max(4, img.width * 0.1);
    
    // Create a canvas larger than the original image to accommodate the border.
    const canvas = document.createElement("canvas");
    canvas.width = img.width + borderThickness * 2;
    canvas.height = img.height + borderThickness * 2;
    const ctx = canvas.getContext("2d");
    
    // Clear the canvas.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the original favicon at an offset equal to the border thickness.
    ctx.drawImage(img, borderThickness, borderThickness, img.width, img.height);
    
    // Draw a thick square border around the favicon.
    ctx.lineWidth = borderThickness;
    ctx.strokeStyle = color;
    // The stroke is drawn centered on the rectangle boundary.
    ctx.strokeRect(borderThickness / 2, borderThickness / 2, img.width + borderThickness, img.height + borderThickness);
    
    // Update the favicon with the new composite image.
    const newFaviconUrl = canvas.toDataURL("image/png");
    favicon.href = newFaviconUrl;
  };

  img.onerror = function() {
    console.error("Failed to load the favicon image.");
  };
}

// Handler for messages from the background script.
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "rename" && message.title !== undefined) {
    document.title = message.title;
  } else if (message.action === "setIconColor" && message.color) {
    updateFaviconWithColor(message.color);
  } else if (message.action === "clearIconColor") {
    // Reset the favicon to the original image.
    let favicon = document.querySelector('link[rel="icon"]') ||
                  document.querySelector('link[rel="shortcut icon"]');
    if (favicon && originalFaviconUrl) {
      favicon.href = originalFaviconUrl;
    }
  }
});

// On page load, request the current custom title.
browser.runtime.sendMessage({ action: "getCustomTitle" }).then(response => {
  if (response && response.title) {
    document.title = response.title;
  }
});
