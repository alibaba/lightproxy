import React, { useEffect, useState, FunctionComponent } from 'react';
import { useSelector, Provider } from 'react-redux';

import { store } from '../redux-client';
import type { State } from '../common/redux/state';
import { InstallGuide } from './install-guide';
import './app.css';

function Home() {
  const helperInstalled = useSelector((state: State) => {
    return state.app.installed.helper;
  });

  const certInstalled = useSelector((state: State) => {
    return state.app.installed.cert;
  });

  const [showInstallGuide, setShowInstallGuide] = useState(false);

  useEffect(() => {
    if (!(helperInstalled && certInstalled)) {
      setShowInstallGuide(true);
    }
  }, [helperInstalled, certInstalled]);

  return showInstallGuide ? (
    <>
      <InstallGuide />
      <button
        className="bg-blue-500 block hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => setShowInstallGuide(false)}
      >
        Hide
      </button>
    </>
  ) : (
    <div>
      <button
        className="bg-blue-500 block hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => setShowInstallGuide(true)}
      >
        InstallGuide
      </button>
    </div>
  );
}

const App: FunctionComponent = () => {
  return (
    <Provider store={store}>
      <Home></Home>
    </Provider>
  );
};

export default App;
