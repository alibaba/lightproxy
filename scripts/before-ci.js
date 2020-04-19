const path = require('path');
const shell = require('shelljs');
const fs = require('fs');

const {
    TRAVIS_PULL_REQUEST,
    TRAVIS_COMMIT,
    SSH_KEY,
    HOME,
    BOT_TOKEN,
} = process.env;

// 仅 PR 修改成 testing 版本
if (TRAVIS_PULL_REQUEST !== 'false') {
    const packagePath = path.join(__dirname, '../package.json');

    const info = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    info.name = 'LightProxyTesting';
    info.version = info.version + `-testing-${TRAVIS_COMMIT}`;
    
    fs.writeFileSync(packagePath, JSON.stringify(info), 'utf-8');
}
