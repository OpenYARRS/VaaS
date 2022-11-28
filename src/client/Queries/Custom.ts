import { Query } from '../Services';

// Outlines a store containing a custom PromQL metric and the function used to query it

const customMetric = async (clusterId: string, ns: string, query: string) => {
  try {
    const metric = await Query(clusterId, ns, query);
    return metric.data.result;
  } catch (err) {
    console.log(err);
  }
};

export default customMetric;
