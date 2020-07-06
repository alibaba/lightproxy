import { Rule } from '.';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { remote } from 'electron';
import { CoreAPI } from '../../../../core-api';
import { WHITELIST_DOMAINS } from '../../../../const';

const MAGIC_RULE_DISABLE_HTTPS = '#LIGHTPROXY_MAGIC_DISABLE_HTTPS#';
const MAGIC_RULE_DISABLE_HTTP2 = '#LIGHTPROXY_MAGIC_DISABLE_HTTP2#';

// some custom extend of whistle
function extendRule(index: number, content: string) {
    const extendContent = content.replace(/`([^]*?)`/g, (match, innerContent, offset) => {
        const dir = path.join(os.tmpdir(), '/lightproxy');
        fs.mkdir(dir, () => {
            // pass
        });
        const target = path.join(dir, index + '-' + offset + '.txt');
        fs.writeFile(target, innerContent, 'utf-8', () => {
            // pass
        });
        return target;
    });
    return extendContent
        .split('\n')
        .map(item => {
            if (item.indexOf('.js') !== -1 || item.indexOf('.css') !== -1) {
                return item + ' resCors://*';
            } else {
                return item;
            }
        })
        .join('\n');
}

function setHttps(port: number, ruleContent: string) {
    const searchParams = new URLSearchParams();
    searchParams.set('clientId', '1');
    searchParams.set('interceptHttpsConnects', ruleContent.indexOf(MAGIC_RULE_DISABLE_HTTPS) !== -1 ? '0' : '1');
    fetch(`http://127.0.0.1:${port}/cgi-bin/intercept-https-connects`, {
        body: searchParams,
        method: 'post',
    });
}

const electronVersion = Number.parseInt(remote.process.versions.electron);

function handleHttp2(port: number, ruleContent: string) {
    const searchParams = new URLSearchParams();
    searchParams.set('clientId', '1');
    let enabled = ruleContent.indexOf(MAGIC_RULE_DISABLE_HTTP2) !== -1 ? '0' : '1';
    if (electronVersion < 8) {
        enabled = '0';
    }
    searchParams.set('enableHttp2', enabled);
    fetch(`http://127.0.0.1:${port}/cgi-bin/enable-http2`, {
        body: searchParams,
        method: 'post',
    });
}

export function syncRuleToWhistle(rules: Rule[], port: number) {
    const settings = CoreAPI.store.get('settings') || {};
    const softwareWhiteList = settings['softwareWhiteList'] === false ? false : true;

    const RULE_SPLIT = "\n# ======== Generate by LightProxy, don't modify ========\n";

    const WHITE_LIST_DOMAIN_STR = WHITELIST_DOMAINS.join(' ');
    const genRuleContent =
        (softwareWhiteList
            ? `
# Daily software white list, can disable in setting
disable://intercept ${WHITE_LIST_DOMAIN_STR}
enable://hide ${WHITE_LIST_DOMAIN_STR}
ignore://*|!enable|!disable ${WHITE_LIST_DOMAIN_STR}
`
            : '') +
        rules
            .filter(item => {
                return item.enabled;
            })
            .map((item, index) => {
                return `# rule name: ${item.name}
        ${extendRule(index, item.content)}
        `;
            })
            .join('\n');

    const searchParams = new URLSearchParams();
    searchParams.set('clientId', 'xxxx');
    searchParams.set('name', 'Default');
    searchParams.set('fixed', 'true');
    searchParams.set('selected', 'true');
    searchParams.set('isDefault', 'true');
    searchParams.set('active', 'true');
    searchParams.set('changed', 'true');
    searchParams.set('value', RULE_SPLIT + genRuleContent);

    setHttps(port, genRuleContent);
    handleHttp2(port, genRuleContent);

    fetch(`http://127.0.0.1:${port}/cgi-bin/rules/enable-default`, {
        body: searchParams,
        method: 'post',
    });
}
