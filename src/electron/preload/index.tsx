import {contextBridge, ipcRenderer, webFrame} from "electron/renderer";
import {readFileSync} from "fs";
import {join} from "path";
import path from "node:path";
import os from "os";
import {MOD_NAME} from "../../consts";

const ogPreload = process.env.DISCORD_PRELOADER;
if (ogPreload) require(ogPreload);

const pluginLocation = path.join(os.homedir(), 'AppData', 'Roaming',`${MOD_NAME}`,'plugins');
const themeLocation = path.join(os.homedir(), 'AppData', 'Roaming',`${MOD_NAME}`,'themes');
const settingsLocation = path.join(os.homedir(), 'AppData', 'Roaming',`${MOD_NAME}`,'settings');
const reactLocation = path.join(os.homedir(), 'AppData', 'Roaming',`${MOD_NAME}`,'fmkadmapgofadopljbjfkapdkoienihi');

void webFrame.executeJavaScript(readFileSync(join(__dirname, `renderer.min.js`), { encoding: "utf8" }) + `\n//# sourceURL=distrust://webpack/renderer.js`);

contextBridge.exposeInMainWorld("DistrustNative", 
{
    ipcRenderer: { get, set, loadPlugins, loadThemes },
    locations: 
    {
        plugins: pluginLocation,
        themes: themeLocation,
        settings: settingsLocation,
        react: reactLocation,
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

async function loadPlugins() {
    try {
        const result = await ipcRenderer.invoke('loadPlugins', { path: pluginLocation });
        if (result.status === 'success') {
            return result.plugins.map(plugin => {
                const module: any = {};
                const code = `(function(exports, require, module, __filename, __dirname) { ${plugin.fileContent} })(module.exports, require, module, __filename, __dirname);`;
                eval(code);

                if (module.exports && module.exports.start) {
                    return {
                        exports: module.exports,
                        manifest: plugin.manifest
                    };
                }
            }).filter((plugin: any) => plugin);
        } else {
            console.error('Failed to load plugins:', result.message);
            return [];
        }
    } catch (error) {
        console.error('Error loading plugins:', error);
        return [];
    }
}

async function loadThemes() {
    try {
        const result = await ipcRenderer.invoke('loadThemes', { path: themeLocation });
        if (result.status === 'success') {
            return result.themes.map((theme: any) => {
                return theme;
            }).filter((theme: any) => theme);
        } else {
            console.error('Failed to load themes:', result.message);
            return [];
        }
    } catch (error) {
        console.error('Error loading themes:', error);
        return [];
    }
}