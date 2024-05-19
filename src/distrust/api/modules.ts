import {WebpackInstance} from "discord-types/other";
import Webpack, {GetModuleOptions, WebpackModule} from "./webpack";
import {startAll} from "../renderer";
import {plugins} from "../renderer/managers/plugins";
import {coreLogger} from "../devConsts";

const WEBPACK_CHUNK = 'webpackChunkdiscord_app';
export const sources: Record<number, string> = {};
export let webpackRequire: WebpackInstance | null = null;

export const webpackChunk = window.webpackChunkdiscord_app ??= [];

const listeners = new Set<(module: { id: string, exports: any }, exports: any) => void>();

function patch(modules: Record<string, Function>, id: PropertyKey, module: Function) {
    sources[id] = module.toString();
    let hasPatches = false;

    plugins.forEach(plugin => {
        if (plugin.patches) {
            const source = sources[id];
            plugin.patches.forEach(patch => {
                let hasMatch = false;

                if (typeof patch.find === 'string') {
                    hasMatch = source.includes(patch.find);
                } else if (patch.find instanceof RegExp) {
                    hasMatch = patch.find.test(source);
                }

                if (hasMatch) {
                    patch.replacements.forEach(replacement => {
                        sources[id] = sources[id].replace(replacement.match, replacement.replace);
                        coreLogger.info(id, replacement, sources[id]);
                    });
                    hasPatches = true;
                }
            });
        }
    });


    function newModule(...args: any[]) {
        try {
            let bestModule;

            if (hasPatches) {
                bestModule = eval(`// PatchedSourceUwU ${id}\n\n(${sources[id]})\n//# sourceURL=distrust://webpack/${id}`);
            } else {
                bestModule = module;
            }

            return bestModule.apply(this, args);
        } finally {
            for (const listener of listeners) {
                listener.apply(this, args);
            }
        }
    }

    newModule.toString = () => sources[id].toString();
    newModule.original = module;

    modules[id] = newModule;
}

export function waitForModule(filter: (module: WebpackModule) => boolean, options: GetModuleOptions = {}) {
    const cache = Webpack.getModule(filter, options);

    if (cache) { coreLogger.info('found', cache); return Promise.resolve(cache); }
    
    return new Promise(resolve => {
        function listener(module) {
            if (!filter(module)) return;

            listeners.delete(listener);
            resolve(module?.exports?.default ?? cache?.exports?.default);
        }
        listeners.add(listener);
    });
}
webpackChunk.push([
    { some: () => true },
    {},
    (wpr) => {
        if (!wpr.b) return;
        webpackRequire = wpr;

        for (const id in wpr.m) {
            if (!Object.prototype.hasOwnProperty.call(wpr.m, id)) continue;

            patch(wpr.m, id, wpr.m[id]);
        }

        wpr.m = new Proxy(wpr.m, {
            set(target, key, value, r) {
                patch(target, key, value);

                return true;
            }
        });
        startAll();
    }
]);
