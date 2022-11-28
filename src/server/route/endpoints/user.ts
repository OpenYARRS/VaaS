import router from '../router';
import { Request, Response } from 'express';
import { User } from '../../models';
import { IError } from '../../interfaces/IError';
import { jwtVerify, bcrypt, authUser } from '../../warehouse/middlewares';
import { terminal } from '../../services/terminal';

// Use the router middleware to handle requests to the /user endpoint
router

  // First, handle requests for a specific username
  .route('/user::username')

  // Handle GET requests
  // Used to retrieve a user's data from the database
  .get(jwtVerify, async (req: Request, res: Response) => {
    terminal(
      `Received ${req.method} request at terminal '${req.baseUrl}${req.url}' endpoint`
    );
    console.log('HERE ', req.params);
    try {
      // Attempt to find the user in the database
      const user = await User.find({ username: req.params['username'] });

      // No user found
      if (user.length === 0) {
        const error: IError = {
          status: 401,
          message: `Fail: User [${req.params['username']}] does not exist`,
          exists: false,
        };
        terminal(`Fail: ${error.message}`);
        console.log('FAILED');
        return res.status(error.status).json(error);
      }

      // User found
      terminal(
        `Success: User [${req.params['username']}] document retrieved from MongoDB collection`
      );
      console.log(user);

      // Return the user's data
      return res.status(200).json(user[0]);

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

// Use the router middleware to handle requests to the /user endpoint
router

  // Handle generic requests not including a username parameter
  .route('/user')

  // Handle GET requests
  // Retrieve all users from the database
  .get(jwtVerify, async (req: Request, res: Response) => {
    terminal(
      `Received ${req.method} request at terminal '${req.baseUrl}${req.url}' endpoint`
    );
    try {
      // Attempt to find all users in the database
      const users = await User.find({});

      // No users found
      if (users.length === 0) {
        const error: IError = {
          status: 401,
          message: `Fail: No user data exists`,
          exists: false,
        };
        terminal(`Fail: ${error.message}`);
        return res.status(error.status).json(error);
      }

      // Users found
      terminal(`Success: User data exists in MongoDB collection`);
      // Return all users' data
      return res.status(200).json(users);

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

  // Handle PUT requests
  // Utilized to update user settings
  .put(jwtVerify, async (req: Request, res: Response) => {
    terminal(
      `Received ${req.method} request at terminal '${req.baseUrl}${req.url}' endpoint`
    );

    // Deconstruct the request body and res.locals
    const { username, firstName, lastName, darkMode, refreshRate } = req.body;
    const {
      jwt: { id },
    } = res.locals;
    try {
      terminal(`Searching for user [${username}] in MongoDB`);

      // Attempt to find the user in the database
      const user = await User.find({ _id: id });
      terminal(`Success: MongoDB query executed [${username}]`);

      // No user found
      if (user.length === 0) {
        const error: IError = {
          status: 401,
          message: `Fail: User [${username}] does not exist`,
          exists: false,
        };
        terminal(`Fail: ${error.message}`);
        return res.status(error.status).json(error);
      }

      // User found --> Update user settings
      await User.updateOne(
        { _id: id },
        {
          username: username,
          firstName: firstName,
          lastName: lastName,
          darkMode: darkMode,
          refreshRate: refreshRate,
        }
      );
      terminal(`Success: User [${req.body.username}] document updated`);
      return res.status(201).json({ success: true });

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

  // Handle DELETE requests
  // Utilized to delete admin accounts
  .delete(authUser, bcrypt, jwtVerify, async (req: Request, res: Response) => {
    terminal(
      `Received ${req.method} request at terminal '${req.baseUrl}${req.url}' endpoint`
    );
    try {
      // Attempt to delete the user from the database
      const response = await User.deleteOne({ username: req.body.username });

      // No user found
      if (response.deletedCount === 0) {
        const error: IError = {
          status: 401,
          message: `Fail: User [${req.body.username}] either does not exist or could not be deleted`,
        };
        terminal(`Fail: ${error.message}`);
        return res.status(error.status).json({ error });
      }

      // User found
      terminal(
        `Success: User [${req.body.username}] deleted from MongoDB collection`
      );
      return res.status(200).json({ deleted: true });

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
