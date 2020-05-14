import { remote } from 'electron';
import { USER_SCRIPTS_DIR } from '../../../../const';
import path from 'path';

export function genarateRuleFromUserScripts() {
    const glob = remote.require('glob');
    const scripts = glob.sync(USER_SCRIPTS_DIR + '/*.js');
    const rules = [
        `# ====== generate from lightproxy user-scripts ======\n`,
        `# ${USER_SCRIPTS_DIR}\n`,
        `^user-scripts.lightproxy/*** ${USER_SCRIPTS_DIR}/$1\n`,
    ]
        .concat(
            scripts.map((filepath: string) => {
                const basename = path.basename(filepath);
                const domain = basename.replace(/\.js/, '');
                return `${domain} htmlPrepend://\`<script src="//user-scripts.lightproxy/${basename}"></script>\``;
            }),
        )
        .join('\n');

    return rules;
}
