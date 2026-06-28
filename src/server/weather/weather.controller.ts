import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { WeatherService } from './weather.service';
import type { Request } from 'express';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { UserID } from '../common/types/userid.types';
import type { Latitude, Longitude } from '../common/types/geo.types';
import { CacheKey } from '@nestjs/cache-manager';

@Controller('weather')
export class WeatherController {
    constructor(private weatherService: WeatherService) {}

    @Get('/forecast')
    @CacheKey('weather')
    @UseGuards(AccessTokenGuard)
    async getUserForecast(
        @Query('lat') lat: Latitude,
        @Query('lon') lon: Longitude,
        @Req() req: Request
    ) {
        const { userId } = req.user! as { userId: UserID };
        return this.weatherService.getForecast(lat, lon, userId);
    }
}
