/**
 * hooks for proxy helper install
 */

import { useSelector, useDispatch } from 'react-redux';
import { State } from '../common/redux/state';
import { ACTION_TYPES, appInstallCert } from '../common/redux/actions';
import { appInstallHelper } from '../common/redux/actions';

export function useCertInstall() {
  const certInstalled = useSelector((state: State) => {
    return state.app.installed.cert;
  });

  const appCertInstallLoading = useSelector((state: State) => {
    return state.__loading__[ACTION_TYPES.APP_INSTALL_CERT];
  });

  const dispatch = useDispatch();

  return {
    install() {
      dispatch(
        appInstallCert({
          forceInstall: false,
        }),
      );
    },

    loading: appCertInstallLoading,
    installed: certInstalled,
  };
}
