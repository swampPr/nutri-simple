import { ArrayMaxSize, ArrayNotEmpty, IsInt, IsPositive } from 'class-validator';
import { BasicRecipe } from '../types/recipe.type';

export class RecipeSearchDTO {
    @ArrayNotEmpty()
    @ArrayMaxSize(10)
    recipes: BasicRecipe[];

    @IsInt()
    @IsPositive()
    results: number;

    @IsInt()
    @IsPositive()
    totalResults: number;
}
