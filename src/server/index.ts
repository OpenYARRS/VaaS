import type { Request, Response, NextFunction, Router, Express } from 'express';
import fs from 'fs/promises';
import path from 'path';
import express from 'express';
import compression from 'compression';
import serveStatic from 'serve-static';
import cors from 'cors';
import router from './route';
import db from './mongoDb';
import 'dotenv';
import { createServer as createViteServer } from 'vite';
import { RequestHandler } from 'express-serve-static-core';

// Determine whether we are running in test mode. This is used to suppress
// some log messages and change the default port.
const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD;

// Create a resolve function that resolves the path relative to the project root.
// It takes a single string argument, which is the path to resolve.
const resolve = (p: string) => path.resolve(__dirname, p);

// Create an asynchronous function that is used to start our server
// It takes a single argument, which is a bool indicating whether we are running in production mode
async function createServer(isProd = process.env.NODE_ENV === 'production') {
  // Create an Express app
  const app = express();

  // Create Vite server in middleware mode and configure the app type as
  // 'custom', disabling Vite's own HTML serving logic so the parent server (Express)
  // can take control of the HTML serving logic.
  // Using await, we ensure that the server is created before continuing
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: isTest ? 'error' : 'info',
  });

  // Use the Vite server's connect instance as middleware
  app.use(vite.middlewares);

  // Create a requestHandler that will be used to serve static files from the assets folder
  const requestHandler = express.static(resolve('assets'));
  app.use(requestHandler);
  app.use('/assets', requestHandler);

  // Indicate that the Express app will be using CORS
  app.use(cors(true));

  // Indicate that the Express app should parse urlencoded data
  // Here we are using the extended option, which allows us to parse nested objects
  // We also indicate that we want to parse JSON data
  app.use(express.urlencoded({ extended: true }) as RequestHandler);
  app.use(express.json() as RequestHandler);

  // Declare a routes variable with type Router
  // It essentially routes requests to the initializers middleware
  const routes: Router[] = Object.values(router);
  // All requests to the /api endpoint will be handled by the "routes" router defined above
  app.use('/api', routes);

  // If we are running in production mode, we will use the compression middleware
  if (isProd) {
    app.use(compression());
    // We will also serve the static files from the dist folder
    app.use(
      serveStatic(resolve('../../dist/client'), {
        index: false,
      })
    );
  }

  // Handle all requests that are not handled by the above middleware
  app.use('*', async (req: Request, res: Response, next: NextFunction) => {
    // Pull the target URL from the request
    const url = req.originalUrl;

    try {
      // Read the index.html file, varying the path based on whether we are running in production mode
      let template = await fs.readFile(
        isProd
          ? resolve('../../dist/client/index.html')
          : resolve('../../public/index.html'),
        'utf-8'
      );

      // Apply Vite HTML transforms to the template index.html file from above
      // This injects the Vite HMR client script into the HTML, and also
      // applies HTML transforms from Vite plugins (i.e. global premables from @vitejs/plugin-react).
      // This is necessary for Vite to be able to inject the correct script tags into the HTML.
      template = await vite.transformIndexHtml(url, template);

      // Load the server entry file, which is the entry point for the server-side rendering
      // vite.ssrLoadModule automatically transforms ESM source code to be compatible with Node.js
      // This does not require bundling and provides efficient invalidation similar to HMR.
      // This is all necessary because the server-side rendering code is written in ESM

      const productionBuildPath = path.join(
        __dirname,
        '../../dist/server/entry-server.mjs'
      );
      const devBuildPath = path.join(
        __dirname,
        '../../src/client/entry-server.tsx'
      );
      const { render } = await vite.ssrLoadModule(
        isProd ? productionBuildPath : devBuildPath
      );

      // Render the HTML using the render function from the entry-server file
      // This relies on that render function calling the appropriate framework SSR APIs
      // e.g. ReactDOMServer.renderToString()
      const appHtml = await render(url);

      // Inject the app-rendered HTML into the template, replacing the placeholder
      const html = template.replace(`<!--app-html-->`, appHtml);

      // Send the final rendered HTML back.
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);

      // Error handling
    } catch (e: any) {
      !isProd && vite.ssrFixStacktrace(e);
      console.log(e.stack);
      // If an error is caught, let Vite fix the stack trace so it maps back to
      // your actual source code.
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  // Initialize the database connection
  db.connect();

  // Specify the port that the server will listen on
  const port: number = Number(process.env.EXPRESS_PORT) || 3020;

  // Start the server
  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`VaaS is awake on http://localhost:${port}`);
  });
}

// Invoke the createServer function
createServer();
