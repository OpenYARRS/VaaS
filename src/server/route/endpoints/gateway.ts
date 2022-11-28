import router from '../router';
import { Request, Response } from 'express';
import fetch from 'node-fetch';
import { Cluster } from '../../models';
import { IError } from '../../interfaces/IError';
import { jwtVerify } from '../../warehouse/middlewares';
import { terminal } from '../../services/terminal';

// Use the router middleware to handle requests to the /gateway endpoint
// In kubernetes, gateways are used to route traffic to services

// Namely, this file is used to handle PromQL queries from the frontend

// Start with GET request handling
router.route('/gateway').get(jwtVerify, async (req: Request, res: Response) => {
  // If jwtVerify middleware does not error out, we can assume the user has been authenticated
  terminal(
    `Received ${req.method} request at terminal '${req.baseUrl}${req.url}' endpoint`
  );
  terminal(req.query);

  // Throw errors if missing required parameters
  if (!req.query.id || !req.query.q) {
    const error: IError = {
      status: 500,
      message:
        'Unable to fulfill request without all parameters (id, q) passed',
    };
    terminal(`Fail: ${error.message}`);
    return res.status(error.status).json(error);
  }

  // Deconstruct the query parameters from the request
  const { id, q, type } = req.query;
  console.log('q', q);

  try {
    // Attempt to find the cluster in the database
    const cluster = await Cluster.findOne({ _id: id });
    if (cluster) {
      // If the cluster is found, deconstruct the cluster's info
      const { url, k8_port } = cluster;

      // Attempt to fetch the queried data from the cluster
      const data = await fetch(`${url}:${k8_port}/api/v1/query?query=${q}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }).then((res) => res.json());
      terminal(`Success: PromQL query [${q}] executed`);

      // Cleaning up the data, per the query type, to send back to the front end
      // Only handles a single query type for now
      if (type === 'avg') {
        const dataCleaned: { function_name: string; value: number } = {
          function_name: data.data.result[0].metric.function_name,
          value: data.data.result[0].value[1],
        };
        return res.status(200).json(dataCleaned);
      }

      // Error handling
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
});

// Export this route on the router
export default router;
