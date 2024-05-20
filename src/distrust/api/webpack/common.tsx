import {filters, getModule, waitForModule} from "./getters";
import {WebpackModule} from "./modules";

export const modules = {
    flux: null as any,
    react: null as any,
    components:
    {
        Divider: null as any,
        DividerClasses: null as any,
        TextClasses: null as any,
    }, toast: undefined

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

function toast(message: string, kind?: number, options = {}) {
    const toast = getModule(filters.byProps('createToast')).createToast;
    const showToast = getModule(filters.byProps('showToast')).showToast;
    showToast(toast(message, kind));
}

Promise.allSettled([
    new Promise<void>((resolve) => {
        modules.toast = toast;
        resolve();
    }),
    waitForModule((module) => module?.exports?.default?.Store).then((module) => {
        modules.flux = module;
    }),
    waitForModule(filters.byProps('createElement')).then((module) => {
        modules.react = module;
    }),
    waitForModule(filters.byProps('sectionDivider')).then((module) => {
        modules.components.DividerClasses = module;
        modules.components.Divider = function Divider({ style }) {
            return <div className={module.sectionDivider} style={style} />;
        };
    }),
    waitForModule(filters.byProps('text-xs/normal')).then((module) => {
        modules.components.TextClasses = module;
    })
]).then(() => _ready());
