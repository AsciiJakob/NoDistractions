export default {
	createNotification(name, alertmessage) {
		browser.notifications.create(name, {
			type: "basic",
			iconUrl: "/assets/icon.png",
			title: "NoDistractions",
			message: alertmessage
		});
	}
};