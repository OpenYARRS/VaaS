import router from '../router';
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Cluster } from '../../models';
import { IError } from '../../interfaces/IError';
import { jwtVerify } from '../../warehouse/middlewares';
import { terminal } from '../../services/terminal';

// Use the router middleware to handle requests to the /cluster endpoint
router
  // Will handle requests to the /cluster endpoint
  // A specific cluster name is denoted, so only that cluster will be addressed
  .route('/cluster::name')

  // GET request handling
  // This endpoint is used to retrieve a specific cluster
  // Only performed if the user's JWT is validated by the jwtVerify middleware
  .get(jwtVerify, async (req: Request, res: Response) => {
    terminal(
      `Received ${req.method} request at terminal '${req.baseUrl}${req.url}' endpoint`
    );

    // If jwtVerify middleware does not error out, we can assume the user is authenticated
    try {
      // Find the cluster in the database using its name
      const response = await Cluster.find({ name: req.params['name'] });

      // If the cluster does not exist, return an error
      if (response.length === 0) {
        const error: IError = {
          status: 401,
          message: `Fail: Cluster [${req.params['name']}] does not exist`,
        };
        terminal(`Fail: ${error.message}`);
        return res.status(error.status).json(error);
      }

      // If the cluster exists, return it
      terminal(
        `Success: Cluster [${req.params['name']}] document retrieved from MongoDB collection`
      );
      return res.status(200).json(response[0]);

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

router
  // Handle requests to the /cluster endpoint
  .route('/cluster')

  // GET request handling
  // This endpoint is used to retrieve all clusters
  // Only performed if the user's JWT is validated by the jwtVerify middleware
  .get(jwtVerify, async (req: Request, res: Response) => {
    terminal(
      `Received ${req.method} request at terminal '${req.baseUrl}${req.url}' endpoint`
    );

    // If jwtVerify middleware does not error out, we can assume the user is authenticated
    try {
      // Find all clusters in the database
      const clusters = await Cluster.find({});
      if (clusters.length === 0) {
        const error: IError = {
          status: 401,
          message: `Fail: No cluster data exists`,
        };
        return res.status(error.status).json(error);
      }

      // If clusters exist, return them
      terminal(
        `Success: All cluster documents retrieved from MongoDB collection`
      );
      return res.status(200).json(clusters);

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

  // POST request handling
  // This endpoint is used to create a new cluster
  // Only performed if the user's JWT is validated by the jwtVerify middleware
  .post(jwtVerify, async (req: Request, res: Response) => {
    terminal(
      `Received ${req.method} request at terminal '${req.baseUrl}${req.url}' endpoint`
    );

    // Validate request body and return error if missing required data
    if (
      !req.body.url ||
      !req.body.k8_port ||
      !req.body.faas_port ||
      !req.body.faas_username ||
      !req.body.faas_password ||
      !req.body.name ||
      !req.body.description
    ) {
      const error: IError = {
        status: 500,
        message: 'Unable to fulfill request without all fields completed',
      };
      terminal(`Fail: ${error.message}`);
      return res.status(error.status).json(error);
    }

    // If jwtVerify middleware does not error out and we have all required data, we can proceed
    try {
      // Deconstruct cluster data from request body
      const {
        url,
        k8_port,
        faas_port,
        faas_username,
        faas_password,
        name,
        description,
      } = req.body;

      // Attempt to find an existing cluster with the same name as the one being created
      terminal(`Searching for cluster [${name}] in MongoDB`);
      const cluster = await Cluster.find({ name: name });
      terminal(`Success: MongoDB query executed [${name}]`);

      // If a cluster with the same name exists, return an error
      if (cluster[0]) {
        const error: IError = {
          status: 401,
          message: `Cluster [${cluster[0].name}] already exists`,
          exists: true,
        };
        terminal(`Fail: ${error.message}`);
        return res.status(error.status).json(error);
      }

      // If a cluster with the same name does not exist, create a new cluster
      const clusterId = new Types.ObjectId();
      // Generate authorization token for use with OpenFaaS
      // This token is used to authenticate the user with OpenFaaS when making requests
      const encodeAuth = Buffer.from(
        `${faas_username}:${faas_password}`
      ).toString('base64');
      const authorization = `Basic ${encodeAuth}`;
      const attempt = new Cluster({
        _id: clusterId,
        url,
        k8_port,
        faas_port,
        authorization,
        name,
        description,
        favorite: [],
      });

      // Wait until the new cluster is saved to the database
      await attempt.save();
      terminal(
        `Success: New cluster [${clusterId}] stored in MongoDB collection`
      );
      // Return a message indicating the cluster was created
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

  // PUT request handling
  // This endpoint is used to update an existing cluster
  .put(jwtVerify, async (req: Request, res: Response) => {
    terminal(
      `Received ${req.method} request at terminal '${req.baseUrl}${req.url}' endpoint`
    );

    // Validate request body and return error if missing required data
    if (!req.body.clusterId) {
      const error: IError = {
        status: 500,
        message: 'Unable to fulfill request without clusterId',
      };
      terminal(`Fail: ${error.message}`);
      return res.status(error.status).json(error);
    }
    if (
      (req.body.faas_username && !req.body.faas_password) ||
      (req.body.faas_password && !req.body.faas_username)
    ) {
      const error: IError = {
        status: 500,
        message:
          'Unable to fulfill request without both OpenFaaS credentials, username and password',
      };
      terminal(`Fail: ${error.message}`);
      return res.status(error.status).json(error);
    }

    // If jwtVerify middleware does not error out and we have all required data, we can proceed
    try {
      // Deconstruct cluster info from request body
      const {
        clusterId,
        url,
        k8_port,
        faas_port,
        faas_username,
        faas_password,
        name,
        description,
      } = req.body;

      // Deconstruct JWT from res.locals
      const {
        jwt: { id },
      } = res.locals;

      // Attempt to find an existing cluster with the same name as the one being created
      terminal(`Searching for cluster [${name}] in MongoDB`);
      const cluster = await Cluster.find({ _id: clusterId });
      terminal(`Success: MongoDB query executed [${name}]`);
      if (cluster.length === 0) {
        const error: IError = {
          status: 401,
          message: `Fail: Cluster [${name}] does not exist`,
          exists: false,
        };
        terminal(`Fail: ${error.message}`);
        return res.status(error.status).json(error);
      }

      let authorization;
      if (faas_username && faas_password) {
        const encodeAuth = Buffer.from(
          `${faas_username}:${faas_password}`
        ).toString('base64');
        authorization = `Basic ${encodeAuth}`;
      }

      // Check if the favorite status of the cluster is being updated
      switch (req.body.favorite) {
        // If adding as a favorite, push the favorite id into the cluster
        case true: {
          await Cluster.updateOne(
            { _id: clusterId },
            {
              url: url,
              k8_port: k8_port,
              faas_port: faas_port,
              authorization: authorization,
              name: name,
              description: description,
              $push: { favorite: id },
            }
          );
          terminal(
            `Success: Cluster [${req.body.clusterId}] added to favorites`
          );
          return res.status(201).json({ success: true });
        }

        // If removing as a favorite, pull the favorite id from the cluster
        case false: {
          await Cluster.updateOne(
            { _id: clusterId },
            {
              url: url,
              k8_port: k8_port,
              faas_port: faas_port,
              authorization: authorization,
              name: name,
              description: description,
              $pull: { favorite: id },
            }
          );
          terminal(
            `Success: Cluster [${req.body.clusterId}] removed from favorites`
          );
          return res.status(201).json({ success: true });
        }

        // If the favorite status is not being updated, update the cluster, ignoring the favorite status
        case undefined: {
          await Cluster.updateOne(
            { _id: clusterId },
            {
              url: url,
              k8_port: k8_port,
              faas_port: faas_port,
              authorization: authorization,
              name: name,
              description: description,
            }
          );
          terminal(`Success: Cluster [${req.body.clusterId}] document updated`);
          return res.status(201).json({ success: true });
        }
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
  })

  // DELETE request handling
  // This endpoint is used to delete an existing cluster
  .delete(jwtVerify, async (req: Request, res: Response) => {
    terminal(
      `Received ${req.method} request at terminal '${req.baseUrl}${req.url}' endpoint`
    );

    // Validate request body and return error if missing required data
    if (!req.body.clusterId) {
      const error: IError = {
        status: 500,
        message: 'Unable to fulfill request without clusterId',
      };
      terminal(`Fail: ${error.message}`);
      return res.status(error.status).json(error);
    }

    // If jwtVerify middleware does not error out and we have all required data, we can proceed
    try {
      // Attempt to delete the first cluster with this id from MongoDB
      const response = await Cluster.deleteOne({ _id: req.body.clusterId });
      if (response.deletedCount === 0) {
        const error: IError = {
          status: 401,
          message: `Fail: Cluster [${req.body.clusterId}] either does not exist or could not be deleted`,
        };
        terminal(`Fail: ${error.message}`);
        return res.status(error.status).json({ error });
      }

      // If the cluster was successfully deleted, return a success message
      terminal(
        `Success: Cluster [${req.body.clusterId}] deleted from MongoDB collection`
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
