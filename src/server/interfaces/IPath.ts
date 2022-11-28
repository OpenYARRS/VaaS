// Interface for the Path model
// Will eventually be used to store all the endpoints for the API
export interface IPathRoute {
  methods: string[];
}

export interface IPath {
  [route: string]: IPathRoute;
}
