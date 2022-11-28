import mongoose, { Connection, Mongoose } from 'mongoose';
import { config } from './config';
import { IConfig } from './interfaces/IConfig';

// Create a Database class that will be used to connect to the database
class Database {
  // Private properties to be used in the class - only accessible within the class
  // Property _config is of type IConfig
  private readonly _config: IConfig;
  // Property _mongo is of type Mongoose
  private readonly _mongo: Mongoose;

  // Constructor to initialize the class
  constructor(config: IConfig, mongo: Mongoose) {
    // Store the config and mongo properties in the class
    this._config = config;
    this._mongo = mongo;
  }

  // Method to instantiate the database connection
  // Return is of type Mongoose
  connect(): Mongoose {
    console.log('Attempting to connect to MongoDB cluster!');

    // Destructuring the config object to get the database connection parameters
    const {
      mongodb: { url, port, collection, password, username },
    } = this._config;

    // Determine whether the database connection is local or remote
    // Use ternary operator to prefix the connection string with the appropriate protocol
    let protocol: string;
    url === 'localhost' || url === '127.0.0.1'
      ? (protocol = 'mongodb://')
      : (protocol = 'mongodb+srv://');

    // Construct the connection string using the connection parameters and protocol
    // Modify URI Syntax based on whether username and password were provided
    const uri =
      username && password
        ? `${protocol}${username}:${password}${url}/${collection}`
        : `${protocol}${url}:${port}/${collection}`;

    // Connect to the database using the connection string
    this._mongo.connect(uri);

    // Create a db object with type Connection, and store the mongo connection in it
    const db: Connection = this._mongo.connection;
    // Log whether the connection was successful or not
    db.on('error', console.error.bind(console, 'Connection error:'));
    db.once('open', () => {
      console.log(`Successfully connected to MongoDB cluster: ${uri}`);
    });

    // Return the mongo connection
    return mongoose;
  }

  // Method to access the private _mongo property
  get mongo() {
    return this._mongo;
  }

  // Method to access the private _config property
  get config() {
    return this._config;
  }
}

// Export a frozen instance of the Database class
// Freezing the instance prevents the class from being modified
// It also prevents the class from being instantiated more than once
export default Object.freeze(new Database(config, mongoose));
