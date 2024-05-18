import {plugins} from "./managers/plugins";


export function startAll()
{
    plugins.forEach(plugins => plugins.start());
}

export function stopAll()
{
    plugins.forEach(plugin => plugin.start())
}