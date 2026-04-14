import { useCallback, useEffect, useState } from 'react';
import { getAirPollution, getCityCoords, getForecast } from '../src/Components/api/weatherApi';
import { formatUpdateTime } from '../Utils/Formatters.js';

export function useWeather(initialCity = 'Moscow') {
  const [city, setCity] = useState(initialCity);
  const [weather, setWeather] = useState(null);
  const [air, setAir] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const loadWeather = useCallback(async (cityName) => {
    try {
      setLoading(true);
      setError('');

      const coords = await getCityCoords(cityName);
      const forecastData = await getForecast(coords.lat, coords.lon);
      const airData = await getAirPollution(coords.lat, coords.lon);

      setWeather(forecastData);
      setAir(airData);
      setLastUpdated(formatUpdateTime(new Date()));
    } catch (err) {
      setError(err.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather(city);

    const interval = setInterval(() => {
      loadWeather(city);
    }, 3 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [city, loadWeather]);

  return {
    city,
    setCity,
    weather,
    air,
    loading,
    error,
    lastUpdated,
  };
}