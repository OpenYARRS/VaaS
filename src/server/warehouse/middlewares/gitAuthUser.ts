import { Request, Response } from 'express';
import { IError } from '../../interfaces/IError';
import { terminal } from '../../services/terminal';

// Middleware to verify a user with Github
export default async (
  req: Request,
  res: Response,
  next: (param?: unknown) => void
): Promise<void | Response<any, Record<string, any>>> => {
  terminal(`Received ${req.method} request at 'gitAuthUser' middleware`);

  // Pull the user info from the response object created in the gcheck endpoint file
  const { firstName, lastName, username, password } = res.locals.newAcctInfo;
  console.log('PASSWORD IS : ', password);
  try {
    // User has an account
    if (res.locals.hasAcct === true) {
      // Throw an error if the user's password does not match the password in the database
      if (!username || !password) {
        const error: IError = {
          status: 500,
          message: 'Unable to fulfull request without all fields completed',
        };
        terminal(`Fail: ${error.message}`);
        return res.status(error.status).json(error);
      }

      // Save userId and password for next middleware
      res.locals.hashedPassword = res.locals.user.password;
      res.locals.userId = res.locals.user._id;

      terminal(`Success: Forwarding ${req.method} request to next middleware`);
      return next();
    }

    // User does not have an account
    else {
      // Throw an error if missing any required fields
      if (!password || !firstName || !lastName) {
        const error: IError = {
          status: 500,
          message: 'Unable to fulfull request without all fields completed',
        };
        terminal(`Fail: ${error.message}`);
        return res.status(error.status).json(error);
      }

      // Move on to the next middleware
      terminal(`Success: Forwarding ${req.method} request to next middleware`);
      return next();
    }

    // Error handling
  } catch (err) {
    const error: IError = {
      status: 500,
      message: `Unable to fulfill ${req.method} request: ${err}`,
    };
    terminal(`Fail: ${error.message}`);
    return res.status(error.status).json(error);
  }
};
