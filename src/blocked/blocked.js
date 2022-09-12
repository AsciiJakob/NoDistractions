var urlParams = new URLSearchParams(window.location.search);
document.title = "Blocked | "+urlParams.get("url");

document.querySelector("#displayURL").innerText = urlParams.get("url");
document.querySelector("#displayURL").href = urlParams.get("url");
document.querySelector("#nevermind").addEventListener("click", () => {
	browser.tabs.getCurrent().then(tab => {
		console.log(tab);
		browser.tabs.remove(tab.id);
	});
});
document.querySelector("#disableND").addEventListener("click", () => {
	browser.runtime.sendMessage({type: "setStatus", enabled: false}).then(res => {
		browser.tabs.getCurrent().then(tab => {
			browser.tabs.update(tab.response, { url: urlParams.get("url")}); 
		});
	});
});
document.querySelector("#visitAnyways").addEventListener("click", async () => {
	const settings = (await browser.storage.local.get("settings")).settings;
	const allowedLength = settings.visitAnywaysLength*60000;
	browser.runtime.sendMessage({type: "addBlockingException", data: {tabId: (await browser.tabs.getCurrent()).id, allowedLength: allowedLength} }).then(res => {
		document.querySelector("#blockedText").innerText = "Redirecting...";
		window.location = urlParams.get("url");
	});
});