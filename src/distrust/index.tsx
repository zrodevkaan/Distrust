import { Logger } from './api/logger';
import { Patcher } from './api/patcher';
import { webpack, modules, common } from "./api/webpack";
import {getExports, plugins, loadCoremods, Mod, enable, disable} from "./renderer/managers/plugins";
import { startAll } from "./renderer";
import { proxyCache } from "./api/helpers";
import { injectCSS, uninjectCSS } from "./api/css";
import {DataHandler} from "./renderer/managers/storage";
import {coreLogger, generalSettings} from "./devConsts";
import {finallyIBuildContextMenu, makeItem} from "./renderer/mods/contextMenu";

// @ts-ignore
window.distrust = new class Distrust
{
    logger = Logger;
    patcher = Patcher;
    webpack = webpack;
    common = common.modules;
    plugins = { plugins, getExports, proxyCache, pluginManager: {enable, disable} }
    css = { injectCSS, uninjectCSS }
    storage = DataHandler;
    contextMenu = { finallyIBuildContextMenu, makeItem }
}

Promise.allSettled([modules.waitForReady, common.waitForReady])
    .then(async () =>
    {
        await loadCoremods()
        const pluginsArray: Mod[] = await window.DistrustNative.ipcRenderer.loadPlugins();
        pluginsArray.forEach(plugin => {
            plugin.exports.manifest = plugin.manifest;
            plugins.push(plugin.exports) // I can't do this in preload/main. the `plugins` export takes it as different export.
            // and im not smart enough to fix it. so I just did it here.
        })
        startAll()
        injectCSS('customCss',await generalSettings.get('customCss'))
    })
