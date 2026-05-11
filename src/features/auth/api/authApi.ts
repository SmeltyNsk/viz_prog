import type { LoginPayload, User } from '@features/auth/authTypes';

const USER_KEY = 'spreadsheet_user';

export const authApi = {
  login(payload: LoginPayload): User {
    const user: User = {
      id: `user_${payload.login}`,
      login: payload.login,
    };

    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return user;
  },

  logout(): void {
    localStorage.removeItem(USER_KEY);
  },

  getCurrentUser(): User | null {
    const rawUser = localStorage.getItem(USER_KEY);

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as User;
    } catch {
      return null;
    }
  },
};