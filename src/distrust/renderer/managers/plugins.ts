﻿export const plugins = [ require('../mods/settings') ];

interface Mod {
    start?: () => void;
    stop?: () => void;
    [x: string]: any;
}

export function getExports(id: string)
{
    return plugins.find(plugin=>plugin.manifest.name.toLowerCase() == id.toLowerCase())
}