import BlockExceptions from ".//BlockExceptions.js";
import BlockHandler from "./BlockHandler.js";
import { enabled } from "./Background.js";
export default {
    async updatedBlocklist() {
        BlockHandler.updateRequestListener();
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
    },
    async validateDomainSyntax(request) {
        return BlockHandler.validateDomainSyntax(request.url);
    }
};
