
# NoDistractions
<p align="center">
  <img width="128" height="128" alt="NoDistractions logo" src="https://github.com/AsciiJakob/NoDistractions/blob/master/src/static/assets/icon-medium.png?raw=true">
</p>
NoDistraction is a website-blocker designed to be simple and easy to use.<br>
<b>Use if:</b> You just want a simple extension to block distracting websites when enabled, an extension that has an intuitive and convienent UI.<br>
<b>Don't use if:</b> You require the extension to be toggled during specific times of day, or you just generally prefer more advanced and powerful features with the trade-off of simplicity.


## Features:
  * Sites are easy to add and just two simple mouse clicks are required to start adding sites, you don't have to navigate through confusing menus.
  * The ability to temporarily visit a website (for just a minute or two) is available. It's possible to toggle this feature off in the settings, for those with bad impulse control.
  * Blocking can very quickly be toggled on or off through a popup. A keybinding is also available (CTRL+ALT+D).
  * Advanced site patterns are available for users with more specific needs (see the help section of the popup).
  * The extension is open-source, meaning that i am not afraid of hiding the code behind the extension and i allow users to contribute to it if they want to implement a feature.
## Screenshot
<p align="center">
  <img alt="Screenshot showing the UI" src="https://i.imgur.com/NSa5kGG.png">
</p>

# Contributing
It's designed to be very simple, while staying powerful, so keep that in mind if you are considering contributing.
If your contribution is very minor, feel free to create a pull request directly. Otherwise, please create an issue first, otherwise you might work in vain in case I don't think the feature fits the scope of the project.
Try to stick to the code-style that the rest of the code is using as well.
# Installation
[Download from the Mozilla Firefox add-on store](https://addons.mozilla.org/en-US/firefox/addon/nodistractions-website-blocker/)
# Running and building
Install the dependencies with `npm install`
## For debugging
`npm run debug` will open a firefox instantance with the extension loaded and the `about:debugging` page open (for viewing the background page).
## For building
`npm run build:firefox` will build a zip file in a folder called `web-ext-artifacts`, which you can temporary load the addon with from `about:debugging`.
