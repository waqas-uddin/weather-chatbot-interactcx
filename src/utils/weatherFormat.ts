import { CurrentWeather, DailyForecast } from '../services/openweather.service';
import { formatHumanDate } from './date';

export function formatCurrentWeather(weather: CurrentWeather): string {
  return (
    `${weather.description}, ${weather.temperatureC}°C ` +
    `(feels like ${weather.feelsLikeC}°C), humidity ${weather.humidity}%`
  );
}

export function formatDailyForecast(days: DailyForecast[]): string {
  if (days.length === 0) return 'no forecast data available';

  return days
    .map(
      (day) =>
        `${formatHumanDate(day.date)}: ${day.description}, ${day.minTempC}-${day.maxTempC}°C`,
    )
    .join('; ');
}
