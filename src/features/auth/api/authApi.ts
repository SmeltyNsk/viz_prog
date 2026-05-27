import type {
  AuthSession,
  AuthTokens,
  LoginPayload,
  RegisterPayload,
  User,
} from '@features/auth/authTypes';

interface StoredUser {
  id: string;
  email: string;
  password: string;
  name?: string;
  createdAt?: string;
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

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

function toUser(storedUser: StoredUser): User {
  return {
    id: storedUser.id,
    email: storedUser.email,
    name: storedUser.name ?? storedUser.email.split('@')[0] ?? 'Пользователь',
    createdAt: storedUser.createdAt ?? new Date().toISOString(),
  };
}

function createRefreshTokenForUser(email: string): string {
  return `${generateToken('refresh')}_email_${email}`;
}

function createTokens(email: string): AuthTokens {
  const accessToken = generateToken('access');
  const refreshToken = createRefreshTokenForUser(email);

  accessTokenMemory = accessToken;
  accessTokenExpiresAtMemory = Date.now() + 15 * 60 * 1000;

  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt: accessTokenExpiresAtMemory,
  };
}

function getEmailFromRefreshToken(): string | null {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  if (!refreshToken) {
    return null;
  }

  const email = refreshToken.split('_email_')[1];

  return email ?? null;
}

function getUserByRefreshToken(): User | null {
  const email = getEmailFromRefreshToken();

  if (!email) {
    return null;
  }

  const storedUser = getStoredUsers().find((user) => user.email === email);

  if (!storedUser) {
    return null;
  }

  return toUser(storedUser);
}

function ensureAuthorizedUser(): User {
  const user = authApi.getCurrentUser();

  if (!user) {
    throw new Error('Пользователь не авторизован');
  }

  return user;
}

export const authApi = {
  register(payload: RegisterPayload): AuthSession {
    const email = normalizeEmail(payload.email);

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

    if (users.some((user) => user.email === email)) {
      throw new Error('Пользователь уже существует');
    }

    const storedUser: StoredUser = {
      id: generateId(),
      email,
      password: payload.password,
      name: email.split('@')[0] ?? 'Пользователь',
      createdAt: new Date().toISOString(),
    };

    saveUsers([...users, storedUser]);

    return {
      user: toUser(storedUser),
      tokens: createTokens(email),
    };
  },

  login(payload: LoginPayload): AuthSession {
    const email = normalizeEmail(payload.email);

    const storedUser = getStoredUsers().find(
      (user) => user.email === email && user.password === payload.password,
    );

    if (!storedUser) {
      throw new Error('Неверный email или пароль');
    }

    return {
      user: toUser(storedUser),
      tokens: createTokens(email),
    };
  },

  refreshSession(): AuthSession | null {
    const user = getUserByRefreshToken();

    if (!user) {
      return null;
    }

    return {
      user,
      tokens: createTokens(user.email),
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
    return ensureAuthorizedUser();
  },

  updateProfile(payload: { name: string }): User {
    const currentUser = ensureAuthorizedUser();
    const users = getStoredUsers();

    const updatedUsers = users.map((user) => {
      if (user.id !== currentUser.id) {
        return user;
      }

      return {
        ...user,
        name: payload.name.trim() || user.name || currentUser.name,
      };
    });

    saveUsers(updatedUsers);

    const updatedUser = updatedUsers.find((user) => user.id === currentUser.id);

    if (!updatedUser) {
      throw new Error('Пользователь не найден');
    }

    return toUser(updatedUser);
  },

  changePassword(payload: {
    oldPassword: string;
    newPassword: string;
  }): void {
    const currentUser = ensureAuthorizedUser();
    const users = getStoredUsers();

    const storedUser = users.find((user) => user.id === currentUser.id);

    if (!storedUser) {
      throw new Error('Пользователь не найден');
    }

    if (storedUser.password !== payload.oldPassword) {
      throw new Error('Старый пароль введён неверно');
    }

    if (payload.newPassword.length < 8) {
      throw new Error('Новый пароль должен быть не короче 8 символов');
    }

    const updatedUsers = users.map((user) =>
      user.id === currentUser.id
        ? {
            ...user,
            password: payload.newPassword,
          }
        : user,
    );

    saveUsers(updatedUsers);
  },
};