export type ForecastResponse = {
    currently: Forecast;
    hourly: {
        summary: string;
        data: Forecast[];
    };
};

export type Forecast = {
    runningScore: number;
    time: number;
    summary: string;
    precipProbability: number;
    temperature: number;
    apparentTemperature: number;
    dewPoint: number;
    humidity: number;
    windSpeed: number;
    windGust: number;
};
