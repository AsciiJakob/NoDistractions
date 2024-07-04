import {updateText} from "./Actions.js";
import "./InputHandler.js";
browser.runtime.sendMessage({type: "isEnabled"}).then(res => {
    updateText(res.response);
});
