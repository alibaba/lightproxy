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

    shell.exec('chmod  400 ~/.ssh/id_rsa');

    shell.exec(`cd ${RELEASE_DIR} && mv *.exe Lightproxy-${commitId}.exe && scp -o StrictHostKeyChecking=no Lightproxy-${commitId}.exe xcodebuild@frs.sourceforge.net:/home/frs/project/lightproxy/tempbuild`);
    shell.exec(`cd ${RELEASE_DIR} && mv *.dmg Lightproxy-${commitId}.dmg && scp -o StrictHostKeyChecking=no Lightproxy-${commitId}.dmg xcodebuild@frs.sourceforge.net:/home/frs/project/lightproxy/tempbuild`);

    shell.exec(`curl -s -H "Authorization: token ${BOT_TOKEN}" -X POST -d '{"body": "Thanks for pull request, build for this pr is ready, you can test it with follow urls:\n- [Build for Windows](https://master.dl.sourceforge.net/project/lightproxy/tempbuild/Lightproxy-${commitId}.exe)\n- [Build for macOS](https://master.dl.sourceforge.net/project/lightproxy/tempbuild/Lightproxy-${commitId}.dmg)"}' "https://api.github.com/repos/alibaba/lightproxy/issues/${TRAVIS_PULL_REQUEST}/comments"`);
}
console.log('done');
