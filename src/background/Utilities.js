export default {
    createNotification(name, alertmessage) {
        browser.notifications.create(name, {
            type: "basic",
            iconUrl: "/static/assets/icon-low.png",
            title: "NoDistractions",
            message: alertmessage
        });
    }
};
