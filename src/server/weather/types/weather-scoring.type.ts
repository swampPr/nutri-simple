type ScoreFn = (t: number) => number;

export type WeatherScoringObj = {
    feelsLike: ScoreFn;
    dewPoint: ScoreFn;
    precipProbability: ScoreFn;
    windSpeed: ScoreFn;
    windGust: ScoreFn;
};
