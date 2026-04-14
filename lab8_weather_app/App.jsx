import CitySearch from './src/Components/citySearch/citySearch';
import CurrentWeather from './src/Components/CurrentWeather/CurrentWeather';
import ForecastList from './src/Components/ForecastList/ForecastList';
import AirPollution from './src/Components/AirPollution/AirPollution';
import Loader from './src/Components/Loader/Loader';
import ErrorMessage from './src/Components/ErrorMessage/ErrorMessage';
import { useWeather } from './Hooks/UseWeather.js';
import { getWeatherTheme } from './Utils/WeatherTheme.js';
import './App.css';

function App() {
  const {
    city,
    setCity,
    weather,
    air,
    loading,
    error,
    lastUpdated,
  } = useWeather('Moscow');

  const current = weather?.list?.[0];
  const themeClass = current
    ? getWeatherTheme(current.weather[0].main, current.weather[0].icon)
    : 'theme-default';

  return (
    <div className={`app ${themeClass}`}>
      <div className="overlay">
        <div className="container">
          <h1 className="app-title">Weather App</h1>
          <p className="app-subtitle">Прогноз погоды и качество воздуха</p>

          <CitySearch onSearch={setCity} initialValue={city} />

          {lastUpdated && !loading && !error && (
            <p className="updated-time">
              Последнее обновление: {lastUpdated}
            </p>
          )}

          {loading && <Loader />}
          {error && <ErrorMessage message={error} />}

          {weather && !loading && !error && (
            <div className="content-grid">
              <CurrentWeather city={city} weather={weather.list[0]} />
              <ForecastList forecastList={weather.list} />
              <AirPollution airData={air} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;