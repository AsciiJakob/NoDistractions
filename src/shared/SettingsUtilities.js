const defaultSettings = {
    enableOnStartup: false,
    showDisableButton: true,
    showVisitAnyways: true,
    visitAnywaysLength: 3
};
export default {
    async getActiveSettings() {
        return (await browser.storage.local.get("settings")).settings;
    },
    async checkMissingSettings(settings) {
        for (const settingKey in defaultSettings) {
            if (settings[settingKey] == undefined || settings[settingKey] == null) {
                console.warn("the setting", settingKey, "was unset");
                settings[settingKey] = defaultSettings[settingKey];
            }
        }
        browser.storage.local.set({settings: settings});
        return settings;
    },
    defaultSettings
};
