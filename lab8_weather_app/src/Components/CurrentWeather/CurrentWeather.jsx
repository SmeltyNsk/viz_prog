import WeatherDetails from '../WeatherDetails/WeatherDetails';
import { formatDay, getWeatherIconUrl } from '../../../Utils/Formatters.js';
import './CurrentWeather.css';

function CurrentWeather({ city, weather }) {
  const icon = weather.weather[0].icon;
  const description = weather.weather[0].description;

  return (
    <section className="card current-weather">
      <div className="current-weather__header">
        <div>
          <p className="current-weather__date">{formatDay(weather.dt_txt)}</p>
          <h2 className="current-weather__city">{city}</h2>
        </div>

        <img
          className="current-weather__icon"
          src={getWeatherIconUrl(icon)}
          alt={description}
        />
      </div>

      <div className="current-weather__main">
        <div>
          <p className="current-weather__temp">{Math.round(weather.main.temp)}°</p>
          <p className="current-weather__description">{description}</p>
          <p className="current-weather__feels-like">
            Ощущается как: {Math.round(weather.main.feels_like)}°
          </p>
        </div>
      </div>

      <WeatherDetails weather={weather} />
    </section>
  );
}

export default CurrentWeather;