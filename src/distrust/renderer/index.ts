import { plugins } from "./managers/plugins";
import {generalSettings} from "../devConsts";

export async function startAll() {
    try {
        const disabledPluginsObject = await generalSettings.get('disabled') || {};

        const disabledPlugins = Object.keys(disabledPluginsObject);

        plugins.forEach(plugin => {
            if (!disabledPlugins.includes(plugin.manifest.name)) {
                plugin.start && plugin.start();
                plugin.started = true;
            }
        });
    } catch (error) {
        console.error('Error starting plugins:', error);
    }
}



export function stopAll()
{
    plugins.forEach(plugin => plugin.stop())
}