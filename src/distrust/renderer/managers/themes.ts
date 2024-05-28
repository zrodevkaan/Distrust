import { coreLogger, generalSettings } from "../../devConsts";
import {injectCSS, uninjectCSS} from "../../api/css";

export interface Theme {
    manifest: {
        name: string;
        authors: string[];
        description: string;
        version: string;
    };
    cssContent: string,
    [x: string]: any;
    started: boolean;
}

export const themes: Theme[] = [];

export async function startAllThemes() {
    try {
        const disabledThemesObject = await generalSettings.get('disabledThemes') || {};
        const disabledThemes = Object.keys(disabledThemesObject);

        themes.forEach(theme => {
            if (!disabledThemes.includes(theme.manifest.name)) {
                injectCSS(theme.manifest.name, theme.cssContent);
                theme.started = true;
            }
        });
        
    } catch (error) {
        console.error('Error starting themes:', error);
    }
}


export function getExports(id: string): Theme {
    return <Theme>themes.find(theme => theme?.manifest?.name.toLowerCase() === id.toLowerCase());
}

export function disable(id: string): boolean {
    const theme = getExports(id);
    if (!theme) return false;
    uninjectCSS(id)
    coreLogger.info(`${theme?.manifest?.name} was remotely disabled`);
    theme.started = false;
    const disabledThemes = generalSettings.get('disabled') || {};
    disabledThemes[theme?.manifest?.name] = true;
    generalSettings.set('disabledThemes', disabledThemes);
    return true;
}

export function enable(id: string): boolean {
    const theme = getExports(id);
    if (!theme) return false;
    injectCSS(id, theme.cssContent)
    coreLogger.info(`${theme.manifest.name} was remotely enabled`);
    theme.started = true;
    const disabledThemes = generalSettings.get('disabled') || {};
    delete disabledThemes[theme.manifest.name];
    generalSettings.set('disabledThemes', disabledThemes);
    return true;
}
