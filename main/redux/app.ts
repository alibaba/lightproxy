import * as sagaEffects from 'redux-saga/effects';
import { DELAY_ADD_TODO, ADD_TODO, addTodo, APP_INIT, APP_INSTALL_HELPER, appUpdateHelperInstalled, APP_UPDATE_HELPER_INSTALLED } from '../../src/common/redux/actions';
import { initialState } from '../../src/common/redux/state';
import { Action } from 'redux';
import { put, delay } from 'redux-saga/effects';

const effects = {
    *[APP_INSTALL_HELPER]() {
        yield delay(500);
        yield put(appUpdateHelperInstalled(true));
    }
} as Record<string, (state: typeof initialState, action: Action & Record<string, any>) => any>;

const reducers = {
    [APP_UPDATE_HELPER_INSTALLED]: (state, action) => {
        return {
            ...state,
            app: {
                ...state.app,
                installed: {
                    ...state.app.installed,
                    helper: true,
                }
            }
        }
    }
} as Record<string, (state: typeof initialState, action: Action & Record<string, any>) => typeof initialState>;


export default {
    effects,
    reducers,
};
