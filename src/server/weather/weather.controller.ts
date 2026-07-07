import { Controller, Get, Headers, Query, Req, UseGuards } from '@nestjs/common';
import { WeatherService } from './weather.service';
import type { Request } from 'express';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { UserID } from '../common/types/userid.types';
import type { Latitude, Longitude } from '../common/types/geo.types';

@Controller('weather')
export class WeatherController {
    constructor(private weatherService: WeatherService) {}

    @Get('/forecast')
    @UseGuards(AccessTokenGuard)
    async getUserForecast(
        @Query('lat') lat: Latitude,
        @Query('lon') lon: Longitude,
        @Req() req: Request,
        @Headers('X-Cache') cache: 'true' | undefined
    ) {
        const { userId } = req.user! as { userId: UserID };
        return this.weatherService.getForecast(lat, lon, userId, cache);
    }
}
