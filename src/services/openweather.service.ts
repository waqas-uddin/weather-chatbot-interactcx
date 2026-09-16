import axios, { AxiosError } from 'axios';
import { env } from '../config/env';
import { WeatherProviderError } from '../utils/errors';
import { logger } from '../utils/logger';
import { FORECAST_DAYS } from '../utils/date';

const CURRENT_URL = 'https://api.openweathermap.org/data/4.0/onecall/current';
const DAILY_TIMELINE_URL = 'https://api.openweathermap.org/data/4.0/onecall/timeline/1day';

export interface CurrentWeather {
  description: string;
  temperatureC: number;
  feelsLikeC: number;
  humidity: number;
}

export interface DailyForecast {
  date: Date;
  description: string;
  minTempC: number;
  maxTempC: number;
  humidity: number;
}

interface OneCallCurrentRecord {
  dt: number;
  temp: number;
  feels_like: number;
  humidity: number;
  weather: { description: string }[];
}

interface OneCallCurrentResponse {
  data: OneCallCurrentRecord[];
}

interface OneCallDailyRecord {
  dt: number;
  temp: { min: number; max: number; day: number; night: number; eve: number; morn: number };
  humidity: number;
  weather: { description: string }[];
}

interface OneCallDailyResponse {
  data: OneCallDailyRecord[];
  next?: string;
  prev?: string;
}

const currentCache = new Map<string, { value: OneCallCurrentResponse; expiresAt: number }>();
const dailyCache = new Map<string, { value: OneCallDailyResponse; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

async function fetchCurrent(lat: number, lon: number): Promise<OneCallCurrentResponse> {
  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const cached = currentCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  try {
    const response = await axios.get<OneCallCurrentResponse>(CURRENT_URL, {
      params: { lat, lon, units: 'metric', appid: env.OPENWEATHER_API_KEY },
      timeout: 5000,
    });

    currentCache.set(cacheKey, { value: response.data, expiresAt: Date.now() + CACHE_TTL_MS });
    return response.data;
  } catch (err) {
    const axiosErr = err as AxiosError;
    logger.error({ err: axiosErr.message, lat, lon }, 'OpenWeather current-weather request failed');
    throw new WeatherProviderError(`One Call 4.0 current request failed: ${axiosErr.message}`);
  }
}

async function fetchDailyTimeline(
  lat: number,
  lon: number,
  startDate?: Date,
): Promise<OneCallDailyResponse> {
  const startUnix = startDate ? Math.floor(startDate.getTime() / 1000) : undefined;
  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)},${startUnix ?? 'now'}`;
  const cached = dailyCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  try {
    const response = await axios.get<OneCallDailyResponse>(DAILY_TIMELINE_URL, {
      params: {
        lat,
        lon,
        units: 'metric',
        appid: env.OPENWEATHER_API_KEY,
        ...(startUnix ? { start: startUnix } : {}),
      },
      timeout: 5000,
    });

    dailyCache.set(cacheKey, { value: response.data, expiresAt: Date.now() + CACHE_TTL_MS });
    return response.data;
  } catch (err) {
    const axiosErr = err as AxiosError;
    logger.error({ err: axiosErr.message, lat, lon }, 'OpenWeather daily-forecast request failed');
    throw new WeatherProviderError(`One Call 4.0 daily timeline request failed: ${axiosErr.message}`);
  }
}

export async function getCurrentWeather(lat: number, lon: number): Promise<CurrentWeather> {
  const response = await fetchCurrent(lat, lon);
  const record = response.data[0];

  return {
    description: record?.weather[0]?.description ?? 'unavailable',
    temperatureC: Math.round(record?.temp ?? 0),
    feelsLikeC: Math.round(record?.feels_like ?? 0),
    humidity: record?.humidity ?? 0,
  };
}

export async function getDailyForecast(
  lat: number,
  lon: number,
  startDate?: Date,
): Promise<DailyForecast[]> {
  const response = await fetchDailyTimeline(lat, lon, startDate);

  return response.data.slice(0, FORECAST_DAYS).map((day) => ({
    date: new Date(day.dt * 1000),
    description: day.weather[0]?.description ?? 'unavailable',
    minTempC: Math.round(day.temp.min),
    maxTempC: Math.round(day.temp.max),
    humidity: day.humidity,
  }));
}
