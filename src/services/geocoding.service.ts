import axios, { AxiosError } from 'axios';
import { env } from '../config/env';
import { CityNotFoundError, WeatherProviderError } from '../utils/errors';
import { logger } from '../utils/logger';

const GEOCODING_BASE_URL = 'https://api.openweathermap.org/geo/1.0/direct';

export interface Coordinates {
  lat: number;
  lon: number;
  resolvedName: string;
}

interface GeocodingResult {
  name: string;
  lat: number;
  lon: number;
  country?: string;
  state?: string;
}

const geocodeCache = new Map<string, { value: Coordinates; expiresAt: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

export async function geocodeCity(city: string): Promise<Coordinates> {
  const cacheKey = city.trim().toLowerCase();
  const cached = geocodeCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  try {
    const response = await axios.get<GeocodingResult[]>(GEOCODING_BASE_URL, {
      params: {
        q: city,
        limit: 1,
        appid: env.OPENWEATHER_API_KEY,
      },
      timeout: 5000,
    });

    const [first] = response.data;
    if (!first) {
      throw new CityNotFoundError(city);
    }

    const coordinates: Coordinates = {
      lat: first.lat,
      lon: first.lon,
      resolvedName: [first.name, first.state, first.country].filter(Boolean).join(', '),
    };

    geocodeCache.set(cacheKey, { value: coordinates, expiresAt: Date.now() + CACHE_TTL_MS });
    return coordinates;
  } catch (err) {
    if (err instanceof CityNotFoundError) throw err;

    const axiosErr = err as AxiosError;
    logger.error({ err: axiosErr.message, city }, 'Geocoding request failed');
    throw new WeatherProviderError(`geocoding lookup for "${city}" failed: ${axiosErr.message}`);
  }
}
