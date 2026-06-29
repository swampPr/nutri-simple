import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { createGeoApifyURL } from './utils/api-key-util';
import type { Location, LocationResponse } from './types/location-response.type';
import { LocationDTO } from './dto/location.dto';
import { UsersService } from '../users/users.service';
import { UserID } from '../common/types/userid.types';
import type { Latitude, Longitude } from '../common/types/geo.types';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { FIVE_HOUR_MS } from '../common/constants/5-hour-ms';
import type { Cache } from 'cache-manager';

@Injectable()
export class LocationService {
    constructor(
        private usersService: UsersService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {}

    async getAutocomplete(q: string) {
        const url = createGeoApifyURL('https://api.geoapify.com/v1/geocode/autocomplete');
        url.searchParams.set('text', q);

        const res = await fetch(url.toString(), {
            headers: {
                Accept: 'application/json',
            },
        });

        const responseJson = (await res.json()) as LocationResponse;

        const countryOptions = responseJson.features.map((country: Location) => {
            return {
                name: `${country.properties.city ? country.properties.city + ', ' : ''}${country.properties.state}, ${country.properties.country}`,
            };
        });

        return countryOptions;
    }

    async geocodeUser(q: string, userId: UserID): Promise<LocationDTO> {
        const url = createGeoApifyURL('https://api.geoapify.com/v1/geocode/search');
        url.searchParams.set('text', q);

        const cacheKey = `location:${q}`;
        const locationCache: LocationDTO | undefined = await this.cacheManager.get(cacheKey);
        if (locationCache) return locationCache;

        const res = await fetch(url.toString(), {
            headers: {
                Accept: 'application/json',
            },
        });

        const locationResponse = (await res.json()) as LocationResponse;
        const location = locationResponse.features[0];
        if (!location) throw new NotFoundException('Location not found');

        const locationDTO: LocationDTO = {
            country: location.properties.country,
            state: location.properties.state,
            lat: location.properties.lat,
            lon: location.properties.lon,
            displayName: `${location.properties.city ? location.properties.city + ', ' : ''}${location.properties.state}, ${location.properties.country}`,
        };

        await this.usersService.updateUserLocation(
            locationDTO.lat,
            locationDTO.lon,
            locationDTO.displayName,
            userId
        );

        if (!location.properties.city) {
            await this.cacheManager.set(cacheKey, locationDTO, FIVE_HOUR_MS);
            return locationDTO;
        }

        locationDTO.city = location.properties.city;
        await this.cacheManager.set(cacheKey, locationDTO, FIVE_HOUR_MS);
        return locationDTO;
    }

    async reverseGeocodeUser(lat: Latitude, lon: Longitude, userId: UserID) {
        const url = createGeoApifyURL('https://api.geoapify.com/v1/geocode/reverse');
        url.searchParams.set('lat', `${lat}`);
        url.searchParams.set('lon', `${lon}`);

        const res = await fetch(url.toString(), {
            headers: {
                Accept: 'application/json',
            },
        });

        const locationResponse = (await res.json()) as LocationResponse;

        const location = locationResponse.features[0];

        const locationDTO: LocationDTO = {
            country: location.properties.country,
            state: location.properties.state,
            lat: location.properties.lat,
            lon: location.properties.lon,
            displayName: `${location.properties.city ? location.properties.city + ', ' : ''}${location.properties.state}, ${location.properties.country}`,
        };

        await this.usersService.updateUserLocation(
            locationDTO.lat,
            locationDTO.lon,
            locationDTO.displayName,
            userId
        );

        if (!location.properties.city) return locationDTO;

        locationDTO.city = location.properties.city;
        return locationDTO;
    }
}
