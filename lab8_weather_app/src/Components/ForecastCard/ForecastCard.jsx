import { formatShortDay, getWeatherIconUrl } from '../../../Utils/Formatters.js';
import './ForecastCard.css';

function ForecastCard({ day }) {
  return (
    <article className="forecast-card">
      <div>
        <p className="forecast-card__day">{formatShortDay(day.dt_txt)}</p>
        <p className="forecast-card__desc">{day.weather[0].description}</p>
      </div>

      <div className="forecast-card__center">
        <img
          className="forecast-card__icon"
          src={getWeatherIconUrl(day.weather[0].icon)}
          alt={day.weather[0].description}
        />
      </div>

      <div className="forecast-card__temp">
        <strong>{Math.round(day.main.temp)}°</strong>
      </div>
    </article>
  );
}

export default ForecastCard;