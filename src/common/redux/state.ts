export const initialState = {
  todos: [],
  app: {
    installed: {
      helper: false,
      cert: false,
    },
  },
  __loading__: {} as Record<string, boolean>,
};

export type State = typeof initialState;
