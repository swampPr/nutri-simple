import {
    Body,
    Controller,
    Get,
    Param,
    ParseArrayPipe,
    ParseIntPipe,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecipeNutrientsDTO } from './dto/recipe-nutrients.dto';
import type { Request } from 'express';
import type { UserRecipes } from './entities/user-recipes.entity';
import { RecipeIngredientsDTO } from './dto/recipe-ingredients.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { UserID } from '../common/types/userid.types';

@Controller('recipes')
export class RecipesController {
    constructor(private recipesService: RecipesService) {}

    @Post('/get-by-nutrients')
    @UseGuards(AccessTokenGuard)
    async getByNutrients(@Body() recipeNutrientsDTO: RecipeNutrientsDTO) {
        return await this.recipesService.getByNutrients(recipeNutrientsDTO);
    }

    @Post('/get-by-ingredients')
    @UseGuards(AccessTokenGuard)
    async getByIngredients(@Body() recipeIngredientsDTO: RecipeIngredientsDTO) {
        return await this.recipesService.getByIngredients(recipeIngredientsDTO);
    }

    @Post('/save/:id')
    @UseGuards(AccessTokenGuard)
    async saveRecipe(
        @Param('id', ParseIntPipe) recipeID: number,
        @Req() req: Request
    ): Promise<UserRecipes> {
        const { userId } = req.user! as { userId: UserID };
        return await this.recipesService.saveRecipe(recipeID, userId);
    }

    @Post('/shopping-list/generate')
    @UseGuards(AccessTokenGuard)
    async generateShoppingList(@Body('recipeIds', ParseArrayPipe) recipeIds: number[]) {
        return await this.recipesService.generateShoppingList(recipeIds);
    }

    @Get('/autocomplete')
    @UseGuards(AccessTokenGuard)
    async getRecipeAutocomplete(@Query('q') q: string) {
        return await this.recipesService.getRecipeAutocomplete(q);
    }

    @Get('/search')
    @UseGuards(AccessTokenGuard)
    async getRecipeSearch(@Query('q') q: string) {
        return await this.recipesService.getRecipeSearch(q);
    }
}
