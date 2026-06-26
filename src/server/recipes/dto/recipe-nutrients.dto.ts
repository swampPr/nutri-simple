import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

//NOTE: this is so ugly
export class RecipeNutrientsDTO {
    @IsOptional()
    @IsNumber()
    minCarbs?: number;

    @IsOptional()
    @IsNumber()
    maxCarbs?: number;

    @IsOptional()
    @IsNumber()
    minProtein?: number;

    @IsOptional()
    @IsNumber()
    maxProtein?: number;

    @IsOptional()
    @IsNumber()
    minCalories?: number;

    @IsOptional()
    @IsNumber()
    maxCalories?: number;

    @IsOptional()
    @IsNumber()
    minFat?: number;

    @IsOptional()
    @IsNumber()
    maxFat?: number;

    @IsOptional()
    @IsNumber()
    minCholesterol?: number;

    @IsOptional()
    @IsNumber()
    maxCholesterol?: number;

    @IsOptional()
    @IsNumber()
    minFiber?: number;

    @IsOptional()
    @IsNumber()
    maxFiber?: number;

    @IsOptional()
    @IsNumber()
    minIron?: number;

    @IsOptional()
    @IsNumber()
    maxIron?: number;

    @IsOptional()
    @IsNumber()
    minSodium?: number;

    @IsOptional()
    @IsNumber()
    maxSodium?: number;

    @IsOptional()
    @IsNumber()
    minSugar?: number;

    @IsOptional()
    @IsNumber()
    maxSugar?: number;

    @IsOptional()
    @IsBoolean()
    random?: boolean;
}
