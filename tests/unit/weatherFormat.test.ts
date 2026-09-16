import { formatCurrentWeather, formatDailyForecast } from '../../src/utils/weatherFormat';
import { CurrentWeather, DailyForecast } from '../../src/services/openweather.service';

describe('formatCurrentWeather', () => {
  it('renders a human-readable summary sentence fragment', () => {
    const weather: CurrentWeather = {
      description: 'clear sky',
      temperatureC: 24,
      feelsLikeC: 23,
      humidity: 40,
    };
    expect(formatCurrentWeather(weather)).toBe('clear sky, 24°C (feels like 23°C), humidity 40%');
  });
});

describe('formatDailyForecast', () => {
  it('renders each day as its own bulleted line', () => {
    const days: DailyForecast[] = [
      { date: new Date('2026-09-13T00:00:00Z'), description: 'light rain', minTempC: 18, maxTempC: 24, humidity: 60 },
      { date: new Date('2026-09-14T00:00:00Z'), description: 'sunny', minTempC: 19, maxTempC: 27, humidity: 45 },
    ];
    const result = formatDailyForecast(days);
    const lines = result.split('\n');

    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain('light rain, 18–24°C');
    expect(lines[1]).toContain('sunny, 19–27°C');
  });

  it('returns a fallback message for an empty forecast list', () => {
    expect(formatDailyForecast([])).toBe('No forecast data available.');
  });
});
