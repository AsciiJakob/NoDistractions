browser.runtime.sendMessage({type: "isEnabled"}).then(res => {
    updateText(res.response);
});


function toggle() {
    browser.runtime.sendMessage({type: "toggleEnabled"}).then(res => {
        updateText(res.response);
        if (res.response == true) {
            checkAllTabs(res.response);
        }
    });
}

function saveSettings() {
    const children = document.querySelector(".sitesListContainer").children;
    let newBlockedSites = [];
    for (child of children) {
        if (child.firstElementChild.value != "") {
            newBlockedSites.push(child.firstElementChild.value);
        }
    }
    browser.storage.local.set({blockedSites_V1: newBlockedSites});
    browser.runtime.sendMessage({type: "updatedBlocklist"});
}

async function loadSettings() {
    let sitesListContainer = document.querySelector(".sitesListContainer");
    let storage = await browser.storage.local.get("blockedSites_V1");
    sitesListContainer.innerHTML = "";
    for (site of storage.blockedSites_V1) {
        addSiteItem(site);
    }
    
    addSiteItem();
}

function addSiteItem(domain) {
    let siteDiv = document.createElement("div");
    siteDiv.className = "siteContainer";
    document.querySelector(".sitesListContainer").appendChild(siteDiv);
    let siteInput = document.createElement("input");
    siteInput.className = "siteInput";
    siteInput.type = "text";
    if (domain) {
        siteInput.value = domain;
    }
    siteDiv.appendChild(siteInput);
    let sitebutton = document.createElement("button");
    sitebutton.classList.add("siteXButton", "ndButton", "red");
    sitebutton.innerText = "X";
    siteDiv.appendChild(sitebutton);
}

function updateText(enabled) {
    let StatusText = document.querySelector("#StatusText");
    let ToggleButton = document.querySelector(".ToggleButton");
    if (enabled) {
        StatusText.innerText = "Enabled";
        StatusText.className = "StatusEnabled";
        ToggleButton.innerText = "Disable";
    } else {
        StatusText.innerText = "Disabled";
        StatusText.className = "StatusDisabled";
        ToggleButton.innerText = "Enable";
    }
}

async function checkAllTabs(nowEnabled) {
    let tabs = await browser.tabs.query({});
    for (tab of tabs) {
        const isBlocked = await browser.runtime.sendMessage({type: "isSiteBlocked", url: tab.url});
        if (isBlocked.response == true) {
            if (nowEnabled) {
                browser.tabs.executeScript(tab.id, {
                    code: "blockPage();"
                });
            } else {
                //
            }
        }
    }
}