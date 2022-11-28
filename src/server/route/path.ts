import { IPath, IPathRoute } from '../interfaces/IPath';

// Path function returns an IPathRoute object
function path(url: string): IPathRoute {
  // Declare a variable with type IPath
  const allRoutes: IPath = {
    // Within the IPath interface, we have route properties of type string
    // These strings specify endpoints for the API
    '/user': {
      methods: ['GET', 'PUT', 'DELETE'],
    },
    '/auth': {
      methods: ['GET', 'POST', 'PUT'],
    },
    '/cluster': {
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
    '/prom': {
      methods: ['GET'],
    },
    '/faas': {
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
    '/faas/invoke': {
      methods: ['POST'],
    },
    '/gateway': {
      methods: ['GET'],
    },
    '/alert': {
      methods: ['GET'],
    },
    '/github': {
      methods: ['GET', 'POST'],
    },
    '/gcheck': {
      methods: ['POST'],
    },
  };

  // Based on the url that was passed in, we return the corresponding IPath endpoint info
  return allRoutes[url];
}

export default path;
