import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import promiseIpc from 'electron-promise-ipc';
import logger from 'redux-logger';
import { webContents } from 'electron';

import { ACTION_TYPES } from '../src/common/redux/actions';
import { initialState, State } from '../src/common/redux/state';
import reduxModels from './redux';

const { effects, reducers } = reduxModels;

const sagaMiddleware = createSagaMiddleware();

type DefinedReducersAction = {
  type: keyof typeof reducers;
  __resolve__?: () => void;
};

type DefinedEffectAction = {
  type: keyof typeof effects;
  __resolve__?: () => void;
};

function sagaDispatchReducer(
  state = initialState,
  action: DefinedEffectAction,
) {
  if (effects[action.type]) {
    sagaMiddleware
      .run(effects[action.type], state as any, action as any)
      .toPromise()
      .then(() => {
        if (typeof action.__resolve__ === 'function') {
          action.__resolve__();
        }
      });
  }
  return state;
}

function reducer(state = initialState, action: DefinedReducersAction) {
  if (action.type in reducers) {
    const r = reducers[action.type](state, action as any);
    action.__resolve__ && action.__resolve__();
    return r;
  }
  return state;
}

const syncStateMiddleware = (store: any) => (next: any) => (action: any) => {
  next(action);
  webContents.getAllWebContents().forEach((webContent) => {
    promiseIpc.send(
      ACTION_TYPES.REDUX_MASTER_SYNC_TO_CLIENT,
      webContent,
      store.getState(),
    );
  });
};

const finalReducers = (state: any, action: any) => {
  const r = sagaDispatchReducer(reducer(state, action), action);
  return r;
};

export function initStore(initialState: State) {
  const store = createStore(
    finalReducers,
    initialState,
    applyMiddleware(logger, sagaMiddleware, syncStateMiddleware),
  );

  promiseIpc.on(ACTION_TYPES.REDUX_CLINET_DISPATCH_TO_MASTER, (action: any) => {
    return new Promise((resolve) => {
      action.__resolve__ = resolve;
      store.dispatch(action);
    });
  });

  promiseIpc.on(ACTION_TYPES.REDUX_MASTER_SYNC_TO_CLIENT, () => {
    return store.getState() || initialState;
  });

  return store;
}
