import {
  Action,
  ACTION_TYPES,
  appUpdateHelperInstalled,
  ActionTypeOf,
} from '../../src/common/redux/actions';
import { State } from '../../src/common/redux/state';
import { put, delay, CallEffect, PutEffect } from 'redux-saga/effects';

const effects = {
  *[ACTION_TYPES.APP_INSTALL_HELPER](): Generator<
    CallEffect<true> | PutEffect<Action>
  > {
    yield delay(500);
    yield put(appUpdateHelperInstalled({ installed: true }));
  },
};

const reducers = {
  [ACTION_TYPES.APP_UPDATE_HELPER_INSTALLED]: (state: State, action: ActionTypeOf<ACTION_TYPES.APP_UPDATE_HELPER_INSTALLED>): State => {
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
