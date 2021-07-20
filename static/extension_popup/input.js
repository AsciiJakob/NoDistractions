let sitesListContainer = document.querySelector(".sitesListContainer");

document.querySelector("body").addEventListener("click", (mouseEvent) => {
    let target = mouseEvent.target;
    switch(target.classList[0]) {
        case "ToggleButton": {
            toggle();
            break;
        }
        case "SettingsButton": {
            var settings = document.querySelector(".settingsContainer");
            if (settings.style.display == "none") {
                settings.style.display = "block";
                loadSettings();
            } else {
                settings.style.display = "none";
            }
            break;
        }
        case "addButton": {
            addSiteItem();
            break;
        }
        case "siteXButton": {
            const children = sitesListContainer.children;
            if (children[children.length-1] == target.parentElement && target.value == "") {
                return;
            }
            target.parentElement.remove();
            saveSettings();
            break;
        }
        case "moreButton": {
            browser.runtime.openOptionsPage();
            break;
        }
    }
});


// "change" is called once you exit out of an input field and "input" is called whenever the input field recieves any input
sitesListContainer.addEventListener("change", (mouseEvent) => { 
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
