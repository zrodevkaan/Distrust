import { webFrame, contextBridge, ipcRenderer } from "electron/renderer";
import { readFileSync } from "fs";
import { join } from "path";
import path from "node:path";
import os from "os";
import {MOD_NAME} from "../../consts";

const ogPreload = process.env.DISCORD_PRELOADER;
if (ogPreload) require(ogPreload);

const pluginLocation = path.join(os.homedir(), 'AppData', 'Roaming',`${MOD_NAME}`,'plugins');
const themeLocation = path.join(os.homedir(), 'AppData', 'Roaming',`${MOD_NAME}`,'themes');
const settingsLocation = path.join(os.homedir(), 'AppData', 'Roaming',`${MOD_NAME}`,'settings');

void webFrame.executeJavaScript(readFileSync(join(__dirname, `renderer.min.js`), { encoding: "utf8" }) + `\n//# sourceURL=distrust://webpack/renderer.js`);

contextBridge.exposeInMainWorld("DistrustNative", 
{
    ipcRenderer: { get, set },
    locations: 
    {
        plugins: pluginLocation,
        themes: themeLocation,
        settings: settingsLocation
    }
});

function get(name: string) 
{
    return ipcRenderer.invoke('readSettings', { path: settingsLocation, name });
}

function set(name: any, data: any)
{
    return ipcRenderer.invoke('writeSettings', { path: settingsLocation, name, data });
}