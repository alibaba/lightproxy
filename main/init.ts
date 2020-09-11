import { checkHelperInstalled } from './platform/helper';
import { initialState } from '../src/common/redux/state';
import { initStore } from './redux-master';
import { checkCertInstalled } from './platform/cert';
import fs from 'fs-extra-promise';
import Store from 'electron-store';
import { RULE_STORE_KEY } from './const';
import { Rule } from '../src/components/rule-list';

const store = new Store();

async function readRules() {
  return store.get(RULE_STORE_KEY) as Rule[];
}

export async function initApp() {
  const [helperInstalled, certInstalled, rules] = await Promise.all([
    checkHelperInstalled(),
    checkCertInstalled(),
    readRules(),
  ]);

  const state = initialState;
  state.app.installed.helper = helperInstalled;
  state.app.installed.cert = certInstalled;
  state.rules = rules;

  initStore(state);
}
