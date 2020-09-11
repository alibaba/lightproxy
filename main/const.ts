import path from 'path';
import { app } from 'electron';

const userData = app.getPath('appData');

export const IS_DEV = process.env.NODE_ENV === 'development';

export const LIGHTPROXY_HOME_PATH = path.join(userData, 'LightProxy');

export const LIGHTPROXY_FILES_PATH = IS_DEV
  ? path.join(__dirname, '../vendor/files')
  : path.join(LIGHTPROXY_HOME_PATH, './files');

export const SYSTEM_TYPE = (() => {
  const opsys = process.platform;
  if (opsys === 'darwin') {
    return 'MacOS';
  } else if (opsys == 'linux') {
    return 'Linux';
  }
  return 'Windows';
})();

export const APP_NAME = 'LightProxy';
export const LIGHTPROXY_ICON_PATH = path.join(
  LIGHTPROXY_FILES_PATH,
  SYSTEM_TYPE === 'MacOS' ? 'icon.icns' : 'icon.png',
);

export const CERT_FILE_NAME = 'root.crt';
export const CERT_KEY_FILE_NAME = 'root.key';
export const CERT_PATH = path.join(LIGHTPROXY_HOME_PATH, 'certificates');
export const CERT_KEY_PATH = path.join(CERT_PATH, CERT_KEY_FILE_NAME);
export const CERT_FILE_PATH = path.join(CERT_PATH, CERT_FILE_NAME);

export const LIGHTPROXY_TEMP_PATH = path.join(LIGHTPROXY_HOME_PATH, 'temp');
