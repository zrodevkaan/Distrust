import { filters, getModule, waitForModule } from "./getters";
import { WebpackModule } from "./modules";

export const modules = {
    flux: null as any,
    react: null as any,
    components:
    {
        Divider: null as any,
        DividerClasses: null as any,
        TextClasses: null as any,
    },
    toast: null as (message: string, kind?: number, options?: Record<string, unknown>) => void,
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
})

Promise.allSettled([
    waitForModule(filters.byDefaultProps('Store')).then((module) =>
    {
        modules.flux = module;
    }),

    waitForModule(filters.byProps('createElement')).then((module) =>
    {
        modules.react = module;
    }),

    waitForModule(filters.byProps('sectionDivider')).then((module) =>
    {
        modules.components.DividerClasses = module;
        modules.components.Divider = function Divider({ style })
        {
            return <div className={module.sectionDivider} style={style} />;
        };
    }),

    waitForModule(filters.byProps('text-xs/normal')).then((module) =>
    {
        modules.components.TextClasses = module;
    }),

    Promise.allSettled([
        waitForModule(filters.byProps('createToast')),
        waitForModule(filters.byProps('showToast')),
    ]).then(([createToastModule, showToastModule]): void =>
    {
        modules.toast = (message: string, kind?: number, options = {}): void =>
        {
            showToastModule?.showToast?.(
                createToastModule?.createToast?.(message, kind),
            );
        };
    }),
]).then(() => _ready());
