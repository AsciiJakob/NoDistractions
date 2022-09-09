import createNotification from "/background/Utilities.js";
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

		if (excep.allowedLength > 60000) {
			setTimeout(() => {
				if (!enabled) return removeException(request.data);
				createNotification("visit-anyways-reminder", "You have less than one minute remaining before you get locked out again.");
				setTimeout(() => {
					// TODO: check if current tab is on a blocked site and if so, block it.
					browser.tabs.get(request.data.tabId).then(tab => {

					});
				}, 60000);
			}, excep.allowedLength-60000);
		}
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