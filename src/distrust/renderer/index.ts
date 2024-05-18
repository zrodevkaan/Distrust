import {plugins} from "./managers/plugins";


export function startAll()
{
    plugins.forEach(plugin => plugin.start())
}

export function stopAll()
{
    plugins.forEach(plugin => plugin.start())
}