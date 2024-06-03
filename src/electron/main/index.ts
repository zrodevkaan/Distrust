import './overrides/BrowserWindow';
import "./overrides/network";

import path from "node:path";
import electron, { session, app, shell } from "electron";
import fs from "fs";

import { MOD_NAME } from "../../consts";
import { BASE_DIR } from '../consts';

import { ReactDevToolsPath } from "./overrides/reactDevTools";
import type { Plugin } from '../../types';

type FolderStructure = {
    [key: string]: FolderStructure | never[];
};

electron.ipcMain.handle('openPath', async (event, folderPath) => {
    await shell.openPath(folderPath);
});

electron.ipcMain.handle('readSettings', (_, { path: basePath, name }) =>
{
    try
    {
        if (name !== path.basename(name))
            console.warn(
                'distrust @ main @ readSettings (ipc):',
                `(raw) "${name}" !== (basename) "${path.basename(name)}"\n`,
                'this could be an attempted directory traversal attack; proceeding with basename.',
            );

        return fs.readFileSync(path.join(basePath, path.basename(name)), { encoding: 'utf8' });
    }
    catch (error: any)
    {
        return { error: error.message };
    }
});

electron.ipcMain.handle('writeSettings', async (_, { path: basePath, name, data }) =>
{
    try
    {
        if (name !== path.basename(name))
            console.warn(
                'distrust @ main @ writeSettings (ipc):',
                `(raw) "${name}" !== (basename) "${path.basename(name)}"\n`,
                'this could be an attempted directory traversal attack; proceeding with basename.',
            );

        const filePath = path.join(basePath, path.basename(name));

        fs.writeFileSync(filePath, data, { encoding: 'utf8' });

        return { success: true, logger: filePath };
    }
    catch (error: any)
    {
        return { error: error.message };
    }
});

electron.ipcMain.handle('loadPlugins', async (_, { path: pluginsPath }) => {
    try
    {
        const plugins = [];

        const pluginDirectories = fs.readdirSync(pluginsPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const dir of pluginDirectories)
        {
            const manifestPath = path.join(pluginsPath, dir, 'manifest.json');
            const indexPath = path.join(pluginsPath, dir, 'index.js');

            if (fs.existsSync(manifestPath) && fs.existsSync(indexPath))
            {
                const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

                const source = fs.readFileSync(indexPath, 'utf-8');

                const missingManifestFields = [
                    !manifest.name && 'name',
                    !manifest.authors && 'authors',
                    !manifest.description && 'description',
                    !manifest.version && 'version',
                ].filter(Boolean);

                if (!missingManifestFields.includes('name'))
                    plugins.push({
                        manifest,
                        source,
                    });

                if (missingManifestFields.length > 0)
                    console.warn(
                        'distrust @ main @ loadPlugins (ipc):',
                        `manifest for plugin in ${path.join(pluginsPath, dir)} is missing field(s):`,
                        `{ ${missingManifestFields.join(', ')} };`,
                        missingManifestFields.includes('name')
                            ? 'ignoring since important identifier props like { name } is omitted.'
                            : 'allowing since important identifier props like { name } is not omitted.',
                    );
            }
            else
                console.error(
                    'distrust @ main @ loadPlugins (ipc):',
                    `manifest.json or index.js not found in ${path.join(pluginsPath, dir)}`
                );
        }

        return { status: 'success', plugins };
    }
    catch (error)
    {
        console.error('distrust @ main @ loadPlugins (ipc):', 'error loading plugins:', error);
        return { status: 'error', message: (error as Error).message };
    }
});

