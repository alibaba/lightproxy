export type Action = {
  [key: string]: unknown;
  type: string;
};

export enum ACTION_TYPES {
  REDUX_CLINET_DISPATCH_TO_MASTER = 'REDUX_CLINET_DISPATCH_TO_MASTER',
  REDUX_MASTER_SYNC_TO_CLIENT = 'REDUX_MASTER_SYNC_TO_CLIENT',
  REDUX_CLIENT_INTERNAL_LOADING = 'REDUX_CLIENT_INTERNAL_LOADING',

  APP_INIT = 'APP_INIT',

  APP_INSTALL_HELPER = 'APP_INSTALL_HELPER',
  APP_UPDATE_HELPER_INSTALLED = 'APP_UPDATE_HELPER_INSTALLED',

  APP_INSTALL_CERT = 'APP_INSTALL_CERT',
  APP_UPDATE_CERT_INSTALLED = 'APP_UPDATE_CERT_INSTALLED',

  // need to remove
  ADD_TODO = 'ADD_TODO',
  DELAY_ADD_TODO = 'DELAY_ADD_TODO',
}

interface ActionType {
  [ACTION_TYPES.APP_UPDATE_HELPER_INSTALLED]: {
    installed: boolean;
  };

  [ACTION_TYPES.APP_UPDATE_CERT_INSTALLED]: {
    installed: boolean;
  };

  [ACTION_TYPES.APP_INSTALL_HELPER]: {
    forceInstall: boolean;
  };

  [ACTION_TYPES.APP_INSTALL_CERT]: {
    forceInstall: boolean;
  };

  [ACTION_TYPES.REDUX_CLINET_DISPATCH_TO_MASTER]: {
    action: Action;
  };

  // need to remove
  [ACTION_TYPES.ADD_TODO]: {
    text: string;
  };
}

export type ActionTypeOf<T extends keyof ActionType> = ActionType[T] & {
  type: ACTION_TYPES;
};

export type ActionArgTypeOf<T extends keyof ActionType> = ActionType[T];

export function reduxClientDispatchToMaster({
  action,
}: ActionArgTypeOf<ACTION_TYPES.REDUX_CLINET_DISPATCH_TO_MASTER>): Action {
  return {
    type: ACTION_TYPES.REDUX_CLINET_DISPATCH_TO_MASTER,
    action,
  };
}

export function reduxMasterSyncToClient(state: unknown): Action {
  return {
    type: ACTION_TYPES.REDUX_MASTER_SYNC_TO_CLIENT,
    state,
  };
}

export function reduxClientInternalLoading(
  action: Action,
  status: boolean,
): Action {
  return {
    type: ACTION_TYPES.REDUX_CLIENT_INTERNAL_LOADING,
    action,
    status,
  };
}

export function appInit(): Action {
  return {
    type: ACTION_TYPES.APP_INIT,
  };
}

export function appUpdateHelperInstalled({
  installed,
}: ActionArgTypeOf<ACTION_TYPES.APP_UPDATE_HELPER_INSTALLED>): Action {
  return {
    type: ACTION_TYPES.APP_UPDATE_HELPER_INSTALLED,
    installed,
  };
}

export function appUpdateCertInstalled({
  installed,
}: ActionArgTypeOf<ACTION_TYPES.APP_UPDATE_CERT_INSTALLED>): Action {
  return {
    type: ACTION_TYPES.APP_UPDATE_CERT_INSTALLED,
    installed,
  };
}

export function appInstallHelper({
  forceInstall,
}: ActionArgTypeOf<ACTION_TYPES.APP_INSTALL_HELPER>): Action {
  return {
    type: ACTION_TYPES.APP_INSTALL_HELPER,
    forceInstall,
  };
}

export function appInstallCert({
  forceInstall,
}: ActionArgTypeOf<ACTION_TYPES.APP_INSTALL_CERT>): Action {
  return {
    type: ACTION_TYPES.APP_INSTALL_CERT,
    forceInstall,
  };
}

export function addTodo(text: string): Action {
  return {
    type: ACTION_TYPES.ADD_TODO,
    text,
  };
}

export function delayAddTodo(text: string): Action {
  return {
    type: ACTION_TYPES.DELAY_ADD_TODO,
    text,
  };
}
