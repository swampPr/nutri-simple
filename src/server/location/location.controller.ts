import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { LocationService } from './location.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { LocationDTO } from './dto/location.dto';
import type { Request } from 'express';
import type { Latitude, Longitude } from 'src/common/types/geo.types';
import { UserID } from 'src/common/types/userid.types';

@Controller('location')
export class LocationController {
    constructor(private locationService: LocationService) {}

    @Get('/autocomplete')
    @UseGuards(AccessTokenGuard)
    async getAutocomplete(@Query('q') q: string) {
        return this.locationService.getAutocomplete(q);
    }

    @Get('/geocode')
    @UseGuards(AccessTokenGuard)
    async geocodeUser(@Query('q') q: string, @Req() req: Request): Promise<LocationDTO> {
        const { userId } = req.user! as { userId: UserID };
        return await this.locationService.geocodeUser(q, userId);
    }

    @Get('/reverse-geocode')
    @UseGuards(AccessTokenGuard)
    async reverseGeocode(
        @Query('lat') lat: Latitude,
        @Query('lon') lon: Longitude,
        @Req() req: Request
    ) {
        const { userId } = req.user! as { userId: UserID };
        const userLocation: LocationDTO = await this.locationService.reverseGeocodeUser(
            lat,
            lon,
            userId
        );

        return userLocation;
    }
}
