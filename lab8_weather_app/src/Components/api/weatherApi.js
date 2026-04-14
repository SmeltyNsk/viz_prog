const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

function checkApiKey() {
  if (!API_KEY) {
    throw new Error('API ключ не найден. Проверь файл .env');
  }
}

export async function getCityCoords(city) {
  checkApiKey();

  const response = await fetch(
    `${GEO_URL}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error('Не удалось получить координаты города');
  }

  const data = await response.json();

  if (!data.length) {
    throw new Error('Город не найден');
  }

  return data[0];
}

export async function getForecast(lat, lon) {
  checkApiKey();

  const response = await fetch(
    `${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=ru&appid=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error('Не удалось получить прогноз погоды');
  }

  return response.json();
}

export async function getAirPollution(lat, lon) {
  checkApiKey();

  const response = await fetch(
    `${BASE_URL}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error('Не удалось получить данные о загрязнении воздуха');
  }

  return response.json();
}