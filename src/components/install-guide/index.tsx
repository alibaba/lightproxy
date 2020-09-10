import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { State } from '../../common/redux/state';
import { appInstallHelper } from '../../common/redux/actions';

export const InstallGuide = () => {
    const helperInstalled = useSelector((state: State) => {
        return state.app.installed.helper;
    }) as boolean;
    
    const certInstalled = useSelector((state: State) => {
        return state.app.installed.cert;
    }) as boolean;

    const dispatch = useDispatch();

    const installHelper = () => dispatch(appInstallHelper());
    
    return <div className="max-w-sm rounded overflow-hidden shadow-lg">
    <div className="px-6 py-4">
      <div className="font-bold text-xl mb-2">Install Guide</div>
      <div className="text-gray-700 p-4">
        <button onClick={installHelper} className="bg-blue-500 block hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Install Helper {helperInstalled ? 'DONE': ''}
        </button>
        {/* <button className="bg-blue-500 block hover:bg-blue-700 text-white font-bold py-2 px-4 mt-2 rounded">
            Install Cert
        </button> */}
      </div>
    </div>
    
  </div>;
  
}