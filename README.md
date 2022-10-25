# NoDistractions
NoDistraction is a website-blocker designed to be simple and easy to use.
Use if: You just want a simple extension to block distracting websites when enabled, an extension that has an intuitive and convienent UI.
Don't use if: You require the extension to be toggled during specific times of day, you or you just generally prefer more advanced and powerful features with the trade-off of simplicity.

Features:
  * Sites are easy to add and just two simple mouse clicks are required to start adding sites, you don't have to navgiate through confusing menus.
  * Blocking can very quickly be toggled on or off through a popup, a keybinding is also available (CTRL+ALT+D).
  * Advanced site patterns are available for users with more specific needs (See the help section of the popup).
  * The extension is open-source, meaning that i am not afraid of hiding the code being the extension and i allow users to contribute to it if they want to implement a feature.
# Contributing
It's designed to be very simple, while staying powerful, so keep that in mind if you are considering contributing.
If your contribution is very minor, feel free to create a pull request directly. Otherwise, please create an issue first, otherwise you might work in vain in case I don't think the feature fits the scope of the project.
Try to stick to the code-style that the rest of the code is using as well.
# Installation
not yet submitted to mozilla firefox webstore
# Running and building
Install the dependencies with `npm install`
## For debugging
`npm run debug` will open a firefox instantance with the extension loaded and the `about:debugging` page open (for viewing the background page).
## For building
`npm run build:firefox` will build a zip file in a folder called `web-ext-artifacts`, which you can temporary load the addon with from `about:debugging`.