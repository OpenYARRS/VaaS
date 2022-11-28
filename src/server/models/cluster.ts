import { Schema } from 'mongoose';
import Database from '../mongoDb';
import { ICluster } from '../interfaces/ICluster';
const {
  mongo: { model },
} = Database;

// Create the cluster schema
const clusterSchema: Schema<ICluster> = new Schema<ICluster>({
  // Basic cluster information
  _id: { type: Schema.Types.ObjectId, required: true },
  url: String,

  // Kubernetes port
  k8_port: Number,

  // OpenFaaS port
  faas_port: Number,

  // Authorization string for authentication with OpenFaaS
  authorization: String,

  // Basic cluster information
  name: String,
  description: String,

  // Favorited by user?
  favorite: [Schema.Types.ObjectId],
});

// THIRD PARAMETER DEFINES DEFAULT COLLECTION NAME
export default model<ICluster>('Cluster', clusterSchema, 'clusters');
