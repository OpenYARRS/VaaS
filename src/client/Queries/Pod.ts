import { Query } from '../Services';

const podMetric = {
  namesList: async (clusterId: string, ns: string, node: string) => {
    const query = `kube_pod_info{node="${node}"}`;
    const metric = await Query(clusterId, ns, query);
    return metric.data.result.map((result: { metric: { pod: any; }; }) => {
      return result.metric.pod;
    });
  },
  infoList: async (clusterId: string, ns: string, node: string) => {
    const query = `kube_pod_info{node="${node}"}`;
    const metric = await Query(clusterId, ns, query);
    return metric.data.result.map((result: { metric: { pod: any; namespace: any; pod_ip: any; created_by_name: any; uid: any; }; }) => {
      return {
        podName: result.metric.pod, 
        podNamespace: result.metric.namespace, 
        podIp: result.metric.pod_ip, 
        createdByDeployment: result.metric.created_by_name,
        uid: result.metric.uid
      };
    });
  },
  podInfo: async (clusterId: string, ns: string, pod: string) => {
    const query = `kube_pod_info{pod="${pod}"}`;
    const metric = await Query(clusterId, ns, query);
    return {
      podName: metric.data.result[0].metric.pod, 
      podNamespace: metric.data.result[0].metric.namespace, 
      podIp: metric.data.result[0].metric.pod_ip, 
      createdByDeployment: metric.data.result[0].metric.created_by_name,
      uid: metric.data.result[0].metric.uid
    };
  }
};

export default podMetric;
