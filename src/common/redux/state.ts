
export const initialState = {
    todos: [],
    app: {
        installed: {
            helper: false,
            cert: false,
        },
    }
};

export type State = typeof initialState;
