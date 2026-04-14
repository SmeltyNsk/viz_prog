import './WeatherDetails.css';

function WeatherDetails({ weather }) {
  return (
    <div className="weather-details">
      <div className="weather-details__item">
        <span className="weather-details__label">Влажность</span>
        <strong>{weather.main.humidity}%</strong>
      </div>

      <div className="weather-details__item">
        <span className="weather-details__label">Ветер</span>
        <strong>{weather.wind.speed} м/с</strong>
      </div>

      <div className="weather-details__item">
        <span className="weather-details__label">Давление</span>
        <strong>{weather.main.pressure} гПа</strong>
      </div>

      <div className="weather-details__item">
        <span className="weather-details__label">Видимость</span>
        <strong>{weather.visibility / 1000} км</strong>
      </div>
    </div>
  );
}

export default WeatherDetails;