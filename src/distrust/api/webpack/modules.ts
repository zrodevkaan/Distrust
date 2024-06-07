import { WebpackInstance } from "discord-types/other";
import { plaintextPatches } from '../../renderer/managers/plugins';
import { coreLogger } from "../../devConsts";

export interface WebpackModule extends Omit<Parameters<WebpackInstance['m']>[0], 'id'>
{
    id: string | number;
}

type WebpackChunk =
[
    name: [string | symbol],
    modules: Record<
        string | number,
        (module: WebpackModule, exports: Record<string, unknown>, wpRequire: WebpackInstance) => void
    >,
    ((r: WebpackInstance) => void)?
]

interface WebpackInstanceModules
{
    (e: WebpackModule, exports: Record<string, unknown>, wpRequire: WebpackInstance): void
    [key: string | number]: WebpackChunk[1][keyof WebpackChunk[1]]
}

declare global
{
    interface Window
    {
        webpackChunkdiscord_app: WebpackChunk[]
    }
}

let _ready: () => void;

export let ready = false;

export const waitForReady = new Promise((r) =>
{
    _ready = () =>
    {
        r(undefined);
        ready = true;
    }
});

export const sources: Record<string | number, string> = {};
const wpChunk = window.webpackChunkdiscord_app ??= [];

export let wpRequire: WebpackInstance | undefined;

export const listeners = new Set<(this: any, ...args: Parameters<WebpackChunk[1][keyof WebpackChunk[1]]>) => void>()
const patchPlaintext = (modules: WebpackChunk[1], id: string | number, module: WebpackChunk[1][keyof WebpackChunk[1]]): void =>
{
    const original = module.toString();
    sources[id] = original;

    let hasPatches = false;
    let newMod: any = module;

    plaintextPatches.forEach((plaintexts) =>
    {
        if (Array.isArray(plaintexts))
        {
            const source = sources[id];

            plaintexts.forEach((patch) =>
            {
                let matched = false;

                if (typeof patch.find === 'string')
                    matched = source.includes(patch.find);
                else {
                    matched = Boolean(source.match(patch.find));
                }

                if (matched)
                {
                    patch.replacements.forEach((replacement) =>
                    {
                        if (typeof replacement === 'function')
                            sources[id] = replacement(sources[id]) || sources[id];
                        else
                            sources[id] = sources[id].replace(replacement.match, replacement.replace);

                        // for logging. coreLogger.info('Plaintext patched', id, replacement, sources[id])
                    });

                    hasPatches = true;
                }
            })
        }
    })

    try
    {
        newMod = hasPatches
            ? (0, eval)(
                `// PatchedSource ${id}\n\n(${sources[id]})\n//# sourceURL=distrust://distrust/webpack/${id}`
            )
            : module;
    }
    catch (e)
    {
        coreLogger.error(
            `failed to apply plaintext patch for module "${id}"\n`,
            e,
            '\n',
            { patched: sources[id], original },
        );

        sources[id] = original;
    }

    function newModule(this: any, ...args: Parameters<WebpackChunk[1][keyof WebpackChunk[1]]>): void
    {
        try
        {
            return newMod.apply(this, args);
        }
        finally
        {
            for (const listener of listeners) listener.apply(this, args);
        }
    }

    newModule.toString = () => sources[id].toString();
    newModule.original = module;

    modules[id] = newModule;
}

wpChunk.push([
    [Symbol('distrust')],
    {},
    (r) =>
    {
        if (!r.b) return;

        wpRequire = r;

        r.d = (target: object, exports: object) => {
            for (const key in exports) {
                //if (!Reflect.has(exports, key)) continue;

                Object.defineProperty(target, key, {
                    get() { // @ts-ignore
                        return exports[key]() },
                    set(v) { // @ts-ignore
                        exports[key] = () => v; },
                    enumerable: true,
                    configurable: true
                });
            }
        };
        
        for (const id in r.m)
            if (Object.hasOwn(r.m, id))
                patchPlaintext(r.m as WebpackInstanceModules, id, (r.m as WebpackInstanceModules)[id]);
        
        r.m = new Proxy(r.m, {
            set(target, key, value)
            {
                patchPlaintext(target as WebpackInstanceModules, key as string, value);
                return true;
            }
        })

        _ready();
    }
])