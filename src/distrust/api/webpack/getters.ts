import { type WebpackModule, listeners, sources, ready as wpReady, wpRequire } from './modules'
import { type Stores } from 'discord-types';

interface GetModuleOptions
{
    all?: boolean;
    raw?: boolean;
}

export const filters =
{
    byId: (id: string | number) => (module: WebpackModule): boolean => String(module.id) === String(id),

    /** only searches <module>.exports.default */
    byDefaultProps: (...props: string[]) => (module: WebpackModule): boolean =>
    {
        const _default = module?.exports?.default;

        return _default && props.every((prop) => prop in _default);
    },

    /** only searches <module>.exports */
    byExportsProps: (...props: string[]) => (module: WebpackModule): boolean =>
    {
        const exports = module?.exports;

        return typeof exports === 'object' && props.every((prop) => prop in exports);
    },

    /** searches both <module>.exports and <module>.exports.default */
    byProps: (...props: string[]) => (module: WebpackModule): boolean =>
        filters.byExportsProps(...props)(module)
        || filters.byDefaultProps(...props)(module),

    byPrototype: (...props: string[]) => (module: WebpackModule): boolean =>
        typeof module?.exports?.prototype === 'object' && props.every((prop) => prop in module.exports.prototype),

    bySource: (match: string | RegExp) => (module: WebpackModule): boolean =>
    {
        const source = sources[module.id];

        if (source)
        {
            if (typeof match === 'string')
                return source.includes(match)

            return Boolean(source.match(match))
        }

        return false;
    },

    byStoreName: (name: string) => (module: WebpackModule): boolean => module?.exports?.default?.getName?.() === name,
}

export const getModule = <T = any>(filter: (module: WebpackModule) => boolean, options?: GetModuleOptions): T | undefined | null =>
{
    if (wpReady)
    {
        const modules = Object.values(wpRequire!.c);

        if (options?.all)
        {
            const filtered = Object.values(wpRequire!.c).filter(filter)

            return (options?.raw ? filtered : filtered.map((mod) => mod?.exports)) as T
        }

        const module = modules.find(filter);

        return options?.raw ? module : module?.exports;
    }

    return null
}

export const getStore = <T = any>(name: string) =>
{
    const store = getModule<T>(filters.byStoreName(name))

    if (store === null) return store

    return (store as any)?.default
}

/** @deprecated use getModule in combination with filters.byProps */
export const getKeys = <T = any>(props: string | string[], options?: GetModuleOptions) =>
    getModule<T>(filters.byProps(...(Array.isArray(props) ? props : [props])), options);

/** @deprecated use getModule in combination with filters.byId */
export const getId = <T = any>(id: string | number, options?: GetModuleOptions) =>
    getModule<T>(filters.byId(id), options);

/** @deprecated use getModule in combination with filters.bySource */
export const getSource = <T = any>(match: string | RegExp, options?: GetModuleOptions) =>
    getModule<T>(filters.bySource(match), options);

/** @deprecated use getModule in combination with filters.byPrototype */
export const getPrototypes = <T = any>(props: string | string[], options?: GetModuleOptions) =>
    getModule<T>(filters.byPrototype(...(Array.isArray(props) ? props : [props])), options);

export const waitForModule = async <T = any>(filter: (module: WebpackModule) => boolean, options?: Omit<GetModuleOptions, 'all'>): Promise<T | undefined> =>
{
    const module = getModule(filter)

    if (!module)
        return new Promise<T | undefined>((r) =>
        {
            listeners.add(function listener(mod)
            {
                if (filter(mod))
                {
                    r((options?.raw ? mod : mod?.exports) as T | undefined)
                    listeners.delete(listener)
                }
            })
        })

    return module;
}
