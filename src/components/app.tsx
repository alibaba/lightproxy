import React, { useEffect, useState, FunctionComponent } from 'react';
import { useSelector, Provider } from 'react-redux';

import { store } from '../redux-client';
import type { State } from '../common/redux/state';
import { InstallGuide } from './install-guide';
import './app.css';

function Home() {
  const helperInstalled = useSelector((state: State) => {
    return state.app.installed.helper;
  }) as boolean;

  const certInstalled = useSelector((state: State) => {
    return state.app.installed.cert;
  }) as boolean;

  const [showInstallGuide, setShowInstallGuide] = useState(false);

  useEffect(() => {
    if (!(helperInstalled && certInstalled)) {
      setShowInstallGuide(true);
    }
  }, [helperInstalled, certInstalled]);

  return showInstallGuide ? <InstallGuide /> : null;
}

const App: FunctionComponent = () => {
  return (
    <Provider store={store}>
      <Home></Home>
      123
    </Provider>
  );
};

export default App;
