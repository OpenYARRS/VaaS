import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './Components/App';
import { Provider } from 'react-redux';
import { store } from './Store/store';

// Declare a container variable to hold the root element from the DOM
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const container: Element = document.getElementById('root')!;

const FullApp = () => (
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);

// Hydrate the root element with the React app
hydrateRoot(container, <FullApp />);
