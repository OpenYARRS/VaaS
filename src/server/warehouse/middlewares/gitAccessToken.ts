import { Request, Response } from 'express';
import { User } from '../../models';
import { IError } from '../../interfaces/IError';
import { terminal } from '../../services/terminal';
import fetch from 'node-fetch';
import 'dotenv';

// Middleware to verify a user's Github access token
export default async (
  req: Request,
  res: Response,
  next: (param?: unknown) => void
): Promise<void | Response<any, Record<string, any>>> => {
  terminal(`Received ${req.method} request at 'gitAccessToken' middleware`);

  // Pull code from the request body
  const { code } = req.body;

  try {
    const gitClientID = process.env.GITHUB_CLIENT_ID;
    const gitSecret = process.env.GITHUB_SECRET;

    // Send a POST request to Github to exchange the code for an access token
    const accessToken = await fetch(
      `https://github.com/login/oauth/access_token?client_id=${gitClientID}&client_secret=${gitSecret}&code=${code}`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      }
    ).then((res) => res.json());

    // Store the access token
    res.locals.accessToken = accessToken;
    terminal(
      `Success: GithubToken received: ${res.locals.accessToken.access_token}`
    );

    // Use the token to request userInfo
    const { access_token, token_type } = res.locals.accessToken;
    const authHeader = `${token_type} ${access_token}`;
    const gitHubData = await fetch(`https://api.github.com/user`, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
      },
    }).then((res) => res.json());
    console.log(`USER DATA IS : `, gitHubData);

    // Set up account information
    // eslint-disable-next-line prefer-const
    let { name, login, id } = gitHubData;
    const firstName = name.split(' ')[0];
    const lastName = name.split(' ')[1];
    id = id.toString();
    const newAcctInfo = {
      firstName,
      lastName,
      username: login,
      password: id,
      darkMode: false,
    };

    // Store the new account information
    res.locals.newAcctInfo = newAcctInfo;
    const { username } = newAcctInfo;

    terminal(`Searching for user [${username}] in MongoDB`);

    // Attempt to find the user in the database
    const user = await User.find({ username: username });
    terminal(`Success: MongoDB query executed [${username}]`);
    console.log(user);

    // User found
    if (user[0]) {
      terminal(`Success: User [${username}] found in DB`);

      // Store information
      res.locals.hasAcct = true;
      res.locals.user = user[0];

      // Move on to the next middleware
      return next();

      // User not found
    } else {
      const error: IError = {
        status: 401,
        message: 'Invalid credentials',
        invalid: true,
      };
      terminal(`Fail: ${error.message}`);
      res.locals.hasAcct = false;
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
