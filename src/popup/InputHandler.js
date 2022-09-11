import {toggle, saveSettings, loadSettings, addsiteitem} from "./Actions.js";
addListeners();
function onClick(elementId, callback) {
    console.log("adding event to", elementId);
    document.getElementById(elementId).addEventListener("click", callback);
}
export function addListeners() {
    let sitesListContainer = document.getElementById("sitesListContainer");

    onClick("toggleButton", () => {
        toggle();
    });
    onClick("settingsButton", () => {
        const settings = document.querySelector(".settingsContainer");
        if (settings.style.display == "none") {
            settings.style.display = "block";
            loadSettings();
        } else {
            settings.style.display = "none";
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
    sitesListContainer.addEventListener("input", (mouseEvent) => {
        let target = mouseEvent.target;
        const children = sitesListContainer.children;
        if (target.value != "") {
            if (children[children.length-1] == target.parentElement) {
                addSiteItem();
            }
        }
    });

}