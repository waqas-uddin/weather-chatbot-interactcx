import { WeatherIntentParameters } from '../types';
import { handleCurrentWeather } from './currentWeather.intent';
import { handleForecastWeather } from './forecastWeather.intent';

export type IntentHandler = (parameters: WeatherIntentParameters) => Promise<string>;

export const intentHandlers: Record<string, IntentHandler> = {
  'Current-Weather': handleCurrentWeather,
  'Forecast-Weather': handleForecastWeather,
  'Weather-Forecast-City-Followup': handleForecastWeather,
};
