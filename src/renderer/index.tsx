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

import 'electron-disable-file-drop';
import logger from 'electron-log';

// @ts-ignore
window.monaco = monaco;

// make links open in external browser, for example monaco
// @ts-ignore
window.open = function(url: string) {
    if (url) {
        remote.shell.openExternal(url);
    } else {
        // tab = window.open()
        // tab.location.href = '';
        // hack for this
        return {
            location: {
                set href(url: string) {
                    remote.shell.openExternal(url);
                },
                get href() {
                    return '';
                },
            },
        };
    }
};

i18n.use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources: i18nResources,
        lng: navigator.language,
        fallbackLng: 'en',

        interpolation: {
            escapeValue: false,
        },
    });

ReactDOM.render(
    <AppContainer>
        <App />
    </AppContainer>,
    document.getElementById('app'),
);

// fade in
window.onload = () => {
    logger.log('Window onload');
    const currentWindow = remote.getCurrentWindow();

    const totalSteps = 20.0;
    const totalTime = 400.0;

    let currentOpacity = currentWindow.getOpacity();

    const timerID = setInterval(() => {
        currentOpacity = currentOpacity + 1.0 / totalSteps;
        currentWindow.setOpacity(currentOpacity);
        if (currentOpacity > 1.0) {
            clearInterval(timerID);
        }
    }, totalTime / totalSteps);
};
