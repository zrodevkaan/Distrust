import { contextBridge, ipcRenderer, webFrame } from "electron/renderer";
import { readFileSync } from "fs";
import path from "path";
import { MOD_NAME } from "../../consts";
import { BASE_DIR } from "../consts";

const ogPreload = process.env.DISCORD_PRELOADER;

if (ogPreload) require(ogPreload);

const pluginLocation = path.join(BASE_DIR, `${MOD_NAME}`,'plugins');
const themeLocation = path.join(BASE_DIR, `${MOD_NAME}`,'themes');
const settingsLocation = path.join(BASE_DIR, `${MOD_NAME}`,'settings');
const reactLocation = path.join(BASE_DIR, `${MOD_NAME}`,'fmkadmapgofadopljbjfkapdkoienihi');

const rendererSource = readFileSync(path.join(__dirname, `renderer.min.js`)).toString('base64');

void webFrame.executeJavaScript(`
const rendererImportURL = URL.createObjectURL(
    new Blob(
        [
            new TextDecoder().decode(
                Uint8Array.from(atob('${rendererSource}'), (c) => c.codePointAt(0)),
            ) +
            '//# sourceURL=distrust://distrust/renderer',
        ],
        { type: 'text/javascript' },
    ),
);

void import(rendererImportURL);

//# sourceURL=distrust://distrust/renderer-import
`);

const get = (name: string): Promise<any> =>
{
    return ipcRenderer.invoke('readSettings', { path: settingsLocation, name });
}

const set = (name: string, data: any): Promise<any> =>
{
    return ipcRenderer.invoke('writeSettings', { path: settingsLocation, name, data });
}

const loadPlugins = async (): Promise<any[]> =>
{
    try
    {
        const result = await ipcRenderer.invoke('loadPlugins', { path: pluginLocation });

        if (result.status !== 'success')
        {
            console.error('distrust @ preload @ loadPlugins:', 'error (ipc) loading pluging:', result.message);
            return [];
        }

        return result.plugins.filter(Boolean);
    }
    catch (error)
    {
        console.error('distrust @ preload @ loadPlugins:', 'error loading plugins:', error);
    }

    return [];
}

const loadThemes = async (): Promise<any[]> =>
{
    try
    {
        const result = await ipcRenderer.invoke('loadThemes', { path: themeLocation });

        if (result.status !== 'success') {
            console.error('distrust @ preload @ loadThemes:', 'error (ipc) loading themes:', result.message);
            return [];
        }

        return result.themes.filter(Boolean);
    }
    catch (error)
    {
        console.error('distrust @ preload @ loadThemes:', 'error loading themes:', error);
    }

    return [];
}

contextBridge.exposeInMainWorld(
    'DistrustNative',
    {
        settings: { get, set },
        addons: { loadPlugins, loadThemes },
        locations:
        {
            plugins: pluginLocation,
            themes: themeLocation,
            settings: settingsLocation,
            react: reactLocation,
        },
    },
);