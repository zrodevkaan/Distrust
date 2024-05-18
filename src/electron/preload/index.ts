import { webFrame } from "electron/renderer";
import { readFileSync } from "fs";
import { join } from "path";
import {MOD_NAME} from '../../consts';

const ogPreload = process.env.DISCORD_PRELOADER;
if (ogPreload) require(ogPreload);

void webFrame.executeJavaScript(readFileSync(join(__dirname, `${MOD_NAME}.min.js`), { encoding: "utf8" }) + `\n//# sourceURL=distrust://webpack/${MOD_NAME}.js`);