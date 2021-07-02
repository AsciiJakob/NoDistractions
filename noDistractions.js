//////////////////////////////////////////////////////////////////////
//////////////This script runs on every new tab you open//////////////
//////////////////////////////////////////////////////////////////////

checkIfBlocked();

async function checkIfBlocked() {
    let isBlockedURL = browser.runtime.sendMessage({type: "isSiteBlocked", url: location.hostname});
    isBlockedURL.then((res) => {
        if (res.response) {
            blockPage();
        }
    })
}

function blockPage() {
    document.body.removeAttribute("style");
    document.querySelector('html').innerHTML = `
    <style>h1, p {text-align:center;}</style>
    <h1>This page was blocked by No Distractions.</h1>
    <p>You can configure which websites to block in the settings.</p>
    `;
    document.title = "Blocked";
}