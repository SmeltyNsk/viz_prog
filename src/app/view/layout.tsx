import { Link, Outlet, useLocation } from 'react-router-dom';

const AppLayout = () => {
  const location = useLocation();

  const isLoginPage = location.pathname === '/login';

  return (
    <div>
      {!isLoginPage && (
        <header
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'center',
            padding: '12px 24px',
            borderBottom: '1px solid #ddd',
          }}
        >
          <strong>Spreadsheet App</strong>

          <nav style={{ display: 'flex', gap: 12 }}>
            <Link to="/dashboard">Мои документы</Link>
            <Link to="/profile">Профиль</Link>
          </nav>
        </header>
      )}

      <Outlet />
    </div>
  );
};

export default AppLayout;