import { ACTION_TYPES, ActionTypeOf } from '../../src/common/redux/actions';
import { State } from '../../src/common/redux/state';

import update from 'immutability-helper';

const effects = {};

const reducers = {
  [ACTION_TYPES.RULES_REORDER](
    state: State,
    action: ActionTypeOf<ACTION_TYPES.RULES_REORDER>,
  ) {
    const { fromIndex, toIndex } = action;

    const from = state.rules[fromIndex];
    const to = state.rules[toIndex];
    const r = update(state, {
      rules: {
        [fromIndex]: {
          $set: to,
        },
        [toIndex]: {
          $set: from,
        },
      },
    });
    return r;
  },
};
export default {
  effects,
  reducers,
};
