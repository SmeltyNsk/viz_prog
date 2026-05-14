import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { authApi } from '@features/auth/api/authApi';
import type { LoginPayload, User } from './authTypes';

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'error';
}

const initialState: AuthState = {
  user: authApi.getCurrentUser(),
  status: 'idle',
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (payload: LoginPayload) => authApi.login(payload),
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser(state) {
      authApi.logout();
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'idle';
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state) => {
        state.status = 'error';
      });
  },
});

export const authActions = authSlice.actions;
export default authSlice.reducer;