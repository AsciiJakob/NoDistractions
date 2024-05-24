import settingsUtilities from "../shared/SettingsUtilities.js";
const {defaultSettings, getActiveSettings, checkMissingSettings} = settingsUtilities;

loadSettings().then(updateDisabledStates);

// document.getElementById("settingsContainer").addEventListener("click", mouseEvent => saveSetting(mouseEvent.target));
document.getElementById("settingsContainer").addEventListener("change", mouseEvent => saveSetting(mouseEvent.target));
document.querySelector("#resetSettings").addEventListener("click", resetSettings);
document.querySelector("#downloadBlocklist").addEventListener("click", downloadBlocklist);
document.querySelector("#importClipboardButton").addEventListener("click", importFromClipboard);
document.querySelector("#selectAll").addEventListener("click", selectAll);
document.getElementById("showVisitAnyways").addEventListener("click", updateDisabledStates);
document.getElementById("NDVersion").innerText = browser.runtime.getManifest().version;


async function loadSettings() {
	await checkMissingSettings(await getActiveSettings());
	const activeSettings = await getActiveSettings();
	for (const settingElement of document.querySelectorAll(".setting")) {
		if (settingElement.type == "checkbox") {
			settingElement.checked = activeSettings[settingElement.id];
		} else if (settingElement.type == "number") {
			settingElement.value = activeSettings[settingElement.id];
		}
	}
}

async function saveSetting(element) {
	if (element.className == "setting") {
		let newValue;
		if (element.type == "checkbox") {
			newValue = element.checked;
		}  else if (element.type == "number") {
			if (element.value < 1) element.value = 1; // disallow negative numbers and zero 
			newValue = element.value;
		}
		
		let activeSettings = await getActiveSettings();
		const isSettingChanged = activeSettings[element.id] != newValue;
		const newSettings = activeSettings;
		newSettings[element.id] = newValue;

		if (isSettingChanged) {
			showSavedMessage();
			return browser.storage.local.set({settings: newSettings});
		}
	}
}

let textTimer;
function showSavedMessage() {
	if (textTimer) clearTimeout(textTimer); // discard last timeout if one was already in progress to avoid a messy animation
	const settingsSavedText = document.getElementById("settingsSavedText");
	settingsSavedText.style.display = "inline-block";
	textTimer = setTimeout(() => {
		settingsSavedText.style.display = "none";
	}, 1000);
}

async function resetSettings() {
	for (const settingID in defaultSettings) {
		let settingElement = document.getElementById(settingID);
		if (settingElement.type == "checkbox") {
			settingElement.checked = defaultSettings[settingID];
		}
		else if (settingElement.type == "number") {
			settingElement.value = defaultSettings[settingID];
		}
		await saveSetting(settingElement);
	}

	updateDisabledStates();
}

async function downloadBlocklist() {
	const storage = await browser.storage.local.get("blockedSites_V1");
	let downloadElement = document.createElement("a");
	downloadElement.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(storage.blockedSites_V1)));
	downloadElement.setAttribute("download", "ND-SiteBlocklist.txt");
  
	downloadElement.style.display = "none";
	document.body.appendChild(downloadElement);
  
	downloadElement.click();
  
	document.body.removeChild(downloadElement);
}

loadCopyTextarea();
async function loadCopyTextarea() {
	const storage = await browser.storage.local.get("blockedSites_V1");
	const copyTextarea = document.querySelector("#exportClipboard");
	copyTextarea.value = JSON.stringify(storage.blockedSites_V1);
}

async function selectAll() {
	document.querySelector("#exportClipboard").select();
}

function importFromClipboard() {
	const input = document.querySelector("#importClipboard").value;
	if (!input) {
		return displayImportAlert("Please input an array of sites.");
	}
	let newBlockedSites;
	try {
		newBlockedSites = JSON.parse(input);
	} catch {
		return displayImportAlert("Parsing input failed. Please input an array of sites.");
	}
	if (!Array.isArray(newBlockedSites)) {
		return displayImportAlert("Incorrect type of data.");
	}


	browser.storage.local.set({blockedSites_V1: newBlockedSites});
	browser.runtime.sendMessage({type: "updatedBlocklist"});
	displayImportAlert("Imported list.", true);
	loadCopyTextarea();
}

function displayImportAlert(text, success) {
	const alertText = document.querySelector("#importAlertText");
	alertText.style.display = "block";
	if (success) {
		alertText.className = "success";
		alertText.innerText = text;
	} else {		
		alertText.className = "error";
		alertText.innerText = text+"\nCorrect usage: \n[\"example.org\", \"testsite.com\"]";
	}
}
function updateDisabledStates() {
	document.getElementById("visitAnywaysLength").disabled = !document.getElementById("showVisitAnyways").checked;
}