import {Mod, Theme} from "./distrust/renderer/managers/plugins";

export {};

declare global {
    interface Window {
        distrust: any;
        ace: any;
        DistrustNative: {
            settings: {
                set: (name: string, data: any) => Promise<
                    { success: true, logger: string } | { error: string }
                >;
                get: (key: string) => Promise<string>;
            };
            addons: {
                loadPlugins: () => Promise<Array<{ source: string, manifest: Mod['manifest'] }>>;
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