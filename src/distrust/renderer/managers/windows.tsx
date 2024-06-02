import { getKeys, getSource, getStore } from "../../api/webpack/getters";
import { modules } from "../../api/webpack/common";
import { proxyCache } from "../../api/helpers";

const PopoutWindow = proxyCache(() => getSource("{guestWindow:"));
const dispatcher = proxyCache(() => getKeys(["subscribe", "_dispatch"]));
export const PopoutWindowStore = proxyCache(() => getStore("PopoutWindowStore"));

interface OpenWindowOptions {
    id: string,
    render: React.ComponentType<{ window: Window & typeof globalThis }>,
    title: string,
    wrap?: boolean
}

export function openWindow(opts: OpenWindowOptions) {
    const { id, render: Component, title, wrap = true } = opts;

    const windowKey = `DISCORD_DISTRUST_${id}`;

    function Render() {
        const React = modules.react;
        const window = React.useMemo(() => PopoutWindowStore.getWindow(windowKey)!, []);

        if (!wrap) return <Component window={window} />;

        return (
            <PopoutWindow.default
                windowKey={windowKey}
                title={title}
                withTitleBar
            >
                <Component window={window} />
            </PopoutWindow.default>
        );
    };

    dispatcher.default.dispatch({
        type: "POPOUT_WINDOW_OPEN",
        key: windowKey,
        render: () => <Render />,
        features: {
            popout: true
        }
    });

    return () => closeWindow(id);
}

export function isWindowOpen(id: string) {
    return PopoutWindowStore.getWindowOpen(`DISCORD_DISTRUST_${id}`);
}

export function closeWindow(id: string) {
    if (!isWindowOpen(id)) return;

    try { PopoutWindowStore.unmountWindow(`DISCORD_DISTRUST_${id}`); }
    catch (error) { }
}
