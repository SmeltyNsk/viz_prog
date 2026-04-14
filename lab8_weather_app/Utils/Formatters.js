export function getWeatherIconUrl(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

export function formatDay(dateString) {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function formatShortDay(dateString) {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function formatUpdateTime(date) {
  return date.toLocaleString('ru-RU');
}

export function groupForecastByDay(forecastList = []) {
  const grouped = {};

  forecastList.forEach((item) => {
    const dateKey = item.dt_txt.split(' ')[0];

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }

    grouped[dateKey].push(item);
  });

  return Object.values(grouped)
    .map((dayItems) => {
      const itemAtNoon = dayItems.find((item) => item.dt_txt.includes('12:00:00'));
      return itemAtNoon || dayItems[0];
    })
    .slice(0, 5);
}

export function getAirQualityLabel(aqi) {
  switch (aqi) {
    case 1:
      return 'Хорошее';
    case 2:
      return 'Удовлетворительное';
    case 3:
      return 'Умеренное';
    case 4:
      return 'Плохое';
    case 5:
      return 'Очень плохое';
    default:
      return 'Нет данных';
  }
}