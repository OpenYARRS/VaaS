import { Request, Response } from 'express';
import { decodeSession, checkExpStatus } from '../../services/jwt';
import { IError } from '../../interfaces/IError';
import { terminal } from '../../services/terminal';

// Middleware to verify a user's JWT
export default (
  req: Request,
  res: Response,
  next: (param?: unknown) => void
): void | Response => {
  terminal(`Received ${req.method} request at 'jwtVerify' middleware`);

  // Attempt to decode the JWT to determine if it is valid
  const authorized = decodeSession(
    process.env.JWT_ACCESS_SECRET,
    req.headers.authorization
  );
  console.log(authorized);

  // If the JWT is valid, check if it has expired
  if (authorized.type === 'valid') {
    res.locals.jwt = authorized.session;
    const tokenStatus = checkExpStatus(authorized.session);
    console.log(tokenStatus);
    if (tokenStatus === 'active') {
      terminal(
        `Success: JWT is ${tokenStatus}: [${req.headers.authorization}]`
      );
      console.log(
        `Success: JWT is ${tokenStatus}: [${req.headers.authorization}]`
      );

      // If the JWT is valid and not expired or in grace status, continue to the next middleware
      return next();

      // Error handling
    } else {
      const error: IError = {
        status: 401,
        message: `JWT is ${tokenStatus}: [${req.headers.authorization}]`,
        invalid: true,
      };
      terminal(`Fail: ${error.message}`);
      return res.status(error.status).json(error);
    }
  } else {
    const error: IError = {
      status: 401,
      message: `JWT not verified: [${req.headers.authorization}]}`,
      invalid: true,
    };
    terminal(`Fail: ${error.message}`);
    return res.status(error.status).json(error);
  }
};
