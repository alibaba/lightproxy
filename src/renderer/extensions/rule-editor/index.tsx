import { Extension } from '../../extension';
import React from 'react';
import { RuleList, Rule } from './components/rule-list';
import { remote, Tray } from 'electron';
import { ICON_TEMPLATE_PATH, RULE_STORE_KEY, DOCUMENT_URL, GITHUB_PROJECT_PAGE } from '../../const';
import { CoreAPI } from '../../core-api';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { getWhistlePort, generateHTTPProxyUrl, generateSocksProxyUrl } from '../../utils';

let tray: Tray;
let trayContextMenu;

// dirty translate
let t: TFunction;

async function buildTrayContextMenu() {
    const rules: Rule[] = CoreAPI.store.get(RULE_STORE_KEY) || [];
    const ruleListMenus = rules.map((item, index) => {
        return {
            type: 'checkbox' as 'checkbox',
            label: item.name,
            checked: item.enabled,
            async click() {
                CoreAPI.eventEmmitter.emit('lightproxy-toggle-rule', index);
                // await ipc.callRenderer(mainWindow, 'toggle-rule', item.id);
            },
        };
    });

    const online = CoreAPI.store.get('onlineStatus') === 'online' ? true : false;

    trayContextMenu = remote.Menu.buildFromTemplate([
        {
            type: 'checkbox',
            label: t('System Proxy') + '(Cmd/Ctrl+Shift+L)',
            checked: online,
            async click() {
                CoreAPI.eventEmmitter.emit('lightproxy-toggle-system-proxy');
            },
        },
        { type: 'separator' },
        ...ruleListMenus,
        { type: 'separator' },
        {
            label: t('Document'),
            click() {
                remote.shell.openExternal(DOCUMENT_URL);
            },
        },
        {
            label: t('Copy Proxy Shell Export Line'),
            async click() {
                const port = await getWhistlePort(CoreAPI);

                remote.clipboard.writeText(
                    `export https_proxy=${generateHTTPProxyUrl(port)}
http_proxy=${generateHTTPProxyUrl(port)}
all_proxy=${generateSocksProxyUrl(port)}
`
                        .split('\n')
                        .join(' '),
                );

                new Notification('Proxy shell export copied', {
                    body: t('Proxy shell export copied'),
                });
            },
        },
        {
            label: t('Homepage'),
            click() {
                remote.shell.openExternal(GITHUB_PROJECT_PAGE);
            },
        },
        {
            label: t('Show Window'),
            click() {
                remote.getCurrentWindow().show();
            },
        },
        {
            label: t('Exit App'),
            click() {
                remote.app.quit();
            },
        },
    ]);
    tray.setContextMenu(trayContextMenu);
}

export class RuleEditor extends Extension {
    constructor() {
        super('rule-editor');

        (async () => {
            const image = remote.nativeImage.createFromPath(ICON_TEMPLATE_PATH);
            tray = await new remote.Tray(image);

            tray.on('mouse-move', buildTrayContextMenu);
            tray.on('click', buildTrayContextMenu);
            tray.setToolTip('LightProxy');
        })();
    }

    panelComponent() {
        const saveRules = (rules: Rule[]) => {
            this.coreAPI.store.set(RULE_STORE_KEY, rules);
            this.coreAPI.eventEmmitter.emit('whistle-save-rule', rules);
        };

        const readRules = () => {
            return this.coreAPI.store.get(RULE_STORE_KEY);
        };

        return function RuleEditorPanelComponent() {
            t = useTranslation().t;
            return <RuleList saveRules={saveRules} readRules={readRules} />;
        };
    }

    panelIcon() {
        return 'unordered-list';
    }

    panelTitle() {
        return 'Rule';
    }

    keepAlive(): boolean {
        return true;
    }
}
