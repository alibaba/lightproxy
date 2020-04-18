const path = require('path');
const shell = require('shelljs');
const fs = require('fs');

const {
    TRAVIS_PULL_REQUEST,
    TRAVIS_COMMIT,
    SSH_KEY,
    HOME,
} = process.env;

const commitId = TRAVIS_COMMIT.slice(0, 6);

const RELEASE_DIR = path.join(__dirname, '../release');

console.log('pr', TRAVIS_PULL_REQUEST);

if (TRAVIS_PULL_REQUEST !== 'false') {
    const sshFile = path.join(HOME, './.ssh/id_rsa');
    const sshKeyContent = decodeURIComponent(SSH_KEY);
    fs.writeFileSync(sshFile, sshKeyContent, 'utf-8');
    
    console.log(shell.exec(`cd ${RELEASE_DIR} && scp *.exe xcodebuild@sourceforge.net:/home/frs/project/lightproxy/build/Lightproxy-${commitId}.exe`));
}
console.log('done');
