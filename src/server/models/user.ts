import { Schema } from 'mongoose';
import Database from '../mongoDb';
import { IUser } from '../interfaces/IUser';
const {
  mongo: { model },
} = Database;

// Create the user schema
const userSchema: Schema<IUser> = new Schema<IUser>({
  // Basic user information
  _id: { type: Schema.Types.ObjectId, required: true },
  firstName: String,
  lastName: String,
  username: String,
  password: String,

  // Dark mode preference
  darkMode: Boolean,

  // How often to refresh the dashboard?
  refreshRate: Number,
});

// THIRD PARAMETER DEFINES DEFAULT COLLECTION NAME
export default model<IUser>('User', userSchema, 'users');
