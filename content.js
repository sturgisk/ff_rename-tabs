// Function to update the favicon by drawing a colored rectangle along its bottom edge.
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
  
  const faviconUrl = favicon.href;
  
  // Create an image to load the favicon.
  const img = new Image();
  img.crossOrigin = "anonymous"; // Avoid CORS issues if possible.
  img.src = faviconUrl || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAAI0lEQVRIie3OsQkAIAwDsP//V7pksr2CEnB4vZAZGdWKBkYExZpoAgwAAAABJRU5ErkJggg=="; // Fallback blank icon

  img.onload = function() {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    const rectHeight = Math.max(2, img.height * 0.15);
    ctx.fillStyle = color;
    ctx.fillRect(0, img.height - rectHeight, img.width, rectHeight);
    // Optionally add a white line above the rectangle.
    ctx.lineWidth = 1;
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(0, img.height - rectHeight);
    ctx.lineTo(img.width, img.height - rectHeight);
    ctx.stroke();

    // Update the favicon with the new composite image.
    const newFaviconUrl = canvas.toDataURL("image/png");
    favicon.href = newFaviconUrl;
  };

  img.onerror = function() {
    console.error("Failed to load the favicon image.");
  };
}

// Handle messages from the background script.
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "rename" && message.title !== undefined) {
    document.title = message.title;
  }
  else if (message.action === "setIconColor" && message.color) {
    updateFaviconWithColor(message.color);
  }
});

// On page load, request the current custom title.
browser.runtime.sendMessage({ action: "getCustomTitle" }).then(response => {
  if (response && response.title) {
    document.title = response.title;
  }
});
