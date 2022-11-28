import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './Components/App';
import { Provider } from 'react-redux';
import { store } from './Store/store';

// Export a function that returns the HTML string
// Will be called from src/server/index.tsx to render the HTML
// As part of the SSR process via Vite
export function render(url: string | Partial<Location>) {
  return ReactDOMServer.renderToString(
    <Provider store={store}>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </Provider>
  );
}
