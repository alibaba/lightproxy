import path from 'path';
import { LIGHTPROXY_HOME_PATH, SYSTEM_TYPE } from '../const';
import fs from 'fs-extra-promise';
import hasha from 'hasha';
import { sudoExec } from './utils';
import { debug } from 'electron-log';

const proxyHelperName: Record<typeof SYSTEM_TYPE, string> = {
  MacOS: 'proxy_conf_helper',
  Linux: '',
  Windows: 'win_proxy_helper.exe',
};

// final exec path
const HELPER_PATH = path.join(
  LIGHTPROXY_HOME_PATH,
  './helpers',
  proxyHelperName[SYSTEM_TYPE],
);

// source path is for install
const HELPER_SOURCE_PATH = path.join(
  LIGHTPROXY_HOME_PATH,
  './files',
  proxyHelperName[SYSTEM_TYPE],
);

/**
 * detect proxy helper installed
 */
export async function checkHelperInstalled() {
  // TODO: support linux
  if (SYSTEM_TYPE === 'Linux') {
    return true;
  }

  if (!(await fs.existsAsync(HELPER_PATH))) {
    debug('Proxy helper not existed', HELPER_PATH);
    return false;
  }

  if (SYSTEM_TYPE === 'MacOS') {
    const info = await fs.statAsync(HELPER_PATH);
    // must be root so we can change proxy without dialog in macOS
    if (info.uid !== 0) {
      debug('Proxy helper uid is not 0, but got', info.uid);
      return false;
    }
  }

  const hash = await hasha.fromFile(HELPER_PATH, { algorithm: 'md5' });
  const sourceHash = await hasha.fromFile(HELPER_SOURCE_PATH, {
    algorithm: 'md5',
  });

  if (hash !== sourceHash) {
    debug('Proxy helper hash update', { hash, sourceHash });
    return false;
  }

  return true;
}

export async function installHelper() {
  await fs.mkdirpAsync(path.dirname(HELPER_PATH));
  await fs.copyAsync(HELPER_SOURCE_PATH, HELPER_PATH);
  if (SYSTEM_TYPE === 'MacOS') {
    const chownCmd = `chown root:admin "${HELPER_PATH}" && chmod a+rx+s "${HELPER_PATH}"`;
    await sudoExec(chownCmd);
  }
}
