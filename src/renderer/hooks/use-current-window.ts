import React, { useState, useEffect } from 'react';
import { remote } from 'electron';

function useCurrentWindow() {
    const currentWindow = remote.getCurrentWindow();

    const close = () => currentWindow.hide();
    const minimize = () => currentWindow.minimize();
    const maximize = () => currentWindow.maximize();
    const fullScreen = () => currentWindow.setFullScreen(!currentWindow.isFullScreen());

    return {
        current: currentWindow,
        close,
        minimize,
        maximize,
        fullScreen,
    };
}

export default useCurrentWindow;
