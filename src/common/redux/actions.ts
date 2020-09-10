export type Action = {
  type: string;
} & Record<string, any>;

export const REDUX_CLINET_DISPATCH_TO_MASTER =
  'REDUX_CLINET_DISPATCH_TO_MASTER';
export const REDUX_MASTER_SYNC_TO_CLIENT = 'REDUX_MASTER_SYNC_TO_CLIENT';

export const REDUX_CLIENT_INTERNAL_LOADING = 'REDUX_CLIENT_INTERNAL_LOADING';

export function reduxClientInternalLoading(action: Action, status: boolean) {
  return {
    type: REDUX_CLIENT_INTERNAL_LOADING,
    action,
    status,
  };
}

export const ADD_TODO = 'ADD_TODO';
export const DELAY_ADD_TODO = 'DELAY_ADD_TODO';

export const APP_INIT = 'APP_INIT';

export const APP_INSTALL_HELPER = 'APP_INSTALL_HELPER';
export const APP_UPDATE_HELPER_INSTALLED = 'APP_UPDATED_HELPER_INSTALLED';

export function appUpdateHelperInstalled(installed: boolean) {
  return {
    type: APP_UPDATE_HELPER_INSTALLED,
    installed,
  };
}
export function appInstallHelper() {
  return {
    type: APP_INSTALL_HELPER,
  };
}

export function appInit() {
  return {
    type: APP_INIT,
  };
}

export function addTodo(text: string) {
  return {
    type: ADD_TODO,
    text,
  };
}

export function delayAddTodo(text: string) {
  return {
    type: DELAY_ADD_TODO,
    text,
  };
}

export function reduxClientDispatchToMaster(action: Action) {
  return {
    type: REDUX_CLINET_DISPATCH_TO_MASTER,
    action,
  };
}

export function reduxMasterSyncToClient(state: any) {
  return {
    type: REDUX_MASTER_SYNC_TO_CLIENT,
    state,
  };
}
