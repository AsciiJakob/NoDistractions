const defaultBlockedSites = ["twitter.com", "reddit.com", "facebook.com"];
const defaultSettings = {
	enableOnStartup: false,
	visitAnywaysLength: 3
};
let enabled = true; // should probably be disabled by default
let blockExceptions = [];

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

// TODO: Seems like certain things loaded from within a website is blocked. for example https://grantnorwood.com/eslint-parsing-error-unexpected-token-visual-studio-code/ gets blocked because it loads a resource from twitter cdn.

// TODO: This function breaks sometimes when first loading it because browser.storage.local.get("blockedSites"); doesn't return anything. Perhaps running it on some "loaded" event or something could fix it, or perhaps just waiting a bit then retrying.
// Priority of that is kind of high because it prevents it from working sometimes.
loadBlocklist();
async function loadBlocklist() {
  let loadedBlocklist = await browser.storage.local.get("blockedSites");
  let blockUrls = [];
  console.log("loadedblockist: ", loadedBlocklist);
  for (site of loadedBlocklist.blockedSites) {
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/events/UrlFilter
    blockUrls.push({hostContains: site});
  }
  browser.webNavigation.onBeforeNavigate.removeListener(handleSite);
  browser.webNavigation.onBeforeNavigate.addListener(handleSite, {url: blockUrls});
}

async function handleMessage(request, sender, sendResponse) {
  // eslint-disable-next-line no-async-promise-executor
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
        break;
      }
      case "addBlockingException": {
        blockExceptions.push(request.data);
        resolve({response: true});
        if (request.data.allowedLength > 60000) {
          setTimeout(() => {
            browser.tabs.get(request.data.tabId).then(tab => {
              console.log("tab: ", tab);
              if (!enabled) return removeFromBlocklist(request.data);
              createNotification("visit-anyways-reminder", "You have less than one minute remaining before you get locked out again.");
              setTimeout(() => {
                if (!enabled) return removeFromBlocklist(request.data);
                browser.tabs.update(tab.id, {url: `/static/blocked/blocked.html?url=${tab.url}`});
              }, 60000);
            })
            .catch(err => {
              console.log("removing From tab from blocklist because the tab doesn't exist anymore.");
              return removeFromBlocklist(request.data);
            });
            // if (request.data.tab)
          }, request.data.allowedLength-60000);
        }
      }
    }
  });
}
// TODO: regex support.
async function handleSite(details) {
  if (!enabled) return;
  for (exception of blockExceptions) {
    if (details.tabId == exception.tabId) {
      if (Date.now() > details.deathDate) {
        console.log("deleting old");
        removeFromBlocklist(exception);
        break;
      }
      return;
    }
  }
  console.log("blocked: ", details);
  browser.tabs.update(details.tabId, {url: `/static/blocked/blocked.html?url=${details.url}`});
}

function createNotification(name, alertmessage) {
	browser.notifications.create(name, {
		type: "basic",
		iconUrl: "/assets/icon.png",
		title: "NoDistractions",
		message: alertmessage
	});
}

function removeFromBlocklist(item) {
  const itemIndex = blockExceptions.indexOf(item);
  if (itemIndex != -1) {
    blockExceptions.splice(itemIndex, 1);
  }
}


browser.runtime.onMessage.addListener(handleMessage);
browser.runtime.onInstalled.addListener(handleInstalled);