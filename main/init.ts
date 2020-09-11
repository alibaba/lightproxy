import { checkHelperInstalled } from './platform/helper';
import { initialState } from '../src/common/redux/state';
import { initStore } from './redux-master';
import { checkCertInstalled } from './platform/cert';

export async function initApp() {
  const [helperInstalled, certInstalled] = await Promise.all([
    checkHelperInstalled(),
    checkCertInstalled(),
  ]);

  const state = initialState;
  state.app.installed.helper = helperInstalled;
  state.app.installed.cert = certInstalled;

  initStore(state);
}
