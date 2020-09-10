import { createStore, compose, applyMiddleware, Action, combineReducers } from 'redux'
import { ADD_TODO, REDUX_CLINET_DISPATCH_TO_MASTER, addTodo, DELAY_ADD_TODO, REDUX_MASTER_SYNC_TO_CLIENT } from '../src/common/redux/actions';
import createSagaMiddleware, { Saga } from 'redux-saga';
import * as sagaEffects from 'redux-saga/effects';
import promiseIpc from 'electron-promise-ipc';
import { initialState } from '../src/common/redux/state';
import logger from 'redux-logger';
import { webContents } from 'electron';

const sagaMiddleware = createSagaMiddleware();

const effects = {
    *[DELAY_ADD_TODO]() {
        yield sagaEffects.delay(1000);
        yield sagaEffects.put(addTodo('delay item'));
    }
} as Record<string, (state: typeof initialState, action: Action & Record<string, any>) => any>;

const reducers = {
    [ADD_TODO](state = initialState, action) {
        return {
            ...state,
            todos: state.todos.concat(action.text),
        }
    },
} as Record<string, (state: typeof initialState, action: Action & Record<string, any>) => typeof initialState>;

function sagaDispatchReducer(state = initialState, action: Action & Record<string, any>) {
    if (effects[action.type]) {
        sagaMiddleware.run(effects[action.type] as any);
    }
    return state;
}

function reducer(state = initialState, action: Action & Record<string, any>) {
    if (reducers[action.type]) {
        return reducers[action.type](state, action);
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
    store.dispatch(action);
});

promiseIpc.on(REDUX_MASTER_SYNC_TO_CLIENT, (action: any) => {
    return store.getState() || initialState;
});
