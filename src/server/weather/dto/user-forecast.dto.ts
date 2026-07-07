import { AlertItem } from '../types/alert-item.type';
import { Forecast } from '../types/forecast-response.type';

export class UserForecastDTO {
    locationName: string;
    currently: Forecast;
    forecastSummary: string;
    next3HoursSummary: Partial<Forecast>[];
    alerts: AlertItem[];
}
