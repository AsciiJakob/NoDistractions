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