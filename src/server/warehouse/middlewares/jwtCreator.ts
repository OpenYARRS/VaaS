import { Request, Response } from 'express';
import { encodeSession } from '../../services/jwt';
import { IPartialSession } from '../../interfaces/IToken';
import { terminal } from '../../services/terminal';

// Middleware to create a JWT for a user
export default (
  req: Request,
  res: Response,
  next: (param?: unknown) => void
): void | Response => {
  terminal(`Received ${req.method} request at 'jwtCreator' middleware`);

  // Pull the username and userId from the request/response objects
  const { username } = req.body,
    { userId } = res.locals;

  // Create a partial session object
  const partialSession: IPartialSession = {
    id: userId,
    username: username,
  };

  // Encode the partial session object into a JWT and store it in the response object
  res.locals.jwt = encodeSession(process.env.JWT_ACCESS_SECRET, partialSession);
  terminal(`Success: JWT created: ${res.locals.jwt} for ${username}`);

  // Continue to the next middleware
  return next();
};
