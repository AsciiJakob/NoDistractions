import MessageHandler from "./MessageHandler.js";
import BlockHandler from "./BlockHandler.js";
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
        await handleInstalled();
    }
    if (details.reason == "update") {
        console.log("NoDistractions has been updated!");
        // TODO make sure the `enableOnStartup` setting is set in the new format for people who had it before. Make sure to remove old setting afterwards. 
    }

    await checkMissingSettings(await getActiveSettings());
    initalize();
});

async function initalize() {
    console.log("initializing background listeners");
    await BlockHandler.updateRequestListener();

    browser.storage.local.get("settings").then(res => {
        const startupBehaviour = res.settings.startupBehaviour;
        if (!startupBehaviour ) return;

        if (startupBehaviour == "rememberLastStatus") {
            browser.storage.local.get("lastEnabledStatus").then(res2 => {
               const status = res2.lastEnabledStatus;
               if (status != undefined) {
                    enabled.setStatus(status);
               } else {
                // Key is not in storage, add it
                enabled.setStatus(false);
               }
            });
        } else if (startupBehaviour == "enableOnStartup") {
            enabled.setStatus(true);
        } else if (startupBehaviour == "disableOnStartup") {
            enabled.setStatus(false);
        } else {
            console.warn("Invalid startup option detected, not good.");
        }
    });
}
initalize();

async function handleMessage(request, sender, sendResponse) {
    if (MessageHandler[request.type]) {
        return MessageHandler[request.type](request);
    } else {
        console.error("Message", request.type, "does not exist.");
    }
}

browser.commands.onCommand.addListener(name => {
    if (name == "toggle-enabled") {
        enabled.setStatus(!enabled.status);
    }
});

async function handleInstalled() {
    const blockedSites = await browser.storage.local.get("blockedSites_V1");
    if (Object.keys(blockedSites) == 0) {
        await browser.storage.local.set({blockedSites_V1: defaultBlockedSites});
    }
    const settings = await browser.storage.local.get("settings");
    if (Object.keys(settings) == 0) {
        await browser.storage.local.set({settings: defaultSettings});
    }

    console.log("Initial setup complete");
}

function updateIconState(enabledState) {
    const iconPath = enabledState ? "/static/assets/icon-enabled-low.png" : "/static/assets/icon-low.png";
    browser.browserAction.setIcon({path: iconPath});
}
