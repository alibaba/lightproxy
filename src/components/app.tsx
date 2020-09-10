import React from 'react';
import logo from './logo.svg';
import './app.css';
import { store } from '../redux-client';
import { useSelector, Provider, useDispatch } from 'react-redux';
import type { initialState, State } from '../common/redux/state';
import { useEffect } from 'react';
import { useState } from 'react';
import { InstallGuide } from './install-guide';

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

function App() {
  return (
    <Provider store={store}>
      <Home></Home>
      123
    </Provider>
  );
}

export default App;
