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
    background: "/src/background/Background.js",
    settings: "/src/settings/Settings.js",
    popup: "/src/popup/Popup.js",
    blocked: "/src/blocked/Blocked.js"
  },
  devtool: "source-map",
  output: {
    path: __dirname+"/dist",
    filename: "[name]/[name].js"
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
        { from: "src/popup/popup.html", to: "popup/popup.html" },
        { from: "src/popup/popup.css", to: "popup/popup.css" },
        { from: "src/blocked/blocked.html", to: "blocked/blocked.html"},
        { from: "src/blocked/blocked.css", to: "blocked/blocked.css"},
        { from: "src/background/background.html", to: "background/background.html" },
        { from: "src/settings/settings.html", to: "settings/settings.html" }, 
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