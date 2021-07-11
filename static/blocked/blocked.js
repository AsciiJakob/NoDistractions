var urlParams = new URLSearchParams(window.location.search);
document.title = "Blocked | "+urlParams.get("url");

document.querySelector("#displayURL").innerText = urlParams.get("url")
document.querySelector("#nevermind").addEventListener("click", () => {
	browser.tabs.getCurrent().then(tab => {
		console.log(tab)
		browser.tabs.remove(tab.id)
	})
})
document.querySelector("#disableND").addEventListener("click", () => {
    browser.runtime.sendMessage({type: "setEnabled", enabled: false}).then(res => {
		browser.tabs.getCurrent().then(tab => {
			browser.tabs.update(tab.response, { url: urlParams.get("url")}); 
		})
    })
})
document.querySelector("#visitAnyways").addEventListener("click", async () => {
	const settings = (await browser.storage.local.get("settings")).settings;
	console.log(settings)
    browser.notifications.create("visit-anyways", {
		type: "basic",
		iconUrl: "/assets/icon.png",
		title: "NoDistractions",
		message: "You will be allowed to visit blocked sites on this tab for "+settings.visitAnywaysLength+" minutes."
	});
	// maybe using browser.alarms.create() is better than settimeout

	setTimeout(() => {
		
	// }, settings.visitAnywaysLength*60000);
	}, settings.visitAnywaysLength);
})