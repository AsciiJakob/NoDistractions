import MessageHandler from "./MessageHandler.js";
import BlockHandler from "./BlockHandler.js";
const defaultBlockedSites = ["twitter.com", "reddit.com", "facebook.com"];
const defaultSettings = {
	enableOnStartup: false,
	showVisitAnyways: true,
	visitAnywaysLength: 3
};
export let enabled = {
  status: false,
  setStatus(newStatus) {
    this.status = newStatus;
  }
};


browser.runtime.onMessage.addListener(handleMessage);
if (browser.storage.local.get("initialSetup") == true) {
  initalize();
} else {
  handleInstalled();
}
async function initalize() {
  console.log("initializing background");
  await BlockHandler.updateRequestListener();
  browser.storage.local.get("settings").then(res => {
    enabled.setStatus(res.settings.enableOnStartup);
    const iconPath = res.settings.enableOnStartup ? "/static/assets/icon-enabled.png" : "/static/assets/icon.png";
    browser.browserAction.setIcon({path: iconPath});
  });
  
} 

async function handleMessage(request, sender, sendResponse) {
  if (MessageHandler[request.type]) {
    return MessageHandler[request.type](request);
  } else {
    console.error("Message", request.type, "does not exist.");
  }
}

async function handleInstalled() {
  const blockedSites = await browser.storage.local.get("blockedSites_V1");
  if (Object.keys(blockedSites) == 0) {
      await browser.storage.local.set({blockedSites_V1: defaultBlockedSites});
  }
  const settings = await browser.storage.local.get("settings");
  if (Object.keys(settings) == 0) {
    await browser.storage.local.set({settings: defaultSettings});
  }

  await browser.storage.local.set({initialSetup: true});
  console.log("Initial setup complete");
  initalize();
}