export function createPirateWeatherURL(url: string) {
    return new URL(`${url}/${process.env.PIRATE_WEATHER_KEY!}`);
}
