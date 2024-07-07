import MessageHandler from "./MessageHandler.js";
import BlockHandler from "./BlockHandler.js";
import Utilities from "./Utilities.js";
import SettingsUtilities from "../shared/SettingsUtilities.js";
const {defaultSettings, getActiveSettings, checkMissingSettings} = SettingsUtilities;
const defaultBlockedSites = ["twitter.com", "reddit.com", "facebook.com"];
export let enabled = {
    status: false,
    setStatus(newStatus) {
        this.status = newStatus;
        updateIconState(this.status);
        browser.storage.local.set({lastEnabledStatus: this.status});
    }
};

browser.runtime.onMessage.addListener(handleMessage);
browser.runtime.onInstalled.addListener(async details => {
    if (details.reason == "install") {
        console.log("NoDistractions has been installed!");
    }
    if (details.reason == "update") {
        const oldVer = details.previousVersion;
        const newVer = browser.runtime.getManifest().version;
        console.log("NoDistractions has been updated from version ", oldVer, " to ", newVer);
    }
});

initialize();

async function initialize() {
    let storage = await browser.storage.local.get(null);
    if (storage.initialSetupComplete == undefined) {
        await handleInstalled(storage);
        storage = await browser.storage.local.get(null);
    }

    // if updated
    if (storage.version != browser.runtime.getManifest().version) {
        await checkMissingSettings(storage.settings);
        
        console.log("Extension is updated; running backwards compatibility checks");
        if (storage.settings.enableOnStartup != undefined) {
            console.log("detected deprecated setting enableOnStartup, converting to the new setting.");
            if (storage.settings.enableOnStartup) {
                storage.settings.startupBehaviour = "enableOnStartup";
            } else {
                storage.settings.startupBehaviour = "disableOnStartup";
            }
            
            delete storage.settings.enableOnStartup;
            browser.storage.local.set({settings: storage.settings});
        }

        await browser.storage.local.set({version: browser.runtime.getManifest().version});
    }


    console.log("initializing background listeners");
    await BlockHandler.updateRequestListener();

    const startupBehaviour = storage.settings.startupBehaviour;
    if (startupBehaviour == "rememberLastStatus") {
        const status = storage.lastEnabledStatus;
        if (status != undefined) {
            enabled.setStatus(status);
        } else {
            // Key is not in storage, add it
            enabled.setStatus(false);
        }
    } else if (startupBehaviour == "enableOnStartup") {
        enabled.setStatus(true);
    } else if (startupBehaviour == "disableOnStartup") {
        enabled.setStatus(false);
    } else {
        console.warn("Invalid startup option detected, not good.");
    }
    

    // block focused page if in blocklist and ND is enabled
    if (!enabled.status) return;
    setTimeout(() => {
        // it takes a little bit of time for the normal webrequest listener to be active. If we don't wait a bit, then there is a small period of time where the user can slip through.
        if (!enabled.status) return;
        browser.tabs.query({currentWindow: true, active: true}).then(async currentTab=> {
            currentTab = currentTab[0];
            if (await BlockHandler.testAgainstBlocklist(currentTab.url)) {
                console.log("Extension started with blocked site focused.");
                const blockedPageUrl = browser.runtime.getURL(`/blocked/Blocked.html?url=${currentTab.url}`);
                browser.tabs.update(currentTab.tabId, {url: blockedPageUrl });
            } else {
                console.log("shouldn't be blocked, url: ", currentTab.url);
            }
        });
    }, 100);
}

async function handleMessage(request, sender, sendResponse) {
    if (MessageHandler[request.type]) {
        return MessageHandler[request.type](request);
    } else {
        console.error("Message", request.type, "does not exist.");
    }
}

browser.commands.onCommand.addListener(async name => {
    if (name == "toggle-enabled") {
        const newStatus = !enabled.status;
        enabled.setStatus(newStatus);

        await checkMissingSettings(await getActiveSettings());
        browser.storage.local.get("settings").then(res => {
            if(res.settings.notifyOnKeyShortcut) {
                const msg = newStatus ? "Enabled" : "Disabled";
                Utilities.createNotification("toggle-status-notification", msg, newStatus);
            }
        });
    }
});

async function handleInstalled(storage) {
    if (storage.blockedSites == undefined || Object.keys(storage.blockedSites) == 0) {
        await browser.storage.local.set({blockedSites_V1: defaultBlockedSites});
    }
    if (storage.settings == undefined || Object.keys(storage.settings) == 0) {
        await browser.storage.local.set({settings: defaultSettings});
    } else {
        await checkMissingSettings(storage.settings);
    }

    // if (storage.version == undefined)
    //     await browser.storage.local.set({version: browser.runtime.getManifest().version});

    await browser.storage.local.set({initialSetupComplete: true});
    console.log("Initial setup complete");
}

function updateIconState(enabledState) {
    const iconPath = enabledState ? "/static/assets/icon-enabled-low.png" : "/static/assets/icon-low.png";
    browser.browserAction.setIcon({path: iconPath});
}
