import {updateText} from "./Actions.js";
import "./InputHandler.js";
browser.runtime.sendMessage({type: "isEnabled"}).then(res => {
    updateText(res.response);
});
console.log(chrome.runtime.lastError);
setTimeout(() => {
    browser.runtime.sendMessage({type: "isEnabled"}).then(res => {
        updateText(res.response);
    });
    console.log("watied a second");
}, 1000);