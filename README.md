# NoDistractions
NoDistractions is a bloat-free website blocker with a focus on ease of use and simplicity.

It's designed to be very simple, while staying powerful, so keep that in mind if you are considering contributing.
# Installation
not yet submitted to mozilla firefox webstore
# Running and building
Install the dependencies with `npm install`
## For debugging
`npm run debug` will open a firefox instantance with the extension loaded and the `about:debugging` page open (for viewing the background page).
## for building
`npm run build:firefox` will build a zip file in a folder called `web-ext-artifacts`, which you can temporary load the addon with from `about:debugging`.