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

function tabHasException(tabId, exceptions) {
    for (const exception of exceptions) {
        if (tabId == exception.tabId) {
            return true;
        }
    }
    return false;
} 

// todo: message in the help box. fix copy and paste. Button for seeing changelog
export default {
    handleSite(details) {
        if (!enabled.status) return;
        if (tabHasException(details.tabId, BlockExceptions.getExceptions())) return;
        return {
            redirectUrl: browser.runtime.getURL(`/blocked/Blocked.html?url=${details.url}`)
        };
    },
    handleHistoryStateUpdate(details) {
        if (!enabled.status || details.transitionType == "form_submit" || details.frameId != 0) return;
        if (tabHasException(details.tabId, BlockExceptions.getExceptions())) return;
        
        const blockedPageUrl = browser.runtime.getURL(`/blocked/Blocked.html?url=${details.url}`);
        browser.tabs.update(details.tabId, {url: blockedPageUrl });
    },
    async getBlocklistParsed(asRegex) {
        let loadedBlocklist = await browser.storage.local.get("blockedSites_V1");
        let URLArr = [];
        if (Object.keys(loadedBlocklist) == 0) {
            console.error("Failed to load the blocklist:", loadedBlocklist);
        } 
        for (const siteDomain of loadedBlocklist.blockedSites_V1) {
            if (asRegex) {
                URLArr.push({urlMatches: patternToRegex(toPattern(siteDomain)).source});
                if (!siteDomain.startsWith("*.") && !siteDomain.startsWith("www.") && !siteDomain.startsWith("!"))  // this is done for user friendliness sakes. I hope it's something sensical to do and doesn't cause any issues.
                    URLArr.push({urlMatches: patternToRegex(toPattern("www."+siteDomain)).source});
            } else {
                URLArr.push(toPattern(siteDomain));
                if (!siteDomain.startsWith("*.") && !siteDomain.startsWith("www.") && !siteDomain.startsWith("!"))  // this is done for user friendliness sakes. I hope it's something sensical to do and doesn't cause any issues.
                    URLArr.push(toPattern("www."+siteDomain));
            }
        }
        return URLArr;
    },
    // async getBlocklistURLPatterns() { // return blocklist in URL match patterns format, used by onBeforeRequest
    //     let loadedBlocklist = await browser.storage.local.get("blockedSites_V1");
    //     let URLPatterns = [];
    //     if (Object.keys(loadedBlocklist) == 0) {
    //         console.error("Failed to load the blocklist:", loadedBlocklist);
    //     } 
    //     for (const siteDomain of loadedBlocklist.blockedSites_V1) {
    //         URLPatterns.push(toPattern(siteDomain));
    //         if (!siteDomain.startsWith("*.") && !siteDomain.startsWith("www.") && !siteDomain.startsWith("!")) { // this is done for user friendliness sakes. I hope it's something sensical to do and doesn't cause any issues.
    //             URLPatterns.push(toPattern("www."+siteDomain));
    //         }
    //     }
    //     return URLPatterns;
    // },
    // async getBlocklistURLFilterArray() { // UrlFilter format, used by onHistoryStateUpdated
    //     let loadedBlocklist = await browser.storage.local.get("blockedSites_V1");
    //     let URLFilter = [];
    //     if (Object.keys(loadedBlocklist) == 0) {
    //         console.error("Failed to load the blocklist:", loadedBlocklist);
    //     } 
    //     for (const siteDomain of loadedBlocklist.blockedSites_V1) {
    //         console.log("running patternToRegex on: ", toPattern(siteDomain));
    //         URLFilter.push({urlMatches: patternToRegex(toPattern(siteDomain)).source});
    //         if (!siteDomain.startsWith("*.") && !siteDomain.startsWith("www.") && !siteDomain.startsWith("!")) { // this is done for user friendliness sakes. I hope it's something sensical to do and doesn't cause any issues.
    //             URLFilter.push({urlMatches: patternToRegex(toPattern("www."+siteDomain)).source});
    //         }
    //     }
    //     console.log("using filter:", URLFilter);
    //     return URLFilter;
    // },
    async updateRequestListener() {
        await browser.webRequest.onBeforeRequest.removeListener(this.handleSite);
        await browser.webRequest.onBeforeRequest.addListener(this.handleSite, {urls: await this.getBlocklistParsed(), types: ["main_frame", "sub_frame"]}, ["blocking"]); // TODO: web_manifest type is not available on chrome, but is on firefox
        await browser.webNavigation.onHistoryStateUpdated.removeListener(this.handleHistoryStateUpdate);
        await browser.webNavigation.onHistoryStateUpdated.addListener(this.handleHistoryStateUpdate, {url: await this.getBlocklistParsed(true)});
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
