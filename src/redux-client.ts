import { createStore, compose, applyMiddleware, Action } from 'redux';
import {
  REDUX_MASTER_SYNC_TO_CLIENT,
  REDUX_CLINET_DISPATCH_TO_MASTER,
  REDUX_CLIENT_INTERNAL_LOADING,
  reduxClientInternalLoading,
} from './common/redux/actions';
import { initialState } from './common/redux/state';
import logger from 'redux-logger';

declare var promiseIpc: any;

function reducer(state = initialState, action: any) {
  switch (action.type) {
    case REDUX_MASTER_SYNC_TO_CLIENT:
      return {
        ...action.state,
        __loading__: state.__loading__,
      };
    case REDUX_CLIENT_INTERNAL_LOADING:
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

    promiseIpc.send(REDUX_CLINET_DISPATCH_TO_MASTER, action).then(() => {
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

promiseIpc.on(REDUX_MASTER_SYNC_TO_CLIENT, (state: any) => {
  store.dispatch({
    type: REDUX_MASTER_SYNC_TO_CLIENT,
    state,
  });
});
