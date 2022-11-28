import router from '../router';
import { Request, Response } from 'express';
import fetch from 'node-fetch';
import { Cluster } from '../../models';
import { IError } from '../../interfaces/IError';
import { jwtVerify } from '../../warehouse/middlewares';
import { terminal } from '../../services/terminal';

// Use the router middleware to handle requests to the /prom endpoint
// First, handle GET requests
router.route('/prom').get(jwtVerify, async (req: Request, res: Response) => {
  terminal(
    `Received ${req.method} request at terminal '${req.baseUrl}${req.url}' endpoint`
  );
  terminal(req.query);
  terminal(`URL IS ${req.url}`);

  // Throw errors if missing required parameters
  if (!req.query.id || !req.query.ns || !req.query.q) {
    const error: IError = {
      status: 500,
      message:
        'Unable to fulfill request without all parameters (id, ns, q) passed',
    };
    terminal(`Fail: ${error.message}`);
    return res.status(error.status).json(error);
  }

  // Deconstruct the query parameters from the request
  const { id, ns, q } = req.query;
  try {
    // Attempt to find the cluster in the database
    const cluster = await Cluster.findOne({ _id: id });
    if (cluster) {
      const { url, k8_port, faas_port } = cluster;
      let port: number;
      switch (ns) {
        // Check if the namespace for the query is k8 or faas
        // Will set the port accordingly
        case 'k8':
          port = k8_port;
          break;
        case 'faas':
          port = faas_port;
          break;

        // Throw an error if the namespace is not k8 or faas
        default: {
          const error: IError = {
            status: 401,
            message: `Fail: Invalid namespace [${ns}] passed (k8 || faas)`,
          };
          return res.status(error.status).json(error);
        }
      }

      // Attempt to fetch the queried data from the cluster
      const metric = await fetch(`${url}:${port}/api/v1/query?query=${q}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }).then((res) => res.json());
      terminal(`Success: PromQL query [${q}] executed`);

      // Return the queried data
      return res.status(200).json(metric);

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
