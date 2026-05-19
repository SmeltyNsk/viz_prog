import type { AuthSession, AuthTokens, LoginPayload, RegisterPayload, User, } from '@features/auth/authTypes'

interface StoredUser {
  id: string;
  email: string;
  password: string;
}

const USERS_KEY = 'spreadsheet_users';
const REFRESH_TOKEN_KEY = 'spreadsheet_refresh_token';

let accessTokenMemory: string | null = null;
let accessTokenExpiresAtMemory = 0;

function generateId(): string {
  return `user_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function generateToken(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function getStoredUsers(): StoredUser[] {
  const rawUsers = localStorage.getItem(USERS_KEY);

  if (!rawUsers) {
    return [];
  }

  try {
    return JSON.parse(rawUsers) as StoredUser[];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function createTokens(): AuthTokens {
  const accessToken = generateToken('access');
  const refreshToken = generateToken('refresh');

  accessTokenMemory = accessToken;
  accessTokenExpiresAtMemory = Date.now() + 15 * 60 * 1000;

  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt: accessTokenExpiresAtMemory,
  };
}

function getUserByRefreshToken(): User | null {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  if (!refreshToken) {
    return null;
  }

  const email = refreshToken.split('_email_')[1];

  if (!email) {
    return null;
  }

  const user = getStoredUsers().find((item) => item.email === email);

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
  };
}

function createRefreshTokenForUser(email: string): string {
  return `${generateToken('refresh')}_email_${email}`;
}

export const authApi = {
  register(payload: RegisterPayload): AuthSession {
    const email = payload.email.trim().toLowerCase();

    if (!validateEmail(email)) {
      throw new Error('Некорректный email');
    }

    if (payload.password.length < 8) {
      throw new Error('Пароль должен быть не короче 8 символов');
    }

    if (payload.password !== payload.confirmPassword) {
      throw new Error('Пароли не совпадают');
    }

    const users = getStoredUsers();
    const userExists = users.some((user) => user.email === email);

    if (userExists) {
      throw new Error('Пользователь уже существует');
    }

    const storedUser: StoredUser = {
      id: generateId(),
      email,
      password: payload.password,
    };

    saveUsers([...users, storedUser]);

    const tokens = createTokens();
    const refreshToken = createRefreshTokenForUser(email);

    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

    return {
      user: {
        id: storedUser.id,
        email: storedUser.email,
      },
      tokens: {
        ...tokens,
        refreshToken,
      },
    };
  },

  login(payload: LoginPayload): AuthSession {
    const email = payload.email.trim().toLowerCase();

    const user = getStoredUsers().find(
      (item) => item.email === email && item.password === payload.password,
    );

    if (!user) {
      throw new Error('Неверный email или пароль');
    }

    const tokens = createTokens();
    const refreshToken = createRefreshTokenForUser(email);

    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      tokens: {
        ...tokens,
        refreshToken,
      },
    };
  },

  refreshSession(): AuthSession | null {
    const user = getUserByRefreshToken();

    if (!user) {
      return null;
    }

    const tokens = createTokens();
    const refreshToken = createRefreshTokenForUser(user.email);

    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

    return {
      user,
      tokens: {
        ...tokens,
        refreshToken,
      },
    };
  },

  logout(): void {
    accessTokenMemory = null;
    accessTokenExpiresAtMemory = 0;
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  getAccessToken(): string | null {
    if (!accessTokenMemory) {
      return null;
    }

    if (Date.now() > accessTokenExpiresAtMemory) {
      return null;
    }

    return accessTokenMemory;
  },

  getCurrentUser(): User | null {
    const activeToken = this.getAccessToken();

    if (activeToken) {
      return getUserByRefreshToken();
    }

    const refreshedSession = this.refreshSession();

    return refreshedSession?.user ?? null;
  },

  ensureAuthorized(): User {
    const user = this.getCurrentUser();

    if (!user) {
      throw new Error('Пользователь не авторизован');
    }

    return user;
  },
};