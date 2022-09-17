import WebExtPlugin from "web-ext-plugin";
import CopyPlugin from "copy-webpack-plugin";
import path from "path";
const __dirname = path.resolve();

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
        { from: "src/static", to: "static" },
        { from: "src/manifest.json", to: "manifest.json" },
        { from: "src/popup/popup.html", to: "popup/popup.html" },
        { from: "src/blocked/blocked.html", to: "blocked/blocked.html"},
        { from: "src/blocked/blocked.css", to: "blocked/blocked.css"},
        { from: "src/background/background.html", to: "background/background.html" },
        { from: "src/settings/settings.html", to: "settings/settings.html" },
        { from: "node_modules/webextension-polyfill/dist/browser-polyfill.js" }
      ],
    }),
    new WebExtPlugin({
      sourceDir: __dirname+"/dist"
    })
  ],
};

export default config;