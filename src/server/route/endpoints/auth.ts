import router from '../router';
import { Request, Response } from 'express';
import { User } from '../../models';
import { IError } from '../../interfaces/IError';
import {
  bcrypt,
  authUser,
  jwtCreator,
  jwtVerify,
} from '../../warehouse/middlewares';
import { terminal } from '../../services/terminal';

// Use the router middleware to handle requests to the /auth endpoint
// This endpoint is used to authenticate users
router
  .route('/auth')
  // GET request handling
  // This endpoint is used to authenticate users by invoking the jwtVerify middleware
  .get(jwtVerify, async (req: Request, res: Response) => {
    terminal(
      `Received ${req.method} request at terminal '${req.baseUrl}${req.url}' endpoint`
    );
    // If jwtVerify middleware does not error out, we can assume the user is authenticated
    try {
      terminal(`Success: Access to route is allowed`);
      return res.status(201).json({ invalid: false });

      // Error handling
    } catch (err) {
      const error: IError = {
        status: 500,
        message: `Unable to fulfill ${req.method} request: ${err}`,
      };
      terminal(`Fail: ${error.message}`);
      return res.status(error.status).json(error);
    }
  })
  // POST request handling
  // This endpoint is used to create a new user account
  // First pass the request through the authUser middleware to verify that the user does not already exist
  // Then pass the request through the bcrypt middleware to hash the user's password
  // Finally, pass the request through the jwtCreator middleware to create a JWT for the user
  .post(authUser, bcrypt, jwtCreator, async (req: Request, res: Response) => {
    terminal(
      `Received ${req.method} request at terminal '${req.baseUrl}${req.url}' endpoint`
    );

    // If none of the middlewares error out, we can assume the user was created successfully
    try {
      // Deconstruct the user's info from the request body
      const { username, firstName, lastName } = req.body,
        // Deconstruct the account info from res.locals
        { userId, hashedPassword, jwt } = res.locals;

      // Attempt to create a new User in the database using the above info
      const attempt = new User({
        _id: userId,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        darkMode: false,
        refreshRate: 60000,
      });

      // Wait for the database to save the new user
      await attempt.save();
      terminal(`Success: New user [${userId}] stored in MongoDB collection`);

      // Return the JWT and user's ID to the client
      return res
        .status(201)
        .header('x-auth-token', jwt)
        .json({ ...jwt, userId: userId });

      // Error handling
    } catch (err) {
      const error: IError = {
        status: 500,
        message: `Unable to fulfill ${req.method} request: ${err}`,
      };
      terminal(`Fail: ${error.message}`);
      return res.status(error.status).json(error);
    }
  })
  // PUT request handling
  // This endpoint is used to verify login credentials and return a JWT on successful login
  .put(authUser, bcrypt, jwtCreator, async (req: Request, res: Response) => {
    terminal(
      `Received ${req.method} request at terminal '${req.baseUrl}${req.url}' endpoint`
    );

    // If none of the middlewares error out, we can assume the user was authenticated successfully
    try {
      // Deconstruct the JWT and user ID from res.locals
      const { jwt, userId } = res.locals;
      terminal('Success: User login information authenticated');

      // Return the JWT and user ID to the client
      return res
        .status(201)
        .header('x-auth-token', jwt)
        .json({ ...jwt, userId });

      // Error handling
    } catch (err) {
      const error: IError = {
        status: 500,
        message: `Unable to fulfill ${req.method} request: ${err}`,
      };
      terminal(`Fail: ${error.message}`);
      return res.status(error.status).json(error);
    }
  });

// Export this route on the router
export default router;
