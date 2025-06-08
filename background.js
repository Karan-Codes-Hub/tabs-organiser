// background.js - Updated Version

// Open welcome screen on install/update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install" || details.reason === "update") {
    openWelcomeScreen();
  }
});

// Also open on browser startup (if you want)
chrome.runtime.onStartup.addListener(() => {
  openWelcomeScreen();
});

// Track when new window is created (optional)
chrome.windows.onCreated.addListener((window) => {
  // You could add logic here if needed
});

// Function to open welcome screen
function openWelcomeScreen() {
  chrome.windows.getAll((windows) => {
    // Check if welcome screen is already open
    const welcomeScreenExists = windows.some(win => 
      win.tabs.some(tab => tab.url.includes('welcome.html'))
    );
    
    if (!welcomeScreenExists) {
      chrome.windows.create({
        url: chrome.runtime.getURL('welcome/welcome.html'),
        type: 'popup',
        width: 400,
        height: 600,
        left: 100,
        top: 100,
        focused: true
      }, (newWindow) => {
        if (chrome.runtime.lastError) {
          console.error('Error opening welcome screen:', chrome.runtime.lastError);
        }
      });
    }
  });
}

// Optional: Message handling for communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openWelcome") {
    openWelcomeScreen();
    sendResponse({success: true});
  }
});