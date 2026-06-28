import { Inject, Injectable } from '@nestjs/common';
import { createPirateWeatherURL } from './utils/api-key-util';
import { ForecastResponse } from './types/forecast-response.type';
import { UserForecast as UserForecastDTO } from './dto/user-forecast.dto';
import { WeatherScoringObj } from './types/weather-scoring.type';
import { Latitude, Longitude } from '../common/types/geo.types';
import { UsersService } from '../users/users.service';
import { UserID } from '../common/types/userid.types';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { FIVE_HOUR_MS } from '../common/constants/5-hour-ms';

@Injectable()
export class WeatherService {
    constructor(
        private usersService: UsersService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {}

    async fetchForecast(lat: Latitude, lon: Longitude): Promise<ForecastResponse> {
        const url = createPirateWeatherURL('https://api.pirateweather.net/forecast/');

        const res = await fetch(`${url.toString()}/${lat},${lon}?units=ca`, {
            headers: {
                Accept: 'application/json',
                apikey: process.env.PIRATE_WEATHER_KEY!,
            },
        });

        return (await res.json()) as ForecastResponse;
    }

    async getForecast(lat: Latitude, lon: Longitude, id: UserID): Promise<UserForecastDTO> {
        const forecast: ForecastResponse = await this.fetchForecast(lat, lon);
        const { locationName } = await this.usersService.getUserLocation(id);

        const cacheKey = `weather:${locationName}`;
        const forecastCache: UserForecastDTO | undefined = await this.cacheManager.get(cacheKey);
        if (forecastCache) return forecastCache;

        const userForecast: UserForecastDTO = {
            locationName: locationName!,
            forecastSummary: forecast.hourly.summary,
            currently: {
                time: forecast.currently.time,
                summary: forecast.currently.summary,
                precipProbability: forecast.currently.precipProbability,
                temperature: forecast.currently.temperature,
                apparentTemperature: forecast.currently.apparentTemperature,
                dewPoint: forecast.currently.dewPoint,
                humidity: forecast.currently.humidity,
                windSpeed: forecast.currently.windSpeed,
                windGust: forecast.currently.windGust,
                runningScore: 0,
            },
            next3HoursSummary: [],
        };
        const runningScore = this.getRunningScore(userForecast);
        userForecast.currently.runningScore = runningScore;

        for (let i = 1; i < 4; i++) {
            userForecast.next3HoursSummary.push({
                time: forecast.hourly.data[i].time,
                precipProbability: forecast.hourly.data[i].precipProbability,
                temperature: forecast.hourly.data[i].temperature,
                humidity: forecast.hourly.data[i].humidity,
            });
        }

        await this.cacheManager.set(cacheKey, userForecast, FIVE_HOUR_MS);
        return userForecast;
    }

    getRunningScore(userForecast: UserForecastDTO) {
        const weatherScoringObj: WeatherScoringObj = {
            feelsLike: (t) => {
                if (t >= 10 && t <= 18) return 1.0;
                if (t >= 18 && t <= 22) return 0.9;
                if (t >= 22 && t <= 25) return 0.8;
                if (t >= 25 && t <= 28) return 0.7;
                if (t >= 28 && t <= 30) return 0.5;
                if (t >= 30 && t <= 33) return 0.3;
                if (t >= 33 && t <= 36) return 0.1;
                return 0.1;
            },
            dewPoint: (t) => {
                if (t < 5) return 0.8;
                if (t >= 5 && t <= 10) return 1.0;
                if (t >= 10 && t <= 13) return 0.9;
                if (t >= 13 && t <= 16) return 0.8;
                if (t >= 16 && t <= 18) return 0.7;
                if (t >= 18 && t <= 20) return 0.5;
                if (t >= 20 && t <= 22) return 0.3;
                if (t >= 22 && t <= 24) return 0.1;
                return 0.0;
            },

            precipProbability: (p) => {
                if (p >= 0 && p <= 10) return 1.0;
                if (p >= 10 && p <= 20) return 0.95;
                if (p >= 20 && p <= 30) return 0.9;
                if (p >= 30 && p <= 40) return 0.8;
                if (p >= 40 && p <= 50) return 0.6;
                if (p >= 50 && p <= 60) return 0.5;
                if (p >= 60 && p <= 70) return 0.3;
                if (p >= 70 && p <= 80) return 0.2;
                if (p >= 80 && p <= 90) return 0.1;
                return 0.0;
            },

            windGust: (s) => {
                if (s >= 0 && s <= 15) return 1.0;
                if (s >= 15 && s <= 25) return 0.95;
                if (s >= 25 && s <= 35) return 0.8;
                if (s >= 35 && s <= 45) return 0.6;
                if (s >= 45 && s <= 55) return 0.4;
                if (s >= 55 && s <= 70) return 0.2;
                return 0.0;
            },

            windSpeed: (s) => {
                if (s >= 5 && s <= 15) return 1.0;
                if (s < 5) return 0.9;
                if (s >= 15 && s <= 20) return 0.95;
                if (s >= 20 && s <= 25) return 0.85;
                if (s >= 25 && s <= 30) return 0.7;
                if (s >= 30 && s <= 40) return 0.5;
                if (s >= 40 && s <= 50) return 0.3;
                if (s >= 50 && s <= 60) return 0.1;
                return 0.0;
            },
        };

        const feelsLikeScore =
            weatherScoringObj.feelsLike(userForecast.currently.apparentTemperature) * 0.3;
        const dewPointScore = weatherScoringObj.dewPoint(userForecast.currently.dewPoint) * 0.25;
        const precipProbabilityScore =
            weatherScoringObj.precipProbability(userForecast.currently.precipProbability) * 0.15;
        const windSpeedScore = weatherScoringObj.windSpeed(userForecast.currently.windSpeed) * 0.05;
        const windGustScore = weatherScoringObj.windGust(userForecast.currently.windGust) * 0.05;

        return Math.round(
            (feelsLikeScore +
                dewPointScore +
                precipProbabilityScore +
                windSpeedScore +
                windGustScore) *
                10
        );
    }
}
