import { Rule } from '.';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { remote } from 'electron';
import { CoreAPI } from '../../../../core-api';

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

function setHttps(port: number) {
    const searchParams = new URLSearchParams();
    searchParams.set('clientId', '1');
    searchParams.set('interceptHttpsConnects', '1');
    fetch(`http://127.0.0.1:${port}/cgi-bin/intercept-https-connects`, {
        body: searchParams,
        method: 'post',
    });
}

const electronVersion = Number.parseInt(remote.process.versions.electron);

function disableHttp2(port: number) {
    const searchParams = new URLSearchParams();
    searchParams.set('clientId', '1');
    searchParams.set('enableHttp2', electronVersion >= 8 ? '1' : '0');
    fetch(`http://127.0.0.1:${port}/cgi-bin/enable-http2`, {
        body: searchParams,
        method: 'post',
    });
}

export function syncRuleToWhistle(rules: Rule[], port: number) {
    const settings = CoreAPI.store.get('settings') || {};
    const softwareWhiteList = settings['softwareWhiteList'] === false ? false : true;
    setHttps(port);
    disableHttp2(port);
    const RULE_SPLIT = "\n# ======== Generate by LightProxy, don't modify ========\n";
    const genRuleContent =
        (softwareWhiteList
            ? `
# Daily software white list, can disable in setting
# Alilang
disable://intercept alilang-desktop-client.cn-hangzhou.log.aliyuncs.com s-api.alibaba-inc.com alilang.alibaba-inc.com auth-alilang.alibaba-inc.com mdm-alilang.alibaba-inc.com

# Apple
disable://intercept ***.apple.com *.mzstatic.com *.cdn-apple.com ***.apple-cloudkit.com ***.icloud.com ***.icloud-content.com

# bilibili
disable://intercept txy.live-play.acgvideo.com

# a link 502 which cause macos always popup 'Proxy Authentication Required'
# just return empty
http://lua-sh.hz.ali.com:7070/clu-prod/minitri.flg ()
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

    fetch(`http://127.0.0.1:${port}/cgi-bin/rules/enable-default`, {
        body: searchParams,
        method: 'post',
    });
}
