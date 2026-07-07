type BasicRecipe = {
    id: number;
    title: string;
    image: string;
};

export type RecipeResults = {
    recipes: BasicRecipe[];
    results: number;
    totalResults: number;
};
