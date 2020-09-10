import { createStore, compose, applyMiddleware, Action } from 'redux'
import { REDUX_MASTER_SYNC_TO_CLIENT, REDUX_CLINET_DISPATCH_TO_MASTER } from './common/redux/actions';
import { initialState } from './common/redux/state';

declare var promiseIpc:any;

function reducer(state = initialState, action: any) {
    switch(action.type) {
        case REDUX_MASTER_SYNC_TO_CLIENT:
            return action.state;
    }
    promiseIpc.send(REDUX_CLINET_DISPATCH_TO_MASTER, action);
    return state;
}

export const store = createStore(reducer, initialState);

promiseIpc.on(REDUX_MASTER_SYNC_TO_CLIENT, (state: any) => {
    store.dispatch({
        type: REDUX_MASTER_SYNC_TO_CLIENT,
        state,
    });
});
