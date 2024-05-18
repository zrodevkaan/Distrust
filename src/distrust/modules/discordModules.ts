import Webpack from "../api/webpack";
import {proxyCache} from "../api/helpers";

export const Flux = proxyCache(() => Webpack.getModule(x=>x?.exports?.default?.Store));
export const React = proxyCache(() => Webpack.getModule(x=>x?.exports?.createElement));

export const Components = proxyCache(() => Webpack.getKeys(''));
