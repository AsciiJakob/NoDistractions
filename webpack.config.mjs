import WebExtPlugin from "web-ext-plugin";
import CopyPlugin from "copy-webpack-plugin";
import LicenseCheckerWebpackPlugin from"license-checker-webpack-plugin";
import { readFile } from "fs/promises";

import path from "path";
import { Transform } from "stream";
const __dirname = path.resolve();

let pckgJson;
readFile("./package.json").then(data => {
  pckgJson = JSON.parse(data);
});

const config = {
  entry: {
    "background/Background": "/src/background/Background.js",
    "settings/Settings": "/src/settings/Settings.js",
    "popup/Popup": "/src/popup/Popup.js",
    "blocked/Blocked": "/src/blocked/Blocked.js"
  },
  devtool: "source-map",
  output: {
    path: __dirname+"/dist",
    filename: "[name].js"
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/static", to: "static" }, // files starting with "." will be ignored as per the default options.
        {
          from: "src/manifest.json",
          to: "manifest.json",
          transform(content, absoluteFrom) {
            content = JSON.parse(content);
            content.version = pckgJson.version;
            content.description = pckgJson.description;
            return JSON.stringify(content, null, 2);
          }, 
        },
        { from: "src/popup/Popup.html", to: "popup/Popup.html" },
        { from: "src/popup/Popup.css", to: "popup/Popup.css" },
        { from: "src/blocked/Blocked.html", to: "blocked/Blocked.html"},
        { from: "src/blocked/Blocked.css", to: "blocked/Blocked.css"},
        { from: "src/background/Background.html", to: "background/Background.html" },
        { from: "src/settings/Settings.html", to: "settings/Settings.html" }, 
        { from: "node_modules/webextension-polyfill/dist/browser-polyfill.js" }
      ],
    }),
    new WebExtPlugin({
      sourceDir: __dirname+"/dist",
      overwriteDest: true,
      startUrl: "about:debugging",
      browserConsole: true,
    }),
    new LicenseCheckerWebpackPlugin({
      outputFilename: "/license-acknowledgements.txt"
    })
  ],
};

export default config;