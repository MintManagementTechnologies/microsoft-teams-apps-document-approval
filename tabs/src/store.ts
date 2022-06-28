
import configSlice from 'features/config/configSlice';
import fileSlice from 'features/files/fileSlice';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import { configureStore, ConfigureStoreOptions } from '@reduxjs/toolkit';

import actorsSlice from './features/actors/actorsSlice';
import commentsSlice from './features/comments/commentsSlice';
import dashboardToggleSlice from './features/filters/dashboardToggle/dashboardToggleSlice';
import filtersSlice from './features/filters/filtersSlice';
import searchBoxSlice from './features/filters/searchBox/searchBoxSlice';
import requestSlice from './features/requests/requestSlice';
import userSlice from './features/users/userSlice';
import { baseApi, baseGraphApi, msGraphBaseApi } from './services';

export const createStore = (options?: ConfigureStoreOptions['preloadedState'] | undefined) =>
  configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      [baseGraphApi.reducerPath]: baseGraphApi.reducer,
      [msGraphBaseApi.reducerPath]: msGraphBaseApi.reducer,
      filters: filtersSlice,
      search: searchBoxSlice,
      dashboard: dashboardToggleSlice,
      actors: actorsSlice,
      currentUser: userSlice,
      request: requestSlice,
      comments: commentsSlice,
      file: fileSlice,
      config: configSlice,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware, baseGraphApi.middleware, msGraphBaseApi.middleware),
    ...options,
  });

export const store = createStore();

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export type RootState = ReturnType<typeof store.getState>;
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;