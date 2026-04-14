export function getWeatherTheme(weatherMain = '', icon = '') {
  const normalized = weatherMain.toLowerCase();
  const isNight = icon.endsWith('n');

  if (isNight) {
    return 'theme-night';
  }

  switch (normalized) {
    case 'clear':
      return 'theme-clear';
    case 'clouds':
      return 'theme-clouds';
    case 'rain':
    case 'drizzle':
      return 'theme-rain';
    case 'thunderstorm':
      return 'theme-storm';
    case 'snow':
      return 'theme-snow';
    default:
      return 'theme-default';
  }
}