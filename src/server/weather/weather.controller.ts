import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { WeatherService } from './weather.service';
import type { Latitude, Longitude } from 'src/common/types/geo.types';
import { UserID } from 'src/common/types/userid.types';
import type { Request } from 'express';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';

@Controller('weather')
export class WeatherController {
    constructor(private weatherService: WeatherService) {}

    @Get('/forecast')
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
