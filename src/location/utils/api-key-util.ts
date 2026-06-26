export function createGeoApifyURL(url: string) {
    const baseURL = new URL(url);
    baseURL.searchParams.set('apiKey', process.env.GEOAPIFY_KEY!);

    return baseURL;
}
