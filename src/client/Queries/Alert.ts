import { Alert } from '../Services';

// Outlines a store containing a single Alert metric and the function used to query it

const alertAdd = async (clusterId: string, ns: string, query: any) => {
  try {
    const metric = await Alert(clusterId, ns, query);
  } catch (err) {
    console.log('Error in Alert Add Query');
    console.log(err);
  }
};

export default alertAdd;
