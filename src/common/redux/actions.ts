export type Action = {
    type: string,
} & Record<string, any>;

export const REDUX_CLINET_DISPATCH_TO_MASTER = 'REDUX_CLINET_DISPATCH_TO_MASTER';
export const REDUX_MASTER_SYNC_TO_CLIENT = 'REDUX_MASTER_SYNC_TO_CLIENT';
export const ADD_TODO = 'ADD_TODO';
export const DELAY_ADD_TODO = 'DELAY_ADD_TODO';


export function addTodo(text: string) {
    return {
        type: ADD_TODO,
        text,
    }
}

export function delayAddTodo(text: string) {
    return {
        type: DELAY_ADD_TODO,
        text,
    }
}

export function reduxClientDispatchToMaster(action: Action) {
    return {
        type: REDUX_CLINET_DISPATCH_TO_MASTER,
        action,
    }
}

export function reduxMasterSyncToClient(state: any) {
    return {
        type: REDUX_MASTER_SYNC_TO_CLIENT,
        state,
    }
}