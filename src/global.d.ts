import { Plugin, Theme } from "./types";

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
                loadPlugins: () => Promise<Array<{ source: string, manifest: Plugin['manifest'] }>>;
                loadThemes: () => Promise<Theme[]>;
                loadPlaintextPatches: () => Promise<Array<{ source: string, manifest: Plugin['manifest'] }>>;
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