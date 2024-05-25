import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { session } from 'electron';
import os from 'os';
import { MOD_NAME } from '../../../consts';

export const ReactDevToolsPath = path.join(os.homedir(), 'AppData', 'Roaming', MOD_NAME, 'fmkadmapgofadopljbjfkapdkoienihi');
const ReactDevToolsZip = path.join(ReactDevToolsPath, 'react-devtools.zip');
const ReactDevTools = 'https://replugged.dev/api/v1/react-devtools';

export async function devToolsGoInElectronsBellyOwO() {
    let buffer = existsSync(ReactDevToolsZip) ? readFileSync(ReactDevToolsZip) : Buffer.from(await fetch(ReactDevTools).then(res => res.arrayBuffer()).catch(() => { throw new Error("Could not download React DevTools"); }));

    if (!existsSync(ReactDevToolsZip)) writeFileSync(ReactDevToolsZip, buffer);

    const zip = new AdmZip(buffer);
    await new Promise<void>((resolve, reject) => zip.extractAllToAsync(ReactDevToolsZip, true, false, err => err ? reject(err) : resolve()));
}
