import { getAirQualityLabel, groupForecastByDay } from '../utils/formatters';
import { getWeatherTheme } from '../utils/weatherTheme';

describe('utils', () => {
  test('returns correct air quality label', () => {
    expect(getAirQualityLabel(1)).toBe('Хорошее');
    expect(getAirQualityLabel(5)).toBe('Очень плохое');
  });

  test('returns correct weather theme', () => {
    expect(getWeatherTheme('Clear', '01d')).toBe('theme-clear');
    expect(getWeatherTheme('Clouds', '01n')).toBe('theme-night');
  });

  test('groups forecast by day', () => {
    const forecast = [
      { dt_txt: '2025-03-10 09:00:00' },
      { dt_txt: '2025-03-10 12:00:00' },
      { dt_txt: '2025-03-11 12:00:00' },
    ];

    const result = groupForecastByDay(forecast);

    expect(result).toHaveLength(2);
    expect(result[0].dt_txt).toBe('2025-03-10 12:00:00');
  });
});