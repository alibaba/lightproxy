import { State } from "../../src/common/redux/state";

type Reducers<R> = {
    [key: string]: (state: State) => State,
};

type Effects<E> = {
    [key: string]: (state: State) => IterableIterator<any>,
};

export function defineModel<R, E>({
    effects,
    reducers,
}:
    {
    effects: Effects<E>,
    reducers: Reducers<R>,
}) {
    return {
        effects,
        reducers,
    }
}