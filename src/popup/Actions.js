export var bottomField; // we are always supposed to have one empty field at the end for easy of use

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
        let domain = child.firstElementChild.value;
        if (domain != "") {
            newBlockedSites.push(domain);
        }
    }
    browser.storage.local.set({blockedSites_V1: newBlockedSites});
    browser.runtime.sendMessage({type: "updatedBlocklist"});
}
export async function loadSettings() {
    let storage = await browser.storage.local.get("blockedSites_V1");
    sitesListContainer.innerHTML = "";
    for (const site of storage.blockedSites_V1) {
        addSiteItem(site, true);
    }

    bottomField = addSiteItem();
}
export function addSiteItem(domain, initialLoad) {
    let siteDiv = document.createElement("div");
    siteDiv.className = "siteContainer";
    sitesListContainer.appendChild(siteDiv);
    let siteInput = document.createElement("input");
    siteInput.className = "siteInput";
    siteInput.type = "text";
    siteInput.placeholder = "Add a site here...";
    if (domain) {
        siteInput.value = domain;

        if (isDomainInvalid(domain)) {
            siteInput.classList.add("invalidDomain");
        }
    }
    siteDiv.appendChild(siteInput);
    let sitebutton = document.createElement("button");
    sitebutton.classList.add("siteXButton", "ndButton", "red");
    sitebutton.innerText = "X";
    siteDiv.appendChild(sitebutton);

    if (!initialLoad) {
        if (bottomField && !bottomField.value) {
            console.log("removing element");
            bottomField.parentElement.remove();
        }
        if (domain) {
            addSiteItem(); // we always want to have one empty element at the bottom so it's easy to add a new site.
        } else {
            bottomField = siteInput;
        }
    }
    return siteInput;
}
export function isDomainInvalid(domain) {
    if (domain.startsWith("!")) return false; // domains beginning with ! are advanced domains and do not follow the peasant rules of normal domains.
    return domain.includes("/") || domain.split("*.").length > 2 || !domain.includes(".");
}
export function updateText(isEnabled) {
    let statusText = document.getElementById("statusText");
    let toggleButton = document.getElementById("toggleButton");
    if (isEnabled) {
        statusText.innerText = "Enabled";
        statusText.className = "StatusEnabled";
        toggleButton.innerText = "Disable";
    } else {
        statusText.innerText = "Disabled";
        statusText.className = "StatusDisabled";
        toggleButton.innerText = "Enable";
    }
}
