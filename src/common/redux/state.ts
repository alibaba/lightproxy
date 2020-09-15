import { ACTION_TYPES } from './actions';
import { Rule } from '../../components/rule-list';

export const initialState = {
  todos: [] as string[],
  app: {
    installed: {
      helper: false,
      cert: false,
    },
  },
  rules: [] as Rule[],
  __loading__: {} as Record<ACTION_TYPES, boolean>,
};

export type State = typeof initialState;
