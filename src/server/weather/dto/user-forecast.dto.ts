import { Forecast } from '../types/forecast-response.type';

export class UserForecast {
    locationName: string;
    currently: Forecast;
    forecastSummary: string;
    next3HoursSummary: Partial<Forecast>[];
}
