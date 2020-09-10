import { createStore, applyMiddleware } from 'redux';
import { MainProcessType } from 'electron-promise-ipc';
import logger from 'redux-logger';

import {
  ACTION_TYPES,
  reduxClientInternalLoading,
} from './common/redux/actions';
import { initialState } from './common/redux/state';

declare const promiseIpc: MainProcessType;

function reducer(state = initialState, action: any) {
  switch (action.type) {
    case ACTION_TYPES.REDUX_MASTER_SYNC_TO_CLIENT:
      return {
        ...action.state,
        __loading__: state.__loading__,
      };
    case ACTION_TYPES.REDUX_CLIENT_INTERNAL_LOADING:
      return {
        ...state,
        __loading__: {
          [action.action.type]: action.status,
        },
      };
  }
  setTimeout(() => {
    store.dispatch(reduxClientInternalLoading(action, true));
    console.log('loading...');

    promiseIpc
      .send(ACTION_TYPES.REDUX_CLINET_DISPATCH_TO_MASTER, action)
      .then(() => {
        console.log('loading done');
        store.dispatch(reduxClientInternalLoading(action, false));
      });
  });

  return state;
}

export const store = createStore(
  reducer,
  initialState,
  applyMiddleware(logger),
);

promiseIpc.on(ACTION_TYPES.REDUX_MASTER_SYNC_TO_CLIENT, (state: any) => {
  store.dispatch({
    type: ACTION_TYPES.REDUX_MASTER_SYNC_TO_CLIENT,
    state,
  });
});
