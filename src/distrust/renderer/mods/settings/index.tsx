import {Patcher} from "../../../api/patcher";
import {Logger} from "../../../api/logger";
import {MOD_VERSION} from "../../../../consts";
import { webpack, common } from "../../../api/webpack";
import {TabBar} from "./components/TabBar";
import {injectCSS, uninjectCSS} from "../../../api/css";
import {DistrustIcon} from "./components/Distrust";
import {plugins} from "../../managers/plugins";
import {PluginCard} from "./components/Plugins";
import CustomCSSEditor from "./components/CustomCSS";
import {modules} from "../../../api/webpack/common";
import {themes} from "../../managers/themes";
import {ThemeCard} from "./components/Themes";

const { TextClasses } = common.modules.components;

const settingsLogger = new Logger('Settings')
const injector = new Patcher('settings')

const tabs = [
    {
        id: 1,
        label: 'Plugins',
        element: () => (
            <div>
                {plugins.map(plugin => (
                    !plugin.coremod && <PluginCard key={plugin.id} plugin={plugin}/>
                ))}
            </div>
        )
    },
    {
        id: 2,
        label: 'Themes',
        element: () => (
            <div>
                {themes.map(plugin => (
                    <ThemeCard theme={plugin} />
                ))}
            </div>
        )
    },
    {
        id: 3,
        label: 'Custom CSS',
        element: () => {
            return (
                <CustomCSSEditor/>
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
    }
    .info {
      display: flex;
    }
    h3, p {color: var(--header-primary); margin: 0;}`);

    const settingsPage = await webpack.waitForModule(x=>x?.exports?.default?.prototype?.renderSidebar).then((module) => module?.default)

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