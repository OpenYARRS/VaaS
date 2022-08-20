import { Request, Response } from 'express';

// LOG REQUEST DETAILS IN CONSOLE TABLE
export default (req: Request, res: Response, next: (param?: unknown) => void): void => {
  console.clear()
  const date: Date = new Date();
  console.table([{
    date: `${date.toLocaleDateString()} - ${date.toLocaleTimeString()}`,
    method: req.method,
    url: `${req.baseUrl}${req.url}`,
    body: req.body,
    params: req.params,
    query: req.query
  }]);
  return next();
}