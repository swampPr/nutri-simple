import { AlertItem } from './alert-item.type';

export type ForecastResponse = {
    currently: Forecast;
    hourly: {
        summary: string;
        data: Forecast[];
    };
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
