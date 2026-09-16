import axios from 'axios';
import { getCurrentWeather, getDailyForecast } from '../../src/services/openweather.service';
import { WeatherProviderError } from '../../src/utils/errors';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

function buildDailyRecords(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    dt: Math.floor(Date.now() / 1000) + i * 86400,
    temp: { min: 10 + i, max: 20 + i, day: 15 + i, night: 12 + i, eve: 16 + i, morn: 11 + i },
    humidity: 50,
    weather: [{ description: `day-${i}-weather` }],
  }));
}

describe('openweather.service', () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
  });

  it('getCurrentWeather maps the /current endpoint response', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        data: [{ dt: 0, temp: 25.4, feels_like: 26.1, humidity: 55, weather: [{ description: 'clear sky' }] }],
      },
    });

    const result = await getCurrentWeather(10, 20);

    expect(result).toEqual({
      description: 'clear sky',
      temperatureC: 25,
      feelsLikeC: 26,
      humidity: 55,
    });
  });

  it('getDailyForecast returns exactly 8 days even when the API returns more', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { data: buildDailyRecords(10) },
    });

    const result = await getDailyForecast(30, 40);

    expect(result).toHaveLength(8);
    expect(result[0].description).toBe('day-0-weather');
    expect(result[7].description).toBe('day-7-weather');
  });

  it('wraps upstream failures in a WeatherProviderError', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('network down'));

    await expect(getCurrentWeather(50, 60)).rejects.toBeInstanceOf(WeatherProviderError);
  });
});
