const path = require('path');
const cp = require('child_process');
const shell = require('shelljs');

const {
    TRAVIS_PULL_REQUEST,
    TRAVIS_COMMIT,
    SSH_KEY,
} = process.env;

const commitId = TRAVIS_COMMIT.slice(0, 6);

const RELEASE_DIR = path.join(__dirname, '../release');

console.log('pr', TRAVIS_PULL_REQUEST);

if (TRAVIS_PULL_REQUEST !== 'false') {
    console.log(shell.exec(`echo ${SSH_KEY} > ~/.ssh/id_rsa`));
    console.log(shell.exec(`cd ${RELEASE_DIR} && scp *.exe xcodebuild@sourceforge.net:/home/frs/project/lightproxy/build/Lightproxy-${commitId}.exe`));
}
console.log('done');
