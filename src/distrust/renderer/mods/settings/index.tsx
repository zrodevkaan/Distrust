﻿import {Patcher} from "../../../api/patcher";
import {Logger} from "../../../api/logger";
import {MOD_VERSION} from "../../../../consts";
import { webpack, common } from "../../../api/webpack";
import {TabBar} from "./components/TabBar";
import {injectCSS, uninjectCSS} from "../../../api/css";
import {DistrustIcon} from "./components/Distrust";
import {plugins} from "../../managers/plugins";
import {PluginCard} from "./components/Plugins";
import CustomCSSEditor from "./components/CustomCSS";
import {themes} from "../../managers/themes";
import {ThemeCard} from "./components/Themes";
import {DeveloperTab} from "./components/Developer";
import {getKeys} from "../../../api/webpack/getters";

const { TextClasses } = common.modules.components;
const Modals = getKeys('Anchor');

const settingsLogger = new Logger('Settings')
const injector = new Patcher('settings')

const tabs = [
    {
        id: 1,
        label: 'Plugins',
        element: () => (
            <div>
                <div className={'card'}>
                    <Modals.Button onClick={() => window.DistrustNative.utils.openExplorer(window.DistrustNative.locations.plugins)}>
                        Open Plugins
                    </Modals.Button>
                </div>
                {plugins.map(plugin => (
                    !plugin.coremod && <PluginCard plugin={plugin}/>
                ))}
            </div>
        )
    },
    {
        id: 2,
        label: 'Themes',
        element: () => (
            <div>
                <div className={'card'}>
                    <Modals.Button
                        onClick={() => window.DistrustNative.utils.openExplorer(window.DistrustNative.locations.plugins)}>
                        Open Themes
                    </Modals.Button>
                </div>
                {themes.map(plugin => (
                    <ThemeCard theme={plugin}/>
                ))}
            </div>
        )
    },
    {
        id: 3,
        label: 'Custom CSS',
        element: () => {
            return (
                <>
                    <div className={'card'}>
                        <Modals.Button
                            onClick={() => window.DistrustNative.utils.openExplorer(window.DistrustNative.locations.settings)}>
                            Open Settings
                        </Modals.Button>
                    </div>
                    <CustomCSSEditor settingName={'customCss'}/>
                </>
        )
        }
    },
    {
        id: 4,
        label: 'Developer',
        element: () => {
            return (
                <DeveloperTab/>
            )
        }
    }


];

export default tabs;


export const start = async () =>
{
    injectCSS('settings', `
    .editor-container {
      width: 900px;
      height: 540px;
      margin: 20px auto;
      position: relative;
    }

    .small-text {
        color: var(--header-secondary);
        font-size: 12px;
    }

    #editor {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      height: 100%;
      width: 100%;
      font-size: 20px;
    }

    .warning-css  {
      display: block;
      color: red;
      text-align: center;
      font-size: 20px;
    }

    .channelTabBarItem {
      margin-right: 10px;
      padding: 5px 10px;
      cursor: pointer;
      color: white;
      background: transparent;
      position: relative;
    }

    .highlight {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 5px;
      background-color: transparent;
    }

    .channelTabBarItem.selected {
      background-color: transparent;
    }

    .card {
      background-color: var(--background-secondary);
      padding: 9px;
      margin: 3px;
      border-radius: 9px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .topper {
      background-color: var(--background-secondary-alt);
      padding: 10px;
      display: grid;
      grid-template-columns: min-content min-content min-content auto;
      border-top-left-radius: 9px;
      border-top-right-radius: 9px;
      width: 100%;
      align-items: flex-end;
    }
    .topper h3, .topper .small-text {width: max-content; padding: 5px}
    .distrust-switch {justify-self: end;}
    .description {padding: 5px 5px 5px 15px}
    .info {
      display: flex;
      justify-content: space-between;
      width: 100%;
      align-items: center;
      margin-top: 10px;
    }

    h3, p {
      color: var(--header-primary);
      margin: 0;
    }

    .plugin-icon {
      width: 30px;
      height: 30px;
      border-radius: 5px;
    }

    .actions {
      display: flex;
      gap: 5px;
    }
`);

    const settingsPage = await webpack.waitForModule(webpack.filters.byDefaultPrototype('renderSidebar')).then((module) => module?.default)

    injector.after(settingsPage?.prototype,'getPredicateSections', (args,b,c) =>
    {
        b.unshift({ariaLabel: 'uwu', section: "client-mod-page", label: 'Distrust', element: () => <div> <TabBar tabs={tabs}/> </div>, icon: DistrustIcon()})
    });

    settingsLogger.info("Starting setting plugin");
};

export const VersionInfo = (): React.ReactElement =>
{
    return (
        <span className={TextClasses['text-xs/normal']} style={{ color: 'var(--text-muted)' }}>
            distrust ({MOD_VERSION})
        </span>
    );
}

export const stop = () =>
{
    uninjectCSS('settings');
    settingsLogger.info("Stopping setting plugin");
}