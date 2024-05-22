import * as electron from "electron";
import {BrowserWindow} from "electron";
import {join} from "path";
import {readFileSync, writeFileSync} from "fs";
import {constants} from "node:fs";

const { env } = process;

export default class PatchedBrowserWindow extends BrowserWindow {
    constructor(opts: Electron.BrowserWindowConstructorOptions) {
        env.DISCORD_PRELOADER = opts.webPreferences!.preload;

        opts.webPreferences!.preload = join(__dirname, "preload.min.js");

        return new BrowserWindow(opts);

        super();
    }
}

// i no no tink dis works
/*Object.defineProperty(global, "appSettings", {
    set: (v) => {
        v.set("DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING", true);
        delete global.appSettings;
        global.appSettings = v;
    },
    get: () => global.appSettings,
    configurable: true,
});*/

electron.ipcMain.handle('read-file', (event, filePath) => {
    try {
        return readFileSync(filePath, { encoding: 'utf8' });
    } catch (error) {
        return { error: error.message };
    }
});

electron.ipcMain.handle('write-file', (event, { filePath, data }) => {
    try {
        const parsedData = JSON.stringify(data);
        writeFileSync(filePath, parsedData);
        return { success: true };
    } catch (error) {
        return { error: error.message };
    }
});

const electronModule = require.resolve("electron");
delete require.cache[electronModule]!.exports;

const electronMod: typeof Electron.CrossProcessExports = {
    ...electron,
    BrowserWindow: PatchedBrowserWindow
};

require.cache[electronModule]!.exports = electronMod;