import {toggle, saveSettings, loadSettings, addSiteItem, isDomainInvalid, bottomField} from "./Actions.js";
addListeners();
loadSettings();
function onClick(elementId, callback) {
    document.getElementById(elementId).addEventListener("click", callback);
}
export function addListeners() {
    let sitesListContainer = document.getElementById("sitesListContainer");

    onClick("toggleButton", () => {
        toggle();
    });
    onClick("addCurrentButton", () => {
        browser.tabs.query({currentWindow: true, active: true}).then(tab => {
            tab = tab[0];
            let siteField;
            if (tab.url.startsWith("http")) {
                const grabUrl = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/img; // regex magic stolen from https://stackoverflow.com/a/25703406
                siteField = addSiteItem(grabUrl.exec(tab.url)[1]);
                saveSettings();
            } else {
                siteField = addSiteItem("Failed adding current domain.");
                siteField.classList.add("invalidDomain");
            }
        });
    });
    onClick("moreButton", () => {
        browser.runtime.openOptionsPage();
    });
    document.body.addEventListener("click", event => { // this is needed since siteXButton is a class on elements that get instantiated.
        const target = event.target;
        if (target.classList[0] == "siteXButton") {
            if (target.parentElement.children[0] === bottomField) {
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
        if (!target.value.startsWith("!")) target.value = cleanDomain(target.value);
        if (target === bottomField) {
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
