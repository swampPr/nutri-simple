export type RecipeInstructionsResponse = {
    recipeInfo: SavedRecipe;
    stepsAndEquipment: RecipeStepsAndEquipment;
};

export type BasicRecipe = {
    id: number;
    title: string;
    image: string;
};

export type Nutrient = {
    name: string;
    amount: number;
    unit: string;
    percentOfDailyNeeds: number;
};

export type ExtendedIngredient = {
    aisle: string;
    amount: number;
    measures: {
        metric: {
            amount: number;
            unitLong: string;
            unitShort: string;
        };
    };
    name: string;
    original: string;
    originalName: string;
    unit: string;
};

export type SavedRecipe = BasicRecipe & {
    servings: number;
    readyInMinutes: number;
    sourceUrl: string;
    creditsText: string;
    dairyFree: boolean;
    glutenFree: boolean;
    vegan: boolean;
    vegetarian: boolean;
    extendedIngredients: ExtendedIngredient[];
    nutrition: {
        nutrients: Nutrient[];
        caloricBreakdown: {
            percentProtein: number;
            percentFat: number;
            percentCarbs: number;
        };
    };
};

export type RecipeStepsAndEquipment = {
    stepData: StepData[];
    equipment: { name: string }[];
};

export type StepData = {
    name: string;
    steps: Step[];
};

export type Step = {
    step: string;
    number: number;
};
