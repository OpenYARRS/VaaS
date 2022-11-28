import * as types from '../actionTypes';
import { IAction } from '../../Interfaces/IAction';
import { IClusterReducer } from '../../Interfaces/IReducers';

// Reducer functions to update the cluster state

const initialState: IClusterReducer = {
  render: false,
  favRender: false,
};

const clusterReducer: any = (
  state: IClusterReducer = initialState,
  action: IAction
) => {
  switch (action.type) {
    case types.SET_RENDER: {
      return {
        ...state,
        render: action.payload,
      };
    }
    case types.SET_FAV_RENDER: {
      return {
        ...state,
        favRender: action.payload,
      };
    }
    default: {
      return state;
    }
  }
};

export default clusterReducer;
