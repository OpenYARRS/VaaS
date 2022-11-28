import router from '../router';
import { Request, Response } from 'express';
import { terminal } from '../../services/terminal';
import { IError } from '../../interfaces/IError';
import { User } from '../../models';

import {
  bcrypt,
  gitAccessToken,
  gitAuthUser,
  jwtCreator,
} from '../../warehouse/middlewares';

// Use the router middleware to handle requests to the /github endpoint
// This endpoint is used to authenticate users via GitHub
router
  .route('/github')

  // Handle POST requests to the /github endpoint
  .post(
    gitAccessToken,
    gitAuthUser,
    bcrypt,
    jwtCreator,
    async (req: Request, res: Response) => {
      // If none of the middlewares have errored out, we can assume the user was authenticated
      // with Github, had their PW hashed, and a JWT created

      terminal(
        `Received ${req.method} request at terminal '${req.baseUrl}${req.url}' endpoint`
      );
      try {
        // If the user does not have an account, create one
        if (res.locals.hasAcct === false) {
          const { username, firstName, lastName } = res.locals.newAcctInfo,
            { userId, hashedPassword, jwt } = res.locals;

          // Create and save a new user to the database
          const attempt = new User({
            _id: userId,
            username,
            password: hashedPassword,
            firstName,
            lastName,
            darkMode: false,
            refreshRate: 60000,
          });
          await attempt.save();
          terminal(
            `Success: New user [${userId}] stored in MongoDB collection`
          );
          // Return user data and JWT
          return res
            .status(201)
            .header('x-auth-token', jwt)
            .json({ ...jwt, userId: userId, name: username });

          // If the user does have an account, simply return their data and JWT
        } else {
          const { jwt, userId } = res.locals,
            { username } = res.locals.newAcctInfo;
          terminal('Success: User login information authenticated');
          return res
            .status(201)
            .header('x-auth-token', jwt)
            .json({ ...jwt, userId, name: username });
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
    }
  );

// Export this route on the router
export default router;
