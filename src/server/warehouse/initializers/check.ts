import { Request, Response } from 'express';
import { IError } from '../../interfaces/IError';
import path from '../../route/path';
import { terminal } from '../../services/terminal';

// Middleware to check if the method (i.e. GET, POST, DELETE) is valid for the endpoint
export default (
  req: Request,
  res: Response,
  next: (param?: unknown) => void
): void | Response => {
  terminal(
    `${req.method} request routed to '${req.baseUrl}${req.url}' from ${req.socket.remoteAddress}`
  );
  let route = path(req.url);

  // Check if a query string is present
  if (Object.keys(req.query).length > 0) {
    // If so, the route string goes from index 0 to the index of the first '?'
    // Return the object from the path object that matches this string
    route = path(req.url.substring(0, req.url.indexOf('?')));
  }

  // Check if the request url includes a parameter
  if (req.url.search(':') !== -1) {
    // If so, the route string goes from index 0 to the index of the first ':'
    // Return the object from the path object that matches this string
    route = path(req.url.substring(0, req.url.indexOf(':')));
  }

  // Check if the route's valid methods array includes the method from the request
  if (route.methods.includes(req.method)) {
    terminal(`Success: ${req.method} method is valid for this endpoint`);
    return next();

    // Error handling
  } else {
    const error: IError = {
      status: 405,
      message: 'This type of method is not supported by this endpoint',
    };
    res.setHeader('allow', route.methods);
    return res.status(405).json(error);
  }
};
