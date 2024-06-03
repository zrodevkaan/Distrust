import {coreLogger, generalSettings} from "../../devConsts";

export const plugins: Mod[] = [];

export const pluginPlaintexts: any[] = [
    require('../mods/experiments/patches'),
    require('../mods/noDevtoolsWarnings/patches'),
    require('../mods/settings/patches'),
    require('../mods/contextMenu/patches'),
];

export const externalPatches = async () =>
{
    return await window.DistrustNative.addons.loadPatches();
}

export const loadCoremods = async (): Promise<void> => {
    plugins.push(
        {
            manifest: require('../mods/experiments/manifest.json'),
            exports: require('../mods/experiments'),
            coremod: true
        },
        {
            manifest: require('../mods/noDevtoolsWarnings/manifest.json'),
            exports: require('../mods/noDevtoolsWarnings'),
            coremod: true
        },
        {
            manifest: require('../mods/recovery/manifest.json'),
            exports: require('../mods/recovery'),
            coremod: true
        },
        {
            manifest: require('../mods/settings/manifest.json'),
            exports: require('../mods/settings'),
            coremod: true
        },
        {
            manifest: require('../mods/contextMenu/manifest.json'),
            exports: require('../mods/contextMenu'),
            coremod: true
        },
    );
};

export interface Mod {
    manifest: {
        name: string;
        authors: string[];
        description: string;
        version: string;
    };
    exports: {
        start?: () => void | Promise<void>;
        stop?: () => void | Promise<void>;
        [key: string]: unknown;
    };
    started?: boolean;
    coremod?: boolean;
};

export const getPlugin = (id: string) =>
    plugins.find(plugin => plugin?.manifest?.name.toLowerCase() === id.toLowerCase());

export const getExports = (id: string) => getPlugin(id)?.exports;

export const stop = async (id: string): Promise<void> =>
{
    const plugin = getPlugin(id);

    if (!plugin)
        throw new Error(`"${id}" was not found`);

    if (!plugin.started)
        throw new Error(`"${id}" has already stopped`);

    try
    {
        await plugin.exports?.stop?.();

        plugin.started = false;

        coreLogger.info(`Stopped plugin "${id}"`);
    }
    catch (e)
    {
        coreLogger.info(`Failed to stop plugin "${id}"\n\n`, e);
    }
};

export const start = async (id: string): Promise<void> =>
{
    const plugin = getPlugin(id);

    if (!plugin)
        throw new Error(`"${id}" was not found`);

    if (plugin.started)
        throw new Error(`"${id}" has already started`);

    try
    {
        await plugin.exports?.start?.();

        plugin.started = true;

        coreLogger.info(`Started plugin "${id}"`);
    }
    catch (e)
    {
        coreLogger.info(`Failed to start plugin "${id}", stopping it now\n\n`, e);

        plugin.started = false;

        void stop(id);
    }
};

export const disable = async (id: string): Promise<boolean> =>
{
    const plugin = getPlugin(id);

    if (!plugin || plugin.coremod)
        return false;

    if (plugin.started)
        await stop(id).catch((e) =>
            coreLogger.warn(`Failed to stop plugin "${id}" while disabling it\n\n`, e),
        );

    const disabledPlugins = (await generalSettings.get('disabled') || {}) as unknown as Record<string, boolean>;

    disabledPlugins[id] = true;

    await generalSettings.set('disabled', disabledPlugins);

    coreLogger.info(`Disabled plugin "${id}"`);

    return true;
};

export const enable = async (id: string): Promise<boolean> =>
{
    const plugin = getPlugin(id);

    const disabledPlugins = (await generalSettings.get('disabled') || {}) as unknown as Record<string, boolean>;

    if (!plugin || !Object.keys(disabledPlugins).includes(id))
        return false;

    if (!plugin.started)
        await start(id).catch((e) =>
            coreLogger.warn(`Failed to start plugin "${id}" while enabling it\n\n`, e)
        );

    delete disabledPlugins[id];

    await generalSettings.set('disabled', disabledPlugins);

    coreLogger.info(`Enabled plugin "${id}"`);

    return true;
};

export const startAll = async (): Promise<void> =>
{
    const disabled = Object.keys(await generalSettings.get('disabled') || {});

    plugins
        .filter((plugin) =>
            plugin?.coremod || (plugin && !disabled.includes(plugin.manifest?.name))
        )
        .forEach((plugin) =>
            void start(plugin.manifest.name)
        );
};

export const stopAll = (): void =>
    plugins.forEach((plugin) => void stop(plugin.manifest.name));