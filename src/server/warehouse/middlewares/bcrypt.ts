import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { User } from '../../models';
import { IError } from '../../interfaces/IError';
import bcrypt from 'bcrypt';
import { terminal } from '../../services/terminal';

// Middleware to hash and compare passwords
export default async (
  req: Request,
  res: Response,
  next: (param?: unknown) => void
): Promise<void | Response> => {
  terminal(`Received ${req.method} request at 'bcrypt' middleware`);
  console.log(res.locals.newAcctInfo);

  // Pull the password from the request body
  let { password } = req.body;

  // If this is a new account, pull the password from the response object
  if (res.locals.newAcctInfo) {
    password = res.locals.newAcctInfo.password;
  }
  console.log('PASSWORD: ', password);

  // Set number of rounds for hashing
  const saltRounds = 10;

  /* REGISTER USER */
  // Password has not yet been hashed --> Hash it
  if (!res.locals.hashedPassword) {
    res.locals.userId = new Types.ObjectId();
    res.locals.hashedPassword = await bcrypt.hash(password, saltRounds);
    terminal(`Success: Password hashed`);

    // Password has already been hashed --> Compare it
  } else {
    /* LOGIN USER OR VERIFY PASSWORD FOR DELETE USER */
    let { username } = req.body;
    if (res.locals.newAcctInfo) {
      username = res.locals.newAcctInfo.username;
    }
    terminal(`Searching for user [${username}] in MongoDB`);

    // Find the user in the database
    const user = await User.find({ username: username });
    terminal(`Success: MongoDB query executed [${username}]`);
    res.locals.userId = user[0]._id;

    // Compare the password to the hashed password for the retrieved user
    const result: boolean = await bcrypt.compare(
      password,
      res.locals.hashedPassword
    );

    // Passwords do not match
    if (!result) {
      const error: IError = {
        status: 401,
        message: 'Invalid credentials',
        invalid: true,
      };
      terminal(`Fail: ${error.message}`);
      return res.status(error.status).json(error);
    }
  }

  // Move on to the next middleware
  terminal(`Success: Forwarding ${req.method} request to next middleware`);
  return next();
};
