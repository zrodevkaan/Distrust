import { webFrame, contextBridge, ipcRenderer } from "electron/renderer";
import { readFileSync } from "fs";
import { join } from "path";
import {MOD_NAME} from '../../consts';

const ogPreload = process.env.DISCORD_PRELOADER;
if (ogPreload) require(ogPreload);

void webFrame.executeJavaScript(readFileSync(join(__dirname, `renderer.min.js`), { encoding: "utf8" }) + `\n//# sourceURL=distrust://webpack/renderer.js`);
// contextBridge.exposeInMainWorld("fs", fs);

function readFile(path: any) {
    return ipcRenderer.invoke('read-file', path);
}

function writeFile(path: any, data: any) {
    return ipcRenderer.invoke('write-file', path, data);
}

contextBridge.exposeInMainWorld("DistrustNative", {
    ipcRenderer: { readFile, writeFile }
});