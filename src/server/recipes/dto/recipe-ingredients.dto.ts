import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsIn } from 'class-validator';
import { INGREDIENTS } from '../types/ingredients.type';

export class RecipeIngredientsDTO {
    @IsArray()
    @ArrayNotEmpty()
    @ArrayMaxSize(441)
    @IsIn(INGREDIENTS, { each: true })
    ingredients: string[];
}
