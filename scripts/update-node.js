const fs = require('fs');
const path = require('path');
const os = require('os');
const shell = require('shelljs');

const systemType = os.type();
const SYSTEM_IS_MACOS = systemType === 'Darwin';

if (SYSTEM_IS_MACOS) {
    shell.exec(`cd vendor/files/node && curl https://cdn.npm.taobao.org/dist/node/v14.9.0/node-v14.9.0-darwin-x64.tar.gz| tar -xz && mv node-*-darwin-x64/bin/node node-mac && rm -rf node-*-darwin-x64`);
} else {
    shell.exec(`cd vendor/files/node && curl https://cdn.npm.taobao.org/dist/node/v14.9.0/win-x86/node.exe > node-win.exe`)
}
