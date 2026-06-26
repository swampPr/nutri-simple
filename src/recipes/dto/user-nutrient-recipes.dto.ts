import { ArrayNotEmpty } from 'class-validator';
import { BasicRecipe } from '../types/recipe.type';

type RecipeResponseNutrients = BasicRecipe & {
    calories?: number;
    carbs?: string;
    protein?: string;
    fat?: string;
    cholesterol?: string;
    fiber?: string;
    iron?: string;
    sodium?: string;
    sugar?: string;
};

export class UserRecipeNutrientsDTO {
    @ArrayNotEmpty()
    recipes: RecipeResponseNutrients[];
}
