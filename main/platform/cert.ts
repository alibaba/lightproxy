import path from 'path';
import {
  LIGHTPROXY_HOME_PATH,
  SYSTEM_TYPE,
  CERT_KEY_PATH,
  CERT_PATH,
  CERT_FILE_PATH,
  LIGHTPROXY_TEMP_PATH,
  CERT_KEY_FILE_NAME,
  CERT_FILE_NAME,
} from '../const';
import fs from 'fs-extra-promise';
import { sudoExec, asyncExec } from './utils';
import { debug } from 'electron-log';
import forge from 'node-forge';

const pki = forge.pki;

const LIGHTPROXY_CERT_NAME_PREFIX = 'LightProxyNG-';

/**
 * detect cert installed
 */
export async function checkCertInstalled() {
  if (!(await fs.existsAsync(CERT_KEY_PATH))) {
    debug('cert not existed', CERT_KEY_PATH);
    return false;
  }

  const { ctimeMs } = await fs.statAsync(CERT_KEY_PATH);

  // expire at 11 month(cert expire in 1 year in fact)
  const expireTime = ctimeMs + 11 * 30 * 24 * 60 * 60 * 1000;
  const currentTime = Date.now();
  debug({ ctimeMs, expireTime, currentTime });

  return currentTime < expireTime;
}

async function generateCert(): Promise<{ key: string; cert: string }> {
  return new Promise((resolve) => {
    const keys = pki.rsa.generateKeyPair(2048);
    const cert = pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = new Date().getTime() + '';
    cert.validity.notBefore = new Date();
    cert.validity.notBefore.setFullYear(
      cert.validity.notBefore.getFullYear() - 10,
    );
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(
      cert.validity.notAfter.getFullYear() + 10,
    );

    const attrs = [
      {
        name: 'commonName',
        value:
          LIGHTPROXY_CERT_NAME_PREFIX + new Date().toISOString().slice(0, 10),
      },
      {
        name: 'countryName',
        value: 'CN',
      },
      {
        shortName: 'ST',
        value: 'Hangzhou',
      },
      {
        name: 'localityName',
        value: 'Hangzhou',
      },
      {
        name: 'organizationName',
        value: 'LightProxy',
      },
      {
        shortName: 'OU',
        value: 'https://github.com/alibaba/lightproxy',
      },
    ];

    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.setExtensions([
      {
        name: 'basicConstraints',
        critical: true,
        cA: true,
      },
      {
        name: 'keyUsage',
        critical: true,
        keyCertSign: true,
      },
      {
        name: 'subjectKeyIdentifier',
      },
    ]);
    cert.sign(keys.privateKey, forge.md.sha256.create());
    const certPem = pki.certificateToPem(cert);
    const keyPem = pki.privateKeyToPem(keys.privateKey);

    resolve({
      key: keyPem,
      cert: certPem,
    });
  });
}

// remove all lightproxy related cert
async function generateCleanCertCmd(): Promise<string> {
  if (SYSTEM_TYPE === 'MacOS') {
    const cmd = `security find-certificate -a`;
    const output = await asyncExec(cmd);
    const certList = Array.from(output.matchAll(/"alis"<blob>="(.*?)"/g) || [])
      .map((item) => item[1])
      .filter((item) => item.startsWith(LIGHTPROXY_CERT_NAME_PREFIX));
    debug('certlist', certList);

    return certList
      .map((name) => {
        return `security delete-certificate -c ${name}`;
      })
      .join('||');
  }

  // TODO: for other systems
  return Promise.resolve('');
}

export async function installCert() {
  await fs.mkdirpAsync(path.dirname(CERT_PATH));

  const { key, cert } = await generateCert();

  await fs.mkdirpAsync(LIGHTPROXY_TEMP_PATH);
  const TEMP_KEY_PATH = path.join(LIGHTPROXY_TEMP_PATH, CERT_KEY_FILE_NAME);
  const TEMP_FILE_PATH = path.join(LIGHTPROXY_TEMP_PATH, CERT_FILE_NAME);

  await fs.writeFileAsync(TEMP_KEY_PATH, key, 'utf-8');
  await fs.writeFileAsync(TEMP_FILE_PATH, cert, 'utf-8');

  let removeCertCmd = '';
  // remove cert maybe failed and it dose not matter
  try {
    removeCertCmd = await generateCleanCertCmd();
  } catch (e) {
    debug(e);
  }

  if (SYSTEM_TYPE === 'MacOS') {
    const trustCmd = `${
      removeCertCmd
        ? removeCertCmd + ' || echo clean_failed'
        : 'echo pass_clean'
    } && security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain "${TEMP_FILE_PATH}"`;
    await sudoExec(trustCmd);
  }

  await fs.copyAsync(TEMP_KEY_PATH, CERT_KEY_PATH);
  await fs.copyAsync(TEMP_FILE_PATH, CERT_FILE_PATH);
}
