import {
  Action,
  ACTION_TYPES,
  appUpdateHelperInstalled,
} from '../../src/common/redux/actions';
import { State } from '../../src/common/redux/state';
import { put, delay, CallEffect, PutEffect } from 'redux-saga/effects';

const effects = {
  *[ACTION_TYPES.APP_INSTALL_HELPER](): Generator<
    CallEffect<true> | PutEffect<Action>
  > {
    yield delay(500);
    yield put(appUpdateHelperInstalled(true));
  },
};

const reducers = {
  [ACTION_TYPES.APP_UPDATE_HELPER_INSTALLED]: (state: State): State => {
    return {
      ...state,
      app: {
        ...state.app,
        installed: {
          ...state.app.installed,
          helper: true,
        },
      },
    };
  },
};

export default {
  effects,
  reducers,
};
