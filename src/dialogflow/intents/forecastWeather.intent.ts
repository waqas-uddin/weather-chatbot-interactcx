import { WeatherIntentParameters } from '../types';
import { MissingCityError, WeatherProviderError } from '../../utils/errors';
import { geocodeCity } from '../../services/geocoding.service';
import { getDailyForecast } from '../../services/openweather.service';
import { formatDailyForecast } from '../../utils/weatherFormat';
import { formatHumanDate, resolveStartDate } from '../../utils/date';

export async function handleForecastWeather(parameters: WeatherIntentParameters): Promise<string> {
  const city = parameters.city?.trim();
  if (!city) {
    throw new MissingCityError();
  }

  const startDate = resolveStartDate(parameters);

  const { lat, lon, resolvedName } = await geocodeCity(city);
  const forecast = await getDailyForecast(lat, lon, startDate);

  if (forecast.length === 0) {
    throw new WeatherProviderError('daily forecast returned no data');
  }

  const rangeStart = forecast[0].date;
  const rangeEnd = forecast[forecast.length - 1].date;

  return (
    `Here's the forecast for ${resolvedName || city} ` +
    `(${formatHumanDate(rangeStart)} – ${formatHumanDate(rangeEnd)}):\n` +
    formatDailyForecast(forecast)
  );
}
