import { ACTION_TYPES } from "./actions";

export const initialState = {
  todos: [] as string[],
  app: {
    installed: {
      helper: false,
      cert: false,
    },
  },
  __loading__: {} as Record<ACTION_TYPES, boolean>,
};

export type State = typeof initialState;
