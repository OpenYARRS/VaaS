import { AUTH } from '../actionTypes';

// Reducer functions to set authentication state
// Will either set a new authentication state or just return the existing state

const authReducer = (state: any = { authData: null }, action: any) => {
  switch (action.type) {
    case AUTH:
      console.log(action?.data);
      localStorage.setItem('profile', JSON.stringify({ ...action?.data }));
      return { ...state, authData: action?.data };

    default:
      return state;
  }
};

export default authReducer;
