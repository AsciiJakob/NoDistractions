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
    const settings = (await browser.storage.local.get("settings")).settings;
    const allowedLength = settings.visitAnywaysLength*60000;
    browser.runtime.sendMessage({type: "addBlockingException", data: {tabId: (await browser.tabs.getCurrent()).id, allowedLength: allowedLength} }).then(res => {
        redirectToSite();
    });
});

browser.storage.local.get("settings").then(storage => {
    if (!storage.settings.showVisitAnyways) {
        document.getElementById("visitAnywaysText").style.display = "none";
    } else {
        const durationStr = (storage.settings.visitAnywaysLength == 1) ? " minute" : " minutes";
        document.getElementById("visitAnyways").innerText = "You get "+storage.settings.visitAnywaysLength+durationStr;
    }

    if (!storage.settings.showDisableButton) {
        document.getElementById("disableND").style.display = "none";
    }

    if (!storage.settings.showCloseTabButton) {
        document.getElementById("closeTab").style.display = "none";
    }
});

function redirectToSite() {
    document.getElementById("blockedText").innerText = "Redirecting...";
    window.location = urlParams.get("url");
}
