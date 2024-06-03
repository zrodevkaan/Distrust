import { Logger } from './api/logger';
import { Patcher } from './api/patcher';
import { webpack, modules, common } from "./api/webpack";
import { pluginsManager, themesManager } from "./renderer";
import * as css from "./api/css";
import { DataHandler } from "./renderer/managers/storage";
import { coreLogger, generalSettings } from "./devConsts";
import * as contextMenu from "./renderer/mods/contextMenu";
import {generateInterface, getPropValue} from "./api/helpers";

// @ts-ignore
window.distrust = new class Distrust
{
    logger = Logger;
    patcher = Patcher;
    webpack = webpack;
    common = common.modules;
    plugins = Object.fromEntries(
        Object.entries(pluginsManager).filter(
            ([key]) => !['loadCoremods', 'pluginPlaintexts'].includes(key),
        ),
    );
    themes = themesManager;
    css = css;
    helpers = {getPropValue, generateInterface}
    storage = DataHandler;
    contextMenu = contextMenu;
}

Promise.allSettled([modules.waitForReady, common.waitForReady])
    .then(() =>
    {
        void pluginsManager.loadCoremods();

        void window.DistrustNative.addons.loadPlugins()
            .then((pluginsArray) =>
                Promise.allSettled(pluginsArray.map(async ({ manifest, source }) =>
                {
                    const importUrl = URL.createObjectURL(
                        new Blob(
                            [ source + `\n\n//# sourceURL=distrust://distrust/plugin/${manifest.name}` ],
                            { type: 'text/javascript' },
                        ),
                    );

                    try
                    {
                      const plugin = await import(importUrl);

                      pluginsManager.plugins.push({ exports: plugin, manifest });
                    }
                    catch (e)
                    {
                      coreLogger.warn(`failed to load "${manifest.name}"; it will be ignored\n\n`, e);
                    }
                }))
            )
            .then(() => pluginsManager.startAll());

        void window.DistrustNative.addons.loadThemes()
            .then((themesArray) => themesManager.themes.push(...themesArray))
            .then(() => themesManager.startAll());

        void generalSettings.get('customCss')
            .then((customCss) => css.injectCSS('customCss', customCss));
    })

