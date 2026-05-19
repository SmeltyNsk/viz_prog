import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@app/hooks';
import { registerUser } from '@features/auth/authSlice';

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const authStatus = useAppSelector((state) => state.auth.status);
  const authError = useAppSelector((state) => state.auth.error);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLocalError(null);

    if (!email.includes('@')) {
      setLocalError('Введите корректный email');
      return;
    }

    if (password.length < 8) {
      setLocalError('Пароль должен быть не короче 8 символов');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Пароли не совпадают');
      return;
    }

    const result = await dispatch(
      registerUser({
        email,
        password,
        confirmPassword,
      }),
    );

    if (registerUser.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Регистрация</h1>

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

        <input
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Повторите пароль"
          type="password"
        />

        {(localError || authError) && (
          <p style={{ color: 'red' }}>{localError ?? authError}</p>
        )}

        <button type="submit" disabled={authStatus === 'loading'}>
          {authStatus === 'loading' ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>

        <Link to="/login">Уже есть аккаунт</Link>
      </form>
    </main>
  );
};

export default RegisterPage;