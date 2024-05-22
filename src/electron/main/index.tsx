import './overrides/BrowserWindow';
import "./overrides/network";

import path from "node:path";
import * as fs from "fs";
import * as os from "os";
import electron from "electron";
import {readFileSync, writeFileSync} from "fs";
import {createWriteStream, existsSync} from "node:fs";
import {coreLogger} from "../../distrust/devConsts";

type FolderStructure = {
    [key: string]: FolderStructure | [];
};
const APPDATA_PATH = path.join(os.homedir(), 'AppData', 'Roaming');

electron.ipcMain.handle('readSettings', (event, { path, name }) => 
{
    try {
        return readFileSync(path + `\\${name}`, { encoding: 'utf8' });
    } catch (error) {
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
    } catch (error) {
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
        settings: []
    }
};

createFolderTree(APPDATA_PATH, folderStructure);

const REACT_DEVELOPER_TOOLS = 'fmkadmapgofadopljbjfkapdkoienihi';
installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension: ${name}`))
    .catch((err) => console.log('An error occurred: ', err));