import MessageHandler from "/background/MessageHandler.js";
import BlockHandler from "/background/BlockHandler.js";
const defaultBlockedSites = ["twitter.com", "reddit.com", "facebook.com"];
const defaultSettings = {
	enableOnStartup: false,
	visitAnywaysLength: 3
};
export let enabled = {
  status: false,
  setStatus(newStatus) {
    this.enabled = newStatus;
  }
};
browser.runtime.onInstalled.addListener(handleInstalled);
if (browser.storage.local.get("initialSetup") == true) {
  initalize();
}
async function initalize() {
  await BlockHandler.updateRequestListener();
  browser.storage.local.get("settings").then(res => {
    enabled.setStatus(res.settings.enableOnStartup);
  });
  browser.runtime.onMessage.addListener(handleMessage);
} 

async function handleMessage(request, sender, sendResponse) {
  return MessageHandler[request.type]();

}

async function handleInstalled(details) {
  if (details.reason !== "install") return;
  const blockedSites = await browser.storage.local.get("blockedSites_V1");
  if (Object.keys(blockedSites) == 0) {
      await browser.storage.local.set({blockedSites_V1: defaultBlockedSites});
  }
  const settings = await browser.storage.local.get("settings");
  if (Object.keys(settings) == 0) {
    await browser.storage.local.set({settings: defaultSettings});
  }

  await browser.storage.local.set({initialSetup: true});
  console.log("OK! calling initialize");
  initalize();
}

