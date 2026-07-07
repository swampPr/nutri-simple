import { AlertItem } from './alertsItem';

export type UserForecast = {
    locationName: string;
    currently: Forecast;
    forecastSummary: string;
    next3HoursSummary: Partial<Forecast>[];
    alerts: AlertItem[];
};
export type Forecast = {
    runningScore: number;
    time: number;
    summary: string;
    precipProbability: number;
    temperature: number;
    apparentTemperature: number;
    dewPoint: number;
    icon: string;
    humidity: number;
    windSpeed: number;
    windGust: number;
};
