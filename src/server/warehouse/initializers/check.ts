import { Request, Response } from 'express';
import { IError } from '../../interfaces/IError';
import path from '../../route/path';

// CHECK PATH FILE TO DETERMINE IF REQUESTED ROUTE HAS REQUESTED METHOD DEFINED
export default (req: Request, res: Response, next: (param?: unknown) => void): void | Response => {
  console.log(`${req.method} request routed to '/api${req.url}' from ${req.socket.remoteAddress}`);
  let route = path(req.url);
  if (Object.keys(req.query).length > 0) {
    route = path(req.url.substring(0, req.url.indexOf('?')));
  }
  if (req.url.search(':') !== -1) {
    route = path(req.url.substring(0, req.url.indexOf(':')));
  }
  if (route.methods.includes(req.method)) {
    console.log(`Success: ${req.method} method is valid for this endpoint`);
    return next();
  } else {
    const error: IError = {
      status: 405,
      message: 'This type of method is not supported by this endpoint'
    }
    res.setHeader('allow', route.methods);
    return res.status(405).json(error);
  }
}