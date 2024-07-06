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

async function retryRetrieval(attemptNumber, wait) {
    return (new Promise(resolve => {
        setTimeout(async () => {
            const loadedBlocklist = await browser.storage.local.get("blockedSites_V1");
            if (Object.keys(loadedBlocklist) == 0) {
                console.error("attempt %d failed.", attemptNumber);
            } else {
                console.log("attempt %d succeeded.", attemptNumber);
            }
            resolve(loadedBlocklist);
        }, wait);
    }));
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
            console.error("Failed to load the blocklist:", loadedBlocklist);
            // this seems to happen sometimes when accessing storage happens immediately after launch. I really hate this and I haven't found a fix. Like, even just waiting one millisecond often does the trick??
            loadedBlocklist = await retryRetrieval(2, 1);
             if ( Object.keys(loadedBlocklist) == 0) {
                loadedBlocklist = await retryRetrieval(3, 50);
                if ( Object.keys(loadedBlocklist) == 0) {
                    loadedBlocklist = await retryRetrieval(4, 500);
                }
             }
        } 
        for (const siteDomain of loadedBlocklist.blockedSites_V1) {
            URLPatterns.push(toPattern(siteDomain));
            if (!siteDomain.startsWith("*.") && !siteDomain.startsWith("www.") && !siteDomain.startsWith("!")) { // this is done for user friendliness sakes. I hope it's something sensical to do and doesn't cause any issues.
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
