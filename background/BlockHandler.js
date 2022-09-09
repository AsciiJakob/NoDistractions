import BlockExceptions from "./BlockExceptions.js";
export default {
	handleSite(details) {
		console.log("hadnling a site, details: ", details);
		if (!enabled.status) return;
		for (const exception of BlockExceptions.getExceptions()) {
			if (details.tabId == exception.tabId) {
				if (Date.now() > details.deathDate) {
					console.log("deleting old");
					BlockExceptions.removeException(exception);
					break;
				}
				return;
			}
		}
		console.log("site was actually blocked.");
		// browser.tabs.update(details.tabId, {url: `/static/blocked/blocked.html?url=${details.url}`});
		console.log("trying to redirect to "+browser.runtime.getURL(`/static/blocked/blocked.html?url=${details.url}`));
		return {
			redirectUrl: browser.runtime.getURL(`/static/blocked/blocked.html?url=${details.url}`)
		};
	},
	async getBlocklistURLPatterns() {
		let loadedBlocklist = await browser.storage.local.get("blockedSites_V1");
		let URLPatterns = [];
		if (Object.keys(loadedBlocklist) == 0) {
			console.error("Failed to load the blocklist.");
		} 
		for (const siteDomain of loadedBlocklist.blockedSites_V1) {
			URLPatterns.push("*://"+siteDomain+"/*");
			if (!siteDomain.startsWith("*.") && !siteDomain.startsWith("www.")) { // this is done for user friendliness sakes. I hope it's something sensical to do and doesn't cause any issues.
				console.log("registering a www block for "+siteDomain);
				URLPatterns.push("*://www."+siteDomain+"/*");
			}
		}
		return URLPatterns;
	},

	async updateRequestListener() {
		await browser.webRequest.onBeforeRequest.removeListener(this.handleSite);
		return browser.webRequest.onBeforeRequest.addListener(this.handleSite, {urls: await this.getBlocklistURLPatterns(), types: ["main_frame", "sub_frame"]}, ["blocking"]); // TODO: web_manifest type is not available on chrome, but is on firefox
	}
};