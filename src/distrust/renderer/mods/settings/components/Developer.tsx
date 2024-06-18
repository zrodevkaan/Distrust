import { getKeys } from "../../../../api/webpack/getters";
import {getInnerCSS, injectCSS} from "../../../../api/css";
import CustomCSSEditor from "./CustomCSS";
import { modules } from '../../../../api/webpack/common';
import {coreLogger, generalSettings} from "../../../../devConsts";
import { SetStateAction } from "react";

const {react: React, components: {Switch}} = modules

export const DeveloperMenu = () => {
    const [customCss, setCustomCss] = React.useState('');

    React.useEffect(() => {
        setCustomCss(getInnerCSS('settings'))
    })

    const handleUpdateCSS = (newCss: SetStateAction<string>) => {
        setCustomCss(newCss);
    };

    return (
        <>
            <span className={'warning-css'}>
                I should probably warn you that modifying any CSS below and mess up your settings and editor settings. So please don't modify any css below if you DON'T know what you are doing
            </span>
            <CustomCSSEditor settingName={'settings'} onUpdateCSS={handleUpdateCSS} startingValue={getInnerCSS('settings')} />
        </>
    );
};

export const DeveloperTab = () => {
    const [isDeveloper, setIsDeveloper] = React.useState(null);

    React.useEffect(() => {
        const checkDeveloperStatus = async () => {
            const isDev = await generalSettings.get('developer');
            setIsDeveloper(isDev);
        };

        void checkDeveloperStatus();
    }, []);

    if (isDeveloper === null) {
        return <span>Loading...</span>;
    }

    return isDeveloper ? <DeveloperMenu /> : <span className={'warning-css'}>You are NOT a developer. I know you are curious but this can cause setting issues if you end up messing something up in here</span>;
};