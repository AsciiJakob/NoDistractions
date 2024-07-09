
# NoDistractions
<p align="center">
  <img width="128" height="128" alt="NoDistractions logo" src="https://github.com/AsciiJakob/NoDistractions/blob/master/src/static/assets/icon-medium.png?raw=true">
</p>
Simple, bloat-free website blocker with a focus on intuitiveness. Basic functionality shouldn't be hidden and configuring shouldn't be rocket science.<br><br>
<b>Use if:</b> You just want a simple add-on to block distracting websites when enabled, an extension that has an intuitive and straightforward UI.<br>
<b>Don't use if:</b> You require very specific features such as blocking only being active at specific times of day. The add-on being active is merely meant to serve as a reminder that you have chosen to be productive.


## Features:
  * Sites are easy to add and doing so requires just two simple mouse clicks, you don't have to navigate through confusing menus.
  * Blocking can easily be toggled on or off through a popup. A keybinding is also available (CTRL+ALT+D).
  * The ability to temporarily visit a website (for just a minute or two) is available. It's possible to toggle this feature off in the settings, for those with bad impulse control.
  * Being simple doesn't equate to not being powerful; advanced site patterns (using URL Match patterns) are available for users with more specific needs (see the help section of the popup).
  * The extension is open-source, meaning that I am not afraid of hiding the code behind the extension and I allow users to contribute to it if they want to implement a feature.
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
