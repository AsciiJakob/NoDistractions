import SettingsUtilities from "../shared/SettingsUtilities.js";
const {getActiveSettings} = SettingsUtilities;
var urlParams = new URLSearchParams(window.location.search);
document.title = "Blocked | "+urlParams.get("url");

document.getElementById("displayURL").innerText = urlParams.get("url");
document.getElementById("displayURL").href = urlParams.get("url");
document.getElementById("closeTab").addEventListener("click", () => {
    browser.tabs.getCurrent().then(tab => {
        browser.tabs.remove(tab.id);
    });
});
document.getElementById("disableND").addEventListener("click", () => {
    browser.runtime.sendMessage({type: "setStatus", enabled: false}).then(res => {
        browser.tabs.getCurrent().then(tab => {
            redirectToSite();
        });
    });
});
document.getElementById("visitAnyways").addEventListener("click", async () => {
    const settings = await getActiveSettings();
    const allowedLength = settings.visitAnywaysLength*60000;
    browser.runtime.sendMessage({type: "addBlockingException", data: {tabId: (await browser.tabs.getCurrent()).id, allowedLength: allowedLength} }).then(res => {
        redirectToSite();
    });
});

getActiveSettings().then(settings => {
    if (!settings.showVisitAnyways) {
        document.getElementById("visitAnywaysText").style.display = "none";
    } else {
        const durationStr = (settings.visitAnywaysLength == 1) ? " minute" : " minutes";
        document.getElementById("visitAnyways").innerText = "You get "+settings.visitAnywaysLength+durationStr;
    }

    if (!settings.showDisableButton) {
        document.getElementById("disableND").style.display = "none";
    }

    if (!settings.showCloseTabButton) {
        document.getElementById("closeTab").style.display = "none";
    }
});

function redirectToSite() {
    document.getElementById("blockedText").innerText = "Redirecting...";
    window.location = urlParams.get("url");
}
