export class AppError extends Error {
  public readonly isOperational = true;

  constructor(
    message: string,
    public readonly userMessage: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class CityNotFoundError extends AppError {
  constructor(city: string) {
    super(`City not found: "${city}"`, `Sorry, I couldn't find weather data for "${city}". Could you check the spelling and try again?`);
  }
}

export class MissingCityError extends AppError {
  constructor() {
    super('No city provided in request parameters', "I didn't catch which city you meant. Could you tell me the city name?");
  }
}

export class WeatherProviderError extends AppError {
  constructor(cause: string) {
    super(`OpenWeather request failed: ${cause}`, "Sorry, I'm having trouble reaching the weather service right now. Please try again in a moment.");
  }
}

export class UnknownIntentError extends AppError {
  constructor(intentName: string) {
    super(`No handler registered for intent "${intentName}"`, "Sorry, I'm not sure how to help with that yet.");
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}
