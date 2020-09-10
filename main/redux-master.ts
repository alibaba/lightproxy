import { createStore, compose, applyMiddleware, Action, combineReducers } from 'redux'
import { ADD_TODO, REDUX_CLINET_DISPATCH_TO_MASTER, addTodo, DELAY_ADD_TODO, REDUX_MASTER_SYNC_TO_CLIENT } from '../src/common/redux/actions';
import createSagaMiddleware, { Saga } from 'redux-saga';
import * as sagaEffects from 'redux-saga/effects';
import promiseIpc from 'electron-promise-ipc';
import { initialState } from '../src/common/redux/state';
import logger from 'redux-logger';
import { webContents } from 'electron';
import reduxModels from './redux';

const {
    effects,
    reducers,
} = reduxModels;

const sagaMiddleware = createSagaMiddleware();

function sagaDispatchReducer(state = initialState, action: Action & Record<string, any>) {
    if (effects[action.type]) {
        sagaMiddleware.run(effects[action.type] as any).toPromise().then(() => {
            action.__resolve__ && action.__resolve__();
        });
    }
    return state;
}

function reducer(state = initialState, action: Action & Record<string, any>) {
    if (reducers[action.type]) {
        const r = reducers[action.type](state, action);
        action.__resolve__ && action.__resolve__();
        return r;
    }
    return state;
};

const syncStateMiddleware = (store: any) => (next: any) => (action: any) => {
    next(action);
    webContents.getAllWebContents().forEach(webContent => {
        promiseIpc.send(REDUX_MASTER_SYNC_TO_CLIENT, webContent, store.getState());
    });
}

const finalReducers = (state: any, action: any) => {
    const r = sagaDispatchReducer(reducer(state, action), action);
    return r;
}

export const store = createStore(finalReducers, initialState, applyMiddleware(
    logger,
    sagaMiddleware,
    syncStateMiddleware,
));

promiseIpc.on(REDUX_CLINET_DISPATCH_TO_MASTER, (action: any) => {
    return new Promise(resolve => {
        action.__resolve__ = resolve;
        store.dispatch(action);
    });
});

promiseIpc.on(REDUX_MASTER_SYNC_TO_CLIENT, (action: any) => {
    return store.getState() || initialState;
});
