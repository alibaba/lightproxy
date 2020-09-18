const fs = require('fs');
const path = require('path');
const os = require('os');

const systemType = os.type();
const SYSTEM_IS_MACOS = systemType === 'Darwin';

if (SYSTEM_IS_MACOS) {
    fs.unlinkSync(path.join(__dirname, '../vendor/files/node/node-win.exe'));
} else {
    fs.unlinkSync(path.join(__dirname, '../vendor/files/node/node-mac'));
}
