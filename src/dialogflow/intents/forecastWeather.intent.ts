import { WeatherIntentParameters } from '../types';
import { MissingCityError } from '../../utils/errors';
import { geocodeCity } from '../../services/geocoding.service';
import { getDailyForecast } from '../../services/openweather.service';
import { formatDailyForecast } from '../../utils/weatherFormat';
import { computeForecastWindow, formatHumanDate, resolveStartDate } from '../../utils/date';

export async function handleForecastWeather(parameters: WeatherIntentParameters): Promise<string> {
  const city = parameters.city?.trim();
  if (!city) {
    throw new MissingCityError();
  }

  const startDate = resolveStartDate(parameters);
  const { endDate } = computeForecastWindow(startDate);

  const { lat, lon, resolvedName } = await geocodeCity(city);
  const forecast = await getDailyForecast(lat, lon, startDate);

  return (
    `The forecasted weather from ${formatHumanDate(startDate)} to ${formatHumanDate(endDate)} ` +
    `for ${resolvedName || city} is ${formatDailyForecast(forecast)}.`
  );
}
