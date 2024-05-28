import './overrides/BrowserWindow';
import "./overrides/network";

import path from "node:path";
import * as fs from "fs";
import * as os from "os";
import electron, {session, app} from "electron";
import {readFileSync, writeFileSync} from "fs";
import {createWriteStream, existsSync} from "node:fs";
import {ReactDevToolsPath} from "./overrides/reactDevTools";
import {coreLogger} from "../../distrust/devConsts";

type FolderStructure = {
    [key: string]: FolderStructure | [];
};
const APPDATA_PATH = path.join(os.homedir(), 'AppData', 'Roaming');

electron.ipcMain.handle('readSettings', (event, { path, name }) => 
{
    try {
        return readFileSync(path + `\\${name}`, { encoding: 'utf8' });
    } catch (error: any) {
        return { error: error.message };
    }
});

electron.ipcMain.handle('writeSettings', async (event, { path, name, data }) => 
{
    try {
        const filePath = path + `\\${name}`;
        if (!existsSync(filePath)) {
            const stream = createWriteStream(filePath, { flags: 'w' });
            stream.write(data, 'utf8', () => 
            {
                stream.end();
            });
        }
        writeFileSync(filePath, data, { encoding: 'utf8' });
        return { success: true, logger: filePath };
    } catch (error: any) {
        return { error: error.message };
    }
});
electron.ipcMain.handle('loadPlugins', async (event, { path: pluginsPath }) => {
    try {
        const plugins = [];

        const pluginDirectories = fs.readdirSync(pluginsPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const dir of pluginDirectories) {
            const manifestPath = path.join(pluginsPath, dir, 'manifest.json');
            const indexPath = path.join(pluginsPath, dir, 'index.js');

            if (fs.existsSync(manifestPath) && fs.existsSync(indexPath)) {
                const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

                manifest.name = manifest.name || '';
                manifest.authors = manifest.authors || [''];
                manifest.description = manifest.description || '';
                manifest.version = manifest.version || '';

                const fileContent = fs.readFileSync(indexPath, 'utf-8');

                plugins.push({
                    key: manifest.name,
                    manifest,
                    fileContent
                });

                const missingFields = [];
                if (!manifest.name) missingFields.push('name');
                if (!manifest.authors) missingFields.push('authors');
                if (!manifest.description) missingFields.push('description');
                if (!manifest.version) missingFields.push('version');
                if (missingFields.length > 0) {
                    console.warn(`Manifest for plugin in ${path.join(pluginsPath, dir)} is missing fields: ${missingFields.join(', ')}. Defaulted to empty string.`);
                }
            } else {
                console.error(`Manifest or index.js not found in ${path.join(pluginsPath, dir)}`);
            }
        }

        return { status: 'success', plugins };
    } catch (error) {
        console.error('Error loading plugins:', error);
        return { status: 'error', message: error.message };
    }
});

electron.ipcMain.handle('loadThemes', async (event, { path: themesPath }) => {
    try {
        const themes = [];

        const themeDirectories = fs.readdirSync(themesPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const dir of themeDirectories) {
            const manifestPath = path.join(themesPath, dir, 'manifest.json');
            const stylePath = path.join(themesPath, dir, 'style.css');

            if (fs.existsSync(manifestPath) && fs.existsSync(stylePath)) {
                const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

                manifest.name = manifest.name || '';
                manifest.authors = manifest.authors || [''];
                manifest.description = manifest.description || '';
                manifest.version = manifest.version || '';

                const cssContent = fs.readFileSync(stylePath, 'utf-8');

                themes.push({
                    key: manifest.name,
                    manifest,
                    cssContent
                });

                const missingFields = [];
                if (!manifest.name) missingFields.push('name');
                if (!manifest.authors) missingFields.push('authors');
                if (!manifest.description) missingFields.push('description');
                if (!manifest.version) missingFields.push('version');
                if (missingFields.length > 0) {
                    console.warn(`Manifest for theme in ${path.join(themesPath, dir)} is missing fields: ${missingFields.join(', ')}. Defaulted to empty string.`);
                }
            } else {
                console.error(`Manifest or style.css not found in ${path.join(themesPath, dir)}`);
            }
        }

        return { status: 'success', themes };
    } catch (error) {
        console.error('Error loading themes:', error);
        return { status: 'error', message: error.message };
    }
});


function createFolderTree(basePath: string, structure: FolderStructure) 
{
    Object.keys(structure).forEach(folder => {
        const folderPath = path.join(basePath, folder);
        if (!fs.existsSync(folderPath)) 
        {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        const subStructure = structure[folder];
        if (Array.isArray(subStructure)) {
            subStructure.forEach(subFolder => 
            {
                if (typeof subFolder === 'string') {
                    const subFolderPath = path.join(folderPath, subFolder);
                    if (!fs.existsSync(subFolderPath))
                    {
                        fs.mkdirSync(subFolderPath, { recursive: true });
                    }
                }
            });
        } else {
            createFolderTree(folderPath, subStructure as FolderStructure);
        }
    });
}

const folderStructure: FolderStructure = {
    distrust: {
        plugins: [],
        themes: [],
        data: [],
        settings: [],
        fmkadmapgofadopljbjfkapdkoienihi: []
    }
};

createFolderTree(APPDATA_PATH, folderStructure);
app.whenReady().then(async () => {
    console.log("App ready");
    session.defaultSession.loadExtension(ReactDevToolsPath);
})
