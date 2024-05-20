import { filters, waitForModule } from "./getters";

export const modules = {
    flux: null as any,
    react: null as any,
    components:
    {
        Divider: null as any,
        DividerClasses: null as any,
        TextClasses: null as any,
    },
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

void Promise.allSettled([
    waitForModule((module) => module?.exports?.default?.Store).then((module) => modules.flux = module),
    waitForModule(filters.byProps('createElement')).then((module) => modules.react = module),
    waitForModule(filters.byProps('sectionDivider')).then((module) =>
    {
        modules.components.DividerClasses = module;
        modules.components.Divider = function Divider({ style }: { style?: React.CSSProperties }): React.ReactElement
        {
            return <div className={module.sectionDivider} style={style} />;
        }
    }),
    waitForModule(filters.byProps('text-xs/normal')).then((module) =>
        modules.components.TextClasses = module
    )
]).then(() => _ready())