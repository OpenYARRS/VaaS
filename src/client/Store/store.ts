import { configureStore } from '@reduxjs/toolkit';
import reducer from './Reducers/index';

// Standard Redux store
export const store = configureStore({
  reducer,
});

// Export relevant types for use in other files
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
