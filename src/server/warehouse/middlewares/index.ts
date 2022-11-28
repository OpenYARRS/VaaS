import authUser from './authUser';
import bcrypt from './bcrypt';
import jwtCreator from './jwtCreator';
import jwtVerify from './jwtVerify';
import gitAccessToken from './gitAccessToken';
import gitAuthUser from './gitAuthUser';

// Coalesce all middlewares into a single object for export
// Idea is to improve the code's readability and modularity
export { authUser, bcrypt, jwtCreator, jwtVerify, gitAccessToken, gitAuthUser };
