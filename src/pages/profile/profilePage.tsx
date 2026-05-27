import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@app/hooks';
import {
  authActions,
  changePassword,
  updateProfile,
} from '@features/auth/authSlice';
import { loadDocuments } from '@features/documents/documentSlice';

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);
  const authError = useAppSelector((state) => state.auth.error);
  const documents = useAppSelector((state) => state.documents.items);

  const [name, setName] = useState(user?.name ?? '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    dispatch(loadDocuments());
  }, [dispatch]);

  useEffect(() => {
    setName(user?.name ?? '');
  }, [user?.name]);

  const handleUpdateProfile = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setMessage(null);

    const result = await dispatch(updateProfile({ name }));

    if (updateProfile.fulfilled.match(result)) {
      setMessage('Имя обновлено');
    }
  };

  const handleChangePassword = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setMessage(null);

    const result = await dispatch(
      changePassword({
        oldPassword,
        newPassword,
      }),
    );

    if (changePassword.fulfilled.match(result)) {
      setOldPassword('');
      setNewPassword('');
      setMessage('Пароль обновлён');
    }
  };

  const handleLogout = () => {
    dispatch(authActions.logoutUser());
    navigate('/login');
  };

  return (
    <main style={{ padding: 24, display: 'grid', gap: 20, maxWidth: 640 }}>
      <h1>Профиль</h1>

      <section style={{ border: '1px solid #ccc', padding: 16 }}>
        <h2>Данные пользователя</h2>

        <p>Email: {user?.email ?? 'Неизвестно'}</p>
        <p>Имя: {user?.name ?? 'Неизвестно'}</p>
        <p>
          Дата регистрации:{' '}
          {user?.createdAt
            ? new Date(user.createdAt).toLocaleDateString()
            : 'Неизвестно'}
        </p>

        <button type="button" onClick={handleLogout}>
          Выйти
        </button>
      </section>

      <section style={{ border: '1px solid #ccc', padding: 16 }}>
        <h2>Статистика</h2>
        <p>Количество документов: {documents.length}</p>
      </section>

      <form
        onSubmit={handleUpdateProfile}
        style={{
          border: '1px solid #ccc',
          padding: 16,
          display: 'grid',
          gap: 8,
        }}
      >
        <h2>Изменить имя</h2>

        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Имя"
        />

        <button type="submit">Сохранить имя</button>
      </form>

      <form
        onSubmit={handleChangePassword}
        style={{
          border: '1px solid #ccc',
          padding: 16,
          display: 'grid',
          gap: 8,
        }}
      >
        <h2>Сменить пароль</h2>

        <input
          value={oldPassword}
          onChange={(event) => setOldPassword(event.target.value)}
          placeholder="Старый пароль"
          type="password"
        />

        <input
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          placeholder="Новый пароль"
          type="password"
        />

        <button type="submit">Сменить пароль</button>
      </form>

      {(message || authError) && <p>{message ?? authError}</p>}
    </main>
  );
};

export default ProfilePage;