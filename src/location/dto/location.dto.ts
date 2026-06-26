import { IsLatitude, IsLongitude, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { Latitude, Longitude } from 'src/common/types/geo.types';

export class LocationDTO {
    @IsNotEmpty()
    @IsString()
    state: string;

    @IsNotEmpty()
    @IsString()
    country: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    city?: string;

    @IsNotEmpty()
    @IsLatitude()
    lat: Latitude;

    @IsNotEmpty()
    @IsLongitude()
    lon: Longitude;

    @IsNotEmpty()
    @IsString()
    displayName: string;
}
