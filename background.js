const defaultBlockedSites = ["twitter.com", "reddit.com", "facebook.com"]
const defaultSettings = {
	enableOnStartup: false,
	visitAnywaysLength: 5
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
loadBlocklist();
async function loadBlocklist() {
  loadedBlocklist = await browser.storage.local.get("blockedSites");
  let blockUrls = [];
  for (site of loadedBlocklist.blockedSites) {
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/events/UrlFilter
    blockUrls.push({hostContains: site});
  }
  browser.webNavigation.onBeforeNavigate.addListener(handleSite, {url: blockUrls});
  console.log("passed: ", blockUrls);
}

async function handleMessage(request, sender, sendResponse) {
  return new Promise(async resolve => {
    let storage = await browser.storage.local.get("blockedSites");
    switch(request.type) {
      case "isSiteBlocked": {
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
      }
      case "updatedBlocklist": {
        loadBlocklist();
        resolve(true);
        break;
      }
      case "isEnabled": {
        resolve({response: enabled});
        break;
      }
      case "toggleEnabled": {
        enabled = !enabled;
        resolve({response: enabled});
        break;
      }
      case "setEnabled": {
        enabled = request.enabled;
        resolve({response: enabled});
      }
    }
  })
}
// TODO: blockedsiteThings starting with ! or something could be regex ones.
async function handleSite(details) {
  console.log("handling site: ", details);
  if (enabled) {
    console.log(details.tabId)
    browser.tabs.update(details.tabId, {url: `/static/blocked/blocked.html?url=${details.url}`});
  }
}


browser.runtime.onMessage.addListener(handleMessage);
browser.runtime.onInstalled.addListener(handleInstalled);