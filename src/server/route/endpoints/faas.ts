import router from '../router';
import { Request, Response } from 'express';
import fetch from 'node-fetch';
import { Cluster } from '../../models';
import { IError } from '../../interfaces/IError';
import { jwtVerify } from '../../warehouse/middlewares';
import { terminal } from '../../services/terminal';

// Use the router middleware to handle requests to the /faas endpoint
router
  // Handle requests to specific function endpoints
  .route('/faas::functionName')

  // GET request handling
  // This endpoint is used to retrieve a function from OpenFaaS
  .get(jwtVerify, async (req: Request, res: Response) => {
    terminal(
      `Received ${req.method} request at terminal '${req.baseUrl}${req.url}' endpoint`
    );
    // Throw errors if missing required parameters
    // In this case, we will want to know the specific cluster and the function name
    if (!req.headers.clusterid || !req.params.functionName) {
      const error: IError = {
        status: 500,
        message:
          'Unable to fulfill request without all parameters (id, functionName) passed',
      };
      terminal(`Fail: ${error.message}`);
      return res.status(error.status).json(error);
    }
    // Deconstruct clusterId and functionName from the request
    const { clusterid } = req.headers;
    const { functionName } = req.params;
    try {
      // Attempt to find the cluster in the database
      const cluster = await Cluster.findOne({ _id: clusterid });
      if (cluster) {
        const { url, faas_port, authorization } = cluster;
        const functionInfo = await fetch(
          `${url}:${faas_port}/system/function/${functionName}`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: authorization,
            },
          }
        ).then((res) => res.json());
        terminal(
          `Success: OpenFaaS function [${functionName} @ ${url}:${faas_port}] retrieved`
        );
        // If the function is found, return the function info
        return res.status(200).json(functionInfo);

        // Error handling for if the cluster is not found
      } else {
        const error: IError = {
          status: 401,
          message: `Fail: Cluster [${clusterid}] does not exist`,
          exists: false,
        };
        terminal(`Fail: ${error.message}`);
        return res.status(error.status).json(error);
      }
    } catch (err) {
      const error: IError = {
        status: 500,
        message: `Unable to fulfill ${req.method} request: ${err}`,
      };
      terminal(`Fail: ${error.message}`);
      return res.status(error.status).json(error);
    }
  });

