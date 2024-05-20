import { Logger } from "../../../api/logger";
import { webpack, common } from "../../../api/webpack";
import { Patcher } from "../../../api/patcher";
import { findInTree, proxyCache } from "../../../api/helpers";
import { injectCSS, uninjectCSS } from "../../../api/css";
import {waitForModule} from "../../../api/webpack/getters";
// import './styles.css' will implement later

const Flux = common.modules.flux;

// const URL_REGEX_FIND = /https:\/\/\S+/g;
const PLUGIN_ID_FIND_REGEX = /plugin\/(.*?)\.asar/;
const FIND_ERROR_NUMBER = /invariant=(\d+)&/;
const ReactErrorList =
    "https://raw.githubusercontent.com/facebook/react/v18.2.0/scripts/error-codes/codes.json";
const ReactErrorListFallback =
    "https://raw.githubusercontent.com/facebook/react/v17.0.0/scripts/error-codes/codes.json";
const logger = new Logger("recovery");
let ReactErrors: Record<string, string> | undefined;
const injector = new Patcher('recovery')
let ModalsModule = webpack.getKeys('ConfirmModal')

export const manifest =
    {
        name: 'Recovery',
        version: '1.0.0',
        description: 'Allows people to recover their discord if it crashes',
        authors: ['kaan']
    }

interface ErrorComponentState {
    error: {
        message: string;
        stack: string;
    } | null;
    info: null;
}
interface ErrorScreenClass {
    prototype: {
        render: any;
    };
}
interface ErrorScreenInstance {
    state?: ErrorComponentState;
    setState: (state: ErrorComponentState) => void;
}

interface Modals {
    closeAllModals: any;
}

interface RouteInstance {
    transitionTo: (location: string) => void;
}

const ModalModule = webpack.getKeys<Modals>("openModalLazy")
const RouteModule = webpack.getKeys<RouteInstance>("transitionTo")

function startMainRecovery(): void {
    const log = (reason: string): void => logger.info(reason),
        err = (reason: string): void => logger.error(reason);
    log("Starting main recovery methods.");
    if (!ModalModule) {
        err("Could not find `openModalLazy` Module.");
        return;
    }

    try {
        // I think trying to transition first is a better move.
        // Considering most errors come from patching.
        RouteModule?.transitionTo("/channels/@me");
    } catch {
        err("Failed to transition to '/channels/@me'.");
    }

    try {
        Flux.dispatch({ type: "CONTEXT_MENU_CLOSE" });
    } catch {
        err("ContextMenu's could not be closed.");
    }

    try {
        ModalModule.closeAllModals();
    } catch {
        err("Could not close (most) modals.");
    }

    log("Ended main recovery.");
}
interface TreeNode {
    children: React.ReactElement[];
}
export async function start(): Promise<void> {
    let parser = webpack.getModule(x => x?.exports?.default?.parse)
    injectCSS('recovery',
    `[class*=errorPage] [class*=buttons_] {
      flex-direction: column;
      align-items: center;
    }
    [class*=errorPage] [class*=buttons_] [class*=button__] {
      width: 400px;
      margin: 5px;
    }
    .distrust-recovery-button {
      width: var(--custom-button-button-lg-width);
      height: var(--custom-button-button-lg-height);
      min-width: var(--custom-button-button-lg-width);
      min-height: var(--custom-button-button-lg-height);
      background-color: var(--button-danger-background) !important;
    }
    [class*=errorPage] [class*=scrollbarGhostHairline] {
      white-space: break-spaces;
      width: 80vw;
      text-align: center;
    }`
    );

    const ErrorScreen = await waitForModule((x: any) =>
        x?.exports?.default?.toString()?.includes('.AnalyticEvents.APP_CRASHED')
    ).then((module: any) => module?.default);

    void startErrors();

    injector.after(
        ErrorScreen.prototype,
        'render',
        (instance: ErrorScreenInstance, res: React.ReactElement) => {
            if (!instance.state?.error) return;

            const treeNode = findInTree(res, (x: any) => Boolean(x?.action))?.action as { props: TreeNode };
            if (!treeNode) return;

            const { props: { children } } = treeNode;
            const stackError = instance.state.error.stack;
            const pluginId = stackError.match(PLUGIN_ID_FIND_REGEX);
            /*
            if (pluginId) {
              void disable(pluginId[1]);
              toast.toast(
                `Plugin ${pluginId[1]} has been disabled successfully.`,
                toast.Kind.SUCCESS,
              );
            }
            */

            const invar = stackError.match(FIND_ERROR_NUMBER);
            const errorDetails = invar ? ReactErrors?.[invar[1]] : '';

            children.push(
                <>
                    <ModalsModule.Button
                        className="replugged-recovery-button"
                        onClick={() => {
                            startMainRecovery();
                            instance.setState({ error: null, info: null });
                        }}
                    >
                        Recover Discord
                    </ModalsModule.Button>
                    <div className="recovery-parse">
                        {parser.parse(`\`\`\`${errorDetails}\n\n${stackError}\`\`\``)}
                    </div>
                </>
            );
        }
    );
}

export function stop(): void {
    injector.unpatchAll();
    uninjectCSS('recovery')
}

export async function startErrors(): Promise<void> {
    ReactErrors = await fetch(ReactErrorList)
        .then((response) => response.json())
        .catch(async (error) => {
            logger.error("ReactErrorList Fail:", error);
            return await fetch(ReactErrorListFallback).then((response) => response.json());
        })
        .catch((error) => {
            logger.error("ReactErrorListFallback Fail:", error, "\nFalling back to {}");
            return {};
        });
}
