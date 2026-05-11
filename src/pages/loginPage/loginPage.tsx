import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { authApi } from '@features/auth/api/authApi';

const LoginPage = () => {
  const navigate = useNavigate();

  const [login, setLogin] = useState('student');
  const [password, setPassword] = useState('123');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    authApi.login({
      login,
      password,
    });

    navigate('/documents');
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Вход</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          maxWidth: 320,
        }}
      >
        <input
          value={login}
          onChange={(event) => setLogin(event.target.value)}
          placeholder="Логин"
        />

        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Пароль"
          type="password"
        />

        <button type="submit">Войти</button>
      </form>
    </main>
  );
};

export default LoginPage;