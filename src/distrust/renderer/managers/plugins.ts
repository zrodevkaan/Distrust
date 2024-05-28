import {coreLogger, generalSettings} from "../../devConsts";
export const plugins: Mod[] = [];
export const pluginPlaintexts: any[] = [
    require('../mods/experiments/patches'),
    require('../mods/noDevtoolsWarnings/patches'),
    require('../mods/settings/patches'),
    require('../mods/contextMenu/patches'),
];

export const loadCoremods = async (): Promise<void> => {
    plugins.push(
        require('../mods/experiments'),
        require('../mods/noDevtoolsWarnings'),
        require('../mods/recovery'),
        require('../mods/settings'),
        require('../mods/contextMenu'),
    );
};

export const pushPluginPlease = (exports: any) => {
    plugins.push(exports);
};

export interface Mod {
    start?: () => void;
    stop: () => void;
    manifest: {
        name: string;
        authors: string[];
        description: string;
        version: string;
    };
    [x: string]: any;
}

export function getExports(id: string) {
    return plugins.find(plugin => plugin?.manifest?.name.toLowerCase() === id.toLowerCase());
}

export function disable(id: string): boolean {
    const plugin = getExports(id);
    if (!plugin) return false;
    plugin.stop();
    coreLogger.info(`${plugin?.manifest?.name} was remotely disabled`);
    // Update the generalSettings disabled list
    const disabledPlugins = generalSettings.get('disabled') || {};
    disabledPlugins[plugin?.manifest?.name] = true;
    generalSettings.set('disabled', disabledPlugins);
    return true;
}

export function enable(id: string): boolean {
    const plugin = getExports(id);
    if (!plugin || !plugin.start) return false;
    plugin.start();
    coreLogger.info(`${plugin.manifest.name} was remotely enabled`);
    // Update the generalSettings disabled list
    const disabledPlugins = generalSettings.get('disabled') || {};
    disabledPlugins[plugin.manifest.name] = false;
    generalSettings.set('disabled', disabledPlugins);
    return true;
}