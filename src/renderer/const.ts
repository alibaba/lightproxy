import path from 'path';
import { remote } from 'electron';
import electronIsDev from 'electron-is-dev';

export const SYSTEM_IS_MACOS = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

// @ts-ignore
export const ICON_TEMPLATE_PATH = electronIsDev
    ? path.join(remote.getGlobal('__static'), 'iconTemplate.png')
    : path.join(__dirname, 'iconTemplate.png');

export const RULE_STORE_KEY = 'lightproxy-rule';

export const GITHUB_PROJECT_PAGE = 'https://github.com/alibaba/lightproxy';
export const NEW_ISSUE_PAGE = 'https://github.com/alibaba/lightproxy/issues/new';
export const DOCUMENT_URL = 'https://alibaba.github.io/lightproxy/quick-start.html';
