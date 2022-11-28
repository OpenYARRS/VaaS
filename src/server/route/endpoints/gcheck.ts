import router from '../router';
import { Request, Response } from 'express';
import { terminal } from '../../services/terminal';
import { IError } from '../../interfaces/IError';
import { User } from '../../models';

// Use the router middleware to handle requests to the /gcheck endpoint
// This endpoint is used to authenticate users via Google and check
// if they already have an account
router.route('/gcheck').post((req: Request, res: Response) => {
  // Pull the username from the request body
  const { username } = req.body;

  // Attempt to find a user with the given username in the database
  User.find({ username: username })
    .then((response) => {
      console.log(response);
      if (response[0]) res.status(200).json(true);
      else res.status(200).json(false);
    })

    // Error handling
    .catch((err) => {
      const error: IError = {
        status: 500,
        message: `Failed at gcheck: ${err}`,
      };
      terminal(`fail: ${error}`);
    });
});

// Export this route on the router
export default router;
