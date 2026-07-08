export class RecipeStepsAndEquipmentDTO {
    data: RecipeStepsAndEquipment;
}

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

export type ExtendedStep = Step & {
    equipment: { name: string }[];
};
