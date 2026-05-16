import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <main style={{ padding: 24 }}>
      <h1>404</h1>
      <p>Страница не найдена.</p>

      <Link to="/dashboard">Вернуться к документам</Link>
    </main>
  );
};

export default NotFoundPage;