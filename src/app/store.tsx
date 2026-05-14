import { configureStore } from '@reduxjs/toolkit';

import authReducer from '@features/auth/authSlice'
import documentsReducer from '@features/documents/documentSlice';
import spreadsheetReducer from '@features/spreadsheet/spreadsheetSlice';
import uiReducer from '@features/ui/uiSlice';
import { autosaveMiddleware } from '@app/autosaveMiddle';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    documents: documentsReducer,
    spreadsheet: spreadsheetReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(autosaveMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;