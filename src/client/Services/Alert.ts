import { Get } from '../Services';
import { apiRoute } from '../utils';

// Outlining a template Alert method for consistency and reusability

export default async function Alert(
  clusterId: string | unknown,
  ns: string,
  query: any
): Promise<any> {
  return await Get(
    apiRoute.getRoute(
      `/alert?id=${clusterId}&ns=${ns}&q=${query.name}&expr=${query.expression}&dur=${query.duration}`
    ),
    { authorization: localStorage.getItem('token') }
  );
}
