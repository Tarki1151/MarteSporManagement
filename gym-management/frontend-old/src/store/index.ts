import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    // Add other reducers here
  },
  // Add middleware if needed
  // middleware: (getDefaultMiddleware) =>
  //   getDefaultMiddleware().concat(yourMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
