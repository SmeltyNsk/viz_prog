export const mockForecast = {
  list: [
    {
      dt: 1710000000,
      dt_txt: '2025-03-10 12:00:00',
      main: {
        temp: 18,
        feels_like: 17,
        humidity: 65,
        pressure: 1012,
      },
      weather: [
        {
          main: 'Clear',
          description: 'ясно',
          icon: '01d',
        },
      ],
      wind: {
        speed: 4,
      },
      visibility: 10000,
    },
    {
      dt: 1710086400,
      dt_txt: '2025-03-11 12:00:00',
      main: {
        temp: 16,
        feels_like: 15,
        humidity: 70,
        pressure: 1010,
      },
      weather: [
        {
          main: 'Clouds',
          description: 'облачно',
          icon: '03d',
        },
      ],
      wind: {
        speed: 5,
      },
      visibility: 10000,
    },
  ],
};

export const mockAir = {
  list: [
    {
      main: { aqi: 2 },
      components: {
        co: 210,
        no2: 12,
        pm2_5: 8,
        pm10: 14,
      },
    },
  ],
};