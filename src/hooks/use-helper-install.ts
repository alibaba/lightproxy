/**
 * hooks for proxy helper install
 */

import { useSelector, useDispatch } from 'react-redux';
import { State } from '../common/redux/state';
import { ACTION_TYPES } from '../common/redux/actions';
import { appInstallHelper } from '../common/redux/actions';

export function useProxyHelperInstall() {
  const helperInstalled = useSelector((state: State) => {
    return state.app.installed.helper;
  });

  const appInstallHelperLoading = useSelector((state: State) => {
    return state.__loading__[ACTION_TYPES.APP_INSTALL_HELPER];
  });

  const dispatch = useDispatch();

  return {
    install() {
      dispatch(
        appInstallHelper({
          forceInstall: false,
        }),
      );
    },

    loading: appInstallHelperLoading,
    installed: helperInstalled,
  };
}
