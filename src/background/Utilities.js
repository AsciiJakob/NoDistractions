export default {
    createNotification(name, alertmessage, iconStatusEnabled) {
        const icon = iconStatusEnabled ? "/static/assets/icon-enabled-low.png"
                                       : "/static/assets/icon-low.png";

        browser.notifications.create(name, {
            type: "basic",
            iconUrl: icon,
            title: "NoDistractions",
            message: alertmessage
        });
    }
};
