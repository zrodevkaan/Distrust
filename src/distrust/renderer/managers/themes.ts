import { coreLogger, generalSettings } from "../../devConsts";
import { injectCSS, uninjectCSS } from "../../api/css";

export interface Theme {
    manifest: {
        name: string;
        authors: string[];
        description: string;
        version: string;
    };
    source: string,
    started: boolean;
}

export const themes: Theme[] = [];

export const getTheme = (id: string) =>
    themes.find((theme) => theme?.manifest?.name.toLowerCase() === id.toLowerCase());

export const getSource = (id: string) =>
    getTheme(id)?.source;

export const stop = (id: string): void =>
{
    const theme = getTheme(id);

    if (!theme)
        throw new Error(`"${id}" was not found`);

    if (!theme.started)
        throw new Error(`"${id}" has already stopped`);

    try
    {
        uninjectCSS(id);

        theme.started = false;

        coreLogger.info(`Stopped theme "${id}"`);
    }
    catch (e)
    {
        coreLogger.info(`Failed to stop theme "${id}"\n\n`, e);
    }
};

export const start = (id: string): void =>
{
    const theme = getTheme(id);

    if (!theme)
        throw new Error(`"${id}" was not found`);

    if (theme.started)
        throw new Error(`"${id}" has already started`);

    try
    {
        injectCSS(id, theme.source);

        theme.started = true;

        coreLogger.info(`Started theme "${id}"`);
    }
    catch (e)
    {
        coreLogger.info(`Failed to start theme "${id}", stopping it now\n\n`, e);

        theme.started = false;

        stop(id);
    }
};

export const disable = async (id: string): Promise<boolean> =>
{
    const theme = getTheme(id);

    if (!theme) return false;

    if (theme.started) {
        try
        {
            stop(id);
        }
        catch (e)
        {
            coreLogger.warn(`Failed to stop theme "${id}" while disabling it\n\n`, e);
        }
    }

    const disabledThemes = (await generalSettings.get('disabled') || {}) as unknown as Record<string, boolean>;

    disabledThemes[id] = true;

    generalSettings.set('disabled', disabledThemes);

    coreLogger.info(`Disabled theme "${id}"`);

    return true;
}

export const enable = async (id: string): Promise<boolean> =>
{
    const theme = getTheme(id);

    if (!theme) return false;

    if (!theme.started) {
        try
        {
            start(id);
        }
        catch (e)
        {
            coreLogger.warn(`Failed to start theme "${id}" while enabling it\n\n`, e);
        }
    }

    const disabledThemes = (await generalSettings.get('disabled') || {}) as unknown as Record<string, boolean>;

    delete disabledThemes[id];

    generalSettings.set('disabled', disabledThemes);

    coreLogger.info(`Enabled theme "${id}"`);

    return true;
}

export const startAll = async (): Promise<void> =>
{
    const disabled = Object.keys(await generalSettings.get('disabled') || {});

    themes
        .filter((theme) =>
            theme && !disabled.includes(theme.manifest?.name)
        )
        .forEach((theme) =>
        {
            try
            {
                start(theme.manifest.name);
            }
            catch (e) {}
        });
};

export const stopAll = (): void =>
    themes.forEach((theme) =>
    {
        try
        {
            stop(theme.manifest.name);
        }
        catch (e) {}
    });
