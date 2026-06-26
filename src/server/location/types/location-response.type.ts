import type { Latitude, Longitude } from 'src/server/common/types/geo.types';

export type LocationResponse = {
    features: Location[];
};

export type Location = {
    properties: {
        country: string;
        state: string;
        city?: string;
        lon: Longitude;
        lat: Latitude;
    };
};
