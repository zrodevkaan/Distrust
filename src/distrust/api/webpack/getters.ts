import { type WebpackModule, listeners, sources, ready as wpReady, wpRequire } from './modules';
import { type Stores } from 'discord-types';
import {FluxStore} from "discord-types/stores";

interface GetModuleOptions {
    all?: boolean;
    raw?: boolean;
}

export const filters = {
    byId: (id: string | number) => (module: WebpackModule): boolean => String(module.id) === String(id),

    /** only searches <module>.exports.default */
    byDefaultProps: (...props: string[]) => (module: WebpackModule): boolean =>
        ['function', 'object'].includes(typeof module?.exports?.default)
        && props.every((prop) => prop in module.exports.default),

    /** only searches <module>.exports */
    byExportsProps: (...props: string[]) => (module: WebpackModule): boolean =>
        typeof module?.exports === 'object'
        && props.every((prop) => prop in module.exports),

    /** searches both <module>.exports and <module>.exports.default */
    byProps: (...props: string[]) => (module: WebpackModule): boolean =>
        filters.byExportsProps(...props)(module) || filters.byDefaultProps(...props)(module),

    byPrototype: (...props: string[]) => (module: WebpackModule): boolean =>
        typeof module?.exports?.prototype === 'object' && props.every(prop => prop in module.exports.prototype),

    byDefaultPrototype: (...props: string[]) => (module: WebpackModule): boolean =>
        ['function', 'object'].includes(typeof module?.exports?.default?.prototype)
        && props.every((prop) => prop in module?.exports?.default?.prototype),

    /** @example
     * ```js
     * const { webpack } = window.distrust;
     *
     * webpack.getModule(
     *      webpack.filters.byFactoryProps(
     *          (module) => module?.exports?.<object-like prop>,
     *          'a',
     *          'b',
     *          // ...
     *      )
     * )
     * // => Module {
     * //     <object-like prop>: {
     * //         a: ...,
     * //         b: ...,
     * //         ...
     * //     }
     * // };
     * ```
     */
    byFactoryProps: (factory: (module: WebpackModule) => Record<string, unknown> | void, ...props: string[]) =>
        (module: WebpackModule) => {
            const res = factory(module);

            return ['function', 'object'].includes(typeof res)
                && props.every((prop) => prop in res);
        },

    bySource: (match: string | RegExp) => (module: WebpackModule): boolean => {
        const source = sources[module.id];
        if (source) {
            return typeof match === 'string' ? source.includes(match) : Boolean(source.match(match));
        }
        return false;
    },
};

export const getModule = <T = any>(filter: (module: WebpackModule) => boolean, options?: GetModuleOptions): T | undefined | null => {
    if (!wpReady) return null;

    const modules = Object.values(wpRequire!.c);
    if (options?.all) {
        const filtered = modules.filter(filter);
        return (options.raw ? filtered : filtered.map(mod => mod?.exports)) as T;
    }

    const module = modules.find(filter);
    return options?.raw ? module : module?.exports;
};

export const getStore = (name: string) => {
    return getModule(x=> x.exports?.ZP?.Store).ZP?.Store.getAll().find((x: FluxStore)=>x.getName() === name)
};

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

export const waitForModule = async <T = any>(filter: (module: WebpackModule) => boolean, options?: Omit<GetModuleOptions, 'all'>): Promise<T | undefined> => {
    const module = getModule(filter);
    if (module) return module;

    return new Promise<T | undefined>(resolve => {
        const listener = (mod: WebpackModule) => {
            if (filter(mod)) {
                resolve((options?.raw ? mod : mod?.exports) as T | undefined);
                listeners.delete(listener);
            }
        };
        listeners.add(listener);
    });
};
