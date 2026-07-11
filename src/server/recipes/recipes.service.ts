import { HttpException, Inject, Injectable } from '@nestjs/common';
import { RecipeNutrientsDTO } from './dto/recipe-nutrients.dto';
import { RecipeInfoResponse } from './types/recipe.type';
import { formatShoppingList } from './utils/shopping-list-util';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRecipes } from './entities/user-recipes.entity';
import { Repository } from 'typeorm';
import type { BasicRecipe, SavedRecipe } from './types/recipe.type';
import { RecipeIngredientsDTO } from './dto/recipe-ingredients.dto';
import { ShoppingListDTO } from './dto/shopping-list.dto';
import { createSpoonURL } from './utils/api-key-util';
import { UserRecipeNutrientsDTO } from './dto/user-nutrient-recipes.dto';
import { RecipeAutocompleteDTO, RecipeAutocompleteItem } from './dto/recipe-autocomplete.dto';
import { RecipeSearchDTO } from './dto/recipe-search.dto';
import { UserID } from '../common/types/userid.types';
import {
    ExtendedStep,
    RecipeStepsAndEquipmentDTO,
    StepData,
} from './dto/recipe-steps-equipment.dto';
import { RecipeInstructionsDTO } from './dto/recipe-instructions.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class RecipesService {
    constructor(
        @InjectRepository(UserRecipes) private userRecipesRepo: Repository<UserRecipes>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {}

    async getRecipeAutocomplete(q: string): Promise<RecipeAutocompleteDTO> {
        const url = createSpoonURL('https://api.spoonacular.com/recipes/autocomplete');
        url.searchParams.set('number', '5');
        url.searchParams.set('query', q);

        const response = await fetch(url, {
            headers: {
                Accept: 'application/json',
            },
        });
        if (response.status === 402) throw new HttpException('API Limit reached', 402);

        const recipes = (await response.json()).map((recipe: RecipeAutocompleteItem) => {
            return {
                title: recipe.title,
            };
        });

        const autocompleteRecipes: RecipeAutocompleteDTO = {
            recipes,
        };

        return autocompleteRecipes;
    }

    async getRecipeSearch(q: string) {
        const url = createSpoonURL('https://api.spoonacular.com/recipes/complexSearch');
        url.searchParams.set('query', q);
        url.searchParams.set('number', '50');

        const response = await fetch(url, {
            headers: {
                Accept: 'application/json',
            },
        });

        const responseJson = await response.json();
        if (response.status === 402) throw new HttpException('API Limit reached', 402);

        const recipes = responseJson.results.map((recipe: BasicRecipe) => {
            return {
                id: recipe.id,
                title: recipe.title,
                image: recipe.image,
            };
        });

        const recipesSearch: RecipeSearchDTO = {
            recipes,
            results: responseJson.number,
            totalResults: responseJson.totalResults,
        };

        return recipesSearch;
    }
    async getByNutrients(recipeNutrientsDTO: RecipeNutrientsDTO): Promise<UserRecipeNutrientsDTO> {
        const url = createSpoonURL('https://api.spoonacular.com/recipes/findByNutrients');

        for (const nutrient in recipeNutrientsDTO) {
            if (recipeNutrientsDTO[nutrient] !== undefined)
                url.searchParams.set(nutrient, recipeNutrientsDTO[nutrient]);
        }

        const response = await fetch(url.toString(), {
            headers: {
                Accept: 'application/json',
            },
        });
        if (response.status === 402) throw new HttpException('API Limit reached', 402);

        const userNutrientRecipes: UserRecipeNutrientsDTO = {
            recipes: await response.json(),
        };

        return userNutrientRecipes;
    }

    async getByIngredients(recipeIngredientsDTO: RecipeIngredientsDTO) {
        const url = createSpoonURL('https://api.spoonacular.com/recipes/findByIngredients');
        url.searchParams.set('ingredients', recipeIngredientsDTO.ingredients.toString());

        const response = await fetch(url.toString(), {
            headers: {
                Accept: 'application/json',
            },
        });
        if (response.status === 402) throw new HttpException('API Limit reached', 402);

        return await response.json();
    }

    async saveRecipe(recipeID: number, id: UserID) {
        const recipeInfo: SavedRecipe = await this.getRecipeInfo(recipeID);

        return await this.userRecipesRepo.upsert(
            {
                user: { id },
                recipe: recipeInfo,
                recipeId: recipeInfo.id,
            },
            {
                conflictPaths: ['recipeId', 'user'],
            }
        );
    }

    async getRecipeInstructions(recipeId: number) {
        const [recipeInfo, stepsAndEquipment] = await Promise.all([
            this.getRecipeInfo(recipeId),
            this.getRecipeStepsAndEquipment(recipeId),
        ]);

        const recipeInstructionsDTO: RecipeInstructionsDTO = {
            recipeInfo,
            stepsAndEquipment: stepsAndEquipment.data,
        };

        return recipeInstructionsDTO;
    }

    async getRecipeStepsAndEquipment(recipeId: number): Promise<RecipeStepsAndEquipmentDTO> {
        const cacheKey = `recipe-steps-equip:${recipeId}`;
        const recipeCache: RecipeStepsAndEquipmentDTO | undefined =
            await this.cacheManager.get(cacheKey);
        if (recipeCache) return recipeCache;

        const url = createSpoonURL(
            `https://api.spoonacular.com/recipes/${recipeId}/analyzedInstructions`
        );

        const res = await fetch(url, {
            headers: {
                Accept: 'application/json',
            },
        });
        const responseJson: any = await res.json();

        const recipeStepsAndEquipmentDTO: RecipeStepsAndEquipmentDTO = {
            data: {
                stepData: [],
                equipment: [],
            },
        };

        for (let i = 0; i < responseJson.length; i++) {
            const currStep: ExtendedStep[] = responseJson[i].steps as ExtendedStep[];
            const stepData: StepData = {
                name: responseJson[i].name,
                steps: [],
            };
            for (let j = 0; j < currStep.length; j++) {
                stepData.steps.push({ number: currStep[j].number, step: currStep[j].step });
                recipeStepsAndEquipmentDTO.data.equipment.push(...currStep[j].equipment);
            }
            recipeStepsAndEquipmentDTO.data.stepData.push(stepData);
        }

        await this.cacheManager.set(cacheKey, recipeStepsAndEquipmentDTO);

        return recipeStepsAndEquipmentDTO;
    }

    async getRecipeInfo(recipeID: number): Promise<SavedRecipe> {
        const cacheKey = `recipe-info:${recipeID}`;
        const recipeCache: SavedRecipe | undefined = await this.cacheManager.get(cacheKey);
        if (recipeCache) return recipeCache;

        const url = createSpoonURL(`https://api.spoonacular.com/recipes/${recipeID}/information`);
        url.searchParams.set('includeNutrition', 'true');

        const response = await fetch(url, {
            headers: {
                Accept: 'application/json',
            },
        });
        if (response.status === 402) throw new HttpException('API Limit reached', 402);

        const recipeResponseObj = (await response.json()) as RecipeInfoResponse;
        const relevantNutrientNames: string[] = [
            'Calories',
            'Fat',
            'Carbohydrates',
            'Cholesterol',
            'Sodium',
            'Protein',
            'Vitamin C',
            'Vitamin K',
            'Fiber',
            'Vitamin B6',
            'Vitamin B5',
            'Vitamin B3',
            'Vitamin B1',
            'Vitamin E',
            'Vitamin B2',
            'Vitamin A',
            'Vitamin B12',
        ];

        const recipeInfo: SavedRecipe = {
            id: recipeResponseObj.id,
            title: recipeResponseObj.title,
            image: recipeResponseObj.image,
            servings: recipeResponseObj.servings,
            readyInMinutes: recipeResponseObj.readyInMinutes,
            sourceUrl: recipeResponseObj.sourceUrl,
            creditsText: recipeResponseObj.creditsText,
            dairyFree: recipeResponseObj.dairyFree,
            glutenFree: recipeResponseObj.glutenFree,
            vegan: recipeResponseObj.vegan,
            vegetarian: recipeResponseObj.vegetarian,
            extendedIngredients: recipeResponseObj.extendedIngredients.map((ingredient) => {
                return {
                    aisle: ingredient.aisle,
                    amount: ingredient.amount,
                    name: ingredient.name,
                    original: ingredient.original,
                    originalName: ingredient.originalName,
                    unit: ingredient.unit,
                    measures: {
                        metric: {
                            amount: ingredient.measures!.metric.amount,
                            unitLong: ingredient.measures!.metric.unitLong,
                            unitShort: ingredient.measures!.metric.unitShort,
                        },
                    },
                };
            }),
            nutrition: {
                nutrients: recipeResponseObj.nutrition.nutrients.filter((nutrient) =>
                    relevantNutrientNames.includes(nutrient.name)
                ),

                caloricBreakdown: {
                    percentCarbs: recipeResponseObj.nutrition.caloricBreakdown.percentCarbs,
                    percentProtein: recipeResponseObj.nutrition.caloricBreakdown.percentProtein,
                    percentFat: recipeResponseObj.nutrition.caloricBreakdown.percentFat,
                },
            },
        };

        await this.cacheManager.set(cacheKey, recipeInfo);

        return recipeInfo;
    }

    async getSavedRecipes(id: UserID) {
        const userRecipes = await this.userRecipesRepo.find({
            where: {
                user: { id },
            },
        });

        if (userRecipes.length === 0) return [];

        return userRecipes.map((recipe) => {
            return {
                ...recipe.recipe,
            };
        });
    }

    async generateShoppingList(recipeIds: number[]) {
        const url = createSpoonURL('https://api.spoonacular.com/recipes/informationBulk');
        url.searchParams.set('ids', recipeIds.toString());
        const response = await fetch(url.toString(), {
            headers: {
                Accept: 'application/json',
            },
        });
        if (response.status === 402) throw new HttpException('API Limit reached', 402);

        const recipesInfoArr = (await response.json()) as RecipeInfoResponse[];
        let shoppingList: ShoppingListDTO = { list: [] };

        recipesInfoArr.forEach((recipe) => {
            shoppingList = formatShoppingList(recipe.extendedIngredients, shoppingList);
        });

        return shoppingList.list;
    }
}
