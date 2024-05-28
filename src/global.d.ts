﻿import {Mod, Theme} from "./distrust/renderer/managers/plugins";

export {};

declare global {
    interface Window {
        distrust: any;
        ace: any;
        DistrustNative: {
            ipcRenderer: {
                set: (name: string, data: any) => Promise<string>;
                get: (key: string) => Promise<void>;
                loadPlugins: () => Promise<Mod[]>;
                loadThemes: () => Promise<Theme[]>;
            };
            locations: {
                plugins: string;
                themes: string;
                settings: string;
                fmkadmapgofadopljbjfkapdkoienihi: string;
            };
        };
    }
}