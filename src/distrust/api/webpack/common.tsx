import {filters, waitForModule} from "./getters";
import type React from 'react';

export const modules = {
    ace: null as any,
    flux: null as any,
    react: null as unknown as typeof React,
    components:
    {
        Divider: null as any,
        DividerClasses: null as any,
        TextClasses: null as any,
        FormSwitch: null as any,
        MenuItem: null as any,
        Menu: null as any,
        Switch: null as any,
    },
    dispatcher: null as any,
    toast: null as unknown as (message: string, kind?: number, options?: Record<string, unknown>) => void,
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
        modules.components.Divider = function Divider({ style }: { style: React.CSSProperties })
        {
            return <div className={module.sectionDivider} style={style} />;
        };
    }),

    waitForModule(filters.bySource('xMinYMid meet')).then(module => {
        modules.components.Switch = module.Switch;
    }),

    waitForModule(filters.byProps('dispatch')).then(module => {
        modules.dispatcher = module.default;
    }),

    waitForModule(filters.byProps('FormSwitch')).then((module) =>
    {
        modules.components.FormSwitch = module;
    }),

    waitForModule(filters.byProps('MenuItem')).then((module) =>
    {
        modules.components.MenuItem = module.MenuItem;
    }),

    waitForModule(filters.byProps('Menu')).then((module) =>
    {
        modules.components.Menu = module.Menu;
    }),

    waitForModule(filters.byProps('text-xs/normal')).then((module) =>
    {
        modules.components.TextClasses = module;
    }),

    Promise.all([
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

    new Promise((resolve, reject) => {
        const script = document.createElement('script');

        script.onload = () => {
            resolve(undefined);

            modules.ace = window.ace;
        }
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/ace/1.5.3/ace.js";
        script.id = "aceEditor";

        document.head.appendChild(script);

        setTimeout(() => reject(), 30000);
    }),
]).then(() => _ready());
