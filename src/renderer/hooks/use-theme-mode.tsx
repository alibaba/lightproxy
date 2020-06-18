/* eslint-disable react/prop-types */
import React, { useEffect, useState, useContext } from 'react';
import { CoreAPI } from '../core-api';

import darkTheme from '../style/theme/dark.lazy.less';
import defaultTheme from '../style/theme/default.lazy.less';

export enum ThemeModeEnum {
    Dark,
    Light,
}

const ThemeContext = React.createContext({
    themeMode: ThemeModeEnum.Light,
});

export function useThemeModeProvider(initialMode: ThemeModeEnum = ThemeModeEnum.Light) {
    const ThemeModeProvider: React.SFC = ({ children }) => {
        const [themeMode, setThemeMode] = useState(initialMode);

        useEffect(() => {
            // style-loader use/unuse: https://webpack.js.org/loaders/style-loader/#lazystyletag
            const applyThemeModeStyle = (isDarkMode: boolean) => {
                if (isDarkMode) {
                    darkTheme.use();
                    defaultTheme.unuse();
                } else {
                    defaultTheme.use();
                    darkTheme.unuse();
                }
                setThemeMode(isDarkMode ? ThemeModeEnum.Dark : ThemeModeEnum.Light);
            };

            applyThemeModeStyle(initialMode !== ThemeModeEnum.Light);
            CoreAPI.checkDarkMode(applyThemeModeStyle);
        }, []);
        return <ThemeContext.Provider value={{ themeMode }}>{children}</ThemeContext.Provider>;
    };

    return ThemeModeProvider;
}

export function useThemeMode() {
    const { themeMode } = useContext(ThemeContext);
    const isDarkMode = themeMode === ThemeModeEnum.Dark;
    const isLightMode = themeMode === ThemeModeEnum.Light;

    return {
        themeMode,
        isDarkMode,
        isLightMode,
    };
}
