import BlockExceptions from "/background/BlockExceptions.js";
import { enabled } from "/background/Background.js";
export default {
	async updatedBlocklist() {
		Background.updateRequestListener();
		return {};
	},
    async isEnabled() {
		return {response: enabled.status};
	},
    async toggleEnabled() {
      enabled.setStatus(!enabled.status);
      return {response: enabled.status};
    },
	async setStatus(request) {
      enabled.setStatus(request.enabled);
      return {response: enabled};
	},
	async addBlockingException(request) {
		BlockExceptions.createException(request.data.tabId, request.data.allowedLength);
		return {};
	}
};