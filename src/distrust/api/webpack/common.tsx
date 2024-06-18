import { filters, waitForModule } from "./getters";
import { coreLogger } from "../../devConsts";

export const modules = {
    ace: null as any,
    flux: null as any,
    react: null as any,
    components: {
        Divider: null as any,
        DividerClasses: null as any,
        TextClasses: null as any,
        FormSwitch: null as any,
        Menu: null as any,
        Switch: null as any,
    },
    dispatcher: null as any,
    toast: null as unknown as (message: string, kind?: number, options?: Record<string, unknown>) => void,
};

let _ready: () => void;

export let ready = false;

export const waitForReady = new Promise((r) => {
    _ready = () => {
        r(undefined);
        ready = true;
    };
});

const modulePromises = [
    {
        name: 'flux',
        filters: [(x: any) => x.exports?.ZP?.Store],
        handler: (module: any) => modules.flux = module.ZP
    },
    {
        name: 'react',
        filters: [filters.byProps('createElement')],
        handler: (module: any) => modules.react = module
    },
    {
        name: 'DividerClasses',
        filters: [filters.byProps('sectionDivider')],
        handler: (module: any) => {
            modules.components.DividerClasses = module;
            modules.components.Divider = function Divider({ style }: { style: React.CSSProperties }) {
                return <div className={module.sectionDivider} style={style} />;
            };
        }
    },
    {
        name: 'Switch',
        filters: [filters.bySource('xMinYMid meet')],
        handler: (module: any) => modules.components.Switch = module.r
    },
    {
        name: 'dispatcher',
        filters: [(x: any) => x.exports?.Z?.dispatch],
        handler: (module: any) => modules.dispatcher = module.Z
    },
    {
        name: 'FormSwitch',
        filters: [filters.byProps('FormSwitch')],
        handler: (module: any) => modules.components.FormSwitch = module
    },
    {
        name: 'Menu',
        filters: [filters.byProps('Menu')],
        handler: (module: any) => modules.components.Menu = module.Menu
    },
    {
        name: 'TextClasses',
        filters: [filters.byProps('text-xs/normal')],
        handler: (module: any) => modules.components.TextClasses = module
    },
    {
        name: 'toast',
        filters: [filters.byProps('createToast'), filters.byProps('showToast')],
        handler: ([createToastModule, showToastModule]: [any, any]) => {
            modules.toast = (message: string, kind?: number): void => {
                showToastModule?.showToast?.(
                    createToastModule?.createToast?.(message, kind)
                );
            };
        }
    },
];

const loadModule = async (name: string, filters: any[], handler: any) => {
    try {
        const modules = await Promise.all(filters.map(filter => waitForModule(filter)));
        handler(modules.length === 1 ? modules[0] : modules);
        coreLogger.info(`${name} module was found.`);
    } catch {
        coreLogger.info(`${name} module wasn't found.`);
        modules[name] = "N/A";
    }
};

const loadAceScript = new Promise((resolve, reject) => {
    const script = document.createElement('script');

    script.onload = () => {
        resolve(undefined);
        modules.ace = window.ace;
    };
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/ace/1.5.3/ace.js";
    script.id = "aceEditor";

    document.head.appendChild(script);

    setTimeout(() => reject(), 30000);
});

const loadModules = async () => {
    await Promise.allSettled(modulePromises.map(({ name, filters, handler }) =>
        loadModule(name, filters, handler)
    ));
    return _ready();
};

Promise.all([loadModules(), loadAceScript]).then(() => _ready());
