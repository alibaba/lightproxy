import React, { FunctionComponent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { State } from '../../common/redux/state';
import { appInstallHelper, ACTION_TYPES } from '../../common/redux/actions';
import { useProxyHelperInstall } from '../../hooks/use-helper-install';

export const InstallGuide: FunctionComponent = () => {
  const helperInstaller = useProxyHelperInstall();

  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg">
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">Install Guide</div>
        <div className="text-gray-700 p-4">
          <button
            onClick={helperInstaller.install}
            className="bg-blue-500 block hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {helperInstaller.loading ? (
              <svg
                className="animate-spin h-5 w-5 mr-3 ..."
                viewBox="0 0 24 24"
              ></svg>
            ) : null}
            Install Helper {helperInstaller.installed ? 'DONE' : ''}
          </button>
        </div>
      </div>
    </div>
  );
};
