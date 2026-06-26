export const createSpoonURL = (url: string) => {
    const spoonUrl = new URL(url);
    spoonUrl.searchParams.set('apiKey', process.env.SPOONACULAR_KEY!);
    return spoonUrl;
};
