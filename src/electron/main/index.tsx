import './overrides/BrowserWindow';
import "./overrides/network";

import path from "node:path";
import * as fs from "fs";
import * as os from "os";
import electron, {session, app} from "electron";
import {readFileSync, writeFileSync} from "fs";
import {createWriteStream, existsSync} from "node:fs";
import {ReactDevToolsPath} from "./overrides/reactDevTools";

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
