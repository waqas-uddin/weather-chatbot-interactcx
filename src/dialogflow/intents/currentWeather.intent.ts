import { WeatherIntentParameters } from '../types';
import { MissingCityError } from '../../utils/errors';
import { geocodeCity } from '../../services/geocoding.service';
import { getCurrentWeather } from '../../services/openweather.service';
import { formatCurrentWeather } from '../../utils/weatherFormat';

export async function handleCurrentWeather(parameters: WeatherIntentParameters): Promise<string> {
  const city = parameters.city?.trim();
  if (!city) {
    throw new MissingCityError();
  }

  const { lat, lon, resolvedName } = await geocodeCity(city);
  const weather = await getCurrentWeather(lat, lon);

  return `The current weather for ${resolvedName || city} is ${formatCurrentWeather(weather)}.`;
}
