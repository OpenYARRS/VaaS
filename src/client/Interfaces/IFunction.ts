export interface FunctionTypes {
  title: string;
  name: string;
  description: string;
  images: {
    arm64: string;
    armhf: string;
    x86_64: string;
  };
  repo_url: string;
}

export interface DeployedFunctionTypes {
  name: string;
  replicas: number;
  invocation: number;
  image: string;
  
}