import { Injectable, NotFoundException } from '@nestjs/common';
import { createGeoApifyURL } from './utils/api-key-util';
import type { Location, LocationResponse } from './types/location-response.type';
import { LocationDTO } from './dto/location.dto';
import type { Latitude, Longitude } from 'src/common/types/geo.types';
import { UserID } from 'src/common/types/userid.types';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class LocationService {
    constructor(private usersService: UsersService) {}

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

    async geocodeUser(q: string, userId: UserID) {
        const url = createGeoApifyURL('https://api.geoapify.com/v1/geocode/search');
        url.searchParams.set('text', q);

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

        if (!location.properties.city) return locationDTO;

        locationDTO.city = location.properties.city;
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
