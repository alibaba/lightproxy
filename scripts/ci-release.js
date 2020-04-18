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

const commitId = TRAVIS_COMMIT.slice(0, 6);

const RELEASE_DIR = path.join(__dirname, '../release');

console.log('pr', TRAVIS_PULL_REQUEST);

if (TRAVIS_PULL_REQUEST !== 'false') {
    const sshFile = path.join(HOME, './.ssh/id_rsa');
    const sshKeyContent = decodeURIComponent(SSH_KEY);
    fs.writeFileSync(sshFile, sshKeyContent, 'utf-8');
    
    console.log(shell.exec(`cd ${RELEASE_DIR} && scp *.exe xcodebuild@frs.sourceforge.net:/home/frs/project/lightproxy/build/Lightproxy-${commitId}.exe`));

    // console.log(`curl -s -H "Authorization: token ${BOT_TOKEN}" -X POST -d '{"body": "Thanks for pull request, build for this pr is ready, you can test it from here"}' "https://api.github.com/repos/alibaba/lightproxy/issues/${TRAVIS_PULL_REQUEST}/comments"`);
}
console.log('done');
