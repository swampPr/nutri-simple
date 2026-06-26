import { ArrayMaxSize, ArrayNotEmpty, IsArray } from 'class-validator';
import { BasicRecipe } from '../types/recipe.type';

export type RecipeAutocompleteItem = Pick<BasicRecipe, 'title'>;

export class RecipeAutocompleteDTO {
    @ArrayNotEmpty()
    @ArrayMaxSize(5)
    @IsArray()
    recipes: RecipeAutocompleteItem[];
}
