import {toggle, saveSettings, loadSettings, addSiteItem, isDomainInvalid} from "./Actions.js";
addListeners();
function onClick(elementId, callback) {
    document.getElementById(elementId).addEventListener("click", callback);
}
export function addListeners() {
    let sitesListContainer = document.getElementById("sitesListContainer");

    onClick("toggleButton", () => {
        toggle();
    });
    onClick("settingsButton", () => {
        const settings = document.querySelector(".settingsContainer");
        const settingsButton = document.getElementById("settingsButton");
        if (settings.style.display == "none") {
            settings.style.display = "block";
            settingsButton.innerText = settingsButton.innerText.replace("Show", "Hide");
            loadSettings();
        } else {
            settings.style.display = "none";
            settingsButton.innerText = settingsButton.innerText.replace("Hide", "Show");
        }
    });
    onClick("addButton", () => {
        addSiteItem();
    });
    onClick("moreButton", () => {
        browser.runtime.openOptionsPage();
    });
    document.body.addEventListener("click", event => { // this is needed since siteXButton is a class on elements that get instantiated.
        const target = event.target;
        if (target.classList[0] == "siteXButton") {
            const children = sitesListContainer.children;
            if (children[children.length-1] == target.parentElement && target.value == "") {
                return; // there is always an empty input field at the end to make it easy to add new sites, we don't want to remove that element.
            }
            target.parentElement.remove();
            saveSettings();
        }
    });

    // "change" is called once you exit out of an input field and "input" is called whenever the input field recieves any input
    sitesListContainer.addEventListener("change", () => {
        saveSettings();
    });
    sitesListContainer.addEventListener("input", (event) => {
        let target = event.target;
        const children = sitesListContainer.children;
        target.value = cleanDomain(target.value);
        if (children[children.length-1] == target.parentElement) { // if we're editing the last field (we are always supposed to have one empty at the end for easy of use)
            console.log("we are editing the last one!!!");
            addSiteItem();
        }

        if (isDomainInvalid(target.value)) {
            target.classList.add("invalidDomain");
        } else {
            target.classList.remove("invalidDomain");
        }
    });

}
function cleanDomain(domain) {
    const sScheme = domain.split("://");
    if (sScheme.length > 1) domain = sScheme[sScheme.length-1];

    return domain;
}