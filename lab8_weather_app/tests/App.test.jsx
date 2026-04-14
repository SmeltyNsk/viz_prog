import { render, screen } from '@testing-library/react';
import App from '../App';
import * as weatherHook from '../hooks/useWeather';
import { mockForecast, mockAir } from '../mocks/weather.mock';

vi.spyOn(weatherHook, 'useWeather').mockReturnValue({
  city: 'Moscow',
  setCity: vi.fn(),
  weather: mockForecast,
  air: mockAir,
  loading: false,
  error: '',
  lastUpdated: '10.03.2025, 12:00:00',
});

describe('App', () => {
  test('renders main title and weather blocks', () => {
    render(<App />);

    expect(screen.getByText(/Weather App/i)).toBeInTheDocument();
    expect(screen.getByText(/Прогноз на 5 дней/i)).toBeInTheDocument();
    expect(screen.getByText(/Качество воздуха/i)).toBeInTheDocument();
  });
});