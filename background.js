const defaultBlockedSites = ["twitter.com", "reddit.com", "facebook.com"];
const defaultSettings = {
	enableOnStartup: false,
	visitAnywaysLength: 3
};
let enabled = true; // should probably be disabled by default
let blockExceptions = [];

async function handleInstalled(details) {
  // if (details.reason != "install") return; // details.reason returns 'update' when reloading in debugging
  browser.storage.local.get("blockedSites_V1").then(res => {
    if (res.blockedSites_V1 == undefined) {
      browser.storage.local.set({blockedSites_V1: defaultBlockedSites});
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
  let loadedBlocklist = await browser.storage.local.get("blockedSites_V1");
  let blockUrls = [];
  console.log("loadedblockist: ", loadedBlocklist);
  if (Object.keys(loadedBlocklist) == 0) {
    console.log("Failed to load blocklist, trying again in one second.");
    setTimeout(() => {
      return loadBlocklist();
    }, 1000);
  } 
  // for (site of loadedBlocklist.blockedSites) {
  //   // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/events/UrlFilter
  //   blockUrls.push({hostContains: site});
  // }
  for (siteDomain of loadedBlocklist.blockedSites_V1) {
    blockUrls.push("*://"+siteDomain+"/*");
    if (!siteDomain.startsWith("*.") && !siteDomain.startsWith("www.")) { // this is done for user friendliness sakes. I hope it's something sensical to do and doesn't cause any issues.
      console.log("registering a www block for "+siteDomain);
      blockUrls.push("*://www."+siteDomain+"/*");
    }
    // blockUrls.push("*://*."+site+"/*");
  }
  // browser.webNavigation.onBeforeNavigate.removeListener(handleSite);
  // browser.webNavigation.onBeforeNavigate.addListener(handleSite, {url: blockUrls});
  browser.webRequest.onBeforeRequest.removeListener(handleSite);
  browser.webRequest.onBeforeRequest.addListener(handleSite, {urls: blockUrls, types: ["main_frame", "web_manifest", "sub_frame"]}, ["blocking"]);
  // also we need to use "blocking"/BlockingResponse
}

async function handleMessage(request, sender, sendResponse) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async resolve => {
    let storage = await browser.storage.local.get("blockedSites_V1");
    // a better looking way to do this, rather than a switch statement, would be to create an object with a bunch of functions that can be ran from messages like "messageHandlers[request.type]();"
    switch(request.type) {
      case "isSiteBlocked": {
        let isBlocked = false;
        if (!enabled) {
          resolve({response: isBlocked});
          return;
        }
        for (siteUrl of storage.blockedSites_V1) {
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
              if (!enabled) return removeException(request.data);
              createNotification("visit-anyways-reminder", "You have less than one minute remaining before you get locked out again.");
              browser.browserAction.setBadgeText({
                text: "1m",
                tabId: tab.id
              });
              setTimeout(() => {
                if (!enabled) return removeException(request.data);
                // TODO: Need to check if the site currently on should be blocked or not. Although i can't think of any good way of doing this with how the extension currently works
                browser.tabs.get(request.data.tabId).then(tab => {
                  // browser.tabs.update(tab.id, {url: `/static/blocked/blocked.html?url=${tab.url}`});
                  console.log("NEED TO CHECK URL ", tab.url);
                })
                .catch(err => {
                  console.log("removing From tab from blocklist because the tab doesn't exist anymore.");
                  return removeException(request.data);
                });
              }, 60000);
            })
            .catch(err => {
              console.log("removing From tab from blocklist because the tab doesn't exist anymore.");
              return removeException(request.data);
            });
            // if (request.data.tab)
          }, request.data.allowedLength-60000);
        }
      }
    }
  });
}

async function handleSite(details) {
  console.log("hadnling a site, details: ", details);
  if (!enabled) return;
  for (exception of blockExceptions) {
    if (details.tabId == exception.tabId) {
      if (Date.now() > details.deathDate) {
        console.log("deleting old");
        removeException(exception);
        break;
      }
      return;
    }
  }
  console.log("site was actually blocked.");
  // browser.tabs.update(details.tabId, {url: `/static/blocked/blocked.html?url=${details.url}`});
  console.log("trying to redirect to "+browser.runtime.getURL(`/static/blocked/blocked.html?url=${details.url}`));
  return {
    redirectUrl: browser.runtime.getURL(`/static/blocked/blocked.html?url=${details.url}`)
  };
}

function createNotification(name, alertmessage) {
	browser.notifications.create(name, {
		type: "basic",
		iconUrl: "/assets/icon.png",
		title: "NoDistractions",
		message: alertmessage
	});
}

function removeException(item) {
  const itemIndex = blockExceptions.indexOf(item);
  if (itemIndex != -1) { // -1 is returend when an item is not present in an array
    blockExceptions.splice(itemIndex, 1);
  }
}

// TODO: We need this function for setting if a site should be blocked. Normally we just add an array of domains to the an event brought to us by firefox, That is probably good practice interms of performance, but we also need to be able to tell if a site should be blocekd for other purposes! 
function isSiteBlocked(site) {
  
}

browser.runtime.onMessage.addListener(handleMessage);
browser.runtime.onInstalled.addListener(handleInstalled);