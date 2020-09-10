import * as sagaEffects from 'redux-saga/effects';
import { DELAY_ADD_TODO, ADD_TODO, addTodo } from '../../src/common/redux/actions';
import { initialState } from '../../src/common/redux/state';
import { Action } from 'redux';

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


export default {
    effects,
    reducers,
};
