import BlockExceptions from "./BlockExceptions.js";
import {enabled} from "./Background.js";
import { patternToRegex, patternValidationRegex } from "webext-patterns";

function toPattern(url) {
	if (url.startsWith("!")) {
		url = url.split("!");
		return url[url.length-1]; // get everything after the last excalamation mark.
	}
	return "*://"+url+"/*";
}

export default {
	handleSite(details) {
		if (!enabled.status) return;
		for (const exception of BlockExceptions.getExceptions()) {
			if (details.tabId == exception.tabId) {
				return;
			}
		}
		return {
			redirectUrl: browser.runtime.getURL(`/blocked/Blocked.html?url=${details.url}`)
		};
	},
	async getBlocklistURLPatterns() {
		let loadedBlocklist = await browser.storage.local.get("blockedSites_V1");
		let URLPatterns = [];
		if (Object.keys(loadedBlocklist) == 0) {
			console.error("Failed to load the blocklist.");
			// this seems to happen sometimes when accessing storage happens immediately after launch 
			await (new Promise(resolve => {
				setTimeout(async () => {
					loadedBlocklist = await browser.storage.local.get("blockedSites_V1");
					if (Object.keys(loadedBlocklist) == 0) {
						console.error("2nd attempt failed.");
					} else {
						console.log("2nd attempt succeeded");
					}
					resolve();
				}, 500);
			}));
		} 
		for (const siteDomain of loadedBlocklist.blockedSites_V1) {
			URLPatterns.push(toPattern(siteDomain));
			if (!siteDomain.startsWith("*.") && !siteDomain.startsWith("www.") && !siteDomain.startsWith("!")) { // this is done for user friendliness sakes. I hope it's something sensical to do and doesn't cause any issues.
				console.log("registering a www block for "+siteDomain);
				URLPatterns.push(toPattern("www."+siteDomain));
			}
		}
		return URLPatterns;
	},

	async updateRequestListener() {
		await browser.webRequest.onBeforeRequest.removeListener(this.handleSite);
		return browser.webRequest.onBeforeRequest.addListener(this.handleSite, {urls: await this.getBlocklistURLPatterns(), types: ["main_frame", "sub_frame"]}, ["blocking"]); // TODO: web_manifest type is not available on chrome, but is on firefox
	},
	async testAgainstBlocklist(url) { // In some cases we have to test against the blacklist instead of firefox doing it
		const regexExpression = patternToRegex(...await this.getBlocklistURLPatterns());
		console.log(regexExpression);
		return regexExpression.test(url);
	},
	async validateDomainSyntax(domain) { // unused
		console.log("validated:", toPattern(domain));
		return patternValidationRegex.test(toPattern(domain));
	}
};