import {proxyCache} from "../api/helpers";
import Webpack from "../api/webpack";
import {React} from "../modules/discordModules";

export const DividerClasses = proxyCache(() => Webpack.getKeys('sectionDivider'));
export const TextClasses = proxyCache(() => Webpack.getKeys('text-xs/normal'));

interface DividerProps {
    style?: React.CSSProperties;
}
export function Divider({ style }: DividerProps): React.ReactElement {
    return <div className={DividerClasses.sectionDivider} style={style} />;
}