electron.ipcMain.handle('loadPlaintextPatches', async (_, { path: pluginsPath }) =>
{
    try
    {
        const patches: Array<{ source: string, manifest: Plugin['manifest'] }> = [];

        // plaintext patches in plugins must be exported in a file named patches.js

        const dirs = fs.readdirSync(pluginsPath, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name);

        for (const dir of dirs)
        {
            const patchesPath = path.join(pluginsPath, dir, 'patches.js');
            const manifestPath = path.join(pluginsPath, dir, 'manifest.json');

            if (fs.existsSync(patchesPath) && fs.existsSync(manifestPath))
            {
                try
                {
                    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

                    if (manifest?.name)
                        patches.push(
                            {
                                source: fs.readFileSync(patchesPath, { encoding: 'utf-8' }),
                                manifest,
                            }
                        );
                    else
                        console.warn(
                            'distrust @ main @ loadPlaintextPatches (ipc):',
                            `manifest for plugin in ${path.join(pluginsPath, dir)}`,
                            'is missing important identifier props like { name }.',
                            'ignoring.',
                        );
                }
                catch (e)
                {
                    console.warn(
                        'distrust @ main @ loadPlaintextPatches (ipc):',
                        `error loading plaintext patches of ${path.join(pluginsPath, dir)}:`,
                        e
                    );
                }
            }
            else if (!fs.existsSync(manifestPath))
                console.warn(
                    'distrust @ main @ loadPlaintextPatches (ipc):',
                    `manifest.json not found in ${path.join(pluginsPath, dir)}`,
                );
        }

        return { status: 'success', patches };
    } catch (error) {
        console.error(
            'distrust @ main @ loadPlaintextPatches (ipc):',
            'error loading plaintext patches:',
            error
        );

        return { status: 'error', message: (error as Error).message };
    }
});

electron.ipcMain.handle('loadThemes', async (_, { path: themesPath }) => {
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

                const missingManifestFields = [
                    !manifest.name && 'name',
                    !manifest.authors && 'authors',
                    !manifest.description && 'description',
                    !manifest.version && 'version',
                ].filter(Boolean);

                const source = fs.readFileSync(stylePath, 'utf-8');

                if (!missingManifestFields.includes('name'))
                    themes.push({
                        manifest,
                        source,
                    });

                if (missingManifestFields.length > 0)
                    console.warn(
                        'distrust @ main @ loadThemes (ipc):',
                        `manifest for theme in ${path.join(themesPath, dir)} is missing field(s):`,
                        `{ ${missingManifestFields.join(', ')} }; `,
                        missingManifestFields.includes('name')
                            ? 'Ignoring since important identifier props like { name } is omitted.'
                            : 'Allowing since important identifier props like { name } is not omitted.',
                    );
            }
            else
                console.error(
                    'distrust @ main @ loadPlugins (ipc):',
                    `manifest or style.css not found in ${path.join(themesPath, dir)}`
                );
        }

        return { status: 'success', themes };
    }
    catch (error)
    {
        console.error('distrust @ main @ loadPlugins (ipc):', 'error loading themes:', error);
        return { status: 'error', message: (error as Error).message };
    }
});


function createFolderTree(basePath: string, structure: FolderStructure)
{
    Object.keys(structure).forEach((folder) =>
    {
        const folderPath = path.join(basePath, folder);

        if (!fs.existsSync(folderPath))
            fs.mkdirSync(folderPath, { recursive: true });

        const subStructure = structure[folder];

        if (Array.isArray(subStructure))
            subStructure.forEach(subFolder =>
            {
                if (typeof subFolder === 'string')
                {
                    const subFolderPath = path.join(folderPath, subFolder);

                    if (!fs.existsSync(subFolderPath))
                        fs.mkdirSync(subFolderPath, { recursive: true });
                }
            });
        else
            createFolderTree(folderPath, subStructure as FolderStructure);
    });
}

createFolderTree(BASE_DIR, {
    [MOD_NAME]: {
        plugins: [],
        themes: [],
        data: [],
        settings: [],
        fmkadmapgofadopljbjfkapdkoienihi: []
    }
});

app.whenReady().then(() => {
    console.log('distrust @ main @ app.whenReady:', "app ready");
    session.defaultSession.loadExtension(ReactDevToolsPath);
})
