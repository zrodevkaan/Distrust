import { coreLogger, generalSettings } from "../../devConsts";
import type { PlaintextPatch, Plugin } from "../../../types";

export const plugins: Plugin[] = [];

const _extractDefault = <T = any>(module: any): T =>
    module?.default as T;

export const plaintextPatches: PlaintextPatch[][] = [
    await import('../mods/experiments/patches').then(_extractDefault),
    await import('../mods/noDevtoolsWarnings/patches').then(_extractDefault),
    await import('../mods/settings/patches').then(_extractDefault),
    await import('../mods/contextMenu/patches').then(_extractDefault),
    ...(
        await window.DistrustNative.addons.loadPlaintextPatches().then((res) =>
            Promise.all<Promise<PlaintextPatch[]>[]>(
                res.map(async ({ source, manifest }) =>
                {
                    const importURL = URL.createObjectURL(
                        new Blob(
                            [ source + `\n\n//# sourceURL=distrust://distrust/plaintextPatches/${manifest.name}` ],
                            { type: 'text/javascript' },
                        ),
                    );

                    try
                    {
                        const plaintextPatch = await import(importURL);

                        if (Array.isArray(plaintextPatch?.default)) {
                            coreLogger.info(`loaded plaintext patch for "${manifest.name}"`);

                            return plaintextPatch.default;
                        }
                    }
                    catch (e)
                    {
                        coreLogger.warn(`failed to load plaintext patch for "${manifest.name}"; it will be ignored\n`, e);
                    }
                })
            )
        )
    ),
];

export const loadCoremods = async (): Promise<void> => {
    plugins.push(
        {
            manifest: await import('../mods/experiments/manifest.json'),
            exports: await import('../mods/experiments'),
            coremod: true,
        },
        {
            manifest: await import('../mods/noDevtoolsWarnings/manifest.json'),
            exports: await import('../mods/noDevtoolsWarnings'),
            coremod: true,
        },
        {
            manifest: await import('../mods/recovery/manifest.json'),
            exports: await import('../mods/recovery'),
            coremod: true,
        },
        {
            manifest: await import('../mods/settings/manifest.json'),
            exports: await import('../mods/settings'),
            coremod: true,
        },
        {
            manifest: await import('../mods/contextMenu/manifest.json'),
            exports: await import('../mods/contextMenu'),
            coremod: true,
        },
    );
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