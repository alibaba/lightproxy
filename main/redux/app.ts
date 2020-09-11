import {
  Action,
  ACTION_TYPES,
  appUpdateHelperInstalled,
  ActionTypeOf,
} from '../../src/common/redux/actions';
import { State } from '../../src/common/redux/state';
import { put, delay, CallEffect, PutEffect, call } from 'redux-saga/effects';
import { checkHelperInstalled, installHelper } from '../platform/helper';

const effects = {
  *[ACTION_TYPES.APP_INSTALL_HELPER](
    state: State,
    action: ActionTypeOf<ACTION_TYPES.APP_INSTALL_HELPER>,
  ) {
    let needInstall = true;
    if (!action.forceInstall) {
      needInstall = (yield checkHelperInstalled()) ? false : true;
    }
    if (needInstall) {
      yield installHelper();
      const installResult = yield checkHelperInstalled();
      yield put(appUpdateHelperInstalled({ installed: installResult }));
    }
  },
};

const reducers = {
  [ACTION_TYPES.APP_UPDATE_HELPER_INSTALLED]: (
    state: State,
    action: ActionTypeOf<ACTION_TYPES.APP_UPDATE_HELPER_INSTALLED>,
  ): State => {
    return {
      ...state,
      app: {
        ...state.app,
        installed: {
          ...state.app.installed,
          helper: action.installed,
        },
      },
    };
  },
};

export default {
  effects,
  reducers,
};
