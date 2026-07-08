import { SavedRecipe } from '../types/recipe.type';
import { RecipeStepsAndEquipment } from './recipe-steps-equipment.dto';

export class RecipeInstructionsDTO {
    recipeInfo: SavedRecipe;
    stepsAndEquipment: RecipeStepsAndEquipment;
}