// Use the router middleware for the /faas endpoint
router

  // Will handle general requests to the /faas endpoint that do not specify a function name
  .route('/faas')

  // GET request handling
  // This endpoint is used to retrieve all functions from OpenFaaS
  .get(jwtVerify, async (req: Request, res: Response) => {
    terminal(
      `Received ${req.method} request at terminal '${req.baseUrl}${req.url}' endpoint`
    );
    // Check to see if the OpenFaasStore is passed in or not
    if (req.query.OpenFaaSStore) {
      // If so, will fetch all functions from the master function store hosted by OpenFaaS
      try {
        const functions = await fetch(
          'https://raw.githubusercontent.com/openfaas/store/master/functions.json'
        ).then((res) => res.json());
        terminal(`Success: OpenFaaS Store functions retrieved`);
        // Return the functions
        return res.status(200).json(functions);

        // Error handling
      } catch (err) {
        const error: IError = {
          status: 500,
          message: `Unable to fulfill ${req.method} request: ${err}`,
        };
        terminal(`Fail: ${error.message}`);
        return res.status(error.status).json(error);
      }
    }

    // If we are missing a clusterId in the request, throw an error
    if (!req.headers.id) {
      const error: IError = {
        status: 500,
        message: 'Unable to fulfill request without parameter (id) passed',
      };
      terminal(`Fail: ${error.message}`);
      return res.status(error.status).json(error);
    }
    // Deconstruct the clusterId from the request
    const { id } = req.headers;
    try {
      // Attempt to find and retrieve the cluster from the database
      const cluster = await Cluster.findOne({ _id: id });
      if (cluster) {
        // Deconstruct the cluster info
        const { url, faas_port, authorization } = cluster;
        // Fetch the deployed functions for that cluster from OpenFaaS
        const functionInfo = await fetch(
          `${url}:${faas_port}/system/functions`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: authorization,
            },
          }
        ).then((res) => res.json());
        terminal(`Success: Deployed OpenFaaS functions retrieved`);
        // Return all deployed functions for that cluster
        return res.status(200).json(functionInfo);

        // Error handling for if the cluster is not found
      } else {
        const error: IError = {
          status: 401,
          message: `Fail: Cluster [${id}] does not exist`,
          exists: false,
        };
        terminal(`Fail: ${error.message}`);
        return res.status(error.status).json(error);
      }
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
  // This endpoint is used to deploy a function to OpenFaaS
  .post(jwtVerify, async (req: Request, res: Response) => {
    terminal(
      `Received ${req.method} request at terminal '${req.baseUrl}${req.url}' endpoint`
    );
    // Validate request body and throw errors if missing required parameters
    if (!req.body.clusterId || !req.body.service || !req.body.image) {
      const error: IError = {
        status: 500,
        message:
          'Unable to fulfill request without all parameters (clusterId, service, image) passed',
      };
      terminal(`Fail: ${error.message}`);
      return res.status(error.status).json(error);
    }
    try {
      // Deconstruct the clusterId, service, and image from the request
      const { clusterId, service, image } = req.body;

      // Attempt to find the cluster in the database
      const cluster = await Cluster.findOne({ _id: clusterId });
      if (cluster) {
        // Deconstruct the cluster info
        const { url, faas_port, authorization } = cluster;

        // Send a POST request to OpenFaaS to deploy the function to the cluster
        await fetch(`${url}:${faas_port}/system/functions`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: authorization,
          },
          body: JSON.stringify({
            service,
            image,
          }),
        });
        terminal(`Success: OpenFaaS function [${service}] deployed`);
        return res.status(200).json({ success: true });

        // Error handling for if the cluster is not found
      } else {
        const error: IError = {
          status: 401,
          message: `Fail: Cluster [${clusterId}] does not exist`,
          exists: false,
        };
        terminal(`Fail: ${error.message}`);
        return res.status(error.status).json(error);
      }
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
  // This endpoint is used to delete a function from OpenFaaS
  .delete(async (req: Request, res: Response) => {
    terminal(
      `Received ${req.method} request at terminal '${req.baseUrl}${req.url}' endpoint`
    );

    // Throw an error if missing the required parameters
    if (!req.body.clusterId || !req.body.functionName) {
      const error: IError = {
        status: 500,
        message:
          'Unable to fulfill request without all parameters (clusterId, functionName) passed',
      };
      terminal(`Fail: ${error.message}`);
      return res.status(error.status).json(error);
    }
    try {
      const { clusterId, functionName } = req.body;

      // Attempt to find the cluster in the database
      const cluster = await Cluster.findOne({ _id: clusterId });
      if (cluster) {
        const { url, faas_port, authorization } = cluster;

        // Send a DELETE request to OpenFaaS to delete the function from the cluster
        await fetch(`${url}:${faas_port}/system/functions`, {
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: authorization,
          },
          body: JSON.stringify({
            functionName,
          }),
        }).then((res) => res.text());
        terminal(`Success: OpenFaaS function [${functionName}] deleted`);
        return res.status(200).json({ success: true });

        // Error handling for if the cluster is not found
      } else {
        const error: IError = {
          status: 401,
          message: `Fail: Cluster [${clusterId}] does not exist`,
          exists: false,
        };
        terminal(`Fail: ${error.message}`);
        return res.status(error.status).json(error);
      }
    } catch (err) {
      const error: IError = {
        status: 500,
        message: `Unable to fulfill ${req.method} request: ${err}`,
      };
      terminal(`Fail: ${error.message}`);
      return res.status(error.status).json(error);
    }
  });

// Use the router middleware to handle requests to the /faas/invoke endpoint
router
  .route('/faas/invoke')

  // POST request handling
  // This endpoint is used to invoke a function on OpenFaaS
  .post(jwtVerify, async (req: Request, res: Response) => {
    terminal(
      `Received ${req.method} request at terminal '${req.baseUrl}${req.url}' endpoint`
    );

    // Throw an error if missing the required parameters
    if (!req.body.clusterId || !req.body.functionName) {
      const error: IError = {
        status: 500,
        message:
          'Unable to fulfill request without all parameters (clusterId, functionName) passed',
      };
      terminal(`Fail: ${error.message}`);
      return res.status(error.status).json(error);
    }
    try {
      const { clusterId, functionName, data } = req.body;

      // Attempt to find the cluster in the database
      const cluster = await Cluster.findOne({ _id: clusterId });

      // Case for if we were provided data to send to the function
      if (cluster && data) {
        const { url, faas_port, authorization } = cluster;
        const body = data;

        // Send a POST request to OpenFaaS to invoke the function on the cluster
        // while passing in the provided data
        const func = await fetch(
          `${url}:${faas_port}/function/${functionName}`,
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: authorization,
            },
            body: body,
          }
        ).then((res) => res.text());
        terminal(`Success: OpenFaaS function [${functionName}] invoked`);
        return res.status(200).json(func);

        // Case for if we were not provided data to send to the function
      } else if (cluster && !data) {
        const { url, faas_port, authorization } = cluster;

        // Send a POST request to OpenFaaS to invoke the function on the cluster
        const func = await fetch(
          `${url}:${faas_port}/function/${functionName}`,
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: authorization,
            },
          }
        ).then((res) => res.text());
        terminal(`Success: OpenFaaS function [${functionName}] invoked`);
        return res.status(200).json(func);

        // Error handling for if the cluster is not found
      } else {
        const error: IError = {
          status: 401,
          message: `Fail: Cluster [${clusterId}] does not exist`,
          exists: false,
        };
        terminal(`Fail: ${error.message}`);
        return res.status(error.status).json(error);
      }
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
