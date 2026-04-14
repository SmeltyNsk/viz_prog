import './ErrorMessage.css';

function ErrorMessage({ message }) {
  return <div className="error-message">Ошибка: {message}</div>;
}

export default ErrorMessage;