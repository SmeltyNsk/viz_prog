import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@app/hooks';
import { loginUser } from '@features/auth/authSlice';

interface LocationState {
  from?: string;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const authStatus = useAppSelector((state) => state.auth.status);
  const authError = useAppSelector((state) => state.auth.error);

  const [email, setEmail] = useState('student@test.ru');
  const [password, setPassword] = useState('12345678');

  const state = location.state as LocationState | null;
  const redirectPath = state?.from ?? '/dashboard';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = await dispatch(
      loginUser({
        email,
        password,
      }),
    );

    if (loginUser.fulfilled.match(result)) {
      navigate(redirectPath, {
        replace: true,
      });
    }
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Вход</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'grid',
          gap: 12,
          maxWidth: 360,
        }}
      >
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          type="email"
        />

        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Пароль"
          type="password"
        />

        {authError && <p style={{ color: 'red' }}>{authError}</p>}

        <button type="submit" disabled={authStatus === 'loading'}>
          {authStatus === 'loading' ? 'Вход...' : 'Войти'}
        </button>

        <Link to="/register">Создать аккаунт</Link>
      </form>
    </main>
  );
};

export default LoginPage;