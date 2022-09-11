export function toggle() {
    browser.runtime.sendMessage({type: "toggleEnabled"}).then(res => {
        updateText(res.response);
    });
}
const sitesListContainer = document.getElementById("sitesListContainer");
export function saveSettings() {
    const children = sitesListContainer.children;
    let newBlockedSites = [];
    for (const child of children) {
        if (child.firstElementChild.value != "") {
            newBlockedSites.push(child.firstElementChild.value);
        }
    }
    browser.storage.local.set({blockedSites_V1: newBlockedSites});
    browser.runtime.sendMessage({type: "updatedBlocklist"});
}
export async function loadSettings() {
    let storage = await browser.storage.local.get("blockedSites_V1");
    sitesListContainer.innerHTML = "";
    for (const site of storage.blockedSites_V1) {
        addSiteItem(site);
    }
    
    addSiteItem();
}
export function addSiteItem(domain) {
    let siteDiv = document.createElement("div");
    siteDiv.className = "siteContainer";
    sitesListContainer.appendChild(siteDiv);
    let siteInput = document.createElement("input");
    siteInput.className = "siteInput";
    siteInput.type = "text";
    if (domain) {
        siteInput.value = domain;
    }
    siteDiv.appendChild(siteInput);
    let sitebutton = document.createElement("button");
    sitebutton.classList.add("siteXButton", "ndButton", "red");
    sitebutton.id = "siteXButton";
    sitebutton.innerText = "X";
    siteDiv.appendChild(sitebutton);
}
export function updateText(enabled) {
    let statusText = document.getElementById("statusText");
    let toggleButton = document.getElementById("toggleButton");
    if (enabled) {
        statusText.innerText = "Enabled";
        statusText.className = "StatusEnabled";
        toggleButton.innerText = "Disable";
    } else {
        statusText.innerText = "Disabled";
        statusText.className = "StatusDisabled";
        toggleButton.innerText = "Enable";
    }
}