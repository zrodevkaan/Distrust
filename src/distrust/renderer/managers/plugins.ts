export const plugins: any[] = [];
export const pluginPlaintexts: any[] = [
    require('../mods/experiments/patches'),
    require('../mods/noDevtoolsWarnings/patches'),
    require('../mods/settings/patches'),
];

export const loadCoremods = async (): Promise<void> => {
    plugins.push(
        require('../mods/experiments'),
        require('../mods/noDevtoolsWarnings'),
        require('../mods/recovery'),
        require('../mods/settings'),
    )
}

interface Mod {
    start?: () => void;
    stop?: () => void;
    [x: string]: any;
}

export function getExports(id: string)
{
    return plugins.find(plugin=>plugin.manifest.name.toLowerCase() == id.toLowerCase())
}