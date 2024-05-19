export const plugins = [ require('../mods/settings'), require('../mods/noDevtoolsWarnings'), require('../mods/recovery/index'), require('../mods/experiments')];

interface Mod {
    start?: () => void;
    stop?: () => void;
    [x: string]: any;
}

export function getExports(id: string)
{
    return plugins.find(plugin=>plugin.manifest.name.toLowerCase() == id.toLowerCase())
}