import clusterMetric from './Cluster';
import containerMetric from './Container';
import nodeMetric from './Node';
import podMetric from './Pod';
import customMetric from './Custom';
import alertAdd from './Alert';

// File to coalesce and export all the queries

import openFaasMetric from './OpenFaaS';
export {
  clusterMetric,
  containerMetric,
  nodeMetric,
  podMetric,
  customMetric,
  alertAdd,
  openFaasMetric,
};
