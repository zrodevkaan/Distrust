import {Patcher} from "../../api/patcher";
import {Logger} from "../../api/logger";
import {TextClasses} from "../../components/Components";
import * as test from "node:test";
import {React} from "../../modules/discordModules";
import {MOD_VERSION} from "../../../consts";
import Webpack from "../../api/webpack";
import {waitForModule} from "../../api/modules";
import {proxyCache} from "../../api/helpers";
import {TabBar} from "../../components/TabBar";
import {injectCSS, uninjectCSS} from "../../api/css";
import {DistrustIcon} from "../../components/Distrust";
import {plugins} from "../managers/plugins";
import {PluginCard} from "../../components/Plugins";

const settingsLogger = new Logger('Settings')
const injector = new Patcher('settings')

export const manifest =
    {
        name: 'Settings',
        version: '1.0.0',
        description: 'settings plugin coremod ;3',
        authors: ['kaan']
    }

const tabs = [
    {
        id: 1,
        label: 'Test',
        element: () => (<div>Test Content</div>)
    },
    {
        id: 2,
        label: 'Test',
        element: () => (<div>Test Content</div>)
    },
    {
        id: 3,
        label: 'Plugins',
        element: () => (
            <div>
                {plugins.map(plugin => (
                    <PluginCard plugin={plugin} />
                ))}
            </div>
        )
    }
];

export default tabs;


export async function start() {
    injectCSS('settings', `
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
    h3, p {color: var(--header-primary); margin: 0;}`)
    const settingsPage = await waitForModule(x=>x?.exports?.default?.prototype?.renderSidebar)
    injector.after(settingsPage?.prototype,'getPredicateSections', (args,b,c) => {
        console.log(args, b,c)
        b.unshift({section: "client-mod-page", label: 'uwu', element: () => <div> <TabBar tabs={tabs}/> </div>, icon: () => DistrustIcon})
    })
    settingsLogger.info("Starting setting plugin")
}

export function VersionInfo(): React.ReactElement {
    return (
        <span className={TextClasses['text-xs/normal']} style={{ color: 'var(--text-muted)' }}>
            distrust ({MOD_VERSION})
        </span>
    );
}

export const patches = [
    {
        find: ".versionHash",
        replacements: [
            {
                match: /appArch,children:.{0,200}?className:\w+\.line,.{0,100}children:\w+}\):null/,
                replace: `$&,distrust.plugins.getExports('settings').VersionInfo()`,
            },
        ],
    }
];


export function stop()
{
    uninjectCSS('settings')
    settingsLogger.info("Stopping setting plugin")
}