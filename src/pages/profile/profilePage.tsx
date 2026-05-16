import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@app/hooks';
import { authActions } from '@features/auth/authSlice';

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(authActions.logoutUser());
    navigate('/login');
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Профиль</h1>

      <p>Пользователь: {user?.login ?? 'Неизвестно'}</p>

      <button type="button" onClick={handleLogout}>
        Выйти
      </button>
    </main>
  );
};

export default ProfilePage;