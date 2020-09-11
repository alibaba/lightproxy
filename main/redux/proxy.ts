import { delay, put, CallEffect, PutEffect } from 'redux-saga/effects';

import { Action, ACTION_TYPES, addTodo, ActionTypeOf } from '../../src/common/redux/actions';
import { initialState, State } from '../../src/common/redux/state';

const effects = {
  *[ACTION_TYPES.DELAY_ADD_TODO](): Generator<
    CallEffect<true> | PutEffect<Action>
  > {
    yield delay(1000);
    yield put(addTodo('delay item'));
  },
};

const reducers = {
  [ACTION_TYPES.ADD_TODO](state: State = initialState, action: ActionTypeOf<ACTION_TYPES.ADD_TODO>): State {
    return {
      ...state,
      todos: state.todos.concat(action.text),
    };
  },
};

export default {
  effects,
  reducers,
};
