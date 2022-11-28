import 'dotenv/config';
import { IConfig } from './interfaces/IConfig';

// Create a Config class that will be used to access the environment variables
// It will have type IConfig
export const config: IConfig = {
  // Destructure the environment variables
  // First the MongoDB connection parameters
  mongodb: {
    url: process.env.MONGO_URL,
    port: Number(process.env.MONGO_PORT),
    username: process.env.MONGO_USERNAME,
    password: process.env.MONGO_PASSWORD,
    collection: process.env.MONGO_COLLECTION,
  },
  // Next the JWT secrets
  jwt: {
    access: process.env.JWT_ACCESS_SECRET,
    refresh: process.env.JWT_REFRESH_SECRET,
  },
};

// Accessing the environment variables in this manner allows us to keep the environment variables
// in a separate file, and not have to worry about exposing them in the code
