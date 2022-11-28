import { combineReducers } from 'redux';

import clusterReducer from './clusterReducer';
import apiReducer from './apiReducer';
import uiReducer from './uiReducer';
import OFReducer from './OFReducer';
import authReducer from './OAuthReducer';

// Self explanatory
// Coalesces all reducers into one for improved readability and modularity

const reducer = combineReducers({
  clusterReducer,
  apiReducer,
  uiReducer,
  OFReducer,
  authReducer,
});

export default reducer;
