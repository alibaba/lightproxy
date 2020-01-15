// Initial welcome page. Delete the following line to remove it.
import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { remote } from 'electron';
import * as monaco from '@timkendrick/monaco-editor/dist/external';
import '@timkendrick/monaco-editor/dist/external/monaco.css';
import 'reset-css';

import { App } from './components/app';
import { i18nResources } from './i18n';

// @ts-ignore
window.monaco = monaco;

i18n.use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources: i18nResources,
        lng: navigator.language,
        fallbackLng: 'en',

        interpolation: {
            escapeValue: false,
        },
    });

if (remote.nativeTheme.shouldUseDarkColors) {
    require('./style/theme/dark.less');
} else {
    require('./style/theme/default.less');
}

ReactDOM.render(
    <AppContainer>
        <App />
    </AppContainer>,
    document.getElementById('app'),
);
