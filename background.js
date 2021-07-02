const defaultBlockedSites = ["twitter.com", "reddit.com", "facebook.com"]
const defaultSettings = {
	enableOnStartup: false
}
var enabled = true; // should probably be disabled by default

async function handleInstalled(details) {
  // if (details.reason != "install") return; // details.reason returns 'update' when reloading in debugging
  browser.storage.local.get("blockedSites").then(res => {
    if (res.blockedSites == undefined) {
      browser.storage.local.set({blockedSites: defaultBlockedSites});
    }
  });
  browser.storage.local.get("settings").then(res => {
    if (res.settings == undefined) {
      browser.storage.local.set({settings: defaultSettings});
    }
  });
}


async function handleMessage(request, sender, sendResponse) {
  return new Promise(async resolve => {
    let storage = await browser.storage.local.get("blockedSites");
    switch(request.type) {
      case "isSiteBlocked":
        let isBlocked = false;
        if (!enabled) {
          resolve({response: isBlocked});
          return;
        }
        for (siteUrl of storage.blockedSites) {
          if (request.url.includes(siteUrl)) {
            isBlocked = true;
            break;
          }
        }
        resolve({response: isBlocked});
        break;
      case "isEnabled":
        resolve({response: enabled});
        break;
      case "toggleEnabled":
        enabled = !enabled;
        resolve({response: enabled});
        break;
    }
  })
}

// TODO: need to implement https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webNavigation/onBeforeNavigate with a https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/events/UrlFilter
async function handleSite() {

}


browser.runtime.onMessage.addListener(handleMessage);
browser.runtime.onInstalled.addListener(handleInstalled);
browser.webNavigation.addListener(handleSite, {url: []})