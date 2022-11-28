import router from '../router';
import { Request, Response } from 'express';
import { IError } from '../../interfaces/IError';
import { jwtVerify } from '../../warehouse/middlewares';
import { terminal } from '../../services/terminal';
import { execSync } from 'child_process';
import yaml from 'js-yaml';
import fs from 'fs';
import findup from 'findup-sync';

// Use the router middleware to handle requests to the /alert endpoint
// This endpoint is used to get alerts from the Prometheus API
router.route('/alert').get(jwtVerify, async (req: Request, res: Response) => {
  // Log the request to the Node terminal
  terminal({ req });
  terminal(
    `Received ${req.method} request at terminal '${req.baseUrl}${req.url}' endpoint`
  );
  terminal(`URL IS ${req.url}`);

  // Deconstruct the query parameters from the request
  const { id, ns, q, expr, dur } = req.query;

  try {
    console.log('enters alert');
    // Attempt to find the path to the alert-rules.yaml file
    const fileLoc = findup('alert-rules.yaml');
    console.log('fileloc', fileLoc);
    // Load the alert-rules.yaml file based on the path found above
    const doc: any = yaml.load(fs.readFileSync(`${fileLoc}`, 'utf8'));
    // Rewrite the values from the alert-rules.yaml file based on the query parameters
    doc['additionalPrometheusRulesMap']['custom-rules']['groups'][0][
      'rules'
    ][0]['alert'] = q;
    doc['additionalPrometheusRulesMap']['custom-rules']['groups'][0][
      'rules'
    ][0]['expr'] = expr;
    doc['additionalPrometheusRulesMap']['custom-rules']['groups'][0][
      'rules'
    ][0]['for'] = dur;

    // Save the modified doc to the alert-rules.yaml file
    fs.writeFile(`${fileLoc}`, yaml.dump(doc), (err) => {
      if (err) {
        console.log('error with overwriting the yaml file');
        console.log(err);
      }
      // Attempts to deploy the modified alert-rules.yaml file to the cluster
      // CAUTION: NEVER pass user input to execSync without sanitizing it first
      // This is a security risk due to the fact that execSync will execute the command as a shell script
      const term = execSync(
        // Use Helm to upgrade the Prometheus chart with the modified alert-rules.yaml file
        // Will deploy into the "monitor" namespace
        `helm upgrade --reuse-values -f ${fileLoc} prometheus prometheus-community/kube-prometheus-stack -n monitor`,
        { encoding: 'utf-8' }
        // Will return the terminal output from the command into term
      );
      // Log the output from the terminal to the Node terminal
      terminal(term);
    });

    // Send a response to the client
    return res.status(200).json(q);

    // Error handling
  } catch (err) {
    const error: IError = {
      status: 500,
      message: `Unable to alert fulfill ${req.method} request: ${err}`,
    };
    terminal(`Fail in alert page: ${error.message}`);
    return res.status(error.status).json(error);
  }
});

// Export this route on the router
export default router;
