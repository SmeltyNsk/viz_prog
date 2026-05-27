import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { authApi } from '@features/auth/api/authApi';
import type {
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  User,
} from './authTypes';

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'error';
  error: string | null;
}

const initialState: AuthState = {
  user: authApi.getCurrentUser(),
  status: 'idle',
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (payload: LoginPayload) => authApi.login(payload),
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (payload: RegisterPayload) => authApi.register(payload),
);

export const refreshUserSession = createAsyncThunk(
  'auth/refreshUserSession',
  async () => authApi.refreshSession(),
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (payload: UpdateProfilePayload) => authApi.updateProfile(payload),
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (payload: ChangePasswordPayload) => {
    authApi.changePassword(payload);
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser(state) {
      authApi.logout();
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'idle';
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message ?? 'Ошибка входа';
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'idle';
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message ?? 'Ошибка регистрации';
      })
      .addCase(refreshUserSession.fulfilled, (state, action) => {
        state.user = action.payload?.user ?? null;
      })
      .addCase(updateProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = 'idle';
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message ?? 'Ошибка обновления профиля';
      })
      .addCase(changePassword.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.status = 'idle';
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message ?? 'Ошибка смены пароля';
      });
  },
});

export const authActions = authSlice.actions;
export default authSlice.reducer;