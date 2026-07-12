export type SavedRecipe = {
    id: number;
    title: string;
    servings: number;
    image: string;
    readyInMinutes: number;
    sourceUrl: string;
};
export type UserRecipes = SavedRecipe[];
