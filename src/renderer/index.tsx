// Initial welcome page. Delete the following line to remove it.
import React from 'react';
import ReactDOM from 'react-dom';

import * as monaco from '@timkendrick/monaco-editor/dist/external';

// @ts-ignore
window.monaco = monaco;

import { App } from './components/app';

import 'reset-css';
import '@timkendrick/monaco-editor/dist/external/monaco.css';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { i18nResources } from './i18n';
import { remote } from 'electron';

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

ReactDOM.render(<App />, document.getElementById('app'));
