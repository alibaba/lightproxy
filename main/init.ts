import { checkHelperInstalled } from './platform/helper';
import { initialState } from '../src/common/redux/state';
import { initStore } from './redux-master';

export async function initApp() {
  const [helperInstalled] = await Promise.all([checkHelperInstalled()]);

  const state = initialState;
  state.app.installed.helper = helperInstalled;

  initStore(state);
}
