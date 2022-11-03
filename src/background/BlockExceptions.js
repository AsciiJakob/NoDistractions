import { enabled } from "./Background.js";
import BlockHandler from "./BlockHandler.js";
import Utilities from "./Utilities.js";
class Exception {
	constructor(tabId, allowedLength) {
		this.deathDate = Date.now()+allowedLength;
		this.tabId = tabId;
		this.allowedLength = allowedLength;
	}
}
let exceptions = [];
export default {
	createException(tabId, allowedLength) {
		const excep = new Exception(tabId, allowedLength);
		exceptions.push(excep);
		Utilities.createNotification("visit-anyways-reminder", "You will be allowed to visit blocked sites on this tab for "+allowedLength/60000+" minutes");

		if (excep.allowedLength > 60000) {
			setTimeout(() => {
				if (!enabled) return removeException(excep);
				// should also check if tab still exists here
				Utilities.createNotification("visit-anyways-reminder", "You have less than one minute remaining on this tab before you get locked out again.");
				setTimeout(() => {
					this.onExceptionEnd(excep);
				}, 60000);
			}, excep.allowedLength-60000);
		} else {
			setTimeout(() => {
				this.onExceptionEnd(excep);
			}, excep.allowedLength);
		}
	},
	onExceptionEnd(excep) {
		browser.tabs.get(excep.tabId).then(tab => {
			BlockHandler.testAgainstBlocklist(tab.url).then(isMatch => {
				if (isMatch) {
					const blockedPageUrl = browser.runtime.getURL(`/blocked/blocked.html?url=${tab.url}`);
					browser.tabs.update(excep.tabId, {url: blockedPageUrl });
				}
				this.removeException(excep);
			});
		});
	},
	removeException(item) {
		const itemIndex = exceptions.indexOf(item);
		if (itemIndex != -1) { // -1 is returned when an item is not present in an array
			exceptions.splice(itemIndex, 1);
		}
	},
	getExceptions() {
		return exceptions;
	}
};