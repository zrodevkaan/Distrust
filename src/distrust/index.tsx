﻿import { Logger } from './api/logger';
import { Patcher } from './api/patcher';
import { webpack, modules, common } from "./api/webpack";
import { getExports, plugins, loadCoremods } from "./renderer/managers/plugins";
import { startAll } from "./renderer";
import { proxyCache } from "./api/helpers";
import { injectCSS, uninjectCSS } from "./api/css";

declare global
{
    interface Window
    {
       distrust: any
    }
}

// @ts-ignore
window.distrust = new class Distrust
{
    logger = Logger;
    patcher = Patcher;
    webpack = webpack;
    common = common.modules;
    plugins = { plugins, getExports, proxyCache }
    css = { injectCSS, uninjectCSS }
}

Promise.allSettled([modules.waitForReady, common.waitForReady])
    .then(async () =>
    {
       await loadCoremods()
       startAll()
    })
