import sudo from 'sudo-prompt';
import { LIGHTPROXY_ICON_PATH, APP_NAME } from '../const';
import { debug } from 'electron-log';

export function sudoExec(cmd: string) {
  const options = {
    name: APP_NAME,
    icns: LIGHTPROXY_ICON_PATH,
  };
  return new Promise((resolve, reject) => {
    debug('run with sudo', cmd);
    sudo.exec(cmd, options, (error, stdout, stderr) => {
      debug('result', error, stdout, stderr);
      if (error) reject(error);
      resolve(stdout);
    });
  });
}
