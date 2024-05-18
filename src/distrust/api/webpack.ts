import {sources, waitForModule, webpackRequire} from "./modules";
import {Flux} from "../modules/discordModules";
import {Stores} from "discord-types";

interface GetModuleOptions {
    all?: boolean;
    raw?: boolean;
}

interface WebpackModule {
    exports?: any;
    [key: string]: any;
}

class Webpack {
    getModules(): WebpackModule[] {
        if (!webpackRequire) throw new Error('Webpack not found. How did this even happen ??');
        return Object.values(webpackRequire.c) as WebpackModule[];
    }
    
    waitForModule = waitForModule;

    getLength(): number {
        if (!webpackRequire) throw new Error('Webpack not found');
        return Object.keys(webpackRequire.c).length;
    }

    getModule(
        condition: (module: WebpackModule) => boolean,
        options: GetModuleOptions = {}
    ): any {
        const { all = false, raw = false } = options;
        const modules = this.getModules().filter(condition);
        if (all) return modules;
        const module = modules[0];
        return raw ? module : module?.exports?.default ?? module?.exports;
    }


    getStore(condition: string, options: GetModuleOptions = {}): any {
        const stores = Flux.Store.getAll();
        return stores.find((store: Stores.FluxStore) => store.getName() === condition);
    }

    getKeys(
        props: string | string[],
        options: GetModuleOptions = {}
    ): any {
        const propsArray = Array.isArray(props) ? props : [props];

        const condition = (module: WebpackModule) =>
            module.exports instanceof Object && propsArray.every(prop => prop in module.exports);

        return this.getModule(condition, options);
    }

    getPrototypes(
        props: string | string[],
        options: GetModuleOptions = {}
    ): any {
        const propsArray = Array.isArray(props) ? props : [props];

        const condition = (module: WebpackModule) =>
            module.exports instanceof Object && propsArray.every(prop => prop in module.exports.prototype);

        return this.getModule(condition, options);
    }

    getSource(
        match: string | RegExp,
        options: GetModuleOptions = {}
    ): any {
        const condition = (module: WebpackModule) => {
            const source = sources[module.id];
            if (!source) return false;

            return typeof match === "string" ? source.includes(match) : match.test(source);
        };

        return this.getModule(condition, options);
    }

    getId(
        id: number,
        options: GetModuleOptions = {}
    ): any {
        const condition = (module: WebpackModule) => {
            return module.id === id.toString();
        };

        return this.getModule(condition, options);
    }
}

export default new Webpack();
