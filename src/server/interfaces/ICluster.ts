import { Document, Types } from 'mongoose';

// Interface for the Cluster model
export interface ICluster extends Document {
  _id: Types.ObjectId;
  url: string;
  k8_port: number;
  faas_port: number;
  authorization: string;
  name: string;
  description: string;
  favorite: string[];
}
