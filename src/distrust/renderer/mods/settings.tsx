import {Patcher} from "../../api/patcher";
import {Logger} from "../../api/logger";
import {TextClasses} from "../../components/Components";
import * as test from "node:test";
import {React} from "../../modules/discordModules";
import {MOD_VERSION} from "../../../consts";

const settingsLogger = new Logger('Settings')
export const pluginName = 'Settings';
export const pluginVersion = '1.0.0';
export const pluginDescription = 'Settings plugin coremod';
export const pluginAuthors = ['kaan'];

export function start()
{
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
    settingsLogger.info("Stopping setting plugin")
}